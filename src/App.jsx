// App.jsx (only the changes shown)
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Lazy pages
const Home = lazy(() => import('./pages/website/Home'));
const Register = lazy(() => import('./pages/website/Register'));
const Login = lazy(() => import('./pages/website/Login'));
const ResetPassword = lazy(() => import('./pages/website/ResetPassword'));
const ProductAndPlan = lazy(() => import('./pages/website/ProductAndPlan'));
const FAQ = lazy(() => import('./pages/website/FAQ'));
const HelpCentre = lazy(() => import('./pages/website/HelpCentre'));
const Reviews = lazy(() => import('./pages/website/Reviews'));
const KonarCard = lazy(() => import('./pages/website/KonarCard'));
const KonarSubscription = lazy(() => import('./pages/website/KonarSubscription'));
const ContactUs = lazy(() => import('./pages/website/ContactUs'));
const Policies = lazy(() => import('./pages/website/Policies'));
const Success = lazy(() => import('./pages/website/Success'));
const SuccessSubscription = lazy(() => import('./pages/website/SuccessSubscription'));

// Interface (protected)
const MyProfile = lazy(() => import('./pages/interface/MyProfile'));
const MyOrders = lazy(() => import('./pages/interface/MyOrder'));
const Billing = lazy(() => import('./pages/interface/Billing'));
const HelpCentreInterface = lazy(() => import('./pages/interface/HelpCentreInterface'));
const NFCCards = lazy(() => import('./pages/interface/NFCCards'));
const Notifications = lazy(() => import('./pages/interface/Notifications'));
const Profile = lazy(() => import('./pages/interface/Profile'));
const ContactSupport = lazy(() => import('./pages/interface/ContactSupport'));

// Public user page
const UserPage = lazy(() => import('./pages/interface/UserPage'));

function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <ScrollToTop />

      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
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
          <Route path="/SuccessSubscription" element={<SuccessSubscription />} />

          <Route path="/myprofile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
          <Route path="/myorders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
          <Route path="/helpcentreinterface" element={<ProtectedRoute><HelpCentreInterface /></ProtectedRoute>} />
          <Route path="/nfccards" element={<ProtectedRoute><NFCCards /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/contact-support" element={<ProtectedRoute><ContactSupport /></ProtectedRoute>} />

          <Route path="/u/:username" element={<UserPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
