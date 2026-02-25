// frontend/src/pages/website/pricingpage/PricingPageFAQ.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../../styling/fonts.css";
import "../../../styling/pricing.css";

export default function PricingPageFAQ() {
    const faqs = useMemo(
        () => [
            { q: "Do I need to pay upfront?", a: "No. Start on Free, then upgrade when it’s worth it. Paid plans bill on your chosen interval." },
            { q: "Can I cancel anytime?", a: "Yes. You can cancel or manage billing anytime from the Billing portal." },
            { q: "How does Teams pricing work?", a: "Teams uses the Plus plan as your base, then you add extra profiles for staff at £1.95 per extra profile per month." },
            { q: "What happens if my plan ends?", a: "You’ll stay on Free. Your link remains live — paid features simply pause until you re-subscribe." },
        ],
        []
    );

    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="pr-faq" aria-label="Pricing FAQs">
            <div className="pr-container">
                <div className="pr-sectionHead">
                    <div className="kc-pill pr-sectionPill">FAQs</div>
                    <h2 className="h3 pr-h2">Pricing FAQs</h2>
                    <p className="body-s pr-sectionSub">Quick answers before you commit.</p>
                </div>

                <div className="pr-faqList" role="region" aria-label="Pricing FAQs list">
                    {faqs.map((item, idx) => {
                        const isOpen = idx === openIndex;
                        return (
                            <div className="pr-faqItem" key={`${item.q}-${idx}`}>
                                <button
                                    type="button"
                                    className="pr-qRow"
                                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                                    aria-expanded={isOpen}
                                >
                                    <span className="kc-title pr-q">{item.q}</span>
                                    <span className={`pr-chev ${isOpen ? "is-open" : ""}`} aria-hidden="true">
                                        ▾
                                    </span>
                                </button>

                                {isOpen && <div className="body-s pr-a">{item.a}</div>}
                            </div>
                        );
                    })}
                </div>

                <div className="pr-faqHelp" aria-label="Need more help">
                    <p className="body-s pr-faqHelpText">Still got questions? We’re happy to help.</p>
                    <Link to="/contactus" className="kx-btn kx-btn--black">
                        Start Live Chat
                    </Link>
                </div>
            </div>
        </section>
    );
}