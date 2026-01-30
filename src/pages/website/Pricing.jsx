// frontend/src/pages/website/Pricing.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Breadcrumbs from "../../components/Breadcrumbs";
import Footer from "../../components/Footer";

import "../../styling/fonts.css";
import "../../styling/pricing.css";

/* Reuse icons you already have */
import WorksOnEveryPhone from "../../assets/icons/Works_On_Every_Phone.svg";
import EasyToUpdateAnytime from "../../assets/icons/Easy_To_Update_Anytime.svg";
import NoAppNeeded from "../../assets/icons/No_App_Needed.svg";
import BuiltForRealTrades from "../../assets/icons/Built_For_Real_Trades.svg";

export default function Pricing() {
    const [billing, setBilling] = useState("monthly"); // monthly | quarterly | yearly

    const prices = useMemo(() => {
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
                cta: { label: "Get started free", to: "/register" },
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
                cta: { label: "Start Plus Plan", to: "/register" },
                featured: true,
            },
            {
                key: "teams",
                title: "Teams Plan",
                badge: "Built for crews and growing businesses",
                price: p.teams.price,
                sub: p.teams.sub,
                highlights: [
                    "Multiple team profiles under one account",
                    "Assign roles & manage staff pages",
                    "Company-wide branding consistency",
                    "Centralised updates & control",
                    "Ideal for 2–20+ tradies",
                    "Priority support",
                ],
                cta: { label: "Start Teams Plan", to: "/register" },
            },
        ],
        [p]
    );

    const comparisonRows = useMemo(
        () => [
            { label: "Claim your KonarCard link", free: true, plus: true, teams: true },
            { label: "Tap / QR sharing", free: true, plus: true, teams: true },
            { label: "Basic profile (contact buttons)", free: true, plus: true, teams: true },
            { label: "Custom themes & fonts", free: false, plus: true, teams: true },
            { label: "Services + pricing section", free: false, plus: true, teams: true },
            { label: "Photo gallery", free: false, plus: true, teams: true },
            { label: "Reviews & star ratings", free: false, plus: true, teams: true },
            { label: "Unlimited edits (instant updates)", free: true, plus: true, teams: true },
            { label: "Remove KonarCard branding", free: false, plus: true, teams: true },
            { label: "Multiple profiles (team management)", free: false, plus: false, teams: true },
            { label: "Assign staff & manage permissions", free: false, plus: false, teams: true },
            { label: "Centralised billing & admin controls", free: false, plus: false, teams: true },
            { label: "Support level", free: "Standard", plus: "Priority", teams: "Priority" },
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
                q: "Can I upgrade or downgrade later?",
                a: "Yes — change your plan anytime from your dashboard. Your profile stays live while you switch.",
            },
            {
                q: "Do I need an app for KonarCard to work?",
                a: "No app needed. People tap your card or scan your QR code and your profile opens instantly.",
            },
            {
                q: "What happens if I cancel?",
                a: "Your profile remains accessible, but premium features (like galleries and branding removal) won’t be active.",
            },
            {
                q: "Can you help me set up my profile?",
                a: "Yes. If you want help getting your page looking right, message us and we’ll guide you step by step.",
            },
            {
                q: "Do teams get one login or separate logins?",
                a: "Teams can manage multiple profiles under one account, with roles and permissions for staff.",
            },
            {
                q: "How do I contact support?",
                a: "Use live chat or the Contact Us page. We reply quickly and can help with setup or technical issues.",
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

            <main className="kc-pricing">
                {/* HERO */}
                <section className="kc-pricing__hero">
                    <div className="kc-pricing__heroInner">
                        <h1 className="desktop-h1 kc-pricing__title">
                            Simple pricing that pays
                            <br />
                            for itself
                        </h1>
                        <p className="desktop-body kc-pricing__subtitle">
                            One job covers the cost for the year. Real tools. Real results.
                            <br />
                            Start free, then upgrade only when it’s worth it.
                        </p>
                    </div>
                </section>

                {/* BILLING */}
                <section className="kc-pricing__billing">
                    <div className="kc-pricing__tabs" role="tablist" aria-label="Billing period">
                        <button
                            type="button"
                            className={`kc-pricing__tab ${billing === "monthly" ? "is-active" : ""}`}
                            onClick={() => setBilling("monthly")}
                            role="tab"
                            aria-selected={billing === "monthly"}
                        >
                            Monthly
                        </button>
                        <button
                            type="button"
                            className={`kc-pricing__tab ${billing === "quarterly" ? "is-active" : ""}`}
                            onClick={() => setBilling("quarterly")}
                            role="tab"
                            aria-selected={billing === "quarterly"}
                        >
                            Quarterly
                        </button>
                        <button
                            type="button"
                            className={`kc-pricing__tab ${billing === "yearly" ? "is-active" : ""}`}
                            onClick={() => setBilling("yearly")}
                            role="tab"
                            aria-selected={billing === "yearly"}
                        >
                            Yearly
                        </button>
                    </div>

                    <p className="desktop-body-s kc-pricing__note">{p.note}</p>
                </section>

                {/* PLANS */}
                <section className="kc-pricing__plans">
                    <div className="kc-pricing__grid">
                        {planCards.map((card) => (
                            <article
                                key={card.key}
                                className={`kc-pricing__card ${card.featured ? "is-featured" : ""}`}
                            >
                                {card.featured && <div className="kc-pricing__tag">Most popular</div>}

                                <div className="kc-pricing__cardTop">
                                    <p className="desktop-h6 kc-pricing__cardTitle">{card.title}</p>
                                    <p className="desktop-body-s kc-pricing__cardBadge">{card.badge}</p>
                                </div>

                                <div className="kc-pricing__priceRow">
                                    <span className="kc-pricing__price">{card.price}</span>
                                    <span className="desktop-body-s kc-pricing__priceSub">{card.sub}</span>
                                </div>

                                <ul className="kc-pricing__list">
                                    {card.highlights.map((t) => (
                                        <li className="desktop-body-s" key={t}>
                                            <span className="kc-pricing__dot" aria-hidden="true" />
                                            <span>{t}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to={card.cta.to}
                                    className={`kc-pricing__cta ${card.featured ? "is-primary" : "is-secondary"}`}
                                >
                                    {card.cta.label}
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>

                {/* COMPARE */}
                <section id="compare" className="kc-pricing__compare">
                    <div className="kc-pricing__sectionHead">
                        <h2 className="desktop-h4 kc-pricing__h2">Compare plans</h2>
                        <p className="desktop-body-s kc-pricing__sub2">
                            Everything included in each plan — so you can pick what fits your trade.
                        </p>
                    </div>

                    <div className="kc-pricing__tableWrap" role="region" aria-label="Plan comparison table">
                        <table className="kc-pricing__table">
                            <thead>
                                <tr>
                                    <th className="kc-pricing__thFeature">Features</th>
                                    <th className="kc-pricing__thPlan">FREE</th>
                                    <th className="kc-pricing__thPlan kc-pricing__thPlus">PLUS</th>
                                    <th className="kc-pricing__thPlan">TEAMS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonRows.map((r) => (
                                    <tr key={r.label}>
                                        <td className="kc-pricing__tdFeature">{r.label}</td>
                                        <td className="kc-pricing__tdVal">{formatTick(r.free)}</td>
                                        <td className="kc-pricing__tdVal kc-pricing__tdPlus">{formatTick(r.plus)}</td>
                                        <td className="kc-pricing__tdVal">{formatTick(r.teams)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="kc-pricing__compareCtas">
                        <Link to="/register" className="kc-pricing__btn kc-pricing__btnPrimary">
                            Get started
                        </Link>
                        <Link to="/contactus" className="kc-pricing__btn kc-pricing__btnGhost">
                            Ask a question
                        </Link>
                    </div>
                </section>

                {/* WHO IT'S FOR */}
                <section className="kc-pricing__for">
                    <div className="kc-pricing__sectionHead">
                        <h2 className="desktop-h4 kc-pricing__h2">Who each plan is for</h2>
                        <p className="desktop-body-s kc-pricing__sub2">
                            Quick, real-world examples so you know exactly where you fit.
                        </p>
                    </div>

                    <div className="kc-pricing__forGrid">
                        {planForCards.map((c) => (
                            <article key={c.key} className="kc-pricing__forCard">
                                <span className="kc-pricing__pill">{c.title}</span>
                                <p className="desktop-h6 kc-pricing__forHeadline">{c.headline}</p>

                                <ul className="kc-pricing__forList">
                                    {c.bullets.map((b) => (
                                        <li className="desktop-body-s" key={b}>
                                            <span className="kc-pricing__check" aria-hidden="true">
                                                ✓
                                            </span>
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="desktop-body-s kc-pricing__callout">{c.callout}</div>
                                <Link to="/register" className="kc-pricing__forBtn">
                                    Get started
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>

                {/* VALUE */}
                <section className="kc-pricing__value">
                    <div className="kc-pricing__sectionHead">
                        <h2 className="desktop-h4 kc-pricing__h2">One job pays for the whole year</h2>
                        <p className="desktop-body-s kc-pricing__sub2">
                            No reprints. No outdated details. Your card works and you update your profile anytime.
                        </p>
                    </div>

                    <div className="kc-pricing__valueGrid">
                        <div className="kc-pricing__valueCard">
                            <img src={WorksOnEveryPhone} alt="" className="kc-pricing__icon" />
                            <p className="desktop-h6 kc-pricing__valueTitle">Works on every phone</p>
                            <p className="desktop-body-s kc-pricing__valueDesc">No app. Tap or scan. Simple.</p>
                        </div>
                        <div className="kc-pricing__valueCard">
                            <img src={EasyToUpdateAnytime} alt="" className="kc-pricing__icon" />
                            <p className="desktop-h6 kc-pricing__valueTitle">Always up-to-date</p>
                            <p className="desktop-body-s kc-pricing__valueDesc">No reprints when details change.</p>
                        </div>
                        <div className="kc-pricing__valueCard">
                            <img src={NoAppNeeded} alt="" className="kc-pricing__icon" />
                            <p className="desktop-h6 kc-pricing__valueTitle">No apps needed</p>
                            <p className="desktop-body-s kc-pricing__valueDesc">Works instantly on their phone.</p>
                        </div>
                        <div className="kc-pricing__valueCard">
                            <img src={BuiltForRealTrades} alt="" className="kc-pricing__icon" />
                            <p className="desktop-h6 kc-pricing__valueTitle">Built for real trades</p>
                            <p className="desktop-body-s kc-pricing__valueDesc">Designed for on-site, not offices.</p>
                        </div>
                    </div>
                </section>

                {/* FAQS */}
                <section className="kc-pricing__faqs">
                    <div className="kc-pricing__sectionHead">
                        <h2 className="desktop-h4 kc-pricing__h2">Pricing FAQs</h2>
                        <p className="desktop-body-s kc-pricing__sub2">We’ve answered the questions people ask most.</p>
                    </div>

                    <div className="kc-pricing__faqList">
                        {pricingFaqs.map((x) => (
                            <div className="kc-pricing__faqRow" key={x.q}>
                                <p className="desktop-h6 kc-pricing__faqQ">{x.q}</p>
                                <p className="desktop-body-s kc-pricing__faqA">{x.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
