import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import ShareProfile from "../../components/ShareProfile";

import "../../styling/spacing.css";
import "../../styling/dashboard/settings.css";

import { useAuthUser } from "../../hooks/useAuthUser";
import { useMyProfiles } from "../../hooks/useBusinessCard";
import api from "../../services/api";

const safeLower = (v) => String(v || "").toLowerCase();
const centerTrim = (v) => (v ?? "").toString().trim();

const normalizeSlug = (raw) =>
    centerTrim(raw)
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

const buildPublicUrl = (profileSlug) => {
    const s = normalizeSlug(profileSlug);
    if (!s) return `${window.location.origin}/u/`;
    return `${window.location.origin}/u/${encodeURIComponent(s)}`;
};

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

function initialsFromName(name, email) {
    const raw = centerTrim(name) || centerTrim(email) || "U";
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
    }
    return (parts[0]?.slice(0, 2) || "U").toUpperCase();
}

function statusTone(status) {
    const value = safeLower(status);
    if (["active", "paid", "succeeded"].includes(value)) return "success";
    if (["trialing", "processing"].includes(value)) return "info";
    if (["past_due", "requires_payment_method"].includes(value)) return "warn";
    if (["failed", "canceled", "cancelled", "uncollectible", "void"].includes(value)) return "danger";
    return "neutral";
}

function planTone(plan) {
    const value = safeLower(plan);
    if (value === "plus") return "plus";
    if (value === "teams") return "teams";
    return "free";
}

