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
        q: "What is KonarCard?",
        a: "KonarCard is a digital business card built for trades and service businesses. Share your details instantly using one link, an NFC tap, or a QR code — no app needed.",
    },
    {
        tab: "getting-started",
        q: "How do I get started?",
        a: "Claim your KonarCard link in seconds, create your profile, and start sharing straight away. You can add your contact info, socials, website, reviews, or booking link.",
    },
    {
        tab: "getting-started",
        q: "Do I need to pay to start?",
        a: "No. You can claim your link and create a basic profile for free. Paid plans unlock extra features and physical NFC cards.",
    },
    {
        tab: "getting-started",
        q: "Who is KonarCard best for?",
        a: "It's ideal for electricians, plumbers, builders, landscapers, and any service businesses that want more calls, more quotes, and easier referrals.",
    },

    {
        tab: "cards-profiles",
        q: "How does the physical card work?",
        a: "KonarCard cards use NFC. When someone taps your card with their phone, your profile opens instantly. If NFC isn't supported, they can scan the QR code instead.",
    },
    {
        tab: "cards-profiles",
        q: "Can I update my profile anytime?",
        a: "Yes. Edit your details whenever you like and updates show instantly. No reprinting, no waiting.",
    },
    {
        tab: "cards-profiles",
        q: "What happens if I lose my card?",
        a: "Your profile stays live. You can order a replacement card and link it to the same profile without losing anything.",
    },
    {
        tab: "cards-profiles",
        q: "Does KonarCard work on all phones?",
        a: "Yes. It works on iPhone and Android. Most modern phones support NFC, and QR scanning works on any phone with a camera.",
    },
    {
        tab: "cards-profiles",
        q: "Can I add a booking link, WhatsApp, or reviews?",
        a: "Yes. You can add your preferred contact methods and links — including WhatsApp, website, Google reviews, quote forms, and more.",
    },

    {
        tab: "pricing",
        q: "What plans are available?",
        a: "There's a free plan to get started, plus paid plans for extra features and physical cards. See full details on the pricing page.",
    },
    {
        tab: "pricing",
        q: "Can I upgrade or downgrade later?",
        a: "Yes. You can change your plan anytime from your account dashboard.",
    },
    {
        tab: "pricing",
        q: "What happens if I cancel?",
        a: "If you cancel a paid plan, your profile stays accessible, but premium features will no longer be available.",
    },
    {
        tab: "pricing",
        q: "Do you offer refunds or replacements for cards?",
        a: "If there's a delivery or print issue, we'll make it right. For order help, message us via live chat.",
    },

    {
        tab: "teams",
        q: "Can I create cards for my team?",
        a: "Yes. Team plans let you manage multiple profiles under one account — perfect for companies, crews, and growing businesses.",
    },
    {
        tab: "teams",
        q: "Can I control what my team members can edit?",
        a: "Yes. Team setups can be managed from one place so branding and key details stay consistent.",
    },

    {
        tab: "support",
        q: "Do I need an app?",
        a: "No app needed. People tap the card or scan the QR code to open your profile instantly in their browser.",
    },
    {
        tab: "support",
        q: "The tap isn't working — what should I do?",
        a: "Make sure NFC is enabled and tap the card near the top/back of the phone. If the phone doesn't support NFC, use the QR code instead.",
    },
    {
        tab: "support",
        q: "How can I contact support?",
        a: "Use live chat — it's the fastest way to get help.",
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
                        Frequently <span className="khq__accent">Asked</span> Questions
                    </h2>

                    <p className="kc-subheading khq__sub">
                        Everything you need to know before getting started with KonarCard.
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
