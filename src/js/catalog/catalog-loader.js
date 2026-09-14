/* Loads the public product catalog from Firestore, with the bundled catalog as an offline fallback. */
(function loadCatalog() {
    const fallback = Array.isArray(window.LOCAL_PRODUCTS) ? window.LOCAL_PRODUCTS : [];
    window.PRODUCTS = fallback;

    window.SKINID_CATALOG_READY = (async () => {
        try {
            const firebase = await window.SKINID_FIREBASE_READY;
            const snapshot = await firebase.sdk.firestore.getDocs(
                firebase.sdk.firestore.collection(firebase.db, 'products')
            );
            const products = snapshot.docs.map(document => ({ ...document.data(), id: document.id }));
            if (!products.length) throw new Error('Collection products đang trống.');
            window.PRODUCTS = products;
            document.dispatchEvent(new CustomEvent('skinid:catalog-ready', { detail: { source: 'firestore', count: products.length } }));
            return products;
        } catch (error) {
            console.warn('[SkinID catalog] Dùng dữ liệu local dự phòng:', error.message);
            window.PRODUCTS = fallback;
            document.dispatchEvent(new CustomEvent('skinid:catalog-ready', { detail: { source: 'local', count: fallback.length } }));
            return fallback;
        }
    })();
})();
