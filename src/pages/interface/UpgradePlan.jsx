import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import { Tabs } from "@base-ui/react/tabs";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import ShareProfile from "../../components/ShareProfile";

import "../../styling/fonts.css";
import "../../styling/spacing.css";
import "../../styling/dashboard/upgradeplan.css";

import { BASE_URL } from "../../services/api";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useMyProfiles } from "../../hooks/useBusinessCard";

import FreePlanIcon from "../../assets/icons/FreePlan.svg";
import PlusPlanIcon from "../../assets/icons/PlusPlan.svg";
import TeamsPlanIcon from "../../assets/icons/TeamsPlan.svg";

const CHECKOUT_INTENT_KEY = "konar_checkout_intent_v1";

function safeGetToken() {
    try {
        return localStorage.getItem("token") || "";
    } catch {
        return "";
    }
}

function clearLocalAuth() {
    try {
        localStorage.removeItem("token");
        localStorage.removeItem("authUser");
        localStorage.removeItem(CHECKOUT_INTENT_KEY);
    } catch {
        // ignore
    }
}

function isTokenExpired(token) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return false;

        const payload = JSON.parse(
            decodeURIComponent(
                atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            )
        );

        const exp = Number(payload?.exp || 0);
        if (!exp) return false;
        return Date.now() >= exp * 1000;
    } catch {
        return false;
    }
}

function isLoggedIn() {
    const t = safeGetToken();
    if (!t) return false;
    if (isTokenExpired(t)) {
        clearLocalAuth();
        return false;
    }
    return true;
}

