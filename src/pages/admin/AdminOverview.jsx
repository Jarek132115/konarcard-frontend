// src/pages/admin/AdminOverview.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";

function formatAmount(amount, currency = "gbp") {
    if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";

    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: String(currency || "gbp").toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount / 100);
}

function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function cleanString(v) {
    return String(v || "").trim();
}

function StatCard({ label, value, subvalue }) {
    return (
        <div className="admin-stat-card">
            <div className="admin-stat-label">{label}</div>
            <div className="admin-stat-value">{value}</div>
            {subvalue ? <div className="admin-stat-subvalue">{subvalue}</div> : null}
        </div>
    );
}

function SectionCard({ title, subtitle, right, children }) {
    return (
        <section className="admin-section-card">
            <div className="admin-section-head">
                <div>
                    <h2 className="admin-section-title">{title}</h2>
                    {subtitle ? <p className="admin-section-subtitle">{subtitle}</p> : null}
                </div>

                {right ? <div className="admin-section-right">{right}</div> : null}
            </div>

            {children}
        </section>
    );
}

function Pill({ children, tone = "neutral" }) {
    return <span className={`admin-pill admin-pill--${tone}`}>{children}</span>;
}

function Btn({ children, tone = "primary", className = "", ...props }) {
    return (
        <button
            {...props}
            className={`admin-btn admin-btn--${tone} ${className}`.trim()}
        >
            {children}
        </button>
    );
}

function getPlanTone(plan) {
    const p = cleanString(plan).toLowerCase();
    if (p === "teams") return "info";
    if (p === "plus") return "success";
    return "neutral";
}

function getSubscriptionTone(status) {
    const s = cleanString(status).toLowerCase();
    if (s === "active" || s === "trialing") return "success";
    if (s === "past_due") return "warn";
    if (s === "canceled" || s === "cancelled") return "danger";
    return "neutral";
}

function getFulfillmentTone(status) {
    const s = cleanString(status).toLowerCase();
    if (s === "delivered") return "success";
    if (s === "shipped") return "info";
    if (s === "packaged" || s === "designing_card") return "warn";
    return "neutral";
}

