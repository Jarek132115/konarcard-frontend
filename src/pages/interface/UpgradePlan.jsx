// frontend/src/pages/interface/UpgradePlan.jsx
import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";

import "../../styling/fonts.css";

/* ✅ Dashboard-scoped layout */
import "../../styling/dashboard/upgradeplan.css";

/* ✅ Reuse the card system you already perfected */
import "../../styling/home/pricing.css";

import { BASE_URL } from "../../services/api";

/* ✅ plan icons (same ones used on website pricing) */
import FreePlanIcon from "../../assets/icons/FreePlan.svg";
import PlusPlanIcon from "../../assets/icons/PlusPlan.svg";
import TeamsPlanIcon from "../../assets/icons/TeamsPlan.svg";

const CHECKOUT_INTENT_KEY = "konar_checkout_intent_v1";

/* =========================
   Helpers (auth + jwt)
   ========================= */
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
    } catch { }
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
    return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function planRank(plan) {
    if (plan === "teams") return 2;
    if (plan === "plus") return 1;
    return 0;
}

/* =========================
   Money helpers
   ========================= */
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

export default function UpgradePlan() {
    const [billing, setBilling] = useState("monthly"); // monthly | quarterly | yearly
    const [loadingKey, setLoadingKey] = useState(null);

    const [subLoading, setSubLoading] = useState(false);
    const [subErr, setSubErr] = useState("");
    const [subState, setSubState] = useState(null);

    const apiBase = BASE_URL;

    /* =========================
       Pricing rules (your exact spec)
       ========================= */
    const PRICES = useMemo(() => {
        const plusMonthly = 4.95;
        const plusQuarterlyPerMonth = 4.45;
        const plusYearlyPerMonth = 3.95;

        const addOnPerExtraProfilePerMonth = 1.95;

        const quarterMonths = 3;
        const yearMonths = 12;

        const plusQuarterTotal = plusQuarterlyPerMonth * quarterMonths; // 13.35
        const plusYearTotal = plusYearlyPerMonth * yearMonths; // 47.40

        return {
            addOnPerExtraProfilePerMonth,
            plus: {
                monthly: { perMonth: plusMonthly, billedLabel: `${fmtGBP(plusMonthly)} / month` },
                quarterly: { perMonth: plusQuarterlyPerMonth, billedTotal: plusQuarterTotal, billedLabel: `${fmtGBP(plusQuarterTotal)} / quarter` },
                yearly: { perMonth: plusYearlyPerMonth, billedTotal: plusYearTotal, billedLabel: `${fmtGBP(plusYearTotal)} / year` },
            },
            free: {
                monthly: { perMonth: 0, billedLabel: "£0" },
                quarterly: { perMonth: 0, billedLabel: "£0" },
                yearly: { perMonth: 0, billedLabel: "£0" },
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

    /* ---------------- Subscription status ---------------- */
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
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

                if (!res.ok) throw new Error(data?.error || "Failed to load subscription status");

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
    const currentPeriodEnd = subState?.currentPeriodEnd ? new Date(subState.currentPeriodEnd) : null;

    const hasFutureAccess =
        !!currentPeriodEnd &&
        !Number.isNaN(currentPeriodEnd.getTime()) &&
        currentPeriodEnd.getTime() > Date.now();

    const activeUntilLabel = hasFutureAccess ? formatDate(currentPeriodEnd) : "";

    const planStatusLine = useMemo(() => {
        if (!isLoggedIn()) return "";
        if (!subState) return "";
        if (currentPlan === "free" && !isActive) return "You’re on the Free plan.";
        if (hasFutureAccess) return `Active until ${activeUntilLabel}`;
        if (isActive) return "Active";
        return "Inactive";
    }, [subState, currentPlan, isActive, hasFutureAccess, activeUntilLabel]);

    /* ---------------- Stripe intent storage ---------------- */
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
        } catch { }
    };

    /* ---------------- Stripe: start checkout ---------------- */
    const startSubscription = async (planKey) => {
        if (!isLoggedIn()) {
            saveCheckoutIntent(planKey);
            window.location.href = "/login";
            return;
        }

        if (isActive && currentPlan === planKey.split("-")[0]) {
            alert("You’re already subscribed to this plan.");
            return;
        }

        setLoadingKey(planKey);

        try {
            const token = safeGetToken();
            const returnUrl = `${window.location.origin}/myprofile?subscribed=1`;

            const res = await fetch(`${apiBase}/api/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                credentials: "include",
                body: JSON.stringify({ planKey, returnUrl }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 401 || res.status === 404 || /user not found/i.test(String(data?.error || ""))) {
                clearLocalAuth();
                alert("Your session is no longer valid. Please log in again.");
                window.location.href = "/login";
                return;
            }

            if (!res.ok || data?.error) throw new Error(data?.error || "Failed to start checkout");
            if (!data?.url) throw new Error("Stripe session URL missing");

            try {
                localStorage.removeItem(CHECKOUT_INTENT_KEY);
            } catch { }

            window.location.href = data.url;
        } catch (err) {
            alert(err?.message || "Subscription failed");
        } finally {
            setLoadingKey(null);
        }
    };

    /* ---------------- Billing portal ---------------- */
    const openBillingPortal = async () => {
        if (!isLoggedIn()) {
            window.location.href = "/login";
            return;
        }

        try {
            const token = safeGetToken();

            const res = await fetch(`${apiBase}/api/billing-portal`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                credentials: "include",
                body: JSON.stringify({}),
            });

            const data = await res.json().catch(() => ({}));

            if (res.status === 401 || res.status === 404) {
                clearLocalAuth();
                window.location.href = "/login";
                return;
            }

            if (!res.ok || data?.error) throw new Error(data?.error || "Could not open billing portal");
            if (!data?.url) throw new Error("Billing portal URL missing");

            window.location.href = data.url;
        } catch (e) {
            alert(e?.message || "Billing portal is not available yet.");
        }
    };

    /* ---------------- Button logic per plan ---------------- */
    const getPlanButton = (planName, planKeyForPaid) => {
        const logged = isLoggedIn();

        if (!logged) {
            if (planName === "free") {
                return { type: "link", label: "Start Free", to: "/register", disabled: false, helper: "" };
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
                label: hasFutureAccess ? `Active until ${activeUntilLabel}` : "Active",
                onClick: null,
                disabled: true,
                helper: "",
            };
        }

        if (planName === "free") {
            if (stillHasPaidAccess) {
                return {
                    type: "button",
                    label: "Switch to Free",
                    onClick: openBillingPortal,
                    disabled: !!loadingKey || subLoading,
                    helper: hasFutureAccess ? `Paid plan stays active until ${activeUntilLabel}` : "Manage downgrade in Billing",
                };
            }
            if (current === "free") return { type: "button", label: "Current plan", onClick: null, disabled: true, helper: "" };
            return { type: "button", label: "Choose Free", onClick: openBillingPortal, disabled: false, helper: "" };
        }

        const targetPlan = planName;
        const isUpgrade = planRank(targetPlan) > planRank(current);
        const isDowngrade = planRank(targetPlan) < planRank(current);

        if (isDowngrade) {
            return {
                type: "button",
                label: "Downgrade (Billing)",
                onClick: openBillingPortal,
                disabled: !!loadingKey || subLoading,
                helper: hasFutureAccess ? `Current plan active until ${activeUntilLabel}` : "",
            };
        }

        if (isUpgrade && current !== "free" && stillHasPaidAccess) {
            return { type: "button", label: "Upgrade (Billing)", onClick: openBillingPortal, disabled: !!loadingKey || subLoading, helper: "" };
        }

        return {
            type: "button",
            label: isUpgrade ? "Upgrade" : "Choose plan",
            onClick: () => startSubscription(planKeyForPaid),
            disabled: !!loadingKey || subLoading,
            helper: "",
        };
    };

    /* =========================
       Plans cards (Home system)
       ========================= */
    const planCards = useMemo(() => {
        const plusKey = `plus-${billing}`;
        const teamsKey = `teams-${billing}`;

        const teamsExample3Profiles = plusPerMonth + PRICES.addOnPerExtraProfilePerMonth * 2;

        return [
            {
                key: "free",
                title: "Individual",
                icon: FreePlanIcon,
                tag: "Best for starting out",
                featured: false,
                price: "£0",
                cadence: "No monthly fees",
                meta: [],
                highlights: ["Your KonarCard link", "Contact buttons", "QR sharing", "Works on any phone", "Unlimited updates", "Tap or scan share"],
                button: getPlanButton("free"),
            },
            {
                key: "plus",
                title: "Plus",
                icon: PlusPlanIcon,
                tag: "Most popular",
                featured: true,
                price: fmtGBP(plusPerMonth),
                cadence: "per month",
                meta: [
                    billing === "monthly" ? "Cancel anytime. No contracts." : `Billed ${plusBilledLabel}. Cancel anytime.`,
                    plusSavings ? plusSavings : null,
                ].filter(Boolean),
                highlights: ["Full customisation", "More photos", "Services & pricing", "Reviews & ratings", "Unlimited edits", "Remove branding", "Deeper analytics"],
                button: getPlanButton("plus", plusKey),
            },
            {
                key: "teams",
                title: "Teams",
                icon: TeamsPlanIcon,
                tag: "For small teams",
                featured: false,
                price: fmtGBP(plusPerMonth),
                cadence: "+ £1.95 per extra profile",
                meta: [
                    billing === "monthly" ? "Billed monthly. Cancel anytime." : `Base billed ${plusBilledLabel}.`,
                    `Example: 3 profiles = ${fmtGBP(teamsExample3Profiles)} / month`,
                ],
                highlights: ["Everything in Plus", "Add staff profiles", "Centralised controls", "Shared branding", "Team analytics", "Manage in one place"],
                button: getPlanButton("teams", teamsKey),
            },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billing, plusPerMonth, plusBilledLabel, plusSavings, currentPlan, isActive, hasFutureAccess, activeUntilLabel, loadingKey, subLoading, PRICES]);

    return (
        <DashboardLayout hideDesktopHeader>
            <div className="upg-shell">
                <PageHeader
                    title="Upgrade Plan"
                    subtitle="Upgrade, manage billing, and change plans without leaving your dashboard."
                />

                <section className="upg-hero">
                    <div className="upg-heroInner">
                        <div className="upg-heroCopy">
                            <div className="kc-pill upg-pill">Plans & Billing</div>

                            <h1 className="h1 upg-title">
                                Choose the plan that fits your{" "}
                                <span className="upg-accent">business</span>
                            </h1>

                            <p className="kc-subheading upg-sub">
                                Start free, upgrade anytime. Manage billing from here — no need to leave your dashboard.
                            </p>

                            {isLoggedIn() ? (
                                <div className="upg-status">
                                    {subLoading ? (
                                        <div className="upg-statusMuted">Checking your plan…</div>
                                    ) : subErr ? (
                                        <div className="upg-statusErr">{subErr}</div>
                                    ) : planStatusLine ? (
                                        <div className="upg-statusMuted">{planStatusLine}</div>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="upg-status">
                                    <div className="upg-statusMuted">Log in to manage billing and upgrade instantly.</div>
                                </div>
                            )}

                            <div className="upg-billing">
                                <div className="upg-billingTabs" role="tablist" aria-label="Billing interval">
                                    <button
                                        type="button"
                                        className={`upg-tab ${billing === "monthly" ? "is-active" : ""}`}
                                        onClick={() => setBilling("monthly")}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        type="button"
                                        className={`upg-tab ${billing === "quarterly" ? "is-active" : ""}`}
                                        onClick={() => setBilling("quarterly")}
                                    >
                                        Quarterly
                                    </button>
                                    <button
                                        type="button"
                                        className={`upg-tab ${billing === "yearly" ? "is-active" : ""}`}
                                        onClick={() => setBilling("yearly")}
                                    >
                                        Yearly
                                    </button>
                                </div>

                                <div className="upg-note">{billingNote}</div>
                            </div>
                        </div>

                        {/* ✅ Plans grid using existing card system */}
                        <div className="kpr upg-kpr">
                            <div className="kpr__container upg-kprContainer">
                                <div className="kpr__grid upg-grid">
                                    {planCards.map((p) => {
                                        const featured = !!p.featured;

                                        return (
                                            <article key={p.key} className={`kpr-card ${featured ? "is-featured" : ""}`}>
                                                <div className="kpr-top">
                                                    <div className={`kpr-tag ${featured ? "is-featured" : ""}`}>{p.tag}</div>

                                                    <div className="kpr-nameRow">
                                                        <span className={`kpr-icon ${featured ? "is-featured" : ""}`}>
                                                            <img src={p.icon} alt="" />
                                                        </span>
                                                        <div className={`kpr-name ${featured ? "is-featured" : ""}`}>{p.title}</div>
                                                    </div>

                                                    <div className="kpr-priceRow">
                                                        <div className={`kpr-price ${featured ? "is-featured" : ""}`}>{p.price}</div>
                                                        <div className={`kpr-cadence ${featured ? "is-featured" : ""}`}>{p.cadence}</div>
                                                    </div>

                                                    {p.meta?.length ? (
                                                        <div className={`kpr-meta ${featured ? "is-featured" : ""}`}>
                                                            {p.meta.map((m, i) => (
                                                                <div key={i}>{m}</div>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                </div>

                                                <div className={`kpr-divider ${featured ? "is-featured" : ""}`} />

                                                <div className="kpr-body">
                                                    <div className="kpr-content">
                                                        <div className={`kpr-included ${featured ? "is-featured" : ""}`}>What’s included</div>
                                                        <ul className="kpr-list">
                                                            {p.highlights.map((h, i) => (
                                                                <li key={i} className="kpr-li">
                                                                    <span className={`kpr-liText ${featured ? "is-featured" : ""}`}>{h}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="kpr-actions">
                                                        {p.button.type === "link" ? (
                                                            <a className={`kx-btn ${featured ? "kpr-btn--featured" : "kx-btn--black"} kpr-btn`} href={p.button.to}>
                                                                {p.button.label}
                                                            </a>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className={`kx-btn ${featured ? "kpr-btn--featured" : "kx-btn--black"} kpr-btn`}
                                                                onClick={p.button.onClick || undefined}
                                                                disabled={!!p.button.disabled}
                                                            >
                                                                {loadingKey ? "Working…" : p.button.label}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {p.button.helper ? <div className={`upg-helper ${featured ? "is-featured" : ""}`}>{p.button.helper}</div> : null}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>

                                <div className="upg-portalRow">
                                    <button type="button" className="kx-btn kx-btn--white upg-portalBtn" onClick={openBillingPortal}>
                                        Open Billing Portal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}