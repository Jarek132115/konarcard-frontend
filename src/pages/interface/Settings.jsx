// src/pages/interface/Settings.jsx
import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import "../../styling/dashboard/settings.css";

import { useAuthUser } from "../../hooks/useAuthUser";
import api from "../../services/api";

/**
 * Settings page (wired to backend billing endpoints):
 * - GET  /api/billing/summary
 * - GET  /api/billing/invoices
 * - GET  /api/billing/payments
 * - POST /api/billing-portal  (redirect to returned url)
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

const fmtMoney = (amount, currency) => {
    // Supports:
    // - amount as number in cents
    // - amount as string already formatted
    // - amount as number already in major units (best-effort)
    if (amount == null || amount === "") return "—";
    if (typeof amount === "string") return amount;

    const cur = String(currency || "GBP").toUpperCase();

    // Heuristic: Stripe amounts usually come as integer cents.
    // If it's an integer and pretty large, assume cents. If it's fractional, assume major units.
    const isInt = Number.isFinite(amount) && Math.floor(amount) === amount;
    const major = isInt ? amount / 100 : amount;

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: cur,
            maximumFractionDigits: 2,
        }).format(major);
    } catch {
        // fallback
        return `${major.toFixed(2)} ${cur}`;
    }
};

export default function Settings() {
    // Keep authUser hook for token/session + fallback display
    const { data: authUser, isLoading: authLoading, isError: authError, refetch: refetchAuth } = useAuthUser();

    const [summary, setSummary] = useState(null);
    const [invoices, setInvoices] = useState(null);
    const [payments, setPayments] = useState(null);

    const [loading, setLoading] = useState(true);
    const [loadErr, setLoadErr] = useState("");

    const provider = useMemo(() => {
        const p = safeLower(summary?.authProvider || authUser?.authProvider || authUser?.provider || authUser?.loginProvider);
        return p === "google" ? "google" : "local";
    }, [summary, authUser]);

    const isGoogle = provider === "google";

    const accountName = summary?.name || authUser?.name || authUser?.full_name || "—";
    const accountEmail = summary?.email || authUser?.email || "—";
    const accountAvatar = summary?.avatar || authUser?.avatar || authUser?.profilePhoto || authUser?.photoURL || "";

    const planLabel = summary?.planLabel || summary?.plan || "Free";
    const statusLabel = summary?.status || "free";
    const currentPeriodEnd = summary?.currentPeriodEnd || null;

    useEffect(() => {
        if (!authUser && !authLoading) {
            // not logged in or no session; still show page shell
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setLoadErr("");

                const [sRes, iRes, pRes] = await Promise.all([
                    api.get("/api/billing/summary"),
                    api.get("/api/billing/invoices"),
                    api.get("/api/billing/payments"),
                ]);

                if (cancelled) return;

                const s = sRes?.data?.data ?? sRes?.data ?? null;
                const inv = iRes?.data?.data ?? iRes?.data ?? [];
                const pay = pRes?.data?.data ?? pRes?.data ?? [];

                setSummary(s && typeof s === "object" ? s : null);
                setInvoices(Array.isArray(inv) ? inv : []);
                setPayments(Array.isArray(pay) ? pay : []);
            } catch (e) {
                if (cancelled) return;
                const msg = e?.response?.data?.error || e?.message || "Could not load settings.";
                setLoadErr(msg);
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
    }, [authUser, authLoading]);

    const openBillingPortal = async () => {
        try {
            const res = await api.post("/api/billing-portal", {});
            const url = res?.data?.url || res?.data?.portalUrl || res?.data?.redirectUrl;
            if (!url) throw new Error("Billing portal URL missing.");
            window.location.href = url;
        } catch (e) {
            alert(e?.response?.data?.error || e?.message || "Could not open billing portal.");
        }
    };

    const retryAll = async () => {
        try {
            setLoadErr("");
            setLoading(true);
            await refetchAuth?.();
            // refetchAuth triggers authUser update; our effect will fetch billing endpoints again
        } finally {
            // do nothing
        }
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
                            Plan: <strong>{String(planLabel || "Free").toUpperCase()}</strong>
                        </span>
                    </div>

                    <div className="settings-billing-row">
                        <div className="settings-billing-left">
                            <div className="settings-billing-line">
                                <span className="settings-billing-k">Status</span>
                                <span className="settings-billing-v">{String(statusLabel || "free")}</span>
                            </div>

                            <div className="settings-billing-line">
                                <span className="settings-billing-k">Renews</span>
                                <span className="settings-billing-v">{currentPeriodEnd ? fmtDate(currentPeriodEnd) : "—"}</span>
                            </div>

                            <div className="settings-hint">
                                If you’re on Free, you can upgrade any time. If you’re subscribed, use “Manage billing” to update payment
                                method or cancel.
                            </div>
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

                    {Array.isArray(invoices) && invoices.length ? (
                        <div className="settings-table">
                            <div className="settings-row settings-row-head">
                                <div>Date</div>
                                <div>Amount</div>
                                <div>Status</div>
                                <div>PDF</div>
                            </div>

                            {invoices.map((inv, idx) => {
                                const id = inv?.id || inv?._id || idx;
                                const date = inv?.date || inv?.createdAt || inv?.created_at || inv?.created;
                                const amount = inv?.amount || inv?.total || inv?.amount_due || inv?.amountPaid || inv?.amount_paid;
                                const currency = inv?.currency;
                                const status = inv?.status || inv?.payment_status || "—";
                                const pdf = inv?.pdf || inv?.invoicePdf || inv?.invoice_pdf || inv?.hosted_invoice_url || inv?.url;

                                return (
                                    <div className="settings-row" key={id}>
                                        <div>{fmtDate(date)}</div>
                                        <div>{fmtMoney(amount, currency)}</div>
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
                            <div className="settings-hint">Invoices appear here once you’ve been billed through Stripe.</div>
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

                    {Array.isArray(payments) && payments.length ? (
                        <div className="settings-table">
                            <div className="settings-row settings-row-head">
                                <div>Date</div>
                                <div>Amount</div>
                                <div>Status</div>
                                <div>Description</div>
                            </div>

                            {payments.map((p, idx) => {
                                const id = p?.id || p?._id || idx;
                                const date = p?.date || p?.createdAt || p?.created_at || p?.created;
                                const amount = p?.amount || p?.total || p?.amount_received || p?.amountReceived || p?.amount_received;
                                const currency = p?.currency;
                                const status = p?.status || p?.paid || p?.payment_status || "—";
                                const desc =
                                    p?.description ||
                                    p?.statement_descriptor ||
                                    p?.receipt_email ||
                                    p?.invoiceNumber ||
                                    p?.invoice_number ||
                                    "—";

                                return (
                                    <div className="settings-row" key={id}>
                                        <div>{fmtDate(date)}</div>
                                        <div>{fmtMoney(amount, currency)}</div>
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
