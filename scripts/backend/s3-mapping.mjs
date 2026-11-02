import { readFile } from 'node:fs/promises';
import { loadProducts } from './catalog.mjs';
import { loadServerEnv } from '../dev/server-env.mjs';
import { requiredFirebaseEnv } from '../../worker/app/env.js';
import { commitWrites, documentName, encodeFields } from '../../worker/firestore.js';

const file = process.argv.find(value => value.startsWith('--file='))?.slice(7);
if (!file) throw new Error('Cần --file=<đường-dẫn-json>.');
const rows = JSON.parse(await readFile(file, 'utf8'));
const known = new Set((await loadProducts()).map(product => product.id));
const ids = new Set();
if (!Array.isArray(rows) || !rows.length) throw new Error('Bảng ánh xạ trống.');
for (const row of rows) {
  if (!known.has(row.productId) || ids.has(row.productId) || !Number.isSafeInteger(row.s3ProductId) || row.s3ProductId <= 0) throw new Error('Cần ID sản phẩm catalog duy nhất và s3ProductId nguyên dương thực tế.');
  ids.add(row.productId);
}
const env = loadServerEnv();
console.log(`Validated ${rows.length} product mappings. Target: ${env.FIREBASE_PROJECT_ID}.`);
if (process.argv.includes('--apply')) {
  if (!process.argv.includes(`--project=${env.FIREBASE_PROJECT_ID}`)) throw new Error('Cần chỉ định --project trùng cấu hình.');
  requiredFirebaseEnv(env);
  await commitWrites(env, rows.map(row => ({
    update: { name: documentName(env, `products/${row.productId}`), fields: encodeFields({ s3ProductId: row.s3ProductId }) },
    updateMask: { fieldPaths: ['s3ProductId'] }, currentDocument: { exists: true }
  })));
  console.log('S3 mappings saved. Other product fields retained.');
} else console.log('Validation only. No Firebase writes.');
