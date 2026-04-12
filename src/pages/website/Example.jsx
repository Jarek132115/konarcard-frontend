// frontend/src/pages/website/Example.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";

import "../../styling/fonts.css";
import "../../styling/home/customertrust.css";
import "../../styling/example.css";

import ExampleTest from "../../assets/images/ExampleTest.jpg";

import WorksOnEveryPhone  from "../../assets/icons/WorksOnEveryPhone.svg";
import BuiltForRealJobs   from "../../assets/icons/BuiltForRealJobs.svg";
import LinkInSocial       from "../../assets/icons/LinkInSocial.svg";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
});

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

const cardVariant = {
    hidden: { opacity: 0, y: 14 },
    show:   (i) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.42, delay: i * 0.06, ease: EASE },
    }),
    exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE } },
};

/* ── Data ──────────────────────────────────────────────────── */
const CATEGORIES = [
    { key: "all",        label: "All" },
    { key: "electrician",label: "Electrician" },
    { key: "plumber",    label: "Plumber" },
    { key: "builder",    label: "Builder" },
    { key: "renovator",  label: "Renovator" },
    { key: "landscaper", label: "Landscaper" },
    { key: "handyman",   label: "Handyman" },
];

const EXAMPLES_BY_TRADE = {
    electrician: [
        { id: "el-1", role: "Electrician", name: "James", desc: "Shares contact details instantly after jobs and quotes." },
        { id: "el-2", role: "Electrician", name: "Liam",  desc: "Sends a booking link and reviews in one quick tap." },
        { id: "el-3", role: "Electrician", name: "Aaron", desc: "Shows services and pricing clearly while quoting on-site." },
    ],
    plumber: [
        { id: "pl-1", role: "Plumber", name: "Ben",    desc: "Shares emergency call-out details and saves contacts fast." },
        { id: "pl-2", role: "Plumber", name: "Oliver", desc: "Shows before/after photos to build trust on visit one." },
        { id: "pl-3", role: "Plumber", name: "Ethan",  desc: "Shares invoice email and WhatsApp link in one tap." },
    ],
    builder: [
        { id: "bu-1", role: "Builder", name: "Ryan",   desc: "Shares portfolio + booking link to win higher-value jobs." },
        { id: "bu-2", role: "Builder", name: "Jack",   desc: "Sets clear timelines and services so customers know what to expect." },
        { id: "bu-3", role: "Builder", name: "Callum", desc: "Uses reviews and gallery to stand out when quoting." },
    ],
    renovator: [
        { id: "re-1", role: "Renovator", name: "Daniel", desc: "Shows transformations so customers decide faster with confidence." },
        { id: "re-2", role: "Renovator", name: "Harvey", desc: "Collects new leads at showrooms with a fast tap." },
        { id: "re-3", role: "Renovator", name: "Theo",   desc: "Shares a quote request form for easy survey booking." },
    ],
    landscaper: [
        { id: "la-1", role: "Landscaper", name: "Charlie", desc: "Shares seasonal packages and availability while on-site." },
        { id: "la-2", role: "Landscaper", name: "Oscar",   desc: "Uses gallery and reviews to secure maintenance clients." },
        { id: "la-3", role: "Landscaper", name: "Alfie",   desc: "Shares Instagram and booking link from one clean profile." },
    ],
    handyman: [
        { id: "ha-1", role: "Handyman", name: "George", desc: "Customers can call instantly while he's still on-site." },
        { id: "ha-2", role: "Handyman", name: "Leo",    desc: "Perfect for repeat work — always the right details." },
        { id: "ha-3", role: "Handyman", name: "Sam",    desc: "Shares services and pricing so customers know what's covered." },
    ],
};

const ALL_EXAMPLES = Object.entries(EXAMPLES_BY_TRADE).flatMap(([category, items]) =>
    items.map((x) => ({ ...x, category }))
);

const WHY_CARDS = [
    {
        img: WorksOnEveryPhone,
        alt: "Works on every phone",
        title: "Works on every phone",
        desc: "Tap or scan and your profile opens instantly — no downloads needed.",
    },
    {
        img: BuiltForRealJobs,
        alt: "Built for real jobs",
        title: "Built for real jobs",
        desc: "Made for on-site work so customers can trust you quickly and contact you fast.",
    },
    {
        img: LinkInSocial,
        alt: "One link for everything",
        title: "One link for everything",
        desc: "Keep photos, services, reviews and contact buttons together in one place.",
    },
];

