// frontend/src/pages/website/Reviews.jsx
import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";

import "../../styling/fonts.css";
import "../../styling/reviews.css";

import { useSeo } from "../../utils/seo";

import pp1  from "../../assets/images/pp1.png";
import pp2  from "../../assets/images/pp2.png";
import pp3  from "../../assets/images/pp3.png";
import pp4  from "../../assets/images/pp4.png";
import pp5  from "../../assets/images/pp5.png";
import pp6  from "../../assets/images/pp6.png";
import pp7  from "../../assets/images/pp7.png";
import pp8  from "../../assets/images/pp8.png";
import pp9  from "../../assets/images/pp9.png";
import pp10 from "../../assets/images/pp10.png";
import pp11 from "../../assets/images/pp11.png";
import pp12 from "../../assets/images/pp12.png";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
});

const fadeInView = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.42, delay, ease: EASE },
});

/* ── Stars ─────────────────────────────────────────────────── */
function Stars({ value = 5, size = 14 }) {
    const pct = Math.max(0, Math.min(5, value)) / 5;
    return (
        <div
            className="krv-stars"
            aria-label={`${value} out of 5 stars`}
            style={{ fontSize: size }}
        >
            <div className="krv-stars__base" aria-hidden="true">★★★★★</div>
            <div
                className="krv-stars__fill"
                style={{ width: `${pct * 100}%` }}
                aria-hidden="true"
            >
                ★★★★★
            </div>
        </div>
    );
}

/* ── Review data ───────────────────────────────────────────── */
const REVIEWS = [
    {
        id: "r1",  avatar: pp1,  name: "Mark B",  trade: "Plumber",
        location: "Manchester", rating: 5,   date: "2 days ago",
        plan: "Plus plan",  products: ["KonarCard"],
        text: "Since using KonarCard I'm actually getting replies. Clients say it looks slick and I'm getting referrals.",
    },
    {
        id: "r2",  avatar: pp2,  name: "Jake C",  trade: "Electrician",
        location: "Leeds",       rating: 4.5, date: "1 week ago",
        plan: "Free plan",  products: ["KonarCard"],
        text: "Saved me a fortune on printing. Tap the card and customers have everything in seconds.",
    },
    {
        id: "r3",  avatar: pp3,  name: "Tom G",   trade: "Builder",
        location: "Birmingham",  rating: 5,   date: "3 weeks ago",
        plan: "Teams plan", products: ["KonarCard"],
        text: "Gives me a proper online presence without a pricey website. Photos and reviews do the selling.",
    },
    {
        id: "r4",  avatar: pp4,  name: "Sam H",   trade: "Roofer",
        location: "Sheffield",   rating: 4,   date: "1 month ago",
        plan: "Plus plan",  products: [],
        text: "I update prices and services on my phone. No reprinting, no fuss. More enquiries coming in.",
    },
    {
        id: "r5",  avatar: pp5,  name: "Steve L", trade: "Decorator",
        location: "Liverpool",   rating: 5,   date: "5 days ago",
        plan: "Plus plan",  products: ["KonarCard"],
        text: "Looks professional on mobile. Clients can call, WhatsApp or request a quote right away.",
    },
    {
        id: "r6",  avatar: pp6,  name: "Matt D",  trade: "Joiner",
        location: "Glasgow",     rating: 5,   date: "2 months ago",
        plan: "Plus plan",  products: ["KonarCard"],
        text: "Before this I relied on word of mouth. Now people find me online and book. Worth every penny.",
    },
    {
        id: "r7",  avatar: pp7,  name: "Chris S", trade: "Tiler",
        location: "Nottingham",  rating: 4.5, date: "2 weeks ago",
        plan: "Free plan",  products: [],
        text: "Cheaper than keeping a website going. The gallery shows my best work and wins trust.",
    },
    {
        id: "r8",  avatar: pp8,  name: "Alex M",  trade: "Heating Engineer",
        location: "Newcastle",   rating: 5,   date: "6 days ago",
        plan: "Plus plan",  products: ["KonarCard"],
        text: "Tap, scan or share the link — it just works. Booking more local jobs than ever.",
    },
    {
        id: "r9",  avatar: pp9,  name: "Dan R",   trade: "Handyman",
        location: "Bristol",     rating: 5,   date: "3 months ago",
        plan: "Free plan",  products: [],
        text: "Not techy at all and still set it up in minutes. Tidy, modern and saves me on marketing.",
    },
    {
        id: "r10", avatar: pp10, name: "Ben K",   trade: "Gardener",
        location: "Cardiff",     rating: 4,   date: "4 weeks ago",
        plan: "Plus plan",  products: [],
        text: "Clients love the map and service list. Stopped reprinting cards — this pays for itself.",
    },
    {
        id: "r11", avatar: pp11, name: "John P",  trade: "Bricklayer",
        location: "London",      rating: 5,   date: "8 days ago",
        plan: "Plus plan",  products: [],
        text: "All my links in one place — quote form, photos, socials. Helped me close jobs faster.",
    },
    {
        id: "r12", avatar: pp12, name: "Lewis J", trade: "Plasterer",
        location: "Belfast",     rating: 4.5, date: "2 months ago",
        plan: "Plus plan",  products: ["KonarCard"],
        text: "Looks professional when I'm on site. One tap and the client has my details and portfolio.",
    },
];

