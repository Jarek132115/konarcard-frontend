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

function EmptyState({ text }) {
    return <div className="admin-empty-state">{text}</div>;
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
            <header className="admin-page-header">
                <div className="admin-page-header-copy">
                    <p className="admin-page-kicker">KonarCard Admin</p>
                    <h1 className="admin-page-title">Business analytics</h1>
                    <p className="admin-page-subtitle">
                        Track growth, revenue, subscriptions, order performance,
                        and product demand across the whole business.
                    </p>
                </div>

                <div className="admin-page-actions">
                    <Btn tone="ghost" onClick={loadAll}>
                        Refresh analytics
                    </Btn>
                    <Btn tone="orange" onClick={() => navigate("/admin/orders")}>
                        Open orders
                    </Btn>
                </div>
            </header>

            <div className="admin-stats-grid admin-stats-grid--six">
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

            {error ? <div className="admin-error-banner">{error}</div> : null}

            <div className="admin-grid-2-wider">
                <SectionCard title="User growth" subtitle="New users joining over the last 30 days.">
                    {usersJoinedTrend.length ? (
                        <div className="admin-chart-wrap">
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
                        <div className="admin-chart-wrap">
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
                                            <Cell
                                                key={entry.name}
                                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                                            />
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

            <div className="admin-grid-2-wide">
                <SectionCard
                    title="Orders and revenue trend"
                    subtitle="Order volume and paid revenue over the last 30 days."
                >
                    {ordersTrend.length ? (
                        <div className="admin-chart-wrap admin-chart-wrap--lg">
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
                        <div className="admin-chart-wrap admin-chart-wrap--lg">
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
                                            <Cell
                                                key={entry.name}
                                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                                            />
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

            <div className="admin-grid-2">
                <SectionCard
                    title="Order payment state"
                    subtitle="Paid vs pending vs failed vs cancelled."
                >
                    {orderStatusSplit.length ? (
                        <div className="admin-chart-wrap">
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
                                            <Cell
                                                key={entry.name}
                                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                                            />
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
                        <div className="admin-chart-wrap">
                            <ResponsiveContainer>
                                <BarChart data={fulfillmentSplit}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar
                                        dataKey="value"
                                        name="Orders"
                                        fill="#f97316"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState text="No fulfilment data yet." />
                    )}
                </SectionCard>
            </div>

            <div className="admin-grid-2">
                <SectionCard title="Top products" subtitle="Best selling products by ordered quantity.">
                    {!topProducts.length ? (
                        <EmptyState text="No product sales data yet." />
                    ) : (
                        <div className="admin-analytics-list">
                            {topProducts.map((item, index) => (
                                <div key={item.name} className="admin-analytics-row">
                                    <div>
                                        <div className="admin-analytics-row-title">
                                            {index + 1}. {item.name}
                                        </div>
                                    </div>
                                    <div className="admin-analytics-row-value">
                                        <strong>{item.value} units</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                <SectionCard title="Top customers" subtitle="Users generating the most paid revenue.">
                    {!topCustomers.length ? (
                        <EmptyState text="No customer revenue data yet." />
                    ) : (
                        <div className="admin-analytics-list">
                            {topCustomers.map((customer, index) => (
                                <div
                                    key={`${customer.email}-${index}`}
                                    className="admin-analytics-row"
                                >
                                    <div>
                                        <div className="admin-analytics-row-title">
                                            {index + 1}. {customer.name}
                                        </div>
                                        <div className="admin-analytics-row-subtitle">
                                            {customer.email || "No email"}
                                        </div>
                                    </div>
                                    <div className="admin-analytics-row-value">
                                        <strong>{formatAmount(customer.spent)}</strong>
                                        <span>{customer.orders} orders</span>
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