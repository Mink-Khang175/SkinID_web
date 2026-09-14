/*
 * Firebase client bootstrap for the static SkinID frontend.
 * Firebase web config is public. Never add Gemini keys, Admin SDK credentials,
 * service-account JSON or sales-system secrets to this file/runtime config.
 */
(function initializeSkinIdFirebase() {
    const config = window.SKINID_CONFIG?.firebase;

    if (!config) {
        const error = new Error('Thiếu cấu hình Firebase công khai.');
        window.SKINID_FIREBASE_READY = Promise.reject(error);
        window.SKINID_FIREBASE_READY.catch(() => {});
        console.error('[SkinID Firebase]', error);
        return;
    }

    const sdkBaseUrl = 'https://www.gstatic.com/firebasejs/12.19.0';

    window.SKINID_FIREBASE_READY = Promise.all([
        import(`${sdkBaseUrl}/firebase-app.js`),
        import(`${sdkBaseUrl}/firebase-analytics.js`),
        import(`${sdkBaseUrl}/firebase-auth.js`),
        import(`${sdkBaseUrl}/firebase-firestore.js`)
    ]).then(async ([appSdk, analyticsSdk, authSdk, firestoreSdk]) => {
        const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(config);
        const auth = authSdk.getAuth(app);
        const db = firestoreSdk.getFirestore(app);
        let analytics = null;

        try {
            if (await analyticsSdk.isSupported()) {
                analytics = analyticsSdk.getAnalytics(app);
            }
        } catch (error) {
            console.warn('[SkinID Firebase] Analytics không khả dụng:', error.message);
        }

        const services = Object.freeze({
            app,
            analytics,
            auth,
            db,
            sdk: Object.freeze({ auth: authSdk, firestore: firestoreSdk })
        });

        window.SKINID_FIREBASE = services;
        document.dispatchEvent(new CustomEvent('skinid:firebase-ready', { detail: services }));
        return services;
    }).catch((error) => {
        console.error('[SkinID Firebase] Khởi tạo thất bại:', error);
        document.dispatchEvent(new CustomEvent('skinid:firebase-error', { detail: error }));
        throw error;
    });
})();
