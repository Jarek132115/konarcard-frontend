// frontend/src/pages/website/pricingpage/PricingPageFAQ.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

import "../../../styling/fonts.css";
import "../../../styling/productspage/productspagefaq.css";
import "../../../styling/pricingpage/pricingpagefaq.css";

const EASE = [0.22, 1, 0.36, 1];

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

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
            <path d="M2.5 5L7 9.5L11.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

const FAQS = [
    {
        q: "Do I need to pay upfront?",
        a: "No. Start on Free, then upgrade when it's worth it. Paid plans bill monthly or yearly — whichever you choose.",
    },
    {
        q: "Can I cancel anytime?",
        a: "Yes. You can cancel or manage billing anytime from the Billing portal. No contracts, no penalties.",
    },
    {
        q: "How does Teams pricing work?",
        a: "Teams uses the Plus plan as your base at £5/month, then you add extra profiles for staff at £2 per extra profile per month. Example: 3 profiles = £9/month.",
    },
    {
        q: "What's the difference between Plus and Teams?",
        a: "Plus is everything you need for a single profile — full customisation, analytics, and no branding. Teams adds the ability to manage multiple staff profiles from one account, each at £2/month extra.",
    },
    {
        q: "What happens if my plan ends?",
        a: "You'll stay on Free. Your KonarCard link stays live — paid features simply pause until you re-subscribe.",
    },
    {
        q: "Can I switch plans later?",
        a: "Yes. You can upgrade, downgrade, or manage your subscription anytime from the Billing portal.",
    },
];

export default function PricingPageFAQ() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="kpfq kpfq--pricing" aria-label="Pricing frequently asked questions">
            <div className="kpfq__inner">
                <motion.header className="kpfq__head" {...fadeUpInView(0)}>
                    <p className="kc-pill kpfq__kicker">FAQs</p>
                    <h2 className="h3 kpfq__title">Pricing FAQs</h2>
                    <p className="kc-subheading kpfq__sub">Quick answers before you commit.</p>
                </motion.header>

                <motion.div
                    className="kpfq__list"
                    role="region"
                    aria-label="Pricing FAQ list"
                    {...fadeUpInView(0.1)}
                >
                    {FAQS.map((item, idx) => {
                        const isOpen = idx === openIndex;
                        return (
                            <div className="kpfq__item" key={item.q}>
                                <button
                                    type="button"
                                    className="kpfq__qRow"
                                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                                    aria-expanded={isOpen}
                                >
                                    <span className="kpfq__q">{item.q}</span>
                                    <span className={`kpfq__chev${isOpen ? " is-open" : ""}`} aria-hidden="true">
                                        <ChevronIcon />
                                    </span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="answer"
                                            className="body kpfq__a"
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

                <motion.div className="kpfq__cta" {...fadeUpInView(0.15)}>
                    <p className="body-s kpfq__ctaText">Still got questions? We're happy to help.</p>
                    <div className="kpfq__ctaBtns">
                        <Link to="/contactus" className="kx-btn kx-btn--black">
                            Start Live Chat
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
