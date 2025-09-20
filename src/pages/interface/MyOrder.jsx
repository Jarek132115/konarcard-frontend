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

function formatFulfillmentStatus(order) {
    if ((order.type || "").toLowerCase() === "subscription") {
        switch ((order.status || "").toLowerCase()) {
            case "active": return "Subscription active";
            case "canceled": return "Subscription canceled";
            case "trialing": return "Trial active";
            default: return "Subscription";
        }
    }
    switch ((order.fulfillmentStatus || "").toLowerCase()) {
        case "order_placed": return "Order placed";
        case "designing_card": return "Designing card";
        case "packaged": return "Packaged";
        case "shipped": return "Shipped";
        default: return "Order placed";
    }
}

function statusBadgeClass(order) {
    if ((order.type || "").toLowerCase() === "subscription") {
        switch ((order.status || "").toLowerCase()) {
            case "active":
            case "trialing": return "status-active";
            case "canceled": return "status-canceled";
            default: return "status-active";
        }
    }
    switch ((order.fulfillmentStatus || "").toLowerCase()) {
        case "order_placed": return "status-placed";
        case "designing_card": return "status-designing";
        case "packaged": return "status-packaged";
        case "shipped": return "status-shipped";
        default: return "status-placed";
    }
}

function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
}
function formatDateTimeNoSeconds(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
    });
}

/* Card fulfilment progress 1–4 */
function CardProgress({ status }) {
    const map = { order_placed: 0, designing_card: 1, packaged: 2, shipped: 3 };
    const idx = map[(status || "").toLowerCase()] ?? 0;
    const percent = Math.max(0, Math.min(100, (idx / 3) * 100));
    return (
        <div className="order-progress">
            <div className="order-progress-track">
                <div className="order-progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <div className="order-progress-caption">
                {idx + 1} / 4 · {formatFulfillmentStatus({ fulfillmentStatus: status })}
            </div>
        </div>
    );
}

