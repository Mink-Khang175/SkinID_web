const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const htmlFiles = ['index.html'];
for (const file of htmlFiles) {
    for (const match of read(file).matchAll(/(?:src|href)="([^"]*)"/g)) {
        const url = match[1].split(/[?#]/)[0];
        if (!url || /^(https?:|data:|mailto:|tel:|javascript:|\$)/.test(url)) continue;
        if (url.includes('{') || url.includes('<')) continue;
        assert(fs.existsSync(path.join(root, url)), file + ': missing reference ' + url);
    }
}
assert.match(read('index.html'), /<meta name="viewport" content="width=device-width, initial-scale=1\.0, maximum-scale=1\.0, user-scalable=no">/);
assert.match(read('index.html'), /<div id="root"><\/div>/);
assert.match(read('index.html'), /<script type="module" src="\/src\/main\.jsx"><\/script>/);
assert.match(read('src/main.jsx'), /import '\.\/styles\/site\.css'/);
assert.match(read('src/App.jsx'), /path === '\/profile'/);
assert.match(read('src/App.jsx'), /path === '\/skin-analysis'/);
assert.match(read('src/App.jsx'), /path === '\/admin'/);
assert(!fs.existsSync(path.join(root, 'profile.html')));
assert(!fs.existsSync(path.join(root, 'skin-analysis.html')));
const stylesheet = read('src/styles/site.css');
assert.match(stylesheet, /-webkit-text-size-adjust:100%/);
assert.match(stylesheet, /text-size-adjust:100%/);
assert.match(stylesheet, /html\{[^}]*font-size:16px/);
assert.match(stylesheet, /html\{width:100%;overflow-x:clip/);
assert.match(stylesheet, /\.hero-slide-inner\{width:min\(100%,1280px\)/);
assert.doesNotMatch(stylesheet, /\.hero-slide-copy h1,\.hero-slide-copy h2\{[^\n]*vw/);
assert.match(read('src/components/home/HeroBanner.jsx'), /className="hero-slide-inner"/);
const reactComponents = [
    'src/App.jsx',
    'src/pages/HomePage.jsx',
    'src/pages/SkinAnalysisPage.jsx',
    'src/pages/ProfilePage.jsx',
    'src/pages/AdminPage.jsx',
    'src/pages/AciePage.jsx',
    'src/pages/CompliancePage.jsx',
    'src/components/layout/Header.jsx',
    'src/components/home/HeroBanner.jsx',
    'src/components/home/CategorySection.jsx',
    'src/components/home/ProductList.jsx',
    'src/components/home/BrandShowcase.jsx',
    'src/components/analysis/SkincareRoutine.jsx',
    'src/components/layout/Footer.jsx'
];
for (const file of reactComponents) {
    const jsx = read(file);
    assert(!/\bclass=/.test(jsx), `${file}: class must be className`);
    assert(!/\bfor=/.test(jsx), `${file}: for must be htmlFor`);
    assert(!/<!--[\s\S]*?-->/.test(jsx), `${file}: HTML comments are not valid JSX comments`);
}
const reactApp = read('src/pages/HomePage.jsx');
for (const component of ['Header', 'HeroBanner', 'FeaturedProducts', 'BrandShowcase', 'SkincareRoutine', 'Footer']) {
    assert.match(reactApp, new RegExp(`<${component} \\/>`), `App must render ${component}`);
}
assert(reactApp.indexOf('<FeaturedProducts />') < reactApp.indexOf('<HelpSection />'));
assert(reactApp.indexOf('<HelpSection />') < reactApp.indexOf('<BrandShowcase />'));
assert(!reactApp.includes('<ProductList />'));
assert(read('src/pages/ProductsPage.jsx').includes('<ProductList />'));
const analysisApp = read('src/pages/SkinAnalysisPage.jsx');
for (const component of ['Header', 'SkincareRoutine', 'Footer', 'MobileNav', 'StorefrontModals', 'ProductDetailModal']) {
    assert.match(analysisApp, new RegExp(`<${component} \/>`), `SkinAnalysisPage must render ${component}`);
}
const storefront = read('src/js/catalog/storefront.js');
assert.match(storefront, /const carouselRotationMs = 5500/);
assert.match(storefront, /Math\.floor\(Date\.now\(\) \/ carouselRotationMs\) % slides\.length/);
assert.doesNotMatch(storefront, /setInterval\(\(\) => showSlide\(activeIndex \+ 1\), 5500\)/);
const bootstrap = read('src/js/app/bootstrap.js');
const scripts = [...bootstrap.matchAll(/'(src\/[^']+\.js)'/g)].map(m => m[1]);
assert(scripts.indexOf('src/js/app/runtime-config.js') < scripts.indexOf('src/js/app/firebase-init.js'));
assert(scripts.indexOf('src/js/app/firebase-init.js') < scripts.indexOf('src/js/account/auth-firebase.js'));
assert(scripts.indexOf('src/data/products.js') < scripts.indexOf('src/js/catalog/catalog-loader.js'));
assert(scripts.indexOf('src/data/products.js') < scripts.indexOf('src/js/analysis/skin-analysis.js'));
assert(scripts.indexOf('src/js/catalog/product-filters.js') < scripts.indexOf('src/js/analysis/skin-analysis.js'));
for (const file of scripts) {
    assert(fs.existsSync(path.join(root, file)), file);
    new vm.Script(read(file), { filename: file });
}
const products = JSON.parse(read('src/data/products.js').match(/window\.LOCAL_PRODUCTS = (\[[\s\S]*?\]);/)[1]);
assert.equal(products.length, 55);
assert(!read('src/js/analysis/skin-analysis.js').includes('const PRODUCTS ='));
const app = read('src/js/analysis/skin-analysis.js');
assert(!/AIza[\w-]{30,}/.test(app));
assert(!app.includes('generativelanguage.googleapis.com'));
assert(!app.includes('createLocalSkinAnalysis'));
assert.match(app, /apiRequest\('\/analyze-skin'/);
assert.doesNotMatch(app, /analysisEndpoint|netlify/i);
const runtimeConfig = read('src/js/app/runtime-config.js');
assert.match(runtimeConfig, /projectId: 'skinid-df273'/);
assert.match(runtimeConfig, /measurementId: 'G-425CLMQ7YP'/);
assert(!runtimeConfig.includes('geminiApiKey'));
assert.doesNotMatch(runtimeConfig, /netlify|analysisEndpoint/i);
assert.match(bootstrap, /src\/js\/account\/profile-dashboard\.js/);
assert.match(bootstrap, /src\/js\/admin\/admin-dashboard\.js/);
assert.match(read('src/pages/ProfilePage.jsx'), /useLegacyApplication\('profile'\)/);
assert.match(read('src/pages/ProfilePage.jsx'), /id="profile-save-bar"/);
assert.match(read('src/pages/ProfilePage.jsx'), /id="profile-avatar-input"/);
assert.match(read('src/pages/ProfilePage.jsx'), /id="prof-province"/);
assert.match(read('src/pages/ProfilePage.jsx'), /id="prof-ward"/);
assert.match(read('src/styles/profile.css'), /\.profile-page \.tab-btn\.active/);
assert.match(read('src/pages/AdminPage.jsx'), /useLegacyApplication\('admin'\)/);
assert.match(read('firestore.rules'), /match \/orders\/\{orderId\}/);
assert.match(read('firestore.rules'), /match \/commerce\/\{documentId\}/);
assert.match(read('firestore.rules'), /allow create: if false/);
const cart = read('src/js/cart/cart.js');
assert.match(cart, /async submitCheckout/);
assert.match(cart, /checkout-province/);
assert.match(cart, /checkout-ward/);
assert.doesNotMatch(cart, /localStorage|sessionStorage/);
assert.match(bootstrap, /src\/js\/services\/vietnam-address\.js/);
assert.match(bootstrap, /src\/js\/app\/scroll-lock\.js/);
assert.match(read('src/js/app/scroll-lock.js'), /classList\.toggle\('no-scroll', locks\.size > 0\)/);
assert.match(read('src/js/app/scroll-lock.js'), /site-header.*is-scrolled/);
assert.doesNotMatch(read('src/js/analysis/skin-analysis.js'), /body\.style\.overflow/);
assert.match(cart, /SkinIDScrollLock\?\.lock\('cart'\)/);
assert.match(cart, /SkinIDScrollLock\?\.unlock\('checkout'\)/);
assert.match(read('worker/index.js'), /async function createOrder/);
assert.match(read('worker/index.js'), /env\.GEMINI_API_KEY/);
assert.match(read('worker/index.js'), /validateAddress/);
assert.match(read('worker/index.js'), /users\/\$\{user\.sub\}\/addresses\/default/);
assert.match(read('worker/index.js'), /async function deleteUser/);
assert.match(read('src/js/admin/admin-dashboard.js'), /data-edit-product/);
assert.match(read('src/js/admin/admin-dashboard.js'), /apiRequest\(`\/admin\/users\//);
assert.match(read('src/assets/index.js'), /import\.meta\.env\.DEV/);
assert(!fs.existsSync(path.join(root, 'netlify.toml')));
assert(!fs.existsSync(path.join(root, 'netlify/functions/analyze-skin.mjs')));
assert.match(read('wrangler.jsonc'), /"run_worker_first": \["\/api\/\*"\]/);
assert.match(read('.github/workflows/cloudflare-deploy.yml'), /cloudflare\/wrangler-action@v3/);
assert.match(read('.github/workflows/cloudflare-deploy.yml'), /command: deploy/);
assert(!fs.existsSync(path.join(root, 'functions/index.js')));
console.log('PASS: page/component references, script dependency order, syntax, catalog extraction and no embedded Gemini credential.');
