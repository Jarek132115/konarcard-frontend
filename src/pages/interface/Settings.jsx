// src/pages/interface/Settings.jsx
import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
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

const pick = (v, fallback = "—") => (v == null || v === "" ? fallback : String(v));

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
            setSummary(null);
            setInvoices([]);
            setPayments([]);
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
            summary?.account?.authProvider || authUser?.authProvider || authUser?.provider || authUser?.loginProvider
        );
        return p === "google" ? "google" : "local";
    }, [summary, authUser]);

    const isGoogle = provider === "google";

    // Account
    const accountName = summary?.account?.name || authUser?.name || authUser?.full_name || "—";
    const accountEmail = summary?.account?.email || authUser?.email || "—";
    const accountAvatar = summary?.account?.avatar || authUser?.avatar || authUser?.picture || authUser?.photoURL || "";

    // Billing
    const plan = summary?.plan || authUser?.plan || "free";
    const planInterval = summary?.planInterval || null;
    const subscriptionStatus = summary?.subscriptionStatus || "free";
    const currentPeriodEnd = summary?.currentPeriodEnd || null;

    const isBusy = authLoading || loading;
    const hasError = Boolean(authError || loadErr);

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

    const headerRight = (
        <div className="stg-headRight">
            <span className="kc-pill">
                Plan: <strong>{String(plan || "free").toUpperCase()}</strong>
            </span>

            {hasError ? (
                <button type="button" className="kx-btn kx-btn--black" onClick={retryAll}>
                    Retry
                </button>
            ) : (
                <button type="button" className="kx-btn kx-btn--black" onClick={openBillingPortal} disabled={isBusy}>
                    Manage Billing
                </button>
            )}
        </div>
    );

    return (
        <DashboardLayout title={null} subtitle={null} hideDesktopHeader>
            <div className="stg-shell">
                <PageHeader
                    title="Settings"
                    subtitle="Manage your account, billing, invoices and payments."
                    rightSlot={headerRight}
                />

                {hasError ? (
                    <div className="stg-banner stg-banner--danger">
                        <div className="kc-title">Couldn’t load your settings</div>
                        <div className="kc-body">{pick(loadErr, "Please try again.")}</div>
                    </div>
                ) : null}

                <div className="stg-grid">
                    {/* 1) Account */}
                    <section className="stg-card">
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <div className="kc-title">Account</div>
                                <div className="kc-body">Your login method determines what details can be edited.</div>
                            </div>

                            <span className="kc-pill">
                                Login: <strong>{isBusy ? "…" : isGoogle ? "GOOGLE" : "EMAIL"}</strong>
                            </span>
                        </div>

                        <div className="stg-cardBody">
                            <div className="stg-accountTop">
                                <div className="stg-avatar">
                                    {accountAvatar && !isBusy ? (
                                        <img src={accountAvatar} alt="Avatar" />
                                    ) : (
                                        <div className={`stg-avatarFallback ${isBusy ? "stg-skelBlock" : ""}`}>
                                            {!isBusy ? (accountName || "U").trim().charAt(0).toUpperCase() : ""}
                                        </div>
                                    )}
                                </div>

                                <div className="stg-accountSummary">
                                    <div className="stg-accountName">
                                        {isBusy ? <span className="stg-skelText w52" /> : accountName}
                                    </div>
                                    <div className="stg-accountEmail">
                                        {isBusy ? <span className="stg-skelText w72" /> : accountEmail}
                                    </div>

                                    <div className="stg-chips">
                                        <span className={`stg-chip ${isBusy ? "stg-skel-chip" : ""}`}>
                                            {isBusy ? "" : isGoogle ? "Google account" : "Email account"}
                                        </span>
                                        <span className={`stg-chip stg-chip--ghost ${isBusy ? "stg-skel-chip" : ""}`}>
                                            {isBusy ? "" : isGoogle ? "Managed by Google" : "Editable in app"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="stg-fields2">
                                <div className="stg-field">
                                    <div className="stg-k">Name</div>
                                    <div className={`stg-vBox ${isBusy ? "stg-skelLine" : ""}`}>{isBusy ? "" : accountName}</div>
                                    {isGoogle && !isBusy ? (
                                        <div className="stg-hint">This account is managed by Google. Changes must be made through Google.</div>
                                    ) : null}
                                </div>

                                <div className="stg-field">
                                    <div className="stg-k">Email</div>
                                    <div className={`stg-vBox ${isBusy ? "stg-skelLine" : ""}`}>{isBusy ? "" : accountEmail}</div>
                                    {isGoogle && !isBusy ? (
                                        <div className="stg-hint">This account is managed by Google. Changes must be made through Google.</div>
                                    ) : null}
                                </div>
                            </div>

                            {!isGoogle ? (
                                <div className="stg-actions">
                                    <button type="button" className="kx-btn kx-btn--black" disabled={isBusy}>
                                        Reset Password
                                    </button>
                                    <button type="button" className="kx-btn kx-btn--white" disabled={isBusy}>
                                        Delete My Account
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </section>

                    {/* 2) Invoices */}
                    <section className="stg-card">
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <div className="kc-title">Invoices</div>
                                <div className="kc-body">Subscription invoices and receipts.</div>
                            </div>
                        </div>

                        <div className="stg-cardBody stg-scrollArea">
                            <div className="stg-table">
                                <div className="stg-row stg-rowHead stg-row4">
                                    <div>Date</div>
                                    <div>Amount</div>
                                    <div>Status</div>
                                    <div>PDF</div>
                                </div>

                                {isBusy ? (
                                    <>
                                        {[0, 1, 2].map((k) => (
                                            <div className="stg-row stg-row4" key={`inv-skel-${k}`}>
                                                <div><span className="stg-skelText w70" /></div>
                                                <div><span className="stg-skelText w60" /></div>
                                                <div><span className="stg-skelBadge" /></div>
                                                <div><span className="stg-skelText w55" /></div>
                                            </div>
                                        ))}
                                    </>
                                ) : invoices.length ? (
                                    invoices.map((inv, idx) => {
                                        const id = inv?.id || idx;
                                        const date = inv?.created;
                                        const amountMinor = inv?.total ?? inv?.amount_paid ?? inv?.amount_due;
                                        const currency = inv?.currency;
                                        const status = inv?.status || "—";
                                        const pdf = inv?.invoice_pdf || inv?.hosted_invoice_url;

                                        return (
                                            <div className="stg-row stg-row4" key={id}>
                                                <div>{fmtDate(date)}</div>
                                                <div>{fmtMoneyFromMinor(amountMinor, currency)}</div>
                                                <div><span className={`stg-badge ${safeLower(status)}`}>{String(status)}</span></div>
                                                <div>
                                                    {pdf ? (
                                                        <a className="stg-link" href={pdf} target="_blank" rel="noreferrer">
                                                            Download
                                                        </a>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="stg-emptyRow">
                                        <div className="kc-title">No invoices yet.</div>
                                        <div className="kc-body">Invoices appear here once Stripe generates them.</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 3) Billing */}
                    <section className="stg-card">
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <div className="kc-title">Billing</div>
                                <div className="kc-body">Plan status and renewal information.</div>
                            </div>

                            <span className="kc-pill">
                                Plan: <strong>{String(plan || "free").toUpperCase()}</strong>
                            </span>
                        </div>

                        <div className="stg-cardBody">
                            <div className="stg-stats3">
                                <div className="stg-stat">
                                    <div className="stg-statK">Status</div>
                                    <div className={`stg-statV ${safeLower(subscriptionStatus) === "active" && !isBusy ? "is-active" : ""}`}>
                                        {isBusy ? <span className="stg-skelText w70" /> : pick(subscriptionStatus)}
                                    </div>
                                </div>

                                <div className="stg-stat">
                                    <div className="stg-statK">Interval</div>
                                    <div className="stg-statV">{isBusy ? <span className="stg-skelText w60" /> : pick(planInterval)}</div>
                                </div>

                                <div className="stg-stat">
                                    <div className="stg-statK">Renews</div>
                                    <div className="stg-statV">
                                        {isBusy ? <span className="stg-skelText w64" /> : currentPeriodEnd ? fmtDate(currentPeriodEnd) : "—"}
                                    </div>
                                </div>
                            </div>

                            <div className="stg-actions">
                                <button type="button" className="kx-btn kx-btn--black" onClick={openBillingPortal} disabled={isBusy || hasError}>
                                    Manage Billing
                                </button>
                                <button type="button" className="kx-btn kx-btn--white" onClick={() => (window.location.href = "/pricing")} disabled={isBusy}>
                                    View Plans
                                </button>
                            </div>

                            <div className="stg-hint">
                                Use <strong>Manage Billing</strong> to update payment method, view invoices, or cancel.
                            </div>
                        </div>
                    </section>

                    {/* 4) Payments */}
                    <section className="stg-card">
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <div className="kc-title">Payments</div>
                                <div className="kc-body">Your recent payment activity.</div>
                            </div>
                        </div>

                        <div className="stg-cardBody stg-scrollArea">
                            <div className="stg-table">
                                <div className="stg-row stg-rowHead stg-row4p">
                                    <div>Date</div>
                                    <div>Amount</div>
                                    <div>Status</div>
                                    <div>Description</div>
                                </div>

                                {isBusy ? (
                                    <>
                                        {[0, 1, 2].map((k) => (
                                            <div className="stg-row stg-row4p" key={`pay-skel-${k}`}>
                                                <div><span className="stg-skelText w70" /></div>
                                                <div><span className="stg-skelText w60" /></div>
                                                <div><span className="stg-skelBadge" /></div>
                                                <div><span className="stg-skelText w92" /></div>
                                            </div>
                                        ))}
                                    </>
                                ) : payments.length ? (
                                    payments.map((p, idx) => {
                                        const id = p?.id || idx;
                                        const date = p?.created;
                                        const amountMinor = p?.amount;
                                        const currency = p?.currency;
                                        const status = p?.status || "—";
                                        const desc = p?.description || p?.receipt_email || "—";

                                        return (
                                            <div className="stg-row stg-row4p" key={id}>
                                                <div>{fmtDate(date)}</div>
                                                <div>{fmtMoneyFromMinor(amountMinor, currency)}</div>
                                                <div><span className={`stg-badge ${safeLower(status)}`}>{String(status)}</span></div>
                                                <div className="stg-mono stg-ellipsis" title={String(desc)}>
                                                    {String(desc)}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="stg-emptyRow">
                                        <div className="kc-title">No payments yet.</div>
                                        <div className="kc-body">Payments appear here after successful charges.</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}