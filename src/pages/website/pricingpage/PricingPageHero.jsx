// frontend/src/pages/website/pricingpage/PricingPageHero.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

/* ✅ NEW: Hero-only styling for the pricing page */
import "../../../styling/pricingpage/pricingpagehero.css";

/* Plan icons (same as HOME pricing section) */
import FreePlanIcon from "../../../assets/icons/FreePlan.svg";
import PlusPlanIcon from "../../../assets/icons/PlusPlan.svg";
import TeamsPlanIcon from "../../../assets/icons/TeamsPlan.svg";

/* =========================
   Helpers
========================= */
function fmtGBP(n) {
    const cleaned = typeof n === "string" ? n.replace(/[^0-9.]/g, "") : n;
    const num = parseFloat(cleaned);
    if (!Number.isFinite(num)) return "—";
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
    currentPlan = "free", // "free" | "plus" | "teams"
    isActive = false,
    hasFutureAccess = false,
    activeUntilLabel = "",

    /* actions (optional) */
    loadingKey,
    startSubscription, // (planKey) => Promise<void>
    openBillingPortal, // () => Promise<void>
}) {
    /* =========================
       CTA logic (kept safe)
    ========================= */
    const getCTA = (planName, planKeyForPaid) => {
        const logged = !!isLoggedIn;

        // Not logged in
        if (!logged) {
            if (planName === "free") return { type: "link", label: "Start Free", to: "/register" };

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

        // Logged in
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

    /* =========================
       Cards (same structure as HOME pricing)
    ========================= */
    const cards = useMemo(() => {
        const plusKey = `plus-${billing}`;
        const teamsKey = `teams-${billing}`;

        const base = parseFloat(String(plusPerMonth ?? "").replace(/[^0-9.]/g, "")) || 0;
        const addon = parseFloat(String(addOnPerExtraProfilePerMonth ?? "").replace(/[^0-9.]/g, "")) || 0;
        const teamsExample3Profiles = base + addon * 2;

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
                highlights: [
                    "Your KonarCard link",
                    "Contact buttons",
                    "QR sharing",
                    "Works on any phone",
                    "Unlimited updates",
                    "Tap or scan share",
                ],
                cta: getCTA("free"),
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
                highlights: [
                    "Full customisation",
                    "More photos",
                    "Services & pricing",
                    "Reviews & ratings",
                    "Unlimited edits",
                    "Remove branding",
                    "Deeper analytics",
                ],
                cta: getCTA("plus", plusKey),
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
                    base > 0 ? `Example: 3 profiles = ${fmtGBP(teamsExample3Profiles)} / month` : null,
                ].filter(Boolean),
                highlights: [
                    "Everything in Plus",
                    "Add staff profiles",
                    "Centralised controls",
                    "Shared branding",
                    "Team analytics",
                    "Manage in one place",
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
                {/* ✅ Heading block (grid background ONLY here) */}
                <div className="pr-heroCopyGrid">
                    <p className="kc-pill pr-heroPill">Pricing</p>

                    <h1 className="h2 pr-title">
                        Plans &amp; pricing <span className="pr-accent">built</span> for real trades
                    </h1>

                    <p className="kc-subheading pr-sub">Start free. Upgrade when it’s worth it. Cancel anytime.</p>

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
                            {["monthly", "quarterly", "yearly"].map((v) => {
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
                                        {v.charAt(0).toUpperCase() + v.slice(1)}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="body-s pr-note">{billingNote}</div>
                    </div>
                </div>

                {/* ✅ Cards (HOME pricing system) */}
                <div className="pr-plansInline">
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
                                            <div className={`kpr-included ${isFeatured ? "is-featured" : ""}`}>What’s Included</div>

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
                </div>
            </div>
        </section>
    );
}