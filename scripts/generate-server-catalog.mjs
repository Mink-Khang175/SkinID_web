import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const source = await readFile(resolve(root, 'src/data/products.js'), 'utf8');
const context = { window: {} };
context.window.window = context.window;
context.window.SKINID_ASSET_URL = value => value;
vm.createContext(context);
vm.runInContext(source, context, { filename: 'src/data/products.js' });

const products = (context.window.LOCAL_PRODUCTS || []).map(product => ({
  id: String(product.id || ''),
  name: String(product.name || ''),
  image: String(product.image || ''),
  volume: String(product.volume || ''),
  price: Number(product.price)
}));

if (!products.length || products.some(product => !product.id || !product.name || !Number.isFinite(product.price))) {
  throw new Error('Không thể tạo catalog máy chủ: dữ liệu sản phẩm không hợp lệ.');
}

const output = resolve(root, 'worker/catalog.generated.js');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `// Generated from src/data/products.js. Do not edit manually.\nexport const SERVER_CATALOG = ${JSON.stringify(products, null, 2)};\n`);
console.log(`Generated server catalog with ${products.length} products.`);
