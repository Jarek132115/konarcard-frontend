// frontend/src/pages/website/pricingpage/PricingPageWho.jsx
import React, { useMemo } from "react";
import "../../../styling/fonts.css";
import "../../../styling/pricing.css";

/* ✅ Reuse the same images you used in CustomerTrust */
import TrustSection2 from "../../../assets/images/TrustSection2.jpg";
import TrustSection5 from "../../../assets/images/TrustSection5.jpg";
import TrustSection6 from "../../../assets/images/TrustSection6.jpg";

export default function PricingPageWho() {
    const cards = useMemo(
        () => [
            {
                title: "Free",
                desc: "Perfect if you just want your link, contact buttons, and a clean profile.",
                img: TrustSection2,
                alt: "KonarCard free plan preview",
            },
            {
                title: "Plus",
                desc: "Best for higher limits, better presentation, and deeper analytics.",
                img: TrustSection5,
                alt: "KonarCard plus plan preview",
            },
            {
                title: "Teams",
                desc: "Start with Plus, then add extra staff profiles as you grow.",
                img: TrustSection6,
                alt: "KonarCard teams plan preview",
            },
        ],
        []
    );

    return (
        <section className="kht pr-who" aria-label="Who each plan is for">
            <div className="kht__inner">
                <header className="kht__head">
                    <p className="kc-pill kht__kicker">Plans</p>

                    <h2 className="h3 kht__title">
                        Who each <span className="kht__accent">plan</span> is for
                    </h2>

                    <p className="kc-subheading kht__sub">Pick the plan that fits your day-to-day.</p>
                </header>

                <div className="kht__grid" role="list" aria-label="Plan fit cards">
                    {cards.map((c) => (
                        <article key={c.title} className="kht__card pr-whoCard" role="listitem">
                            <div className="kht__copy">
                                <h3 className="kc-title kht__cardTitle">{c.title}</h3>
                                <p className="body kht__cardDesc">{c.desc}</p>
                            </div>

                            <div className="kht__imgWrap" aria-hidden="true">
                                <img className="kht__img" src={c.img} alt={c.alt} loading="lazy" decoding="async" />
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}