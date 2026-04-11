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

function planRank(plan) {
    if (plan === "teams") return 2;
    if (plan === "plus") return 1;
    return 0;
}

function fmtGBP(n) {
    const num = Number(n);
    if (!Number.isFinite(num)) return "—";
    return `£${num.toFixed(2)}`;
}

function savingsLabel(fromPerMonth, toPerMonth) {
    const diff = Number(fromPerMonth) - Number(toPerMonth);
    if (!Number.isFinite(diff) || diff <= 0) return "";
    return `Save ${fmtGBP(diff)}/mo`;
}

function normalizePlanLabel(plan) {
    if (plan === "teams") return "Teams";
    if (plan === "plus") return "Plus";
    return "Free";
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

function SparklesIcon() {
    return (
        <svg viewBox="0 0 20 20" className="upg-miniIcon" aria-hidden="true">
            <path
                d="M10 2.8 11.6 7l4.2 1.6-4.2 1.6L10 14.4l-1.6-4.2L4.2 8.6 8.4 7 10 2.8Zm5.2 9.4.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8ZM4.4 11.8l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9.9-2.3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
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
                        className={`upg-planIconWrap ${featured ? "upg-planIconWrap--featured" : ""}`}
                    >
                        <img src={plan.icon} alt="" className="upg-planIcon" />
                    </span>

                    <div className="upg-planNameBlock">
                        <h3 className={`upg-planName ${featured ? "upg-planName--featured" : ""}`}>
                            {plan.title}
                        </h3>
                        <p
                            className={`upg-planDesc ${featured ? "upg-planDesc--featured" : ""}`}
                        >
                            {plan.description}
                        </p>
                    </div>
                </div>

                <div className="upg-planPriceWrap">
                    <div className={`upg-planPrice ${featured ? "upg-planPrice--featured" : ""}`}>
                        {plan.price}
                    </div>
                    <div
                        className={`upg-planCadence ${featured ? "upg-planCadence--featured" : ""}`}
                    >
                        {plan.cadence}
                    </div>
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
                <div
                    className={`upg-planIncluded ${featured ? "upg-planIncluded--featured" : ""}`}
                >
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
                            className={`upg-btn ${featured ? "upg-btn--featured" : "upg-btn--primary"
                                }`}
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
        const plusMonthly = 4.95;
        const plusQuarterlyPerMonth = 4.45;
        const plusYearlyPerMonth = 3.95;
        const addOnPerExtraProfilePerMonth = 1.95;

        const quarterMonths = 3;
        const yearMonths = 12;

        const plusQuarterTotal = plusQuarterlyPerMonth * quarterMonths;
        const plusYearTotal = plusYearlyPerMonth * yearMonths;

        return {
            addOnPerExtraProfilePerMonth,
            plus: {
                monthly: {
                    perMonth: plusMonthly,
                    billedLabel: `${fmtGBP(plusMonthly)} / month`,
                },
                quarterly: {
                    perMonth: plusQuarterlyPerMonth,
                    billedTotal: plusQuarterTotal,
                    billedLabel: `${fmtGBP(plusQuarterTotal)} / quarter`,
                },
                yearly: {
                    perMonth: plusYearlyPerMonth,
                    billedTotal: plusYearTotal,
                    billedLabel: `${fmtGBP(plusYearTotal)} / year`,
                },
            },
        };
    }, []);

    const plusMonthly = PRICES.plus.monthly.perMonth;

    const plusPerMonth =
        billing === "monthly"
            ? PRICES.plus.monthly.perMonth
            : billing === "quarterly"
                ? PRICES.plus.quarterly.perMonth
                : PRICES.plus.yearly.perMonth;

    const plusBilledLabel =
        billing === "monthly"
            ? PRICES.plus.monthly.billedLabel
            : billing === "quarterly"
                ? PRICES.plus.quarterly.billedLabel
                : PRICES.plus.yearly.billedLabel;

    const plusSavings = billing === "monthly" ? "" : savingsLabel(plusMonthly, plusPerMonth);

    const billingNote =
        billing === "monthly"
            ? "Billed monthly. Cancel anytime."
            : billing === "quarterly"
                ? "Billed every 3 months. Cancel anytime."
                : "Best value. Billed yearly.";

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
                const res = await fetch(`${apiBase}/api/subscription-status`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                });

                const data = await res.json().catch(() => ({}));

                if (res.status === 401 || res.status === 404) {
                    clearLocalAuth();
                    if (!mounted) return;
                    setSubState(null);
                    setSubErr("");
                    return;
                }

                if (!res.ok) {
                    throw new Error(data?.error || "Failed to load subscription status");
                }

                if (!mounted) return;

                setSubState({
                    active: !!data?.active,
                    plan: data?.plan || "free",
                    interval: data?.interval || "monthly",
                    status: data?.status || "free",
                    currentPeriodEnd: data?.currentPeriodEnd || null,
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
    const currentPeriodEnd = subState?.currentPeriodEnd
        ? new Date(subState.currentPeriodEnd)
        : null;

    const hasFutureAccess =
        !!currentPeriodEnd &&
        !Number.isNaN(currentPeriodEnd.getTime()) &&
        currentPeriodEnd.getTime() > Date.now();

    const activeUntilLabel = hasFutureAccess ? formatDate(currentPeriodEnd) : "";

    const planStatusLine = useMemo(() => {
        if (!isLoggedIn()) return "";
        if (!subState) return "";
        if (currentPlan === "free" && !isActive) return "You’re currently on the Free plan.";
        if (hasFutureAccess) {
            return `Your ${normalizePlanLabel(currentPlan)} plan is active until ${activeUntilLabel}.`;
        }
        if (isActive) return `Your ${normalizePlanLabel(currentPlan)} plan is active.`;
        return "No active paid subscription found.";
    }, [subState, currentPlan, isActive, hasFutureAccess, activeUntilLabel]);

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
            window.location.href = "/login";
            return;
        }

        if (isActive && currentPlan === planKey.split("-")[0]) {
            toast("You’re already on this plan.");
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
                toast.error("Your session expired. Please log in again.");
                window.location.href = "/login";
                return;
            }

            if (!res.ok || data?.error) {
                throw new Error(data?.error || "Failed to start checkout");
            }

            if (!data?.url) {
                throw new Error("Stripe session URL missing");
            }

            try {
                localStorage.removeItem(CHECKOUT_INTENT_KEY);
            } catch {
                // ignore
            }

            window.location.href = data.url;
        } catch (err) {
            toast.error(err?.message || "Subscription failed");
        } finally {
            setLoadingKey(null);
        }
    };

    const openBillingPortal = async () => {
        if (!isLoggedIn()) {
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
                window.location.href = "/login";
                return;
            }

            if (!res.ok || data?.error) {
                throw new Error(data?.error || "Could not open billing portal");
            }

            if (!data?.url) {
                throw new Error("Billing portal URL missing");
            }

            window.location.href = data.url;
        } catch (e) {
            toast.error(e?.message || "Billing portal is not available yet.");
        }
    };

    const getPlanButton = (planName, planKeyForPaid) => {
        const logged = isLoggedIn();

        if (!logged) {
            if (planName === "free") {
                return {
                    type: "link",
                    label: "Start free",
                    to: "/register",
                    disabled: false,
                    helper: "",
                };
            }

            return {
                type: "button",
                label: `Upgrade to ${planName === "plus" ? "Plus" : "Teams"}`,
                onClick: () => startSubscription(planKeyForPaid),
                disabled: !!loadingKey,
                helper: "",
            };
        }

        const current = currentPlan;
        const stillHasPaidAccess = current !== "free" && (isActive || hasFutureAccess);

        if (planName === current && stillHasPaidAccess) {
            return {
                type: "button",
                label: "Active",
                onClick: null,
                disabled: true,
                helper: hasFutureAccess ? `Active until ${activeUntilLabel}` : "",
            };
        }

        if (planName === "free") {
            if (stillHasPaidAccess) {
                return {
                    type: "button",
                    label: "Downgrade",
                    onClick: openBillingPortal,
                    disabled: !!loadingKey || subLoading,
                    helper: hasFutureAccess
                        ? `Paid access remains until ${activeUntilLabel}`
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
                label: "Choose Free",
                onClick: openBillingPortal,
                disabled: false,
                helper: "",
            };
        }

        const isUpgrade = planRank(planName) > planRank(current);
        const isDowngrade = planRank(planName) < planRank(current);

        if (isDowngrade) {
            return {
                type: "button",
                label: "Downgrade",
                onClick: openBillingPortal,
                disabled: !!loadingKey || subLoading,
                helper: hasFutureAccess ? `Current plan active until ${activeUntilLabel}` : "",
            };
        }

        if (isUpgrade && current !== "free" && stillHasPaidAccess) {
            return {
                type: "button",
                label: "Upgrade",
                onClick: openBillingPortal,
                disabled: !!loadingKey || subLoading,
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
        const plusKey = `plus-${billing}`;
        const teamsKey = `teams-${billing}`;
        const teamsExample3Profiles = plusPerMonth + PRICES.addOnPerExtraProfilePerMonth * 2;

        return [
            {
                key: "free",
                title: "Individual",
                description: "A clean free plan for getting started and sharing your KonarCard.",
                icon: FreePlanIcon,
                tag: "Best for starting out",
                featured: false,
                price: "£0",
                cadence: "No monthly fees",
                meta: ["Perfect for solo use", "Upgrade any time when you need more polish"],
                highlights: [
                    "Your KonarCard link",
                    "Contact buttons",
                    "QR sharing",
                    "Works on any phone",
                    "Unlimited updates",
                    "Tap or scan share",
                ],
                button: getPlanButton("free"),
                loadingMatch: "free",
            },
            {
                key: "plus",
                title: "Plus",
                description: "More control, stronger branding, and a more premium customer-facing profile.",
                icon: PlusPlanIcon,
                tag: "Most popular",
                featured: true,
                price: fmtGBP(plusPerMonth),
                cadence: "per month",
                meta: [
                    billing === "monthly"
                        ? "Cancel anytime. No contracts."
                        : `Billed ${plusBilledLabel}. Cancel anytime.`,
                    plusSavings || null,
                ].filter(Boolean),
                highlights: [
                    "Full customisation",
                    "More photos",
                    "Services & pricing",
                    "Reviews & ratings",
                    "Unlimited edits",
                    "Remove branding",
                    "Deeper analytics",
                ],
                button: getPlanButton("plus", plusKey),
                loadingMatch: plusKey,
            },
            {
                key: "teams",
                title: "Teams",
                description: "Built for small businesses managing multiple staff profiles from one place.",
                icon: TeamsPlanIcon,
                tag: "For growing teams",
                featured: false,
                price: fmtGBP(plusPerMonth),
                cadence: "+ £1.95 per extra profile",
                meta: [
                    billing === "monthly"
                        ? "Billed monthly. Cancel anytime."
                        : `Base billed ${plusBilledLabel}.`,
                    `Example: 3 profiles = ${fmtGBP(teamsExample3Profiles)} / month`,
                ],
                highlights: [
                    "Everything in Plus",
                    "Add staff profiles",
                    "Centralised controls",
                    "Shared branding",
                    "Team analytics",
                    "Manage in one place",
                ],
                button: getPlanButton("teams", teamsKey),
                loadingMatch: teamsKey,
            },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        billing,
        plusPerMonth,
        plusBilledLabel,
        plusSavings,
        currentPlan,
        isActive,
        hasFutureAccess,
        activeUntilLabel,
        loadingKey,
        subLoading,
        PRICES,
    ]);

    const currentPlanSummary =
        currentPlan === "teams"
            ? "Built for small teams managing multiple profiles and shared branding."
            : currentPlan === "plus"
                ? "More customisation, branding control, and deeper analytics."
                : "A simple starting plan for sharing your KonarCard and contact details.";

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
        )}&app_id=291494419107518&redirect_uri=${encodeURIComponent(selectedProfile.url)}`;

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
            <div className="upg-shell">
                <PageHeader
                    title="Upgrade Plan"
                    subtitle="Upgrade, manage billing, and change plans without leaving your dashboard."
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
                            <span className="upg-pill upg-pill--accent">
                                <SparklesIcon />
                                Plans
                            </span>
                            <span className="upg-pill upg-pill--neutral">
                                <CrownIcon />
                                {normalizePlanLabel(currentPlan)}
                            </span>
                            <span className="upg-pill upg-pill--neutral">
                                <BillingIcon />
                                {billing === "monthly"
                                    ? "Monthly billing"
                                    : billing === "quarterly"
                                        ? "Quarterly billing"
                                        : "Yearly billing"}
                            </span>
                        </div>

                        <h2 className="upg-heroTitle">
                            Choose the plan that fits how you share, sell, and grow with KonarCard
                        </h2>

                        <p className="upg-heroText">
                            Start free, unlock more branding and profile control with Plus, or manage
                            multiple people with Teams. Your billing and subscription settings stay in one
                            place.
                        </p>

                        <div className="upg-heroStats">
                            <FeatureStat label="Current plan" value={normalizePlanLabel(currentPlan)} tone="accent" />
                            <FeatureStat
                                label="Status"
                                value={
                                    subLoading ? "Checking…" : isActive || hasFutureAccess ? "Active" : "Free"
                                }
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
                                Billing stays flexible, and your plan can change whenever your business does.
                            </p>
                        </div>

                        <div className="upg-mainHeadControls">
                            <Tabs.Root
                                value={billing}
                                onValueChange={(value) => {
                                    if (value === "monthly" || value === "quarterly" || value === "yearly") {
                                        setBilling(value);
                                    }
                                }}
                                className="upg-tabsRoot"
                            >
                                <Tabs.List
                                    aria-label="Billing interval"
                                    className="upg-billingTabs"
                                >
                                    <Tabs.Tab
                                        value="monthly"
                                        className={`upg-tab ${billing === "monthly" ? "is-active" : ""}`}
                                    >
                                        Monthly
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        value="quarterly"
                                        className={`upg-tab ${billing === "quarterly" ? "is-active" : ""}`}
                                    >
                                        Quarterly
                                    </Tabs.Tab>
                                    <Tabs.Tab
                                        value="yearly"
                                        className={`upg-tab ${billing === "yearly" ? "is-active" : ""}`}
                                    >
                                        Yearly
                                    </Tabs.Tab>
                                </Tabs.List>
                            </Tabs.Root>

                            <div className="upg-billingNote">{billingNote}</div>
                        </div>
                    </div>

                    <div className="upg-currentInfo">
                        <div className="upg-currentInfoLabel">Your current setup</div>
                        <div className="upg-currentInfoTitle">{normalizePlanLabel(currentPlan)}</div>
                        <p className="upg-currentInfoText">{currentPlanSummary}</p>
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