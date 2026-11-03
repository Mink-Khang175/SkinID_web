import StorefrontPage from '../components/layout/StorefrontPage.jsx';
import PromotionsLanding from '../components/commerce/PromotionsLanding.jsx';
import usePageMetadata from '../hooks/usePageMetadata.js';

export default function PromotionsPage() {
  usePageMetadata({ title: 'Ưu đãi & Bộ quà tặng — SkinID.vn', description: 'Like & share săn deal giảm đến 50% sản phẩm TWON, D’VAH và khám phá bộ quà tặng tại SkinID.' });
  return <StorefrontPage><div className="promotions-page"><nav className="catalog-breadcrumb" aria-label="Đường dẫn"><a href="/">Trang chủ</a><span aria-hidden="true">/</span><span>Ưu đãi & Bộ quà tặng</span></nav><PromotionsLanding /></div></StorefrontPage>;
}
