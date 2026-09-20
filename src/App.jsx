import HomePage from './pages/HomePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SkinAnalysisPage from './pages/SkinAnalysisPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/profile' || path === '/profile.html') return <ProfilePage />;
  if (path === '/skin-analysis' || path === '/skin-analysis.html') return <SkinAnalysisPage />;
  if (path === '/admin') return <AdminPage />;
  return <HomePage />;
}
