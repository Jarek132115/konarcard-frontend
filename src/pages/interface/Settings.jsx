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
        <div className="settings-headRight">
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
            <div className="settings-shell">
                <PageHeader
                    title="Settings"
                    subtitle="Manage your account, billing, invoices and payments."
                    rightSlot={headerRight}
                />

                {hasError ? (
                    <div className="settings-banner settings-banner-danger">
                        <div className="settings-banner-title">Couldn’t load your settings</div>
                        <div className="settings-banner-sub">{pick(loadErr, "Please try again.")}</div>
                    </div>
                ) : null}

                <div className="settings-grid">
                    {/* Row 1 */}
                    <section className="settings-card settings-account">
                        <div className="settings-cardHead">
                            <div>
                                <h2 className="settings-cardTitle">Account</h2>
                                <p className="settings-cardSub">Your login method determines what details can be edited.</p>
                            </div>

                            <span className="kc-pill">
                                Login: <strong>{isBusy ? "…" : isGoogle ? "GOOGLE" : "EMAIL"}</strong>
                            </span>
                        </div>

                        <div className="settings-accountTop">
                            <div className="settings-avatar">
                                {accountAvatar && !isBusy ? (
                                    <img src={accountAvatar} alt="Avatar" />
                                ) : (
                                    <div className={`settings-avatarFallback ${isBusy ? "settings-skelBlock" : ""}`}>
                                        {!isBusy ? (accountName || "U").trim().charAt(0).toUpperCase() : ""}
                                    </div>
                                )}
                            </div>

                            <div className="settings-accountSummary">
                                <div className="settings-accountName">{isBusy ? <span className="settings-skelText w52" /> : accountName}</div>
                                <div className="settings-accountEmail">{isBusy ? <span className="settings-skelText w72" /> : accountEmail}</div>

                                <div className="settings-accountChips">
                                    <span className={`settings-chip ${isBusy ? "settings-skel-chip" : ""}`}>
                                        {isBusy ? "" : isGoogle ? "Google account" : "Email account"}
                                    </span>
                                    <span className={`settings-chip settings-chip--ghost ${isBusy ? "settings-skel-chip" : ""}`}>
                                        {isBusy ? "" : isGoogle ? "Managed by Google" : "Editable in app"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="settings-fields2">
                            <div className="settings-field">
                                <div className="settings-k">Name</div>
                                <div className={`settings-vBox ${isBusy ? "settings-skelLine" : ""}`}>{isBusy ? "" : accountName}</div>
                                {isGoogle && !isBusy ? (
                                    <div className="settings-hint">This account is managed by Google. Changes must be made through Google.</div>
                                ) : null}
                            </div>

                            <div className="settings-field">
                                <div className="settings-k">Email</div>
                                <div className={`settings-vBox ${isBusy ? "settings-skelLine" : ""}`}>{isBusy ? "" : accountEmail}</div>
                                {isGoogle && !isBusy ? (
                                    <div className="settings-hint">This account is managed by Google. Changes must be made through Google.</div>
                                ) : null}
                            </div>
                        </div>

                        {/* Optional buttons (only show if NOT google) */}
                        {!isGoogle ? (
                            <div className="settings-actions">
                                <button type="button" className="kx-btn kx-btn--black" disabled={isBusy}>
                                    Reset Password
                                </button>
                                <button type="button" className="kx-btn kx-btn--white" disabled={isBusy}>
                                    Delete My Account
                                </button>
                            </div>
                        ) : null}
                    </section>

                    <section className="settings-card settings-invoices">
                        <div className="settings-cardHead">
                            <div>
                                <h2 className="settings-cardTitle">Invoices</h2>
                                <p className="settings-cardSub">Subscription invoices and receipts.</p>
                            </div>
                        </div>

                        <div className="settings-table">
                            <div className="settings-row settings-rowHead settings-row4">
                                <div>Date</div>
                                <div>Amount</div>
                                <div>Status</div>
                                <div>PDF</div>
                            </div>

                            {isBusy ? (
                                <>
                                    {[0, 1, 2].map((k) => (
                                        <div className="settings-row settings-row4" key={`inv-skel-${k}`}>
                                            <div><span className="settings-skelText w70" /></div>
                                            <div><span className="settings-skelText w60" /></div>
                                            <div><span className="settings-skelBadge" /></div>
                                            <div><span className="settings-skelText w55" /></div>
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
                                        <div className="settings-row settings-row4" key={id}>
                                            <div>{fmtDate(date)}</div>
                                            <div>{fmtMoneyFromMinor(amountMinor, currency)}</div>
                                            <div>
                                                <span className={`settings-badge ${safeLower(status)}`}>{String(status)}</span>
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
                                })
                            ) : (
                                <div className="settings-emptyRow">
                                    <div className="settings-emptyTitle">No invoices yet.</div>
                                    <div className="settings-emptySub">Invoices appear here once Stripe generates them.</div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Row 2 */}
                    <section className="settings-card settings-billing">
                        <div className="settings-cardHead">
                            <div>
                                <h2 className="settings-cardTitle">Billing</h2>
                                <p className="settings-cardSub">Plan status and renewal information.</p>
                            </div>

                            <span className="kc-pill">
                                Plan: <strong>{String(plan || "free").toUpperCase()}</strong>
                            </span>
                        </div>

                        <div className="settings-stats3">
                            <div className="settings-stat">
                                <div className="settings-statK">Status</div>
                                <div className={`settings-statV ${safeLower(subscriptionStatus) === "active" && !isBusy ? "is-active" : ""}`}>
                                    {isBusy ? <span className="settings-skelText w70" /> : pick(subscriptionStatus)}
                                </div>
                            </div>

                            <div className="settings-stat">
                                <div className="settings-statK">Interval</div>
                                <div className="settings-statV">{isBusy ? <span className="settings-skelText w60" /> : pick(planInterval)}</div>
                            </div>

                            <div className="settings-stat">
                                <div className="settings-statK">Renews</div>
                                <div className="settings-statV">
                                    {isBusy ? <span className="settings-skelText w64" /> : currentPeriodEnd ? fmtDate(currentPeriodEnd) : "—"}
                                </div>
                            </div>
                        </div>

                        <div className="settings-actions">
                            <button type="button" className="kx-btn kx-btn--black" onClick={openBillingPortal} disabled={isBusy || hasError}>
                                Manage Billing
                            </button>
                            <button type="button" className="kx-btn kx-btn--white" onClick={() => (window.location.href = "/pricing")} disabled={isBusy}>
                                View Plans
                            </button>
                        </div>

                        <div className="settings-hint">
                            Use <strong>Manage Billing</strong> to update payment method, view invoices, or cancel.
                        </div>
                    </section>

                    <section className="settings-card settings-payments">
                        <div className="settings-cardHead">
                            <div>
                                <h2 className="settings-cardTitle">Payments</h2>
                                <p className="settings-cardSub">Your recent payment activity.</p>
                            </div>
                        </div>

                        <div className="settings-table">
                            <div className="settings-row settings-rowHead settings-row4p">
                                <div>Date</div>
                                <div>Amount</div>
                                <div>Status</div>
                                <div>Description</div>
                            </div>

                            {isBusy ? (
                                <>
                                    {[0, 1, 2].map((k) => (
                                        <div className="settings-row settings-row4p" key={`pay-skel-${k}`}>
                                            <div><span className="settings-skelText w70" /></div>
                                            <div><span className="settings-skelText w60" /></div>
                                            <div><span className="settings-skelBadge" /></div>
                                            <div><span className="settings-skelText w92" /></div>
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
                                        <div className="settings-row settings-row4p" key={id}>
                                            <div>{fmtDate(date)}</div>
                                            <div>{fmtMoneyFromMinor(amountMinor, currency)}</div>
                                            <div>
                                                <span className={`settings-badge ${safeLower(status)}`}>{String(status)}</span>
                                            </div>
                                            <div className="settings-mono settings-ellipsis" title={String(desc)}>
                                                {String(desc)}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="settings-emptyRow">
                                    <div className="settings-emptyTitle">No payments yet.</div>
                                    <div className="settings-emptySub">Payments appear here after successful charges.</div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}