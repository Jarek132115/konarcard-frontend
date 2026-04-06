import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/spacing.css";
import "../../styling/dashboard/settings.css";

import { useAuthUser } from "../../hooks/useAuthUser";
import api from "../../services/api";

const safeLower = (v) => String(v || "").toLowerCase();

const fmtDate = (d) => {
    try {
        if (!d) return "—";
        const x = new Date(d);
        if (Number.isNaN(x.getTime())) return "—";
        return x.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
        });
    } catch {
        return "—";
    }
};

const fmtMoneyFromMinor = (minorAmount, currency) => {
    if (minorAmount == null || minorAmount === "") return "—";

    const cur = String(currency || "GBP").toUpperCase();
    const major =
        typeof minorAmount === "number"
            ? minorAmount / 100
            : Number(minorAmount) / 100;

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
    const {
        data: authUser,
        isLoading: authLoading,
        refetch: refetchAuth,
    } = useAuthUser();

    const [summary, setSummary] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadErr, setLoadErr] = useState("");

    const loadBillingData = useCallback(async () => {
        try {
            setLoading(true);
            setLoadErr("");

            const ts = Date.now();

            const [sRes, iRes, pRes] = await Promise.all([
                api.get(`/api/billing/summary?ts=${ts}`),
                api.get(`/api/billing/invoices?ts=${ts}`),
                api.get(`/api/billing/payments?ts=${ts}`),
            ]);

            const sStatus = Number(sRes?.status || 0);
            const iStatus = Number(iRes?.status || 0);
            const pStatus = Number(pRes?.status || 0);

            if (sStatus >= 400) {
                throw new Error(sRes?.data?.error || "Could not load billing summary.");
            }

            if (iStatus >= 400) {
                throw new Error(iRes?.data?.error || "Could not load invoices.");
            }

            if (pStatus >= 400) {
                throw new Error(pRes?.data?.error || "Could not load payments.");
            }

            const summaryPayload = sRes?.data || null;
            const invoicesPayload = iRes?.data || {};
            const paymentsPayload = pRes?.data || {};

            setSummary(summaryPayload && typeof summaryPayload === "object" ? summaryPayload : null);
            setInvoices(Array.isArray(invoicesPayload?.invoices) ? invoicesPayload.invoices : []);
            setPayments(Array.isArray(paymentsPayload?.payments) ? paymentsPayload.payments : []);
        } catch (e) {
            setLoadErr(e?.response?.data?.error || e?.message || "Could not load settings.");
            setSummary(null);
            setInvoices([]);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;

        if (!authUser) {
            setLoading(false);
            setLoadErr("");
            setSummary(null);
            setInvoices([]);
            setPayments([]);
            return;
        }

        loadBillingData();
    }, [authLoading, authUser, loadBillingData]);

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

    const accountName =
        summary?.account?.name ||
        authUser?.name ||
        authUser?.full_name ||
        "—";

    const accountEmail =
        summary?.account?.email ||
        authUser?.email ||
        "—";

    const accountAvatar =
        summary?.account?.avatar ||
        authUser?.avatar ||
        authUser?.picture ||
        authUser?.photoURL ||
        "";

    const plan = summary?.plan || authUser?.plan || "free";
    const planInterval = summary?.planInterval || null;
    const subscriptionStatus = summary?.subscriptionStatus || "free";
    const currentPeriodEnd = summary?.currentPeriodEnd || null;

    const isBusy = authLoading || loading;
    const hasError = Boolean(loadErr);

    const openBillingPortal = async () => {
        try {
            const res = await api.post("/api/billing-portal", {});
            const status = Number(res?.status || 0);

            if (status >= 400) {
                throw new Error(res?.data?.error || "Could not open billing portal.");
            }

            const url = res?.data?.url;
            if (!url) throw new Error("Billing portal URL missing.");

            window.location.href = url;
        } catch (e) {
            toast.error(
                e?.response?.data?.error ||
                e?.message ||
                "Could not open billing portal."
            );
        }
    };

    const retryAll = async () => {
        setLoadErr("");

        try {
            await refetchAuth?.();
        } catch {
            // ignore
        }

        await loadBillingData();
    };

    const handleResetPassword = () => {
        toast("Password reset flow can be connected next.");
    };

    const handleDeleteAccount = () => {
        toast("Delete account flow can be connected next.");
    };

    const displayPlanUpper = String(plan || "free").toUpperCase();

    const headerRight = (
        <div className="stg-headRight">
            <span className="stg-pill stg-pill--dark">
                Plan: <strong>{displayPlanUpper}</strong>
            </span>

            {hasError ? (
                <button
                    type="button"
                    className="kx-btn kx-btn--black"
                    onClick={retryAll}
                    disabled={isBusy}
                >
                    Retry
                </button>
            ) : (
                <button
                    type="button"
                    className="kx-btn kx-btn--black"
                    onClick={openBillingPortal}
                    disabled={isBusy}
                >
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
                    subtitle="Manage your account, billing, invoices and payment history."
                    rightSlot={headerRight}
                />

                {hasError ? (
                    <div className="stg-banner stg-banner--danger">
                        <div className="stg-bannerCopy">
                            <div className="stg-sectionTitle">Couldn’t load your settings</div>
                            <div className="stg-sectionText">
                                {pick(loadErr, "Please try again.")}
                            </div>
                        </div>

                        <button
                            type="button"
                            className="kx-btn kx-btn--black"
                            onClick={retryAll}
                            disabled={isBusy}
                        >
                            Retry
                        </button>
                    </div>
                ) : null}

                <div className="stg-grid">
                    <section className="stg-card">
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <h2 className="stg-cardTitle">Account</h2>
                                <p className="stg-cardText">
                                    Your login method determines which account details can be edited.
                                </p>
                            </div>

                            <span className="stg-pill">
                                Login: <strong>{isBusy ? "…" : isGoogle ? "GOOGLE" : "EMAIL"}</strong>
                            </span>
                        </div>

                        <div className="stg-cardBody">
                            <div className="stg-accountRow">
                                <div className="stg-avatar">
                                    {accountAvatar && !isBusy ? (
                                        <img src={accountAvatar} alt="Avatar" />
                                    ) : (
                                        <div
                                            className={`stg-avatarFallback ${isBusy ? "stg-skelBlock" : ""}`}
                                        >
                                            {!isBusy
                                                ? (accountName || "U").trim().charAt(0).toUpperCase()
                                                : ""}
                                        </div>
                                    )}
                                </div>

                                <div className="stg-accountMeta">
                                    <div className="stg-accountName">
                                        {isBusy ? <span className="stg-skelText w52" /> : accountName}
                                    </div>
                                    <div className="stg-accountEmail" title={!isBusy ? accountEmail : undefined}>
                                        {isBusy ? <span className="stg-skelText w72" /> : accountEmail}
                                    </div>
                                </div>
                            </div>

                            <div className="stg-fields2">
                                <div className="stg-field">
                                    <div className="stg-k">Name</div>
                                    <div className={`stg-vBox ${isBusy ? "stg-skelLine" : ""}`}>
                                        {isBusy ? "" : accountName}
                                    </div>
                                </div>

                                <div className="stg-field">
                                    <div className="stg-k">Email</div>
                                    <div
                                        className={`stg-vBox stg-vBox--singleLine ${isBusy ? "stg-skelLine" : ""}`}
                                        title={!isBusy ? accountEmail : undefined}
                                    >
                                        {isBusy ? "" : accountEmail}
                                    </div>
                                </div>
                            </div>

                            {isGoogle && !isBusy ? (
                                <div className="stg-hint stg-hint--info">
                                    This account is managed by Google. Profile and password changes
                                    should be made through your Google account.
                                </div>
                            ) : null}

                            {!isGoogle ? (
                                <div className="stg-actions">
                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--black"
                                        disabled={isBusy}
                                        onClick={handleResetPassword}
                                    >
                                        Reset Password
                                    </button>

                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white"
                                        disabled={isBusy}
                                        onClick={handleDeleteAccount}
                                    >
                                        Delete My Account
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </section>

                    <section className="stg-card">
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <h2 className="stg-cardTitle">Billing</h2>
                                <p className="stg-cardText">
                                    Subscription status, plan interval and renewal information.
                                </p>
                            </div>

                            <span className="stg-pill">
                                Plan: <strong>{displayPlanUpper}</strong>
                            </span>
                        </div>

                        <div className="stg-cardBody">
                            <div className="stg-stats3">
                                <div className="stg-stat">
                                    <div className="stg-statK">Status</div>
                                    <div className="stg-statV">
                                        {isBusy ? <span className="stg-skelText w70" /> : pick(subscriptionStatus)}
                                    </div>
                                </div>

                                <div className="stg-stat">
                                    <div className="stg-statK">Interval</div>
                                    <div className="stg-statV">
                                        {isBusy ? <span className="stg-skelText w60" /> : pick(planInterval)}
                                    </div>
                                </div>

                                <div className="stg-stat">
                                    <div className="stg-statK">Renews</div>
                                    <div className="stg-statV">
                                        {isBusy ? (
                                            <span className="stg-skelText w64" />
                                        ) : currentPeriodEnd ? (
                                            fmtDate(currentPeriodEnd)
                                        ) : (
                                            "—"
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="stg-billingBox">
                                <div className="stg-billingBoxCopy">
                                    <h3 className="stg-subTitle">Manage your subscription</h3>
                                    <p className="stg-subText">
                                        Update your card, review invoices, change plans, or cancel from the billing portal.
                                    </p>
                                </div>

                                <div className="stg-actions stg-actions--billing">
                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--black"
                                        onClick={openBillingPortal}
                                        disabled={isBusy || hasError}
                                    >
                                        Manage Billing
                                    </button>

                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white"
                                        onClick={() => (window.location.href = "/pricing")}
                                        disabled={isBusy}
                                    >
                                        View Plans
                                    </button>
                                </div>
                            </div>

                            <div className="stg-hint">
                                Use <strong>Manage Billing</strong> to update payment method, view invoices, or cancel your subscription.
                            </div>
                        </div>
                    </section>

                    <section className="stg-card">
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <h2 className="stg-cardTitle">Invoices</h2>
                                <p className="stg-cardText">Subscription invoices and receipts.</p>
                            </div>
                        </div>

                        <div className="stg-cardBody stg-scrollArea">
                            <div className="stg-table stg-table--invoices">
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
                                                <div>
                                                    <span className="stg-mobileLabel">Date</span>
                                                    {fmtDate(date)}
                                                </div>

                                                <div>
                                                    <span className="stg-mobileLabel">Amount</span>
                                                    {fmtMoneyFromMinor(amountMinor, currency)}
                                                </div>

                                                <div>
                                                    <span className="stg-mobileLabel">Status</span>
                                                    <span className={`stg-badge ${safeLower(status)}`}>
                                                        {String(status)}
                                                    </span>
                                                </div>

                                                <div>
                                                    <span className="stg-mobileLabel">PDF</span>
                                                    {pdf ? (
                                                        <a
                                                            className="stg-link"
                                                            href={pdf}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
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
                                        <div className="stg-sectionTitle">No invoices yet</div>
                                        <div className="stg-sectionText">
                                            Invoices will appear here once Stripe generates them.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="stg-card">
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <h2 className="stg-cardTitle">Payments</h2>
                                <p className="stg-cardText">Your recent payment activity.</p>
                            </div>
                        </div>

                        <div className="stg-cardBody stg-scrollArea">
                            <div className="stg-table stg-table--payments">
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
                                                <div>
                                                    <span className="stg-mobileLabel">Date</span>
                                                    {fmtDate(date)}
                                                </div>

                                                <div>
                                                    <span className="stg-mobileLabel">Amount</span>
                                                    {fmtMoneyFromMinor(amountMinor, currency)}
                                                </div>

                                                <div>
                                                    <span className="stg-mobileLabel">Status</span>
                                                    <span className={`stg-badge ${safeLower(status)}`}>
                                                        {String(status)}
                                                    </span>
                                                </div>

                                                <div className="stg-ellipsis" title={String(desc)}>
                                                    <span className="stg-mobileLabel">Description</span>
                                                    {String(desc)}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="stg-emptyRow">
                                        <div className="stg-sectionTitle">No payments yet</div>
                                        <div className="stg-sectionText">
                                            Payments will appear here after successful charges.
                                        </div>
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