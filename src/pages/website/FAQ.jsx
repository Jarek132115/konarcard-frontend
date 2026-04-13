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
        q: "What is a digital business card?",
        a: "A card you share from your phone instead of handing out paper. With KonarCard, the customer taps your card on their phone and your profile opens — details, services, photos and reviews all in one link.",
    },
    {
        tab: "getting-started",
        q: "Does the customer need to download an app?",
        a: "No. Your profile opens straight in their browser. No download, no sign-up.",
    },
    {
        tab: "getting-started",
        q: "What trades use KonarCard?",
        a: "Electricians, plumbers, builders, roofers, gas engineers, decorators, landscapers, handymen and other UK tradespeople.",
    },

    // Cards & profiles
    {
        tab: "cards-profiles",
        q: "Does it work on all phones?",
        a: "Yes. Tap works on every modern iPhone and Android. For older phones, the QR code on the back of the card works on any phone with a camera.",
    },
    {
        tab: "cards-profiles",
        q: "What if the customer doesn't have NFC on their phone?",
        a: "They scan the QR code on the back of the card with their camera. Works on every phone.",
    },
    {
        tab: "cards-profiles",
        q: "Can I change my details after I've given the card out?",
        a: "Yes. Update your profile online and it updates on every card you've ever given out — no reprints.",
    },
    {
        tab: "cards-profiles",
        q: "What if I lose my card?",
        a: "Your profile stays live. Same link, same details. Just order a new card.",
    },
    {
        tab: "cards-profiles",
        q: "Can I have more than one profile?",
        a: "Yes, on the Plus plan. Add extra profiles for team members or different services — £2 per extra profile per month.",
    },

    // Pricing
    {
        tab: "pricing",
        q: "Do I need to pay a monthly fee?",
        a: "No. The card is a one-off £19.99. Your digital profile is free. Plus is £5 a month if you want more photos, services and full analytics — totally optional.",
    },
    {
        tab: "pricing",
        q: "What do I get on the free plan?",
        a: "Your link, your profile, tap and QR sharing, up to 6 work photos, 3 services and 3 reviews. Plenty to get started.",
    },
    {
        tab: "pricing",
        q: "Can I cancel Plus anytime?",
        a: "Yes. Cancel from your dashboard whenever you want. Your profile stays live on the free plan.",
    },
    {
        tab: "pricing",
        q: "Is there a setup fee?",
        a: "No. No setup fees, no hidden costs, no contracts.",
    },

    // Teams
    {
        tab: "teams",
        q: "Can I set up cards for my crew?",
        a: "Yes. Add extra profiles for each team member on Plus — £2 per extra profile per month. Each person gets their own link, QR and stats.",
    },
    {
        tab: "teams",
        q: "Can everyone have their own reviews and contact details?",
        a: "Yes. Each profile is completely separate — their own number, photos and reviews.",
    },

    // Technical & support
    {
        tab: "support",
        q: "How long does delivery take?",
        a: "Same-day dispatch on orders placed before 1pm. Next-day delivery available at checkout for UK addresses.",
    },
    {
        tab: "support",
        q: "The tap isn't working — what should I do?",
        a: "Check NFC is switched on in the phone settings, then tap the card near the top or back of the phone. If it still doesn't work, scan the QR code on the back.",
    },
    {
        tab: "support",
        q: "How do I get help?",
        a: "Live chat is fastest. Or email supportteam@konarcard.com — we reply within one working day.",
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
            "Answers to common questions about KonarCard NFC business cards — how the cards work, setup, plans, delivery, and updating your digital profile.",
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

                            {/* Grid bg — visible in centre, fades out radially on all edges */}
                            <div className="kfaq-gridBg" aria-hidden="true" />

                            <motion.div className="kfaq-headContent" {...fadeUp(0)}>
                                <p className="kc-pill kfaq-kicker">FAQs</p>

                                <h1 id="kfaq-title" className="h2 kfaq-title">
                                    Questions About KonarCard — <span className="kfaq-accent">Answered</span>
                                </h1>

                                <p className="kc-subheading kfaq-sub">
                                    Straight answers to the questions tradespeople actually ask. No jargon, no fluff.
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
