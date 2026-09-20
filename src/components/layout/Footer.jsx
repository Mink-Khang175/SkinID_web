import { assetUrl } from '../../assets/index.js';

export default function Footer() {
  return (
    <>
<footer className="site-footer"><div className="container"><div className="footer-grid"><div><a className="brand footer-brand" href="/#top"><img src={assetUrl('/images/logo.png')} alt="" /><span><b>SkinID</b><em>.vn</em></span></a><p>Dược mỹ phẩm và sản phẩm chăm sóc cá nhân chính hãng, thông tin rõ ràng, dễ lựa chọn.</p></div><div><h3>Mua sắm</h3><a href="/#catalog">Tất cả sản phẩm</a><a href="/#categories">Danh mục</a><a href="/#brands">Thương hiệu</a><button type="button" onClick={(event) => window?.openConsultation?.()}>Tư vấn sản phẩm</button></div><div><h3>Hỗ trợ</h3><button type="button" onClick={(event) => window?.openPolicy?.('shipping')}>Giao hàng & đổi trả</button><button type="button" onClick={(event) => window?.openPolicy?.('privacy')}>Bảo mật dữ liệu</button><button type="button" onClick={(event) => window?.openPolicy?.('terms')}>Điều khoản sử dụng</button><a href="https://zalo.me/0924093461">Liên hệ Zalo</a></div><div><h3>CÔNG TY TNHH FIELDMAN</h3><span>MST: 0319200638</span><span>35 đường số 3, Phường Tân Mỹ, TP. Hồ Chí Minh</span><a href="tel:+84924093461">0924.093.461</a><span>08:00–21:00 · Thứ 2–Chủ nhật</span></div></div><div className="footer-bottom">© 2026 SkinID.vn. Sản phẩm chăm sóc da không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.</div></div></footer>
    </>
  );
}
