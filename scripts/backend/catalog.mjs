import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { loadServerEnv } from '../dev/server-env.mjs';
import { commitWrites, documentName, encodeFields } from '../../worker/firestore.js';
import { requiredFirebaseEnv } from '../../worker/app/env.js';

const root = resolve(import.meta.dirname, '../..');
export async function loadProducts() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(await readFile(resolve(root, 'src/data/products.js'), 'utf8'), context);
  return JSON.parse(JSON.stringify(context.window.LOCAL_PRODUCTS));
}
export function validateProducts(products) {
  const ids = new Set();
  for (const product of products) {
    if (!product.id || !product.name || !Number.isSafeInteger(product.price) || product.price < 0) throw new Error('Catalog không hợp lệ.');
    if (ids.has(product.id)) throw new Error(`ID bị trùng: ${product.id}`);
    ids.add(product.id);
  }
  if (!ids.size) throw new Error('Catalog trống.');
  return { count: products.length, ids };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const products = await loadProducts();
  const { count } = validateProducts(products);
  const env = loadServerEnv(root);
  console.log(`Validated ${count} products. Target: ${env.FIREBASE_PROJECT_ID}.`);
  if (process.argv.includes('--apply')) {
    if (!process.argv.includes(`--project=${env.FIREBASE_PROJECT_ID}`)) throw new Error('Cần chỉ định --project trùng project cấu hình.');
    requiredFirebaseEnv(env);
    await commitWrites(env, products.map(product => ({
      update: { name: documentName(env, `products/${product.id}`), fields: encodeFields(product) },
      updateMask: { fieldPaths: Object.keys(product) }
    })));
    console.log(`Imported ${count} products; retained server fields not present in catalog source.`);
  } else console.log('Validation only. No Firebase writes. Use --apply --project=<project-id> after reviewing the target.');
}
