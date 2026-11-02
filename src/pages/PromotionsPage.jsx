import StorefrontPage from '../components/layout/StorefrontPage.jsx';
import PromotionCollection from '../components/commerce/PromotionCollection.jsx';
import usePageMetadata from '../hooks/usePageMetadata.js';

export default function PromotionsPage() {
  usePageMetadata({ title: 'Ưu đãi & Bộ quà tặng — SkinID.vn', description: 'Khám phá bộ quà tặng TWON, D’VAH và mã ưu đãi dành cho bạn tại SkinID.' });
  return <StorefrontPage><div className="promotions-page"><nav className="catalog-breadcrumb" aria-label="Đường dẫn"><a href="/">Trang chủ</a><span aria-hidden="true">/</span><span>Ưu đãi & Bộ quà tặng</span></nav><PromotionCollection full /></div></StorefrontPage>;
}
