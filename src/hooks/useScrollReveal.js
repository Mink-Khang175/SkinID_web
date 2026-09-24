import { useEffect } from 'react';

export default function useScrollReveal(rootRef) {
  useEffect(() => {
    const root = rootRef?.current;
    if (!root) return undefined;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const revealImmediately = (element) => element.classList.add('is-revealed');

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      root.querySelectorAll('[data-reveal]').forEach(revealImmediately);
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    });

    const observe = (element) => {
      if (!(element instanceof HTMLElement) || element.dataset.revealBound === 'true') return;
      element.dataset.revealBound = 'true';
      const delay = Number(element.dataset.revealDelay || 0);
      element.style.setProperty('--reveal-delay', `${Math.max(0, delay)}ms`);
      observer.observe(element);
    };

    root.querySelectorAll('[data-reveal]').forEach(observe);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches('[data-reveal]')) observe(node);
        node.querySelectorAll?.('[data-reveal]').forEach(observe);
      }));
    });
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [rootRef]);
}
