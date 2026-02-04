// src/pages/interface/Settings.jsx
import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import "../../styling/dashboard/settings.css";

import { useAuthUser } from "../../hooks/useAuthUser";
import api from "../../services/api";

/**
 * Uses backend billingController shapes:
 * - GET  /api/billing/summary  -> { account: {...}, plan, planInterval, subscriptionStatus, currentPeriodEnd }
 * - GET  /api/billing/invoices -> { invoices: [...] }
 * - GET  /api/billing/payments -> { payments: [...] }
 * - POST /api/billing-portal   -> { url }
 */

const safeLower = (v) => String(v || "").toLowerCase();

const fmtDate = (d) => {
    try {
        if (!d) return "—";
        const x = new Date(d);
        if (Number.isNaN(x.getTime())) return "—";
        return x.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
    } catch {
        return "—";
    }
};

const fmtMoneyFromMinor = (minorAmount, currency) => {
    if (minorAmount == null || minorAmount === "") return "—";
    const cur = String(currency || "GBP").toUpperCase();
    const major = typeof minorAmount === "number" ? minorAmount / 100 : Number(minorAmount) / 100;
    if (!Number.isFinite(major)) return "—";

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: cur,
            maximumFractionDigits: 2,
        }).format(major);
    } catch {
        return `${major.toFixed(2)} ${cur}`;
    }
};

