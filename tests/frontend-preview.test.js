const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const memory = () => { const map = new Map(); return { getItem: k => map.get(k), setItem: (k,v) => map.set(k,v) }; };
const load = () => import('../src/preview/localBackend.mjs');

test('preview auth uses synthetic users and keeps admin claims inside the local adapter', async () => {
  const { createLocalBackend } = await load();
  const store = createLocalBackend({ storage: memory() });
  assert.equal(store.auth.currentUser,null);
  store.setRole('admin');
  assert.equal(store.auth.currentUser.uid,'preview-admin');
  assert.equal((await store.sdk.auth.getIdTokenResult()).claims.role,'super_admin');
  assert.match(store.auth.currentUser.email,/@example\.test$/);
  await store.sdk.auth.signOut();
  assert.equal(store.auth.currentUser,null);
});

test('preview collection reads, queries and writes are local, persist and reset to seed', async () => {
  const { createLocalBackend } = await load();
  const storage = memory(), seed = { 'products/p1': { price:100 }, 'products/p2': { price:200 }, 'users/u/skinReports/a': { score:70 } };
  const backend=createLocalBackend({ seed,storage }), sdk=backend.sdk.firestore;
  assert.equal((await sdk.getDocs(sdk.collection(backend.db,'products'))).size,2);
  const query=await sdk.getDocs(sdk.query(sdk.collection('products'),sdk.where('price','>=',150)));
  assert.deepEqual(query.docs.map(d=>d.id),['p2']);
  await sdk.updateDoc(sdk.doc('products','p1'),{price:150});
  assert.equal((await sdk.getDoc(sdk.doc('products','p1'))).data().price,150);
  assert.equal((await sdk.getDocs(sdk.collection('users','u','skinReports'))).size,1);
  const restored=createLocalBackend({seed,storage});
  assert.equal((await restored.sdk.firestore.getDoc(sdk.doc('products','p1'))).data().price,150);
  backend.reset();
  assert.equal((await sdk.getDoc(sdk.doc('products','p1'))).data().price,100);
  assert.equal(seed['products/p1'].price,100);
});

test('preview integration intercepts Firebase, HTTP, tracking and POS before their production paths', () => {
  const read = file => fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  assert.match(read('src/infrastructure/firebase/client.js'),/isFrontendPreview \? previewBackend\.auth : getAuth/);
  assert.match(read('src/infrastructure/http/apiClient.js'),/if \(isFrontendPreview\) return previewApiRequest/);
  assert.doesNotMatch(read('src/features/cart/services/s3SyncService.js'),/Vision\/|Password|AccessToken/);
  assert.match(read('src/features/system/components/TrackingScripts.jsx'),/if \(isFrontendPreview/);
  assert.match(read('src/preview/runtime.js'),/VITE_FRONTEND_PREVIEW === 'true'/);
});
