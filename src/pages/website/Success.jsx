// src/pages/website/Success.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import PageHeader from "../../components/PageHeader";
import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import api from "../../services/api";
import { AuthContext } from "../../components/AuthContext";
import { toast } from "react-hot-toast";

// ---------- helpers ----------
function formatAmount(amount, currency = "gbp") {
  if (typeof amount !== "number") return "—";
  const value = amount / 100;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function statusLabel(s) {
  switch ((s || "").toLowerCase()) {
    case "order_placed":
      return "Order placed";
    case "designing_card":
      return "Designing your card";
    case "packaged":
      return "Packaged";
    case "shipped":
      return "Shipped";
    default:
      return "Order placed";
  }
}

function statusIndex(s) {
  switch ((s || "").toLowerCase()) {
    case "order_placed":
      return 0;
    case "designing_card":
      return 1;
    case "packaged":
      return 2;
    case "shipped":
      return 3;
    default:
      return 0;
  }
}

function ProgressBar({ status }) {
  const idx = statusIndex(status);
  const percent = Math.max(0, Math.min(100, (idx / 3) * 100));
  return (
    <div style={{ width: "100%", marginTop: 8 }}>
      <div
        style={{
          height: 8,
          width: "100%",
          background: "#e5e7eb",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "#0ea5e9",
          }}
        />
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
        {idx + 1} / 4 · {statusLabel(status)}
      </div>
    </div>
  );
}

// ---------- component ----------
export default function Success() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

  const { user: authUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [confirming, setConfirming] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    const onResize = () => {
      const m = window.innerWidth <= 1000;
      const sm = window.innerWidth <= 600;
      setIsMobile(m);
      setIsSmallMobile(sm);
      if (!m && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen && isMobile) document.body.classList.add("body-no-scroll");
    else document.body.classList.remove("body-no-scroll");
  }, [sidebarOpen, isMobile]);

  // Try confirm endpoint
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sid = params.get("session_id");
    if (!sid) return;
    let mounted = true;
    (async () => {
      try {
        setConfirming(true);
        const res = await api.get("/api/stripe/confirm", {
          params: { session_id: sid },
        });
        if (mounted) setConfirmedOrder(res?.data?.data || null);
      } catch {
        // fallback to orders list
      } finally {
        if (mounted) setConfirming(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [location.search]);

  // Orders fallback
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/me/orders");
        if (mounted)
          setOrders(Array.isArray(res?.data?.data) ? res.data.data : []);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.error || "Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [authUser]);

  const latestOrder = useMemo(() => {
    if (!orders.length) return null;
    return orders.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )[0];
  }, [orders]);

  const order = confirmedOrder || latestOrder;

  const isBusy = loading || confirming;
  if (isBusy) {
    return <p style={{ padding: 40 }}>Confirming your payment…</p>;
  }
  if (err) {
    return <p style={{ padding: 40, color: "#b91c1c" }}>{err}</p>;
  }
  if (!order) {
    return <p style={{ padding: 40 }}>No recent order found.</p>;
  }

  const isSub = (order.type || "").toLowerCase() === "subscription";

  // ---------- Subscription ----------
  if (isSub) {
    const subStatus = order?.status || "inactive";
    const amountToday = order.trialEnd &&
      new Date(order.trialEnd) > new Date()
      ? "Free trial — no charge today"
      : formatAmount(order.amountTotal ?? 495, order.currency || "gbp");
    const nextChargeDate =
      order.trialEnd && new Date(order.trialEnd) > new Date()
        ? new Date(order.trialEnd)
        : order.currentPeriodEnd
          ? new Date(order.currentPeriodEnd)
          : null;

    return (
      <div className={`app-layout ${sidebarOpen ? "sidebar-active" : ""}`}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="main-content-container">
          <PageHeader
            title="Subscription"
            isMobile={isMobile}
            isSmallMobile={isSmallMobile}
          />
          <div className="success-container">
            <div className="success-box">
              <h2 className="desktop-h4 success-header">Konar Profile Plan</h2>
              <p className="desktop-body" style={{ margin: 0, color: "#555" }}>
                Your subscription is{" "}
                <strong className="status-text">{subStatus}</strong>.
              </p>

              <div className="success-grid">
                <div className="info-tile">
                  <p className="desktop-body-s label">Amount paid today</p>
                  <p className="desktop-h5 value">{amountToday}</p>
                </div>
                <div className="info-tile">
                  <p className="desktop-body-s label">
                    {order.trialEnd && new Date(order.trialEnd) > new Date()
                      ? "Free trial active until"
                      : "Next charge on"}
                  </p>
                  <p className="desktop-h5 value">
                    {nextChargeDate
                      ? nextChargeDate.toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>

              {/* ✅ Buttons added back */}
              <div className="success-buttons" style={{ display: "grid", gap: 12 }}>
                <Link
                  to="/myprofile"
                  className="cta-blue-button desktop-button"
                  style={{ width: "100%" }}
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/myorders"
                  className="cta-black-button desktop-button"
                  style={{ width: "100%" }}
                >
                  View All Orders
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---------- Card Order ----------
  const amountPaid = formatAmount(order.amountTotal, order.currency);
  const estimatedDelivery =
    order.deliveryWindow || order?.metadata?.estimatedDelivery || "—";
  const deliveryName = order.deliveryName || order?.metadata?.deliveryName || "";
  const deliveryAddress =
    order.deliveryAddress || order?.metadata?.deliveryAddress || "";
  const fulfillmentStatus = order?.fulfillmentStatus || "order_placed";
  const trackingUrl = order?.trackingUrl || order?.metadata?.trackingUrl || "";

  function handleTrack() {
    if (trackingUrl) {
      window.open(trackingUrl, "_blank", "noopener,noreferrer");
    } else {
      toast("Your card is still being processed. We’ll email you when tracking is available.", {
        icon: "⏳",
      });
    }
  }

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-active" : ""}`}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="main-content-container">
        <PageHeader
          title="Order"
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />
        <div className="success-container">
          <div className="success-box">
            {/* Status chip + Track button */}
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 10,
                flexWrap: "wrap",
              }}
            >
              <span style={{ padding: "6px 10px", borderRadius: 999, background: "#eef", fontSize: 12 }}>
                {statusLabel(fulfillmentStatus)}
              </span>
              <button
                type="button"
                onClick={handleTrack}
                className="desktop-button"
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                }}
              >
                Track order
              </button>
            </div>

            <ProgressBar status={fulfillmentStatus} />

            <h2 className="desktop-h4 success-header" style={{ marginTop: 12 }}>
              Payment Successful!
            </h2>
            <p className="desktop-body" style={{ margin: 0, color: "#555" }}>
              Thank you for your order. Your Konar card is on its way.
            </p>

            <div className="success-grid">
              <div className="info-tile">
                <p className="desktop-body-s label">Amount paid</p>
                <p className="desktop-h5 value">{amountPaid}</p>
              </div>
              <div className="info-tile">
                <p className="desktop-body-s label">Estimated delivery</p>
                <p className="desktop-h5 value">{estimatedDelivery}</p>
              </div>
            </div>

            {/* ✅ Buttons added back */}
            <div className="success-buttons" style={{ display: "grid", gap: 12 }}>
              <Link
                to="/myprofile"
                className="cta-blue-button desktop-button"
                style={{ width: "100%" }}
              >
                Go to Dashboard
              </Link>
              <Link
                to="/myorders"
                className="cta-black-button desktop-button"
                style={{ width: "100%" }}
              >
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
