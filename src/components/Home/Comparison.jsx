// frontend/src/components/home/Comparison.jsx
import React from "react";
import "../../styling/home/comparison.css";

function CheckIcon() {
    return (
        <span className="kc-comp__icon kc-comp__icon--good" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" opacity="0.22" />
                <path
                    d="M6.1 10.3l2.2 2.3 5.7-6"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
}

function XIcon() {
    return (
        <span className="kc-comp__icon kc-comp__icon--bad" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" opacity="0.22" />
                <path
                    d="M6.9 6.9l6.2 6.2M13.1 6.9l-6.2 6.2"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                />
            </svg>
        </span>
    );
}

export default function Comparison() {
    const konar = [
        "One link that never gets lost",
        "Always up to date — edit anytime",
        "Photos, reviews, and proof of work built in",
        "Share instantly by tap, QR, or message",
        "Looks premium and builds trust fast",
        "No reprinting costs — ever",
    ];

    const paper = [
        "Get lost, damaged, or thrown away",
        "Run out when you need them most",
        "Outdated details mean missed jobs",
        "No photos, reviews, or proof of work",
        "Hard to share online or on the spot",
        "Cost money every time you reprint",
    ];

    return (
        <section className="kc-comp" aria-labelledby="kc-comp-title">
            <div className="kc-comp__inner">
                <header className="kc-comp__header">
                    <p className="kc-comp__kicker">The upgrade</p>

                    <h2 id="kc-comp-title" className="h3 kc-comp__title text-center">
                        Paper business cards don’t
                        <br />
                        work like they used to
                    </h2>

                    <p className="body-s kc-comp__sub text-center">
                        They get lost, go out of date, and don’t show the quality of your work.
                        KonarCard gives you a digital business card that’s always ready to share.
                    </p>
                </header>

                <div className="kc-comp__grid" role="list" aria-label="Comparison: KonarCard vs paper business cards">
                    {/* Konar */}
                    <article className="kc-comp__card kc-comp__card--good" role="listitem" aria-label="KonarCard benefits">
                        <div className="kc-comp__cardHead">
                            <div className="kc-comp__cardTitle">
                                <span className="kc-comp__brand">KonarCard</span>
                                <span className="kc-comp__badge kc-comp__badge--good" aria-label="Recommended">
                                    ✓
                                </span>
                            </div>
                            <p className="kc-comp__hint">A modern profile that sells your work.</p>
                        </div>

                        <ul className="kc-comp__list" aria-label="KonarCard features">
                            {konar.map((t, i) => (
                                <li key={i} className="kc-comp__row">
                                    <CheckIcon />
                                    <span className="body-s kc-comp__rowText">{t}</span>
                                </li>
                            ))}
                        </ul>
                    </article>

                    {/* Paper */}
                    <article className="kc-comp__card kc-comp__card--bad" role="listitem" aria-label="Paper business card limitations">
                        <div className="kc-comp__cardHead">
                            <div className="kc-comp__cardTitle">
                                <span className="kc-comp__brand">Paper Business Cards</span>
                                <span className="kc-comp__badge kc-comp__badge--bad" aria-label="Not recommended">
                                    ✕
                                </span>
                            </div>
                            <p className="kc-comp__hint">Old-school, easy to lose, hard to trust.</p>
                        </div>

                        <ul className="kc-comp__list" aria-label="Paper business card drawbacks">
                            {paper.map((t, i) => (
                                <li key={i} className="kc-comp__row">
                                    <XIcon />
                                    <span className="body-s kc-comp__rowText">{t}</span>
                                </li>
                            ))}
                        </ul>
                    </article>
                </div>
            </div>
        </section>
    );
}
