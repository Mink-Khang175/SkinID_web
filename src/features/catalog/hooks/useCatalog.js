import { useState, useEffect } from 'react';
import { getAvailableProducts } from '../services/catalogService.js';

/**
 * React hook to access the product catalog with reactive updates.
 * Listens for catalog-ready events from both local and remote loaders.
 */
export function useCatalog() {
  const [products, setProducts] = useState(() => getAvailableProducts());
  const [isReady, setIsReady] = useState(() => products.length > 0);

  useEffect(() => {
    const update = () => {
      const current = getAvailableProducts();
      if (current.length > 0) {
        setProducts(current);
        setIsReady(true);
      }
    };

    update();
    const interval = setInterval(() => {
      const current = getAvailableProducts();
      if (current.length > 0) {
        setProducts(current);
        setIsReady(true);
        clearInterval(interval);
      }
    }, 150);

    document.addEventListener('skinid:ready', update);
    document.addEventListener('skinid:catalog-ready', update);

    return () => {
      clearInterval(interval);
      document.removeEventListener('skinid:ready', update);
      document.removeEventListener('skinid:catalog-ready', update);
    };
  }, []);

  return {
    products,
    isReady,
    totalCount: products.length
  };
}
