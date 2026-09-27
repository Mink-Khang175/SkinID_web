import ProductsPage from './pages/ProductsPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SkinAnalysisPage from './pages/SkinAnalysisPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AciePage from './pages/AciePage.jsx';
import CompliancePage from './pages/CompliancePage.jsx';
import { CartProvider } from './features/cart/index.js';

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  let content = <HomePage />;
  if (path === '/profile' || path === '/profile.html') content = <ProfilePage />;
  else if (path === '/skin-analysis' || path === '/skin-analysis.html') content = <SkinAnalysisPage />;
  else if (path === '/admin') content = <AdminPage />;
  else if (path === '/acie' || path === '/acie.html' || path === '/acie-vision') content = <AciePage />;
  else if (path === '/tra-cuu-cong-bo' || path === '/compliance' || path === '/kiem-chung') content = <CompliancePage />;
  else if (path === '/products') content = <ProductsPage />;

  return <CartProvider>{content}</CartProvider>;
}

