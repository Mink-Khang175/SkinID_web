const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
function walk(dir) {
    return fs.readdirSync(path.join(root, dir), { withFileTypes: true })
        .flatMap(entry => entry.isDirectory() ? walk(dir + '/' + entry.name) : [dir + '/' + entry.name]);
}
const htmlFiles = ['index.html', 'skin-analysis.html', 'profile.html', 'preview_verification.html',
    ...walk('src/components').filter(f => f.endsWith('.html'))];
for (const file of htmlFiles) {
    for (const match of read(file).matchAll(/(?:src|href|data-component-src)="([^"]*)"/g)) {
        const url = match[1].split(/[?#]/)[0];
        if (!url || /^(https?:|data:|mailto:|tel:|javascript:|\$)/.test(url)) continue;
        if (url.includes('{') || url.includes('<')) continue;
        assert(fs.existsSync(path.join(root, url)), file + ': missing reference ' + url);
    }
}
const bootstrap = read('src/js/app/bootstrap.js');
const scripts = [...bootstrap.matchAll(/'(src\/[^']+\.js)'/g)].map(m => m[1]);
assert(scripts.indexOf('src/data/products.js') < scripts.indexOf('src/js/analysis/skin-analysis.js'));
assert(scripts.indexOf('src/js/catalog/product-filters.js') < scripts.indexOf('src/js/analysis/skin-analysis.js'));
for (const file of scripts) {
    assert(fs.existsSync(path.join(root, file)), file);
    new vm.Script(read(file), { filename: file });
}
const products = JSON.parse(read('src/data/products.js').match(/const PRODUCTS = (\[[\s\S]*?\]);/)[1]);
assert.equal(products.length, 54);
assert(!read('src/js/analysis/skin-analysis.js').includes('const PRODUCTS ='));
const app = read('src/js/analysis/skin-analysis.js');
assert(/const GEMINI_API_KEY = '';/.test(app));
assert(!/AIza[\w-]{30,}/.test(app));
console.log('PASS: page/component references, script dependency order, syntax, catalog extraction and no embedded Gemini credential.');
