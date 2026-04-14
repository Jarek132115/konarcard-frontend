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
        id: "r1", avatar: pp1, name: "Mark B", trade: "Plumber",
        location: "Manchester", rating: 5, date: "2 days ago",
        plan: "Plus plan", products: ["KonarCard"],
        text: "Honestly didn't think a little card would make this much difference!! Customer showed it to their neighbour on the driveway and I had another boiler job booked by the weekend. Best £19.99 I've spent on my business.",
    },
    {
        id: "r2", avatar: pp2, name: "Jake C", trade: "Electrician",
        location: "Leeds", rating: 5, date: "1 week ago",
        plan: "Free plan", products: ["KonarCard"],
        text: "I was throwing money at a new box of paper cards every time my number changed. Had a new mobile earlier in the year, couldn't be bothered to reprint. Got KonarCard instead and I've not touched a paper card since!",
    },
    {
        id: "r3", avatar: pp3, name: "Tom G", trade: "Builder",
        location: "Birmingham", rating: 5, date: "3 weeks ago",
        plan: "Teams plan", products: ["KonarCard"],
        text: "Run a small crew of three and we've all got our own profile under the same account. Customers see photos of actual finished extensions before they even ring. Makes selling the job so much easier, I can't recommend it enough.",
    },
    {
        id: "r4", avatar: pp4, name: "Sam H", trade: "Roofer",
        location: "Sheffield", rating: 4, date: "1 month ago",
        plan: "Plus plan", products: [],
        text: "Took a bit of getting my head round at first but once I had my photos and services loaded in I was away. Got a couple of leaks jobs last week off the back of my profile alone. Bit of trust goes a long way in this game.",
    },
    {
        id: "r5", avatar: pp5, name: "Steve L", trade: "Decorator",
        location: "Liverpool", rating: 5, date: "5 days ago",
        plan: "Plus plan", products: ["KonarCard"],
        text: "Love it!! Clients scroll through the gallery and go 'oh that's gorgeous, can you do ours like that' before I've even quoted. Won 3 proper full-house jobs in my first month using it. Game changer.",
    },
    {
        id: "r6", avatar: pp6, name: "Matt D", trade: "Joiner",
        location: "Glasgow", rating: 5, date: "2 months ago",
        plan: "Plus plan", products: ["KonarCard"],
        text: "Had it set up in maybe 10 minutes, and I'm not exactly the most tech savvy guy. Older customer couldn't tap her phone so I used the QR code on the back, worked first go. Covers everyone.",
    },
    {
        id: "r7", avatar: pp7, name: "Chris S", trade: "Tiler",
        location: "Nottingham", rating: 4.5, date: "2 weeks ago",
        plan: "Free plan", products: [],
        text: "The gallery is the best bit for me. Bathroom tiling is all about the finish, customers always want to see before/after. Now I just hand them the card and they can scroll through 12 of my jobs right there in their kitchen.",
    },
    {
        id: "r8", avatar: pp8, name: "Alex M", trade: "Heating Engineer",
        location: "Newcastle", rating: 5, date: "6 days ago",
        plan: "Plus plan", products: ["KonarCard"],
        text: "Had an emergency callout on a boiler and the lady wanted my details for her landlord. I tapped the card on her phone and it was done in about 3 seconds!! She couldn't believe it. Got the re-fit job off it too.",
    },
    {
        id: "r9", avatar: pp9, name: "Dan R", trade: "Handyman",
        location: "Bristol", rating: 5, date: "3 months ago",
        plan: "Free plan", products: [],
        text: "Wasn't sold on the idea at first, thought it was a gimmick. But the reviews have genuinely rolled in and a couple of proper regulars have found me through the profile link I put on Facebook. Keeps the phone ringing nicely.",
    },
    {
        id: "r10", avatar: pp10, name: "Ben K", trade: "Gardener",
        location: "Cardiff", rating: 4, date: "4 weeks ago",
        plan: "Plus plan", products: [],
        text: "Added my seasonal offers and hourly rate straight on the profile so I don't get a million 'how much do you charge' texts anymore. People can see everything up front. Huge time saver, honestly.",
    },
    {
        id: "r11", avatar: pp11, name: "John P", trade: "Bricklayer",
        location: "London", rating: 5, date: "8 days ago",
        plan: "Plus plan", products: [],
        text: "Tap, profile opens, job booked. Three steps and I've stopped losing leads because someone lost my bit of card in the bottom of their bag. Wish I'd done this years ago!!",
    },
    {
        id: "r12", avatar: pp12, name: "Lewis J", trade: "Plasterer",
        location: "Belfast", rating: 5, date: "2 months ago",
        plan: "Plus plan", products: ["KonarCard"],
        text: "Hand it over after every quote now without fail. It just looks proper when the phone lights up and shows my name, photos and reviews. I genuinely think it's the reason I'm winning more jobs against cheaper quotes.",
    },
];

