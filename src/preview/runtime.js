import { createLocalBackend } from './localBackend.mjs';
import { CATALOG_FIXTURE } from '../features/catalog/data/catalogFixture.generated.js';
import { DEFAULT_BLOG_ARTICLES } from '../data/blogArticles.js';
import { AVAILABLE_COUPONS } from '../features/cart/services/couponService.js';
import publicContent from './public-content.json' with { type: 'json' };

export const isFrontendPreview = import.meta.env?.VITE_FRONTEND_PREVIEW === 'true';
const seed = {};
for (const product of CATALOG_FIXTURE) seed[`products/${product.id}`] = product;
for (const article of DEFAULT_BLOG_ARTICLES) seed[`posts/${article.id}`] = article;
for (const coupon of Object.values(AVAILABLE_COUPONS)) seed[`promotions/${coupon.code}`] = { ...coupon, active: true };
for (const [path, values] of Object.entries(publicContent.documents || {})) {
  if (Array.isArray(values)) for (const item of values) seed[`${path}/${item.id || item.code}`] = item;
  else seed[path] = values;
}
const createdAt = { seconds: 1793520000, nanoseconds: 0 };
for (const kind of ['customer','admin']) seed[`users/preview-${kind}`] = {
  name: kind === 'admin' ? 'Quản trị viên mẫu' : 'Khách hàng mẫu', email: `preview-${kind}@example.test`,
  phone: '0900000000', role: kind === 'admin' ? 'super_admin' : 'customer', createdAt,
  address: 'Địa chỉ minh họa — không giao hàng thật', gender: 'other'
};
const product = CATALOG_FIXTURE.find(p => p.id === 'twon-sua-tam') || CATALOG_FIXTURE[0];
seed['orders/DEMO-ORDER-001'] = {
  id: 'DEMO-ORDER-001', userId: 'preview-customer', preview: true,
  customer: { name: 'Khách hàng mẫu', email: 'preview-customer@example.test', phone: '0900000000', address: 'Địa chỉ minh họa' },
  items: [{ productId: product.id, name: product.name, image: product.image, quantity: 1, price: product.price, lineTotal: product.price }],
  subtotal: product.price, shippingFee: 30000, discountAmount: 0, total: product.price + 30000,
  status: 'pending', paymentMethod: 'bank_transfer', paymentStatus: 'unpaid', s3SyncStatus: 'disabled', createdAt, updatedAt: createdAt,
  note: 'Đơn mẫu để xem giao diện; không gửi đi.'
};
export const previewAnalysis = {
  healthScore: 75, skinAge: 25, skinType: 'Da hỗn hợp', overallGrade: 'B',
  overallGradeComment: 'Dữ liệu minh họa giao diện', summary: 'Đây là báo cáo mẫu để chỉnh giao diện, không phải kết quả phân tích ảnh hoặc tư vấn y khoa.',
  primaryConcerns: ['Dữ liệu minh họa'], metrics: { moisture: 65, oil: 45, acne: 25, pores: 40, pigmentation: 30, wrinkles: 20 },
  recommendedRoutine: [], recommendedRoutineProducts: [], analysis3Angles: 'Dữ liệu mẫu — không xử lý ảnh thật.', createdAt
};
seed['users/preview-customer/skinReports/DEMO-SCAN-001'] = { id: 'DEMO-SCAN-001', ...previewAnalysis };
export const previewBackend = createLocalBackend({ seed, storage: typeof window === 'undefined' ? undefined : window.localStorage });

export async function previewApiRequest(path, options = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};
  const sdk = previewBackend.sdk.firestore;
  if (path === '/analyze-skin') return { analysis: previewAnalysis, preview: true };
  if (path === '/orders' && method === 'POST') {
    if (!previewBackend.auth.currentUser) throw new Error('Vui lòng chọn tài khoản mẫu hoặc đăng nhập trong bản xem giao diện.');
    const items = (body.items || []).map(({ productId, quantity }) => {
      const selected = previewBackend.getRecords()[`products/${productId}`];
      if (!selected) throw new Error(`Không tìm thấy sản phẩm ${productId}.`);
      return { productId, quantity, name: selected.name, image: selected.image, price: selected.price, lineTotal: selected.price * quantity };
    });
    if (!items.length) throw new Error('Giỏ hàng mẫu đang trống.');
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shippingFee = 0;
    const coupon = AVAILABLE_COUPONS[String(body.couponCode || '').toUpperCase()];
    if (body.couponCode && !coupon) throw new Error('Mã ưu đãi không tồn tại trong dữ liệu mẫu.');
    if (coupon && subtotal < (coupon.minOrder || 0)) throw new Error('Đơn mẫu chưa đủ điều kiện áp dụng mã.');
    const discount = !coupon ? 0 : coupon.type === 'percentage' ? Math.min(Math.round(subtotal * coupon.value / 100), coupon.maxDiscount || subtotal)
      : coupon.type === 'shipping' ? Math.min(coupon.value, shippingFee) : Math.min(coupon.value, subtotal);
    const record = { ...body, items, userId: previewBackend.auth.currentUser.uid, subtotal, shippingFee, discountAmount: discount,
      total: subtotal + shippingFee - discount, status: 'pending', paymentStatus: 'unpaid', preview: true,
      createdAt: sdk.serverTimestamp(), updatedAt: sdk.serverTimestamp(), source: 'local-preview', s3SyncStatus: 'disabled' };
    const result = await sdk.addDoc(sdk.collection('orders'), record);
    await sdk.updateDoc(result, { id: result.id });
    return { success: true, orderId: result.id, ...record, discount };
  }
  if (/^\/admin\/orders\/[^/]+\/transition$/.test(path) && method === 'POST') {
    await sdk.updateDoc(sdk.doc('orders', decodeURIComponent(path.split('/')[3])), { status: body.targetStatus });
    return { success: true, preview: true };
  }
  if (path.startsWith('/orders/') && method === 'PATCH') {
    await sdk.updateDoc(sdk.doc('orders', decodeURIComponent(path.split('/')[2])), { status: 'cancelled' }); return { ok: true, preview: true };
  }
  if (path === '/admin/audit-logs') return { logs: (await sdk.getDocs(sdk.collection('auditLogs'))).docs.map(d => ({ id: d.id, ...d.data() })) };
  if (path === '/admin/staff') return { staff: [seed['users/preview-admin']] };
  if (path.includes('/resync-s3')) throw new Error('Bản xem giao diện không đồng bộ sang phần mềm bán hàng thật.');
  if (method === 'GET') return { items: [], preview: true };
  throw new Error('Thao tác này cần backend mới; bản xem giao diện chưa gửi yêu cầu ra ngoài.');
}
