const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const code = fs.readFileSync(path.join(__dirname, '../worker/index.js'), 'utf8')
  .replace(/^import[\s\S]*?from '[^']+';\r?\n/gm, '')
  .replace('export default {', 'const worker = {').replace(/^export /gm, '');

function setup(promotions = {}) {
  const catalog = [{ id: 'product-1', name: 'Sản phẩm', price: 100000 }];
  const context = {
    SERVER_CATALOG: catalog, crypto: webcrypto, TextEncoder, console,
    ApiError: class extends Error { constructor(status, code, message) { super(message); this.status = status; this.code = code; } },
    isValidFirebasePrivateKey: () => true,
    getDocument: async (_, file) => file === 'products/product-1' ? catalog[0] : promotions[file] || null,
    commitWrites: async () => {}, documentName: (_, file) => file, encodeFields: value => value,
    json: (_, __, body, status = 200) => ({ body, status })
  };
  vm.createContext(context); vm.runInContext(code, context);
  return couponCode => context.createOrder({ headers: new Headers(), json: async () => ({
    items: [{ productId: 'product-1', quantity: 1 }], couponCode,
    customer: { name: 'Khách hàng test', phone: '0900000000', shippingAddress: { line1: 'Địa chỉ test', provinceCode: 79, provinceName: 'Hồ Chí Minh', wardCode: 1, wardName: 'Phường test' } }
  }) }, { FIREBASE_PROJECT_ID: 'test', FIREBASE_CLIENT_EMAIL: 'test', FIREBASE_PRIVATE_KEY: 'test' }, { sub: 'test' });
}

test('shipping voucher removes delivery cost without subtracting another 30K from merchandise', async () => {
  const order = await setup({ 'promotions/FREESHIP': { type: 'shipping', active: true, discountValue: 30000 } })('FREESHIP');
  assert.equal(order.body.shippingFee, 0);
  assert.equal(order.body.discount, 0);
  assert.equal(order.body.total, 100000);
});
test('connected checkout does not reactivate a deleted promotion using static demo coupons', async () => {
  await assert.rejects(setup()('WELCOME50'), error => error.code === 'invalid_coupon');
});
test('standard shipping is free for every storefront order', async () => {
  const order = await setup()('');
  assert.equal(order.body.shippingFee, 0);
  assert.equal(order.body.total, 100000);
});
