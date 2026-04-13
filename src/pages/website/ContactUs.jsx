// frontend/src/pages/website/ContactUs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useKonarToast } from "../../hooks/useKonarToast";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";

import "../../styling/fonts.css";
import "../../styling/contactus.css";

import { useSeo } from "../../utils/seo";

import ContactIcon from "../../assets/icons/ChatIcon.svg";
import ChatIcon from "../../assets/icons/Contact-Interface.svg";

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

const quickAnswers = [
    {
        q: "How quickly do you reply?",
        a: "Live chat during working hours is the fastest way to get help. If you email us, we aim to reply within one working day.",
    },
    {
        q: "Can you help me set up my profile?",
        a: "Yes. Live chat is best for this. We'll guide you step by step.",
    },
    {
        q: "Do I need an account to contact you?",
        a: "No. Anyone can contact us.",
    },
    {
        q: "Is it okay to finish my profile later?",
        a: "Yes. You can claim your link first and complete your profile later.",
    },
    {
        q: "Is there a phone number I can call?",
        a: "We don't offer phone support at the moment. Live chat and email are the quickest options.",
    },
    {
        q: "What should I do if something isn't working?",
        a: "Use live chat and include a screenshot if possible. It helps us fix things faster.",
    },
];

export default function ContactUs() {
    const toast = useKonarToast();
    const [openIndex, setOpenIndex] = useState(0);

    useSeo({
        path: "/contactus",
        title: "Contact KonarCard | Live Chat & Email Support",
        description:
            "Get in touch with the KonarCard team. Live chat during working hours or email supportteam@konarcard.com. Replies within one working day.",
    });

    useEffect(() => {
        if (localStorage.getItem("openChatOnLoad") !== "1") return;

        const started = Date.now();
        const tryOpen = () => {
            const ready =
                typeof window !== "undefined" &&
                window.tidioChatApi &&
                typeof window.tidioChatApi.open === "function";

            if (ready) {
                localStorage.removeItem("openChatOnLoad");
                window.tidioChatApi.open();
            } else if (Date.now() - started < 5000) {
                setTimeout(tryOpen, 200);
            }
        };

        tryOpen();
    }, []);

    const openChat = () => {
        const started = Date.now();

        const tryOpen = () => {
            const ready =
                typeof window !== "undefined" &&
                window.tidioChatApi &&
                typeof window.tidioChatApi.open === "function";

            if (ready) window.tidioChatApi.open();
            else if (Date.now() - started < 5000) setTimeout(tryOpen, 200);
            else toast.error("Live chat is still loading. Please try again in a moment.");
        };

        tryOpen();
    };

    return (
        <>
            <Navbar />

            <main className="kcon-page kc-page">

                {/* ── HERO ─────────────────────────────────────── */}
                <section className="kcon-hero" aria-labelledby="kcon-title">
                    <div className="kcon-container">

                        {/* Heading block with grid bg */}
                        <div className="kcon-head">
                            <div className="kcon-gridBg" aria-hidden="true" />

                            <motion.div className="kcon-headContent" {...fadeUp(0)}>
                                <p className="kc-pill kcon-kicker">Contact</p>

                                <h1 id="kcon-title" className="h2 kcon-title">
                                    Get in <span className="kcon-accent">Touch</span>
                                </h1>

                                <p className="kc-subheading kcon-sub">
                                    Got a question about your order or your KonarCard profile? We will get back to you quickly.
                                </p>
                            </motion.div>
                        </div>

                        {/* Contact cards, below the grid bg, solid white bg */}
                        <div
                            className="kcon-cards"
                            role="list"
                            aria-label="Contact options"
                        >
                            {/* LIVE CHAT */}
                            <motion.article
                                className="kcon-card"
                                role="listitem"
                                {...fadeUp(0.1)}
                            >
                                <div className="kcon-iconWrap" aria-hidden="true">
                                    <img className="kcon-icon" src={ContactIcon} alt="" />
                                </div>

                                <div className="kcon-cardBody">
                                    <p className="kcon-cardTitle">Live chat (fastest)</p>
                                    <p className="kcon-cardText">
                                        Quick help during working hours. Best for setup questions and fixes.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="kx-btn kx-btn--black kcon-cardBtn"
                                    onClick={openChat}
                                >
                                    Start live chat
                                </button>

                                <p className="kcon-cardHint">
                                    Tip: Include a screenshot if something isn't working.
                                </p>
                            </motion.article>

                            {/* EMAIL */}
                            <motion.article
                                className="kcon-card"
                                role="listitem"
                                {...fadeUp(0.18)}
                            >
                                <div className="kcon-iconWrap" aria-hidden="true">
                                    <img className="kcon-icon" src={ChatIcon} alt="" />
                                </div>

                                <div className="kcon-cardBody">
                                    <p className="kcon-cardTitle">Email</p>
                                    <p className="kcon-cardText">
                                        We aim to reply within one working day with helpful and clear guidance.
                                    </p>
                                </div>

                                <a
                                    href="mailto:supportteam@konarcard.com"
                                    className="kx-btn kx-btn--white kcon-cardBtn kcon-cardBtn--outlined"
                                >
                                    Send email
                                </a>

                                <p className="kcon-cardHint">
                                    Best for non-urgent questions and partnerships.
                                </p>
                            </motion.article>
                        </div>
                    </div>
                </section>

                {/* ── QUICK ANSWERS ─────────────────────────────── */}
                <section className="kcon-faq" aria-label="Quick answers">
                    <div className="kcon-faqInner">

                        <motion.header className="kcon-faqHead" {...fadeUpInView(0)}>
                            <p className="kc-pill kcon-faqKicker">Quick answers</p>
                            <h2 className="h3 kcon-faqTitle">Quick answers</h2>
                            <p className="kc-subheading kcon-faqSub">
                                Common questions people ask before reaching out.
                            </p>
                        </motion.header>

                        <div
                            className="kcon-faqList"
                            role="list"
                            aria-label="Contact FAQs"
                        >
                            {quickAnswers.map((item, idx) => {
                                const isOpen = idx === openIndex;
                                const answerId = `kcon-answer-${idx}`;

                                return (
                                    <motion.div
                                        key={item.q}
                                        className="kcon-faqItem"
                                        role="listitem"
                                        {...fadeInView(idx * 0.05)}
                                    >
                                        <button
                                            type="button"
                                            className="kcon-faqQRow"
                                            onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                                            aria-expanded={isOpen}
                                            aria-controls={answerId}
                                        >
                                            <span className="kcon-faqQ">{item.q}</span>

                                            <span className={`kcon-faqChev${isOpen ? " is-open" : ""}`}>
                                                <ChevronIcon />
                                            </span>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    id={answerId}
                                                    className="kcon-faqAWrap"
                                                    role="region"
                                                    aria-label={item.q}
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.28, ease: EASE }}
                                                    style={{ overflow: "hidden" }}
                                                >
                                                    <p className="kcon-faqA">{item.a}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div
                            className="kcon-faqCta"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-30px" }}
                            transition={{ duration: 0.4, ease: EASE }}
                        >
                            <Link to="/faqs" className="kx-btn kx-btn--black">
                                Read more FAQs
                            </Link>
                        </motion.div>
                    </div>
                </section>

            </main>

            <Footer />
        </>
    );
}
