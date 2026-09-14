(function () {
  const applicationScripts = [
    'src/js/app/runtime-config.js',
    'src/js/app/firebase-init.js',
    'src/data/products.js',
    'src/js/catalog/catalog-loader.js',
    'src/js/account/auth-firebase.js',
    'src/js/services/email.js',
    'src/js/catalog/product-card.js',
    'src/js/catalog/product-filters.js',
    'src/js/analysis/skin-analysis.js',
    'src/js/analysis/camera.js',
    'src/js/cart/cart.js',
    'src/js/catalog/storefront.js'
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${src}?v=20260910-3`;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Không thể tải ${src}`));
      document.body.appendChild(script);
    });
  }

  async function hydrateComponents() {
    if (window.location.protocol === 'file:') return;
    const targets = Array.from(document.querySelectorAll('[data-component-src]'));
    await Promise.all(targets.map(async (target) => {
      const source = target.dataset.componentSrc;
      const response = await fetch(source, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Không thể tải ${source}`);
      const template = document.createElement('template');
      template.innerHTML = (await response.text()).trim();
      const replacement = template.content.firstElementChild;
      if (replacement) target.replaceWith(replacement);
    }));
  }

  async function boot() {
    try {
      await hydrateComponents();
    } catch (error) {
      console.warn('[SkinID components] Dùng HTML dự phòng:', error);
    }
    for (const src of applicationScripts) {
      await loadScript(src);
      if (src.endsWith('/catalog-loader.js')) await window.SKINID_CATALOG_READY;
      if (src.endsWith('/auth.js') && window.SKINID_AUTH_READY) await window.SKINID_AUTH_READY;
    }
    document.documentElement.classList.add('components-ready');
    document.dispatchEvent(new CustomEvent('skinid:ready'));
  }

  boot().catch((error) => console.error('[SkinID boot]', error));
})();