export default function AdminOverview() {
    const navigate = useNavigate();

    const [summaryLoading, setSummaryLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const [ordersLoading, setOrdersLoading] = useState(false);

    const [summaryError, setSummaryError] = useState("");
    const [usersError, setUsersError] = useState("");
    const [ordersError, setOrdersError] = useState("");

    const [summary, setSummary] = useState({
        totalUsers: 0,
        totalProfiles: 0,
        totalOrders: 0,
        activeSubscribers: 0,
        paidOrders: 0,
    });

    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);

    async function loadSummary() {
        setSummaryLoading(true);
        setSummaryError("");

        try {
            const res = await api.get("/api/admin/summary");
            setSummary(res?.data?.data || {});
        } catch (e) {
            setSummaryError(e?.response?.data?.error || "Failed to load summary");
        } finally {
            setSummaryLoading(false);
        }
    }

    async function loadUsers() {
        setUsersLoading(true);
        setUsersError("");

        try {
            const res = await api.get("/api/admin/users");
            const data = Array.isArray(res?.data?.data) ? res.data.data : [];
            setUsers(data);
        } catch (e) {
            setUsersError(e?.response?.data?.error || "Failed to load users");
        } finally {
            setUsersLoading(false);
        }
    }

    async function loadOrders() {
        setOrdersLoading(true);
        setOrdersError("");

        try {
            const res = await api.get("/api/admin/orders");
            const data = Array.isArray(res?.data?.data) ? res.data.data : [];
            setOrders(data);
        } catch (e) {
            setOrdersError(e?.response?.data?.error || "Failed to load orders");
        } finally {
            setOrdersLoading(false);
        }
    }

    async function refreshAll() {
        await Promise.all([loadSummary(), loadUsers(), loadOrders()]);
    }

    useEffect(() => {
        refreshAll();
    }, []);

    const totalRevenue = useMemo(() => {
        return orders.reduce((sum, order) => {
            const amount =
                typeof order?.amountTotal === "number" ? order.amountTotal : 0;
            return sum + amount;
        }, 0);
    }, [orders]);

    const deliveredCount = useMemo(() => {
        return orders.filter(
            (order) =>
                cleanString(order?.fulfillmentStatus).toLowerCase() === "delivered"
        ).length;
    }, [orders]);

    return (
        <AdminLayout>
            <header className="admin-page-header">
                <div className="admin-page-header-copy">
                    <p className="admin-page-kicker">KonarCard Admin</p>
                    <h1 className="admin-page-title">Overview</h1>
                    <p className="admin-page-subtitle">
                        Your business snapshot across users, subscriptions, profiles,
                        and card orders.
                    </p>
                </div>

                <div className="admin-page-actions">
                    <Btn tone="ghost" onClick={refreshAll}>
                        Refresh all
                    </Btn>
                    <Btn tone="orange" onClick={() => navigate("/admin/orders")}>
                        Open orders
                    </Btn>
                </div>
            </header>

            <div className="admin-stats-grid">
                <StatCard
                    label="Total users"
                    value={summaryLoading ? "…" : summary.totalUsers || 0}
                />
                <StatCard
                    label="Total profiles"
                    value={summaryLoading ? "…" : summary.totalProfiles || 0}
                />
                <StatCard
                    label="Total orders"
                    value={summaryLoading ? "…" : summary.totalOrders || 0}
                />
                <StatCard
                    label="Active subscribers"
                    value={summaryLoading ? "…" : summary.activeSubscribers || 0}
                />
                <StatCard
                    label="Revenue from loaded orders"
                    value={formatAmount(totalRevenue, "gbp")}
                    subvalue={`${deliveredCount} delivered`}
                />
            </div>

            {summaryError ? (
                <div className="admin-error-banner">{summaryError}</div>
            ) : null}

            <div className="admin-grid-2-wide">
                <SectionCard
                    title="Recent users"
                    subtitle="Newest accounts on KonarCard."
                    right={
                        <Btn tone="ghost" onClick={() => navigate("/admin/users")}>
                            Open users
                        </Btn>
                    }
                >
                    {usersLoading ? (
                        <p className="admin-muted" style={{ margin: 0 }}>
                            Loading users…
                        </p>
                    ) : usersError ? (
                        <p className="admin-error-banner" style={{ margin: 0 }}>
                            {usersError}
                        </p>
                    ) : users.length === 0 ? (
                        <div className="admin-empty-state">No users found.</div>
                    ) : (
                        <div className="admin-list">
                            {users.slice(0, 6).map((user) => (
                                <button
                                    key={user._id}
                                    type="button"
                                    className="admin-user-card"
                                    onClick={() =>
                                        navigate(`/admin/users?selected=${user._id}`)
                                    }
                                >
                                    <div className="admin-item-head">
                                        <div>
                                            <div className="admin-item-title">
                                                {user.name ||
                                                    user.username ||
                                                    user.email ||
                                                    "User"}
                                            </div>
                                            <div className="admin-item-subtitle">
                                                {user.email || "—"}
                                            </div>
                                        </div>

                                        <div className="admin-row">
                                            <Pill tone={getPlanTone(user.plan)}>
                                                {user.plan || "free"}
                                            </Pill>
                                            <Pill
                                                tone={getSubscriptionTone(
                                                    user.subscriptionStatus
                                                )}
                                            >
                                                {user.subscriptionStatus || "free"}
                                            </Pill>
                                        </div>
                                    </div>

                                    <div className="admin-item-meta">
                                        <span>{user.profileCount || 0} profiles</span>
                                        <span>{user.orderCount || 0} orders</span>
                                        <span>Joined {formatDate(user.createdAt)}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    title="Recent orders"
                    subtitle="Latest card orders and fulfilment progress."
                    right={
                        <Btn tone="ghost" onClick={() => navigate("/admin/orders")}>
                            Open orders
                        </Btn>
                    }
                >
                    {ordersLoading ? (
                        <p className="admin-muted" style={{ margin: 0 }}>
                            Loading orders…
                        </p>
                    ) : ordersError ? (
                        <p className="admin-error-banner" style={{ margin: 0 }}>
                            {ordersError}
                        </p>
                    ) : orders.length === 0 ? (
                        <div className="admin-empty-state">No orders found.</div>
                    ) : (
                        <div className="admin-list">
                            {orders.slice(0, 6).map((order) => (
                                <div key={order._id} className="admin-order-card">
                                    <div className="admin-item-head">
                                        <div>
                                            <div className="admin-item-title">
                                                {order.user?.name ||
                                                    order.customerName ||
                                                    order.customerEmail ||
                                                    "Order"}
                                            </div>
                                            <div className="admin-item-subtitle">
                                                {order.productKey || "Product"}
                                                {order.variant ? ` • ${order.variant}` : ""}
                                            </div>
                                        </div>

                                        <div className="admin-row">
                                            <Pill
                                                tone={getFulfillmentTone(
                                                    order.fulfillmentStatus
                                                )}
                                            >
                                                {order.fulfillmentStatus ||
                                                    "order_placed"}
                                            </Pill>
                                            <Pill>
                                                {formatAmount(
                                                    order.amountTotal,
                                                    order.currency
                                                )}
                                            </Pill>
                                        </div>
                                    </div>

                                    <div className="admin-item-meta">
                                        <span>Qty {order.quantity || 1}</span>
                                        <span>{formatDate(order.createdAt)}</span>
                                        <span>
                                            {order.profile?.profile_slug || "No profile"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>
            </div>
        </AdminLayout>
    );
}