import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getProductById } from '../../catalog/services/catalogService.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Sync state from window.cartManager
  const syncFromCartManager = useCallback(() => {
    if (typeof window !== 'undefined' && window.cartManager) {
      const currentItems = window.cartManager.items || [];
      setItems([...currentItems]);
    }
  }, []);

  useEffect(() => {
    syncFromCartManager();
    const interval = setInterval(syncFromCartManager, 300);

    const handleReady = () => syncFromCartManager();
    document.addEventListener('skinid:ready', handleReady);
    document.addEventListener('skinid:auth-changed', handleReady);

    return () => {
      clearInterval(interval);
      document.removeEventListener('skinid:ready', handleReady);
      document.removeEventListener('skinid:auth-changed', handleReady);
    };
  }, [syncFromCartManager]);

  const addToCart = useCallback((productId, quantity = 1) => {
    if (typeof window !== 'undefined') {
      if (typeof window.addToCart === 'function') {
        window.addToCart(productId);
      } else if (window.cartManager?.addItem) {
        window.cartManager.addItem(productId, quantity);
        if (typeof window.showToast === 'function') {
          window.showToast('Đã thêm sản phẩm vào giỏ hàng!');
        }
      }
    }
    syncFromCartManager();
  }, [syncFromCartManager]);

  const removeItem = useCallback((productId) => {
    if (typeof window !== 'undefined' && window.cartManager?.removeItem) {
      window.cartManager.removeItem(productId);
    }
    syncFromCartManager();
  }, [syncFromCartManager]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (typeof window !== 'undefined' && window.cartManager?.updateQuantity) {
      window.cartManager.updateQuantity(productId, quantity);
    }
    syncFromCartManager();
  }, [syncFromCartManager]);

  const clearCart = useCallback(() => {
    if (typeof window !== 'undefined' && window.cartManager?.clearCart) {
      window.cartManager.clearCart();
    }
    setItems([]);
  }, []);

  const openCart = useCallback(() => {
    if (typeof window !== 'undefined' && window.cartManager?.toggleCartUI) {
      window.cartManager.toggleCartUI(true);
    }
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    if (typeof window !== 'undefined' && window.cartManager?.toggleCartUI) {
      window.cartManager.toggleCartUI(false);
    }
    setIsOpen(false);
  }, []);

  const toggleCart = useCallback(() => {
    if (typeof window !== 'undefined' && window.cartManager?.toggleCartUI) {
      window.cartManager.toggleCartUI();
    }
    setIsOpen((prev) => !prev);
  }, []);

  const openCheckout = useCallback(() => {
    if (typeof window !== 'undefined' && window.cartManager?.openCheckout) {
      window.cartManager.openCheckout();
    }
  }, []);

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const prod = getProductById(item.productId);
      return sum + (prod ? prod.price * item.quantity : 0);
    }, 0);
  }, [items]);

  const value = useMemo(() => ({
    items,
    totalItems,
    subtotal,
    isOpen,
    addToCart,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    openCheckout
  }), [items, totalItems, subtotal, isOpen, addToCart, removeItem, updateQuantity, clearCart, openCart, closeCart, toggleCart, openCheckout]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    // Graceful fallback for components rendered outside provider
    return {
      items: [],
      totalItems: 0,
      subtotal: 0,
      isOpen: false,
      addToCart: (id, qty = 1) => window.cartManager?.addItem?.(id, qty),
      removeItem: (id) => window.cartManager?.removeItem?.(id),
      updateQuantity: (id, qty) => window.cartManager?.updateQuantity?.(id, qty),
      clearCart: () => window.cartManager?.clearCart?.(),
      openCart: () => window.cartManager?.toggleCartUI?.(true),
      closeCart: () => window.cartManager?.toggleCartUI?.(false),
      toggleCart: () => window.cartManager?.toggleCartUI?.(),
      openCheckout: () => window.cartManager?.openCheckout?.()
    };
  }
  return context;
}
