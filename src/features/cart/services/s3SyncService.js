import { apiRequest } from '../../../infrastructure/http/apiClient.js';

// Admin-only retry. Initial checkout dispatch belongs to the backend.
export async function syncOrderToS3({ orderId }) {
  if (!orderId) throw new Error('Thiếu mã đơn hàng.');
  return apiRequest(`/admin/orders/${encodeURIComponent(orderId)}/resync-s3`, { method: 'POST' });
}
