/**
 * Service to manage Admin Operations (Firestore collections, users, orders).
 */

export async function fetchAdminStats() {
  if (typeof window !== 'undefined' && window.authManager?.apiRequest) {
    try {
      const usersRes = await window.authManager.apiRequest('/admin/users', { method: 'GET' }).catch(() => ({ users: [] }));
      const ordersRes = await window.authManager.apiRequest('/admin/orders', { method: 'GET' }).catch(() => ({ orders: [] }));
      return {
        userCount: usersRes.users?.length || 0,
        orderCount: ordersRes.orders?.length || 0
      };
    } catch {
      return { userCount: 0, orderCount: 0 };
    }
  }
  return { userCount: 0, orderCount: 0 };
}

export async function deleteUserAccount(userId) {
  if (typeof window !== 'undefined' && window.authManager?.apiRequest) {
    return window.authManager.apiRequest(`/admin/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    });
  }
  throw new Error('Chưa đăng nhập quyền quản trị.');
}
