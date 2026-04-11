import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
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

const pageReveal = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: "easeOut" },
};

const cardReveal = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: "easeOut" },
};

function SectionCard({ className = "", children }) {
    return (
        <motion.section
            {...cardReveal}
            className={`stg-card ${className}`.trim()}
        >
            {children}
        </motion.section>
    );
}

function CardHead({ title, text, pill }) {
    return (
        <div className="stg-cardHead">
            <div className="stg-cardHeadLeft">
                <h2 className="stg-cardTitle">{title}</h2>
                {text ? <p className="stg-cardText">{text}</p> : null}
            </div>
            {pill ? pill : null}
        </div>
    );
}

function StatBox({ label, value, loading = false }) {
    return (
        <div className="stg-stat">
            <div className="stg-statK">{label}</div>
            <div className="stg-statV">
                {loading ? <span className="stg-skelText w64" /> : value}
            </div>
        </div>
    );
}

function EmptyState({ title, text }) {
    return (
        <div className="stg-emptyRow">
            <div className="stg-sectionTitle">{title}</div>
            <div className="stg-sectionText">{text}</div>
        </div>
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

    const displayPlanUpper = String(plan || "free").toUpperCase();

    return (
        <DashboardLayout hideDesktopHeader>
            <motion.div className="stg-shell" {...pageReveal}>
                <PageHeader
                    title="Settings"
                    subtitle="Manage your account, billing, invoices and payment history."
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

                <AnimatePresence initial={false}>
                    {hasError ? (
                        <motion.div
                            key="settings-error"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="stg-banner stg-banner--danger"
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
                </AnimatePresence>

                <div className="stg-grid">
                    <SectionCard>
                        <CardHead
                            title="Account"
                            text="Your login method determines which account details can be edited."
                            pill={
                                <span className="stg-pill">
                                    Login: <strong>{isBusy ? "…" : isGoogle ? "GOOGLE" : "EMAIL"}</strong>
                                </span>
                            }
                        />

                        <div className="stg-cardBody">
                            <div className="stg-accountHero">
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
                                        <div
                                            className="stg-accountEmail"
                                            title={!isBusy ? accountEmail : undefined}
                                        >
                                            {isBusy ? <span className="stg-skelText w72" /> : accountEmail}
                                        </div>
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
                    </SectionCard>

                    <SectionCard>
                        <CardHead
                            title="Billing"
                            text="Subscription status, plan interval and renewal information."
                            pill={
                                <span className="stg-pill">
                                    Plan: <strong>{displayPlanUpper}</strong>
                                </span>
                            }
                        />

                        <div className="stg-cardBody">
                            <div className="stg-stats3">
                                <StatBox
                                    label="Status"
                                    value={pick(subscriptionStatus)}
                                    loading={isBusy}
                                />
                                <StatBox
                                    label="Interval"
                                    value={pick(planInterval)}
                                    loading={isBusy}
                                />
                                <StatBox
                                    label="Renews"
                                    value={currentPeriodEnd ? fmtDate(currentPeriodEnd) : "—"}
                                    loading={isBusy}
                                />
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
                    </SectionCard>

                    <SectionCard>
                        <CardHead
                            title="Invoices"
                            text="Subscription invoices and receipts."
                        />

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
                                    <EmptyState
                                        title="No invoices yet"
                                        text="Invoices will appear here once Stripe generates them."
                                    />
                                )}
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard>
                        <CardHead
                            title="Payments"
                            text="Your recent payment activity."
                        />

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
                                    <EmptyState
                                        title="No payments yet"
                                        text="Payments will appear here after successful charges."
                                    />
                                )}
                            </div>
                        </div>
                    </SectionCard>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}