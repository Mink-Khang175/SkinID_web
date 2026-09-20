import { createRemoteJWKSet, jwtVerify } from 'jose';
import {
  commitWrites,
  deleteFirebaseUser,
  documentName,
  encodeFields,
  getDocument,
  listDocuments,
  runQuery
} from './firestore.js';

const jwksByProject = new Map();

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function requiredEnv(env) {
  for (const key of ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY']) {
    if (!env[key]) throw new ApiError(503, 'server_not_configured', `Backend thiếu biến ${key}.`);
  }
}

function corsHeaders(request, env) {
  const origin = request.headers.get('origin') || '';
  const configured = String(env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
  const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const allowed = !origin || origin === new URL(request.url).origin || local || configured.includes(origin);
  return {
    'access-control-allow-origin': allowed && origin ? origin : new URL(request.url).origin,
    'access-control-allow-headers': 'authorization, content-type, idempotency-key',
    'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'access-control-max-age': '86400',
    vary: 'Origin'
  };
}

function json(request, env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...corsHeaders(request, env) }
  });
}

async function authenticate(request, env) {
  requiredEnv(env);
  const token = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw new ApiError(401, 'unauthenticated', 'Bạn cần đăng nhập trước khi thực hiện thao tác này.');
  let jwks = jwksByProject.get(env.FIREBASE_PROJECT_ID);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
    jwksByProject.set(env.FIREBASE_PROJECT_ID, jwks);
  }
  try {
    const result = await jwtVerify(token, jwks, {
      issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
      audience: env.FIREBASE_PROJECT_ID,
      algorithms: ['RS256']
    });
    return result.payload;
  } catch {
    throw new ApiError(401, 'invalid_token', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
  }
}

function text(value, label, maxLength = 500) {
  const normalized = String(value || '').trim();
  if (!normalized) throw new ApiError(400, 'invalid_argument', `Thiếu ${label}.`);
  return normalized.slice(0, maxLength);
}

function validateAddress(value = {}) {
  const provinceCode = Number(value.provinceCode);
  const wardCode = Number(value.wardCode);
  if (!Number.isInteger(provinceCode) || provinceCode <= 0 || !Number.isInteger(wardCode) || wardCode <= 0) {
    throw new ApiError(400, 'invalid_address', 'Vui lòng chọn đầy đủ tỉnh/thành và phường/xã.');
  }
  const address = {
    line1: text(value.line1, 'địa chỉ chi tiết', 240),
    wardCode,
    wardName: text(value.wardName, 'phường/xã', 120),
    provinceCode,
    provinceName: text(value.provinceName, 'tỉnh/thành', 120)
  };
  address.fullAddress = `${address.line1}, ${address.wardName}, ${address.provinceName}`;
  return address;
}

function updateWrite(env, path, value, fieldPaths, precondition) {
  return {
    update: { name: documentName(env, path), fields: encodeFields(value) },
    ...(fieldPaths ? { updateMask: { fieldPaths } } : {}),
    ...(precondition ? { currentDocument: precondition } : {})
  };
}

