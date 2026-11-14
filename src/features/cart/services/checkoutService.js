import { apiRequest } from '../../../infrastructure/http/apiClient.js';
import { auth } from '../../../infrastructure/firebase/index.js';

import { saveCachedOrder } from './orderCacheService.js';

export const FREE_SHIPPING_THRESHOLD = 0;
export const STANDARD_SHIPPING_FEE = 0;

export function calculateShippingFee() {
  return 0;
}

export async function createOrder({ items, customer, note = '', paymentMethod = 'cod', couponCode = '', idempotencyKey }) {
  const resolvedIdempotencyKey = idempotencyKey || ('idemp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10));

  try {
    const response = await apiRequest('/orders', {
      method: 'POST',
      headers: { 'Idempotency-Key': resolvedIdempotencyKey },
      body: JSON.stringify({
        customer,
        note: String(note || '').trim(),
        paymentMethod,
        couponCode: String(couponCode || '').trim().toUpperCase(),
        items: (items || []).map(item => ({
          productId: item.productId || item.sku || item.id,
          quantity: Math.max(1, Math.trunc(Number(item.quantity) || 1))
        }))
      })
    });

    if (response?.orderId) {
      const user = auth.currentUser;
      if (user?.uid) {
        saveCachedOrder(user.uid, {
          id: response.orderId,
          orderId: response.orderId,
          userId: user.uid,
          customer,
          items,
          note,
          subtotal: response.subtotal,
          discountAmount: response.discount,
          shippingFee: response.shippingFee,
          total: response.total,
          paymentMethod,
          paymentStatus: response.paymentStatus || (paymentMethod === 'cod' ? 'unpaid' : 'pending_transfer'),
          status: response.status || 'pending',
          s3SyncStatus: response.s3SyncStatus || 'pending',
          createdAt: new Date().toISOString()
        });
      }
    }

    return response;
  } catch (workerError) {
    console.error('[SkinID Checkout] Server order creation error:', workerError.message);
    throw workerError;
  }
}
