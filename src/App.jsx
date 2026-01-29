// frontend/src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { Toaster } from 'react-hot-toast';

import { AuthContext } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import TidioDelayedLoader from './components/TidioDelayedLoader';
import RouteErrorBoundary from './components/RouteErrorBoundary';

// -------- Public pages --------
import Home from './pages/website/Home.jsx';

// ✅ These exist in your repo
import Register from './pages/website/Register.jsx';
import Login from './pages/website/Login.jsx';

import ResetPassword from './pages/website/ResetPassword.jsx';
import ProductAndPlan from './pages/website/ProductAndPlan.jsx';
import KonarCard from './pages/website/KonarCard.jsx';
import KonarSubscription from './pages/website/KonarSubscription.jsx';
import FAQ from './pages/website/FAQ.jsx';
import Reviews from './pages/website/Reviews.jsx';
import HelpCentre from './pages/website/HelpCentre.jsx';
import ContactUs from './pages/website/ContactUs.jsx';
import Policies from './pages/website/Policies.jsx';
import SuccessCard from './pages/website/Success.jsx';
import SuccessSubscription from './pages/website/SuccessSubscription.jsx';
import UserPage from './pages/interface/UserPage.jsx';

// ✅ OAuth handler page
import OAuthSuccess from './auth/OAuthSuccess.jsx';

// -------- Interface (protected) --------
import Billing from './pages/interface/Billing.jsx';
import ContactSupport from './pages/interface/ContactSupport.jsx';
import HelpCentreInterface from './pages/interface/HelpCentreInterface.jsx';
import MyProfile from './pages/interface/MyProfile.jsx';
import MyOrders from './pages/interface/MyOrder.jsx';
import NFCCards from './pages/interface/NFCCards.jsx';
import Notifications from './pages/interface/Notifications.jsx';
import Profile from './pages/interface/Profile.jsx';

// ✅ Claim link page (NEW FILE)
import ClaimLink from './pages/interface/ClaimLink.jsx';

// -------- Admin (protected) --------
import AdminOrders from './pages/admin/AdminDashboard.jsx';

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
    location.pathname.startsWith('/contact-support') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/claim');

  const enableTidio = !isDashboardPath || location.pathname === '/contact-support';
  return <TidioDelayedLoader enabled={enableTidio} delayMs={4000} />;
}

export default function App() {
  // keep context warm; don’t block render
  useContext(AuthContext);

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <ScrollToTop />
      <TidioWrapper />

      <RouteErrorBoundary>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* ✅ OAuth token landing */}
          <Route path="/oauth" element={<OAuthSuccess />} />

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

          {/* Card checkout success */}
          <Route
            path="/success"
            element={
              <ProtectedRoute>
                <SuccessCard />
              </ProtectedRoute>
            }
          />

          {/* Subscription success */}
          <Route path="/SuccessSubscription" element={<SuccessSubscription />} />
          <Route path="/successsubscription" element={<SuccessSubscription />} />

          {/* Public profile */}
          <Route path="/u/:username" element={<UserPage />} />

          {/* PROTECTED */}
          <Route
            path="/claim"
            element={
              <ProtectedRoute>
                <ClaimLink />
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/helpcentreinterface"
            element={
              <ProtectedRoute>
                <HelpCentreInterface />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact-support"
            element={
              <ProtectedRoute>
                <ContactSupport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/myprofile"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/myorders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nfccards"
            element={
              <ProtectedRoute>
                <NFCCards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
        </Routes>
      </RouteErrorBoundary>
    </>
  );
}