async function createOrder(request, env, user) {
  const payload = await request.json().catch(() => { throw new ApiError(400, 'invalid_json', 'Dữ liệu gửi lên không hợp lệ.'); });
  const requestedItems = Array.isArray(payload.items) ? payload.items : [];
  if (!requestedItems.length || requestedItems.length > 50) throw new ApiError(400, 'invalid_cart', 'Giỏ hàng không hợp lệ.');

  const quantities = new Map();
  for (const item of requestedItems) {
    const productId = text(item?.productId, 'mã sản phẩm', 160);
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new ApiError(400, 'invalid_quantity', 'Số lượng sản phẩm không hợp lệ.');
    const total = (quantities.get(productId) || 0) + quantity;
    if (total > 20) throw new ApiError(400, 'invalid_quantity', 'Mỗi sản phẩm chỉ được đặt tối đa 20 đơn vị.');
    quantities.set(productId, total);
  }

  const products = await Promise.all([...quantities.keys()].map(id => getDocument(env, `products/${id}`)));
  const items = products.map((product, index) => {
    const productId = [...quantities.keys()][index];
    if (!product) throw new ApiError(409, 'product_unavailable', `Sản phẩm ${productId} không còn tồn tại.`);
    const price = Number(product.price);
    if (!Number.isFinite(price) || price < 0) throw new ApiError(409, 'invalid_product_price', `Giá sản phẩm ${productId} không hợp lệ.`);
    const quantity = quantities.get(productId);
    return {
      productId,
      name: String(product.name || productId),
      image: String(product.image || ''),
      volume: String(product.volume || ''),
      price,
      quantity,
      lineTotal: price * quantity
    };
  });

  const shippingAddress = validateAddress(payload.customer?.shippingAddress);
  const customerName = text(payload.customer?.name, 'họ tên', 120);
  const customerPhone = text(payload.customer?.phone, 'số điện thoại', 30);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const now = new Date();
  const orderId = crypto.randomUUID().replaceAll('-', '');
  const paymentMethod = ['cod', 'bank_transfer'].includes(payload.paymentMethod) ? payload.paymentMethod : 'cod';
  const order = {
    userId: user.sub,
    customer: {
      name: customerName,
      email: String(user.email || '').slice(0, 254),
      phone: customerPhone,
      address: shippingAddress.fullAddress,
      shippingAddress
    },
    items,
    note: String(payload.note || '').trim().slice(0, 1000),
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
    paymentMethod,
    paymentStatus: 'unpaid',
    status: 'pending',
    source: 'cloudflare-worker',
    createdAt: now,
    updatedAt: now
  };
  const profile = {
    name: customerName,
    phone: customerPhone,
    address: shippingAddress.fullAddress,
    shippingAddress,
    updatedAt: now
  };
  const address = { ...shippingAddress, recipientName: customerName, phone: customerPhone, isDefault: true, updatedAt: now };
  const activity = { type: 'order_created', orderId, total: order.total, createdAt: now };

  await commitWrites(env, [
    updateWrite(env, `orders/${orderId}`, order, null, { exists: false }),
    updateWrite(env, `users/${user.sub}`, profile, Object.keys(profile)),
    updateWrite(env, `users/${user.sub}/addresses/default`, address),
    updateWrite(env, `users/${user.sub}/activities/${orderId}`, activity),
    { delete: documentName(env, `users/${user.sub}/commerce/cart`) }
  ]);

  return json(request, env, { success: true, orderId, subtotal, shippingFee, total: order.total }, 201);
}

async function cancelOrder(request, env, user, orderId) {
  const order = await getDocument(env, `orders/${orderId}`);
  if (!order || order.userId !== user.sub) throw new ApiError(404, 'order_not_found', 'Không tìm thấy đơn hàng.');
  if (!['pending', 'confirmed'].includes(order.status)) throw new ApiError(409, 'order_not_cancellable', 'Đơn hàng không thể hủy ở trạng thái hiện tại.');
  await commitWrites(env, [updateWrite(env, `orders/${orderId}`, {
    status: 'cancelled',
    updatedAt: new Date()
  }, ['status', 'updatedAt'])]);
  return json(request, env, { success: true, orderId });
}

function validateImages(payload) {
  if (!Array.isArray(payload.images) || payload.images.length !== 3) throw new ApiError(400, 'invalid_images', 'Cần đúng 3 ảnh khuôn mặt.');
  let totalBytes = 0;
  const images = payload.images.map((image, index) => {
    if (typeof image !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(image)) throw new ApiError(400, 'invalid_image', `Ảnh #${index + 1} không hợp lệ.`);
    const bytes = Math.floor(image.length * 3 / 4);
    if (bytes > 4 * 1024 * 1024) throw new ApiError(413, 'image_too_large', `Ảnh #${index + 1} vượt quá 4 MB.`);
    totalBytes += bytes;
    return image;
  });
  if (totalBytes > 10 * 1024 * 1024) throw new ApiError(413, 'images_too_large', 'Tổng dung lượng ảnh vượt quá 10 MB.');
  return { images, skinType: String(payload.skinType || 'Chưa xác định').slice(0, 80) };
}

function analysisPrompt(skinType) {
  return `Bạn là hệ thống hỗ trợ quan sát tình trạng da từ ảnh, không phải bác sĩ và không đưa ra chẩn đoán y khoa. Kiểm tra cả 3 ảnh có phải cùng một khuôn mặt người rõ ràng hay không. Nếu không, chỉ trả JSON {"isNotFace":true,"reason":"No human face detected"}. Thông tin tự khai: ${skinType}. Nếu hợp lệ, chỉ trả JSON tiếng Việt gồm isNotFace, skinTypeSummary, analysis3Angles, activeIngredients, overallGrade, overallGradeComment, skinConditions, recoveryTimeline, healthScore, skinAge, moisture, elasticity, sebum, pigmentation, pores, eyeWrinkles, nasolabialFolds, redness, acneBacteria, texture, darkCircles, melasma, detailedAdvice. Mọi chỉ số là số nguyên 0-100 và chỉ mang tính tham khảo từ điều kiện ảnh.`;
}

