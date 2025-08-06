import axios from 'axios';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './components/AuthContext';
import Home from './pages/website/Home';
import Register from './pages/website/Register';
import Login from './pages/website/Login';
import ResetPassword from './pages/website/ResetPassword';
import ProductAndPlan from './pages/website/ProductAndPlan';
import FAQ from './pages/website/FAQ';
import HelpCentre from './pages/website/HelpCentre';
import Reviews from './pages/website/Reviews';
import KonarCard from './pages/website/KonarCard';
// CORRECTED IMPORT PATH: KonarSubscription is in 'pages/website'
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
        {/*
          IMPORTANT: The link from ProductAndPlan for subscription details goes to /productandplan/howitworks.
          If you intend for /subscription to be a standalone page for KonarSubscription, keep this route.
          If KonarSubscription should ONLY be accessed via a nested path from ProductAndPlan,
          you might want to change this path to something like "/productandplan/konarsubscription"
          and then update the link in ProductAndPlan.jsx accordingly.
          For now, keeping it as a direct route for KonarSubscription.
        */}
        <Route path="/subscription" element={<KonarSubscription />} />


        {/* Keeping old /whatisnfc route for now. If you want to remove it, delete this line. */}
        <Route path="/whatisnfc" element={<KonarCard />} />


        <Route path="/faq" element={<FAQ />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/helpcentre" element={<HelpCentre />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/success" element={<Success />} />
        <Route path="/SuccessSubscription" element={<SuccessSubscription />} />
        <Route path="/myprofile" element={<MyProfile />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/helpcentreinterface" element={<HelpCentreInterface />} />
        <Route path="/nfccards" element={<NFCCards />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact-support" element={<ContactSupport />} />
        <Route path="/u/:username" element={<UserPage />} />
      </Routes>
      {!isUserPage && (
        <script src={TIDIO_SCRIPT_URL} async></script>
      )}
    </AuthProvider>
  );
}

export default App;
