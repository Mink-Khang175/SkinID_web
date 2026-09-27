import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (typeof window !== 'undefined' ? window.authManager?.getCurrentUser?.() || null : null));
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [orders, setOrders] = useState([]);

  const syncAuth = useCallback(() => {
    if (typeof window !== 'undefined' && window.authManager) {
      const current = window.authManager.getCurrentUser?.() || null;
      setUser(current);
      setHistory(window.authManager.history || []);
      setOrders(window.authManager.orders || []);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    syncAuth();

    // Check if SKINID_AUTH_READY is a promise
    if (typeof window !== 'undefined' && window.SKINID_AUTH_READY?.then) {
      window.SKINID_AUTH_READY.then(() => syncAuth());
    }

    const handleAuthChanged = (e) => {
      setUser(e.detail || null);
      if (typeof window !== 'undefined' && window.authManager) {
        setHistory(window.authManager.history || []);
        setOrders(window.authManager.orders || []);
      }
      setIsLoading(false);
    };

    const handleDataLoaded = (e) => {
      setUser(e.detail || null);
      if (typeof window !== 'undefined' && window.authManager) {
        setHistory(window.authManager.history || []);
        setOrders(window.authManager.orders || []);
      }
    };

    document.addEventListener('skinid:auth-changed', handleAuthChanged);
    document.addEventListener('skinid:data-loaded', handleDataLoaded);
    document.addEventListener('skinid:ready', syncAuth);

    return () => {
      document.removeEventListener('skinid:auth-changed', handleAuthChanged);
      document.removeEventListener('skinid:data-loaded', handleDataLoaded);
      document.removeEventListener('skinid:ready', syncAuth);
    };
  }, [syncAuth]);

  const loginWithEmail = useCallback(async (email, password) => {
    if (!window.authManager?.loginWithEmail) throw new Error('Auth manager chưa sẵn sàng');
    const result = await window.authManager.loginWithEmail(email, password);
    syncAuth();
    return result;
  }, [syncAuth]);

  const registerWithEmail = useCallback(async (email, password, displayName) => {
    if (!window.authManager?.registerWithEmail) throw new Error('Auth manager chưa sẵn sàng');
    const result = await window.authManager.registerWithEmail(email, password, displayName);
    syncAuth();
    return result;
  }, [syncAuth]);

  const loginWithGoogle = useCallback(async () => {
    if (!window.authManager?.loginWithGoogle) throw new Error('Auth manager chưa sẵn sàng');
    const result = await window.authManager.loginWithGoogle();
    syncAuth();
    return result;
  }, [syncAuth]);

  const logout = useCallback(async () => {
    if (window.authManager?.logout) {
      await window.authManager.logout();
    }
    setUser(null);
    setHistory([]);
    setOrders([]);
  }, []);

  const openAuthModal = useCallback((message) => {
    window.authManager?.openAuthModal?.(message);
  }, []);

  const closeAuthModal = useCallback(() => {
    window.authManager?.closeAuthModal?.();
  }, []);

  const updateProfile = useCallback(async (data) => {
    if (!window.authManager?.updateProfile) throw new Error('Auth manager chưa sẵn sàng');
    const updated = await window.authManager.updateProfile(data);
    syncAuth();
    return updated;
  }, [syncAuth]);

  const isAuthenticated = Boolean(user?.uid || user?.id);
  const isAdmin = Boolean(user?.isAdmin || user?.customClaims?.admin);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    history,
    orders,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    openAuthModal,
    closeAuthModal,
    updateProfile
  }), [user, isAuthenticated, isAdmin, isLoading, history, orders, loginWithEmail, registerWithEmail, loginWithGoogle, logout, openAuthModal, closeAuthModal, updateProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      history: [],
      orders: [],
      loginWithEmail: async () => {},
      registerWithEmail: async () => {},
      loginWithGoogle: async () => {},
      logout: async () => {},
      openAuthModal: () => {},
      closeAuthModal: () => {},
      updateProfile: async () => {}
    };
  }
  return context;
}
