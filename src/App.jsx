// App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { Toaster } from 'react-hot-toast';

import { AuthContext } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import TidioDelayedLoader from './components/TidioDelayedLoader';

// ===== EAGER (regular) imports — no lazy loading =====
import Home from './pages/website/Home';
import Register from './pages/website/Register';
import Login from './pages/website/Login';
import ResetPassword from './pages/website/ResetPassword';
import ProductAndPlan from './pages/website/ProductAndPlan';
import FAQ from './pages/website/FAQ';
import HelpCentre from './pages/website/HelpCentre';
import Reviews from './pages/website/Reviews';
import KonarCard from './pages/website/KonarCard';
import KonarSubscription from './pages/website/KonarSubscription';
import ContactUs from './pages/website/ContactUs';
import Policies from './pages/website/Policies';
import Success from './pages/website/Success';
import SuccessSubscription from './pages/website/SuccessSubscription';
import MyProfile from './pages/interface/MyProfile';
import MyOrders from './pages/interface/MyOrder';
import Billing from './pages/interface/Billing';
import HelpCentreInterface from './pages/interface/HelpCentreInterface';
import NFCCards from './pages/interface/NFCCards';
import Notifications from './pages/interface/Notifications';
import Profile from './pages/interface/Profile';
import ContactSupport from './pages/interface/ContactSupport';
import UserPage from './pages/interface/UserPage';

function TidioWrapper() {
  const location = useLocation();
  const isDashboardPath =
    location.pathname.startsWith('/myprofile') ||
    location.pathname.startsWith('/myorders') ||
    location.pathname.startsWith('/billing') ||
    location.pathname.startsWith('/helpcentreinterface') ||
    location.pathname.startsWith('/nfccards') ||
    location.pathname.startsWith('/notifications') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/contact-support');

  const enableTidio = !isDashboardPath || location.pathname === '/contact-support';
  return <TidioDelayedLoader enabled={enableTidio} delayMs={4000} />;
}

export default function App() {
  const { initialized, loading } = useContext(AuthContext);

  // Hard gate while auth bootstraps
  if (!initialized || loading) {
    return <div style={{ padding: 16 }}>Loading…</div>;
  }

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <ScrollToTop />
      <TidioWrapper />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/productandplan" element={<ProductAndPlan />} />
        <Route path="/productandplan/konarcard" element={<KonarCard />} />
        <Route path="/productandplan/konarsubscription" element={<KonarSubscription />} />
        <Route path="/whatisnfc" element={<KonarCard />} />
        <Route path="/subscription" element={<KonarSubscription />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/helpcentre" element={<HelpCentre />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/success" element={<Success />} />
        <Route path="/SuccessSubscription" element={<SuccessSubscription />} />
        <Route path="/successsubscription" element={<SuccessSubscription />} />
        <Route path="/u/:username" element={<UserPage />} />

        {/* Protected */}
        <Route path="/myprofile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
        <Route path="/myorders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/helpcentreinterface" element={<ProtectedRoute><HelpCentreInterface /></ProtectedRoute>} />
        <Route path="/nfccards" element={<ProtectedRoute><NFCCards /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/contact-support" element={<ProtectedRoute><ContactSupport /></ProtectedRoute>} />
      </Routes>
    </>
  );
}
