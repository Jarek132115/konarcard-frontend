// src/App.jsx
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import ScrollToTop from "./components/ScrollToTop";
import TidioDelayedLoader from "./components/TidioDelayedLoader";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
import { KonarToastProvider } from "./components/Dashboard/KonarToast";

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
import PlasticCard2 from "./pages/website/products/PlasticCard2.jsx";
import PlasticCard3 from "./pages/website/products/PlasticCard3.jsx";
import PlasticCard4 from "./pages/website/products/PlasticCard4.jsx";
import PlasticCard5 from "./pages/website/products/PlasticCard5.jsx";
import PlasticCard6 from "./pages/website/products/PlasticCard6.jsx";

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

// Dashboard pricing
import UpgradePlan from "./pages/interface/UpgradePlan.jsx";

// -------- Admin --------
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";

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
    location.pathname.startsWith("/upgrade-plan") ||
    location.pathname.startsWith("/myorders") ||
    location.pathname.startsWith("/nfccards") ||
    location.pathname.startsWith("/notifications") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/contact-support") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/claim");

  const isPublicUserProfile = location.pathname.startsWith("/u/");

  const enableTidio =
    (!isDashboardPath && !isPublicUserProfile) ||
    location.pathname === "/contact-support";

  return <TidioDelayedLoader enabled={enableTidio} delayMs={4000} />;
}

/* --------------------------------------------------
   App
-------------------------------------------------- */
export default function App() {
  useContext(AuthContext);

  return (
    <KonarToastProvider>
      <ScrollToTop />
      <TidioWrapper />

      <RouteErrorBoundary>
        <Routes>
          {/* ---------------- PUBLIC ---------------- */}

          <Route
            path="/"
            element={
              <PublicOnlyRoute redirectAuthenticatedTo="/dashboard">
                <Home />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicOnlyRoute
                redirectAuthenticatedTo="/dashboard"
                allowProductIntentRedirect
              >
                <Register />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute
                redirectAuthenticatedTo="/dashboard"
                allowProductIntentRedirect
              >
                <Login />
              </PublicOnlyRoute>
            }
          />

          <Route path="/oauth" element={<OAuthSuccess />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Legacy product routes */}
          <Route
            path="/productandplan/konarcard"
            element={
              <PublicOnlyRoute
                redirectAuthenticatedTo="/dashboard"
                allowProductIntentRedirect
              >
                <KonarCard />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/productandplan/konarsubscription"
            element={
              <PublicOnlyRoute redirectAuthenticatedTo="/dashboard">
                <KonarSubscription />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/whatisnfc"
            element={
              <PublicOnlyRoute
                redirectAuthenticatedTo="/dashboard"
                allowProductIntentRedirect
              >
                <KonarCard />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <PublicOnlyRoute redirectAuthenticatedTo="/dashboard">
                <KonarSubscription />
              </PublicOnlyRoute>
            }
          />

          {/* Public website pages */}
          <Route
            path="/products"
            element={
              <PublicOnlyRoute
                redirectAuthenticatedTo="/dashboard"
                allowProductIntentRedirect
              >
                <Products />
              </PublicOnlyRoute>
            }
          />

          {/* Product pages */}
          <Route
            path="/products/plastic-white"
            element={
              <PublicOnlyRoute
                redirectAuthenticatedTo="/dashboard"
                allowProductIntentRedirect
              >
                <PlasticCard />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/products/plastic-black"
            element={
              <PublicOnlyRoute
                redirectAuthenticatedTo="/dashboard"
                allowProductIntentRedirect
              >
                <PlasticCard2 />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/products/plastic-blue"
            element={
              <PublicOnlyRoute
                redirectAuthenticatedTo="/dashboard"
                allowProductIntentRedirect
              >
                <PlasticCard3 />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/products/plastic-green"
            element={
              <PublicOnlyRoute
                redirectAuthenticatedTo="/dashboard"
                allowProductIntentRedirect
              >
                <PlasticCard4 />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/products/plastic-magenta"
            element={
              <PublicOnlyRoute
                redirectAuthenticatedTo="/dashboard"
                allowProductIntentRedirect
              >
                <PlasticCard5 />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/products/plastic-orange"
            element={
              <PublicOnlyRoute
                redirectAuthenticatedTo="/dashboard"
                allowProductIntentRedirect
              >
                <PlasticCard6 />
              </PublicOnlyRoute>
            }
          />

          {/* Legacy redirects */}
          <Route
            path="/products/plastic-card"
            element={<Navigate to="/products/plastic-white" replace />}
          />
          <Route
            path="/products/plastic"
            element={<Navigate to="/products/plastic-white" replace />}
          />
          <Route
            path="/products/metal-card"
            element={<Navigate to="/products" replace />}
          />
          <Route
            path="/products/metal"
            element={<Navigate to="/products" replace />}
          />
          <Route
            path="/products/konartag"
            element={<Navigate to="/products" replace />}
          />
          <Route
            path="/products/plastic-bundle"
            element={<Navigate to="/products" replace />}
          />
          <Route
            path="/products/metal-bundle"
            element={<Navigate to="/products" replace />}
          />
          <Route
            path="/products/plastic-basic"
            element={<Navigate to="/products/plastic-white" replace />}
          />
          <Route
            path="/products/plastic-signature"
            element={<Navigate to="/products/plastic-black" replace />}
          />
          <Route
            path="/products/plastic-midnight"
            element={<Navigate to="/products/plastic-blue" replace />}
          />
          <Route
            path="/products/plastic-graphite"
            element={<Navigate to="/products/plastic-green" replace />}
          />
          <Route
            path="/products/plastic-sand"
            element={<Navigate to="/products/plastic-magenta" replace />}
          />
          <Route
            path="/products/plastic-slate"
            element={<Navigate to="/products/plastic-orange" replace />}
          />

          <Route
            path="/examples"
            element={
              <PublicOnlyRoute redirectAuthenticatedTo="/dashboard">
                <Example />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <PublicOnlyRoute redirectAuthenticatedTo="/dashboard">
                <Pricing />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/faq"
            element={
              <PublicOnlyRoute redirectAuthenticatedTo="/dashboard">
                <FAQ />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/blog"
            element={
              <PublicOnlyRoute redirectAuthenticatedTo="/dashboard">
                <Blog />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <PublicOnlyRoute redirectAuthenticatedTo="/dashboard">
                <Reviews />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/helpcentre"
            element={
              <PublicOnlyRoute redirectAuthenticatedTo="/dashboard">
                <HelpCentre />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/contactus"
            element={
              <PublicOnlyRoute redirectAuthenticatedTo="/dashboard">
                <ContactUs />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/policies"
            element={
              <PublicOnlyRoute redirectAuthenticatedTo="/dashboard">
                <Policies />
              </PublicOnlyRoute>
            }
          />

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
            path="/upgrade-plan"
            element={
              <ProtectedRoute>
                <UpgradePlan />
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

          {/* ---------------- ADMIN ---------------- */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/overview"
            element={
              <AdminRoute>
                <AdminOverview />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <AdminAnalytics />
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RouteErrorBoundary>
    </KonarToastProvider>
  );
}