export default function Example() {
    const [active, setActive] = useState("all");

    const visible = useMemo(() => {
        if (active === "all") return ALL_EXAMPLES;
        return (EXAMPLES_BY_TRADE[active] || []).map((x) => ({ ...x, category: active }));
    }, [active]);

    return (
        <>
            <Navbar />

            <main className="ex-page kc-page">

                {/* ── HERO ─────────────────────────────────────── */}
                <section className="ex-hero" aria-label="Examples hero">
                    <div className="ex-container">
                        <div className="ex-head">
                            {/* Grid bg — circular radial fade, consistent with all hero sections */}
                            <div className="ex-gridBg" aria-hidden="true" />

                            <motion.div className="ex-headContent" {...fadeUp(0)}>
                                <p className="kc-pill ex-kicker">Real profiles built with KonarCard</p>

                                <h1 className="h2 ex-title">
                                    See how other <span className="ex-accent">tradies</span> use KonarCard
                                </h1>

                                <p className="kc-subheading ex-sub">
                                    Real UK examples of taps turning into booked jobs.
                                </p>

                                <div className="ex-tabs" role="tablist" aria-label="Filter by trade">
                                    {CATEGORIES.map((c) => {
                                        const isActive = active === c.key;
                                        return (
                                            <button
                                                key={c.key}
                                                type="button"
                                                role="tab"
                                                aria-selected={isActive}
                                                className={`kc-tabPill${isActive ? " is-active" : ""}`}
                                                onClick={() => setActive(c.key)}
                                            >
                                                {c.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── EXAMPLES GRID ────────────────────────────── */}
                <section className="ex-gridSection" aria-label="Example profiles">
                    <div className="ex-container">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active}
                                className="ex-grid"
                                role="list"
                                aria-label={`${active === "all" ? "All" : active} examples`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18, ease: EASE }}
                            >
                                {visible.map((item, i) => (
                                    <motion.article
                                        key={item.id}
                                        className="ex-card"
                                        role="listitem"
                                        custom={i}
                                        variants={cardVariant}
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                    >
                                        {/* Image — fills top of card */}
                                        <div className="ex-media">
                                            <span className="ex-rolePill">{item.role}</span>
                                            <img
                                                src={ExampleTest}
                                                alt={`${item.name} — ${item.role} KonarCard profile example`}
                                                className="ex-img"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>

                                        {/* Body */}
                                        <div className="ex-body">
                                            <p className="kc-title ex-name">{item.name}</p>
                                            <p className="body ex-desc">{item.desc}</p>
                                        </div>
                                    </motion.article>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* ── WHY THIS WORKS ───────────────────────────── */}
                <section className="kht ex-why" aria-label="Why this works for any trade">
                    <div className="kht__inner">
                        <motion.header className="kht__head" {...fadeUpInView(0)}>
                            <p className="kc-pill kht__kicker">Built for trades</p>
                            <h2 className="h3 kht__title">
                                Why This <span className="kht__accent">Works</span> For Any Trade
                            </h2>
                            <p className="kc-subheading kht__sub">
                                The common reasons tradies get more work with KonarCard.
                            </p>
                        </motion.header>

                        <div className="kht__grid" role="list" aria-label="Reasons KonarCard works">
                            {WHY_CARDS.map((c, i) => (
                                <motion.article
                                    key={i}
                                    className="kht__card ex-whyCard"
                                    role="listitem"
                                    initial={{ opacity: 0, y: 14 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.42, delay: i * 0.08, ease: EASE }}
                                >
                                    <div className="kht__copy">
                                        <h3 className="kc-title kht__cardTitle">{c.title}</h3>
                                        <p className="body kht__cardDesc">{c.desc}</p>
                                    </div>

                                    <div className="kht__imgWrap ex-whyIconWrap" aria-hidden="true">
                                        <img
                                            className="ex-whyIcon"
                                            src={c.img}
                                            alt={c.alt}
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ──────────────────────────────────────── */}
                <section className="ex-cta" aria-label="Claim your link">
                    <motion.div
                        className="ex-container ex-ctaInner"
                        {...fadeUpInView(0)}
                    >
                        <p className="kc-pill ex-ctaPill">Start now</p>
                        <h2 className="h3 ex-ctaTitle">Ready to make yours?</h2>
                        <p className="kc-subheading ex-ctaSub">
                            Claim your KonarCard link, build your profile, then choose a card or keytag when you're ready.
                        </p>
                        <div className="ex-ctaBtns">
                            <Link to="/claimyourlink" className="kx-btn kx-btn--black">
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
