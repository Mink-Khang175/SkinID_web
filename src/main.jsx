import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './assets/index.js';
import './styles/site.css';
import './styles/soft-storefront.css';
import './styles/navigation-drawer.css';

window.trackSkinIDEvent = function trackSkinIDEvent(eventName, eventParams = {}) {
  console.log(`[Analytics Event] ${eventName}:`, eventParams);
  if (typeof window.gtag === 'function') window.gtag('event', eventName, eventParams);
  if (typeof window.fbq === 'function') window.fbq('trackCustom', eventName, eventParams);
};

createRoot(document.getElementById('root')).render(<App />);
