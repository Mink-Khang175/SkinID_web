import { useState, useCallback } from 'react';
import { useAuth } from '../../auth/index.js';
import { updateUserProfile, uploadAvatar, fetchUserOrders, fetchUserSkinReports } from '../services/profileService.js';

/**
 * Hook to manage profile editing state and history tabs.
 */
export function useProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const saveProfile = useCallback(async (data) => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await updateUserProfile(data);
      return result;
    } catch (err) {
      setError(err.message || 'Không thể lưu hồ sơ.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const changeAvatar = useCallback(async (file) => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await uploadAvatar(file);
      return result;
    } catch (err) {
      setError(err.message || 'Không thể cập nhật ảnh.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    isSaving,
    error,
    saveProfile,
    changeAvatar,
    fetchUserOrders,
    fetchUserSkinReports
  };
}
