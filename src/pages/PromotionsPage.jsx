import StorefrontPage from '../components/layout/StorefrontPage.jsx';
import PromotionsLanding from '../components/commerce/PromotionsLanding.jsx';
import usePageMetadata from '../hooks/usePageMetadata.js';

export default function PromotionsPage() {
  usePageMetadata({ title: 'Ưu đãi & Bộ quà tặng — SkinID.vn', description: 'Ưu đãi tại cửa hàng: combo quà tặng và chương trình giảm 50% TWON, D’VAH. Không áp dụng cho đơn online.' });
  return <StorefrontPage><div className="promotions-page"><nav className="catalog-breadcrumb" aria-label="Đường dẫn"><a href="/">Trang chủ</a><span aria-hidden="true">/</span><span>Ưu đãi & Bộ quà tặng</span></nav><PromotionsLanding /></div></StorefrontPage>;
}
