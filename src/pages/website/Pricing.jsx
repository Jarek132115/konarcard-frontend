// frontend/src/pages/website/Pricing.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import "../../styling/fonts.css";
import "../../styling/pricing.css";          // page/hero layout (now matches examples)
import "../../styling/home/pricing.css";     // card system

/* ✅ Reuse CustomerTrust system (used by Who section) */
import "../../styling/home/customertrust.css";

/* ✅ Reuse Products FAQ styling if needed elsewhere */
import "../../styling/productspage/productspagefaq.css";

import { BASE_URL } from "../../services/api";

// ✅ plan icons (for the 3 cards)
import FreePlanIcon from "../../assets/icons/FreePlan.svg";
import PlusPlanIcon from "../../assets/icons/PlusPlan.svg";
import TeamsPlanIcon from "../../assets/icons/TeamsPlan.svg";

/* ✅ Page components */
import PricingPageHero from "./pricingpage/PricingPageHero";
import PricingPageWho from "./pricingpage/PricingPageWho";
import PricingPageCompare from "./pricingpage/PricingPageCompare";
import PricingPageFAQ from "./pricingpage/PricingPageFAQ";

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

export default function Pricing() {
    const [billing, setBilling] = useState("monthly"); // monthly | quarterly | yearly
    const [loadingKey, setLoadingKey] = useState(null);

    const [subLoading, setSubLoading] = useState(false);
    const [subErr, setSubErr] = useState("");
    const [subState, setSubState] = useState(null);

    const navigate = useNavigate();
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

    /* =========================
       SEO — Meta upsert + JSON-LD (SPA-safe)
    ========================= */
    useEffect(() => {
        const CANONICAL = "https://www.konarcard.com/pricing";
        const title = "KonarCard Pricing — Free, Plus & Teams (UK)";
        const description =
            "Start free with your KonarCard link. Upgrade to Plus for more customisation, content and analytics, or use Teams to manage multiple profiles. Cancel anytime.";
        const ogImage = "https://www.konarcard.com/og/pricing.png";

        const upsertMeta = (nameOrProp, content, isProperty = false) => {
            if (!content) return;
            const selector = isProperty ? `meta[property="${nameOrProp}"]` : `meta[name="${nameOrProp}"]`;
            let el = document.head.querySelector(selector);
            if (!el) {
                el = document.createElement("meta");
                if (isProperty) el.setAttribute("property", nameOrProp);
                else el.setAttribute("name", nameOrProp);
                document.head.appendChild(el);
            }
            el.setAttribute("content", content);
        };

        const upsertLink = (rel, href) => {
            if (!href) return;
            let el = document.head.querySelector(`link[rel="${rel}"]`);
            if (!el) {
                el = document.createElement("link");
                el.setAttribute("rel", rel);
                document.head.appendChild(el);
            }
            el.setAttribute("href", href);
        };

        const upsertJsonLd = (id, json) => {
            const scriptId = `jsonld-${id}`;
            let el = document.getElementById(scriptId);
            if (!el) {
                el = document.createElement("script");
                el.type = "application/ld+json";
                el.id = scriptId;
                document.head.appendChild(el);
            }
            el.text = JSON.stringify(json);
        };

        document.title = title;
        upsertLink("canonical", CANONICAL);

        upsertMeta("description", description);
        upsertMeta("robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");

        upsertMeta("og:type", "website", true);
        upsertMeta("og:site_name", "KonarCard", true);
        upsertMeta("og:title", title, true);
        upsertMeta("og:description", description, true);
        upsertMeta("og:url", CANONICAL, true);
        upsertMeta("og:image", ogImage, true);

        upsertMeta("twitter:card", "summary_large_image");
        upsertMeta("twitter:title", title);
        upsertMeta("twitter:description", description);
        upsertMeta("twitter:image", ogImage);

        upsertJsonLd("pricing-offers", {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "KonarCard Pricing",
            url: CANONICAL,
            description,
            isPartOf: { "@type": "WebSite", name: "KonarCard", url: "https://www.konarcard.com" },
            mainEntity: {
                "@type": "OfferCatalog",
                name: "KonarCard Plans",
                itemListElement: [
                    { "@type": "Offer", name: "Free (Individual)", priceCurrency: "GBP", price: "0.00", url: CANONICAL, availability: "https://schema.org/InStock" },
                    { "@type": "Offer", name: "Plus", priceCurrency: "GBP", price: "4.95", url: CANONICAL, availability: "https://schema.org/InStock", category: "subscription" },
                    {
                        "@type": "Offer",
                        name: "Teams",
                        priceCurrency: "GBP",
                        price: "4.95",
                        url: CANONICAL,
                        availability: "https://schema.org/InStock",
                        category: "subscription",
                        description: "Plus base plan + £1.95 per extra profile per month.",
                    },
                ],
            },
        });

        upsertJsonLd("pricing-faq", {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
                { "@type": "Question", name: "Do I need to pay upfront?", acceptedAnswer: { "@type": "Answer", text: "No. Start on Free, then upgrade when it’s worth it. Paid plans bill on your chosen interval." } },
                { "@type": "Question", name: "Can I cancel anytime?", acceptedAnswer: { "@type": "Answer", text: "Yes. You can cancel or manage billing anytime from the Billing portal." } },
                { "@type": "Question", name: "How does Teams pricing work?", acceptedAnswer: { "@type": "Answer", text: "Teams uses the Plus plan as your base, then you add extra profiles for staff at £1.95 per extra profile per month." } },
                { "@type": "Question", name: "What happens if my plan ends?", acceptedAnswer: { "@type": "Answer", text: "You’ll stay on Free. Your link remains live — paid features simply pause until you re-subscribe." } },
            ],
        });
    }, []);

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

    const hasFutureAccess = !!currentPeriodEnd && !Number.isNaN(currentPeriodEnd.getTime()) && currentPeriodEnd.getTime() > Date.now();
    const activeUntilLabel = hasFutureAccess ? formatDate(currentPeriodEnd) : "";

    const planStatusLine = useMemo(() => {
        if (!isLoggedIn()) return "";
        if (!subState) return "";
        if (currentPlan === "free" && !isActive) return "You’re on the Free plan.";
        if (hasFutureAccess) return `Active until ${activeUntilLabel}`;
        if (isActive) return "Active";
        return "Inactive";
    }, [subState, currentPlan, isActive, hasFutureAccess, activeUntilLabel]);

    /* ---------------- Intent storage ---------------- */
    const saveCheckoutIntent = (planKey) => {
        try {
            const returnUrl = `${window.location.origin}/myprofile?subscribed=1`;
            const intent = {
                planKey,
                createdAt: Date.now(),
                returnUrl,
                successReturn: returnUrl,
                cancelReturn: `${window.location.origin}/pricing`,
            };
            localStorage.setItem(CHECKOUT_INTENT_KEY, JSON.stringify(intent));
        } catch { }
    };

    /* ---------------- Stripe: start checkout ---------------- */
    const startSubscription = async (planKey) => {
        if (!isLoggedIn()) {
            saveCheckoutIntent(planKey);
            navigate("/login");
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
                navigate("/login", { replace: true });
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
            navigate("/login");
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
                navigate("/login", { replace: true });
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
            return { type: "button", label: hasFutureAccess ? `Active until ${activeUntilLabel}` : "Active", onClick: null, disabled: true, helper: "" };
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
            return { type: "button", label: "Downgrade (Billing)", onClick: openBillingPortal, disabled: !!loadingKey || subLoading, helper: hasFutureAccess ? `Current plan active until ${activeUntilLabel}` : "" };
        }

        if (isUpgrade && current !== "free" && stillHasPaidAccess) {
            return { type: "button", label: "Upgrade (Billing)", onClick: openBillingPortal, disabled: !!loadingKey || subLoading, helper: "" };
        }

        return { type: "button", label: isUpgrade ? "Upgrade" : "Choose plan", onClick: () => startSubscription(planKeyForPaid), disabled: !!loadingKey || subLoading, helper: "" };
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
        <>
            <Navbar />

            <main className="pr-page kc-page">
                {/* ✅ HERO */}
                <PricingPageHero
                    billing={billing}
                    setBilling={setBilling}
                    billingNote={billingNote}

                    plusPerMonth={plusPerMonth}
                    plusBilledLabel={plusBilledLabel}
                    plusSavings={plusSavings}
                    addOnPerExtraProfilePerMonth={PRICES.addOnPerExtraProfilePerMonth}

                    isLoggedIn={isLoggedIn()}
                    subLoading={subLoading}
                    subErr={subErr}
                    planStatusLine={planStatusLine}

                    currentPlan={currentPlan}
                    isActive={isActive}
                    hasFutureAccess={hasFutureAccess}
                    activeUntilLabel={activeUntilLabel}

                    loadingKey={loadingKey}
                    startSubscription={startSubscription}
                    openBillingPortal={openBillingPortal}
                />

                {/* ✅ WHO (with real images) */}
                <PricingPageWho />

                {/* ✅ COMPARE (styled) */}
                <PricingPageCompare billing={billing} />

                <div className="pr-compareCtas">
                    <Link to="/claimyourlink" className="kx-btn kx-btn--black">
                        Claim Your Link
                    </Link>
                    <button type="button" className="kx-btn kx-btn--white" onClick={openBillingPortal}>
                        Manage Billing
                    </button>
                </div>

                {/* ✅ FAQ */}
                <PricingPageFAQ />
            </main>

            <Footer />
        </>
    );
}