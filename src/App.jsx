import axios from 'axios';
import { Routes, Route, useLocation } from 'react-router-dom'; // Import useLocation
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './components/AuthContext';
import Home from './pages/website/Home';
import Register from './pages/website/Register';
import Login from './pages/website/Login';
import ResetPassword from './pages/website/ResetPassword';
import ShopNFCCards from './pages/website/ShopNFCCards';
import WhiteCard from './pages/website/WhiteCard';
import HowItWorks from './pages/website/HowItWorks';
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

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
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
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/shopnfccards" element={<ShopNFCCards />} />
        <Route path="/shopnfccards/whitecard" element={<WhiteCard />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/whatisnfc" element={<WhatIsNFC />} />
        <Route path="/howitworks" element={<HowItWorks />} />
        <Route path="/helpcentre" element={<HelpCentre />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/success" element={<Success />} />
        <Route path="/myprofile" element={<MyProfile />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/helpcentreinterface" element={<HelpCentreInterface />} />
        <Route path="/nfccards" element={<NFCCards />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/subscription" element={<Subscription />} />
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