import React from "react";
import { Link } from "react-router-dom";
import "../../styling/home/value.css";

/*
  HOME — VALUE SECTION
  Matches screenshot:
  - Title + subtitle centered
  - 6 cards (3x2) with orange icon box, bold title, muted description
  - Single centered orange CTA button
*/

function IconPhone() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M9 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.95"
            />
            <path d="M10 6h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            <path d="M11 19h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        </svg>
    );
}

function IconImage() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.95"
            />
            <path
                d="M7 14l2-2 3 3 2-2 3 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.75"
            />
            <path
                d="M9 9.2a1.2 1.2 0 1 0 0 .1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.7"
            />
        </svg>
    );
}

function IconChat() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M7 9h10M7 13h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.75"
            />
            <path
                d="M21 12a7 7 0 0 1-7 7H8l-5 2 2-5v-4a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7Z"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.95"
            />
        </svg>
    );
}

function IconEdit() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-1.2-1.2a2 2 0 0 0-2.8 0L4 16v4Z"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.95"
            />
            <path d="M13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </svg>
    );
}

function IconHardhat() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M5 16v-3a7 7 0 0 1 14 0v3"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.95"
            />
            <path
                d="M4 16h16a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a1 1 0 0 1 1-1Z"
                stroke="currentColor"
                strokeWidth="2"
                opacity="0.8"
            />
            <path d="M12 6v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
    );
}

function IconSpark() {
    return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 2l1.2 4.4L18 8l-4.8 1.6L12 14l-1.2-4.4L6 8l4.8-1.6L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                opacity="0.95"
            />
            <path
                d="M19 13l.7 2.3 2.3.7-2.3.7L19 19l-.7-2.3-2.3-.7 2.3-.7L19 13Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                opacity="0.75"
            />
        </svg>
    );
}

export default function Value() {
    const items = [
        {
            icon: <IconPhone />,
            title: "One job pays for everything",
            desc: "Land one extra job and it covers your card and profile.",
        },
        {
            icon: <IconImage />,
            title: "No reprints, ever",
            desc: "Update your details anytime without reordering cards.",
        },
        {
            icon: <IconChat />,
            title: "Always up to date",
            desc: "Your latest work, reviews, and services — instantly.",
        },
        {
            icon: <IconEdit />,
            title: "Works everywhere",
            desc: "In person, online, on any phone. No apps needed.",
        },
        {
            icon: <IconHardhat />,
            title: "Built for real trades",
            desc: "Simple, practical, and made for how you actually work.",
        },
        {
            icon: <IconSpark />,
            title: "Looks professional fast",
            desc: "Instantly builds trust before you even speak.",
        },
    ];

    return (
        <section className="kc-value section" aria-label="Why KonarCard is worth it">
            <div className="kc-value__inner">
                <div className="kc-value__header">
                    <h2 className="kc-value__title desktop-h2 text-center">Why KonarCard Is Worth It</h2>
                    <p className="kc-value__sub desktop-body-s text-center">Built for trades — not corporate networking.</p>
                </div>

                <div className="kc-value__grid">
                    {items.map((it, i) => (
                        <div className="kc-value__card" key={i}>
                            <div className="kc-value__icon">{it.icon}</div>
                            <h3 className="kc-value__cardTitle">{it.title}</h3>
                            <p className="kc-value__cardDesc">{it.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="kc-value__cta">
                    <Link to="/examples" className="kc-value__btn">
                        See real profile examples
                    </Link>
                </div>
            </div>
        </section>
    );
}
