// App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import TidioDelayedLoader from './components/TidioDelayedLoader';

import RouteErrorBoundary from './components/RouteErrorBoundary';
import { lazyWithRetry } from './utils/lazyWithRetry';

// Lazy pages (retrying)
const Home = lazyWithRetry(() => import('./pages/website/Home'));
const Register = lazyWithRetry(() => import('./pages/website/Register'));
const Login = lazyWithRetry(() => import('./pages/website/Login'));
const ResetPassword = lazyWithRetry(() => import('./pages/website/ResetPassword'));
const ProductAndPlan = lazyWithRetry(() => import('./pages/website/ProductAndPlan'));
const FAQ = lazyWithRetry(() => import('./pages/website/FAQ'));
const HelpCentre = lazyWithRetry(() => import('./pages/website/HelpCentre'));
const Reviews = lazyWithRetry(() => import('./pages/website/Reviews'));
const KonarCard = lazyWithRetry(() => import('./pages/website/KonarCard'));
const KonarSubscription = lazyWithRetry(() => import('./pages/website/KonarSubscription'));
const ContactUs = lazyWithRetry(() => import('./pages/website/ContactUs'));
const Policies = lazyWithRetry(() => import('./pages/website/Policies'));
const Success = lazyWithRetry(() => import('./pages/website/Success'));
const SuccessSubscription = lazyWithRetry(() => import('./pages/website/SuccessSubscription'));

// Interface (protected)
const MyProfile = lazyWithRetry(() => import('./pages/interface/MyProfile'));
const MyOrders = lazyWithRetry(() => import('./pages/interface/MyOrder'));
const Billing = lazyWithRetry(() => import('./pages/interface/Billing'));
const HelpCentreInterface = lazyWithRetry(() => import('./pages/interface/HelpCentreInterface'));
const NFCCards = lazyWithRetry(() => import('./pages/interface/NFCCards'));
const Notifications = lazyWithRetry(() => import('./pages/interface/Notifications'));
const Profile = lazyWithRetry(() => import('./pages/interface/Profile'));
const ContactSupport = lazyWithRetry(() => import('./pages/interface/ContactSupport'));

// Public user page
const UserPage = lazyWithRetry(() => import('./pages/interface/UserPage'));

// --- Wrapper to control Tidio enablement ---
function TidioWrapper() {
  const location = useLocation();

  const isDashboardPath = location.pathname.startsWith('/myprofile')
    || location.pathname.startsWith('/myorders')
    || location.pathname.startsWith('/billing')
    || location.pathname.startsWith('/helpcentreinterface')
    || location.pathname.startsWith('/nfccards')
    || location.pathname.startsWith('/notifications')
    || location.pathname.startsWith('/profile')
    || location.pathname.startsWith('/contact-support');

  // Only allow Tidio on `/contact-support` inside dashboard
  const enableTidio =
    !isDashboardPath || location.pathname === '/contact-support';

  return <TidioDelayedLoader enabled={enableTidio} delayMs={4000} />;
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <ScrollToTop />
      <TidioWrapper />

      <RouteErrorBoundary>
        <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
          <Routes>
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
            {/* keep original case and add lowercase alias */}
            <Route path="/SuccessSubscription" element={<SuccessSubscription />} />
            <Route path="/successsubscription" element={<SuccessSubscription />} />

            {/* Protected routes */}
            <Route path="/myprofile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
            <Route path="/myorders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/helpcentreinterface" element={<ProtectedRoute><HelpCentreInterface /></ProtectedRoute>} />
            <Route path="/nfccards" element={<ProtectedRoute><NFCCards /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/contact-support" element={<ProtectedRoute><ContactSupport /></ProtectedRoute>} />

            {/* Public user page */}
            <Route path="/u/:username" element={<UserPage />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </AuthProvider>
  );
}

export default App;