function formatDate(d) {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function fmtGBP(n) {
    const num = Number(n);
    if (!Number.isFinite(num)) return "—";
    return `£${num.toFixed(0)}`;
}

function normalizePlanLabel(plan) {
    if (plan === "plus") return "Plus";
    if (plan === "teams") return "Extra Profile";
    return "Basic Plan";
}

const centerTrim = (v) => (v ?? "").toString().trim();
const safeLower = (v) => centerTrim(v).toLowerCase();

const normalizeSlug = (raw) =>
    safeLower(raw)
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

const buildPublicUrl = (profileSlug) => {
    const s = normalizeSlug(profileSlug);
    if (!s) return `${window.location.origin}/u/`;
    return `${window.location.origin}/u/${encodeURIComponent(s)}`;
};

function showUpgradeToast(kind, message) {
    const config = {
        success: {
            label: "Success",
            icon: "✓",
        },
        error: {
            label: "Something went wrong",
            icon: "!",
        },
        info: {
            label: "Heads up",
            icon: "i",
        },
    };

    const tone = config[kind] || config.info;

    toast.custom(
        (t) => (
            <div
                className={`upg-toast upg-toast--${kind} ${t.visible ? "is-visible" : "is-hidden"}`}
            >
                <div className="upg-toastIcon" aria-hidden="true">
                    {tone.icon}
                </div>
                <div className="upg-toastCopy">
                    <div className="upg-toastTitle">{tone.label}</div>
                    <div className="upg-toastText">{message}</div>
                </div>
                <button
                    type="button"
                    className="upg-toastClose"
                    onClick={() => toast.dismiss(t.id)}
                    aria-label="Close notification"
                >
                    ×
                </button>
            </div>
        ),
        {
            duration: kind === "error" ? 4200 : 3200,
            position: "top-right",
        }
    );
}

function CheckIcon({ featured = false }) {
    return (
        <svg
            viewBox="0 0 20 20"
            className={`upg-checkIcon ${featured ? "upg-checkIcon--featured" : ""}`}
            aria-hidden="true"
        >
            <path
                d="M5 10.5 8.25 13.75 15 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CrownIcon() {
    return (
        <svg viewBox="0 0 20 20" className="upg-miniIcon" aria-hidden="true">
            <path
                d="M3 14.5 4.7 6.8l4 3.4L10 5l1.3 5.2 4-3.4 1.7 7.7H3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function BillingIcon() {
    return (
        <svg viewBox="0 0 20 20" className="upg-miniIcon" aria-hidden="true">
            <path
                d="M3.5 6.5h13M5.5 3.5h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function FeatureStat({ label, value, tone = "default" }) {
    return (
        <div className={`upg-statCard ${tone === "accent" ? "upg-statCard--accent" : ""}`}>
            <div className="upg-statLabel">{label}</div>
            <div className="upg-statValue">{value}</div>
        </div>
    );
}

function PlanCard({ plan, currentPlan, loadingKey }) {
    const featured = !!plan.featured;
    const current = currentPlan === plan.key;

    return (
        <motion.article
            className={[
                "upg-planCard",
                featured ? "upg-planCard--featured" : "",
                current ? "upg-planCard--current" : "",
                plan.key === "free" ? "upg-planCard--basic" : "",
                plan.key === "teams" ? "upg-planCard--extra" : "",
            ]
                .filter(Boolean)
                .join(" ")}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
        >
            <div className="upg-planGlow" aria-hidden="true" />

            <div className="upg-planTop">
                <div className="upg-planTopRow">
                    <div className={`upg-planTag ${featured ? "upg-planTag--featured" : ""}`}>
                        {plan.tag}
                    </div>

                    {current ? (
                        <div
                            className={`upg-planCurrentBadge ${featured ? "upg-planCurrentBadge--featured" : ""
                                }`}
                        >
                            Current plan
                        </div>
                    ) : null}
                </div>

                <div className="upg-planNameRow">
                    <span
                        className={`upg-planIconWrap ${featured ? "upg-planIconWrap--featured" : ""
                            }`}
                    >
                        <img src={plan.icon} alt="" className="upg-planIcon" />
                    </span>

                    <div className="upg-planNameBlock">
                        <h3 className={`upg-planName ${featured ? "upg-planName--featured" : ""}`}>
                            {plan.title}
                        </h3>
                        <p className={`upg-planDesc ${featured ? "upg-planDesc--featured" : ""}`}>
                            {plan.description}
                        </p>
                    </div>
                </div>

                <div className="upg-planPriceWrap">
                    <div className="upg-planPriceLine">
                        <div
                            className={`upg-planPrice ${featured ? "upg-planPrice--featured" : ""}`}
                        >
                            {plan.price}
                        </div>
                        <div
                            className={`upg-planCadence ${featured ? "upg-planCadence--featured" : ""}`}
                        >
                            {plan.cadence}
                        </div>
                    </div>

                    {plan.note ? (
                        <div
                            className={`upg-planBillingNote ${featured ? "upg-planBillingNote--featured" : ""
                                }`}
                        >
                            {plan.note}
                        </div>
                    ) : null}
                </div>

                {plan.meta?.length ? (
                    <div className={`upg-planMeta ${featured ? "upg-planMeta--featured" : ""}`}>
                        {plan.meta.map((m, i) => (
                            <div key={`${plan.key}-meta-${i}`}>{m}</div>
                        ))}
                    </div>
                ) : null}
            </div>

            <div className={`upg-planDivider ${featured ? "upg-planDivider--featured" : ""}`} />

            <div className="upg-planBody">
                <div className={`upg-planIncluded ${featured ? "upg-planIncluded--featured" : ""}`}>
                    Included in this plan
                </div>

                <ul className="upg-planList">
                    {plan.highlights.map((item, index) => (
                        <li
                            key={`${plan.key}-${index}`}
                            className={`upg-planListItem ${featured ? "upg-planListItem--featured" : ""
                                }`}
                        >
                            <span className="upg-planCheckWrap">
                                <CheckIcon featured={featured} />
                            </span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>

                <div className="upg-planActions">
                    {plan.button.type === "link" ? (
                        <a
                            href={plan.button.to}
                            className={`upg-btn ${featured ? "upg-btn--featured" : "upg-btn--primary"}`}
                        >
                            {plan.button.label}
                        </a>
                    ) : (
                        <button
                            type="button"
                            className={`upg-btn ${featured ? "upg-btn--featured" : "upg-btn--primary"
                                } ${plan.button.disabled ? "is-disabled" : ""}`}
                            onClick={plan.button.onClick || undefined}
                            disabled={!!plan.button.disabled}
                        >
                            {loadingKey === plan.loadingMatch ? "Working…" : plan.button.label}
                        </button>
                    )}

                    {plan.button.helper ? (
                        <div
                            className={`upg-planHelper ${featured ? "upg-planHelper--featured" : ""
                                }`}
                        >
                            {plan.button.helper}
                        </div>
                    ) : null}
                </div>
            </div>
        </motion.article>
    );
}

export default function UpgradePlan() {
    const { data: authUser } = useAuthUser();
    const { data: cards } = useMyProfiles();

    const [billing, setBilling] = useState("monthly");
    const [loadingKey, setLoadingKey] = useState(null);

    const [subLoading, setSubLoading] = useState(false);
    const [subErr, setSubErr] = useState("");
    const [subState, setSubState] = useState(null);

    const [shareOpen, setShareOpen] = useState(false);
    const [selectedSlug, setSelectedSlug] = useState(null);

    const apiBase = BASE_URL;

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

    const PRICES = useMemo(() => {
        const plusMonthly = 5;
        const plusYearlyTotal = 50;

        return {
            plus: {
                monthly: {
                    perMonth: plusMonthly,
                    billedLabel: "Billed monthly. Cancel anytime.",
                },
                yearly: {
                    perMonth: plusYearlyTotal / 12,
                    billedTotal: plusYearlyTotal,
                    billedLabel: "Billed yearly. Best value if you already know you want the full setup.",
                },
            },
        };
    }, []);

    const plusDisplayPrice =
        billing === "monthly"
            ? PRICES.plus.monthly.perMonth
            : PRICES.plus.yearly.billedTotal;

    const plusDisplayCadence = billing === "monthly" ? "per month" : "per year";

    const plusBillingNote =
        billing === "monthly"
            ? PRICES.plus.monthly.billedLabel
            : PRICES.plus.yearly.billedLabel;

    const billingNote =
        billing === "monthly"
            ? "Simple monthly billing. Cancel anytime."
            : "Pay yearly and keep your plan sorted for the full year.";

    useEffect(() => {
        let mounted = true;

        async function loadStatus() {
            if (!apiBase) return;

            if (!isLoggedIn()) {
                if (!mounted) return;
                setSubState(null);
                setSubErr("");
                setSubLoading(false);
                return;
            }

            try {
                setSubLoading(true);
                setSubErr("");

                const token = safeGetToken();
                const ts = Date.now();

                const summaryRes = await fetch(`${apiBase}/api/billing/summary?ts=${ts}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                });

                const summaryData = await summaryRes.json().catch(() => ({}));

                if (summaryRes.status === 401 || summaryRes.status === 404) {
                    clearLocalAuth();
                    if (!mounted) return;
                    setSubState(null);
                    setSubErr("");
                    return;
                }

                if (!summaryRes.ok) {
                    throw new Error(summaryData?.error || "Failed to load billing summary");
                }

                const summaryPlan = summaryData?.plan || "free";
                const summaryInterval = summaryData?.planInterval || "monthly";
                const summaryStatus = summaryData?.subscriptionStatus || "free";
                const summaryCurrentPeriodEnd = summaryData?.currentPeriodEnd || null;

                const activeByStatus = ["active", "trialing"].includes(
                    safeLower(summaryStatus)
                );

                const activeByDate =
                    !!summaryCurrentPeriodEnd &&
                    !Number.isNaN(new Date(summaryCurrentPeriodEnd).getTime()) &&
                    new Date(summaryCurrentPeriodEnd).getTime() > Date.now();

                if (!mounted) return;

                setSubState({
                    active: activeByStatus || activeByDate,
                    plan: summaryPlan,
                    interval: summaryInterval,
                    status: summaryStatus,
                    currentPeriodEnd: summaryCurrentPeriodEnd,
                });
            } catch (e) {
                if (!mounted) return;
                setSubErr(e?.message || "Failed to load subscription status");
                setSubState(null);
            } finally {
                if (mounted) setSubLoading(false);
            }
        }

        loadStatus();

        return () => {
            mounted = false;
        };
    }, [apiBase]);

    const currentPlan = subState?.plan || "free";
    const isActive = !!subState?.active;
    const currentPeriodEnd = subState?.currentPeriodEnd ? new Date(subState.currentPeriodEnd) : null;

    const hasCurrentPeriodDate =
        !!currentPeriodEnd && !Number.isNaN(currentPeriodEnd.getTime());

    const hasFutureAccess =
        hasCurrentPeriodDate && currentPeriodEnd.getTime() > Date.now();

    const renewalDateLabel = hasCurrentPeriodDate ? formatDate(currentPeriodEnd) : "";
    const activeUntilLabel = hasCurrentPeriodDate ? formatDate(currentPeriodEnd) : "";

    const planStatusLine = useMemo(() => {
        if (!isLoggedIn()) return "";
        if (!subState) return "";
        if (currentPlan === "free" && !isActive) return "You’re currently on the Basic Plan.";
        if (renewalDateLabel) {
            return `Your ${normalizePlanLabel(currentPlan)} is active until ${renewalDateLabel}.`;
        }
        if (isActive) return `Your ${normalizePlanLabel(currentPlan)} is active.`;
        return "No active paid subscription found.";
    }, [subState, currentPlan, isActive, renewalDateLabel]);

    const saveCheckoutIntent = (planKey) => {
        try {
            const returnUrl = `${window.location.origin}/myprofile?subscribed=1`;
            const intent = {
                planKey,
                createdAt: Date.now(),
                returnUrl,
                successReturn: returnUrl,
                cancelReturn: `${window.location.origin}/upgrade-plan`,
            };
            localStorage.setItem(CHECKOUT_INTENT_KEY, JSON.stringify(intent));
        } catch {
            // ignore
        }
    };

    const startSubscription = async (planKey) => {
        if (!isLoggedIn()) {
            saveCheckoutIntent(planKey);
            showUpgradeToast("info", "Please log in first so we can start your subscription.");
            window.location.href = "/login";
            return;
        }

        if (isActive && currentPlan === String(planKey).split("-")[0]) {
            showUpgradeToast("info", "You’re already on this plan.");
            return;
        }

        setLoadingKey(planKey);

        try {
            const token = safeGetToken();
            const returnUrl = `${window.location.origin}/myprofile?subscribed=1`;

            const res = await fetch(`${apiBase}/api/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({ planKey, returnUrl }),
            });

            const data = await res.json().catch(() => ({}));

            if (
                res.status === 401 ||
                res.status === 404 ||
                /user not found/i.test(String(data?.error || ""))
            ) {
                clearLocalAuth();
                showUpgradeToast("error", "Your session expired. Please log in again.");
                window.location.href = "/login";
                return;
            }

            if (!res.ok || data?.error) {
                throw new Error(data?.error || "Failed to start checkout");
            }

            if (!data?.url) {
                throw new Error("Stripe checkout URL is missing");
            }

            try {
                localStorage.removeItem(CHECKOUT_INTENT_KEY);
            } catch {
                // ignore
            }

            window.location.href = data.url;
        } catch (err) {
            showUpgradeToast("error", err?.message || "Subscription could not be started.");
        } finally {
            setLoadingKey(null);
        }
    };

    const openBillingPortal = async () => {
        if (!isLoggedIn()) {
            showUpgradeToast("info", "Log in to manage your billing and subscription.");
            window.location.href = "/login";
            return;
        }

        try {
            const token = safeGetToken();

            const res = await fetch(`${apiBase}/api/billing-portal`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({}),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 401 || res.status === 404) {
                clearLocalAuth();
                showUpgradeToast("error", "Your session expired. Please log in again.");
                window.location.href = "/login";
                return;
            }

            if (!res.ok || data?.error) {
                throw new Error(data?.error || "Could not open billing portal");
            }

            if (!data?.url) {
                throw new Error("Billing portal URL is missing");
            }

            window.location.href = data.url;
        } catch (e) {
            showUpgradeToast("error", e?.message || "Billing portal is not available right now.");
        }
    };

    const goToProfilesPage = () => {
        window.location.href = "/profiles";
    };

    const getPlanButton = (planName, planKeyForPaid) => {
        const logged = isLoggedIn();

        if (planName === "teams") {
            return {
                type: "button",
                label: "+ Add extra profile",
                onClick: goToProfilesPage,
                disabled: false,
                helper: "You’ll be taken to Profiles to claim another public link.",
            };
        }

        if (!logged) {
            if (planName === "free") {
                return {
                    type: "link",
                    label: "Start basic plan",
                    to: "/register",
                    disabled: false,
                    helper: "",
                };
            }

            return {
                type: "button",
                label: "Upgrade to Plus",
                onClick: () => startSubscription(planKeyForPaid),
                disabled: !!loadingKey,
                helper: "",
            };
        }

        const current = currentPlan;
        const stillHasPaidAccess =
            current !== "free" && (isActive || hasFutureAccess || hasCurrentPeriodDate);

        if (planName === current && stillHasPaidAccess) {
            return {
                type: "button",
                label: "Active",
                onClick: null,
                disabled: true,
                helper: renewalDateLabel ? `Active until ${renewalDateLabel}` : "",
            };
        }

        if (planName === "free") {
            if (stillHasPaidAccess) {
                return {
                    type: "button",
                    label: "Downgrade",
                    onClick: openBillingPortal,
                    disabled: !!loadingKey || subLoading,
                    helper: renewalDateLabel
                        ? `Paid access remains until ${renewalDateLabel}`
                        : "Manage downgrade in billing",
                };
            }

            if (current === "free") {
                return {
                    type: "button",
                    label: "Active",
                    onClick: null,
                    disabled: true,
                    helper: "",
                };
            }

            return {
                type: "button",
                label: "Choose basic plan",
                onClick: openBillingPortal,
                disabled: false,
                helper: "",
            };
        }

        return {
            type: "button",
            label: "Upgrade",
            onClick: () => startSubscription(planKeyForPaid),
            disabled: !!loadingKey || subLoading,
            helper: "",
        };
    };

    const planCards = useMemo(() => {
        const plusKey = billing === "monthly" ? "plus-monthly" : "plus-yearly";
        const extraProfileExample3 =
            billing === "monthly" ? 5 + 2 + 2 : Math.round((50 / 12) + 2 + 2);

        return [
            {
                key: "free",
                title: "Basic Plan",
                description:
                    "A clean starter option for getting online, looking professional, and sharing your profile.",
                icon: FreePlanIcon,
                tag: "Start here",
                featured: false,
                price: "£0",
                cadence: "No monthly fees",
                note: "Free to use. Upgrade any time.",
                meta: [],
                highlights: [
                    "1 profile",
                    "1 template design",
                    "Up to 6 work images",
                    "Up to 3 services",
                    "Up to 3 reviews",
                    "Basic analytics only",
                ],
                button: getPlanButton("free"),
                loadingMatch: "free",
            },
            {
                key: "plus",
                title: "Plus",
                description:
                    "The full professional setup with stronger branding, more profile content, and full analytics.",
                icon: PlusPlanIcon,
                tag: "Most popular",
                featured: true,
                price: fmtGBP(plusDisplayPrice),
                cadence: plusDisplayCadence,
                note: plusBillingNote,
                meta: [],
                highlights: [
                    "1 profile",
                    "All 5 template designs",
                    "Up to 12 work images",
                    "Up to 12 services",
                    "Up to 12 reviews",
                    "Full analytics dashboard",
                ],
                button: getPlanButton("plus", plusKey),
                loadingMatch: plusKey,
            },
            {
                key: "teams",
                title: "Extra Profile",
                description:
                    "Add another public profile when you want a separate service, person, brand, or location.",
                icon: TeamsPlanIcon,
                tag: "Grow as needed",
                featured: false,
                price: "£2",
                cadence: "per extra profile / month",
                note: "Billed monthly as an add-on to Plus.",
                meta: [
                    "Only available with Plus",
                    `Example: 3 profiles total = ${fmtGBP(extraProfileExample3)} / month`,
                ],
                highlights: [
                    "Adds 1 more profile",
                    "Separate public link",
                    "Separate QR code",
                    "Separate profile analytics",
                    "Ideal for staff or extra services",
                    "Managed from your Profiles page",
                ],
                button: getPlanButton("teams"),
                loadingMatch: "teams-extra-profile",
            },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        billing,
        currentPlan,
        isActive,
        hasFutureAccess,
        hasCurrentPeriodDate,
        renewalDateLabel,
        loadingKey,
        subLoading,
        plusDisplayPrice,
        plusDisplayCadence,
        plusBillingNote,
    ]);

    const handleOpenShareProfile = () => {
        if (!selectedProfile) {
            showUpgradeToast("error", "Create a profile first before sharing.");
            return;
        }
        setShareOpen(true);
    };

    const handleCloseShareProfile = () => {
        setShareOpen(false);
    };

    const shareToFacebook = () => {
        if (!selectedProfile?.url) {
            showUpgradeToast("error", "No profile link is available yet.");
            return;
        }

        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            selectedProfile.url
        )}`;

        window.open(url, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToInstagram = async () => {
        if (!selectedProfile?.url) {
            showUpgradeToast("error", "No profile link is available yet.");
            return;
        }

        try {
            await navigator.clipboard.writeText(selectedProfile.url);
            showUpgradeToast("success", "Profile link copied for Instagram sharing.");
        } catch {
            showUpgradeToast("error", "Could not copy the profile link.");
        }

        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    };

    const shareToMessenger = async () => {
        if (!selectedProfile?.url) {
            showUpgradeToast("error", "No profile link is available yet.");
            return;
        }

        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");

        if (isMobile) {
            try {
                await navigator.clipboard.writeText(selectedProfile.url);
                showUpgradeToast(
                    "info",
                    "Messenger sharing is not supported in mobile browsers, so the link was copied instead."
                );
            } catch {
                showUpgradeToast("error", "Could not copy the profile link.");
            }
            return;
        }

        const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
            selectedProfile.url
        )}&app_id=291494419107518&redirect_uri=${encodeURIComponent(selectedProfile.url)}`;

        window.open(url, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToWhatsApp = () => {
        if (!selectedProfile?.url) {
            showUpgradeToast("error", "No profile link is available yet.");
            return;
        }

        const text = `Check out my profile: ${selectedProfile.url}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const shareByText = () => {
        if (!selectedProfile?.url) {
            showUpgradeToast("error", "No profile link is available yet.");
            return;
        }

        const body = `Check out my profile: ${selectedProfile.url}`;
        window.location.href = `sms:?&body=${encodeURIComponent(body)}`;
    };

    const handleAppleWallet = () => {
        showUpgradeToast("info", "Apple Wallet support is coming soon.");
    };

    const handleGoogleWallet = () => {
        showUpgradeToast("info", "Google Wallet support is coming soon.");
    };

    return (
        <DashboardLayout hideDesktopHeader>
            <div className="upg-shell">
                <PageHeader
                    title="Upgrade Plan"
                    subtitle="Choose the right plan for your profile, your business, and the way you want to grow."
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

                <motion.section
                    className="upg-heroCard"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                >
                    <div className="upg-heroMain">
                        <div className="upg-heroPills">
                            <span className="upg-pill upg-pill--neutral">
                                <CrownIcon />
                                {normalizePlanLabel(currentPlan)}
                            </span>
                            <span className="upg-pill upg-pill--neutral">
                                <BillingIcon />
                                {billing === "monthly" ? "Monthly billing" : "Yearly billing"}
                            </span>
                        </div>

                        <h2 className="upg-heroTitle">
                            Upgrade when you want more control, more trust signals, and better visibility
                        </h2>

                        <p className="upg-heroText">
                            Start on the Basic Plan, unlock the full professional experience with Plus,
                            and add extra profiles when you want separate links for people, services, or locations.
                        </p>

                        <div className="upg-heroStats">
                            <FeatureStat
                                label="Current plan"
                                value={normalizePlanLabel(currentPlan)}
                                tone="accent"
                            />
                            <FeatureStat
                                label="Status"
                                value={subLoading ? "Checking…" : isActive || hasFutureAccess ? "Active" : "Free"}
                            />
                            <FeatureStat
                                label="Renews / access"
                                value={activeUntilLabel || "No renewal date"}
                            />
                        </div>
                    </div>

                    <div className="upg-heroAside">
                        <div className="upg-billingCard">
                            <div className="upg-billingCardTop">
                                <div className="upg-billingCardEyebrow">Manage billing</div>
                                <h3 className="upg-billingCardTitle">Subscription & renewals</h3>
                                <p className="upg-billingCardText">
                                    {subLoading
                                        ? "Checking your current billing status..."
                                        : subErr
                                            ? subErr
                                            : isLoggedIn()
                                                ? planStatusLine || "No billing status available."
                                                : "Log in to manage your subscription, billing details, and renewals."}
                                </p>
                            </div>

                            <div className="upg-billingCardActions">
                                <button
                                    type="button"
                                    className="upg-btn upg-btn--dark"
                                    onClick={openBillingPortal}
                                >
                                    Open billing portal
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    className="upg-mainCard"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.04, ease: "easeOut" }}
                >
                    <div className="upg-mainHead">
                        <div className="upg-mainHeadCopy">
                            <h2 className="upg-mainTitle">Compare your options</h2>
                            <p className="upg-mainSub">
                                Keep it simple with the Basic Plan, unlock more with Plus, or add another profile when you need one.
                            </p>
                        </div>

                        <div className="upg-mainHeadControls">
                            <Tabs.Root
                                value={billing}
                                onValueChange={(value) => {
                                    if (value === "monthly" || value === "yearly") {
                                        setBilling(value);
                                    }
                                }}
                                className="upg-tabsRoot"
                            >
                                <Tabs.List aria-label="Billing interval" className="upg-billingTabs">
                                    <Tabs.Tab
                                        value="monthly"
                                        className={`upg-tab ${billing === "monthly" ? "is-active" : ""}`}
                                    >
                                        Monthly
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        value="yearly"
                                        className={`upg-tab ${billing === "yearly" ? "is-active" : ""}`}
                                    >
                                        Yearly
                                    </Tabs.Tab>
                                </Tabs.List>
                            </Tabs.Root>

                            <div className="upg-billingNote">
                                {billingNote} Extra Profile always bills monthly as a £2 add-on per extra profile.
                            </div>
                        </div>
                    </div>

                    <div className="upg-plansGrid">
                        {planCards.map((plan, index) => (
                            <motion.div
                                key={plan.key}
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.28, delay: index * 0.05, ease: "easeOut" }}
                            >
                                <PlanCard
                                    plan={plan}
                                    currentPlan={currentPlan}
                                    loadingKey={loadingKey}
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            </div>
        </DashboardLayout>
    );
}