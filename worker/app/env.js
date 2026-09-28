import { ApiError } from './errors.js';

export function requiredFirebaseEnv(env) {
  for (const key of ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY']) {
    if (!env[key]) {
      throw new ApiError(
        503,
        'server_not_configured',
        'Hệ thống đặt hàng đang được bảo trì. Vui lòng thử lại sau ít phút.'
      );
    }
  }
}
