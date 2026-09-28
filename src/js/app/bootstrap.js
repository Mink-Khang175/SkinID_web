(function () {
  const storefrontScripts = [
    'src/js/app/scroll-lock.js',
    'src/data/products.js',
    'src/js/catalog/catalog-loader.js',
    'src/js/catalog/product-card.js',
    'src/js/catalog/product-filters.js',
    'src/js/analysis/skin-analysis.js',
    'src/js/analysis/camera.js',
    'src/js/catalog/storefront.js'
  ];
  const applicationScripts = storefrontScripts;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${src}?v=20260922-5`;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Không thể tải ${src}`));
      document.body.appendChild(script);
    });
  }

  async function boot() {
    for (const src of applicationScripts) {
      await loadScript(src);
      if (src.endsWith('/catalog-loader.js')) await window.SKINID_CATALOG_READY;
    }
    document.documentElement.classList.add('components-ready');
    document.dispatchEvent(new CustomEvent('skinid:ready'));
  }

  boot().catch((error) => console.error('[SkinID boot]', error));
})();