function getPlanLabel(plan) {
    const value = centerTrim(plan);
    if (!value) return "Free";
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function SectionShell({ children, delay = 0 }) {
    return (
        <motion.section
            className="stg-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: "easeOut", delay }}
        >
            {children}
        </motion.section>
    );
}

export default function Settings() {
    const {
        data: authUser,
        isLoading: authLoading,
        refetch: refetchAuth,
    } = useAuthUser();

    const { data: cards } = useMyProfiles();

    const [summary, setSummary] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadErr, setLoadErr] = useState("");

    const [shareOpen, setShareOpen] = useState(false);
    const [selectedSlug, setSelectedSlug] = useState(null);

    const profilesForShare = useMemo(() => {
        const xs = Array.isArray(cards) ? cards : [];
        return xs
            .map((c) => {
                const slug = centerTrim(c?.profile_slug);
                if (!slug) return null;

                const name =
                    centerTrim(c?.business_card_name) ||
                    centerTrim(c?.business_name) ||
                    centerTrim(c?.full_name) ||
                    (slug === "main" ? "Main Profile" : "Profile");

                return {
                    slug,
                    name,
                    url: buildPublicUrl(slug),
                };
            })
            .filter(Boolean);
    }, [cards]);

    useEffect(() => {
        if (!profilesForShare.length) {
            setSelectedSlug(null);
            return;
        }

        setSelectedSlug((prev) => {
            if (prev && profilesForShare.some((p) => p.slug === prev)) return prev;
            return profilesForShare[0].slug;
        });
    }, [profilesForShare]);

    const selectedProfile = useMemo(() => {
        if (!profilesForShare.length) return null;
        return profilesForShare.find((p) => p.slug === selectedSlug) || profilesForShare[0];
    }, [profilesForShare, selectedSlug]);

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

    const displayPlanLabel = getPlanLabel(plan);
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

    const handleOpenShareProfile = () => {
        if (!selectedProfile) {
            toast.error("Create a profile first.");
            return;
        }
        setShareOpen(true);
    };

    const handleCloseShareProfile = () => {
        setShareOpen(false);
    };

    const shareToFacebook = () => {
        if (!selectedProfile?.url) {
            toast.error("No profile link available yet.");
            return;
        }

        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            selectedProfile.url
        )}`;

        window.open(url, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToInstagram = async () => {
        if (!selectedProfile?.url) {
            toast.error("No profile link available yet.");
            return;
        }

        try {
            await navigator.clipboard.writeText(selectedProfile.url);
            toast.success("Profile link copied for Instagram sharing.");
        } catch {
            toast.error("Could not copy the link.");
        }

        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    };

    const shareToMessenger = async () => {
        if (!selectedProfile?.url) {
            toast.error("No profile link available yet.");
            return;
        }

        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(
            navigator.userAgent || ""
        );

        if (isMobile) {
            try {
                await navigator.clipboard.writeText(selectedProfile.url);
                toast.success(
                    "Messenger sharing is not supported on mobile browsers. Link copied instead."
                );
            } catch {
                toast.error("Could not copy the link.");
            }
            return;
        }

        const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
            selectedProfile.url
        )}&app_id=291494419107518&redirect_uri=${encodeURIComponent(
            selectedProfile.url
        )}`;

        window.open(url, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToWhatsApp = () => {
        if (!selectedProfile?.url) {
            toast.error("No profile link available yet.");
            return;
        }

        const text = `Check out my profile: ${selectedProfile.url}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const shareByText = () => {
        if (!selectedProfile?.url) {
            toast.error("No profile link available yet.");
            return;
        }

        const body = `Check out my profile: ${selectedProfile.url}`;
        window.location.href = `sms:?&body=${encodeURIComponent(body)}`;
    };

    const handleAppleWallet = () => {
        toast("Apple Wallet is coming soon.");
    };

    const handleGoogleWallet = () => {
        toast("Google Wallet is coming soon.");
    };

    return (
        <DashboardLayout hideDesktopHeader>
            <div className="stg-shell">
                <PageHeader
                    title="Settings"
                    subtitle="Manage your account, subscription, invoices, and payment history."
                    onShareClick={handleOpenShareProfile}
                    shareDisabled={!selectedProfile}
                />

                <ShareProfile
                    isOpen={shareOpen}
                    onClose={handleCloseShareProfile}
                    profiles={profilesForShare}
                    selectedSlug={selectedSlug}
                    onSelectSlug={setSelectedSlug}
                    username={authUser?.name || "konarcard"}
                    profileUrl={selectedProfile?.url || ""}
                    onFacebook={shareToFacebook}
                    onInstagram={shareToInstagram}
                    onMessenger={shareToMessenger}
                    onWhatsApp={shareToWhatsApp}
                    onText={shareByText}
                    onAppleWallet={handleAppleWallet}
                    onGoogleWallet={handleGoogleWallet}
                />

                {hasError ? (
                    <motion.div
                        className="stg-banner stg-banner--danger"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
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
                    </motion.div>
                ) : null}

                <div className="stg-grid">
                    <SectionShell delay={0.02}>
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <h2 className="stg-cardTitle">Account</h2>
                                <p className="stg-cardText">
                                    Your identity, sign-in provider, and account information.
                                </p>
                            </div>

                            <span className="stg-chip stg-chip--soft">
                                {isBusy ? "Loading" : `Login: ${isGoogle ? "Google" : "Email"}`}
                            </span>
                        </div>

                        <div className="stg-cardBody">
                            <div className="stg-heroAccount">
                                <div className="stg-heroAccountLeft">
                                    <div className="stg-avatar">
                                        {accountAvatar && !isBusy ? (
                                            <img src={accountAvatar} alt="Profile" />
                                        ) : (
                                            <div
                                                className={`stg-avatarFallback ${isBusy ? "stg-skelBlock" : ""}`}
                                            >
                                                {!isBusy ? initialsFromName(accountName, accountEmail) : ""}
                                            </div>
                                        )}
                                    </div>

                                    <div className="stg-heroIdentity">
                                        <div className="stg-heroName">
                                            {isBusy ? <span className="stg-skelText w52" /> : accountName}
                                        </div>
                                        <div
                                            className="stg-heroEmail"
                                            title={!isBusy ? accountEmail : undefined}
                                        >
                                            {isBusy ? <span className="stg-skelText w72" /> : accountEmail}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="stg-infoGrid">
                                <div className="stg-infoCard">
                                    <div className="stg-infoLabel">Full name</div>
                                    <div className={`stg-infoValue ${isBusy ? "stg-skelLine" : ""}`}>
                                        {isBusy ? "" : accountName}
                                    </div>
                                </div>

                                <div className="stg-infoCard">
                                    <div className="stg-infoLabel">Email address</div>
                                    <div
                                        className={`stg-infoValue stg-infoValue--single ${isBusy ? "stg-skelLine" : ""}`}
                                        title={!isBusy ? accountEmail : undefined}
                                    >
                                        {isBusy ? "" : accountEmail}
                                    </div>
                                </div>
                            </div>

                            <div className="stg-inlineNote">
                                {isGoogle && !isBusy ? (
                                    <>
                                        This account is connected through <strong>Google</strong>. Profile and password
                                        changes should be managed through your Google account.
                                    </>
                                ) : (
                                    <>
                                        Keep your account information up to date so billing and support communications
                                        always reach you correctly.
                                    </>
                                )}
                            </div>

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
                                        Delete Account
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </SectionShell>

                    <SectionShell delay={0.06}>
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <h2 className="stg-cardTitle">Billing</h2>
                                <p className="stg-cardText">
                                    Subscription state, billing cadence, and renewal information.
                                </p>
                            </div>

                            <span className={`stg-chip stg-chip--plan stg-chip--${planTone(plan)}`}>
                                {isBusy ? "…" : `Plan: ${displayPlanLabel}`}
                            </span>
                        </div>

                        <div className="stg-cardBody">
                            <div className="stg-stats3">
                                <div className="stg-stat">
                                    <div className="stg-statK">Status</div>
                                    <div className="stg-statV">
                                        {isBusy ? (
                                            <span className="stg-skelText w70" />
                                        ) : (
                                            <span className={`stg-statBadge stg-statBadge--${statusTone(subscriptionStatus)}`}>
                                                {pick(subscriptionStatus)}
                                            </span>
                                        )}
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

                            <div className="stg-billingHero">
                                <div className="stg-billingHeroCopy">
                                    <h3 className="stg-subTitle">Manage your subscription</h3>
                                    <p className="stg-subText">
                                        Update your card, view invoices, change plans, or cancel anytime through the Stripe billing portal.
                                    </p>
                                </div>

                                <div className="stg-actions stg-actions--billing">
                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white stg-btnWhiteOnOrange"
                                        onClick={openBillingPortal}
                                        disabled={isBusy || hasError}
                                    >
                                        Manage Billing
                                    </button>

                                    <button
                                        type="button"
                                        className="kx-btn kx-btn--white stg-btnGhostOnOrange"
                                        onClick={() => (window.location.href = "/upgrade-plan")}
                                        disabled={isBusy}
                                    >
                                        View Plans
                                    </button>
                                </div>
                            </div>

                            <div className="stg-minorText">
                                Your payment method, invoices, and subscription controls are handled securely through Stripe.
                            </div>
                        </div>
                    </SectionShell>

                    <SectionShell delay={0.1}>
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <h2 className="stg-cardTitle">Invoices</h2>
                                <p className="stg-cardText">
                                    Finalized invoices and downloadable receipts for your account.
                                </p>
                            </div>
                        </div>

                        <div className="stg-cardBody stg-scrollArea">
                            <div className="stg-tableWrap">
                                <div className="stg-table stg-table--invoices">
                                    <div className="stg-row stg-rowHead stg-row4">
                                        <div>Date</div>
                                        <div>Amount</div>
                                        <div>Status</div>
                                        <div>Receipt</div>
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
                                                        <span className="stg-mobileLabel">Receipt</span>
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
                                                Finalized invoices will appear here once they are generated.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SectionShell>

                    <SectionShell delay={0.14}>
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <h2 className="stg-cardTitle">Payments</h2>
                                <p className="stg-cardText">
                                    Completed payments successfully processed on your account.
                                </p>
                            </div>
                        </div>

                        <div className="stg-cardBody stg-scrollArea">
                            <div className="stg-tableWrap">
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
                                            const desc = p?.description || p?.receipt_email || "Payment";

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
                                            <div className="stg-sectionTitle">No completed payments yet</div>
                                            <div className="stg-sectionText">
                                                Successful charges will appear here once they are processed.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SectionShell>
                </div>
            </div>
        </DashboardLayout>
    );
}