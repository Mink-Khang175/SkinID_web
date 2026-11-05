// No service account or production project is accepted by this test runner.
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const host = process.env.FIRESTORE_EMULATOR_HOST;
if (!host || !/^(127\.0\.0\.1|localhost):\d+$/.test(host)) throw Error('A local FIRESTORE_EMULATOR_HOST is required.');
const project = 'demo-skinid';
const base = `http://${host}/v1/projects/${project}/databases/(default)/documents`;
const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
const compile = await fetch(`http://${host}/emulator/v1/projects/${project}:securityRules`, {
  method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ rules: { files: [{ name: 'firestore.rules', content: rules }] } })
});
assert.equal(compile.status, 200, await compile.text());
const enc = value => {
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return { integerValue: String(value) };
  return { stringValue: value };
};
const fields = value => Object.fromEntries(Object.entries(value).map(([k, v]) => [k, enc(v)]));
const seeds = {
  'users/customer': { name: 'Customer', role: 'customer' },
  'users/other': { name: 'Other' },
  'orders/order1': { userId: 'customer', total: 247000, status: 'pending' },
  'posts/published': { title: 'Public', status: 'published' },
  'posts/draft': { title: 'Draft', status: 'draft' },
  'posts/scheduled': { title: 'Scheduled', status: 'scheduled' },
  'settings/system_config': { hotline: '0900000000' },
  'settings/probe': { test: 1 },
  'settings/secrets': { secret: 'dummy' },
  'users/customer/private/quota': { count: 1 },
  'users/customer/skinReports/report1': { healthScore: 80 }
};
const seeded = await fetch(base + ':commit', { method: 'POST', headers: { authorization: 'Bearer owner', 'content-type': 'application/json' }, body: JSON.stringify({ writes: Object.entries(seeds).map(([path, value]) => ({ update: { name: `projects/${project}/databases/(default)/documents/${path}`, fields: fields(value) } })) }) });
assert.equal(seeded.status, 200, await seeded.text());
function jwt(uid, claims = {}) {
  const b = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  return b({ alg: 'none', typ: 'JWT' }) + '.' + b({ iss: `https://securetoken.google.com/${project}`, aud: project, sub: uid, user_id: uid, iat: now, exp: now + 3600, firebase: { sign_in_provider: 'custom', identities: {} }, ...claims }) + '.';
}
const customer = jwt('customer', { email: 'customer@example.test', email_verified: true });
const admin = jwt('admin', { role: 'admin', admin: true });
const root = jwt('root', { role: 'super_admin', admin: true });
const emailRoot = jwt('emailroot', { email: 'danh.huynh@fieldman.vn', email_verified: true });
const fakeRoot = jwt('unverified', { email: 'danh.huynh@fieldman.vn', email_verified: false });
let count = 0;
async function check(label, allowed, path, token, method = 'GET', value) {
  const response = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: value ? JSON.stringify(value) : undefined });
  assert.equal(response.ok, allowed, `${label}: HTTP ${response.status} ${await response.text()}`);
  count++;
}
await check('public configuration', true, '/settings/system_config');
await check('unlisted configuration', false, '/settings/probe');
await check('secrets', false, '/settings/secrets');
await check('customer own profile', true, '/users/customer', customer);
await check('other customer profile', false, '/users/other', customer);
await check('normal profile edit', true, '/users/customer?updateMask.fieldPaths=name', customer, 'PATCH', { fields: fields({ name: 'Updated' }) });
for (const key of ['role', 'isAdmin', 'isSuperAdmin', 'admin', 'customClaims', 'permissions']) {
  await check('self escalation ' + key, false, `/users/customer?updateMask.fieldPaths=${key}`, customer, 'PATCH', { fields: fields({ [key]: key === 'role' ? 'super_admin' : true }) });
}
await check('escalation at signup', false, '/users/new?documentId=new', jwt('new'), 'PATCH', { fields: fields({ name: 'New', isAdmin: true }) });
await check('safe signup', true, '/users/new', jwt('new', { email: 'test@example.test' }), 'PATCH', { fields: fields({ name: 'New', email: 'test@example.test' }) });
await check('profile email impersonation blocked', false, '/users/customer?updateMask.fieldPaths=email', customer, 'PATCH', { fields: fields({ email: 'danh.huynh@fieldman.vn' }) });
await check('admin cannot promote root', false, '/users/other?updateMask.fieldPaths=role', admin, 'PATCH', { fields: fields({ role: 'super_admin' }) });
await check('root can assign role', true, '/users/other?updateMask.fieldPaths=role', root, 'PATCH', { fields: fields({ role: 'customer' }) });
await check('unverified root cannot assign role', false, '/users/other?updateMask.fieldPaths=role', fakeRoot, 'PATCH', { fields: fields({ role: 'super_admin' }) });
await check('verified root can assign role', true, '/users/other?updateMask.fieldPaths=role', emailRoot, 'PATCH', { fields: fields({ role: 'customer' }) });
await check('own order readable', true, '/orders/order1', customer);
await check('other order blocked', false, '/orders/order1', jwt('stranger'));
await check('client order creation blocked', false, '/orders/fake', customer, 'PATCH', { fields: fields({ userId: 'customer', total: 1 }) });
await check('client price tampering blocked', false, '/orders/order1?updateMask.fieldPaths=total', customer, 'PATCH', { fields: fields({ total: 1 }) });
await check('admin financial snapshot immutable', false, '/orders/order1?updateMask.fieldPaths=total', admin, 'PATCH', { fields: fields({ total: 1 }) });
await check('admin operational update', true, '/orders/order1?updateMask.fieldPaths=note', admin, 'PATCH', { fields: fields({ note: 'Call before delivery' }) });
await check('private user docs denied', false, '/users/customer/private/quota', customer);
await check('own skin report', true, '/users/customer/skinReports/report1', customer);
await check('sales cannot read health data', false, '/users/customer/skinReports/report1', jwt('sales', { role: 'sales' }));
await check('dermatologist can read health data', true, '/users/customer/skinReports/report1', jwt('doctor', { role: 'dermatologist' }));
await check('dermatologist cannot forge report', false, '/users/customer/skinReports/forged', jwt('doctor', { role: 'dermatologist' }), 'PATCH', { fields: fields({ healthScore: 100 }) });
await check('published post', true, '/posts/published');
await check('draft post', false, '/posts/draft');
await check('scheduled post', false, '/posts/scheduled');
await check('unfiltered public posts query denied', false, ':runQuery', null, 'POST', { structuredQuery: { from: [{ collectionId: 'posts' }] } });
await check('filtered public posts query works', true, ':runQuery', null, 'POST', { structuredQuery: { from: [{ collectionId: 'posts' }], where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: enc('published') } } } });
await check('admin draft access', true, '/posts/draft', admin);
await check('home version admin write', true, '/pages/home/versions/v1', admin, 'PATCH', { fields: fields({ version: 1 }) });
await check('home version customer blocked', false, '/pages/home/versions/v1', customer);
console.log(`PASS: ${count} Firestore emulator security checks.`);
