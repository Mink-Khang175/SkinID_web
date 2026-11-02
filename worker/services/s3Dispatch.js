import { commitWrites, documentName, encodeFields, getDocument } from '../firestore.js';
import { getS3Config, requiredFirebaseEnv } from '../app/env.js';
import { syncOrderToS3 as sendToPos } from './s3Service.js';

// Durable dispatch record prevents concurrent/repeated POS order creation.
// Unknown outcomes stay blocked for reconciliation; a timeout is not proof of failure.
export async function dispatchS3({ orderId, order, env, timeoutMs, send = sendToPos, store }) {
  if (!getS3Config(env).enabled) return { success: false, skipped: true, s3SyncStatus: 'disabled' };
  if (!orderId) throw new Error('Thiếu mã đơn hàng.');
  if (!store) requiredFirebaseEnv(env);
  const path = `integrationOutbox/s3_${orderId}`;
  const db = store || {
    get: () => getDocument(env, path),
    put: (value, version) => commitWrites(env, [{
      update: { name: documentName(env, path), fields: encodeFields(value) },
      currentDocument: version ? { updateTime: version } : { exists: false }
    }]),
    finish: value => commitWrites(env, [{
      update: { name: documentName(env, path), fields: encodeFields(value) }
    }])
  };
  const previous = await db.get();
  if (previous?.state === 'completed') return { success: true, alreadySynced: true, s3SyncStatus: 'synced', s3OrderId: previous.s3OrderId };
  if (['processing', 'needs_review'].includes(previous?.state)) return { success: false, s3SyncStatus: 'needs_review', error: 'Đơn đang gửi hoặc chưa rõ kết quả POS. Cần đối soát trước khi gửi lại.' };
  const record = { orderId, state: 'processing', attempts: Number(previous?.attempts || 0) + 1, updatedAt: new Date() };
  try { await db.put(record, previous?._updateTime); }
  catch { return { success: false, s3SyncStatus: 'pending', error: 'Đơn đã được tiến trình khác tiếp nhận hoặc chưa thể ghi nhật ký đồng bộ.' }; }
  let result;
  try { result = await send({ orderId, order, env, timeoutMs }); }
  catch { result = { success: false, needsReview: true, s3SyncStatus: 'needs_review', error: 'Chưa xác định được kết quả gửi POS.' }; }
  try {
    await db.finish({ ...record, state: result.success ? 'completed' : result.needsReview ? 'needs_review' : 'retryable',
      ...(result.s3OrderId ? { s3OrderId: result.s3OrderId } : {}), updatedAt: new Date() });
  } catch {
    // Keep the processing lock; never risk a second external order.
    return { success: false, s3SyncStatus: 'needs_review', error: 'Cần đối soát POS vì chưa ghi được kết quả đồng bộ.' };
  }
  return result;
}

export const syncOrderToS3 = dispatchS3;
