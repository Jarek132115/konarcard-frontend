import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './styling/home.css';
import './styling/fonts.css';
import './styling/myprofile.css';
import './styling/login.css';
import './styling/navbar.css';
import './styling/footer.css';
import './styling/buttons.css';
import './styling/product.css';
import './styling/policies.css';
import './styling/success.css';
import './styling/sidebar.css';
import './styling/profile.css';
import './styling/nfccards.css';
import './styling/notification.css';
import './styling/subscription.css';
import './styling/helpcentreinterface.css';
import './styling/contactus.css';
import './styling/userpage.css';
import './styling/shareprofile.css';
import './styling/contactinterface.css';
import './styling/nfccard.css';

import App from './App.jsx';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <App />
      </Router>
    </QueryClientProvider>
  </StrictMode>
);

// OPTIONAL: if you’re not using a PWA SW, ensure none is registered
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()));
}
