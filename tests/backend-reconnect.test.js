const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

test('API health is public but order and integration APIs require a verified session', async () => {
  const { default: worker } = await import('../worker/index.js');
  assert.equal((await worker.fetch(new Request('https://skinid.vn/api/health'), {})).status, 200);
  for (const route of ['/api/orders', '/api/admin/integrations']) {
    const result = await worker.fetch(new Request(`https://skinid.vn${route}`), {});
    assert.equal(result.status, 401);
    assert.equal((await result.json()).code, 'unauthenticated');
  }
});

test('CORS rejects arbitrary pages.dev origins and only accepts explicit external origins', async () => {
  const { corsHeaders } = await import('../worker/app/http.js');
  const request = origin => new Request('https://skinid.vn/api/orders', { headers: { origin } });
  assert.notEqual(corsHeaders(request('https://attacker.pages.dev'), {})['access-control-allow-origin'], 'https://attacker.pages.dev');
  assert.equal(corsHeaders(request('https://preview.example.test'), { ALLOWED_ORIGINS: 'https://preview.example.test' })['access-control-allow-origin'], 'https://preview.example.test');
});

test('POS mapping rejects placeholder row IDs and does not treat a pending transfer as received money', async () => {
  const { mapOrderToS3Payload } = await import('../worker/services/s3Service.js');
  const order = { id: 'order-1', paymentMethod: 'bank_transfer', paymentStatus: 'pending_transfer', total: 500000, items: [{ productId: 'p1', price: 500000, quantity: 1 }] };
  assert.throws(() => mapOrderToS3Payload(order, {}), /ánh xạ mã S3/);
  order.items[0].s3ProductId = 123;
  assert.throws(() => mapOrderToS3Payload(order, {}), /mã khách hàng S3/);
  assert.equal(mapOrderToS3Payload(order, {}, 922848).PreOrder.CustomerReceived, 0);
  order.paymentStatus = 'paid';
  assert.equal(mapOrderToS3Payload(order, {}, 922848).PreOrder.CustomerReceived, 500000);
});

function memoryOutbox() {
  let record;
  return {
    get: async () => record && { ...record, _updateTime: 'version-1' },
    put: async value => { if (record && record.state !== 'retryable') throw new Error('conflict'); record = value; },
    finish: async value => { record = value; }
  };
}
const posEnv = { S3_USERNAME: 'test', S3_PASSWORD: 'test', S3_SYNC_ENABLED: 'true' };

test('durable POS dispatch prevents concurrent and completed order duplication', async () => {
  const { dispatchS3 } = await import('../worker/services/s3Dispatch.js');
  const store = memoryOutbox();
  let sends = 0;
  const send = async () => { sends++; return { success: true, s3SyncStatus: 'synced', s3OrderId: 'POS-1' }; };
  const args = { orderId: 'order-1', order: {}, env: posEnv, store, send };
  await Promise.all([dispatchS3(args), dispatchS3(args)]);
  assert.equal(sends, 1);
  assert.equal((await dispatchS3(args)).alreadySynced, true);
  assert.equal(sends, 1);
});

test('ambiguous POS outcomes remain blocked until reconciliation', async () => {
  const { dispatchS3 } = await import('../worker/services/s3Dispatch.js');
  let sends = 0;
  const args = { orderId: 'order-1', order: {}, env: posEnv, store: memoryOutbox(), send: async () => { sends++; return { success: false, needsReview: true, s3SyncStatus: 'needs_review' }; } };
  await dispatchS3(args);
  assert.equal((await dispatchS3(args)).s3SyncStatus, 'needs_review');
  assert.equal(sends, 1);
});

test('POS timeout covers login, not only the final order POST', async () => {
  const { syncOrderToS3, resetS3TokenCache } = await import('../worker/services/s3Service.js');
  resetS3TokenCache();
  const result = await syncOrderToS3({ orderId: 'order-1', order: { items: [{ s3ProductId: 123, price: 1, quantity: 1 }] }, env: posEnv, timeoutMs: 20,
    fetchFn: (_, { signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true })) });
  assert.equal(result.s3SyncStatus, 'pending');
  assert.equal(result.needsReview, false);
});

test('connected builds opt out of fake preview and browser checkout never creates a POS order', () => {
  const read = file => fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(read('src/preview/runtime.js'), /VITE_FRONTEND_PREVIEW === 'true'/);
  assert.doesNotMatch(read('src/features/cart/components/CheckoutModal.jsx'), /syncOrderToS3\(/);
  assert.doesNotMatch(read('src/features/cart/services/s3SyncService.js'), /Vision\/|AccessToken|Password/);
  assert.match(read('src/pages/AdminPage.jsx'), /if \(!isFrontendPreview\) return remoteList/);
  assert.doesNotMatch(read('src/pages/AdminPage.jsx'), /setTimeout\(r, (480|380|290)\)/);
});
