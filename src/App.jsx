import axios from 'axios';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

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
import ScrollToTop from './components/ScrollToTop';

import MyProfile from './pages/interface/MyProfile';
import Billing from './pages/interface/Billing';
import HelpCentreInterface from './pages/interface/HelpCentreInterface';
import NFCCards from './pages/interface/NFCCards';
import Notifications from './pages/interface/Notifications';
import Profile from './pages/interface/Profile';
import ContactSupport from './pages/interface/ContactSupport';
import UserPage from './pages/interface/UserPage';
import SuccessSubscription from './pages/website/SuccessSubscription';

// 🆕 Import MyOrders
import MyOrders from './pages/interface/MyOrder';

axios.defaults.baseURL = 'https://konarcard-backend-331608269918.europe-west1.run.app';
axios.defaults.withCredentials = true;

function App() {
  const location = useLocation();
  const TIDIO_SCRIPT_URL = "//code.tidio.co/beofp4i2ttjkwkjoem91cbg7an99f40w.js";
  const isUserPage = location.pathname.startsWith('/u/');

  return (
    <AuthProvider>
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <ScrollToTop />
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

        {/* Protected Routes */}
        <Route path="/myprofile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
        <Route path="/myorders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
        <Route path="/helpcentreinterface" element={<ProtectedRoute><HelpCentreInterface /></ProtectedRoute>} />
        <Route path="/nfccards" element={<ProtectedRoute><NFCCards /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/contact-support" element={<ProtectedRoute><ContactSupport /></ProtectedRoute>} />

        {/* Public User Page */}
        <Route path="/u/:username" element={<UserPage />} />
      </Routes>

      {!isUserPage && (
        <script src={TIDIO_SCRIPT_URL} async></script>
      )}
    </AuthProvider>
  );
}

export default App;
