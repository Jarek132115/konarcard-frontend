// src/App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, useContext, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import { AuthContext } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import TidioDelayedLoader from './components/TidioDelayedLoader';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import { lazyWithRetry } from './utils/lazyWithRetry';

// --- Lightweight page skeleton so route swaps never white-flash ---
function PageSkeleton() {
  return (
    <div style={{ padding: '20px 16px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{
        height: 40, marginBottom: 12, borderRadius: 12, background: '#f2f2f2',
        boxShadow: '0 8px 24px rgba(0,0,0,.06)'
      }} />
      <div style={{
        height: 220, borderRadius: 16, background: '#f2f2f2',
        boxShadow: '0 8px 24px rgba(0,0,0,.06)'
      }} />
    </div>
  );
}

// Public
const Home = lazyWithRetry(() => import(/* webpackPrefetch: true */ './pages/website/Home.jsx'));
const Register = lazyWithRetry(() => import('./pages/website/Register.jsx'));
const Login = lazyWithRetry(() => import(/* webpackPrefetch: true */ './pages/website/Login.jsx'));
const ResetPassword = lazyWithRetry(() => import('./pages/website/ResetPassword.jsx'));
const ProductAndPlan = lazyWithRetry(() => import('./pages/website/ProductAndPlan.jsx'));
const KonarCard = lazyWithRetry(() => import('./pages/website/KonarCard.jsx'));
const KonarSubscription = lazyWithRetry(() => import('./pages/website/KonarSubscription.jsx'));
const FAQ = lazyWithRetry(() => import('./pages/website/FAQ.jsx'));
const Reviews = lazyWithRetry(() => import('./pages/website/Reviews.jsx'));
const HelpCentre = lazyWithRetry(() => import('./pages/website/HelpCentre.jsx'));
const ContactUs = lazyWithRetry(() => import('./pages/website/ContactUs.jsx'));
const Policies = lazyWithRetry(() => import('./pages/website/Policies.jsx'));
// ⬇️ use the new success page for card orders
const SuccessCard = lazyWithRetry(() => import('./pages/website/Success.jsx'));
const SuccessSubscription = lazyWithRetry(() => import('./pages/website/SuccessSubscription.jsx'));
const UserPage = lazyWithRetry(() => import('./pages/interface/UserPage.jsx'));

// Interface (protected)
const Billing = lazyWithRetry(() => import('./pages/interface/Billing.jsx'));
const ContactSupport = lazyWithRetry(() => import(/* webpackPrefetch: true */ './pages/interface/ContactSupport.jsx'));
const HelpCentreInterface = lazyWithRetry(() => import('./pages/interface/HelpCentreInterface.jsx'));
const MyProfile = lazyWithRetry(() => import(/* webpackPrefetch: true */ './pages/interface/MyProfile.jsx'));
const MyOrders = lazyWithRetry(() => import('./pages/interface/MyOrder.jsx'));
const NFCCards = lazyWithRetry(() => import('./pages/interface/NFCCards.jsx'));
const Notifications = lazyWithRetry(() => import('./pages/interface/Notifications.jsx'));
const Profile = lazyWithRetry(() => import('./pages/interface/Profile.jsx'));

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
  // keep context warm; don’t block render here
  useContext(AuthContext);

  // Optional: gently “preload” likely-next routes when the main thread is idle
  useEffect(() => {
    const preload = () => {
      Home.preload?.();
      Login.preload?.();
      MyProfile.preload?.();
      ContactSupport.preload?.();
    };
    if ('requestIdleCallback' in window) {
      // @ts-ignore
      const id = window.requestIdleCallback(preload, { timeout: 2000 });
      return () => window.cancelIdleCallback?.(id);
    } else {
      const t = setTimeout(preload, 300);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <ScrollToTop />
      <TidioWrapper />

      <RouteErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            {/* PUBLIC */}
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

            {/* ⬇️ Card checkout success uses the new page; keep it protected since checkout is protected */}
            <Route path="/success" element={<ProtectedRoute><SuccessCard /></ProtectedRoute>} />

            {/* Keep subscription success as-is */}
            <Route path="/SuccessSubscription" element={<SuccessSubscription />} />
            <Route path="/successsubscription" element={<SuccessSubscription />} />
            <Route path="/u/:username" element={<UserPage />} />

            {/* PROTECTED */}
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/helpcentreinterface" element={<ProtectedRoute><HelpCentreInterface /></ProtectedRoute>} />
            <Route path="/contact-support" element={<ProtectedRoute><ContactSupport /></ProtectedRoute>} />
            <Route path="/myprofile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
            <Route path="/myorders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/nfccards" element={<ProtectedRoute><NFCCards /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </>
  );
}
