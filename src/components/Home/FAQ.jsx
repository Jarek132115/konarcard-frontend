// frontend/src/components/Home/FAQ.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

import "../../styling/fonts.css";
import "../../styling/home/faq.css";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

/* ── ChevronIcon ───────────────────────────────────────────── */
function ChevronIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
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

/* ── Data ──────────────────────────────────────────────────── */
const TABS = [
    { key: "getting-started", label: "Getting started" },
    { key: "cards-profiles",  label: "Cards & profiles" },
    { key: "pricing",         label: "Pricing & plans" },
    { key: "teams",           label: "Teams" },
    { key: "support",         label: "Technical & support" },
];

const FAQS = [
    {
        tab: "getting-started",
        q: "What is a digital business card?",
        a: "It's a business card you share from your phone instead of handing out paper. With KonarCard, the customer taps your card on their phone and your profile opens — details, services, photos and reviews, all in one link.",
    },
    {
        tab: "getting-started",
        q: "Does the customer need to download an app?",
        a: "No. Your profile opens straight in their browser. No downloads, no sign-ups, no faff.",
    },
    {
        tab: "getting-started",
        q: "How does the card actually work?",
        a: "Tap the card on the top or back of a phone and your profile loads. If their phone doesn't support tap, they scan the QR code on the back of the card instead.",
    },
    {
        tab: "getting-started",
        q: "Who is KonarCard for?",
        a: "Electricians, plumbers, builders, roofers, gas engineers, decorators, landscapers, handymen — any UK trade that wants to get more work from the jobs they already do.",
    },

    {
        tab: "cards-profiles",
        q: "What if I change my phone number or address?",
        a: "Update your profile online. Every card you've ever given out now shows the new details — nothing to reprint, nothing to replace.",
    },
    {
        tab: "cards-profiles",
        q: "What if the customer's phone doesn't have NFC?",
        a: "They scan the QR code on the back of the card with their camera. Works on every phone.",
    },
    {
        tab: "cards-profiles",
        q: "What happens if I lose my card?",
        a: "Your profile stays live — same link, same number, same details. Just order a new card.",
    },
    {
        tab: "cards-profiles",
        q: "Can I add my work photos and reviews?",
        a: "Yes. Add photos from jobs, list your services and prices, and show your reviews. Customers see proof before they pick up the phone.",
    },

    {
        tab: "pricing",
        q: "Is it a one-off cost or a subscription?",
        a: "The card is £19.99 — paid once. Your digital profile is free. If you want more photos, services and full analytics, Plus is £5 a month. Totally optional.",
    },
    {
        tab: "pricing",
        q: "Can I try it without buying a card?",
        a: "Yes. Claim your link and build your profile for free. Order a card later if you want one.",
    },
    {
        tab: "pricing",
        q: "Can I cancel Plus anytime?",
        a: "Yes. Cancel whenever you want from your dashboard. Your profile stays live on the free plan.",
    },

    {
        tab: "teams",
        q: "Can I set up cards for my crew?",
        a: "Yes. Add extra profiles for each member of your team — separate link, separate QR, separate stats. £2 a month per extra profile on top of Plus.",
    },
    {
        tab: "teams",
        q: "Can everyone have their own reviews and contact details?",
        a: "Yes. Each profile is its own thing — their own number, their own work photos, their own reviews.",
    },

    {
        tab: "support",
        q: "How long does delivery take?",
        a: "Same-day dispatch on orders placed before 1pm. Next-day delivery available at checkout for UK addresses.",
    },
    {
        tab: "support",
        q: "The tap isn't working — what should I do?",
        a: "Check NFC is switched on in the phone settings, then tap the card near the top or back of the phone. If it still doesn't work, scan the QR code on the back of the card.",
    },
    {
        tab: "support",
        q: "How do I get help?",
        a: "Live chat is fastest. Or email supportteam@konarcard.com — we reply within one working day.",
    },
];

export default function HomeFAQ() {
    const [activeTab, setActiveTab] = useState("getting-started");
    const [openIndex, setOpenIndex] = useState(0);

    const visibleFaqs = FAQS.filter((f) => f.tab === activeTab);

    return (
        <section className="khq" aria-label="Frequently asked questions">
            <div className="khq__inner">

                <motion.header className="khq__head" {...fadeUpInView(0)}>
                    <p className="kc-pill khq__kicker">FAQs</p>

                    <h2 className="h3 khq__title">
                        Straight <span className="khq__accent">Answers</span> to Common Questions
                    </h2>

                    <p className="kc-subheading khq__sub">
                        No jargon. Just the answers tradespeople actually want before they buy.
                    </p>

                    <div className="khq__tabs" role="tablist" aria-label="FAQ categories">
                        {TABS.map((t) => {
                            const isActive = t.key === activeTab;
                            return (
                                <button
                                    key={t.key}
                                    type="button"
                                    className={`kc-tabPill ${isActive ? "is-active" : ""}`}
                                    role="tab"
                                    aria-selected={isActive}
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
                </motion.header>

                <motion.div
                    className="khq__list"
                    role="region"
                    aria-label="FAQ list"
                    {...fadeUpInView(0.1)}
                >
                    {visibleFaqs.map((item, idx) => {
                        const isOpen = idx === openIndex;
                        return (
                            <div className="khq__item" key={item.q}>
                                <button
                                    type="button"
                                    className="khq__qRow"
                                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                                    aria-expanded={isOpen}
                                >
                                    <span className="khq__q">{item.q}</span>

                                    <span className={`khq__chev${isOpen ? " is-open" : ""}`} aria-hidden="true">
                                        <ChevronIcon />
                                    </span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="answer"
                                            className="body khq__a"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.28, ease: EASE }}
                                            style={{ overflow: "hidden" }}
                                        >
                                            {item.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </motion.div>

                <motion.div className="khq__cta" {...fadeUpInView(0.15)}>
                    <p className="body-s khq__ctaText">Still got questions? We're happy to help.</p>
                    <div className="khq__ctaBtns">
                        <Link to="/contactus" className="kx-btn kx-btn--black">
                            Contact support
                        </Link>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
