import { importPKCS8, SignJWT } from 'jose';

const tokenCache = new Map();

function normalizePrivateKey(value) {
  let key = String(value || '').trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
}

export function encodeValue(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === 'object') return { mapValue: { fields: encodeFields(value) } };
  return { stringValue: String(value) };
}

export function encodeFields(value) {
  return Object.fromEntries(Object.entries(value || {}).map(([key, item]) => [key, encodeValue(item)]));
}

export function decodeValue(value = {}) {
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  return null;
}

export function decodeFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

async function getGoogleAccessToken(env) {
  const cacheKey = `${env.FIREBASE_PROJECT_ID}:${env.FIREBASE_CLIENT_EMAIL}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const privateKey = await importPKCS8(normalizePrivateKey(env.FIREBASE_PRIVATE_KEY), 'RS256');
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/identitytoolkit'
  })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(env.FIREBASE_CLIENT_EMAIL)
    .setSubject(env.FIREBASE_CLIENT_EMAIL)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(privateKey);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) throw new Error('Không thể xác thực tài khoản dịch vụ Firebase.');
  tokenCache.set(cacheKey, { token: payload.access_token, expiresAt: Date.now() + Number(payload.expires_in || 3600) * 1000 });
  return payload.access_token;
}

export function documentName(env, path) {
  const segments = String(path).split('/').filter(Boolean).map(encodeURIComponent).join('/');
  return `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${segments}`;
}

function documentsBase(env) {
  return `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
}

export async function firestoreRequest(env, path, options = {}) {
  const token = await getGoogleAccessToken(env);
  const response = await fetch(`${documentsBase(env)}${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (response.status === 404) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || `Firestore trả về lỗi ${response.status}.`);
  return payload;
}

export async function getDocument(env, path) {
  const encodedPath = String(path).split('/').filter(Boolean).map(encodeURIComponent).join('/');
  const document = await firestoreRequest(env, `/${encodedPath}`);
  return document ? { id: document.name.split('/').pop(), ...decodeFields(document.fields) } : null;
}

export async function runQuery(env, structuredQuery) {
  const rows = await firestoreRequest(env, ':runQuery', {
    method: 'POST',
    body: JSON.stringify({ structuredQuery })
  });
  return (rows || []).filter(row => row.document).map(row => ({
    id: row.document.name.split('/').pop(),
    name: row.document.name,
    ...decodeFields(row.document.fields)
  }));
}

export async function listDocuments(env, collectionPath) {
  const encodedPath = String(collectionPath).split('/').filter(Boolean).map(encodeURIComponent).join('/');
  const documents = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({ pageSize: '300' });
    if (pageToken) query.set('pageToken', pageToken);
    const payload = await firestoreRequest(env, `/${encodedPath}?${query}`) || {};
    documents.push(...(payload.documents || []));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);
  return documents.map(document => ({ id: document.name.split('/').pop(), name: document.name, ...decodeFields(document.fields) }));
}

export async function commitWrites(env, writes) {
  return firestoreRequest(env, ':commit', {
    method: 'POST',
    body: JSON.stringify({ writes })
  });
}

export async function deleteFirebaseUser(env, uid) {
  const token = await getGoogleAccessToken(env);
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/accounts:delete`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ localId: uid })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || 'Không thể xóa tài khoản Firebase Authentication.');
  return payload;
}
