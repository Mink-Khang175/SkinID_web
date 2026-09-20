const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.join(__dirname, '..');
const worker = fs.readFileSync(path.join(root, 'worker/index.js'), 'utf8');
const firestore = fs.readFileSync(path.join(root, 'worker/firestore.js'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/cloudflare-deploy.yml'), 'utf8');

assert.match(worker, /jwtVerify\(token, jwks/);
assert.match(worker, /getDocument\(env, `products\/\$\{id\}`\)/);
assert.match(worker, /source: 'cloudflare-worker'/);
assert.match(worker, /currentDocument: precondition/);
assert.match(worker, /users\/\$\{user\.sub\}\/addresses\/default/);
assert.match(worker, /users\/\$\{user\.sub\}\/activities\/\$\{orderId\}/);
assert.match(worker, /count >= 10/);
assert.match(firestore, /https:\/\/oauth2\.googleapis\.com\/token/);
assert.match(firestore, /scope: 'https:\/\/www\.googleapis\.com\/auth\/datastore/);
assert.doesNotMatch(worker + firestore, /AIza[\w-]{30,}/);
assert.match(workflow, /CLOUDFLARE_API_TOKEN/);
assert.match(workflow, /CLOUDFLARE_ACCOUNT_ID/);

console.log('PASS: Worker verifies Firebase tokens, recalculates orders and keeps credentials server-side.');
