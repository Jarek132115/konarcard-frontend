// src/pages/interface/MyOrders.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import Sidebar from "../../components/Sidebar";
import PageHeader from "../../components/PageHeader";
import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import api from "../../services/api";
import ProductThumb from "../../assets/images/Product-Cover.png";

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
function formatFulfillmentStatus(s) {
    switch ((s || "").toLowerCase()) {
        case "order_placed":
            return "Order placed";
        case "designing_card":
            return "Designing card";
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
function statusBadgeClass(s) {
    switch ((s || "").toLowerCase()) {
        case "order_placed":
            return "status-placed";
        case "designing_card":
            return "status-designing";
        case "packaged":
            return "status-packaged";
        case "shipped":
            return "status-shipped";
        default:
            return "status-placed";
    }
}
function formatDateTimeNoSeconds(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}
function ProgressBar({ status }) {
    const idx = statusIndex(status);
    const percent = Math.max(0, Math.min(100, (idx / 3) * 100));
    return (
        <div className="order-progress">
            <div className="order-progress-track">
                <div className="order-progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <div className="order-progress-caption">
                {idx + 1} / 4 · {formatFulfillmentStatus(status)}
            </div>
        </div>
    );
}

export default function MyOrders() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [actionMsg, setActionMsg] = useState("");

    useEffect(() => {
        const handleResize = () => {
            const m = window.innerWidth <= 1000;
            const sm = window.innerWidth <= 600;
            setIsMobile(m);
            setIsSmallMobile(sm);
            if (!m && sidebarOpen) setSidebarOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [sidebarOpen]);

    useEffect(() => {
        if (sidebarOpen && isMobile) document.body.classList.add("body-no-scroll");
        else document.body.classList.remove("body-no-scroll");
    }, [sidebarOpen, isMobile]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr("");
                const res = await api.get("/me/orders", { params: { ts: Date.now() } });
                if (!mounted) return;
                setOrders(Array.isArray(res?.data?.data) ? res.data.data : []);
            } catch (e) {
                setErr(e?.response?.data?.error || "Failed to load orders");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    async function cancelSubscription() {
        setActionMsg("");
        try {
            await api.post("/cancel-subscription");
            setActionMsg(
                "Subscription will cancel at the end of the current billing period."
            );
            const res = await api.get("/me/orders", { params: { ts: Date.now() } });
            setOrders(Array.isArray(res?.data?.data) ? res.data.data : []);
        } catch (e) {
            setActionMsg(e?.response?.data?.error || "Failed to cancel subscription");
        }
    }

    // NEW: quick reorder (card Checkout)
    async function orderAgain(order) {
        try {
            setActionMsg("");
            // Default to 1; you can swap to order.quantity if you want to repeat the same qty.
            const res = await api.post("/api/checkout/card", { quantity: 1 });
            const url =
                res?.data?.url ||
                res?.data?.sessionUrl ||
                res?.data?.session?.url;

            if (url) {
                window.location.href = url; // send to Stripe Checkout
            } else {
                throw new Error("Checkout URL not returned");
            }
        } catch (e) {
            setActionMsg(
                e?.response?.data?.error ||
                e?.message ||
                "Could not start Checkout. Please try again."
            );
        }
    }

    return (
        <div className={`app-layout ${sidebarOpen ? "sidebar-active" : ""}`}>
            <div className="myprofile-mobile-header">
                <Link to="/myprofile" className="myprofile-logo-link">
                    <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
                </Link>
                <div
                    className={`sidebar-menu-toggle ${sidebarOpen ? "active" : ""}`}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {sidebarOpen && isMobile && (
                <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
            )}

            <main className="main-content-container">
                <PageHeader
                    title="My Orders"
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                />

                {/* outer container now has no background/border—just spacing */}
                <section className="orders-container">
                    {loading ? (
                        <p className="orders-hint">Loading orders…</p>
                    ) : err ? (
                        <p className="error-text">{err}</p>
                    ) : orders.length === 0 ? (
                        <div className="orders-empty">
                            <div className="orders-empty-badge">Orders</div>
                            <h3 className="orders-empty-title">No orders yet</h3>
                            <p className="orders-empty-sub">
                                Your purchases will appear here once you’ve checked out.
                            </p>
                            <Link to="/" className="cta-blue-button desktop-button">
                                Browse products
                            </Link>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map((o) => {
                                const isSub = (o.type || "").toLowerCase() === "subscription";
                                const amount = formatAmount(o.amountTotal, o.currency);
                                const delivery =
                                    o.deliveryWindow || o.metadata?.estimatedDelivery || "—";
                                const qty = isSub ? "—" : o.quantity || 1;

                                const deliveryName =
                                    o.deliveryName || o?.metadata?.deliveryName || "—";
                                const deliveryAddress =
                                    o.deliveryAddress || o?.metadata?.deliveryAddress || "—";
                                const fulfillRaw = o.fulfillmentStatus || "order_placed";

                                return (
                                    <article key={o.id} className="order-card">
                                        {/* TOP STATUS PILL ONLY */}
                                        <div className={`order-status-badge ${statusBadgeClass(fulfillRaw)}`}>
                                            {formatFulfillmentStatus(fulfillRaw)}
                                        </div>

                                        <div className="order-thumb">
                                            <img src={ProductThumb} alt="Product" className="order-thumb-img" />
                                        </div>

                                        <div className="order-details">
                                            {/* Meta: Card · Paid · DD/MM/YYYY, HH:MM (no seconds) */}
                                            <header className="order-meta">
                                                <span className="type">{(o.type || "").toLowerCase()}</span>
                                                <span aria-hidden="true">•</span>
                                                <span className="status">{(o.status || "").toLowerCase()}</span>
                                                <span aria-hidden="true">•</span>
                                                <time>{formatDateTimeNoSeconds(o.createdAt)}</time>
                                            </header>

                                            {/* Fields */}
                                            <div className="order-fields">
                                                <div className="order-line">
                                                    <strong>Quantity:</strong> {qty}
                                                </div>
                                                <div className="order-line">
                                                    <strong>Amount:</strong> {amount}
                                                </div>

                                                <div className="order-line">
                                                    <strong>Estimated delivery:</strong> {delivery}
                                                </div>

                                                {/* Progress (spans full row) */}
                                                <div className="order-line order-progress-wrap">
                                                    <ProgressBar status={fulfillRaw} />
                                                </div>

                                                {/* “Dot + two-line” info */}
                                                <div className="order-line order-info">
                                                    <span className="dot" aria-hidden="true" />
                                                    <div className="reason">
                                                        <div className="desktop-body-s"><strong>Delivery name:</strong></div>
                                                        <div className="desktop-body-xs">{deliveryName}</div>
                                                    </div>
                                                </div>

                                                <div className="order-line order-info">
                                                    <span className="dot" aria-hidden="true" />
                                                    <div className="reason">
                                                        <div className="desktop-body-s"><strong>Delivery address:</strong></div>
                                                        <div className="desktop-body-xs">{deliveryAddress}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="order-actions">
                                                {isSub ? (
                                                    <button
                                                        onClick={cancelSubscription}
                                                        className="cta-black-button desktop-button"
                                                    >
                                                        Cancel subscription
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => orderAgain(o)}
                                                        className="cta-black-button desktop-button"
                                                    >
                                                        Order again
                                                    </button>
                                                )}

                                                <Link
                                                    to={isSub ? "/SuccessSubscription" : "/success"}
                                                    className="cta-blue-button desktop-button"
                                                >
                                                    View details
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {actionMsg && <p className="action-message">{actionMsg}</p>}
                </section>
            </main>
        </div>
    );
}
