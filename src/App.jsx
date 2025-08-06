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
import HowItWorks from './pages/website/HowItWorks'; // Make sure this import is correct
import FAQ from './pages/website/FAQ';
import HelpCentre from './pages/website/HelpCentre';
import Reviews from './pages/website/Reviews';
import WhatIsNFC from './pages/website/WhatIsNFC';
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
import Subscription from './pages/interface/Subscription';
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

        {/* Nested routes for Product & Plan */}
        <Route path="/productandplan/whatisnfc" element={<WhatIsNFC />} />
        {/* NEW NESTED ROUTE FOR HOW IT WORKS */}
        <Route path="/productandplan/howitworks" element={<HowItWorks />} />

        {/* Keeping original top-level routes for flexibility, if needed */}
        <Route path="/howitworks" element={<HowItWorks />} />
        <Route path="/whatisnfc" element={<WhatIsNFC />} />
        <Route path="/subscription" element={<Subscription />} /> {/* This remains a top-level route for the actual subscription page if needed */}


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
