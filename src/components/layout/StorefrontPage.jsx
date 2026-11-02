import Header from './Header.jsx';
import Footer from './Footer.jsx';
import OfferBar from './OfferBar.jsx';
import MobileNav from './MobileNav.jsx';
import StorefrontModals from '../dialogs/StorefrontModals.jsx';
import ProductDetailModal from '../../features/catalog/ProductDetailModal.jsx';
import '../../styles/storefront-updates.css';

export default function StorefrontPage({ children }) {
  return <><OfferBar /><Header /><div className="skinid-content-page ambient-page-canvas"><main className="storefront-updates container">{children}</main></div><Footer /><MobileNav /><StorefrontModals /><ProductDetailModal /></>;
}
