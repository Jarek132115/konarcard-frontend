// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/** ✅ Unhead */
import { createHead } from "unhead";
import { UnheadProvider } from "@unhead/react";

import "./styling/fonts.css";
import "./styling/login.css";
import "./styling/navbar.css";
import "./styling/footer.css";
import "./styling/product.css";
import "./styling/policies.css";
import "./styling/success.css";
import "./styling/dashboard/sidebar.css";
import "./styling/subscription.css";
import "./styling/contactus.css";
import "./styling/userpage.css";
import "./styling/shareprofile.css";
import "./styling/contactinterface.css";
import "./styling/nfccard.css";
import "./styling/myorders.css";
import "./styling/admin.css";

import App from "./App.jsx";
import { AuthProvider } from "./components/AuthContext";

// Anti-flash defaults:
// - no refetch on focus/reconnect/mount
// - generous staleTime so data is “fresh” longer
// - keepPreviousData to prevent UI flicker on key changes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      keepPreviousData: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

const head = createHead();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UnheadProvider head={head}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </UnheadProvider>
  </StrictMode>
);

// OPTIONAL: ensure no stale service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((rs) => rs.forEach((r) => r.unregister()));
}
