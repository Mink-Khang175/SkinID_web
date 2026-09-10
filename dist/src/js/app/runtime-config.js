/* Public, non-secret configuration only. Every value here is visible in a browser.
 * Keep analysisEndpoint empty until a protected company/server endpoint is ready.
 * Never add Gemini keys, sales-system API tokens or client secrets here.
 */
window.SKINID_CONFIG = Object.freeze({
    analysisEndpoint: '',
    ...(window.SKINID_CONFIG || {})
});
