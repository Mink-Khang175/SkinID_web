const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const source = JSON.parse(read('src/data/ecom-price-list-2026-10.json'));
const products = JSON.parse(read('src/data/products.js').match(/window\.LOCAL_PRODUCTS = (\[[\s\S]*?\]);/)[1]);

test('October prices and specifications reconcile all 54 spreadsheet rows across generated catalogs', () => {
  const catalogs = [products,
    JSON.parse(read('src/features/catalog/data/catalogFixture.generated.js').match(/= (\[[\s\S]*\]);/)[1]),
    JSON.parse(read('src/features/catalog/data/catalogSummary.generated.js').match(/= (\[[\s\S]*\]);/)[1])];
  assert.equal(source.products.length, 54);
  assert.equal(new Set(source.products.map(item => item.id)).size, 54);
  for (const catalog of catalogs) {
    assert.equal(catalog.length, 54);
    for (const row of source.products) {
      const product = catalog.find(item => item.id === row.id);
      assert.equal(product.price, row.price, row.id);
      assert.equal(product.volume, row.volume, row.id);
      assert(Number.isInteger(product.price));
    }
  }
  for (const row of source.products) {
    const product = products.find(item => item.id === row.id);
    assert.equal(product.originalPrice, row.originalPrice);
    assert.equal(product.productCode || null, row.productCode);
    assert.equal(product.unit, row.unit);
    assert.equal(product.sourceName, row.name);
  }
  const variant = products.find(item => item.id === 'rilastil-stretch-marks-75ml');
  assert(fs.existsSync(path.join(__dirname, '../src/assets', variant.image)), variant.image);
});

test('catalog refresh preserves Always On prices when offline and applies Firestore updates when online', async () => {
  const code = read('src/features/catalog/services/catalogRepository.js')
    .replace(/^import .*;\r?\n/gm, '')
    .replace(/export function /g, 'function ')
    .replace("await import('../data/catalogFixture.generated.js')", '{ CATALOG_FIXTURE: fixture }');
  for (const offline of [false, true]) {
    const context = { fixture: products, setAvailableProducts: value => value,
      console: { warn() {} }, firebaseServices: { db: {}, sdk: { firestore: {
        collection() {}, async getDocs() {
          if (offline) throw new Error('offline');
          return { empty: false, docs: products.map(product => ({ id: product.id, data: () => ({ price: 999000, originalPrice: 1200000 }) })) };
        }
      } } } };
    vm.createContext(context);
    vm.runInContext(code, context);
    const loaded = await context.refreshProductCatalog();
    for (const row of source.products) {
      const expected = offline ? row.price : 999000;
      assert.equal(loaded.find(item => item.id === row.id).price, expected);
    }
  }
});
