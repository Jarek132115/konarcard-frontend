// src/pages/interface/Settings.jsx
import React, { useMemo } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import "../../styling/dashboard/settings.css";

import { useAuthUser } from "../../hooks/useAuthUser";
import api from "../../services/api";

/**
 * Settings page:
 * - Account details (Google vs Email login)
 * - Billing / subscription
 * - Orders
 * - Invoices
 *
 * Notes:
 * - We don't allow editing Google identity details from our app.
 * - Orders/invoices are shown if your backend endpoints exist.
 */

const safeLower = (v) => String(v || "").toLowerCase();
const fmtDate = (d) => {
    try {
        if (!d) return "";
        const x = new Date(d);
        if (Number.isNaN(x.getTime())) return "";
        return x.toLocaleDateString();
    } catch {
        return "";
    }
};

export default function Settings() {
    const { data: authUser, isLoading, isError, refetch } = useAuthUser();

    const plan = safeLower(authUser?.plan || "free");
    const isTeams = plan === "teams";
    const isPlus = plan === "plus";
    const planLabel = isTeams ? "Teams" : isPlus ? "Plus" : "Free";

    // Detect Google sign-in (supports different possible backend field names)
    const isGoogleLogin = useMemo(() => {
        const provider = safeLower(authUser?.provider || authUser?.authProvider || authUser?.loginProvider);
        return (
            provider === "google" ||
            !!authUser?.googleId ||
            !!authUser?.google_id ||
            !!authUser?.googleSub ||
            !!authUser?.google_sub
        );
    }, [authUser]);

    const displayName = authUser?.name || authUser?.full_name || "—";
    const displayEmail = authUser?.email || "—";

    const createdAt = fmtDate(authUser?.createdAt || authUser?.created_at);
    const updatedAt = fmtDate(authUser?.updatedAt || authUser?.updated_at);

    // Optional subscription fields (if your backend provides them)
    const renewAt = fmtDate(authUser?.currentPeriodEnd || authUser?.current_period_end || authUser?.renewAt);

    const openBillingPortal = async () => {
        try {
            // Try a few likely endpoints (first one that works wins)
            const candidates = [
                "/api/checkout/portal",
                "/api/checkout/customer-portal",
                "/api/stripe/portal",
            ];

            let lastErr = null;

            for (const path of candidates) {
                try {
                    const res = await api.post(path, {});
                    const url = res?.data?.url || res?.data?.portalUrl || res?.data?.redirectUrl;
                    if (url) {
                        window.location.href = url;
                        return;
                    }
                } catch (e) {
                    lastErr = e;
                }
            }

            const msg =
                lastErr?.response?.data?.error ||
                lastErr?.message ||
                "Billing portal isn't available yet. Add a backend endpoint for it.";
            alert(msg);
        } catch (e) {
            alert(e?.response?.data?.error || e?.message || "Could not open billing portal.");
        }
    };

    const fetchList = async (path) => {
        try {
            const res = await api.get(path);
            // Support a few response shapes
            return res?.data?.data || res?.data || [];
        } catch (e) {
            // 404 or not implemented -> treat as empty
            return [];
        }
    };

    // We fetch orders/invoices in a simple way (no react-query required here).
    // If you prefer react-query, we can refactor after your backend endpoints are confirmed.
    const [orders, setOrders] = React.useState(null);
    const [invoices, setInvoices] = React.useState(null);
    const [loadingLists, setLoadingLists] = React.useState(false);

    React.useEffect(() => {
        if (!authUser) return;
        let cancelled = false;

        (async () => {
            setLoadingLists(true);
            const [o, i] = await Promise.all([
                fetchList("/api/orders"),
                fetchList("/api/invoices"),
            ]);
            if (cancelled) return;
            setOrders(Array.isArray(o) ? o : []);
            setInvoices(Array.isArray(i) ? i : []);
            setLoadingLists(false);
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser?.email]);

    if (isLoading) {
        return (
            <DashboardLayout title="Settings" subtitle="Manage your account and preferences.">
                <div className="settings-shell">
                    <div className="settings-card settings-skel" />
                    <div className="settings-card settings-skel" />
                </div>
            </DashboardLayout>
        );
    }

    if (isError) {
        return (
            <DashboardLayout
                title="Settings"
                subtitle="Manage your account and preferences."
                rightSlot={
                    <button className="settings-btn settings-btn-primary" onClick={() => refetch?.()}>
                        Retry
                    </button>
                }
            >
                <div className="settings-shell">
                    <div className="settings-card">
                        <h2 className="settings-card-title">Couldn’t load your settings</h2>
                        <p className="settings-muted">Please try again.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Settings" subtitle="Manage your account, billing, orders and invoices.">
            <div className="settings-shell">
                {/* ACCOUNT */}
                <section className="settings-card">
                    <div className="settings-card-head">
                        <div>
                            <h2 className="settings-card-title">Account</h2>
                            <p className="settings-muted">
                                Your login method determines what details can be edited.
                            </p>
                        </div>
                        <span className="settings-pill">
                            Login: <strong>{isGoogleLogin ? "GOOGLE" : "EMAIL"}</strong>
                        </span>
                    </div>

                    <div className="settings-grid-2">
                        <div className="settings-field">
                            <label className="settings-label">Name</label>
                            <input className="settings-input" value={displayName} disabled />
                            {isGoogleLogin ? (
                                <div className="settings-hint">
                                    This is managed by Google — you can’t change it here.
                                </div>
                            ) : null}
                        </div>

                        <div className="settings-field">
                            <label className="settings-label">Email</label>
                            <input className="settings-input" value={displayEmail} disabled />
                            {isGoogleLogin ? (
                                <div className="settings-hint">
                                    This is managed by Google — you can’t change it here.
                                </div>
                            ) : null}
                        </div>

                        <div className="settings-meta-row">
                            <div className="settings-meta">
                                <div className="settings-meta-k">Created</div>
                                <div className="settings-meta-v">{createdAt || "—"}</div>
                            </div>
                            <div className="settings-meta">
                                <div className="settings-meta-k">Last updated</div>
                                <div className="settings-meta-v">{updatedAt || "—"}</div>
                            </div>
                        </div>

                        {!isGoogleLogin ? (
                            <div className="settings-actions">
                                <button
                                    type="button"
                                    className="settings-btn settings-btn-ghost"
                                    onClick={() => alert("Next step: add Change Password flow + endpoint.")}
                                >
                                    Change password
                                </button>

                                <button
                                    type="button"
                                    className="settings-btn settings-btn-danger"
                                    onClick={() => alert("Next step: add Delete Account flow + endpoint.")}
                                >
                                    Delete account
                                </button>
                            </div>
                        ) : (
                            <div className="settings-actions">
                                <button
                                    type="button"
                                    className="settings-btn settings-btn-ghost"
                                    onClick={() =>
                                        alert("Google account details must be changed in your Google account settings.")
                                    }
                                >
                                    Manage Google account
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* BILLING */}
                <section className="settings-card">
                    <div className="settings-card-head">
                        <div>
                            <h2 className="settings-card-title">Billing</h2>
                            <p className="settings-muted">View your plan and manage payments.</p>
                        </div>

                        <span className="settings-pill">
                            Plan: <strong>{planLabel.toUpperCase()}</strong>
                        </span>
                    </div>

                    <div className="settings-billing-row">
                        <div className="settings-billing-left">
                            <div className="settings-billing-line">
                                <span className="settings-billing-k">Current plan</span>
                                <span className="settings-billing-v">{planLabel}</span>
                            </div>

                            <div className="settings-billing-line">
                                <span className="settings-billing-k">Renews</span>
                                <span className="settings-billing-v">{renewAt || "—"}</span>
                            </div>

                            <div className="settings-hint">
                                Orders and invoices will appear below once your backend is storing them.
                            </div>
                        </div>

                        <div className="settings-billing-actions">
                            <button className="settings-btn settings-btn-primary" onClick={openBillingPortal}>
                                Manage billing
                            </button>
                            <button
                                className="settings-btn settings-btn-ghost"
                                onClick={() => (window.location.href = "/pricing")}
                            >
                                View plans
                            </button>
                        </div>
                    </div>
                </section>

                {/* ORDERS */}
                <section className="settings-card">
                    <div className="settings-card-head">
                        <div>
                            <h2 className="settings-card-title">Orders</h2>
                            <p className="settings-muted">Purchases such as cards, add-ons, or plan upgrades.</p>
                        </div>
                    </div>

                    {loadingLists && orders === null ? (
                        <div className="settings-muted">Loading…</div>
                    ) : Array.isArray(orders) && orders.length ? (
                        <div className="settings-table">
                            <div className="settings-row settings-row-head">
                                <div>Order</div>
                                <div>Status</div>
                                <div>Amount</div>
                                <div>Date</div>
                            </div>

                            {orders.map((o, idx) => (
                                <div className="settings-row" key={o?.id || o?._id || idx}>
                                    <div className="settings-mono">{o?.number || o?.id || o?._id || "—"}</div>
                                    <div>{o?.status || "—"}</div>
                                    <div>{o?.amountFormatted || o?.amount || "—"}</div>
                                    <div>{fmtDate(o?.createdAt || o?.created_at) || "—"}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="settings-empty">
                            No orders yet.
                            <div className="settings-hint">
                                When you add backend endpoint <strong>/api/orders</strong>, they will show here.
                            </div>
                        </div>
                    )}
                </section>

                {/* INVOICES */}
                <section className="settings-card">
                    <div className="settings-card-head">
                        <div>
                            <h2 className="settings-card-title">Invoices</h2>
                            <p className="settings-muted">Invoices generated for subscriptions and payments.</p>
                        </div>
                    </div>

                    {loadingLists && invoices === null ? (
                        <div className="settings-muted">Loading…</div>
                    ) : Array.isArray(invoices) && invoices.length ? (
                        <div className="settings-table">
                            <div className="settings-row settings-row-head">
                                <div>Invoice</div>
                                <div>Status</div>
                                <div>Total</div>
                                <div>Date</div>
                            </div>

                            {invoices.map((inv, idx) => (
                                <div className="settings-row" key={inv?.id || inv?._id || idx}>
                                    <div className="settings-mono">{inv?.number || inv?.id || inv?._id || "—"}</div>
                                    <div>{inv?.status || "—"}</div>
                                    <div>{inv?.totalFormatted || inv?.total || "—"}</div>
                                    <div>{fmtDate(inv?.createdAt || inv?.created_at) || "—"}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="settings-empty">
                            No invoices yet.
                            <div className="settings-hint">
                                When you add backend endpoint <strong>/api/invoices</strong>, they will show here.
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}
