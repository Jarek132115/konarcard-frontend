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
        <div
            style={{
                background: "#fff",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 20,
                padding: 20,
                boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
                minHeight: 110,
            }}
        >
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>
                {label}
            </div>
            <div
                style={{
                    fontSize: 30,
                    fontWeight: 700,
                    color: "#0f172a",
                    lineHeight: 1.1,
                }}
            >
                {value}
            </div>
            {subvalue ? (
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
                    {subvalue}
                </div>
            ) : null}
        </div>
    );
}

function SectionCard({ title, subtitle, right, children }) {
    return (
        <section
            style={{
                background: "#fff",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 24,
                padding: 24,
                boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    gap: 16,
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 18,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: 22,
                            lineHeight: 1.15,
                            color: "#0f172a",
                        }}
                    >
                        {title}
                    </h2>
                    {subtitle ? (
                        <p
                            style={{
                                margin: "8px 0 0",
                                color: "#64748b",
                                fontSize: 14,
                            }}
                        >
                            {subtitle}
                        </p>
                    ) : null}
                </div>
                {right ? <div>{right}</div> : null}
            </div>

            {children}
        </section>
    );
}

function Pill({ children, tone = "neutral" }) {
    const styles = {
        neutral: {
            background: "#f8fafc",
            border: "1px solid rgba(15,23,42,0.08)",
            color: "#334155",
        },
        success: {
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
        },
        warn: {
            background: "#fff7ed",
            border: "1px solid #fdba74",
            color: "#9a3412",
        },
        danger: {
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
        },
        info: {
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1d4ed8",
        },
    };

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 999,
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                ...styles[tone],
            }}
        >
            {children}
        </span>
    );
}

function Btn({ children, tone = "primary", ...props }) {
    const styles = {
        primary: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid #0f172a",
        },
        ghost: {
            background: "#fff",
            color: "#0f172a",
            border: "1px solid rgba(15,23,42,0.10)",
        },
        orange: {
            background: "#f97316",
            color: "#fff",
            border: "1px solid #f97316",
        },
    };

    return (
        <button
            {...props}
            style={{
                minHeight: 42,
                padding: "0 14px",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 600,
                cursor: props.disabled ? "not-allowed" : "pointer",
                opacity: props.disabled ? 0.6 : 1,
                ...styles[tone],
                ...(props.style || {}),
            }}
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
            const amount = typeof order?.amountTotal === "number" ? order.amountTotal : 0;
            return sum + amount;
        }, 0);
    }, [orders]);

    const deliveredCount = useMemo(() => {
        return orders.filter(
            (order) => cleanString(order?.fulfillmentStatus).toLowerCase() === "delivered"
        ).length;
    }, [orders]);

    return (
        <AdminLayout>
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <p
                        style={{
                            margin: 0,
                            color: "#f97316",
                            fontWeight: 700,
                            fontSize: 13,
                            letterSpacing: "0.02em",
                            textTransform: "uppercase",
                        }}
                    >
                        KonarCard Admin
                    </p>

                    <h1
                        style={{
                            margin: "8px 0 0",
                            fontSize: 34,
                            lineHeight: 1.05,
                            color: "#0f172a",
                        }}
                    >
                        Overview
                    </h1>

                    <p
                        style={{
                            margin: "10px 0 0",
                            color: "#64748b",
                            fontSize: 15,
                        }}
                    >
                        Your business snapshot across users, subscriptions, profiles, and card orders.
                    </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Btn tone="ghost" onClick={refreshAll}>
                        Refresh all
                    </Btn>
                    <Btn tone="orange" onClick={() => navigate("/admin/orders")}>
                        Open orders
                    </Btn>
                </div>
            </header>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, minmax(0,1fr))",
                    gap: 16,
                }}
            >
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
                <div
                    style={{
                        padding: 14,
                        borderRadius: 16,
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        color: "#991b1b",
                        fontSize: 14,
                    }}
                >
                    {summaryError}
                </div>
            ) : null}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.15fr 1fr",
                    gap: 20,
                }}
            >
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
                        <p style={{ color: "#64748b", margin: 0 }}>Loading users…</p>
                    ) : usersError ? (
                        <p style={{ color: "#991b1b", margin: 0 }}>{usersError}</p>
                    ) : users.length === 0 ? (
                        <p style={{ color: "#64748b", margin: 0 }}>No users found.</p>
                    ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                            {users.slice(0, 6).map((user) => (
                                <button
                                    key={user._id}
                                    type="button"
                                    onClick={() => navigate(`/admin/users?selected=${user._id}`)}
                                    style={{
                                        width: "100%",
                                        textAlign: "left",
                                        borderRadius: 18,
                                        border: "1px solid rgba(15,23,42,0.08)",
                                        background: "#fff",
                                        padding: 16,
                                        cursor: "pointer",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15 }}>
                                                {user.name || user.username || user.email || "User"}
                                            </div>
                                            <div
                                                style={{
                                                    marginTop: 4,
                                                    color: "#64748b",
                                                    fontSize: 13,
                                                }}
                                            >
                                                {user.email || "—"}
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            <Pill tone={getPlanTone(user.plan)}>
                                                {user.plan || "free"}
                                            </Pill>
                                            <Pill tone={getSubscriptionTone(user.subscriptionStatus)}>
                                                {user.subscriptionStatus || "free"}
                                            </Pill>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 16,
                                            marginTop: 12,
                                            flexWrap: "wrap",
                                            color: "#64748b",
                                            fontSize: 13,
                                        }}
                                    >
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
                        <p style={{ color: "#64748b", margin: 0 }}>Loading orders…</p>
                    ) : ordersError ? (
                        <p style={{ color: "#991b1b", margin: 0 }}>{ordersError}</p>
                    ) : orders.length === 0 ? (
                        <p style={{ color: "#64748b", margin: 0 }}>No orders found.</p>
                    ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                            {orders.slice(0, 6).map((order) => (
                                <div
                                    key={order._id}
                                    style={{
                                        borderRadius: 18,
                                        border: "1px solid rgba(15,23,42,0.08)",
                                        background: "#fff",
                                        padding: 16,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 15 }}>
                                                {order.user?.name ||
                                                    order.customerName ||
                                                    order.customerEmail ||
                                                    "Order"}
                                            </div>
                                            <div
                                                style={{
                                                    marginTop: 4,
                                                    color: "#64748b",
                                                    fontSize: 13,
                                                }}
                                            >
                                                {order.productKey || "Product"}{" "}
                                                {order.variant ? `• ${order.variant}` : ""}
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                            <Pill tone={getFulfillmentTone(order.fulfillmentStatus)}>
                                                {order.fulfillmentStatus || "order_placed"}
                                            </Pill>
                                            <Pill>{formatAmount(order.amountTotal, order.currency)}</Pill>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 16,
                                            marginTop: 12,
                                            flexWrap: "wrap",
                                            color: "#64748b",
                                            fontSize: 13,
                                        }}
                                    >
                                        <span>Qty {order.quantity || 1}</span>
                                        <span>{formatDate(order.createdAt)}</span>
                                        <span>{order.profile?.profile_slug || "No profile"}</span>
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