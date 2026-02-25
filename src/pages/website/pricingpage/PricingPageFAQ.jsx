// frontend/src/pages/website/pricingpage/PricingPageFAQ.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "../../../styling/fonts.css";

/* ✅ Reuse Product FAQ system 1:1 */
import "../../../styling/productspage/productspagefaq.css";

export default function PricingPageFAQ() {
    const faqs = useMemo(
        () => [
            {
                q: "Do I need to pay upfront?",
                a: "No. Start on Free, then upgrade when it’s worth it. Paid plans bill on your chosen interval.",
            },
            {
                q: "Can I cancel anytime?",
                a: "Yes. You can cancel or manage billing anytime from the Billing portal.",
            },
            {
                q: "How does Teams pricing work?",
                a: "Teams uses the Plus plan as your base, then you add extra profiles for staff at £1.95 per extra profile per month.",
            },
            {
                q: "What happens if my plan ends?",
                a: "You’ll stay on Free. Your link remains live — paid features simply pause until you re-subscribe.",
            },
            {
                q: "Can I switch plans later?",
                a: "Yes. You can upgrade, downgrade, or manage your subscription from the Billing portal anytime.",
            },
        ],
        []
    );

    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="kpfq" aria-label="Pricing frequently asked questions">
            <div className="kpfq__inner">
                <header className="kpfq__head">
                    <p className="kc-pill kpfq__kicker">FAQs</p>

                    <h2 className="h3 kpfq__title">Pricing FAQs</h2>

                    <p className="kc-subheading kpfq__sub">Quick answers before you commit.</p>
                </header>

                <div className="kpfq__list" role="region" aria-label="Pricing FAQ list">
                    {faqs.map((item, idx) => {
                        const isOpen = idx === openIndex;

                        return (
                            <div className="kpfq__item" key={`${item.q}-${idx}`}>
                                <button
                                    type="button"
                                    className="kpfq__qRow"
                                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                                    aria-expanded={isOpen}
                                >
                                    <span className="kc-title kpfq__q">{item.q}</span>

                                    <span className={`kpfq__chev ${isOpen ? "is-open" : ""}`} aria-hidden="true">
                                        ▾
                                    </span>
                                </button>

                                {isOpen && <div className="body kpfq__a">{item.a}</div>}
                            </div>
                        );
                    })}
                </div>

                <div className="kpfq__cta">
                    <p className="body-s kpfq__ctaText">Still got questions? We’re happy to help.</p>

                    <div className="kpfq__ctaBtns">
                        <Link to="/contactus" className="kx-btn kx-btn--black">
                            Start Live Chat
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}