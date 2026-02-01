// src/pages/MyOrders/index.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../components/Dashboard/Sidebar";
import PageHeader from "../../components/PageHeader";
import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import api from "../../services/api";
import ProductThumb from "../../assets/images/Product-Cover.png";
import { AuthContext } from "../../components/AuthContext"; // ✅ add auth for username

/* ---------- utils ---------- */
function fmtAmount(amount, currency = "gbp") {
    if (typeof amount !== "number") return "—";
    const value = amount / 100;
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}
function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
}
function fmtDateTime(iso) {
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
const activeStripeStatuses = new Set(["active", "trialing", "past_due", "unpaid"]);

/* ---------- progress UI ---------- */
function CardProgress({ status }) {
    const map = { order_placed: 0, designing_card: 1, packaged: 2, shipped: 3 };
    const idx = map[(status || "").toLowerCase()] ?? 0;
    const pct = Math.max(0, Math.min(100, (idx / 3) * 100));
    return (
        <div className="order-progress">
            <div className="order-progress-track">
                <div className="order-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="order-progress-caption">
                {idx + 1} / 4 · {statusLabel({ fulfillmentStatus: status })}
            </div>
        </div>
    );
}
function SubscriptionProgress({
    trialEnd,
    currentPeriodEnd,
    currentPeriodStart,
    createdAt,
    amountTotal,
    currency,
    trialDurationDays = 14,
}) {
    const now = new Date();

    const trialEndDate = trialEnd ? new Date(trialEnd) : null;
    const inTrial = !!(trialEndDate && trialEndDate > now);

    let start, end;

    if (inTrial) {
        end = trialEndDate;
        if (currentPeriodStart) {
            start = new Date(currentPeriodStart);
        } else if (createdAt) {
            start = new Date(createdAt);
        } else {
            start = new Date(end.getTime() - trialDurationDays * 24 * 60 * 60 * 1000);
        }
    } else if (currentPeriodEnd) {
        end = new Date(currentPeriodEnd);
        if (currentPeriodStart) {
            start = new Date(currentPeriodStart);
        } else {
            start = new Date(end);
            start.setMonth(start.getMonth() - 1);
        }
    } else {
        return null;
    }

    const pct =
        now <= start ? 0 : now >= end ? 100 : Math.round(((now - start) / (end - start)) * 100);

    const amountStr = fmtAmount(amountTotal ?? 495, currency);
    const caption = inTrial
        ? `Free trial — ends ${fmtDate(end)} · ${amountStr}/month after`
        : `Next charge on ${fmtDate(end)} · ${amountStr}`;

    return (
        <div className="order-progress">
            <div className="order-progress-track">
                <div className="order-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="order-progress-caption">{caption}</div>
        </div>
    );
}

/* ---------- labels ---------- */
function statusLabel(order) {
    if ((order.type || "").toLowerCase() !== "subscription") {
        switch ((order.fulfillmentStatus || "").toLowerCase()) {
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
    const s = (order.status || "").toLowerCase();
    if (order.cancel_at_period_end && (s === "active" || s === "trialing"))
        return "Cancels at end of period";
    switch (s) {
        case "active":
            return "Subscription active";
        case "trialing":
            return "Trial active";
        case "canceled":
            return "Subscription canceled";
        default:
            return "Subscription";
    }
}
function statusBadgeClass(order) {
    if ((order.type || "").toLowerCase() !== "subscription") {
        switch ((order.fulfillmentStatus || "").toLowerCase()) {
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
    const s = (order.status || "").toLowerCase();
    if (order.cancel_at_period_end && (s === "active" || s === "trialing")) return "status-canceled";
    switch (s) {
        case "active":
        case "trialing":
            return "status-active";
        case "canceled":
            return "status-canceled";
        default:
            return "status-active";
    }
}

/* ---------- key/value block ---------- */
function KV({ label, children }) {
    return (
        <div className="order-kv">
            <div className="kv-label">{label}</div>
            <div className="kv-value">{children}</div>
        </div>
    );
}

export default function MyOrders() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);
    const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 600);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [actionMsg, setActionMsg] = useState("");

    const { user } = useContext(AuthContext); // ✅ get user
    const username = user?.username;
    const visitUrl = username ? `https://www.konarcard.com/u/${username}` : "#"; // ✅ generate visit url

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

    const fetchOrders = async () => {
        const res = await api.get("/me/orders", { params: { ts: Date.now() } });
        const raw = Array.isArray(res?.data?.data) ? res.data.data : [];
        setOrders(
            raw.map((o) => ({
                ...o,
                id: o.id || o._id,
            }))
        );
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                setErr("");
                await fetchOrders();
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

    const visibleOrders = useMemo(() => {
        const HIDE = new Set(["pending", "incomplete", "incomplete_expired"]);
        return (orders || []).filter((o) => {
            const type = (o.type || "").toLowerCase();
            const status = (o.status || "").toLowerCase();
            if (type === "subscription" && HIDE.has(status)) return false;
            return true;
        });
    }, [orders]);

    const hasAnyActiveSub = useMemo(
        () =>
            (visibleOrders || []).some(
                (o) =>
                    (o.type || "").toLowerCase() === "subscription" &&
                    activeStripeStatuses.has((o.status || "").toLowerCase())
            ),
        [visibleOrders]
    );

    async function syncStripeOrders() {
        try {
            await api.post("/me/sync-subscriptions", { ts: Date.now() });
        } catch { }
    }

    async function handleCancelSubscription(order) {
        setActionMsg("");
        const ok = window.confirm(
            "Cancel this subscription at the end of the current period?"
        );
        if (!ok) return;

        try {
            await api.post("/cancel-subscription", {
                id: order.id || order._id,
                stripeSubscriptionId: order.stripeSubscriptionId || order.subscriptionId,
            });

            setActionMsg("Subscription will cancel at the end of the current billing period.");
            await syncStripeOrders();
            await fetchOrders();
        } catch (e) {
            setActionMsg(e?.response?.data?.error || "Failed to cancel subscription");
        }
    }

    async function resubscribeNow() {
        setActionMsg("");
        try {
            const res = await api.post("/subscribe");
            const url = res?.data?.url;
            if (url) window.location.href = url;
            else setActionMsg("Could not start checkout.");
        } catch (e) {
            setActionMsg(e?.response?.data?.error || "Could not start checkout.");
        }
    }

    async function reorderNow(orderId) {
        setActionMsg("");
        try {
            const res = await api.post("/reorder", { orderId });
            const url = res?.data?.url;
            if (url) window.location.href = url;
            else setActionMsg("Could not start checkout.");
        } catch (e) {
            setActionMsg(e?.response?.data?.error || "Could not start checkout.");
        }
    }

    function renderSubscription(o) {
        const cancelledOn =
            o.status?.toLowerCase() === "canceled"
                ? o.metadata?.cancelledAt || o.updatedAt
                : null;

        return (
            <>
                <KV label="Status">
                    {o.status}
                    {o.cancel_at_period_end && o.status !== "canceled"
                        ? " (cancelling at period end)"
                        : ""}
                </KV>
                {cancelledOn && <KV label="Canceled on">{fmtDateTime(cancelledOn)}</KV>}
                <div className="order-progress-wrap">
                    <SubscriptionProgress
                        trialEnd={o.trialEnd}
                        currentPeriodEnd={o.currentPeriodEnd}
                        currentPeriodStart={o.currentPeriodStart}
                        createdAt={o.createdAt}
                        amountTotal={o.amountTotal}
                        currency={o.currency}
                    />
                </div>
            </>
        );
    }

    function renderCard(o) {
        return (
            <>
                <KV label="Quantity">{o.quantity || 1}</KV>
                <KV label="Amount">{fmtAmount(o.amountTotal, o.currency)}</KV>
                <KV label="Estimated delivery">
                    {o.deliveryWindow || o.metadata?.estimatedDelivery || "—"}
                </KV>
                <KV label="Delivery name">{o.deliveryName || "—"}</KV>
                <KV label="Delivery address">{o.deliveryAddress || "—"}</KV>
                <div className="order-progress-wrap">
                    <CardProgress status={o.fulfillmentStatus || "order_placed"} />
                </div>
            </>
        );
    }

    return (
        <div className={`app-layout ${sidebarOpen ? "sidebar-active" : ""} orders-page`}>
            {/* Mobile header */}
            <div className="myprofile-mobile-header">
                <Link to="/myprofile" className="myprofile-logo-link">
                    <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
                </Link>
                <div
                    className={`sidebar-menu-toggle ${sidebarOpen ? "active" : ""}`}
                    onClick={() => setSidebarOpen((s) => !s)}
                >
                    <span></span><span></span><span></span>
                </div>
            </div>

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {sidebarOpen && isMobile && (
                <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Fill viewport; header sticky; wrapper scrolls */}
            <main className="main-content-container orders-main">
                <PageHeader
                    title="My Orders"
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                    visitUrl={visitUrl} // ✅ now Visit Page button works
                />

                {/* Peach shell wrapper (scrolls internally on desktop) */}
                <div className="profile-page-wrapper">
                    <section className="orders-container">
                        {loading ? (
                            <p className="orders-hint">Loading orders…</p>
                        ) : err ? (
                            <p className="error-text">{err}</p>
                        ) : visibleOrders.length === 0 ? (
                            <div className="orders-empty">
                                <div className="orders-empty-badge">Orders</div>
                                <h3 className="orders-empty-title">No orders yet</h3>
                                <p className="orders-empty-sub">
                                    Your purchases will appear here once you’ve checked out.
                                </p>
                                <Link to="/productandplan" className="cta-accent-button desktop-button">
                                    Browse products
                                </Link>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {visibleOrders.map((o) => {
                                    const isSub = (o.type || "").toLowerCase() === "subscription";
                                    const cancelled = isSub && (o.status || "").toLowerCase() === "canceled";
                                    const id = o.id || o._id;

                                    return (
                                        <article key={id} className={`order-card ${isSub ? "is-subscription" : ""}`}>
                                            <div className={`order-status-badge ${statusBadgeClass(o)}`}>
                                                {statusLabel(o)}
                                            </div>

                                            <div className="order-thumb">
                                                <img src={ProductThumb} alt="Product" className="order-thumb-img" />
                                            </div>

                                            <div className="order-details">
                                                <header className="order-meta">
                                                    <span className="type">{o.type}</span>
                                                    <span aria-hidden="true">•</span>
                                                    <span className="status">{o.status}</span>
                                                    <span aria-hidden="true">•</span>
                                                    <time>{fmtDateTime(o.createdAt)}</time>
                                                </header>

                                                <div className="order-fields">
                                                    {isSub ? renderSubscription(o) : renderCard(o)}
                                                </div>

                                                <div className="order-actions">
                                                    {isSub ? (
                                                        cancelled ? (
                                                            hasAnyActiveSub ? (
                                                                <button className="cta-black-button desktop-button disabled" disabled>
                                                                    Cancelled
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={resubscribeNow}
                                                                    className="cta-black-button desktop-button"
                                                                >
                                                                    Resubscribe now
                                                                </button>
                                                            )
                                                        ) : (
                                                            <button
                                                                onClick={() => handleCancelSubscription(o)}
                                                                className="cta-black-button desktop-button"
                                                            >
                                                                Cancel subscription
                                                            </button>
                                                        )
                                                    ) : (
                                                        <button
                                                            onClick={() => reorderNow(id)}
                                                            className="cta-black-button desktop-button"
                                                        >
                                                            Buy Again
                                                        </button>
                                                    )}

                                                    <Link
                                                        to={isSub ? `/SuccessSubscription?id=${id}` : `/success?id=${id}`}
                                                        className="view-details desktop-button cta-accent-button"
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
                </div>
            </main>
        </div>
    );
}