const AVG_RATING = 4.8;

export default function Reviews() {
    useSeo({
        path: "/reviews",
        title: "KonarCard Reviews | What UK Tradespeople Say",
        description:
            "Read genuine reviews from UK tradespeople using KonarCard NFC business cards — electricians, plumbers, builders and more sharing their experience.",
    });

    return (
        <>
            <Navbar />

            <main className="krv-page kc-page">

                {/* ── HERO ─────────────────────────────────────── */}
                <section className="krv-hero" aria-label="Reviews hero">
                    <div className="krv-container">
                        <div className="krv-heroWrap">

                            {/* Grid bg */}
                            <div className="krv-gridBg" aria-hidden="true" />

                            <div className="krv-heroGrid">

                                {/* Left — copy */}
                                <motion.div className="krv-heroCopy" {...fadeUp(0)}>
                                    <p className="kc-pill krv-kicker">Customer reviews</p>

                                    <h1 className="h2 krv-title">
                                        Tradespeople use KonarCard to look more professional — fast.
                                    </h1>

                                    <p className="kc-subheading krv-sub">
                                        Clear profiles, easy sharing, and a better first impression. Here's what customers are saying after switching.
                                    </p>

                                    <div className="krv-trustRow" aria-label="Average rating">
                                        <span className="krv-trustNum">{AVG_RATING}</span>
                                        <Stars value={AVG_RATING} size={16} />
                                        <span className="krv-trustNote">Based on {REVIEWS.length} reviews</span>
                                    </div>

                                    <div className="krv-chips" aria-label="Highlights">
                                        <span className="krv-chip">Verified purchases</span>
                                        <span className="krv-chip">Real trades</span>
                                        <span className="krv-chip">UK customers</span>
                                    </div>
                                </motion.div>

                                {/* Right — summary card */}
                                <motion.aside
                                    className="krv-summaryCard"
                                    aria-label="Review summary"
                                    {...fadeUp(0.12)}
                                >
                                    <div className="krv-summaryHead">
                                        <p className="krv-summaryTitle">Summary</p>
                                        <p className="krv-summaryDesc">
                                            Short, honest feedback from people using KonarCard day-to-day.
                                        </p>
                                    </div>

                                    <div className="krv-statsGrid">
                                        <div className="krv-stat">
                                            <p className="krv-statValue">{AVG_RATING} / 5</p>
                                            <p className="krv-statLabel">Average rating</p>
                                        </div>
                                        <div className="krv-stat">
                                            <p className="krv-statValue">{REVIEWS.length}</p>
                                            <p className="krv-statLabel">Total reviews</p>
                                        </div>
                                    </div>

                                    <Link to="/claimyourlink" className="kx-btn kx-btn--black krv-summaryBtn">
                                        Claim your link
                                    </Link>

                                    <p className="krv-summaryHint">Set up in minutes. Update anytime.</p>
                                </motion.aside>

                            </div>
                        </div>
                    </div>
                </section>

                {/* ── REVIEW GRID ──────────────────────────────── */}
                <section className="krv-listSection" aria-label="Customer reviews">
                    <div className="krv-container">
                        <div
                            className="krv-grid"
                            role="list"
                            aria-label="Customer review cards"
                        >
                            {REVIEWS.map((r, i) => (
                                <motion.article
                                    key={r.id}
                                    className="krv-card"
                                    role="listitem"
                                    {...fadeInView(i * 0.04)}
                                >
                                    {/* Stars + rating at top */}
                                    <div className="krv-cardTop">
                                        <Stars value={r.rating} size={13} />
                                        <span className="krv-cardRating">{r.rating.toFixed(1)}</span>
                                    </div>

                                    {/* Quote */}
                                    <p className="krv-cardQuote">"{r.text}"</p>

                                    {/* Divider */}
                                    <div className="krv-cardDivider" aria-hidden="true" />

                                    {/* Person */}
                                    <div className="krv-cardPerson">
                                        <img
                                            className="krv-avatar"
                                            src={r.avatar}
                                            alt={`${r.name} avatar`}
                                            width={38}
                                            height={38}
                                            loading="lazy"
                                            decoding="async"
                                        />

                                        <div className="krv-personInfo">
                                            <p className="krv-personName">
                                                {r.name}
                                                <span className="krv-personSep" aria-hidden="true"> · </span>
                                                <span className="krv-personTrade">{r.trade}</span>
                                            </p>
                                            <p className="krv-personMeta">
                                                {r.location}
                                                <span className="krv-personSep" aria-hidden="true"> · </span>
                                                {r.date}
                                            </p>

                                            {/* Tags */}
                                            {(r.plan || r.products.length > 0) && (
                                                <div className="krv-tags">
                                                    {r.plan && (
                                                        <span className="krv-tag krv-tag--plan">{r.plan}</span>
                                                    )}
                                                    {r.products.map((p) => (
                                                        <span key={p} className="krv-tag krv-tag--product">{p}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </div>

                        {/* CTA */}
                        <motion.div
                            className="krv-cta"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-30px" }}
                            transition={{ duration: 0.4, ease: EASE }}
                        >
                            <p className="krv-ctaText">Share your experience with KonarCard.</p>
                            <button type="button" className="kx-btn kx-btn--black">
                                Add your own review
                            </button>
                        </motion.div>
                    </div>
                </section>

            </main>

            <Footer />
        </>
    );
}
