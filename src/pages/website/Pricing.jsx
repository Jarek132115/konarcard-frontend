// frontend/src/pages/website/Pricing.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Breadcrumbs from "../../components/Breadcrumbs";
import Footer from "../../components/Footer";

import "../../styling/pricing.css";

/* Reuse icons you already have */
import WorksOnEveryPhone from "../../assets/icons/Works_On_Every_Phone.svg";
import EasyToUpdateAnytime from "../../assets/icons/Easy_To_Update_Anytime.svg";
import NoAppNeeded from "../../assets/icons/No_App_Needed.svg";
import BuiltForRealTrades from "../../assets/icons/Built_For_Real_Trades.svg";

export default function Pricing() {
    const [billing, setBilling] = useState("monthly"); // monthly | quarterly | yearly

    const prices = useMemo(() => {
        // Adjust these values any time.
        // Keeping it aligned to your design vibe: FREE / PLUS / TEAMS
        return {
            monthly: {
                free: { label: "FREE", price: "£0", sub: "No monthly cost" },
                plus: { label: "Plus Plan", price: "£4.95", sub: "per month" },
                teams: { label: "Teams Plan", price: "£19.95", sub: "per month" },
                note: "Billed monthly. Cancel anytime.",
            },
            quarterly: {
                free: { label: "FREE", price: "£0", sub: "No monthly cost" },
                plus: { label: "Plus Plan", price: "£13.95", sub: "per quarter" },
                teams: { label: "Teams Plan", price: "£54.95", sub: "per quarter" },
                note: "Billed every 3 months. Cancel anytime.",
            },
            yearly: {
                free: { label: "FREE", price: "£0", sub: "No yearly cost" },
                plus: { label: "Plus Plan", price: "£49.95", sub: "per year" },
                teams: { label: "Teams Plan", price: "£189.95", sub: "per year" },
                note: "Best value. Billed yearly.",
            },
        };
    }, []);

    const p = prices[billing];

    const planCards = useMemo(
        () => [
            {
                key: "free",
                title: "Individual",
                badge: "Everything you need to get started",
                price: p.free.price,
                sub: p.free.sub,
                highlights: [
                    "Claim your unique KonarCard link",
                    "Basic profile (name, trade, contact buttons)",
                    "QR code sharing",
                    "Works on iPhone & Android",
                    "Perfect for trying it out",
                ],
                cta: { label: "Start Free Trial", to: "/register", style: "primary" },
            },
            {
                key: "plus",
                title: "Plus Plan",
                badge: "For tradies who want to look pro online",
                price: p.plus.price,
                sub: p.plus.sub,
                highlights: [
                    "Full profile customisation (themes, fonts, layout)",
                    "Services + pricing sections",
                    "Photo gallery",
                    "Reviews & star ratings",
                    "Unlimited edits (changes go live instantly)",
                    "Priority support",
                ],
                cta: { label: "Start Plus Plan", to: "/register", style: "primary" },
                featured: true,
            },
            {
                key: "teams",
                title: "Teams Plan",
                badge: "Built for crews and growing businesses",
                price: `${p.teams.price}`,
                sub: p.teams.sub,
                highlights: [
                    "Multiple team profiles under one account",
                    "Assign roles & manage staff pages",
                    "Company-wide branding consistency",
                    "Centralised updates & control",
                    "Ideal for 2–20+ tradies",
                    "Priority support",
                ],
                cta: { label: "Start Teams Plan", to: "/register", style: "primary" },
            },
        ],
        [p]
    );

    const comparisonRows = useMemo(
        () => [
            {
                label: "Claim your KonarCard link",
                free: true,
                plus: true,
                teams: true,
            },
            {
                label: "Tap / QR sharing",
                free: true,
                plus: true,
                teams: true,
            },
            {
                label: "Basic profile (contact buttons)",
                free: true,
                plus: true,
                teams: true,
            },
            {
                label: "Custom themes & fonts",
                free: false,
                plus: true,
                teams: true,
            },
            {
                label: "Services + pricing section",
                free: false,
                plus: true,
                teams: true,
            },
            {
                label: "Photo gallery",
                free: false,
                plus: true,
                teams: true,
            },
            {
                label: "Reviews & star ratings",
                free: false,
                plus: true,
                teams: true,
            },
            {
                label: "Unlimited edits (instant updates)",
                free: true,
                plus: true,
                teams: true,
            },
            {
                label: "Remove KonarCard branding",
                free: false,
                plus: true,
                teams: true,
            },
            {
                label: "Multiple profiles (team management)",
                free: false,
                plus: false,
                teams: true,
            },
            {
                label: "Assign staff & manage permissions",
                free: false,
                plus: false,
                teams: true,
            },
            {
                label: "Centralised billing & admin controls",
                free: false,
                plus: false,
                teams: true,
            },
            {
                label: "Support level",
                free: "Standard",
                plus: "Priority",
                teams: "Priority",
            },
        ],
        []
    );

    const planForCards = useMemo(
        () => [
            {
                key: "free",
                title: "FREE",
                headline: "Best if you’re just getting started (or want to test KonarCard first).",
                bullets: [
                    "You want a clean digital contact page fast",
                    "You don’t need a gallery/services yet",
                    "You want to try it before committing",
                ],
                callout: "Perfect for side jobs, new businesses, and testing the tap-to-share flow.",
            },
            {
                key: "plus",
                title: "PLUS",
                headline: "Best for solo tradies who want a professional profile that wins more work.",
                bullets: [
                    "You want services + pricing listed clearly",
                    "You want to show reviews and photos",
                    "You want your page to look premium and trustworthy",
                ],
                callout: "This is the “I want more jobs” plan — most popular for a reason.",
            },
            {
                key: "teams",
                title: "TEAMS",
                headline: "Best for businesses managing multiple tradies under one brand.",
                bullets: [
                    "You want multiple profiles for staff",
                    "You want central control and consistent branding",
                    "You want to scale leads across the whole crew",
                ],
                callout: "Ideal for crews, franchises, and growing trade businesses.",
            },
        ],
        []
    );

    const pricingFaqs = useMemo(
        () => [
            {
                q: "How quickly do you reply?",
                a: "We aim to reply to all messages within one working day. If it’s urgent, live chat during working hours is usually the fastest way to get help.",
            },
            {
                q: "Can you help me set up my profile?",
                a: "Yes. If you’re unsure how to set something up or want us to check you’re doing it right, send a message and we’ll guide you step by step.",
            },
            {
                q: "Do I need an account to contact you?",
                a: "No — you don’t need an account to get in touch. Anyone can send us a message using the contact form on our site.",
            },
            {
                q: "Is it okay to finish my profile later?",
                a: "Yes. You can claim your link first and complete your profile later. Your link won’t go anywhere, and you can edit your profile at any time.",
            },
            {
                q: "Is there a phone number I can call?",
                a: "We don’t offer phone support at the moment. Email and live chat are the quickest and most reliable ways to reach us and get help.",
            },
            {
                q: "What should I do if something isn’t working?",
                a: "If something doesn’t look right or isn’t working as expected, send us a message and explain what’s happening. Screenshots help if you have them.",
            },
        ],
        []
    );

    const formatTick = (v) => {
        if (v === true) return <span className="pr-tick">✓</span>;
        if (v === false) return <span className="pr-cross">—</span>;
        return <span className="pr-textVal">{v}</span>;
    };

    return (
        <>
            <Navbar />
            <div style={{ marginTop: 20 }} className="section-breadcrumbs">
                <Breadcrumbs />
            </div>

            {/* HERO */}
            <section className="pr-hero">
                <h1 className="pr-h1">
                    Simple Pricing That Pays
                    <br />
                    For Itself
                </h1>
                <p className="pr-sub">
                    One job covers the cost for the year. Real tools. Real results.
                    <br />
                    Start free, then upgrade only when it’s worth it.
                </p>

                <div className="pr-heroBtns">
                    <Link to="/register" className="pr-btn pr-btnPrimary">
                        Start Free Trial
                    </Link>
                    <a href="#compare" className="pr-btn pr-btnGhost">
                        Compare Plans
                    </a>
                </div>
            </section>

            {/* BILLING TOGGLE */}
            <section className="pr-billing">
                <div className="pr-billingPills" role="tablist" aria-label="Billing period">
                    <button
                        type="button"
                        className={`pr-pill ${billing === "monthly" ? "isActive" : ""}`}
                        onClick={() => setBilling("monthly")}
                    >
                        Monthly Plan
                    </button>
                    <button
                        type="button"
                        className={`pr-pill ${billing === "quarterly" ? "isActive" : ""}`}
                        onClick={() => setBilling("quarterly")}
                    >
                        Quarterly Plan
                    </button>
                    <button
                        type="button"
                        className={`pr-pill ${billing === "yearly" ? "isActive" : ""}`}
                        onClick={() => setBilling("yearly")}
                    >
                        Yearly Plan
                    </button>
                </div>

                <p className="pr-note">{p.note}</p>
            </section>

            {/* PLAN CARDS */}
            <section className="pr-plans">
                <div className="pr-planGrid">
                    {planCards.map((card) => (
                        <div
                            key={card.key}
                            className={`pr-planCard ${card.featured ? "isFeatured" : ""}`}
                        >
                            {card.featured && <div className="pr-featuredTag">Most Popular</div>}

                            <div className="pr-planTop">
                                <p className="pr-planTitle">{card.title}</p>
                                <p className="pr-planBadge">{card.badge}</p>
                            </div>

                            <div className="pr-priceRow">
                                <span className="pr-price">{card.price}</span>
                                <span className="pr-priceSub">{card.sub}</span>
                            </div>

                            <ul className="pr-list">
                                {card.highlights.map((t) => (
                                    <li key={t}>
                                        <span className="pr-bulletDot" aria-hidden="true" />
                                        <span>{t}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to={card.cta.to}
                                className={`pr-cta ${card.featured ? "isPrimary" : "isSecondary"}`}
                            >
                                {card.cta.label}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* COMPARE TABLE */}
            <section id="compare" className="pr-compare">
                <h2 className="pr-h2">Compare Plans At A Glance</h2>
                <p className="pr-sub2">
                    Everything included in each plan — so you can pick what fits your trade.
                </p>

                <div className="pr-tableWrap" role="region" aria-label="Plan comparison table">
                    <table className="pr-table">
                        <thead>
                            <tr>
                                <th className="pr-thFeature">Features</th>
                                <th className="pr-thPlan">FREE</th>
                                <th className="pr-thPlan pr-thPlanPlus">PLUS</th>
                                <th className="pr-thPlan">TEAMS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonRows.map((r) => (
                                <tr key={r.label}>
                                    <td className="pr-tdFeature">{r.label}</td>
                                    <td className="pr-tdVal">{formatTick(r.free)}</td>
                                    <td className="pr-tdVal pr-tdPlus">{formatTick(r.plus)}</td>
                                    <td className="pr-tdVal">{formatTick(r.teams)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pr-compareCtas">
                    <Link to="/register" className="pr-btn pr-btnPrimary">
                        Start Free Trial
                    </Link>
                    <Link to="/contactus" className="pr-btn pr-btnGhost">
                        Ask a question
                    </Link>
                </div>
            </section>

            {/* WHO EACH PLAN IS FOR */}
            <section className="pr-for">
                <h2 className="pr-h2">Who Each Plan Is For</h2>
                <p className="pr-sub2">
                    Quick, real-world examples so you know exactly where you fit.
                </p>

                <div className="pr-forGrid">
                    {planForCards.map((c) => (
                        <div key={c.key} className={`pr-forCard is-${c.key}`}>
                            <div className="pr-forHead">
                                <span className="pr-forTag">{c.title}</span>
                                <p className="pr-forHeadline">{c.headline}</p>
                            </div>

                            <ul className="pr-forList">
                                {c.bullets.map((b) => (
                                    <li key={b}>
                                        <span className="pr-check" aria-hidden="true">
                                            ✓
                                        </span>
                                        <span>{b}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="pr-callout">{c.callout}</div>

                            <div className="pr-forActions">
                                <Link to="/register" className="pr-forBtn">
                                    Get started
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* VALUE BLOCK */}
            <section className="pr-value">
                <h2 className="pr-h2">One Job Pays For The Whole Year</h2>
                <p className="pr-sub2">
                    No reprints. No outdated details. The card works, you update your
                    profile anytime, and it’s everywhere.
                </p>

                <div className="pr-valueGrid">
                    <div className="pr-valueCard">
                        <img src={WorksOnEveryPhone} alt="" className="pr-valueIcon" />
                        <p className="pr-valueTitle">Works everywhere, every time</p>
                        <p className="pr-valueDesc">No app. Tap or scan. Simple.</p>
                    </div>
                    <div className="pr-valueCard">
                        <img src={EasyToUpdateAnytime} alt="" className="pr-valueIcon" />
                        <p className="pr-valueTitle">Always up-to-date</p>
                        <p className="pr-valueDesc">No reprints when details change.</p>
                    </div>
                    <div className="pr-valueCard">
                        <img src={NoAppNeeded} alt="" className="pr-valueIcon" />
                        <p className="pr-valueTitle">No apps needed</p>
                        <p className="pr-valueDesc">Works instantly on their phone.</p>
                    </div>
                    <div className="pr-valueCard">
                        <img src={BuiltForRealTrades} alt="" className="pr-valueIcon" />
                        <p className="pr-valueTitle">Built for real jobs</p>
                        <p className="pr-valueDesc">Designed for on-site, not offices.</p>
                    </div>
                </div>
            </section>

            {/* PRICING FAQS */}
            <section className="pr-faqs">
                <h2 className="pr-h2">Pricing FAQs</h2>
                <p className="pr-sub2">We’ve answered the questions people ask most.</p>

                <div className="pr-faqList">
                    {pricingFaqs.map((x) => (
                        <div className="pr-faqRow" key={x.q}>
                            <p className="pr-faqQ">{x.q}</p>
                            <p className="pr-faqA">{x.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </>
    );
}
