// frontend/src/pages/website/productspage/ProductsPageFAQ.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

import "../../../styling/fonts.css";
import "../../../styling/productspage/productspagefaq.css";

const faqs = [
    {
        q: "Do NFC business cards work on iPhone and Android?",
        a: "Yes. KonarCard works on iPhone and Android. Most modern phones support NFC. QR works on any phone with a camera.",
    },
    {
        q: "Do customers need an app to use an NFC business card?",
        a: "No app needed. People tap the card or scan the QR code to open your profile instantly in their browser.",
    },
    {
        q: "Can I update my digital business card after ordering?",
        a: "Yes. Update your profile anytime and changes go live instantly. No reprints needed.",
    },
    {
        q: "What if someone's phone doesn't support NFC?",
        a: "No problem. Every card includes a QR code backup, so anyone can scan and open your profile.",
    },
    {
        q: "Can I have more than one card linked to my profile?",
        a: "Yes. You can order multiple KonarCards in different colours, all linked to the same digital profile. Hand one out, keep one as a spare, or give one to a team member.",
    },
];

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

export default function ProductsPageFAQ() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="kpfq" aria-label="Product frequently asked questions">
            <div className="kpfq__inner">

                <motion.header
                    className="kpfq__head"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <p className="kc-pill kpfq__kicker">FAQs</p>
                    <h2 className="h3 kpfq__title">Product FAQs</h2>
                    <p className="kc-subheading kpfq__sub">
                        Quick answers before you order.
                    </p>
                </motion.header>

                {/* FAQ List */}
                <div
                    className="kpfq__list"
                    role="list"
                    aria-label="Product FAQ list"
                >
                    {faqs.map((item, idx) => {
                        const isOpen = idx === openIndex;
                        const answerId = `kpfq-answer-${idx}`;

                        return (
                            <motion.div
                                key={item.q}
                                className="kpfq__item"
                                role="listitem"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-30px" }}
                                transition={{
                                    duration: 0.4,
                                    delay: idx * 0.055,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                <button
                                    type="button"
                                    className={`kpfq__qRow${isOpen ? " is-open" : ""}`}
                                    onClick={() =>
                                        setOpenIndex(isOpen ? -1 : idx)
                                    }
                                    aria-expanded={isOpen}
                                    aria-controls={answerId}
                                >
                                    <span className="kpfq__q">{item.q}</span>

                                    <span
                                        className={`kpfq__chev${isOpen ? " is-open" : ""}`}
                                    >
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
                                            animate={{
                                                height: "auto",
                                                opacity: 1,
                                            }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{
                                                duration: 0.28,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
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
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <p className="kpfq__ctaText">
                        Still got questions? We're happy to help.
                    </p>

                    <Link to="/contactus" className="kx-btn kx-btn--black">
                        Start Live Chat
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
