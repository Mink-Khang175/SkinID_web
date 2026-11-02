export const firebaseConfig = Object.freeze({
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || 'AIzaSyBMnJ7Z1NYjARTXSdUNL9UWs8wodU6ddiE',
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || 'skinid-df273.firebaseapp.com',
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || 'skinid-df273',
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || 'skinid-df273.firebasestorage.app',
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '489776624763',
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || '1:489776624763:web:76f0e682e559c0448b1ede',
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || ''
});

const CLOUDFLARE_WORKER_API_URL = import.meta.env?.VITE_WORKER_API_URL || '/api';

function resolveApiBaseUrl() {
  if (import.meta.env?.VITE_API_BASE_URL) return import.meta.env?.VITE_API_BASE_URL;
  if (typeof window === 'undefined') return '/api';
  if (window.SKINID_CONFIG?.apiBaseUrl) return window.SKINID_CONFIG.apiBaseUrl;
  if (window.location.hostname.endsWith('workers.dev')) return '/api';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return '/api';
  if (window.location.hostname === 'skinid.vn' || window.location.hostname === 'www.skinid.vn') return '/api';
  return CLOUDFLARE_WORKER_API_URL;
}

export const runtimeConfig = Object.freeze({
  apiBaseUrl: resolveApiBaseUrl(),
  firebase: firebaseConfig
});

export function installLegacyRuntimeConfig() {
  if (typeof window === 'undefined') return runtimeConfig;
  window.SKINID_CONFIG = Object.freeze({
    ...runtimeConfig,
    ...(window.SKINID_CONFIG || {})
  });
  return window.SKINID_CONFIG;
}
