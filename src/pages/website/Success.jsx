// src/pages/interface/SuccessCard.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";

import Sidebar from "../../components/Dashboard/Sidebar";
import PageHeader from "../../components/Dashboard/PageHeader";
import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import api from "../../services/api";
import { AuthContext } from "../../components/AuthContext";
import { toast } from "react-hot-toast";

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
          style={{ width: `${percent}%`, height: "100%", background: "#0ea5e9" }}
        />
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
        {idx + 1} / 4 · {statusLabel(status)}
      </div>
    </div>
  );
}

export default function SuccessCard() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderId = params.get("id"); // NEW: allow opening by id
  const sessionId = params.get("session_id");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

  const { user: authUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // NEW: state for instant confirmation result
  const [confirming, setConfirming] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [confirmErr, setConfirmErr] = useState("");

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
    if (sidebarOpen && isMobile)
      document.body.classList.add("body-no-scroll");
    else document.body.classList.remove("body-no-scroll");
  }, [sidebarOpen, isMobile]);

  // 1) If session_id exists (checkout redirect), confirm it with Stripe
  useEffect(() => {
    if (!sessionId) return;
    let mounted = true;
    (async () => {
      try {
        setConfirming(true);
        setConfirmErr("");
        const res = await api.get("/api/stripe/confirm", {
          params: { session_id: sessionId },
        });
        const ord = res?.data?.data || null;
        if (mounted) setConfirmedOrder(ord);
      } catch (e) {
        if (mounted)
          setConfirmErr(
            e?.response?.data?.error ||
            "Could not confirm your order immediately."
          );
      } finally {
        if (mounted) setConfirming(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  // 2) Fetch orders list (used when orderId is provided, or fallback)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/me/orders");
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (!mounted) return;

        if (orderId) {
          // if orderId was passed in, pick that order
          const found = list.find((o) => o.id === orderId);
          setOrders(found ? [found] : []);
        } else {
          setOrders(list);
        }
      } catch (e) {
        if (mounted)
          setErr(e?.response?.data?.error || "Could not load your order.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [authUser, orderId]);

  const latestCardOrder = useMemo(() => {
    const cards = (orders || []).filter(
      (o) => (o.type || "").toLowerCase() === "card"
    );
    if (!cards.length) return null;
    return cards.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )[0];
  }, [orders]);

  // Prefer confirmed order (from session_id), fall back to selected order (by id), or latest
  const order = confirmedOrder || (orderId ? orders[0] : latestCardOrder);

  const amountPaid = useMemo(() => {
    if (!order) return "—";
    return formatAmount(
      typeof order.amountTotal === "number" ? order.amountTotal : 0,
      order.currency || "gbp"
    );
  }, [order]);

  const quantity = order?.quantity ?? order?.metadata?.quantity ?? 1;
  const status = (order?.status || "paid").toLowerCase();
  const orderIdDisplay = order?._id || order?.id || "—";
  const estimatedDelivery =
    order?.deliveryWindow || order?.metadata?.estimatedDelivery || "—";

  const deliveryName =
    order?.deliveryName || order?.metadata?.deliveryName || "";
  const deliveryAddress =
    order?.deliveryAddress || order?.metadata?.deliveryAddress || "";

  // Fulfilment & tracking
  const fulfillmentStatus = order?.fulfillmentStatus || "order_placed";
  const trackingUrl = order?.trackingUrl || order?.metadata?.trackingUrl || "";

  function handleTrack() {
    if (trackingUrl) {
      window.open(trackingUrl, "_blank", "noopener,noreferrer");
    } else {
      toast(
        "Your card is still being processed. We’ll email you when tracking is available.",
        { icon: "⏳" }
      );
    }
  }

  const chip = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.2,
    border: "1px solid rgba(0,0,0,0.08)",
    background:
      fulfillmentStatus === "shipped"
        ? "#e8f5e9"
        : fulfillmentStatus === "packaged"
          ? "#fff7ed"
          : fulfillmentStatus === "designing_card"
            ? "#eff6ff"
            : "#f3f4f6",
    color:
      fulfillmentStatus === "shipped"
        ? "#166534"
        : fulfillmentStatus === "packaged"
          ? "#9a3412"
          : fulfillmentStatus === "designing_card"
            ? "#1d4ed8"
            : "#374151",
  };

  const isBusy = loading || confirming;

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-active" : ""}`}>
      <div className="myprofile-mobile-header">
        <Link to="/" className="myprofile-logo-link">
          <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
        </Link>
        <button
          className={`sidebar-menu-toggle ${sidebarOpen ? "active" : ""}`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      {sidebarOpen && isMobile && (
        <div
          className="sidebar-overlay active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content-container">
        <PageHeader
          title="Order"
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />

        <div className="success-container">
          {isBusy ? (
            <p>Confirming your payment…</p>
          ) : err ? (
            <p style={{ color: "#b91c1c" }}>{err}</p>
          ) : confirmErr && !order ? (
            <p style={{ color: "#b91c1c" }}>{confirmErr}</p>
          ) : !order ? (
            <p>No order found.</p>
          ) : (
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
                <span style={chip}>{statusLabel(fulfillmentStatus)}</span>
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
                  title={
                    trackingUrl
                      ? "Open tracking in a new tab"
                      : "Tracking not available yet"
                  }
                >
                  Track order
                </button>
              </div>

              {/* Compact progress bar */}
              <ProgressBar status={fulfillmentStatus} />

              <h2
                className="desktop-h4 success-header"
                style={{ marginTop: 12 }}
              >
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
                  <p className="desktop-body-s label">Estimated delivery date</p>
                  <p className="desktop-h5 value">{estimatedDelivery}</p>
                </div>
              </div>

              <div
                className="success-buttons"
                style={{ display: "grid", gap: 12 }}
              >
                <Link
                  to="/myprofile"
                  className="cta-blue-button desktop-button"
                  style={{ width: "100%" }}
                >
                  Go to Your Dashboard
                </Link>
                <Link
                  to="/myorders"
                  className="cta-black-button desktop-button"
                  style={{ width: "100%" }}
                >
                  View All Orders
                </Link>
              </div>

              <hr className="divider" />

              <div className="kv">
                <div className="kv-row">
                  <span className="desktop-body-s kv-label">Order ID</span>
                  <span className="desktop-body-s kv-value">{orderIdDisplay}</span>
                </div>
                <div className="kv-row">
                  <span className="desktop-body-s kv-label">Quantity</span>
                  <span className="desktop-body-s kv-value">{quantity}</span>
                </div>
                <div className="kv-row">
                  <span className="desktop-body-s kv-label">Price Paid</span>
                  <span className="desktop-body-s kv-value">{amountPaid}</span>
                </div>

                {(deliveryName || deliveryAddress) && (
                  <div className="kv-row">
                    <span className="desktop-body-s kv-label">Delivery</span>
                    <span className="desktop-body-s kv-value">
                      {[deliveryName, deliveryAddress].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                )}

                <div className="kv-row">
                  <span className="desktop-body-s kv-label">Created</span>
                  <span className="desktop-body-s kv-value">
                    {order?.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "—"}
                  </span>
                </div>
                <div className="kv-row">
                  <span className="desktop-body-s kv-label">Status</span>
                  <span className="desktop-body-s kv-value status-text">
                    {status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
