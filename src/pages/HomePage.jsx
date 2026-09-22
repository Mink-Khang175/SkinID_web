import SkincareRoutine from '../components/analysis/SkincareRoutine.jsx';
import ProductDetailModal from '../components/dialogs/ProductDetailModal.jsx';
import StorefrontModals from '../components/dialogs/StorefrontModals.jsx';
import AcieTeaser from '../components/home/AcieTeaser.jsx';
import BrandBar from '../components/home/BrandBar.jsx';
import BrandShowcase from '../components/home/BrandShowcase.jsx';
import CategorySection from '../components/home/CategorySection.jsx';
import HelpSection from '../components/home/HelpSection.jsx';
import HeroBanner from '../components/home/HeroBanner.jsx';
import ProductList from '../components/home/ProductList.jsx';
import TrustBenefits from '../components/home/TrustBenefits.jsx';
import Footer from '../components/layout/Footer.jsx';
import Header from '../components/layout/Header.jsx';
import MobileNav from '../components/layout/MobileNav.jsx';
import OfferBar from '../components/layout/OfferBar.jsx';
import useLegacyApplication from '../hooks/useLegacyApplication.js';
import usePageMetadata from '../hooks/usePageMetadata.js';

export default function HomePage() {
  usePageMetadata({
    title: 'SkinID.vn — Phân tích da AI & Dược mỹ phẩm Chính Hãng',
    description: 'Nền tảng phân tích da AI và mua dược mỹ phẩm Rilastil, chăm sóc cơ thể TWON và nước hoa D\'VAH chính hãng tại SkinID.vn.'
  });
  useLegacyApplication('home');

  return (
    <>
      <OfferBar />
      <Header />
      <main id="top">
        <HeroBanner />
        <BrandBar />
        <CategorySection />
        <ProductList />
        <HelpSection />
        <BrandShowcase />
        <AcieTeaser />
        <TrustBenefits />
      </main>
      <Footer />
      <MobileNav />
      <StorefrontModals />
      <ProductDetailModal />
      <SkincareRoutine />
    </>
  );
}
