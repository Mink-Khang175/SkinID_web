(function () {
  const page = new URL(document.currentScript.src).searchParams.get('page') || 'home';
  const storefrontScripts = [
    'src/js/app/runtime-config.js',
    'src/js/app/scroll-lock.js',
    'src/js/app/firebase-init.js',
    'src/data/products.js',
    'src/js/catalog/catalog-loader.js',
    'src/js/account/auth-firebase.js',
    'src/js/services/vietnam-address.js',
    'src/js/services/email.js',
    'src/js/catalog/product-card.js',
    'src/js/catalog/product-filters.js',
    'src/js/analysis/skin-analysis.js',
    'src/js/analysis/camera.js',
    'src/js/cart/cart.js',
    'src/js/catalog/storefront.js'
  ];
  const profileScripts = [
    'src/js/app/runtime-config.js',
    'src/js/app/scroll-lock.js',
    'src/js/app/firebase-init.js',
    'src/js/account/auth-firebase.js',
    'src/js/services/vietnam-address.js',
    'src/js/account/profile-dashboard.js'
  ];
  const adminScripts = [
    'src/js/app/runtime-config.js',
    'src/js/app/scroll-lock.js',
    'src/js/app/firebase-init.js',
    'src/js/account/auth-firebase.js',
    'src/js/admin/admin-dashboard.js'
  ];
  const applicationScripts = page === 'profile' ? profileScripts : page === 'admin' ? adminScripts : storefrontScripts;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${src}?v=20260910-3`;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Không thể tải ${src}`));
      document.body.appendChild(script);
    });
  }

  async function boot() {
    for (const src of applicationScripts) {
      await loadScript(src);
      if (src.endsWith('/catalog-loader.js')) await window.SKINID_CATALOG_READY;
      if (src.endsWith('/auth-firebase.js') && window.SKINID_AUTH_READY) await window.SKINID_AUTH_READY;
    }
    document.documentElement.classList.add('components-ready');
    document.dispatchEvent(new CustomEvent('skinid:ready'));
  }

  boot().catch((error) => console.error('[SkinID boot]', error));
})();