export default function Settings() {
    const { data: authUser, isLoading: authLoading, isError: authError, refetch: refetchAuth } = useAuthUser();

    const [summary, setSummary] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadErr, setLoadErr] = useState("");

    useEffect(() => {
        if (authLoading) return;
        if (!authUser) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setLoadErr("");

                // cache bust to avoid 304 stale responses
                const ts = Date.now();

                const [sRes, iRes, pRes] = await Promise.all([
                    api.get(`/api/billing/summary?ts=${ts}`),
                    api.get(`/api/billing/invoices?ts=${ts}`),
                    api.get(`/api/billing/payments?ts=${ts}`),
                ]);

                if (cancelled) return;

                const s = sRes?.data || null;
                const invPayload = iRes?.data || {};
                const payPayload = pRes?.data || {};

                setSummary(s && typeof s === "object" ? s : null);
                setInvoices(Array.isArray(invPayload.invoices) ? invPayload.invoices : []);
                setPayments(Array.isArray(payPayload.payments) ? payPayload.payments : []);
            } catch (e) {
                if (cancelled) return;
                setLoadErr(e?.response?.data?.error || e?.message || "Could not load settings.");
                setSummary(null);
                setInvoices([]);
                setPayments([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [authLoading, authUser]);

    const provider = useMemo(() => {
        const p = safeLower(summary?.account?.authProvider || authUser?.authProvider || authUser?.provider || authUser?.loginProvider);
        return p === "google" ? "google" : "local";
    }, [summary, authUser]);

    const isGoogle = provider === "google";

    const accountName = summary?.account?.name || authUser?.name || authUser?.full_name || "—";
    const accountEmail = summary?.account?.email || authUser?.email || "—";
    const accountAvatar = summary?.account?.avatar || authUser?.avatar || authUser?.picture || authUser?.photoURL || "";

    const plan = summary?.plan || "free";
    const planInterval = summary?.planInterval || null;
    const subscriptionStatus = summary?.subscriptionStatus || "free";
    const currentPeriodEnd = summary?.currentPeriodEnd || null;

    const openBillingPortal = async () => {
        try {
            const res = await api.post("/api/billing-portal", {});
            const url = res?.data?.url;
            if (!url) throw new Error("Billing portal URL missing.");
            window.location.href = url;
        } catch (e) {
            alert(e?.response?.data?.error || e?.message || "Could not open billing portal.");
        }
    };

    const retryAll = async () => {
        setLoadErr("");
        setLoading(true);
        await refetchAuth?.();
    };

    if (authLoading || loading) {
        return (
            <DashboardLayout title="Settings" subtitle="Manage your account and billing.">
                <div className="settings-shell">
                    <div className="settings-card settings-skel" />
                    <div className="settings-card settings-skel" />
                    <div className="settings-card settings-skel" />
                </div>
            </DashboardLayout>
        );
    }

    if (authError || loadErr) {
        return (
            <DashboardLayout
                title="Settings"
                subtitle="Manage your account and billing."
                rightSlot={
                    <button className="settings-btn settings-btn-primary" onClick={retryAll}>
                        Retry
                    </button>
                }
            >
                <div className="settings-shell">
                    <div className="settings-card">
                        <h2 className="settings-card-title">Couldn’t load your settings</h2>
                        <p className="settings-muted">{loadErr || "Please try again."}</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Settings" subtitle="Manage your account, billing, invoices and payments.">
            <div className="settings-shell">
                {/* ACCOUNT */}
                <section className="settings-card">
                    <div className="settings-card-head">
                        <div>
                            <h2 className="settings-card-title">Account</h2>
                            <p className="settings-muted">Your login method determines what details can be edited.</p>
                        </div>

                        <span className="settings-pill">
                            Login: <strong>{isGoogle ? "GOOGLE" : "EMAIL"}</strong>
                        </span>
                    </div>

                    <div className="settings-grid-2">
                        <div className="settings-field">
                            <label className="settings-label">Name</label>
                            <input className="settings-input" value={accountName} disabled />
                            {isGoogle ? (
                                <div className="settings-hint">
                                    This account is managed by Google. Changes must be made through Google.
                                </div>
                            ) : null}
                        </div>

                        <div className="settings-field">
                            <label className="settings-label">Email</label>
                            <input className="settings-input" value={accountEmail} disabled />
                            {isGoogle ? (
                                <div className="settings-hint">
                                    This account is managed by Google. Changes must be made through Google.
                                </div>
                            ) : null}
                        </div>

                        <div className="settings-meta-row">
                            <div className="settings-meta">
                                <div className="settings-meta-k">Avatar</div>
                                <div className="settings-meta-v">
                                    {accountAvatar ? (
                                        <img
                                            src={accountAvatar}
                                            alt="Avatar"
                                            style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }}
                                        />
                                    ) : (
                                        "—"
                                    )}
                                </div>
                            </div>

                            <div className="settings-meta">
                                <div className="settings-meta-k">Provider</div>
                                <div className="settings-meta-v">{isGoogle ? "Google" : "Email"}</div>
                            </div>
                        </div>
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
                            Plan: <strong>{String(plan || "free").toUpperCase()}</strong>
                        </span>
                    </div>

                    <div className="settings-billing-row">
                        <div className="settings-billing-left">
                            <div className="settings-billing-line">
                                <span className="settings-billing-k">Status</span>
                                <span className="settings-billing-v">{subscriptionStatus || "free"}</span>
                            </div>

                            <div className="settings-billing-line">
                                <span className="settings-billing-k">Interval</span>
                                <span className="settings-billing-v">{planInterval || "—"}</span>
                            </div>

                            <div className="settings-billing-line">
                                <span className="settings-billing-k">Renews</span>
                                <span className="settings-billing-v">{currentPeriodEnd ? fmtDate(currentPeriodEnd) : "—"}</span>
                            </div>

                            <div className="settings-hint">Use “Manage billing” to view invoices, update payment method, or cancel.</div>
                        </div>

                        <div className="settings-billing-actions">
                            <button className="settings-btn settings-btn-primary" onClick={openBillingPortal}>
                                Manage billing
                            </button>
                            <button className="settings-btn settings-btn-ghost" onClick={() => (window.location.href = "/pricing")}>
                                View plans
                            </button>
                        </div>
                    </div>
                </section>

                {/* INVOICES */}
                <section className="settings-card">
                    <div className="settings-card-head">
                        <div>
                            <h2 className="settings-card-title">Invoices</h2>
                            <p className="settings-muted">Invoices generated for subscriptions and payments.</p>
                        </div>
                    </div>

                    {invoices.length ? (
                        <div className="settings-table">
                            <div className="settings-row settings-row-head">
                                <div>Date</div>
                                <div>Amount</div>
                                <div>Status</div>
                                <div>PDF</div>
                            </div>

                            {invoices.map((inv, idx) => {
                                const id = inv?.id || idx;
                                const date = inv?.created;
                                const amountMinor = inv?.total ?? inv?.amount_paid ?? inv?.amount_due;
                                const currency = inv?.currency;
                                const status = inv?.status || "—";
                                const pdf = inv?.invoice_pdf || inv?.hosted_invoice_url;

                                return (
                                    <div className="settings-row" key={id}>
                                        <div>{fmtDate(date)}</div>
                                        <div>{fmtMoneyFromMinor(amountMinor, currency)}</div>
                                        <div>{String(status)}</div>
                                        <div>
                                            {pdf ? (
                                                <a className="settings-link" href={pdf} target="_blank" rel="noreferrer">
                                                    Download
                                                </a>
                                            ) : (
                                                "—"
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="settings-empty">
                            No invoices yet.
                            <div className="settings-hint">Invoices appear here once Stripe generates them.</div>
                        </div>
                    )}
                </section>

                {/* PAYMENTS */}
                <section className="settings-card">
                    <div className="settings-card-head">
                        <div>
                            <h2 className="settings-card-title">Payments</h2>
                            <p className="settings-muted">Your recent payment activity.</p>
                        </div>
                    </div>

                    {payments.length ? (
                        <div className="settings-table">
                            <div className="settings-row settings-row-head">
                                <div>Date</div>
                                <div>Amount</div>
                                <div>Status</div>
                                <div>Description</div>
                            </div>

                            {payments.map((p, idx) => {
                                const id = p?.id || idx;
                                const date = p?.created;
                                const amountMinor = p?.amount;
                                const currency = p?.currency;
                                const status = p?.status || "—";
                                const desc = p?.description || p?.receipt_email || "—";

                                return (
                                    <div className="settings-row" key={id}>
                                        <div>{fmtDate(date)}</div>
                                        <div>{fmtMoneyFromMinor(amountMinor, currency)}</div>
                                        <div>{String(status)}</div>
                                        <div className="settings-mono" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {String(desc)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="settings-empty">
                            No payments yet.
                            <div className="settings-hint">Payments appear here after successful charges.</div>
                        </div>
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}
