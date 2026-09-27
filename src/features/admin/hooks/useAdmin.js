import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/index.js';
import { fetchAdminStats, deleteUserAccount } from '../services/adminService.js';

/**
 * Hook to manage Admin Dashboard data and actions.
 */
export function useAdmin() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({ userCount: 0, orderCount: 0, productCount: 0 });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const data = await fetchAdminStats();
      const productCount = Array.isArray(window.PRODUCTS) ? window.PRODUCTS.length : (window.LOCAL_PRODUCTS?.length || 55);
      setStats({ ...data, productCount });
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin, loadStats]);

  return {
    user,
    isAdmin,
    authLoading,
    stats,
    loading,
    refreshStats: loadStats,
    deleteUserAccount
  };
}
