import { createPublicKey, verify } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import analysis from '../../functions/analysis.js';

const { DAILY_LIMIT, buildPrompt, utcDateKey, validateAnalysis, validateInput } = analysis;
const FIREBASE_PROJECT_ID = 'skinid-df273';
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const FIREBASE_CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const isAllowedOrigin = origin => origin === 'https://skinid.vn' || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
let certificateCache = { expiresAt: 0, values: null };

function responseHeaders(origin) {
  const headers = { 'Content-Type': 'application/json', 'Vary': 'Origin' };
  if (isAllowedOrigin(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

const json = (status, body, origin = '') => new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });

function decodeJwtPart(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

async function getFirebaseCertificates() {
  if (certificateCache.values && certificateCache.expiresAt > Date.now()) return certificateCache.values;
  const response = await fetch(FIREBASE_CERTS_URL);
  if (!response.ok) throw new Error('Không thể tải chứng thư xác thực Firebase.');
  const cacheControl = response.headers.get('cache-control') || '';
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] || 300);
  certificateCache = { expiresAt: Date.now() + Math.max(60, maxAge) * 1000, values: await response.json() };
  return certificateCache.values;
}

async function verifyFirebaseIdToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw Object.assign(new Error('Phiên đăng nhập không hợp lệ.'), { status: 401 });
  const header = decodeJwtPart(parts[0]);
  const payload = decodeJwtPart(parts[1]);
  const now = Math.floor(Date.now() / 1000);
  if (header.alg !== 'RS256' || !header.kid) throw Object.assign(new Error('Phiên đăng nhập không hợp lệ.'), { status: 401 });
  if (payload.aud !== FIREBASE_PROJECT_ID || payload.iss !== FIREBASE_ISSUER || typeof payload.sub !== 'string' || !payload.sub) {
    throw Object.assign(new Error('Phiên đăng nhập không thuộc SkinID.'), { status: 401 });
  }
  if (!Number.isFinite(payload.exp) || payload.exp <= now || !Number.isFinite(payload.iat) || payload.iat > now + 60) {
    throw Object.assign(new Error('Phiên đăng nhập đã hết hạn.'), { status: 401 });
  }
  const certificate = (await getFirebaseCertificates())[header.kid];
  if (!certificate) throw Object.assign(new Error('Không xác minh được phiên đăng nhập.'), { status: 401 });
  const valid = verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey(certificate), Buffer.from(parts[2], 'base64url'));
  if (!valid) throw Object.assign(new Error('Chữ ký phiên đăng nhập không hợp lệ.'), { status: 401 });
  return payload;
}

async function consumeQuota(uid) {
  const store = getStore('skinid-ai-usage');
  const key = `${utcDateKey()}/${uid}`;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const current = await store.getWithMetadata(key, { consistency: 'strong', type: 'json' });
    const count = Number(current?.data?.count || 0);
    if (count >= DAILY_LIMIT) throw Object.assign(new Error('Bạn đã hết lượt phân tích da hôm nay.'), { status: 429 });
    const options = current ? { onlyIfMatch: current.etag } : { onlyIfNew: true };
    const result = await store.setJSON(key, { count: count + 1, updatedAt: new Date().toISOString() }, options);
    if (result.modified) return;
  }
  throw Object.assign(new Error('Hệ thống đang bận, vui lòng thử lại.'), { status: 503 });
}

export default async request => {
  const origin = request.headers.get('origin') || '';
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { ...responseHeaders(origin), 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
  }
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' }, origin);
  if (origin && !isAllowedOrigin(origin)) return json(403, { error: 'Origin không được phép.' }, origin);
  try {
    const match = request.headers.get('authorization')?.match(/^Bearer (.+)$/);
    if (!match) return json(401, { error: 'Bạn cần đăng nhập.' }, origin);
    const decoded = await verifyFirebaseIdToken(match[1]);
    const input = validateInput(await request.json());
    await consumeQuota(decoded.sub);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw Object.assign(new Error('Máy chủ chưa được cấu hình Gemini.'), { status: 503 });
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(input.skinType, null) }, ...input.images.map(data => ({ inlineData: { mimeType: 'image/jpeg', data } }))] }],
        generationConfig: { temperature: 0.1, topP: 0.8, responseMimeType: 'application/json' }
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      console.error('Gemini request failed', { status: response.status, code: payload?.error?.code });
      return json(503, { error: 'Dịch vụ phân tích đang bận, vui lòng thử lại.' }, origin);
    }
    const value = JSON.parse(payload.candidates?.[0]?.content?.parts?.[0]?.text);
    return json(200, { analysis: validateAnalysis(value) }, origin);
  } catch (error) {
    console.error('Skin analysis failed', { message: error.message });
    return json(error.status || 400, { error: error.status ? error.message : 'Không thể hoàn tất phân tích da.' }, origin);
  }
};
