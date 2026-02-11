// frontend/src/pages/website/Pricing.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import "../../styling/fonts.css";
import "../../styling/pricing.css";

// ✅ Canonical backend base URL
import { BASE_URL } from "../../services/api";

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
    // keep it simple: 2dp, £ sign
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

    // FAQ accordion
    const [openIndex, setOpenIndex] = useState(0);

    const navigate = useNavigate();
    const apiBase = BASE_URL;

    /* =========================
       Pricing rules (your exact spec)
       ========================= */
    const PRICES = useMemo(() => {
        const plusMonthly = 4.95;
        const plusQuarterlyPerMonth = 4.45; // ✅ effective per month
        const plusYearlyPerMonth = 3.95; // ✅ effective per month

        const addOnPerExtraProfilePerMonth = 1.95; // ✅ teams add-on

        const quarterMonths = 3;
        const yearMonths = 12;

        const plusQuarterTotal = plusQuarterlyPerMonth * quarterMonths; // 13.35
        const plusYearTotal = plusYearlyPerMonth * yearMonths; // 47.40

        return {
            addOnPerExtraProfilePerMonth,
            plus: {
                monthly: { perMonth: plusMonthly, billedLabel: `${fmtGBP(plusMonthly)} / month` },
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

    const plusSavings =
        billing === "monthly" ? "" : savingsLabel(plusMonthly, plusPerMonth);

    const billingNote =
        billing === "monthly"
            ? "Billed monthly. Cancel anytime."
            : billing === "quarterly"
                ? "Billed every 3 months. Cancel anytime."
                : "Best value. Billed yearly.";

    /* =========================
       SEO — Meta upsert + JSON-LD (SPA-safe)
       (NO className changes, NO layout changes)
       NOTE: Canonical set to WWW.
    ========================= */
    useEffect(() => {
        const CANONICAL = "https://www.konarcard.com/pricing";
        const title = "KonarCard Pricing (UK) — Free, Plus & Teams Plans";
        const description =
            "KonarCard pricing for the UK: start free, upgrade to Plus for deeper customisation and analytics, or use Teams for multi-profile businesses. Cancel anytime.";

        const ogImage = "https://www.konarcard.com/og/pricing.png"; // optional (safe if it 404s)

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

        // Core
        document.title = title;
        upsertLink("canonical", CANONICAL);
        upsertMeta("description", description);
        upsertMeta("robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");

        // Open Graph
        upsertMeta("og:type", "website", true);
        upsertMeta("og:site_name", "KonarCard", true);
        upsertMeta("og:title", title, true);
        upsertMeta("og:description", description, true);
        upsertMeta("og:url", CANONICAL, true);
        upsertMeta("og:image", ogImage, true);

        // Twitter
        upsertMeta("twitter:card", "summary_large_image");
        upsertMeta("twitter:title", title);
        upsertMeta("twitter:description", description);
        upsertMeta("twitter:image", ogImage);

        // Pricing / Service JSON-LD (OfferCatalog)
        upsertJsonLd("pricing-offers", {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "KonarCard Pricing",
            url: CANONICAL,
            description,
            isPartOf: {
                "@type": "WebSite",
                name: "KonarCard",
                url: "https://www.konarcard.com",
            },
            mainEntity: {
                "@type": "OfferCatalog",
                name: "KonarCard Plans",
                itemListElement: [
                    {
                        "@type": "Offer",
                        name: "Free (Individual)",
                        priceCurrency: "GBP",
                        price: "0.00",
                        url: CANONICAL,
                        availability: "https://schema.org/InStock",
                    },
                    {
                        "@type": "Offer",
                        name: "Plus",
                        priceCurrency: "GBP",
                        // NOTE: This page supports multiple billing intervals; we describe the headline entry.
                        price: "4.95",
                        url: CANONICAL,
                        availability: "https://schema.org/InStock",
                        category: "subscription",
                    },
                    {
                        "@type": "Offer",
                        name: "Teams",
                        priceCurrency: "GBP",
                        // Teams is Plus base + add-ons; keep it explicit for clarity.
                        price: "4.95",
                        url: CANONICAL,
                        availability: "https://schema.org/InStock",
                        category: "subscription",
                        description: "Plus base plan + £1.95 per extra profile per month.",
                    },
                ],
            },
        });

        // FAQ JSON-LD (keep in sync with pricingFaqs below)
        upsertJsonLd("pricing-faq", {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
                {
                    "@type": "Question",
                    name: "Do I need to pay upfront?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "No. Start on Free, then upgrade when it’s worth it. Paid plans bill on your chosen interval.",
                    },
                },
                {
                    "@type": "Question",
                    name: "Can I cancel anytime?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes. You can cancel or manage billing anytime from the Billing portal.",
                    },
                },
                {
                    "@type": "Question",
                    name: "How does Teams pricing work?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Teams uses the Plus plan as your base, then you add extra profiles for staff at £1.95 per extra profile per month.",
                    },
                },
                {
                    "@type": "Question",
                    name: "What happens if my plan ends?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "You’ll stay on Free. Your link remains live — paid features simply pause until you re-subscribe.",
                    },
                },
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

    const hasFutureAccess =
        !!currentPeriodEnd && !Number.isNaN(currentPeriodEnd.getTime()) && currentPeriodEnd.getTime() > Date.now();

    const activeUntilLabel = hasFutureAccess ? formatDate(currentPeriodEnd) : "";

    const planStatusLine = useMemo(() => {
        if (!isLoggedIn()) return "";
        if (!subState) return "";
        if (currentPlan === "free" && !isActive) return "You’re on the Free plan.";
        if (hasFutureAccess) return `Active until ${activeUntilLabel}`;
        if (isActive) return "Active";
        return "Inactive";
    }, [subState, currentPlan, isActive, hasFutureAccess, activeUntilLabel]);

    /* ---------------- Helpers: intent storage ---------------- */
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

    /* ---------------- Stripe subscription: start checkout ---------------- */
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
                return { type: "link", label: "Get started free", to: "/register", disabled: false, helper: "" };
            }
            return {
                type: "button",
                label: `Continue to ${planName === "plus" ? "Plus" : "Teams"}`,
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

            if (current === "free") {
                return { type: "button", label: "Current plan", onClick: null, disabled: true, helper: "" };
            }

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
            return {
                type: "button",
                label: "Upgrade (Billing)",
                onClick: openBillingPortal,
                disabled: !!loadingKey || subLoading,
                helper: "",
            };
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
       Card data
       ========================= */
    const planCards = useMemo(() => {
        const plusKey = `plus-${billing}`;
        // teams checkout still uses teams-{interval} key,
        // but UI reflects real pricing model (Plus + add-ons)
        const teamsKey = `teams-${billing}`;

        const teamsExample3Profiles = plusPerMonth + (PRICES.addOnPerExtraProfilePerMonth * 2);

        return [
            {
                key: "free",
                title: "Individual",
                tag: "Best for starting out",
                featured: false,
                price: "£0",
                sub: "No monthly cost",
                priceMeta: [],
                highlights: [
                    "Claim your unique KonarCard link",
                    "Basic profile & contact buttons",
                    "QR code sharing",
                    "Works on iPhone & Android",
                    "Unlimited link updates",
                    "Share by tap or scan",
                ],
                button: getPlanButton("free"),
            },
            {
                key: "plus",
                title: "Plus",
                tag: "Most popular",
                featured: true,
                price: fmtGBP(plusPerMonth),
                sub: "per month",
                priceMeta: [
                    billing === "monthly" ? "Cancel anytime." : `Billed ${plusBilledLabel}.`,
                    plusSavings ? plusSavings : null,
                ].filter(Boolean),
                highlights: [
                    "Full profile customisation",
                    "Services & pricing sections",
                    "Photo gallery",
                    "Reviews & ratings",
                    "Unlimited edits",
                    "Remove KonarCard branding",
                ],
                button: getPlanButton("plus", plusKey),
            },
            {
                key: "teams",
                title: "Teams",
                tag: "For small teams",
                featured: false,
                // ✅ Teams is Plus + add-ons
                price: fmtGBP(plusPerMonth),
                sub: "per month + add-ons",
                priceMeta: [
                    `£${PRICES.addOnPerExtraProfilePerMonth.toFixed(2)} / extra profile / month`,
                    billing === "monthly" ? "Billed monthly." : `Base billed ${plusBilledLabel}.`,
                    `Example: 3 profiles = ${fmtGBP(teamsExample3Profiles)} / month`,
                ],
                highlights: [
                    "Everything in Plus",
                    "Add extra staff profiles when you need them",
                    "Centralised branding & controls",
                    "Role & staff management (placeholder)",
                    "Priority support (placeholder)",
                    "Company access settings (placeholder)",
                ],
                button: getPlanButton("teams", teamsKey),
            },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billing, plusPerMonth, plusBilledLabel, plusSavings, currentPlan, isActive, hasFutureAccess, activeUntilLabel, loadingKey, subLoading, PRICES]);

    /* =========================
       Compare (cleaner + more modern)
       ========================= */
    const compareSections = useMemo(
        () => [
            {
                title: "Core",
                rows: [
                    { label: "Your KonarCard link + QR code", hint: "Share by tap or scan", free: true, plus: true, teams: true },
                    { label: "Profile customisation", hint: "Edit anytime", free: true, plus: true, teams: true },
                    { label: "Works on every phone", hint: "iPhone + Android", free: true, plus: true, teams: true },
                ],
            },
            {
                title: "Brand & content",
                rows: [
                    { label: "Templates", hint: "Design layouts (icons placeholder)", free: "1", plus: "5", teams: "5" },
                    { label: "Remove KonarCard branding", free: false, plus: true, teams: true },
                    { label: "Photo gallery", hint: "Work photos", free: "Up to 6", plus: "Up to 12", teams: "Up to 12" },
                    { label: "Services & pricing", free: "Up to 6", plus: "Up to 12", teams: "Up to 12" },
                    { label: "Reviews", free: "Up to 6", plus: "Up to 12", teams: "Up to 12" },
                ],
            },
            {
                title: "Analytics",
                rows: [{ label: "Analytics depth", free: "Basic", plus: "Deep", teams: "Deep" }],
            },
            {
                title: "Teams",
                rows: [
                    { label: "Extra staff profiles", hint: "Add profiles as your team grows", free: false, plus: false, teams: true },
                    { label: "Extra profile add-on", hint: "Per extra profile, per month", free: "—", plus: "—", teams: "£1.95" },
                ],
            },
        ],
        []
    );

    const pricingFaqs = useMemo(
        () => [
            { q: "Do I need to pay upfront?", a: "No. Start on Free, then upgrade when it’s worth it. Paid plans bill on your chosen interval." },
            { q: "Can I cancel anytime?", a: "Yes. You can cancel or manage billing anytime from the Billing portal." },
            { q: "How does Teams pricing work?", a: "Teams uses the Plus plan as your base, then you add extra profiles for staff at £1.95 per extra profile per month." },
            { q: "What happens if my plan ends?", a: "You’ll stay on Free. Your link remains live — paid features simply pause until you re-subscribe." },
        ],
        []
    );

    return (
        <>
            <Navbar />

            <main className="pr-page kc-page">
                {/* HERO */}
                <section className="pr-hero">
                    <div className="pr-container pr-hero__inner">
                        <p className="pr-kicker">Start free • Upgrade when it’s worth it</p>

                        <h1 className="h2 pr-title">
                            Plans & pricing built <br />
                            for real trades
                        </h1>

                        <p className="body-s pr-sub">Clean plans. Clear value. Cancel anytime — no stress.</p>

                        {isLoggedIn() && (
                            <div className="pr-status">
                                {subLoading ? (
                                    <span className="pr-status__muted">Checking your plan…</span>
                                ) : subErr ? (
                                    <span className="pr-status__err">{subErr}</span>
                                ) : (
                                    <span className="pr-status__muted">{planStatusLine}</span>
                                )}
                            </div>
                        )}

                        <div className="pr-billing">
                            <div className="pr-billing__tabs" role="tablist" aria-label="Billing interval">
                                {["monthly", "quarterly", "yearly"].map((v) => (
                                    <button
                                        key={v}
                                        type="button"
                                        className={`pr-pill ${billing === v ? "is-active" : ""}`}
                                        onClick={() => setBilling(v)}
                                        role="tab"
                                        aria-selected={billing === v}
                                    >
                                        {v.charAt(0).toUpperCase() + v.slice(1)}
                                    </button>
                                ))}
                            </div>

                            <div className="body-s pr-note">{billingNote}</div>
                        </div>
                    </div>
                </section>

                {/* PLAN CARDS */}
                <section className="pr-plans">
                    <div className="pr-container">
                        <div className="pr-plans__grid">
                            {planCards.map((card) => {
                                const btn = card.button;
                                const isFeatured = card.featured;

                                return (
                                    <article key={card.key} className={`pr-card ${isFeatured ? "is-featured" : ""}`}>
                                        <div className="pr-card__topRow">
                                            <h3 className="h5 pr-card__title">{card.title}</h3>
                                            <div className={`pr-card__pill ${isFeatured ? "is-featured" : ""}`}>{card.tag}</div>
                                        </div>

                                        <div className="pr-card__priceRow">
                                            <div className="pr-card__price">{card.price}</div>
                                            <div className="body-s pr-card__priceSub">{card.sub}</div>

                                            {card.priceMeta?.length ? (
                                                <div className="pr-priceMeta">
                                                    {card.priceMeta.map((m) => (
                                                        <div key={m} className="pr-priceMeta__line">
                                                            {m.includes("Save") ? <span className="pr-saveBadge">{m}</span> : m}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="pr-card__divider" aria-hidden="true" />
                                        <div className="pr-card__included">What’s included</div>

                                        <ul className="pr-card__list">
                                            {card.highlights.map((h) => (
                                                <li key={h}>
                                                    <span className="pr-check" aria-hidden="true">✓</span>
                                                    <span className="body-s pr-liText">{h}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="pr-card__actions">
                                            {btn.type === "link" ? (
                                                <Link to={btn.to} className={`pr-btn ${isFeatured ? "is-primary" : "is-ghost"}`}>
                                                    {btn.label}
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className={`pr-btn ${isFeatured ? "is-primary" : "is-ghost"}`}
                                                    onClick={btn.onClick || undefined}
                                                    disabled={!!btn.disabled}
                                                    aria-disabled={!!btn.disabled}
                                                >
                                                    {loadingKey ? "Redirecting…" : btn.label}
                                                </button>
                                            )}

                                            {btn.helper ? <div className="body-s pr-helper">{btn.helper}</div> : null}

                                            {isLoggedIn() && card.key !== "free" && currentPlan !== "free" ? (
                                                <button type="button" className="pr-linkBtn" onClick={openBillingPortal}>
                                                    Manage plan in Billing
                                                </button>
                                            ) : null}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* COMPARE */}
                <section className="pr-compare">
                    <div className="pr-container">
                        <div className="pr-sectionHead">
                            <h2 className="h3 pr-h2">Compare plans</h2>
                            <p className="body-s pr-sectionSub">Clear differences — no fluff. Pick what matches how you work.</p>
                        </div>

                        <div className="pr-compareWrap" role="region" aria-label="Plan comparison">
                            <div className="pr-compareHeader" aria-hidden="true">
                                <div className="pr-compareHeader__left">Feature</div>

                                <div className="pr-compareHeader__plan">
                                    <div className="pr-compareHeader__name">Free</div>
                                    <div className="pr-compareHeader__sub">£0</div>
                                </div>

                                <div className="pr-compareHeader__plan pr-compareHeader__plan--plus">
                                    <div className="pr-compareHeader__name">Plus</div>
                                    <div className="pr-compareHeader__sub">
                                        {billing === "monthly"
                                            ? "£4.95/mo"
                                            : billing === "quarterly"
                                                ? "£4.45/mo • £13.35/qtr"
                                                : "£3.95/mo • £47.40/yr"}
                                    </div>
                                </div>

                                <div className="pr-compareHeader__plan">
                                    <div className="pr-compareHeader__name">Teams</div>
                                    <div className="pr-compareHeader__sub">Plus + £1.95/profile/mo</div>
                                </div>
                            </div>

                            <div className="pr-compareBody">
                                {compareSections.map((sec) => (
                                    <div className="pr-compareSection" key={sec.title}>
                                        <div className="pr-compareSection__title">{sec.title}</div>

                                        <div className="pr-compareGrid" role="table" aria-label={`${sec.title} comparison`}>
                                            {sec.rows.map((r) => (
                                                <div className="pr-compareRow" role="row" key={r.label}>
                                                    <div className="pr-compareCell pr-compareCell--feature" role="cell">
                                                        <div className="pr-compareFeat">
                                                            <div className="pr-compareFeat__label">
                                                                {/* icon placeholder (we swap later) */}
                                                                <span className="pr-iconPh" aria-hidden="true" />
                                                                {r.label}
                                                            </div>
                                                            {r.hint ? <div className="pr-compareFeat__hint">{r.hint}</div> : null}
                                                        </div>
                                                    </div>

                                                    <div className="pr-compareCell pr-compareCell--center" role="cell">
                                                        <CompareValue v={r.free} />
                                                    </div>

                                                    <div className="pr-compareCell pr-compareCell--center pr-compareCell--plus" role="cell">
                                                        <CompareValue v={r.plus} />
                                                    </div>

                                                    <div className="pr-compareCell pr-compareCell--center" role="cell">
                                                        <CompareValue v={r.teams} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pr-compareCtas">
                            <Link to="/register" className="pr-btn is-primary pr-btn--inline">
                                Start free
                            </Link>
                            <Link to="/products" className="pr-btn is-ghost pr-btn--inline">
                                Shop cards
                            </Link>
                        </div>
                    </div>
                </section>

                {/* WHO */}
                <section className="pr-who">
                    <div className="pr-container">
                        <div className="pr-sectionHead">
                            <h2 className="h3 pr-h2">Who each plan is for</h2>
                            <p className="body-s pr-sectionSub">Pick the plan that fits your day-to-day.</p>
                        </div>

                        <div className="pr-3col">
                            <div className="pr-miniCard">
                                <div className="pr-miniCard__top">
                                    <div className="pr-miniCard__title">Free</div>
                                    <div className="pr-miniCard__pill">Trying it out</div>
                                </div>
                                <p className="body-s pr-miniCard__p">Perfect if you just want your link, contact buttons, and a clean profile.</p>
                            </div>

                            <div className="pr-miniCard is-accent">
                                <div className="pr-miniCard__top">
                                    <div className="pr-miniCard__title">Plus</div>
                                    <div className="pr-miniCard__pill">Solo trades</div>
                                </div>
                                <p className="body-s pr-miniCard__p">Best for trades who want higher limits, better presentation, and deeper analytics.</p>
                            </div>

                            <div className="pr-miniCard">
                                <div className="pr-miniCard__top">
                                    <div className="pr-miniCard__title">Teams</div>
                                    <div className="pr-miniCard__pill">Growing business</div>
                                </div>
                                <p className="body-s pr-miniCard__p">For teams — start with Plus, then add extra staff profiles as you grow.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="pr-faq">
                    <div className="pr-container">
                        <div className="pr-sectionHead">
                            <h2 className="h3 pr-h2">Pricing FAQs</h2>
                            <p className="body-s pr-sectionSub">Quick answers before you commit.</p>
                        </div>

                        <div className="pr-faqList" role="region" aria-label="Pricing FAQs">
                            {pricingFaqs.map((item, idx) => {
                                const isOpen = idx === openIndex;
                                return (
                                    <div className="pr-faqItem" key={`${item.q}-${idx}`}>
                                        <button
                                            type="button"
                                            className="pr-qRow"
                                            onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                                            aria-expanded={isOpen}
                                        >
                                            <span className="h6 pr-q">{item.q}</span>
                                            <span className={`pr-chev ${isOpen ? "is-open" : ""}`} aria-hidden="true">
                                                ▾
                                            </span>
                                        </button>

                                        {isOpen && <div className="body-s pr-a">{item.a}</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}

function CompareValue({ v }) {
    const isBool = typeof v === "boolean";
    if (isBool) {
        return v ? <span className="pr-cv pr-cv--yes">✓</span> : <span className="pr-cv pr-cv--no">—</span>;
    }
    const s = String(v ?? "—");
    if (!s || s === "—") return <span className="pr-cv pr-cv--no">—</span>;
    return <span className="pr-cv pr-cv--text">{s}</span>;
}
