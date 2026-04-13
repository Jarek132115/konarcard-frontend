// frontend/src/pages/website/FAQ.jsx
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";

import "../../styling/fonts.css";
import "../../styling/faq.css";
import "../../styling/productspage/productspagefaq.css";

import { useSeo } from "../../utils/seo";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
});

const fadeInView = (delay = 0) => ({
    initial: { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-30px" },
    transition: { duration: 0.4, delay, ease: EASE },
});

/* ── Chevron SVG ───────────────────────────────────────────── */
function ChevronIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
        >
            <path
                d="M2.5 5L7 9.5L11.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/* ── FAQ data ──────────────────────────────────────────────── */
const TABS = [
    { key: "getting-started", label: "Getting started" },
    { key: "cards-profiles", label: "Cards & profiles" },
    { key: "pricing", label: "Pricing & plans" },
    { key: "teams", label: "Teams" },
    { key: "support", label: "Technical & support" },
];

const FAQ_DATA = [
    // Getting started
    {
        tab: "getting-started",
        q: "What if the customer's phone doesn't have NFC?",
        a: "Every card also has a QR code on the back. The customer scans it and your profile opens exactly the same way. It works on any smartphone.",
    },
    {
        tab: "getting-started",
        q: "What trades use KonarCard?",
        a: "Electricians, plumbers, builders, roofers, gas engineers, decorators, landscapers, handymen and other service professionals across the UK.",
    },
    {
        tab: "getting-started",
        q: "Is KonarCard based in the UK?",
        a: "Yes. KonarCard is a UK company. Cards are shipped from within the UK.",
    },

    // Cards & profiles
    {
        tab: "cards-profiles",
        q: "What happens if I lose my card?",
        a: "Your profile stays live. Order a new card at any time and link it to the same profile. Nothing is lost.",
    },
    {
        tab: "cards-profiles",
        q: "Can I change my details after giving the card out?",
        a: "Yes. Log into your profile, make the change, and save it. Every card that has ever been given out will show the updated details immediately.",
    },
    {
        tab: "cards-profiles",
        q: "Can I have more than one profile?",
        a: "Yes. With the Plus plan you can add extra profiles at £2 a month each. Useful for teams, multiple trades or different service areas.",
    },

    // Pricing
    {
        tab: "pricing",
        q: "Do I need to pay monthly?",
        a: "The card is a one-off payment. The basic profile is free with no time limit. The Plus plan at £5 a month is optional and you can cancel any time.",
    },

    // Teams
    {
        tab: "teams",
        q: "Can I set up cards for my crew?",
        a: "Yes. Add extra profiles for each team member on the Plus plan at £2 a month each. Each person gets their own link, QR code and analytics.",
    },

    // Technical & support
    {
        tab: "support",
        q: "How long does delivery take?",
        a: "Orders placed before 1pm are dispatched the same day. Next-day delivery is available at checkout.",
    },
    {
        tab: "support",
        q: "How do I get help?",
        a: "Live chat is fastest. Or email supportteam@konarcard.com. We reply within one working day.",
    },
];

/* ── Open Tidio live chat ──────────────────────────────────── */
function openLiveChat() {
    if (window.tidioChatApi && typeof window.tidioChatApi.open === "function") {
        window.tidioChatApi.open();
    }
}

export default function FAQPage() {
    useSeo({
        path: "/faq",
        title: "KonarCard FAQs | NFC Business Card Questions Answered",
        description:
            "Answers to common questions about KonarCard NFC business cards: how the cards work, setup, plans, delivery, and updating your digital profile.",
    });

    const [activeTab, setActiveTab] = useState("getting-started");
    const [openIndex, setOpenIndex] = useState(0);

    const visibleFaqs = useMemo(
        () => FAQ_DATA.filter((f) => f.tab === activeTab),
        [activeTab]
    );

    return (
        <>
            <Navbar />

            <main className="kfaq-page kc-page">

                {/* ── HERO ─────────────────────────────────────── */}
                <section className="kfaq-hero" aria-labelledby="kfaq-title">
                    <div className="kfaq-container">
                        <div className="kfaq-head">

                            {/* Grid bg, visible in centre, fades out radially on all edges */}
                            <div className="kfaq-gridBg" aria-hidden="true" />

                            <motion.div className="kfaq-headContent" {...fadeUp(0)}>
                                <p className="kc-pill kfaq-kicker">FAQs</p>

                                <h1 id="kfaq-title" className="h2 kfaq-title">
                                    Questions About KonarCard, <span className="kfaq-accent">Answered</span>
                                </h1>

                                <p className="kc-subheading kfaq-sub">
                                    Everything you need to know. No jargon.
                                </p>

                                <div
                                    className="kfaq-tabs"
                                    role="tablist"
                                    aria-label="FAQ categories"
                                >
                                    {TABS.map((t) => {
                                        const isActive = t.key === activeTab;
                                        return (
                                            <button
                                                key={t.key}
                                                type="button"
                                                role="tab"
                                                aria-selected={isActive}
                                                className={`kc-tabPill${isActive ? " is-active" : ""}`}
                                                onClick={() => {
                                                    setActiveTab(t.key);
                                                    setOpenIndex(0);
                                                }}
                                            >
                                                {t.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── FAQ ACCORDION ────────────────────────────── */}
                <section className="kfaq-body" aria-label="FAQ answers">
                    <div className="kfaq-container">
                        <div
                            className="kpfq__list kfaq-list"
                            role="tabpanel"
                            aria-label={TABS.find((t) => t.key === activeTab)?.label}
                        >
                            {visibleFaqs.map((item, idx) => {
                                const isOpen = idx === openIndex;
                                const answerId = `kfaq-answer-${activeTab}-${idx}`;

                                return (
                                    <motion.div
                                        key={`${activeTab}-${item.q}`}
                                        className="kpfq__item"
                                        role="listitem"
                                        {...fadeInView(idx * 0.05)}
                                    >
                                        <button
                                            type="button"
                                            className="kpfq__qRow"
                                            onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                                            aria-expanded={isOpen}
                                            aria-controls={answerId}
                                        >
                                            <span className="kpfq__q">{item.q}</span>

                                            <span className={`kpfq__chev${isOpen ? " is-open" : ""}`}>
                                                <ChevronIcon />
                                            </span>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    id={answerId}
                                                    className="kpfq__aWrap"
                                                    role="region"
                                                    aria-label={item.q}
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.28, ease: EASE }}
                                                    style={{ overflow: "hidden" }}
                                                >
                                                    <p className="kpfq__a">{item.a}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* CTA */}
                        <motion.div
                            className="kpfq__cta"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-30px" }}
                            transition={{ duration: 0.4, ease: EASE }}
                        >
                            <p className="kpfq__ctaText">
                                Still got questions? We're happy to help.
                            </p>

                            <button
                                type="button"
                                className="kx-btn kx-btn--black"
                                onClick={openLiveChat}
                            >
                                Start Live Chat
                            </button>
                        </motion.div>
                    </div>
                </section>

            </main>

            <Footer />
        </>
    );
}
