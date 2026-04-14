// frontend/src/components/Home/Examples.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import "../../styling/fonts.css";
import "../../styling/home/examples.css";

import NkemdirimImg from "../../assets/images/example-images/NkemdirimProfile.jpg";
import SutherlandImg from "../../assets/images/example-images/SutherlandProfile.jpg";
import DonnellyImg from "../../assets/images/example-images/DonnellyProfile.jpg";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

const cardVariant = {
    hidden: { opacity: 0, y: 14 },
    show: (i) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.44, delay: i * 0.08, ease: EASE },
    }),
};

/* ── Data ──────────────────────────────────────────────────── */
const ITEMS = [
    {
        role: "Builder",
        name: "Nkemdirim Construction",
        slug: "nkemdirimconstruction",
        img: NkemdirimImg,
        desc: "Full-project builder with timelines and reviews for each job type.",
    },
    {
        role: "Landscaper",
        name: "Sutherland Gardens",
        slug: "sutherlandgardens",
        img: SutherlandImg,
        desc: "Garden design and planting with a portfolio of completed projects.",
    },
    {
        role: "Plumber",
        name: "Donnelly Plumbing & Heating",
        slug: "donnellyplumbingheating",
        img: DonnellyImg,
        desc: "Call-out rate and common job prices listed so customers can decide fast.",
    },
];

export default function Examples() {
    return (
        <section className="khe-examples" aria-labelledby="khe-title">
            <div className="khe-container">

                <motion.header className="khe-head" {...fadeUpInView(0)}>
                    <p className="kc-pill khe-kicker">Real examples</p>

                    <h2 id="khe-title" className="h3 khe-title">
                        See Real <span className="khe-accent">KonarCard Profiles</span>
                    </h2>

                    <p className="kc-subheading khe-sub">
                        Examples of cards and profiles from UK tradespeople.
                    </p>
                </motion.header>

                <div className="khe-grid" role="list" aria-label="Example profiles">
                    {ITEMS.map((it, i) => (
                        <motion.article
                            className="khe-card"
                            key={it.slug}
                            role="listitem"
                            custom={i}
                            variants={cardVariant}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: "-40px" }}
                        >
                            <Link
                                to={`/u/${it.slug}`}
                                className="khe-cardLink"
                                aria-label={`View ${it.name} profile`}
                            >
                                {/* Padded image area */}
                                <div className="khe-media">
                                    <div className="khe-imgWrap">
                                        <span className="khe-rolePill">{it.role}</span>
                                        <img
                                            src={it.img}
                                            alt={`${it.name}, ${it.role} KonarCard profile example`}
                                            className="khe-img"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="khe-body">
                                    <p className="kc-title khe-name">{it.name}</p>
                                    <p className="body khe-desc">{it.desc}</p>
                                </div>
                            </Link>
                        </motion.article>
                    ))}
                </div>

                <motion.div className="khe-cta" {...fadeUpInView(0.15)}>
                    <p className="body-s khe-ctaHint">
                        See more real profiles from UK trades.
                    </p>
                    <Link to="/examples" className="kx-btn kx-btn--black">
                        View More Real Profiles
                    </Link>
                </motion.div>

            </div>
        </section>
    );
}
