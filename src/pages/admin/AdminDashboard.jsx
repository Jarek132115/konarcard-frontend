import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import LogoIcon from "../../assets/icons/Logo-Icon.svg";

const STATUS_OPTIONS = [
    { value: "order_placed", label: "Order placed" },
    { value: "designing_card", label: "Card is being prepared" },
    { value: "packaged", label: "Packaged" },
    { value: "shipped", label: "Shipment is on the way" },
    { value: "delivered", label: "Delivered" },
];

function cleanString(v) {
    return String(v || "").trim();
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

function formatAmount(amount, currency = "gbp") {
    if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: String(currency || "gbp").toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount / 100);
}

function buildPublicProfileUrl(slug) {
    const safe = cleanString(slug).toLowerCase();
    return safe ? `https://www.konarcard.com/u/${encodeURIComponent(safe)}` : "";
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
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>{label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#0f172a", lineHeight: 1.1 }}>
                {value}
            </div>
            {subvalue ? (
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>{subvalue}</div>
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

function TextInput(props) {
    return (
        <input
            {...props}
            style={{
                width: "100%",
                minHeight: 44,
                borderRadius: 14,
                border: "1px solid rgba(15,23,42,0.10)",
                background: "#fff",
                padding: "0 14px",
                fontSize: 14,
                color: "#0f172a",
                outline: "none",
                ...(props.style || {}),
            }}
        />
    );
}

function SelectInput(props) {
    return (
        <select
            {...props}
            style={{
                width: "100%",
                minHeight: 44,
                borderRadius: 14,
                border: "1px solid rgba(15,23,42,0.10)",
                background: "#fff",
                padding: "0 14px",
                fontSize: 14,
                color: "#0f172a",
                outline: "none",
                ...(props.style || {}),
            }}
        />
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

export default function AdminDashboard() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("overview");

    const [summary, setSummary] = useState({
        totalUsers: 0,
        totalProfiles: 0,
        totalOrders: 0,
        activeSubscribers: 0,
        paidOrders: 0,
    });

    const [usersLoading, setUsersLoading] = useState(false);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);

    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedUserLoading, setSelectedUserLoading] = useState(false);
    const [selectedUserData, setSelectedUserData] = useState(null);

    const [userSearch, setUserSearch] = useState("");
    const [orderSearch, setOrderSearch] = useState("");
    const [fulfillmentStatus, setFulfillmentStatus] = useState("");

    const [ordersError, setOrdersError] = useState("");
    const [usersError, setUsersError] = useState("");
    const [summaryError, setSummaryError] = useState("");

    const [edit, setEdit] = useState({});

    async function logout() {
        try {
            await api.post("/logout");
        } catch {
            // ignore
        }

        try {
            localStorage.removeItem("token");
            localStorage.removeItem("authUser");
        } catch {
            // ignore
        }

        navigate("/login", { replace: true });
    }

    function setEditField(id, field, value) {
        setEdit((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                [field]: value,
            },
        }));
    }

    function seedOrderEditBuffers(rows) {
        const next = {};
        for (const o of rows || []) {
            next[o._id] = {
                trackingUrl: o.trackingUrl || "",
                trackingCode: o.trackingCode || "",
                deliveryWindow: o.deliveryWindow || "",
                fulfillmentStatus: o.fulfillmentStatus || "order_placed",
                notifyTracking: true,
                notifyStatus: false,
            };
        }
        setEdit(next);
    }

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
            const params = {};
            if (cleanString(userSearch)) params.q = cleanString(userSearch);
            const res = await api.get("/api/admin/users", { params });
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
            const params = {};
            if (cleanString(orderSearch)) params.q = cleanString(orderSearch);
            if (cleanString(fulfillmentStatus)) params.fulfillmentStatus = cleanString(fulfillmentStatus);

            const res = await api.get("/api/admin/orders", { params });
            const data = Array.isArray(res?.data?.data) ? res.data.data : [];
            setOrders(data);
            seedOrderEditBuffers(data);
        } catch (e) {
            setOrdersError(e?.response?.data?.error || "Failed to load orders");
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    }

    async function loadUserDetails(userId) {
        if (!userId) {
            setSelectedUserData(null);
            return;
        }

        setSelectedUserLoading(true);
        try {
            const res = await api.get(`/api/admin/users/${userId}`);
            setSelectedUserData(res?.data?.data || null);
        } catch (e) {
            toast.error(e?.response?.data?.error || "Failed to load user details");
            setSelectedUserData(null);
        } finally {
            setSelectedUserLoading(false);
        }
    }

    async function saveTracking(order) {
        const buf = edit[order._id] || {};
        try {
            await api.patch(`/api/admin/orders/${order._id}/tracking`, {
                trackingUrl: buf.trackingUrl || "",
                trackingCode: buf.trackingCode || "",
                deliveryWindow: buf.deliveryWindow || "",
                notify: !!buf.notifyTracking && !!buf.trackingUrl,
            });

            toast.success("Tracking updated");
            await loadOrders();

            if (selectedUserId) {
                await loadUserDetails(selectedUserId);
            }
        } catch (e) {
            toast.error(e?.response?.data?.error || "Failed to update tracking");
        }
    }

    async function saveStatus(order) {
        const buf = edit[order._id] || {};
        try {
            await api.patch(`/api/admin/orders/${order._id}/status`, {
                fulfillmentStatus: buf.fulfillmentStatus || "order_placed",
                notify: !!buf.notifyStatus,
            });

            toast.success("Status updated");
            await loadOrders();

            if (selectedUserId) {
                await loadUserDetails(selectedUserId);
            }
        } catch (e) {
            toast.error(e?.response?.data?.error || "Failed to update status");
        }
    }

    async function copyText(value, label = "Copied") {
        if (!navigator?.clipboard || !value) return;
        try {
            await navigator.clipboard.writeText(value);
            toast.success(label);
        } catch {
            toast.error("Could not copy");
        }
    }

    useEffect(() => {
        loadSummary();
        loadUsers();
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedUserId) return;
        loadUserDetails(selectedUserId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUserId]);

    const selectedUserOrders = useMemo(() => {
        const rows = selectedUserData?.orders;
        return Array.isArray(rows) ? rows : [];
    }, [selectedUserData]);

    const selectedUserProfiles = useMemo(() => {
        const rows = selectedUserData?.profiles;
        return Array.isArray(rows) ? rows : [];
    }, [selectedUserData]);

    const selectedUser = selectedUserData?.user || null;

    const totalRevenue = useMemo(() => {
        return orders.reduce((sum, order) => {
            const amount = typeof order?.amountTotal === "number" ? order.amountTotal : 0;
            return sum + amount;
        }, 0);
    }, [orders]);

    const deliveredCount = useMemo(() => {
        return orders.filter((o) => cleanString(o.fulfillmentStatus) === "delivered").length;
    }, [orders]);

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f8fafc",
                color: "#0f172a",
                display: "grid",
                gridTemplateColumns: "88px minmax(0,1fr)",
            }}
        >
            <aside
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    background: "#ffffff",
                    borderRight: "1px solid rgba(15,23,42,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "18px 12px",
                    gap: 12,
                }}
            >
                <button
                    type="button"
                    onClick={() => navigate("/admin")}
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 18,
                        border: "1px solid rgba(15,23,42,0.08)",
                        background: "#fff",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                    }}
                >
                    <img src={LogoIcon} alt="KonarCard" style={{ width: 28, height: 28 }} />
                </button>

                <div style={{ width: "100%", marginTop: 18, display: "grid", gap: 10 }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab("overview")}
                        style={{
                            minHeight: 44,
                            borderRadius: 14,
                            border: activeTab === "overview" ? "1px solid #0f172a" : "1px solid rgba(15,23,42,0.08)",
                            background: activeTab === "overview" ? "#0f172a" : "#fff",
                            color: activeTab === "overview" ? "#fff" : "#0f172a",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Overview
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("users")}
                        style={{
                            minHeight: 44,
                            borderRadius: 14,
                            border: activeTab === "users" ? "1px solid #0f172a" : "1px solid rgba(15,23,42,0.08)",
                            background: activeTab === "users" ? "#0f172a" : "#fff",
                            color: activeTab === "users" ? "#fff" : "#0f172a",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Users
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("orders")}
                        style={{
                            minHeight: 44,
                            borderRadius: 14,
                            border: activeTab === "orders" ? "1px solid #0f172a" : "1px solid rgba(15,23,42,0.08)",
                            background: activeTab === "orders" ? "#0f172a" : "#fff",
                            color: activeTab === "orders" ? "#fff" : "#0f172a",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        Orders
                    </button>
                </div>

                <div style={{ flex: 1 }} />

                <button
                    type="button"
                    onClick={logout}
                    style={{
                        width: "100%",
                        minHeight: 44,
                        borderRadius: 14,
                        border: "1px solid rgba(15,23,42,0.08)",
                        background: "#fff",
                        color: "#0f172a",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    Logout
                </button>
            </aside>

            <main style={{ padding: 28 }}>
                <div style={{ maxWidth: 1480, margin: "0 auto", display: "grid", gap: 22 }}>
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
                                Control centre
                            </h1>
                            <p style={{ margin: "10px 0 0", color: "#64748b", fontSize: 15 }}>
                                View users, inspect profiles, manage subscriptions, and control card fulfilment.
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <Btn tone="ghost" onClick={() => { loadSummary(); loadUsers(); loadOrders(); }}>
                                Refresh all
                            </Btn>
                            <Btn tone="orange" onClick={() => setActiveTab("orders")}>
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

                    {activeTab === "overview" ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 20 }}>
                            <SectionCard
                                title="Recent users"
                                subtitle="Newest accounts on KonarCard."
                                right={
                                    <Btn tone="ghost" onClick={() => setActiveTab("users")}>
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
                                                onClick={() => {
                                                    setSelectedUserId(user._id);
                                                    setActiveTab("users");
                                                }}
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
                                                        <div style={{ marginTop: 4, color: "#64748b", fontSize: 13 }}>
                                                            {user.email || "—"}
                                                        </div>
                                                    </div>

                                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                        <Pill tone={getPlanTone(user.plan)}>{user.plan || "free"}</Pill>
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
                                    <Btn tone="ghost" onClick={() => setActiveTab("orders")}>
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
                                                            {order.user?.name || order.customerName || order.customerEmail || "Order"}
                                                        </div>
                                                        <div style={{ marginTop: 4, color: "#64748b", fontSize: 13 }}>
                                                            {order.productKey || "Product"} {order.variant ? `• ${order.variant}` : ""}
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
                                                    <button
                                                        type="button"
                                                        onClick={() => copyText(order._id, "Order ID copied")}
                                                        style={{
                                                            border: 0,
                                                            background: "transparent",
                                                            padding: 0,
                                                            color: "#0f172a",
                                                            cursor: "pointer",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Copy ID
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>
                        </div>
                    ) : null}

                    {activeTab === "users" ? (
                        <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 20 }}>
                            <SectionCard
                                title="All users"
                                subtitle="Search users, open them, and inspect their full KonarCard account."
                                right={
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        <Btn tone="ghost" onClick={loadUsers}>
                                            Refresh
                                        </Btn>
                                    </div>
                                }
                            >
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "minmax(0,1fr) auto auto",
                                        gap: 10,
                                        marginBottom: 16,
                                    }}
                                >
                                    <TextInput
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        placeholder="Search by email, name, username or slug"
                                    />
                                    <Btn tone="primary" onClick={loadUsers}>
                                        Search
                                    </Btn>
                                    <Btn
                                        tone="ghost"
                                        onClick={() => {
                                            setUserSearch("");
                                            setTimeout(loadUsers, 0);
                                        }}
                                    >
                                        Reset
                                    </Btn>
                                </div>

                                {usersLoading ? (
                                    <p style={{ color: "#64748b", margin: 0 }}>Loading users…</p>
                                ) : usersError ? (
                                    <p style={{ color: "#991b1b", margin: 0 }}>{usersError}</p>
                                ) : users.length === 0 ? (
                                    <p style={{ color: "#64748b", margin: 0 }}>No users found.</p>
                                ) : (
                                    <div style={{ display: "grid", gap: 12, maxHeight: 760, overflow: "auto", paddingRight: 4 }}>
                                        {users.map((user) => {
                                            const isSelected = selectedUserId === user._id;
                                            return (
                                                <button
                                                    key={user._id}
                                                    type="button"
                                                    onClick={() => setSelectedUserId(user._id)}
                                                    style={{
                                                        width: "100%",
                                                        textAlign: "left",
                                                        borderRadius: 18,
                                                        border: isSelected
                                                            ? "1px solid #f97316"
                                                            : "1px solid rgba(15,23,42,0.08)",
                                                        background: isSelected ? "#fff7ed" : "#fff",
                                                        padding: 16,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                                                        {user.name || user.username || user.email || "User"}
                                                    </div>
                                                    <div style={{ marginTop: 4, color: "#64748b", fontSize: 13 }}>
                                                        {user.email || "—"}
                                                    </div>

                                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                                                        <Pill tone={getPlanTone(user.plan)}>{user.plan || "free"}</Pill>
                                                        <Pill tone={getSubscriptionTone(user.subscriptionStatus)}>
                                                            {user.subscriptionStatus || "free"}
                                                        </Pill>
                                                        <Pill>{user.profileCount || 0} profiles</Pill>
                                                        <Pill>{user.orderCount || 0} orders</Pill>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </SectionCard>

                            <SectionCard
                                title="User details"
                                subtitle="View profiles, subscription state, and all purchased products."
                            >
                                {!selectedUserId ? (
                                    <p style={{ color: "#64748b", margin: 0 }}>
                                        Select a user from the list to inspect their account.
                                    </p>
                                ) : selectedUserLoading ? (
                                    <p style={{ color: "#64748b", margin: 0 }}>Loading user details…</p>
                                ) : !selectedUser ? (
                                    <p style={{ color: "#64748b", margin: 0 }}>No user details available.</p>
                                ) : (
                                    <div style={{ display: "grid", gap: 20 }}>
                                        <div
                                            style={{
                                                borderRadius: 18,
                                                border: "1px solid rgba(15,23,42,0.08)",
                                                background: "#fff",
                                                padding: 18,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    gap: 12,
                                                    alignItems: "flex-start",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 20 }}>
                                                        {selectedUser.name || selectedUser.username || selectedUser.email || "User"}
                                                    </div>
                                                    <div style={{ color: "#64748b", marginTop: 6, fontSize: 14 }}>
                                                        {selectedUser.email || "—"}
                                                    </div>
                                                </div>

                                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                    <Pill tone={getPlanTone(selectedUser.plan)}>
                                                        {selectedUser.plan || "free"}
                                                    </Pill>
                                                    <Pill tone={getSubscriptionTone(selectedUser.subscriptionStatus)}>
                                                        {selectedUser.subscriptionStatus || "free"}
                                                    </Pill>
                                                    <Pill>{selectedUser.role || "user"}</Pill>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                                                    gap: 12,
                                                    marginTop: 18,
                                                    fontSize: 14,
                                                }}
                                            >
                                                <div><strong>Username:</strong> {selectedUser.username || "—"}</div>
                                                <div><strong>Slug:</strong> {selectedUser.slug || "—"}</div>
                                                <div><strong>Verified:</strong> {selectedUser.isVerified ? "Yes" : "No"}</div>
                                                <div><strong>Joined:</strong> {formatDate(selectedUser.createdAt)}</div>
                                                <div><strong>Plan interval:</strong> {selectedUser.planInterval || "—"}</div>
                                                <div><strong>Current period end:</strong> {formatDate(selectedUser.currentPeriodEnd)}</div>
                                                <div><strong>Team profiles allowed:</strong> {selectedUser.teamsProfilesQty || 1}</div>
                                                <div><strong>Paid extra profiles:</strong> {selectedUser.extraProfilesQty || 0}</div>
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                borderRadius: 18,
                                                border: "1px solid rgba(15,23,42,0.08)",
                                                background: "#fff",
                                                padding: 18,
                                            }}
                                        >
                                            <h3 style={{ margin: 0, fontSize: 18 }}>Profiles</h3>
                                            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                                                {selectedUserProfiles.length === 0 ? (
                                                    <p style={{ color: "#64748b", margin: 0 }}>No profiles found.</p>
                                                ) : (
                                                    selectedUserProfiles.map((profile) => {
                                                        const profileUrl =
                                                            profile.publicUrl || buildPublicProfileUrl(profile.profile_slug);
                                                        return (
                                                            <div
                                                                key={profile._id}
                                                                style={{
                                                                    borderRadius: 16,
                                                                    border: "1px solid rgba(15,23,42,0.08)",
                                                                    padding: 14,
                                                                }}
                                                            >
                                                                <div style={{ fontWeight: 700 }}>
                                                                    {profile.business_card_name ||
                                                                        profile.business_name ||
                                                                        profile.full_name ||
                                                                        profile.profile_slug}
                                                                </div>
                                                                <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>
                                                                    /u/{profile.profile_slug}
                                                                </div>
                                                                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                                                                    <Btn
                                                                        tone="ghost"
                                                                        onClick={() => window.open(profileUrl, "_blank", "noopener,noreferrer")}
                                                                    >
                                                                        Open profile
                                                                    </Btn>
                                                                    <Btn
                                                                        tone="ghost"
                                                                        onClick={() => copyText(profileUrl, "Profile link copied")}
                                                                    >
                                                                        Copy link
                                                                    </Btn>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                borderRadius: 18,
                                                border: "1px solid rgba(15,23,42,0.08)",
                                                background: "#fff",
                                                padding: 18,
                                            }}
                                        >
                                            <h3 style={{ margin: 0, fontSize: 18 }}>Orders</h3>
                                            <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                                                {selectedUserOrders.length === 0 ? (
                                                    <p style={{ color: "#64748b", margin: 0 }}>No orders found.</p>
                                                ) : (
                                                    selectedUserOrders.map((order) => (
                                                        <div
                                                            key={order._id}
                                                            style={{
                                                                borderRadius: 16,
                                                                border: "1px solid rgba(15,23,42,0.08)",
                                                                padding: 14,
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
                                                                    <div style={{ fontWeight: 700 }}>
                                                                        {order.productKey || "Product"} {order.variant ? `• ${order.variant}` : ""}
                                                                    </div>
                                                                    <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>
                                                                        {formatAmount(order.amountTotal, order.currency)} • Qty {order.quantity || 1}
                                                                    </div>
                                                                </div>

                                                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                                    <Pill>{order.status || "pending"}</Pill>
                                                                    <Pill tone={getFulfillmentTone(order.fulfillmentStatus)}>
                                                                        {order.fulfillmentStatus || "order_placed"}
                                                                    </Pill>
                                                                </div>
                                                            </div>

                                                            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                                                <Btn
                                                                    tone="ghost"
                                                                    onClick={() => {
                                                                        setActiveTab("orders");
                                                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                                                    }}
                                                                >
                                                                    Manage in orders
                                                                </Btn>
                                                                <Btn
                                                                    tone="ghost"
                                                                    onClick={() => copyText(order._id, "Order ID copied")}
                                                                >
                                                                    Copy order ID
                                                                </Btn>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </SectionCard>
                        </div>
                    ) : null}

                    {activeTab === "orders" ? (
                        <SectionCard
                            title="Order fulfilment"
                            subtitle="Update shipping progress, tracking links, and customer email notifications."
                            right={
                                <Btn tone="ghost" onClick={loadOrders}>
                                    Refresh
                                </Btn>
                            }
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "minmax(0,1fr) 220px auto auto",
                                    gap: 10,
                                    marginBottom: 18,
                                }}
                            >
                                <TextInput
                                    value={orderSearch}
                                    onChange={(e) => setOrderSearch(e.target.value)}
                                    placeholder="Search by email, name, username, slug, order ID"
                                />
                                <SelectInput
                                    value={fulfillmentStatus}
                                    onChange={(e) => setFulfillmentStatus(e.target.value)}
                                >
                                    <option value="">Any fulfilment status</option>
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </SelectInput>
                                <Btn tone="primary" onClick={loadOrders}>
                                    Apply
                                </Btn>
                                <Btn
                                    tone="ghost"
                                    onClick={() => {
                                        setOrderSearch("");
                                        setFulfillmentStatus("");
                                        setTimeout(loadOrders, 0);
                                    }}
                                >
                                    Reset
                                </Btn>
                            </div>

                            {ordersLoading ? (
                                <p style={{ color: "#64748b", margin: 0 }}>Loading orders…</p>
                            ) : ordersError ? (
                                <p style={{ color: "#991b1b", margin: 0 }}>{ordersError}</p>
                            ) : orders.length === 0 ? (
                                <p style={{ color: "#64748b", margin: 0 }}>No orders found.</p>
                            ) : (
                                <div style={{ display: "grid", gap: 16 }}>
                                    {orders.map((order) => {
                                        const id = order._id;
                                        const buffer = edit[id] || {};

                                        return (
                                            <div
                                                key={id}
                                                style={{
                                                    borderRadius: 20,
                                                    border: "1px solid rgba(15,23,42,0.08)",
                                                    background: "#fff",
                                                    padding: 18,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        gap: 14,
                                                        alignItems: "flex-start",
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                                            <Pill>{order.status || "pending"}</Pill>
                                                            <Pill tone={getFulfillmentTone(order.fulfillmentStatus)}>
                                                                {order.fulfillmentStatus || "order_placed"}
                                                            </Pill>
                                                            <Pill tone={getPlanTone(order?.user?.plan)}>{order?.user?.plan || "free"}</Pill>
                                                        </div>

                                                        <h3 style={{ margin: "12px 0 0", fontSize: 20 }}>
                                                            {order.customerName || order?.user?.name || order.customerEmail || "Order"}
                                                        </h3>
                                                        <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
                                                            {order.customerEmail || order?.user?.email || "—"}
                                                        </div>
                                                    </div>

                                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                                        <Btn tone="ghost" onClick={() => copyText(order._id, "Order ID copied")}>
                                                            Copy order ID
                                                        </Btn>
                                                        {order.profile?.profile_slug ? (
                                                            <Btn
                                                                tone="ghost"
                                                                onClick={() =>
                                                                    window.open(
                                                                        buildPublicProfileUrl(order.profile.profile_slug),
                                                                        "_blank",
                                                                        "noopener,noreferrer"
                                                                    )
                                                                }
                                                            >
                                                                Open profile
                                                            </Btn>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                                                        gap: 12,
                                                        marginTop: 18,
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    <div><strong>Product:</strong> {order.productKey || "—"}</div>
                                                    <div><strong>Variant:</strong> {order.variant || "—"}</div>
                                                    <div><strong>Amount:</strong> {formatAmount(order.amountTotal, order.currency)}</div>
                                                    <div><strong>Quantity:</strong> {order.quantity || 1}</div>
                                                    <div><strong>Created:</strong> {formatDate(order.createdAt)}</div>
                                                    <div><strong>Profile:</strong> {order.profile?.profile_slug || "—"}</div>
                                                    <div><strong>Tracking:</strong> {order.trackingUrl || "—"}</div>
                                                    <div><strong>ETA:</strong> {order.deliveryWindow || "—"}</div>
                                                    <div style={{ gridColumn: "1 / -1" }}>
                                                        <strong>Address:</strong> {order.deliveryAddress || "—"}
                                                    </div>
                                                </div>

                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                                                        gap: 16,
                                                        marginTop: 20,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            borderRadius: 16,
                                                            border: "1px solid rgba(15,23,42,0.08)",
                                                            padding: 16,
                                                        }}
                                                    >
                                                        <h4 style={{ margin: 0, fontSize: 16 }}>Tracking & shipping</h4>

                                                        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                                                            <TextInput
                                                                placeholder="Tracking URL"
                                                                value={buffer.trackingUrl || ""}
                                                                onChange={(e) => setEditField(id, "trackingUrl", e.target.value)}
                                                            />
                                                            <TextInput
                                                                placeholder="Tracking code"
                                                                value={buffer.trackingCode || ""}
                                                                onChange={(e) => setEditField(id, "trackingCode", e.target.value)}
                                                            />
                                                            <TextInput
                                                                placeholder="Estimated delivery window"
                                                                value={buffer.deliveryWindow || ""}
                                                                onChange={(e) => setEditField(id, "deliveryWindow", e.target.value)}
                                                            />

                                                            <label
                                                                style={{
                                                                    display: "flex",
                                                                    gap: 10,
                                                                    alignItems: "center",
                                                                    fontSize: 14,
                                                                    color: "#475569",
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!buffer.notifyTracking}
                                                                    onChange={(e) => setEditField(id, "notifyTracking", e.target.checked)}
                                                                />
                                                                Email customer tracking update
                                                            </label>

                                                            <Btn tone="primary" onClick={() => saveTracking(order)}>
                                                                Save tracking
                                                            </Btn>
                                                        </div>
                                                    </div>

                                                    <div
                                                        style={{
                                                            borderRadius: 16,
                                                            border: "1px solid rgba(15,23,42,0.08)",
                                                            padding: 16,
                                                        }}
                                                    >
                                                        <h4 style={{ margin: 0, fontSize: 16 }}>Fulfilment status</h4>

                                                        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                                                            <SelectInput
                                                                value={buffer.fulfillmentStatus || "order_placed"}
                                                                onChange={(e) => setEditField(id, "fulfillmentStatus", e.target.value)}
                                                            >
                                                                {STATUS_OPTIONS.map((opt) => (
                                                                    <option key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </option>
                                                                ))}
                                                            </SelectInput>

                                                            <label
                                                                style={{
                                                                    display: "flex",
                                                                    gap: 10,
                                                                    alignItems: "center",
                                                                    fontSize: 14,
                                                                    color: "#475569",
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!buffer.notifyStatus}
                                                                    onChange={(e) => setEditField(id, "notifyStatus", e.target.checked)}
                                                                />
                                                                Email customer status update
                                                            </label>

                                                            <Btn tone="orange" onClick={() => saveStatus(order)}>
                                                                Save status
                                                            </Btn>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </SectionCard>
                    ) : null}
                </div>
            </main>
        </div>
    );
}