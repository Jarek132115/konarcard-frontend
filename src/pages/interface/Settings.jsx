// src/pages/interface/Settings.jsx
import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import "../../styling/dashboard/settings.css";

import { useAuthUser } from "../../hooks/useAuthUser";
import api from "../../services/api";

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
        const p = safeLower(
            summary?.account?.authProvider ||
            authUser?.authProvider ||
            authUser?.provider ||
            authUser?.loginProvider
        );
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
                    <div className="settings-layout">
                        <div className="settings-col">
                            <div className="settings-card settings-skel" />
                            <div className="settings-card settings-skel" />
                        </div>
                        <div className="settings-col">
                            <div className="settings-card settings-skel" />
                            <div className="settings-card settings-skel" />
                        </div>
                    </div>
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
                <div className="settings-layout">
                    {/* LEFT COLUMN: ACCOUNT + BILLING */}
                    <div className="settings-col">
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

                            <div className="settings-account-top">
                                <div className="settings-avatar">
                                    {accountAvatar ? (
                                        <img src={accountAvatar} alt="Avatar" />
                                    ) : (
                                        <div className="settings-avatar-fallback">
                                            {(accountName || "U").trim().charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className="settings-account-summary">
                                    <div className="settings-account-name">{accountName}</div>
                                    <div className="settings-account-email">{accountEmail}</div>
                                    <div className="settings-account-badges">
                                        <span className="settings-chip">{isGoogle ? "Google account" : "Email account"}</span>
                                        <span className="settings-chip settings-chip-ghost">{isGoogle ? "Managed by Google" : "Editable in app"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="settings-grid-2">
                                <div className="settings-field">
                                    <label className="settings-label">Name</label>
                                    <input className="settings-input" value={accountName} disabled />
                                    {isGoogle ? (
                                        <div className="settings-hint">This account is managed by Google. Changes must be made through Google.</div>
                                    ) : null}
                                </div>

                                <div className="settings-field">
                                    <label className="settings-label">Email</label>
                                    <input className="settings-input" value={accountEmail} disabled />
                                    {isGoogle ? (
                                        <div className="settings-hint">This account is managed by Google. Changes must be made through Google.</div>
                                    ) : null}
                                </div>
                            </div>
                        </section>

                        {/* BILLING */}
                        <section className="settings-card">
                            <div className="settings-card-head">
                                <div>
                                    <h2 className="settings-card-title">Billing</h2>
                                    <p className="settings-muted">Plan status and renewal information.</p>
                                </div>

                                <span className="settings-pill">
                                    Plan: <strong>{String(plan || "free").toUpperCase()}</strong>
                                </span>
                            </div>

                            <div className="settings-billing-grid">
                                <div className="settings-stat">
                                    <div className="settings-stat-k">Status</div>
                                    <div className={`settings-stat-v ${subscriptionStatus === "active" ? "is-active" : ""}`}>
                                        {subscriptionStatus || "free"}
                                    </div>
                                </div>

                                <div className="settings-stat">
                                    <div className="settings-stat-k">Interval</div>
                                    <div className="settings-stat-v">{planInterval || "—"}</div>
                                </div>

                                <div className="settings-stat">
                                    <div className="settings-stat-k">Renews</div>
                                    <div className="settings-stat-v">{currentPeriodEnd ? fmtDate(currentPeriodEnd) : "—"}</div>
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

                            <div className="settings-hint">
                                Use <strong>Manage billing</strong> to update payment method, view invoices, or cancel.
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: INVOICES + PAYMENTS */}
                    <div className="settings-col">
                        {/* INVOICES */}
                        <section className="settings-card">
                            <div className="settings-card-head">
                                <div>
                                    <h2 className="settings-card-title">Invoices</h2>
                                    <p className="settings-muted">Subscription invoices and receipts.</p>
                                </div>
                            </div>

                            {invoices.length ? (
                                <div className="settings-table settings-table-compact">
                                    <div className="settings-row settings-row-head settings-row-4">
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
                                            <div className="settings-row settings-row-4" key={id}>
                                                <div>{fmtDate(date)}</div>
                                                <div>{fmtMoneyFromMinor(amountMinor, currency)}</div>
                                                <div>
                                                    <span className={`settings-badge ${String(status).toLowerCase()}`}>
                                                        {String(status)}
                                                    </span>
                                                </div>
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
                                <div className="settings-table settings-table-compact">
                                    <div className="settings-row settings-row-head settings-row-4p">
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
                                            <div className="settings-row settings-row-4p" key={id}>
                                                <div>{fmtDate(date)}</div>
                                                <div>{fmtMoneyFromMinor(amountMinor, currency)}</div>
                                                <div>
                                                    <span className={`settings-badge ${String(status).toLowerCase()}`}>
                                                        {String(status)}
                                                    </span>
                                                </div>
                                                <div className="settings-mono settings-ellipsis" title={String(desc)}>
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
                </div>
            </div>
        </DashboardLayout>
    );
}
