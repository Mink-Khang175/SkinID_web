import { assetUrl } from '../../assets/index.js';

export default function Header() {
  const isHomePage = window.location.pathname === '/';
  const isAnalysisPage = window.location.pathname.startsWith('/skin-analysis');

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
            <a className={isHomePage ? 'is-active' : ''} href="/#featured-products" data-nav-step="all" aria-current={isHomePage ? 'page' : undefined}>Tất cả sản phẩm</a>
            <a href="/#catalog" data-nav-step="cleanser">Làm sạch</a>
            <a href="/#catalog" data-nav-step="treatment">Tinh chất & đặc trị</a>
            <a href="/#catalog" data-nav-step="moisturizer">Dưỡng ẩm</a>
            <a href="/#catalog" data-nav-step="sunscreen">Chống nắng</a>
            <a href="/#brands">Thương hiệu</a>
            <a href="/#acie-teaser" className="acie-header-link font-bold text-[#E85D75] hover:text-rose-700 transition-colors inline-flex items-center gap-1.5">
              <span>SKINID x ACIE VISION</span>
              <span className="text-[9px] bg-rose-100 text-[#E85D75] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Mới</span>
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
        <a href="/#brands" onClick={() => window?.toggleMobileMenu?.(false)}>Thương hiệu</a>
        <a href="/#acie-teaser" className="text-[#E85D75] font-bold flex items-center justify-between" onClick={() => window?.toggleMobileMenu?.(false)}>
          <span>SKINID x ACIE VISION</span>
          <span className="text-[9px] bg-rose-100 text-[#E85D75] px-1.5 py-0.5 rounded-full font-bold">Mới</span>
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
