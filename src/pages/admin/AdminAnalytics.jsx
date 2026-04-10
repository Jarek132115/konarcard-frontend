// src/pages/admin/AdminAnalytics.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";

function cleanString(v) {
    return String(v || "").trim();
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

function formatDayLabel(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
    });
}

function startOfDay(dateLike) {
    const d = new Date(dateLike);
    d.setHours(0, 0, 0, 0);
    return d;
}

function buildLastNDays(days) {
    const rows = [];
    const now = new Date();
    const end = startOfDay(now);

    for (let i = days - 1; i >= 0; i -= 1) {
        const d = new Date(end);
        d.setDate(d.getDate() - i);

        const key = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
        rows.push({
            key,
            label: formatDayLabel(d),
        });
    }

    return rows;
}

function getStatusBucket(status) {
    const s = cleanString(status).toLowerCase();

    if (["paid", "processing", "fulfilled", "shipped", "complete", "completed"].includes(s)) {
        return "paid";
    }
    if (["failed", "payment_failed"].includes(s)) return "failed";
    if (["cancelled", "canceled", "expired"].includes(s)) return "cancelled";
    return "pending";
}

function getFulfillmentLabel(status) {
    const s = cleanString(status).toLowerCase();
    if (s === "order_placed") return "Order placed";
    if (s === "designing_card") return "Preparing";
    if (s === "packaged") return "Packaged";
    if (s === "shipped") return "Shipped";
    if (s === "delivered") return "Delivered";
    return "Unknown";
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

function EmptyState({ text }) {
    return (
        <div
            style={{
                minHeight: 260,
                borderRadius: 18,
                border: "1px dashed rgba(15,23,42,0.12)",
                display: "grid",
                placeItems: "center",
                color: "#64748b",
                fontSize: 14,
            }}
        >
            {text}
        </div>
    );
}

const PIE_COLORS = ["#0f172a", "#f97316", "#0ea5e9", "#22c55e", "#e11d48", "#a855f7"];

export default function AdminAnalytics() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [summary, setSummary] = useState({
        totalUsers: 0,
        totalProfiles: 0,
        totalOrders: 0,
        activeSubscribers: 0,
        paidOrders: 0,
    });

    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);

    async function loadAll() {
        setLoading(true);
        setError("");

        try {
            const [summaryRes, usersRes, ordersRes] = await Promise.all([
                api.get("/api/admin/summary"),
                api.get("/api/admin/users"),
                api.get("/api/admin/orders"),
            ]);

            setSummary(summaryRes?.data?.data || {});
            setUsers(Array.isArray(usersRes?.data?.data) ? usersRes.data.data : []);
            setOrders(Array.isArray(ordersRes?.data?.data) ? ordersRes.data.data : []);
        } catch (e) {
            setError(e?.response?.data?.error || "Failed to load admin analytics");
            setSummary({
                totalUsers: 0,
                totalProfiles: 0,
                totalOrders: 0,
                activeSubscribers: 0,
                paidOrders: 0,
            });
            setUsers([]);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAll();
    }, []);

    const totalRevenueMinor = useMemo(() => {
        return orders.reduce((sum, order) => {
            const isPaid = getStatusBucket(order?.status) === "paid";
            const amount = typeof order?.amountTotal === "number" ? order.amountTotal : 0;
            return sum + (isPaid ? amount : 0);
        }, 0);
    }, [orders]);

    const averageOrderValueMinor = useMemo(() => {
        const paid = orders.filter((order) => getStatusBucket(order?.status) === "paid");
        if (!paid.length) return 0;

        const total = paid.reduce((sum, order) => {
            const amount = typeof order?.amountTotal === "number" ? order.amountTotal : 0;
            return sum + amount;
        }, 0);

        return Math.round(total / paid.length);
    }, [orders]);

    const usersJoinedTrend = useMemo(() => {
        const days = buildLastNDays(30);
        const counts = new Map(days.map((d) => [d.key, 0]));

        users.forEach((user) => {
            const createdAt = user?.createdAt;
            if (!createdAt) return;

            const d = startOfDay(createdAt);
            const key = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
            if (counts.has(key)) {
                counts.set(key, Number(counts.get(key) || 0) + 1);
            }
        });

        return days.map((d) => ({
            date: d.key,
            label: d.label,
            users: counts.get(d.key) || 0,
        }));
    }, [users]);

    const ordersTrend = useMemo(() => {
        const days = buildLastNDays(30);
        const counts = new Map(
            days.map((d) => [
                d.key,
                {
                    orders: 0,
                    revenue: 0,
                },
            ])
        );

        orders.forEach((order) => {
            const createdAt = order?.createdAt;
            if (!createdAt) return;

            const d = startOfDay(createdAt);
            const key = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;

            if (!counts.has(key)) return;

            const row = counts.get(key) || { orders: 0, revenue: 0 };
            row.orders += 1;

            if (getStatusBucket(order?.status) === "paid") {
                row.revenue += typeof order?.amountTotal === "number" ? order.amountTotal / 100 : 0;
            }

            counts.set(key, row);
        });

        return days.map((d) => {
            const row = counts.get(d.key) || { orders: 0, revenue: 0 };
            return {
                date: d.key,
                label: d.label,
                orders: row.orders,
                revenue: Number(row.revenue.toFixed(2)),
            };
        });
    }, [orders]);

    const planSplit = useMemo(() => {
        const counts = {
            free: 0,
            plus: 0,
            teams: 0,
            other: 0,
        };

        users.forEach((user) => {
            const plan = cleanString(user?.plan).toLowerCase();
            if (plan === "free") counts.free += 1;
            else if (plan === "plus") counts.plus += 1;
            else if (plan === "teams") counts.teams += 1;
            else counts.other += 1;
        });

        return [
            { name: "Free", value: counts.free },
            { name: "Plus", value: counts.plus },
            { name: "Teams", value: counts.teams },
            { name: "Other", value: counts.other },
        ].filter((item) => item.value > 0);
    }, [users]);

    const subscriptionSplit = useMemo(() => {
        const counts = {};

        users.forEach((user) => {
            const status = cleanString(user?.subscriptionStatus).toLowerCase() || "unknown";
            counts[status] = Number(counts[status] || 0) + 1;
        });

        return Object.entries(counts).map(([key, value]) => ({
            name: key.replace(/_/g, " "),
            value,
        }));
    }, [users]);

    const orderStatusSplit = useMemo(() => {
        const counts = {
            paid: 0,
            pending: 0,
            failed: 0,
            cancelled: 0,
        };

        orders.forEach((order) => {
            const bucket = getStatusBucket(order?.status);
            counts[bucket] = Number(counts[bucket] || 0) + 1;
        });

        return [
            { name: "Paid", value: counts.paid },
            { name: "Pending", value: counts.pending },
            { name: "Failed", value: counts.failed },
            { name: "Cancelled", value: counts.cancelled },
        ].filter((item) => item.value > 0);
    }, [orders]);

    const fulfillmentSplit = useMemo(() => {
        const counts = {};

        orders.forEach((order) => {
            const label = getFulfillmentLabel(order?.fulfillmentStatus);
            counts[label] = Number(counts[label] || 0) + 1;
        });

        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
        }));
    }, [orders]);

    const topProducts = useMemo(() => {
        const counts = {};

        orders.forEach((order) => {
            const label = `${cleanString(order?.productKey) || "unknown"}${cleanString(order?.variant) ? ` • ${cleanString(order.variant)}` : ""
                }`;
            counts[label] = Number(counts[label] || 0) + Number(order?.quantity || 1);
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [orders]);

    const topCustomers = useMemo(() => {
        const map = {};

        orders.forEach((order) => {
            const key = cleanString(order?.userId || order?.customerEmail || order?._id);
            if (!key) return;

            if (!map[key]) {
                map[key] = {
                    name:
                        cleanString(order?.user?.name) ||
                        cleanString(order?.customerName) ||
                        cleanString(order?.customerEmail) ||
                        "Customer",
                    email: cleanString(order?.customerEmail) || cleanString(order?.user?.email),
                    orders: 0,
                    spent: 0,
                };
            }

            map[key].orders += 1;

            if (getStatusBucket(order?.status) === "paid") {
                map[key].spent += typeof order?.amountTotal === "number" ? order.amountTotal : 0;
            }
        });

        return Object.values(map)
            .sort((a, b) => b.spent - a.spent || b.orders - a.orders)
            .slice(0, 8);
    }, [orders]);

    const conversionStats = useMemo(() => {
        const paidOrders = orders.filter((order) => getStatusBucket(order?.status) === "paid").length;
        const activeSubscribers = users.filter((user) =>
            ["active", "trialing"].includes(cleanString(user?.subscriptionStatus).toLowerCase())
        ).length;

        const paidOrderRate =
            summary.totalUsers > 0 ? Number(((paidOrders / summary.totalUsers) * 100).toFixed(1)) : 0;

        const activeSubscriberRate =
            summary.totalUsers > 0
                ? Number(((activeSubscribers / summary.totalUsers) * 100).toFixed(1))
                : 0;

        return {
            paidOrders,
            activeSubscribers,
            paidOrderRate,
            activeSubscriberRate,
        };
    }, [orders, users, summary.totalUsers]);

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
                        Business analytics
                    </h1>

                    <p style={{ margin: "10px 0 0", color: "#64748b", fontSize: 15 }}>
                        Track growth, revenue, subscriptions, order performance, and product demand across the whole business.
                    </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Btn tone="ghost" onClick={loadAll}>
                        Refresh analytics
                    </Btn>
                    <Btn tone="orange" onClick={() => navigate("/admin/orders")}>
                        Open orders
                    </Btn>
                </div>
            </header>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(6, minmax(0,1fr))",
                    gap: 16,
                }}
            >
                <StatCard label="Total users" value={loading ? "…" : summary.totalUsers || 0} />
                <StatCard
                    label="Active subscribers"
                    value={loading ? "…" : conversionStats.activeSubscribers}
                    subvalue={`${conversionStats.activeSubscriberRate}% of users`}
                />
                <StatCard label="Total orders" value={loading ? "…" : summary.totalOrders || 0} />
                <StatCard
                    label="Paid orders"
                    value={loading ? "…" : conversionStats.paidOrders}
                    subvalue={`${conversionStats.paidOrderRate}% of users`}
                />
                <StatCard label="Revenue" value={loading ? "…" : formatAmount(totalRevenueMinor)} />
                <StatCard
                    label="Avg paid order"
                    value={loading ? "…" : formatAmount(averageOrderValueMinor)}
                />
            </div>

            {error ? (
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
                    {error}
                </div>
            ) : null}

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
                <SectionCard title="User growth" subtitle="New users joining over the last 30 days.">
                    {usersJoinedTrend.length ? (
                        <div style={{ width: "100%", height: 320 }}>
                            <ResponsiveContainer>
                                <AreaChart data={usersJoinedTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#0f172a"
                                        fill="#f97316"
                                        fillOpacity={0.15}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState text="No user data available yet." />
                    )}
                </SectionCard>

                <SectionCard title="Plan split" subtitle="How your users are distributed across plans.">
                    {planSplit.length ? (
                        <div style={{ width: "100%", height: 320 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={planSplit}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {planSplit.map((entry, index) => (
                                            <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState text="No plan data available yet." />
                    )}
                </SectionCard>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 20 }}>
                <SectionCard
                    title="Orders and revenue trend"
                    subtitle="Order volume and paid revenue over the last 30 days."
                >
                    {ordersTrend.length ? (
                        <div style={{ width: "100%", height: 340 }}>
                            <ResponsiveContainer>
                                <BarChart data={ordersTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis yAxisId="left" allowDecimals={false} />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        yAxisId="left"
                                        dataKey="orders"
                                        name="Orders"
                                        fill="#0f172a"
                                        radius={[8, 8, 0, 0]}
                                    />
                                    <Bar
                                        yAxisId="right"
                                        dataKey="revenue"
                                        name="Revenue (£)"
                                        fill="#f97316"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState text="No order trend available yet." />
                    )}
                </SectionCard>

                <SectionCard
                    title="Subscription status"
                    subtitle="Snapshot of billing state across all users."
                >
                    {subscriptionSplit.length ? (
                        <div style={{ width: "100%", height: 340 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={subscriptionSplit}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {subscriptionSplit.map((entry, index) => (
                                            <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState text="No subscription status data yet." />
                    )}
                </SectionCard>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <SectionCard
                    title="Order payment state"
                    subtitle="Paid vs pending vs failed vs cancelled."
                >
                    {orderStatusSplit.length ? (
                        <div style={{ width: "100%", height: 320 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={orderStatusSplit}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {orderStatusSplit.map((entry, index) => (
                                            <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState text="No payment state data yet." />
                    )}
                </SectionCard>

                <SectionCard
                    title="Fulfilment state"
                    subtitle="Where physical orders currently sit in the fulfilment flow."
                >
                    {fulfillmentSplit.length ? (
                        <div style={{ width: "100%", height: 320 }}>
                            <ResponsiveContainer>
                                <BarChart data={fulfillmentSplit}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" name="Orders" fill="#f97316" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState text="No fulfilment data yet." />
                    )}
                </SectionCard>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <SectionCard title="Top products" subtitle="Best selling products by ordered quantity.">
                    {!topProducts.length ? (
                        <EmptyState text="No product sales data yet." />
                    ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                            {topProducts.map((item, index) => (
                                <div
                                    key={item.name}
                                    style={{
                                        borderRadius: 16,
                                        border: "1px solid rgba(15,23,42,0.08)",
                                        padding: 14,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 16,
                                        alignItems: "center",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15 }}>
                                            {index + 1}. {item.name}
                                        </div>
                                    </div>
                                    <div style={{ color: "#64748b", fontSize: 14 }}>{item.value} units</div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                <SectionCard title="Top customers" subtitle="Users generating the most paid revenue.">
                    {!topCustomers.length ? (
                        <EmptyState text="No customer revenue data yet." />
                    ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                            {topCustomers.map((customer, index) => (
                                <div
                                    key={`${customer.email}-${index}`}
                                    style={{
                                        borderRadius: 16,
                                        border: "1px solid rgba(15,23,42,0.08)",
                                        padding: 14,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 16,
                                        alignItems: "center",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 15 }}>
                                            {index + 1}. {customer.name}
                                        </div>
                                        <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                                            {customer.email || "No email"}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontWeight: 700, fontSize: 15 }}>
                                            {formatAmount(customer.spent)}
                                        </div>
                                        <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                                            {customer.orders} orders
                                        </div>
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