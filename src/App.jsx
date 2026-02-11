// frontend/src/App.jsx
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useContext } from "react";
import { Toaster } from "react-hot-toast";

import { AuthContext } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import TidioDelayedLoader from "./components/TidioDelayedLoader";
import RouteErrorBoundary from "./components/RouteErrorBoundary";

// -------- Public pages --------
import Home from "./pages/website/Home.jsx";

// Auth
import Register from "./pages/website/Register.jsx";
import Login from "./pages/website/Login.jsx";
import ResetPassword from "./pages/website/ResetPassword.jsx";

// Legacy product pages
import KonarCard from "./pages/website/KonarCard.jsx";
import KonarSubscription from "./pages/website/KonarSubscription.jsx";

// Public website pages
import Products from "./pages/website/Products.jsx";
import Example from "./pages/website/Example.jsx";
import Pricing from "./pages/website/Pricing.jsx";
import FAQ from "./pages/website/FAQ.jsx";
import Blog from "./pages/website/Blog.jsx";
import Reviews from "./pages/website/Reviews.jsx";
import HelpCentre from "./pages/website/HelpCentre.jsx";
import ContactUs from "./pages/website/ContactUs.jsx";
import Policies from "./pages/website/Policies.jsx";

// Product detail pages
import PlasticCard from "./pages/website/products/PlasticCard.jsx";
import MetalCard from "./pages/website/products/MetalCard.jsx";
import KonarTag from "./pages/website/products/KonarTag.jsx";
import PlasticBundle from "./pages/website/products/PlasticBundle.jsx";
import MetalBundle from "./pages/website/products/MetalBundle.jsx";

// Success pages
import SuccessCard from "./pages/website/Success.jsx";
import SuccessSubscription from "./pages/website/SuccessSubscription.jsx";

// Public profile
import UserPage from "./pages/interface/UserPage.jsx";

// OAuth
import OAuthSuccess from "./auth/OAuthSuccess.jsx";

// -------- Interface (protected) --------
import Billing from "./pages/interface/Billing.jsx";
import ContactSupport from "./pages/interface/ContactSupport.jsx";
import HelpCentreInterface from "./pages/interface/HelpCentreInterface.jsx";
import MyProfile from "./pages/interface/MyProfile.jsx";
import MyOrders from "./pages/interface/MyOrder.jsx";
import NFCCards from "./pages/interface/NFCCards.jsx";
import Notifications from "./pages/interface/Notifications.jsx";
import Profile from "./pages/interface/Profile.jsx";
import ClaimLink from "./pages/interface/ClaimLink.jsx";

import Dashboard from "./pages/interface/Dashboard.jsx";
import Profiles from "./pages/interface/Profiles.jsx";
import Cards from "./pages/interface/Cards.jsx";
import Analytics from "./pages/interface/Analytics.jsx";
import ContactBook from "./pages/interface/ContactBook.jsx";
import Settings from "./pages/interface/Settings.jsx";

// Admin
import AdminOrders from "./pages/admin/AdminDashboard.jsx";

/* --------------------------------------------------
   Tidio chat logic
-------------------------------------------------- */
function TidioWrapper() {
  const location = useLocation();

  const isDashboardPath =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/profiles") ||
    location.pathname.startsWith("/cards") ||
    location.pathname.startsWith("/analytics") ||
    location.pathname.startsWith("/contact-book") ||
    location.pathname.startsWith("/settings") ||
    location.pathname.startsWith("/billing") ||
    location.pathname.startsWith("/myorders") ||
    location.pathname.startsWith("/nfccards") ||
    location.pathname.startsWith("/notifications") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/contact-support") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/claim");

  const enableTidio = !isDashboardPath || location.pathname === "/contact-support";

  return <TidioDelayedLoader enabled={enableTidio} delayMs={4000} />;
}

/* --------------------------------------------------
   App
-------------------------------------------------- */
export default function App() {
  useContext(AuthContext);

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <ScrollToTop />
      <TidioWrapper />

      <RouteErrorBoundary>
        <Routes>
          {/* ---------------- PUBLIC ---------------- */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth" element={<OAuthSuccess />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Legacy product routes */}
          <Route path="/productandplan/konarcard" element={<KonarCard />} />
          <Route path="/productandplan/konarsubscription" element={<KonarSubscription />} />
          <Route path="/whatisnfc" element={<KonarCard />} />
          <Route path="/subscription" element={<KonarSubscription />} />

          {/* Public website pages */}
          <Route path="/products" element={<Products />} />

          {/* ✅ NEW CANONICAL ROUTES */}
          <Route path="/products/plastic" element={<PlasticCard />} />
          <Route path="/products/metal" element={<MetalCard />} />

          {/* ✅ OLD ROUTES REDIRECT */}
          <Route path="/products/plastic-card" element={<Navigate to="/products/plastic" replace />} />
          <Route path="/products/metal-card" element={<Navigate to="/products/metal" replace />} />

          <Route path="/products/konartag" element={<KonarTag />} />
          <Route path="/products/plastic-bundle" element={<PlasticBundle />} />
          <Route path="/products/metal-bundle" element={<MetalBundle />} />

          <Route path="/examples" element={<Example />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/helpcentre" element={<HelpCentre />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/policies" element={<Policies />} />

          {/* Success */}
          <Route
            path="/success"
            element={
              <ProtectedRoute>
                <SuccessCard />
              </ProtectedRoute>
            }
          />
          <Route path="/successsubscription" element={<SuccessSubscription />} />
          <Route path="/SuccessSubscription" element={<SuccessSubscription />} />

          {/* Public profile */}
          <Route path="/u/:slug" element={<UserPage />} />

          {/* ---------------- PROTECTED ---------------- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profiles"
            element={
              <ProtectedRoute>
                <Profiles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profiles/edit"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cards"
            element={
              <ProtectedRoute>
                <Cards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact-book"
            element={
              <ProtectedRoute>
                <ContactBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Legacy redirect */}
          <Route
            path="/myprofile"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />

          {/* Legacy protected */}
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

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RouteErrorBoundary>
    </>
  );
}
