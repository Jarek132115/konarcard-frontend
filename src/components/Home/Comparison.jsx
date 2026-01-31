import React from "react";
import "../../styling/home/comparison.css";

function CheckIcon() {
    return (
        <span className="kc-comp__icon kc-comp__icon--good" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" opacity="0.28" />
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
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" opacity="0.28" />
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
        <section className="kc-comp section" aria-label="KonarCard vs Paper Business Cards">
            <div className="kc-comp__inner">
                <div className="kc-comp__header">
                    <h2 className="kc-comp__title desktop-h2 text-center">
                        Paper Business Cards Don’t
                        <br />
                        Work Like They Used To
                    </h2>
                    <p className="kc-comp__sub desktop-body-s text-center">
                        They get lost, go out of date, and don’t show the quality of your work.
                    </p>
                </div>

                <div className="kc-comp__grid">
                    {/* Konar */}
                    <div className="kc-comp__card kc-comp__card--good">
                        <div className="kc-comp__cardHead">
                            <div className="kc-comp__cardTitle">
                                <span className="kc-comp__brand">KonarCard</span>
                                <span className="kc-comp__badge kc-comp__badge--good" aria-label="Good">
                                    ✓
                                </span>
                            </div>
                            <div className="kc-comp__hint">A modern profile that sells your work.</div>
                        </div>

                        <ul className="kc-comp__list">
                            {konar.map((t, i) => (
                                <li key={i} className="kc-comp__row">
                                    <CheckIcon />
                                    <span className="kc-comp__rowText desktop-body-s">{t}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Paper */}
                    <div className="kc-comp__card kc-comp__card--bad">
                        <div className="kc-comp__cardHead">
                            <div className="kc-comp__cardTitle">
                                <span className="kc-comp__brand">Paper Business Cards</span>
                                <span className="kc-comp__badge kc-comp__badge--bad" aria-label="Bad">
                                    ✕
                                </span>
                            </div>
                            <div className="kc-comp__hint">Old-school, easy to lose, hard to trust.</div>
                        </div>

                        <ul className="kc-comp__list">
                            {paper.map((t, i) => (
                                <li key={i} className="kc-comp__row">
                                    <XIcon />
                                    <span className="kc-comp__rowText desktop-body-s">{t}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
