// frontend/src/pages/website/pricingpage/PricingPageHero.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import "../../../styling/pricingpage/pricingpagehero.css";

import FreePlanIcon from "../../../assets/icons/FreePlan.svg";
import PlusPlanIcon from "../../../assets/icons/PlusPlan.svg";
import TeamsPlanIcon from "../../../assets/icons/TeamsPlan.svg";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
});

/* ── Helpers ───────────────────────────────────────────────── */
function fmtGBP(n) {
    const cleaned = typeof n === "string" ? n.replace(/[^0-9.]/g, "") : n;
    const num = parseFloat(cleaned);
    if (!Number.isFinite(num)) return "N/A";
    return `£${num.toFixed(2)}`;
}

function planRank(plan) {
    if (plan === "teams") return 2;
    if (plan === "plus") return 1;
    return 0;
}

export default function PricingPageHero({
    /* billing */
    billing,
    setBilling,
    billingNote,

    /* pricing values */
    plusPerMonth,
    plusBilledLabel,
    plusSavings,
    addOnPerExtraProfilePerMonth,

    /* auth/subscription */
    isLoggedIn,
    subLoading,
    subErr,
    planStatusLine,
    currentPlan = "free",
    isActive = false,
    hasFutureAccess = false,
    activeUntilLabel = "",

    /* actions */
    loadingKey,
    startSubscription,
    openBillingPortal,
}) {
    /* ── CTA logic ─────────────────────────────────────────── */
    const getCTA = (planName, planKeyForPaid) => {
        const logged = !!isLoggedIn;

        if (!logged) {
            if (planName === "free") return { type: "link", label: "Claim Your Link", to: "/register" };
            if (typeof startSubscription !== "function") {
                return { type: "link", label: `Upgrade to ${planName === "plus" ? "Plus" : "Teams"}`, to: "/login" };
            }
            return {
                type: "button",
                label: `Upgrade to ${planName === "plus" ? "Plus" : "Teams"}`,
                onClick: () => startSubscription(planKeyForPaid),
                disabled: !!loadingKey,
            };
        }

        const stillHasPaidAccess = currentPlan !== "free" && (isActive || hasFutureAccess);

        if (planName === currentPlan && stillHasPaidAccess) {
            return { type: "button", label: hasFutureAccess ? `Active until ${activeUntilLabel}` : "Active", disabled: true };
        }

        if (planName === "free") {
            if (stillHasPaidAccess) {
                return {
                    type: "button",
                    label: "Switch to Free",
                    onClick: typeof openBillingPortal === "function" ? openBillingPortal : null,
                    disabled: !!loadingKey || subLoading || typeof openBillingPortal !== "function",
                };
            }
            if (currentPlan === "free") return { type: "button", label: "Current plan", disabled: true };
            return {
                type: "button",
                label: "Choose Free",
                onClick: typeof openBillingPortal === "function" ? openBillingPortal : null,
                disabled: typeof openBillingPortal !== "function",
            };
        }

        const isUpgrade = planRank(planName) > planRank(currentPlan);
        const isDowngrade = planRank(planName) < planRank(currentPlan);

        if (isDowngrade) {
            return {
                type: "button",
                label: "Downgrade (Billing)",
                onClick: typeof openBillingPortal === "function" ? openBillingPortal : null,
                disabled: !!loadingKey || subLoading || typeof openBillingPortal !== "function",
            };
        }

        if (isUpgrade && currentPlan !== "free" && stillHasPaidAccess) {
            return {
                type: "button",
                label: "Upgrade (Billing)",
                onClick: typeof openBillingPortal === "function" ? openBillingPortal : null,
                disabled: !!loadingKey || subLoading || typeof openBillingPortal !== "function",
            };
        }

        if (typeof startSubscription !== "function") {
            return { type: "link", label: "Choose plan", to: "/login" };
        }

        return {
            type: "button",
            label: isUpgrade ? "Upgrade" : "Choose plan",
            onClick: () => startSubscription(planKeyForPaid),
            disabled: !!loadingKey || subLoading,
        };
    };

    /* ── Cards ─────────────────────────────────────────────── */
    const cards = useMemo(() => {
        const plusKey = `plus-${billing}`;
        const teamsKey = `teams-${billing}`;

        const base = parseFloat(String(plusPerMonth ?? "").replace(/[^0-9.]/g, "")) || 0;
        const addon = parseFloat(String(addOnPerExtraProfilePerMonth ?? "").replace(/[^0-9.]/g, "")) || 0;
        const teamsExample3Profiles = base + addon * 2;

        return [
            {
                key: "free",
                title: "Free Plan",
                icon: FreePlanIcon,
                tag: "Start without paying",
                featured: false,
                price: "£0",
                cadence: "Free forever",
                meta: ["No card required to get started."],
                highlights: [
                    "One profile",
                    "Up to six work photos",
                    "Three services listed",
                    "Three reviews shown",
                    "Basic view count",
                    "Unlimited updates",
                ],
                cta: getCTA("free"),
            },
            {
                key: "plus",
                title: "Plus Plan",
                icon: PlusPlanIcon,
                tag: "Most popular",
                featured: true,
                price: fmtGBP(plusPerMonth),
                cadence: "per month",
                meta: [
                    billing === "monthly" ? "Cancel anytime. No contracts." : `Billed ${plusBilledLabel}. Cancel anytime.`,
                    plusSavings ? plusSavings : null,
                ].filter(Boolean),
                highlights: [
                    "All five profile templates",
                    "Up to twelve work photos",
                    "Twelve services listed",
                    "Twelve reviews shown",
                    "Full analytics",
                    "See who views and when",
                ],
                cta: getCTA("plus", plusKey),
            },
            {
                key: "teams",
                title: "Extra Profile",
                icon: TeamsPlanIcon,
                tag: "Teams or multiple vans",
                featured: false,
                price: fmtGBP(plusPerMonth),
                cadence: "+ £2 per extra profile/month",
                meta: [
                    billing === "monthly" ? "Billed monthly. Cancel anytime." : `Base billed ${plusBilledLabel}.`,
                    base > 0 ? `Example: 3 profiles = ${fmtGBP(teamsExample3Profiles)} / month` : null,
                ].filter(Boolean),
                highlights: [
                    "Everything in Plus",
                    "A separate profile per person",
                    "Its own link and QR code",
                    "Its own analytics",
                    "Shared branding",
                    "Manage from one account",
                ],
                cta: getCTA("teams", teamsKey),
            },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        billing,
        plusPerMonth,
        plusBilledLabel,
        plusSavings,
        addOnPerExtraProfilePerMonth,
        isLoggedIn,
        currentPlan,
        isActive,
        hasFutureAccess,
        activeUntilLabel,
        loadingKey,
        subLoading,
    ]);

    return (
        <section className="pr-hero" aria-label="Pricing hero and plans">
            <div className="pr-container pr-hero__inner">

                {/* ── Heading block with grid bg ────────────── */}
                <div className="pr-heroCopyGrid">
                    {/* Grid bg, radial fade, same pattern as all hero sections */}
                    <div className="pr-gridBg" aria-hidden="true" />

                    <motion.div className="pr-headContent" {...fadeUp(0)}>
                        <p className="kc-pill pr-heroPill">Pricing</p>

                        <h1 className="h2 pr-title">
                            Straightforward Pricing, <span className="pr-accent">Nothing Hidden</span>
                        </h1>

                        <p className="kc-subheading pr-sub">
                            The card is a one-off £19.99. Your profile is free to set up and use. If you want more from your profile, upgrade to Plus for £5 a month.
                        </p>

                        {isLoggedIn && (
                            <div className="pr-status" aria-live="polite">
                                {subLoading ? (
                                    <span className="pr-status__muted">Checking your plan…</span>
                                ) : subErr ? (
                                    <span className="pr-status__err">{subErr}</span>
                                ) : (
                                    <span className="pr-status__muted">{planStatusLine}</span>
                                )}
                            </div>
                        )}

                        <div className="pr-billing" aria-label="Billing options">
                            <div className="pr-billing__tabs" role="tablist" aria-label="Billing interval">
                                {["monthly", "yearly"].map((v) => {
                                    const active = billing === v;
                                    return (
                                        <button
                                            key={v}
                                            type="button"
                                            className={`kc-tabPill ${active ? "is-active" : ""}`}
                                            onClick={() => setBilling(v)}
                                            role="tab"
                                            aria-selected={active}
                                        >
                                            {v === "monthly" ? "Monthly" : "Yearly"}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="body-s pr-note">{billingNote}</div>
                        </div>
                    </motion.div>
                </div>

                {/* ── Plan cards ────────────────────────────── */}
                <motion.div
                    className="pr-plansInline"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
                >
                    <div className="kpr__grid" role="list" aria-label="KonarCard plans">
                        {cards.map((card) => {
                            const isFeatured = card.featured;

                            return (
                                <article key={card.key} className={`kpr-card ${isFeatured ? "is-featured" : ""}`} role="listitem">
                                    <div className={`kpr-top ${isFeatured ? "is-featured" : ""}`}>
                                        <div className={`kpr-tag ${isFeatured ? "is-featured" : ""}`}>{card.tag}</div>

                                        <div className="kpr-nameRow">
                                            <div className={`kpr-name ${isFeatured ? "is-featured" : ""}`}>{card.title}</div>
                                            <span className={`kpr-icon ${isFeatured ? "is-featured" : ""}`} aria-hidden="true">
                                                <img src={card.icon} alt="" loading="lazy" decoding="async" />
                                            </span>
                                        </div>

                                        <div className="kpr-priceRow">
                                            <div className={`kpr-price ${isFeatured ? "is-featured" : ""}`}>{card.price}</div>
                                            <div className={`kpr-cadence ${isFeatured ? "is-featured" : ""}`}>{card.cadence}</div>
                                        </div>

                                        {card.meta?.length ? (
                                            <div className={`kpr-meta ${isFeatured ? "is-featured" : ""}`}>
                                                {card.meta.map((m) => (
                                                    <div key={m}>{m}</div>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className={`kpr-divider ${isFeatured ? "is-featured" : ""}`} aria-hidden="true" />

                                    <div className="kpr-body">
                                        <div className="kpr-content">
                                            <div className={`kpr-included ${isFeatured ? "is-featured" : ""}`}>What's Included</div>

                                            <ul className={`kpr-list ${isFeatured ? "is-featured" : ""}`} aria-label={`${card.title} plan features`}>
                                                {card.highlights.map((h) => (
                                                    <li key={h} className="kpr-li">
                                                        <span className={`kpr-liText ${isFeatured ? "is-featured" : ""}`}>{h}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="kpr-actions">
                                            {card.cta.type === "link" ? (
                                                <Link
                                                    to={card.cta.to}
                                                    className={`kx-btn kpr-btn ${isFeatured ? "kpr-btn--featured" : "kpr-btn--outline"}`}
                                                >
                                                    {card.cta.label}
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className={`kx-btn kpr-btn ${isFeatured ? "kpr-btn--featured" : "kpr-btn--outline"}`}
                                                    onClick={card.cta.onClick || undefined}
                                                    disabled={!!card.cta.disabled}
                                                    aria-disabled={!!card.cta.disabled}
                                                >
                                                    {loadingKey ? "Redirecting…" : card.cta.label}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
