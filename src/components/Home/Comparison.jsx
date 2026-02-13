// frontend/src/components/Home/Comparison.jsx
import React, { useMemo } from "react";
import "../../styling/home/comparison.css";

import PricingTick from "../../assets/icons/PricingTick.svg";
import XTick from "../../assets/icons/XTick.svg";

function TickIcon() {
    return (
        <span className="kc-comp__icon kc-comp__icon--good" aria-hidden="true">
            <img className="kc-comp__iconImg kc-comp__iconImg--white" src={PricingTick} alt="" loading="lazy" />
        </span>
    );
}

function XIcon() {
    return (
        <span className="kc-comp__icon kc-comp__icon--bad" aria-hidden="true">
            <img className="kc-comp__iconImg kc-comp__iconImg--red" src={XTick} alt="" loading="lazy" />
        </span>
    );
}

export default function Comparison() {
    const konar = useMemo(
        () => [
            "One link that never goes missing",
            "Update your details anytime (no reprints)",
            "Show photos, reviews, and proof of work",
            "Instant sharing by NFC tap, QR, or link",
            "Looks premium and builds trust faster",
            "Works everywhere in person or online",
        ],
        []
    );

    const paper = useMemo(
        () => [
            "Gets lost, damaged, or binned",
            "Runs out when you need it",
            "Outdated details = missed jobs",
            "No photos, reviews, or proof",
            "Awkward to share online",
            "Costs money every reprint",
        ],
        []
    );

    return (
        <section className="kc-comp" aria-labelledby="kc-comp-title">
            <div className="kc-comp__inner">
                <header className="kc-comp__header">
                    <p className="kc-pill kc-comp__kicker">The upgrade</p>

                    <h2 id="kc-comp-title" className="h3 kc-comp__title">
                        Ditch paper and win trust <span className="kc-comp__accent">faster</span>
                    </h2>

                    <p className="body kc-comp__sub">
                        Paper cards get lost and go out of date. KonarCard keeps your details, work, and reviews in one link, ready to share
                        instantly.
                    </p>
                </header>

                <div className="kc-comp__grid" role="list" aria-label="Comparison: KonarCard vs paper business cards">
                    {/* Konar */}
                    <article className="kc-comp__card kc-comp__card--good" role="listitem" aria-label="KonarCard benefits">
                        <div className="kc-comp__cardHead">
                            <div className="kc-comp__cardTitle">
                                <span className="kc-comp__brand">KonarCard</span>
                            </div>
                            <p className="kc-comp__hint">A modern profile that sells your work.</p>
                        </div>

                        <ul className="kc-comp__list" aria-label="KonarCard features">
                            {konar.map((t, i) => (
                                <li key={i} className="kc-comp__row">
                                    <TickIcon />
                                    <span className="kc-comp__rowText">{t}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="kc-comp__foot kc-comp__foot--good" aria-hidden="true">
                            Share in seconds. Look legit instantly.
                        </div>
                    </article>

                    {/* Paper */}
                    <article className="kc-comp__card kc-comp__card--bad" role="listitem" aria-label="Paper business card limitations">
                        <div className="kc-comp__cardHead">
                            <div className="kc-comp__cardTitle">
                                <span className="kc-comp__brand">Paper Business Cards</span>
                            </div>
                            <p className="kc-comp__hint">Old-school, easy to lose, hard to trust.</p>
                        </div>

                        <ul className="kc-comp__list" aria-label="Paper business card drawbacks">
                            {paper.map((t, i) => (
                                <li key={i} className="kc-comp__row">
                                    <XIcon />
                                    <span className="kc-comp__rowText">{t}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="kc-comp__foot kc-comp__foot--bad" aria-hidden="true">
                            Fine for 2012. Not great today.
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