/* Subscription progress */
function SubscriptionProgress({ trialEnd, currentPeriodEnd, amountTotal, currency }) {
    const now = new Date();
    const inTrial = trialEnd && new Date(trialEnd) > now;
    const end = inTrial ? new Date(trialEnd) : currentPeriodEnd ? new Date(currentPeriodEnd) : null;
    if (!end) return null;

    let percent = 0;
    if (!inTrial) {
        const start = new Date(end);
        start.setMonth(start.getMonth() - 1);
        percent = now <= start ? 0 : now >= end ? 100 : Math.round(((now - start) / (end - start)) * 100);
    }

    const amountStr = formatAmount(amountTotal ?? 495, currency);
    const caption = inTrial
        ? `Free trial — ends ${formatDate(end)} · ${amountStr}/month after`
        : `Next charge on ${formatDate(end)} · ${amountStr}`;

    return (
        <div className="order-progress">
            <div className="order-progress-track">
                <div className="order-progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <div className="order-progress-caption">{caption}</div>
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
    const [confirmingCancelId, setConfirmingCancelId] = useState(null);

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

    async function reload() {
        const res = await api.get("/me/orders", { params: { ts: Date.now() } });
        setOrders(Array.isArray(res?.data?.data) ? res.data.data : []);
    }

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
        return () => { mounted = false; };
    }, []);

    async function cancelSubscription(orderId) {
        setActionMsg("");
        try {
            await api.post("/cancel-subscription", { id: orderId });
            setActionMsg("Subscription will cancel at the end of the current billing period.");
            await reload();
        } catch (e) {
            setActionMsg(e?.response?.data?.error || "Failed to cancel subscription");
        } finally {
            setConfirmingCancelId(null);
        }
    }

    async function resubscribeNow() {
        try {
            const res = await api.post("/subscribe");
            const url = res?.data?.url;
            if (url) window.location.href = url;
        } catch (e) {
            setActionMsg(e?.response?.data?.error || "Could not start checkout.");
        }
    }

    function renderSubscription(o) {
        const cancelledAt =
            (o.metadata && o.metadata.cancelledAt) ? o.metadata.cancelledAt : (o.status === "canceled" ? o.updatedAt : null);

        return (
            <>
                <div className="order-line"><strong>Status:</strong> {o.status}</div>
                {o.status === "canceled" && cancelledAt && (
                    <div className="order-line"><strong>Canceled on:</strong> {formatDateTimeNoSeconds(cancelledAt)}</div>
                )}
                <div className="order-line order-progress-wrap">
                    <SubscriptionProgress
                        trialEnd={o.trialEnd}
                        currentPeriodEnd={o.currentPeriodEnd}
                        amountTotal={o.amountTotal}
                        currency={o.currency}
                    />
                </div>
            </>
        );
    }

    function renderCard(o) {
        const amount = formatAmount(o.amountTotal, o.currency);
        const delivery = o.deliveryWindow || o.metadata?.estimatedDelivery || "—";
        const qty = o.quantity || 1;
        const fulfillRaw = o.fulfillmentStatus || "order_placed";

        return (
            <>
                <div className="order-line"><strong>Quantity:</strong> {qty}</div>
                <div className="order-line"><strong>Amount:</strong> {amount}</div>
                <div className="order-line"><strong>Estimated delivery:</strong> {delivery}</div>
                <div className="order-line order-progress-wrap"><CardProgress status={fulfillRaw} /></div>
            </>
        );
    }

    return (
        <div className={`app-layout ${sidebarOpen ? "sidebar-active" : ""}`}>
            <div className="myprofile-mobile-header">
                <Link to="/myprofile" className="myprofile-logo-link">
                    <img src={LogoIcon} alt="Logo" className="myprofile-logo" />
                </Link>
                <div className={`sidebar-menu-toggle ${sidebarOpen ? "active" : ""}`} onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <span></span><span></span><span></span>
                </div>
            </div>

            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            {sidebarOpen && isMobile && <div className="sidebar-overlay active" onClick={() => setSidebarOpen(false)} />}

            <main className="main-content-container">
                <PageHeader title="My Orders" isMobile={isMobile} isSmallMobile={isSmallMobile} />

                <section className="orders-container">
                    {loading ? (
                        <p className="orders-hint">Loading orders…</p>
                    ) : err ? (
                        <p className="error-text">{err}</p>
                    ) : orders.length === 0 ? (
                        <div className="orders-empty">
                            <div className="orders-empty-badge">Orders</div>
                            <h3 className="orders-empty-title">No orders yet</h3>
                            <p className="orders-empty-sub">Your purchases will appear here once you’ve checked out.</p>
                            <Link to="/productandplan" className="cta-blue-button desktop-button">Browse products</Link>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map((o) => {
                                const isSub = (o.type || "").toLowerCase() === "subscription";
                                const canceled = isSub && o.status === "canceled";

                                return (
                                    <article key={o.id} className={`order-card ${isSub ? "is-subscription" : ""}`}>
                                        <div className={`order-status-badge ${statusBadgeClass(o)}`}>{formatFulfillmentStatus(o)}</div>

                                        <div className="order-thumb">
                                            <img src={ProductThumb} alt="Product" className="order-thumb-img" />
                                        </div>

                                        <div className="order-details">
                                            <header className="order-meta">
                                                <span className="type">{o.type}</span>
                                                <span aria-hidden="true">•</span>
                                                <span className="status">{o.status}</span>
                                                <span aria-hidden="true">•</span>
                                                <time>{formatDateTimeNoSeconds(o.createdAt)}</time>
                                            </header>

                                            <div className="order-fields">
                                                {isSub ? renderSubscription(o) : renderCard(o)}
                                                {!isSub && (
                                                    <>
                                                        <div className="order-line order-info">
                                                            <span className="dot" aria-hidden="true" />
                                                            <div className="reason">
                                                                <div className="desktop-body-s"><strong>Delivery name:</strong></div>
                                                                <div className="desktop-body-xs">{o.deliveryName || "—"}</div>
                                                            </div>
                                                        </div>
                                                        <div className="order-line order-info">
                                                            <span className="dot" aria-hidden="true" />
                                                            <div className="reason">
                                                                <div className="desktop-body-s"><strong>Delivery address:</strong></div>
                                                                <div className="desktop-body-xs">{o.deliveryAddress || "—"}</div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="order-actions">
                                                {isSub ? (
                                                    canceled ? (
                                                        <button onClick={resubscribeNow} className="cta-black-button desktop-button">Resubscribe now</button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                confirmingCancelId === o.id ? cancelSubscription(o.id) : setConfirmingCancelId(o.id)
                                                            }
                                                            className="cta-black-button desktop-button"
                                                        >
                                                            {confirmingCancelId === o.id ? "Confirm cancel" : "Cancel subscription"}
                                                        </button>
                                                    )
                                                ) : (
                                                    <button onClick={() => navigate("/contactus")} className="cta-black-button desktop-button">
                                                        Order Another
                                                    </button>
                                                )}

                                                <Link
                                                    to={isSub ? `/SuccessSubscription?id=${o.id}` : `/success?id=${o.id}`}
                                                    className="view-details desktop-button cta-blue-button"
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
