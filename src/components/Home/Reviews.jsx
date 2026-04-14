// frontend/src/components/Home/Reviews.jsx
// Shows 3 featured reviews on the homepage. Shares the .krv-card look with
// the full reviews page so both feel consistent.
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import "../../styling/fonts.css";
import "../../styling/reviews.css";
import "../../styling/home/home-reviews.css";

import pp1 from "../../assets/images/pp1.png";
import pp5 from "../../assets/images/pp5.png";
import pp11 from "../../assets/images/pp11.png";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

const fadeInViewStagger = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.44, delay, ease: EASE },
});

/* ── Stars (matches /reviews page) ─────────────────────────── */
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

/* ── 3 featured reviews ────────────────────────────────────── */
const FEATURED = [
    {
        id: "r1",
        avatar: pp1,
        name: "Mark B",
        trade: "Plumber",
        location: "Manchester",
        rating: 5,
        text:
            "Honestly didn't think a little card would make this much difference!! Customer showed it to their neighbour on the driveway and I had another boiler job booked by the weekend. Best £19.99 I've spent on my business.",
    },
    {
        id: "r5",
        avatar: pp5,
        name: "Steve L",
        trade: "Decorator",
        location: "Liverpool",
        rating: 5,
        text:
            "Love it!! Clients scroll through the gallery and go 'oh that's gorgeous, can you do ours like that' before I've even quoted. Won 3 proper full-house jobs in my first month using it. Game changer.",
    },
    {
        id: "r11",
        avatar: pp11,
        name: "John P",
        trade: "Bricklayer",
        location: "London",
        rating: 5,
        text:
            "Tap, profile opens, job booked. Three steps and I've stopped losing leads because someone lost my bit of card in the bottom of their bag. Wish I'd done this years ago!!",
    },
];

export default function Reviews() {
    return (
        <section className="khr-reviews" aria-labelledby="khr-title">
            <div className="khr-container">

                <motion.header className="khr-head" {...fadeUpInView(0)}>
                    <p className="kc-pill khr-kicker">Reviews</p>

                    <h2 id="khr-title" className="h3 khr-title">
                        What UK <span className="khr-accent">Tradespeople</span> Say
                    </h2>

                    <p className="kc-subheading khr-sub">
                        Real feedback from real tradespeople using KonarCard on the job.
                    </p>
                </motion.header>

                <div className="khr-grid" role="list" aria-label="Featured reviews">
                    {FEATURED.map((r, i) => (
                        <motion.article
                            key={r.id}
                            className="krv-card"
                            role="listitem"
                            {...fadeInViewStagger(i * 0.08)}
                        >
                            <img
                                className="krv-avatar"
                                src={r.avatar}
                                alt={`${r.name} avatar`}
                                width={60}
                                height={60}
                                loading="lazy"
                                decoding="async"
                            />

                            <div className="krv-cardStars">
                                <Stars value={r.rating} size={14} />
                            </div>

                            <p className="krv-cardQuote">"{r.text}"</p>

                            <div className="krv-cardFoot">
                                <p className="krv-personName">{r.name}</p>
                                <p className="krv-personMeta">
                                    {r.trade} · {r.location}
                                </p>
                            </div>
                        </motion.article>
                    ))}
                </div>

                <motion.div className="khr-cta" {...fadeUpInView(0.15)}>
                    <Link to="/reviews" className="kx-btn kx-btn--black">
                        See All Reviews
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}
