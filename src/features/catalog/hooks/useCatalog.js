import { useEffect, useState } from 'react';
import { loadProductCatalog, refreshProductCatalog } from '../services/catalogRepository.js';
import { getAvailableProducts } from '../services/catalogService.js';

export function useCatalog() {
  const [state, setState] = useState({ products: [], isReady: false, error: null });

  useEffect(() => {
    let active = true;
    const onCatalogUpdated = () => {
      if (active) setState({ products: getAvailableProducts(), isReady: true, error: null });
    };
    window.addEventListener('skinid:catalog-updated', onCatalogUpdated);
    loadProductCatalog()
      .then((products) => {
        if (active) setState({ products, isReady: true, error: null });
        return refreshProductCatalog();
      })
      .then((products) => {
        if (active) setState({ products, isReady: true, error: null });
      })
      .catch((error) => {
        if (active) setState({ products: [], isReady: true, error });
      });
    return () => {
      active = false;
      window.removeEventListener('skinid:catalog-updated', onCatalogUpdated);
    };
  }, []);

  return {
    ...state,
    totalCount: state.products.length
  };
}
