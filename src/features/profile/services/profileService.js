/**
 * Service to manage user profile and address data in Firestore.
 */

export async function updateUserProfile(profileData) {
  if (typeof window !== 'undefined' && window.authManager?.updateProfile) {
    return window.authManager.updateProfile(profileData);
  }
  throw new Error('Hệ thống xác thực chưa sẵn sàng.');
}

export async function uploadAvatar(file) {
  if (typeof window !== 'undefined' && window.authManager?.updateProfilePicture) {
    return window.authManager.updateProfilePicture(file);
  }
  throw new Error('Hệ thống cập nhật ảnh đại diện chưa sẵn sàng.');
}

export async function fetchUserOrders() {
  if (typeof window !== 'undefined' && window.authManager?.loadOrders) {
    return window.authManager.loadOrders();
  }
  return [];
}

export async function fetchUserSkinReports() {
  if (typeof window !== 'undefined' && window.authManager?.loadHistory) {
    return window.authManager.loadHistory();
  }
  return [];
}
