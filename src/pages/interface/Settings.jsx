import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useKonarToast } from "../../hooks/useKonarToast";
import { motion, AnimatePresence } from "motion/react";

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

// Shared card animation variants
const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: (delay) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
            delay,
        },
    }),
};

const rowVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 },
    }),
};

function SectionShell({ children, delay = 0 }) {
    return (
        <motion.section
            className="stg-card"
            custom={delay}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{
                y: -2,
                boxShadow: "0 20px 48px rgba(15,23,42,0.09)",
                transition: { duration: 0.22, ease: "easeOut" },
            }}
        >
            {children}
        </motion.section>
    );
}

function StatCard({ label, children, delay = 0 }) {
    return (
        <motion.div
            className="stg-stat"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay }}
        >
            <div className="stg-statK">{label}</div>
            <div className="stg-statV">{children}</div>
        </motion.div>
    );
}

export default function Settings() {
    const toast = useKonarToast();
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
                return { slug, name, url: buildPublicUrl(slug) };
            })
            .filter(Boolean);
    }, [cards]);

    useEffect(() => {
        if (!profilesForShare.length) { setSelectedSlug(null); return; }
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

            if (sStatus >= 400) throw new Error(sRes?.data?.error || "Could not load billing summary.");
            if (iStatus >= 400) throw new Error(iRes?.data?.error || "Could not load invoices.");
            if (pStatus >= 400) throw new Error(pRes?.data?.error || "Could not load payments.");

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

    const accountName = summary?.account?.name || authUser?.name || authUser?.full_name || "—";
    const accountEmail = summary?.account?.email || authUser?.email || "—";
    const accountAvatar = summary?.account?.avatar || authUser?.avatar || authUser?.picture || authUser?.photoURL || "";

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
            if (status >= 400) throw new Error(res?.data?.error || "Could not open billing portal.");
            const url = res?.data?.url;
            if (!url) throw new Error("Billing portal URL missing.");
            window.location.href = url;
        } catch (e) {
            toast.error(e?.response?.data?.error || e?.message || "Could not open billing portal.");
        }
    };

    const retryAll = async () => {
        setLoadErr("");
        try { await refetchAuth?.(); } catch { /* ignore */ }
        await loadBillingData();
    };

    const handleOpenShareProfile = () => {
        if (!selectedProfile) { toast.error("Create a profile first."); return; }
        setShareOpen(true);
    };

    const shareToFacebook = () => {
        if (!selectedProfile?.url) { toast.error("No profile link available yet."); return; }
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedProfile.url)}`, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToInstagram = async () => {
        if (!selectedProfile?.url) { toast.error("No profile link available yet."); return; }
        try { await navigator.clipboard.writeText(selectedProfile.url); toast.success("Profile link copied for Instagram sharing."); }
        catch { toast.error("Could not copy the link."); }
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    };

    const shareToMessenger = async () => {
        if (!selectedProfile?.url) { toast.error("No profile link available yet."); return; }
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
        if (isMobile) {
            try { await navigator.clipboard.writeText(selectedProfile.url); toast.success("Messenger sharing is not supported on mobile browsers. Link copied instead."); }
            catch { toast.error("Could not copy the link."); }
            return;
        }
        window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(selectedProfile.url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(selectedProfile.url)}`, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToWhatsApp = () => {
        if (!selectedProfile?.url) { toast.error("No profile link available yet."); return; }
        window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my profile: ${selectedProfile.url}`)}`, "_blank", "noopener,noreferrer");
    };

    const shareByText = () => {
        if (!selectedProfile?.url) { toast.error("No profile link available yet."); return; }
        window.location.href = `sms:?&body=${encodeURIComponent(`Check out my profile: ${selectedProfile.url}`)}`;
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
                    onClose={() => setShareOpen(false)}
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
                    onAppleWallet={() => toast("Apple Wallet is coming soon.")}
                    onGoogleWallet={() => toast("Google Wallet is coming soon.")}
                />

                <AnimatePresence>
                    {hasError && (
                        <motion.div
                            className="stg-banner stg-banner--danger"
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="stg-bannerCopy">
                                <div className="stg-sectionTitle">Couldn't load your settings</div>
                                <div className="stg-sectionText">{pick(loadErr, "Please try again.")}</div>
                            </div>
                            <button type="button" className="kx-btn kx-btn--black" onClick={retryAll} disabled={isBusy}>
                                Retry
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="stg-grid">

                    {/* ── ACCOUNT ── */}
                    <SectionShell delay={0.02}>
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <h2 className="stg-cardTitle">Account</h2>
                                <p className="stg-cardText">
                                    Your identity, sign-in provider, and account information.
                                </p>
                            </div>
                            <motion.span
                                className="stg-chip stg-chip--soft"
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
                            >
                                {isBusy ? "Loading" : `Login: ${isGoogle ? "Google" : "Email"}`}
                            </motion.span>
                        </div>

                        <div className="stg-cardBody">
                            <motion.div
                                className="stg-heroAccount"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                            >
                                <div className="stg-heroAccountLeft">
                                    <div className="stg-avatar">
                                        {accountAvatar && !isBusy ? (
                                            <img src={accountAvatar} alt="Profile" />
                                        ) : (
                                            <div className={`stg-avatarFallback ${isBusy ? "stg-skelBlock" : ""}`}>
                                                {!isBusy ? initialsFromName(accountName, accountEmail) : ""}
                                            </div>
                                        )}
                                    </div>
                                    <div className="stg-heroIdentity">
                                        <div className="stg-heroName">
                                            {isBusy ? <span className="stg-skelText w52" /> : accountName}
                                        </div>
                                        <div className="stg-heroEmail" title={!isBusy ? accountEmail : undefined}>
                                            {isBusy ? <span className="stg-skelText w72" /> : accountEmail}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <div className="stg-infoGrid">
                                {[
                                    { label: "Full name", value: accountName, single: false },
                                    { label: "Email address", value: accountEmail, single: true },
                                ].map(({ label, value, single }, i) => (
                                    <motion.div
                                        key={label}
                                        className="stg-infoCard"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.14 + i * 0.06 }}
                                    >
                                        <div className="stg-infoLabel">{label}</div>
                                        <div className={`stg-infoValue${single ? " stg-infoValue--single" : ""}${isBusy ? " stg-skelLine" : ""}`}
                                            title={single && !isBusy ? value : undefined}>
                                            {isBusy ? "" : value}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                className="stg-inlineNote"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.22 }}
                            >
                                {isGoogle && !isBusy ? (
                                    <>This account is connected through <strong>Google</strong>. Profile and password changes should be managed through your Google account.</>
                                ) : (
                                    <>Keep your account information up to date so billing and support communications always reach you correctly.</>
                                )}
                            </motion.div>

                            {!isGoogle && (
                                <motion.div
                                    className="stg-actions"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.28, delay: 0.26 }}
                                >
                                    <motion.button
                                        type="button"
                                        className="kx-btn kx-btn--black"
                                        disabled={isBusy}
                                        onClick={() => toast("Password reset flow can be connected next.")}
                                        whileHover={{ y: -2, boxShadow: "0 10px 24px rgba(11,22,53,0.22)" }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Reset Password
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        className="kx-btn kx-btn--white"
                                        disabled={isBusy}
                                        onClick={() => toast("Delete account flow can be connected next.")}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Delete Account
                                    </motion.button>
                                </motion.div>
                            )}
                        </div>
                    </SectionShell>

                    {/* ── BILLING ── */}
                    <SectionShell delay={0.07}>
                        <div className="stg-cardHead">
                            <div className="stg-cardHeadLeft">
                                <h2 className="stg-cardTitle">Billing</h2>
                                <p className="stg-cardText">
                                    Subscription state, billing cadence, and renewal information.
                                </p>
                            </div>
                            <motion.span
                                className={`stg-chip stg-chip--plan stg-chip--${planTone(plan)}`}
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.17 }}
                            >
                                {isBusy ? "…" : `Plan: ${displayPlanLabel}`}
                            </motion.span>
                        </div>

                        <div className="stg-cardBody">
                            <div className="stg-stats3">
                                <StatCard label="Status" delay={0.12}>
                                    {isBusy ? (
                                        <span className="stg-skelText w70" />
                                    ) : (
                                        <span className={`stg-statBadge stg-statBadge--${statusTone(subscriptionStatus)}`}>
                                            {pick(subscriptionStatus)}
                                        </span>
                                    )}
                                </StatCard>

                                <StatCard label="Interval" delay={0.17}>
                                    {isBusy ? <span className="stg-skelText w60" /> : pick(planInterval)}
                                </StatCard>

                                <StatCard label="Renews" delay={0.22}>
                                    {isBusy ? (
                                        <span className="stg-skelText w64" />
                                    ) : currentPeriodEnd ? (
                                        fmtDate(currentPeriodEnd)
                                    ) : "—"}
                                </StatCard>
                            </div>

                            <motion.div
                                className="stg-billingHero"
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                            >
                                <div className="stg-billingHeroCopy">
                                    <h3 className="stg-subTitle">Manage your subscription</h3>
                                    <p className="stg-subText">
                                        Update your card, view invoices, change plans, or cancel anytime through the Stripe billing portal.
                                    </p>
                                </div>

                                <div className="stg-actions stg-actions--billing">
                                    <motion.button
                                        type="button"
                                        className="kx-btn kx-btn--white stg-btnWhiteOnOrange"
                                        onClick={openBillingPortal}
                                        disabled={isBusy || hasError}
                                        whileHover={{ y: -2, boxShadow: "0 10px 24px rgba(0,0,0,0.14)" }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Manage Billing
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        className="kx-btn kx-btn--white stg-btnGhostOnOrange"
                                        onClick={() => (window.location.href = "/upgrade-plan")}
                                        disabled={isBusy}
                                        whileHover={{ y: -2, background: "rgba(255,255,255,0.22)" }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        View Plans
                                    </motion.button>
                                </div>
                            </motion.div>

                            <motion.p
                                className="stg-minorText"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.28, delay: 0.3 }}
                            >
                                Your payment method, invoices, and subscription controls are handled securely through Stripe.
                            </motion.p>
                        </div>
                    </SectionShell>

                    {/* ── INVOICES ── */}
                    <SectionShell delay={0.12}>
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
                                        <AnimatePresence>
                                            {invoices.map((inv, idx) => {
                                                const id = inv?.id || idx;
                                                const date = inv?.created;
                                                const amountMinor = inv?.total ?? inv?.amount_paid ?? inv?.amount_due;
                                                const currency = inv?.currency;
                                                const status = inv?.status || "—";
                                                const pdf = inv?.invoice_pdf || inv?.hosted_invoice_url;

                                                return (
                                                    <motion.div
                                                        className="stg-row stg-row4"
                                                        key={id}
                                                        custom={idx}
                                                        variants={rowVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                    >
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
                                                                <a className="stg-link" href={pdf} target="_blank" rel="noreferrer">
                                                                    Download
                                                                </a>
                                                            ) : "—"}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    ) : (
                                        <motion.div
                                            className="stg-emptyRow"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.28 }}
                                        >
                                            <div className="stg-sectionTitle">No invoices yet</div>
                                            <div className="stg-sectionText">
                                                Finalized invoices will appear here once they are generated.
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </SectionShell>

                    {/* ── PAYMENTS ── */}
                    <SectionShell delay={0.17}>
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
                                        <AnimatePresence>
                                            {payments.map((p, idx) => {
                                                const id = p?.id || idx;
                                                const date = p?.created;
                                                const amountMinor = p?.amount;
                                                const currency = p?.currency;
                                                const status = p?.status || "—";
                                                const desc = p?.description || p?.receipt_email || "Payment";

                                                return (
                                                    <motion.div
                                                        className="stg-row stg-row4p"
                                                        key={id}
                                                        custom={idx}
                                                        variants={rowVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                    >
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
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    ) : (
                                        <motion.div
                                            className="stg-emptyRow"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.28 }}
                                        >
                                            <div className="stg-sectionTitle">No completed payments yet</div>
                                            <div className="stg-sectionText">
                                                Successful charges will appear here once they are processed.
                                            </div>
                                        </motion.div>
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