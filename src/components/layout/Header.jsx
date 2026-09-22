import { useState, useEffect } from 'react';
import { assetUrl } from '../../assets/index.js';

export default function Header() {
  const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';
  const isAnalysisPage = window.location.pathname.startsWith('/skin-analysis');
  const isAciePage = window.location.pathname.startsWith('/acie');

  const [activeItem, setActiveItem] = useState(() => {
    if (isAciePage) return 'acie';
    if (isAnalysisPage) return 'analysis';
    if (!isHomePage) return '';
    if (typeof window !== 'undefined') {
      const step = new URLSearchParams(window.location.search).get('step');
      if (step) return step;
      if (window.location.hash === '#brands') return 'brands';
      if (window.location.hash === '#acie-teaser') return 'acie-teaser';
    }
    return 'all';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      const hash = window.location.hash;
      const step = new URLSearchParams(window.location.search).get('step');
      if (step && typeof window.filterByStep === 'function') {
        window.filterByStep(step);
      }
      if (hash) {
        const targetId = hash.replace('#', '');
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      } else if (isHomePage && !window.location.search) {
        window.scrollTo(0, 0);
      }
    }

    const handleSync = (e) => {
      if (e.detail) {
        setActiveItem(e.detail);
        if (typeof document !== 'undefined') {
          document.querySelectorAll('.desktop-nav a').forEach((a) => {
            const itemKey = a.dataset.navStep || a.dataset.navTarget;
            a.classList.toggle('is-active', itemKey === e.detail);
          });
        }
      }
    };
    window.addEventListener('skinid:nav-sync', handleSync);

    const prevSync = window.syncPrimaryNavigation;
    window.syncPrimaryNavigation = (stepOrTarget = 'all') => {
      setActiveItem(stepOrTarget);
      if (typeof document !== 'undefined') {
        document.querySelectorAll('.desktop-nav a').forEach((a) => {
          const itemKey = a.dataset.navStep || a.dataset.navTarget;
          a.classList.toggle('is-active', itemKey === stepOrTarget);
        });
      }
      if (typeof prevSync === 'function') {
        try { prevSync(stepOrTarget); } catch (_) {}
      }
    };

    return () => {
      window.removeEventListener('skinid:nav-sync', handleSync);
    };
  }, [isHomePage]);

  const handleNavClick = (key, targetId = null, stepType = null) => {
    setActiveItem(key);
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.desktop-nav a').forEach((a) => {
        const itemKey = a.dataset.navStep || a.dataset.navTarget;
        a.classList.toggle('is-active', itemKey === key);
      });
    }
    if (!isHomePage) {
      if (stepType) {
        window.location.href = `/?step=${stepType}#catalog`;
      } else if (targetId) {
        window.location.href = `/#${targetId}`;
      } else {
        window.location.href = '/';
      }
      return;
    }

    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.syncPrimaryNavigation?.(key);
    } else if (stepType) {
      window.filterByStep?.(stepType);
      const catalogEl = document.getElementById('catalog') || document.getElementById('featured-products');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.syncPrimaryNavigation?.(key);
    } else {
      window.syncPrimaryNavigation?.(key);
    }
  };

  return (
    <header className="site-header">
      <div className="container header-main">
        <a className="brand" href="/#top" aria-label="SkinID.vn — Trang chủ">
          <img src={assetUrl('/images/logo.png')} alt="" />
          <span><b>SkinID</b><em>.vn</em></span>
        </a>

        <label className="header-search">
          <i data-feather="search"></i>
          <input
            type="search"
            placeholder="Bạn đang tìm sản phẩm gì?"
            aria-label="Tìm kiếm nhanh"
            onInput={(event) => window?.handleHeaderSearch?.(event.currentTarget.value, false)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') window.handleHeaderSearch?.(event.currentTarget.value, true);
            }}
          />
        </label>

        <div className="header-actions">
          <a className="support-link" href="https://zalo.me/0924093461" target="_blank" rel="noopener">
            <i data-feather="message-circle"></i>
            <span>Tư vấn<br /><b>0924.093.461</b></span>
          </a>
          <button className="icon-btn header-account" type="button" aria-label="Tài khoản" onClick={() => {
            if (window.authManager?.getCurrentUser?.()) window.location.href = '/profile';
            else window.authManager?.openAuthModal?.();
          }}><i data-feather="user"></i></button>
          <button className="icon-btn cart-button" type="button" onClick={() => window.cartManager?.toggleCartUI?.()} aria-label="Mở giỏ hàng">
            <i data-feather="shopping-bag"></i><span id="cart-badge" className="opacity-0">0</span>
          </button>
          <button className="icon-btn mobile-menu-btn" type="button" onClick={() => window?.toggleMobileMenu?.()} aria-label="Mở menu">
            <i data-feather="menu"></i>
          </button>
        </div>
      </div>

      <div className="nav-line">
        <div className="container nav-inner">
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            <a
              className={activeItem === 'all' ? 'is-active' : ''}
              href="/#featured-products"
              data-nav-step="all"
              aria-current={activeItem === 'all' ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('all', 'featured-products');
              }}
            >
              Tất cả sản phẩm
            </a>
            <a
              className={activeItem === 'cleanser' ? 'is-active' : ''}
              href="/#catalog"
              data-nav-step="cleanser"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('cleanser', null, 'cleanser');
              }}
            >
              Làm sạch
            </a>
            <a
              className={activeItem === 'treatment' ? 'is-active' : ''}
              href="/#catalog"
              data-nav-step="treatment"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('treatment', null, 'treatment');
              }}
            >
              Tinh chất & đặc trị
            </a>
            <a
              className={activeItem === 'moisturizer' ? 'is-active' : ''}
              href="/#catalog"
              data-nav-step="moisturizer"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('moisturizer', null, 'moisturizer');
              }}
            >
              Dưỡng ẩm
            </a>
            <a
              className={activeItem === 'sunscreen' ? 'is-active' : ''}
              href="/#catalog"
              data-nav-step="sunscreen"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('sunscreen', null, 'sunscreen');
              }}
            >
              Chống nắng
            </a>
            <a
              className={activeItem === 'brands' ? 'is-active' : ''}
              href="/#brands"
              data-nav-target="brands"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('brands', 'brands');
              }}
            >
              Thương hiệu
            </a>
            <a
              href="/acie"
              data-nav-target="acie"
              className={`acie-header-link inline-flex items-center gap-1.5 font-medium transition-colors ${isAciePage || activeItem === 'acie' ? 'is-active' : ''}`}
            >
              <span>SKINID x ACIE VISION</span>
              <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Mới</span>
            </a>
          </nav>
          <a className={`skin-tool-link${isAnalysisPage ? ' is-active' : ''}`} href="/skin-analysis" aria-current={isAnalysisPage ? 'page' : undefined}>
            <i data-feather="camera"></i> Soi da AI
          </a>
        </div>
      </div>

      <nav id="mobile-menu" className="mobile-menu hidden" aria-label="Điều hướng di động">
        <a href="/#featured-products" data-nav-step="all" onClick={() => window?.toggleMobileMenu?.(false)}>Tất cả sản phẩm</a>
        <a href="/#categories" onClick={() => window?.toggleMobileMenu?.(false)}>Danh mục</a>
        <a href="/#brands" data-nav-target="brands" onClick={(e) => {
          window?.toggleMobileMenu?.(false);
          const el = document.getElementById('brands');
          if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); window.syncPrimaryNavigation?.('brands'); }
        }}>Thương hiệu</a>
        <a href="/acie" data-nav-target="acie" className={`font-semibold flex items-center justify-between ${isAciePage ? 'text-rose-600' : 'text-gray-800'}`} onClick={() => window?.toggleMobileMenu?.(false)}>
          <span>SKINID x ACIE VISION</span>
          <span className="text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full font-bold">Mới</span>
        </a>
        <a href="/skin-analysis" onClick={() => window?.toggleMobileMenu?.(false)}>Soi da AI</a>
        <button type="button" onClick={() => {
          window?.toggleMobileMenu?.(false);
          if (window.authManager?.getCurrentUser?.()) window.location.href = '/profile';
          else window.authManager?.openAuthModal?.();
        }}>Tài khoản / Đơn hàng</button>
        <button id="mobile-logout-button" type="button" className="text-rose-600 font-bold hidden text-left" onClick={() => {
          window?.toggleMobileMenu?.(false);
          window.authManager?.logout?.().then(() => { window.location.href = '/'; });
        }}>Đăng xuất</button>
      </nav>
    </header>
  );
}
