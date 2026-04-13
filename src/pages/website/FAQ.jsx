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
        q: "What is KonarCard?",
        a: "KonarCard is a digital business card built for trades and service businesses. Share your details instantly using one link, an NFC tap, or a QR code — no app needed.",
    },
    {
        tab: "getting-started",
        q: "How do I get started?",
        a: "Claim your KonarCard link in seconds, create your profile, and start sharing straight away. No technical knowledge needed.",
    },
    {
        tab: "getting-started",
        q: "Do I need to pay to get started?",
        a: "No. You can claim your link and create a basic profile completely free. Upgrade to Plus when you want more features.",
    },
    {
        tab: "getting-started",
        q: "Who is KonarCard best for?",
        a: "Ideal for electricians, plumbers, builders, landscapers, and any service business that wants to share details professionally and instantly.",
    },
    {
        tab: "getting-started",
        q: "Do my customers need an app?",
        a: "No. People tap the card or scan the QR code and your profile opens instantly in their browser — no app, no download.",
    },

    // Cards & profiles
    {
        tab: "cards-profiles",
        q: "What is a KonarCard profile?",
        a: "Your profile is your digital business card — it shows your name, trade, contact details, social links, services, and reviews. Tap or scan to share it instantly.",
    },
    {
        tab: "cards-profiles",
        q: "Can I update my profile after ordering?",
        a: "Yes. Update your name, number, services, or any details at any time. Changes go live instantly — no reprints or new cards needed.",
    },
    {
        tab: "cards-profiles",
        q: "How does the NFC plastic card work?",
        a: "Your plastic card has an NFC chip embedded inside it. When someone taps it on their phone, it opens your KonarCard profile instantly in their browser.",
    },
    {
        tab: "cards-profiles",
        q: "What if someone's phone doesn't support NFC?",
        a: "Every card also has a QR code printed on the back, so anyone can scan and open your profile — no NFC required.",
    },
    {
        tab: "cards-profiles",
        q: "Can I use one profile across multiple cards?",
        a: "Yes. Your plastic card, metal card, and KonarTag can all link to the same KonarCard profile.",
    },
    {
        tab: "cards-profiles",
        q: "Do NFC cards work on iPhone and Android?",
        a: "Yes. KonarCard works on all modern iPhones and Android phones. If NFC isn't available, the QR code always works.",
    },

    // Pricing
    {
        tab: "pricing",
        q: "Is there a free plan?",
        a: "Yes. You can create a free profile with your basic details, claim your KonarCard link, and share it straight away.",
    },
    {
        tab: "pricing",
        q: "What does KonarCard Plus include?",
        a: "Plus gives you advanced profile features, priority support, and the ability to add extra profiles — great for businesses with multiple staff.",
    },
    {
        tab: "pricing",
        q: "How much does an extra profile cost?",
        a: "Extra profiles are £2/month each on the Plus plan.",
    },
    {
        tab: "pricing",
        q: "Can I cancel at any time?",
        a: "Yes. There are no contracts. Cancel your Plus plan anytime from your dashboard — no questions asked.",
    },
    {
        tab: "pricing",
        q: "Is there a setup fee?",
        a: "No. There are no setup fees, hidden fees, or long-term commitments.",
    },

    // Teams
    {
        tab: "teams",
        q: "Can my whole team use KonarCard?",
        a: "Yes. With Plus, you can add extra profiles for each team member. Each person gets their own digital card linked to your business.",
    },
    {
        tab: "teams",
        q: "Can each team member have their own card?",
        a: "Yes. Each profile can be linked to its own NFC plastic card, metal card, or KonarTag.",
    },
    {
        tab: "teams",
        q: "How do I manage team profiles?",
        a: "From your dashboard, you can create, edit, and manage all profiles under your account.",
    },
    {
        tab: "teams",
        q: "Is there a limit on how many profiles I can add?",
        a: "There's no hard limit. Add as many profiles as you need at £2/month each on the Plus plan.",
    },

    // Technical & support
    {
        tab: "support",
        q: "What if I lose my card?",
        a: "Your profile is saved in your dashboard. Order a replacement card and link it to the same profile — your details carry straight over.",
    },
    {
        tab: "support",
        q: "Is my data secure?",
        a: "Yes. KonarCard uses industry-standard security and never sells your data. Your information is only displayed on your public profile as you choose.",
    },
    {
        tab: "support",
        q: "What browsers does KonarCard support?",
        a: "KonarCard profiles work on all modern browsers — Chrome, Safari, Firefox, and Edge. No plugins needed.",
    },
    {
        tab: "support",
        q: "How do I contact support?",
        a: "Use the live chat button below or visit our contact page. We aim to respond quickly during business hours.",
    },
    {
        tab: "support",
        q: "Can I get a refund on my plastic card?",
        a: "Yes. If there's an issue with your order, contact us and we'll sort it out. See our returns policy for full details.",
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
                                <p className="kc-pill kfaq-kicker">Help centre</p>

                                <h1 id="kfaq-title" className="h2 kfaq-title">
                                    Frequently <span className="kfaq-accent">Asked</span> Questions
                                </h1>

                                <p className="kc-subheading kfaq-sub">
                                    Everything you need to know before getting started with KonarCard.
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
