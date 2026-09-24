import ProductsPage from './pages/ProductsPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SkinAnalysisPage from './pages/SkinAnalysisPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AciePage from './pages/AciePage.jsx';
import CompliancePage from './pages/CompliancePage.jsx';

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/profile' || path === '/profile.html') return <ProfilePage />;
  if (path === '/skin-analysis' || path === '/skin-analysis.html') return <SkinAnalysisPage />;
  if (path === '/admin') return <AdminPage />;
  if (path === '/acie' || path === '/acie.html' || path === '/acie-vision') return <AciePage />;
  if (path === '/tra-cuu-cong-bo' || path === '/compliance' || path === '/kiem-chung') return <CompliancePage />;
  if (path === '/products') return <ProductsPage />;
  return <HomePage />;
}

