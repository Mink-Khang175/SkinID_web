export default function MobileNav() {
  return (
    <>
<nav className="mobile-nav" aria-label="Điều hướng nhanh"><a href="/#top"><i data-feather="home"></i><span>Trang chủ</span></a><a href="/#catalog"><i data-feather="grid"></i><span>Sản phẩm</span></a><a href="/skin-analysis"><i data-feather="camera"></i><span>Soi da</span></a><button type="button" onClick={(event) => window.cartManager?.toggleCartUI?.()}><i data-feather="shopping-bag"></i><span>Giỏ hàng</span><b id="mobile-cart-badge" className="opacity-0">0</b></button></nav>
    </>
  );
}