function validateAnalysis(value) {
  if (!value || typeof value !== 'object') throw new ApiError(502, 'invalid_ai_response', 'Gemini không trả về dữ liệu hợp lệ.');
  if (value.isNotFace === true) return { isNotFace: true, reason: String(value.reason || 'No human face detected') };
  if (!value.skinTypeSummary || !value.analysis3Angles) throw new ApiError(502, 'invalid_ai_response', 'Kết quả phân tích thiếu trường bắt buộc.');
  const metrics = ['healthScore', 'skinAge', 'moisture', 'elasticity', 'sebum', 'pigmentation', 'pores', 'eyeWrinkles', 'nasolabialFolds', 'redness', 'acneBacteria', 'texture', 'darkCircles', 'melasma'];
  for (const key of metrics) {
    const number = Number(value[key]);
    if (!Number.isFinite(number)) throw new ApiError(502, 'invalid_ai_response', `Kết quả phân tích thiếu chỉ số ${key}.`);
    value[key] = Math.max(0, Math.min(100, Math.round(number)));
  }
  return value;
}

async function analyzeSkin(request, env, user) {
  if (!env.GEMINI_API_KEY) throw new ApiError(503, 'gemini_not_configured', 'Backend chưa được cấu hình Gemini API key.');
  const input = validateImages(await request.json());
  const quotaPath = `users/${user.sub}/private/aiUsage`;
  const quota = await getDocument(env, quotaPath);
  const today = new Date().toISOString().slice(0, 10);
  const count = quota?.date === today ? Number(quota.count || 0) : 0;
  if (count >= 10) throw new ApiError(429, 'daily_limit', 'Bạn đã hết 10 lượt phân tích da hôm nay.');
  await commitWrites(env, [updateWrite(env, quotaPath, { date: today, count: count + 1, updatedAt: new Date() })]);
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: analysisPrompt(input.skinType) }, ...input.images.map(data => ({ inlineData: { mimeType: 'image/jpeg', data } }))] }],
      generationConfig: { temperature: 0.1, topP: 0.8, responseMimeType: 'application/json' }
    })
  });
  const payload = await response.json();
  if (!response.ok) throw new ApiError(503, 'gemini_unavailable', 'Dịch vụ phân tích đang bận, vui lòng thử lại.');
  try {
    const analysis = validateAnalysis(JSON.parse(payload.candidates?.[0]?.content?.parts?.[0]?.text));
    return json(request, env, { success: true, analysis });
  } catch {
    throw new ApiError(502, 'invalid_ai_response', 'Kết quả phân tích không hợp lệ, vui lòng thử lại.');
  }
}

async function deleteUser(request, env, user, uid) {
  if (user.admin !== true) throw new ApiError(403, 'permission_denied', 'Chỉ quản trị viên mới có thể xóa tài khoản.');
  if (!uid || uid === user.sub) throw new ApiError(400, 'invalid_user', 'Không thể xóa tài khoản này.');
  const orders = await runQuery(env, {
    from: [{ collectionId: 'orders' }],
    where: { fieldFilter: { field: { fieldPath: 'userId' }, op: 'EQUAL', value: { stringValue: uid } } }
  });
  const nestedCollections = ['skinReports', 'commerce', 'private', 'addresses', 'wishlist', 'activities'];
  const nestedDocuments = (await Promise.all(nestedCollections.map(collection => listDocuments(env, `users/${uid}/${collection}`)))).flat();
  const writes = [
    ...orders.map(order => ({ delete: order.name })),
    ...nestedDocuments.map(document => ({ delete: document.name })),
    { delete: documentName(env, `users/${uid}`) }
  ];
  for (let index = 0; index < writes.length; index += 450) await commitWrites(env, writes.slice(index, index + 450));
  await deleteFirebaseUser(env, uid);
  return json(request, env, { success: true, uid, deletedOrders: orders.length });
}

async function handleApi(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  const user = await authenticate(request, env);
  const url = new URL(request.url);
  if (request.method === 'POST' && url.pathname === '/api/orders') return createOrder(request, env, user);
  const orderMatch = url.pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (request.method === 'PATCH' && orderMatch) return cancelOrder(request, env, user, decodeURIComponent(orderMatch[1]));
  if (request.method === 'POST' && url.pathname === '/api/analyze-skin') return analyzeSkin(request, env, user);
  const userMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (request.method === 'DELETE' && userMatch) return deleteUser(request, env, user, decodeURIComponent(userMatch[1]));
  throw new ApiError(404, 'not_found', 'Không tìm thấy API được yêu cầu.');
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith('/api/')) return await handleApi(request, env);
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error('[SkinID Worker]', { code: error.code, message: error.message });
      return json(request, env, { success: false, code: error.code || 'internal', message: error.message || 'Không thể hoàn tất yêu cầu.' }, error.status || 500);
    }
  }
};
