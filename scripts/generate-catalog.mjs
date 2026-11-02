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

const catalogFixture = context.window.LOCAL_PRODUCTS || [];
const products = catalogFixture.map(product => ({
  id: String(product.id || ''),
  brand: String(product.brand || ''),
  brandSlug: String(product.brandSlug || ''),
  name: String(product.name || ''),
  image: String(product.image || ''),
  volume: String(product.volume || ''),
  productCode: String(product.productCode || ''),
  s3ProductId: Number(product.s3ProductId || 0),
  price: Number(product.price)
}));

if (!products.length || products.some(product => !product.id || !product.name || !Number.isFinite(product.price))) {
  throw new Error('Không thể tạo catalog frontend: dữ liệu sản phẩm không hợp lệ.');
}

const serverOutput = resolve(root, 'worker/catalog.generated.js');
const clientOutput = resolve(root, 'src/features/catalog/data/catalogSummary.generated.js');
const fixtureOutput = resolve(root, 'src/features/catalog/data/catalogFixture.generated.js');
await Promise.all([
  mkdir(dirname(serverOutput), { recursive: true }),
  mkdir(dirname(clientOutput), { recursive: true }),
  mkdir(dirname(fixtureOutput), { recursive: true })
]);
await Promise.all([
  writeFile(serverOutput, `// Generated from src/data/products.js. Do not edit manually.\nexport const SERVER_CATALOG = ${JSON.stringify(products, null, 2)};\n`),
  writeFile(clientOutput, `// Generated from src/data/products.js. Do not edit manually.\nexport const CATALOG_SUMMARY = ${JSON.stringify(products, null, 2)};\n`),
  writeFile(fixtureOutput, `// Generated from src/data/products.js. Do not edit manually.\nexport const CATALOG_FIXTURE = ${JSON.stringify(catalogFixture, null, 2)};\n`)
]);
console.log(`Generated server and frontend catalogs with ${products.length} products.`);

// Keep Edge SEO metadata aligned with the same policy and journal source as React.
const { POLICY_LIST, LEGAL_POLICIES } = await import('../src/data/legalPolicies.js');
const { DEFAULT_BLOG_ARTICLES } = await import('../src/data/blogArticles.js');
const policyMeta = Object.fromEntries(POLICY_LIST.map(policy => [`/${policy.slug}`, { title: policy.seoTitle, desc: policy.seoDesc }]));
policyMeta['/quy-trinh-khieu-nai'] = { title: LEGAL_POLICIES['chinh-sach-doi-tra'].seoTitle, desc: LEGAL_POLICIES['chinh-sach-doi-tra'].seoDesc };
await writeFile(resolve(root, 'worker/policies.generated.js'), `// Generated from policy source. Do not edit manually.\nexport const POLICY_META_MAP = ${JSON.stringify(policyMeta, null, 2)};\n`);
await writeFile(resolve(root, 'worker/articles.generated.js'), `// Generated from src/data/blogArticles.js. Do not edit manually.\nexport const SERVER_ARTICLES = ${JSON.stringify(DEFAULT_BLOG_ARTICLES, null, 2)};\n`);
