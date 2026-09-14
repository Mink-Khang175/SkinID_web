const { initializeApp } = require('firebase-admin/app');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { DAILY_LIMIT, buildPrompt, utcDateKey, validateAnalysis, validateInput } = require('./analysis');

initializeApp();

async function consumeDailyQuota(db, uid) {
  const reference = db.doc(`users/${uid}/private/aiUsage`);
  const today = utcDateKey();
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(reference);
    const value = snapshot.data() || {};
    const count = value.date === today ? Number(value.count || 0) : 0;
    if (count >= DAILY_LIMIT) throw new HttpsError('resource-exhausted', 'Bạn đã hết lượt phân tích da hôm nay.');
    transaction.set(reference, { date: today, count: count + 1, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  });
}

async function getBaseline(db, uid) {
  const snapshot = await db.collection(`users/${uid}/skinReports`).orderBy('createdAt', 'desc').limit(1).get();
  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data();
  return { healthScore: data.healthScore, skinType: data.skinType, skinAge: data.skinAge };
}

exports.analyzeSkin = onCall({
  region: 'asia-southeast1',
  timeoutSeconds: 120,
  memory: '512MiB',
  maxInstances: 10,
  cors: true
}, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Bạn cần đăng nhập trước khi phân tích da.');

  let input;
  try {
    input = validateInput(request.data);
  } catch (error) {
    throw new HttpsError('invalid-argument', error.message);
  }

  const db = getFirestore();
  await consumeDailyQuota(db, request.auth.uid);
  const baseline = await getBaseline(db, request.auth.uid);
  const prompt = buildPrompt(input.skinType, baseline);
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{ parts: [
        { text: prompt },
        ...input.images.map(data => ({ inlineData: { mimeType: 'image/jpeg', data } }))
      ] }],
      generationConfig: { temperature: 0.1, topP: 0.8, responseMimeType: 'application/json' }
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    console.error('Gemini request failed', { status: response.status, code: payload?.error?.code });
    throw new HttpsError('unavailable', 'Dịch vụ phân tích đang bận, vui lòng thử lại.');
  }

  try {
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    return { analysis: validateAnalysis(JSON.parse(text)) };
  } catch (error) {
    console.error('Invalid Gemini response', { message: error.message });
    throw new HttpsError('data-loss', 'Kết quả phân tích không hợp lệ, vui lòng thử lại.');
  }
});
