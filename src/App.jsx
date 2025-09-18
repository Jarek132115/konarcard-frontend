// App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthContext } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import TidioDelayedLoader from './components/TidioDelayedLoader';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import { lazyWithRetry } from './utils/lazyWithRetry';

// lazy imports (unchanged)
// ...

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

function App() {
  const { initialized, loading } = useContext(AuthContext);

  // ✨ HARD GATE: do not render any routes until auth bootstrap finishes.
  if (!initialized || loading) {
    return <div style={{ padding: 16 }}>Loading…</div>; // or your skeleton
  }

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <ScrollToTop />
      <TidioWrapper />

      <RouteErrorBoundary>
        <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
          <Routes>
            {/* PUBLIC routes */}
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

            {/* PROTECTED routes */}
            <Route path="/myprofile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
            <Route path="/myorders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/helpcentreinterface" element={<ProtectedRoute><HelpCentreInterface /></ProtectedRoute>} />
            <Route path="/nfccards" element={<ProtectedRoute><NFCCards /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/contact-support" element={<ProtectedRoute><ContactSupport /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </>
  );
}

export default App;
