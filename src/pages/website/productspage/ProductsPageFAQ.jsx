// frontend/src/pages/website/productspage/ProductsPageFAQ.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import "../../../styling/fonts.css";
import "../../../styling/productspage/productspagefaq.css";

export default function ProductsPageFAQ() {
    const faqs = useMemo(
        () => [
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
                a: "Yes. Update your profile anytime and changes go live instantly — no reprints needed.",
            },
            {
                q: "What if someone’s phone doesn’t support NFC?",
                a: "No problem. Every card includes a QR code backup, so anyone can scan and open your profile.",
            },
            {
                q: "Can I use one profile across multiple NFC products?",
                a: "Yes. Your plastic card, metal card, and KonarTag can all link to the same KonarCard profile.",
            },
        ],
        []
    );

    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section className="kpfq" aria-label="Product frequently asked questions">
            <div className="kpfq__inner">
                <header className="kpfq__head">
                    <p className="kc-pill kpfq__kicker">FAQs</p>

                    <h2 className="h3 kpfq__title">Product FAQs</h2>

                    <p className="kc-subheading kpfq__sub">Quick answers before you order.</p>
                </header>

                <div className="kpfq__list" role="region" aria-label="Product FAQ list">
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