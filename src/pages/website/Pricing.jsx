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

export default function Pricing() {
    const [billing, setBilling] = useState("monthly"); // monthly | quarterly | yearly
    const [loadingKey, setLoadingKey] = useState(null);
    const [subLoading, setSubLoading] = useState(false);
    const [subErr, setSubErr] = useState("");
    const [subState, setSubState] = useState(null);

    // ✅ FAQ accordion state (same as FAQ/Contact)
    const [openIndex, setOpenIndex] = useState(0);

    const navigate = useNavigate();
    const apiBase = BASE_URL;

    const prices = useMemo(
        () => ({
            monthly: {
                free: { price: "£0", sub: "No monthly cost" },
                plus: { price: "£4.95", sub: "per month" },
                teams: { price: "£19.95", sub: "per month" },
                note: "Billed monthly. Cancel anytime.",
            },
            quarterly: {
                free: { price: "£0", sub: "No monthly cost" },
                plus: { price: "£13.95", sub: "per quarter" },
                teams: { price: "£54.95", sub: "per quarter" },
                note: "Billed every 3 months. Cancel anytime.",
            },
            yearly: {
                free: { price: "£0", sub: "No yearly cost" },
                plus: { price: "£49.95", sub: "per year" },
                teams: { price: "£189.95", sub: "per year" },
                note: "Best value. Billed yearly.",
            },
        }),
        []
    );

    const p = prices[billing];

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
                helper: "Login required",
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

    const planCards = useMemo(() => {
        const plusKey = `plus-${billing}`;
        const teamsKey = `teams-${billing}`;

        return [
            {
                key: "free",
                title: "Individual",
                price: p.free.price,
                sub: p.free.sub,
                featured: false,
                highlights: ["Claim your unique KonarCard link", "Basic profile & contact buttons", "QR code sharing", "Works on iPhone & Android"],
                button: getPlanButton("free"),
            },
            {
                key: "plus",
                title: "Plus Plan",
                price: p.plus.price,
                sub: p.plus.sub,
                featured: true,
                highlights: ["Full profile customisation", "Services & pricing sections", "Photo gallery", "Reviews & ratings", "Unlimited edits"],
                button: getPlanButton("plus", plusKey),
            },
            {
                key: "teams",
                title: "Teams Plan",
                price: p.teams.price,
                sub: p.teams.sub,
                featured: false,
                highlights: ["Multiple team profiles", "Role & staff management", "Centralised branding", "Built for growing businesses"],
                button: getPlanButton("teams", teamsKey),
            },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [billing, p, currentPlan, isActive, hasFutureAccess, activeUntilLabel, loadingKey, subLoading]);

    const compareRows = useMemo(
        () => [
            { f: "Your KonarCard link", free: true, plus: true, teams: true },
            { f: "Custom branding", free: false, plus: true, teams: true },
            { f: "Services & pricing section", free: false, plus: true, teams: true },
            { f: "Photo gallery", free: false, plus: true, teams: true },
            { f: "Reviews & ratings", free: false, plus: true, teams: true },
            { f: "Multiple profiles", free: false, plus: false, teams: "Up to 10" },
            { f: "Centralised branding", free: false, plus: false, teams: true },
            { f: "Team roles & staff", free: false, plus: false, teams: true },
            { f: "Priority support", free: false, plus: false, teams: true },
        ],
        []
    );

    const pricingFaqs = useMemo(
        () => [
            { q: "Do I need to pay upfront?", a: "No. Start on Free, then upgrade when you’re ready. Paid plans are billed on your chosen interval." },
            { q: "Can I cancel anytime?", a: "Yes. You can manage or cancel your plan anytime via the Billing portal." },
            { q: "Can I upgrade later?", a: "Absolutely. Upgrade whenever you want — your profile stays live and your link never changes." },
            { q: "What happens if my plan ends?", a: "You’ll keep access to the Free plan. Any paid features simply stop until you re-subscribe." },
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
                            Simple pricing that pays <br />
                            for itself
                        </h1>

                        <p className="body-s pr-sub">
                            Designed for real trades. One job covers the cost. Cancel anytime — no stress.
                        </p>

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

                            <div className="body-s pr-note">{p.note}</div>
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
                                        {isFeatured ? <div className="pr-card__tag">Most popular</div> : null}

                                        <div className="pr-card__head">
                                            <h3 className="h5 pr-card__title">{card.title}</h3>
                                        </div>

                                        <div className="pr-card__priceRow">
                                            <div className="pr-card__price">{card.price}</div>
                                            <div className="body-s pr-card__priceSub">{card.sub}</div>
                                        </div>

                                        <ul className="pr-card__list">
                                            {card.highlights.map((h) => (
                                                <li key={h}>
                                                    <span className="pr-dot" aria-hidden="true" />
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

                        <div className="pr-tableWrap" role="region" aria-label="Plan comparison table" tabIndex={0}>
                            <table className="pr-table">
                                <thead>
                                    <tr>
                                        <th className="pr-thFeature">Feature</th>
                                        <th className="pr-thPlan">Free</th>
                                        <th className="pr-thPlan pr-thPlus">Plus</th>
                                        <th className="pr-thPlan">Teams</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {compareRows.map((r) => (
                                        <tr key={r.f}>
                                            <td className="pr-tdFeature">{r.f}</td>

                                            <td className="pr-tdVal">
                                                {typeof r.free === "string" ? (
                                                    <span className="pr-textVal">{r.free}</span>
                                                ) : r.free ? (
                                                    <span className="pr-tick">✓</span>
                                                ) : (
                                                    <span className="pr-cross">—</span>
                                                )}
                                            </td>

                                            <td className="pr-tdVal pr-tdPlus">
                                                {typeof r.plus === "string" ? (
                                                    <span className="pr-textVal">{r.plus}</span>
                                                ) : r.plus ? (
                                                    <span className="pr-tick">✓</span>
                                                ) : (
                                                    <span className="pr-cross">—</span>
                                                )}
                                            </td>

                                            <td className="pr-tdVal">
                                                {typeof r.teams === "string" ? (
                                                    <span className="pr-textVal">{r.teams}</span>
                                                ) : r.teams ? (
                                                    <span className="pr-tick">✓</span>
                                                ) : (
                                                    <span className="pr-cross">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                                <p className="body-s pr-miniCard__p">
                                    Perfect if you just want your link, contact buttons, and a clean profile.
                                </p>
                            </div>

                            <div className="pr-miniCard is-accent">
                                <div className="pr-miniCard__top">
                                    <div className="pr-miniCard__title">Plus</div>
                                    <div className="pr-miniCard__pill">Solo trades</div>
                                </div>
                                <p className="body-s pr-miniCard__p">
                                    Best for trades who want services, photos, reviews, and a premium presence.
                                </p>
                            </div>

                            <div className="pr-miniCard">
                                <div className="pr-miniCard__top">
                                    <div className="pr-miniCard__title">Teams</div>
                                    <div className="pr-miniCard__pill">Growing business</div>
                                </div>
                                <p className="body-s pr-miniCard__p">
                                    For companies with staff — multiple profiles, central branding, and control.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ✅ PRICING FAQ (Accordion like FAQ/Contact) */}
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