const AVG_RATING = 4.9;

export default function Reviews() {
    useSeo({
        path: "/reviews",
        title: "KonarCard Reviews | What UK Tradespeople Say",
        description:
            "Read genuine reviews from UK tradespeople using KonarCard NFC business cards: electricians, plumbers, builders and more sharing their experience.",
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

                                {/* Left: copy */}
                                <motion.div className="krv-heroCopy" {...fadeUp(0)}>
                                    <p className="kc-pill krv-kicker">Reviews</p>

                                    <h1 className="h2 krv-title">
                                        What UK Tradespeople Say About KonarCard
                                    </h1>

                                    <p className="kc-subheading krv-sub">
                                        {AVG_RATING} out of 5 from verified UK tradespeople.
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

                                {/* Right: summary card */}
                                <motion.aside
                                    className="krv-summaryCard"
                                    aria-label="Review summary"
                                    {...fadeUp(0.12)}
                                >
                                    <div className="krv-summaryHead">
                                        <p className="krv-summaryTitle">Summary</p>
                                        <p className="krv-summaryDesc">
                                            Straight from the van. Real feedback from real jobs.
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

                                    <Link to="/register" className="kx-btn kx-btn--black krv-summaryBtn">
                                        Claim Your Link
                                    </Link>

                                    <p className="krv-summaryHint">No card needed to set up your profile.</p>
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
                                    {/* Avatar */}
                                    <img
                                        className="krv-avatar"
                                        src={r.avatar}
                                        alt={`${r.name} avatar`}
                                        width={60}
                                        height={60}
                                        loading="lazy"
                                        decoding="async"
                                    />

                                    {/* Stars */}
                                    <div className="krv-cardStars">
                                        <Stars value={r.rating} size={14} />
                                    </div>

                                    {/* Quote */}
                                    <p className="krv-cardQuote">"{r.text}"</p>

                                    {/* Person details */}
                                    <div className="krv-cardFoot">
                                        <p className="krv-personName">{r.name}</p>
                                        <p className="krv-personMeta">
                                            {r.trade} · {r.location}
                                        </p>
                                    </div>
                                </motion.article>
                            ))}
                        </div>

                    </div>
                </section>

                {/* ── CTA ──────────────────────────────────────── */}
                <section className="krv-ctaSection" aria-label="Claim your link">
                    <motion.div
                        className="krv-container krv-ctaInner"
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.48, ease: EASE }}
                    >
                        <p className="kc-pill krv-ctaPill">Start now</p>
                        <h2 className="h3 krv-ctaTitle">Ready to make yours?</h2>
                        <p className="kc-subheading krv-ctaSub">
                            Claim your KonarCard link, build your profile, then order your card when you're ready.
                        </p>
                        <div className="krv-ctaBtns">
                            <Link to="/register" className="kx-btn kx-btn--black">
                                Claim Your Link
                            </Link>
                        </div>
                    </motion.div>
                </section>

            </main>

            <Footer />
        </>
    );
}
