// frontend/src/components/home/HowItWorks.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../../styling/home/howitworks.css";

const steps = [
    {
        step: "Step 1",
        title: "Claim Your Link",
        desc: "Reserve your KonarCard link in seconds — start sharing right away.",
    },
    {
        step: "Step 2",
        title: "Build Your Profile",
        desc: "Add services, photos, reviews, and contact details in one place.",
    },
    {
        step: "Step 3",
        title: "Share It Anywhere",
        desc: "Share by NFC tap, QR code, or link — online or in person.",
    },
];

function PlaceholderMock({ label }) {
    return (
        <div className="hiw-media" aria-hidden="true">
            <span className="hiw-pill">{label}</span>

            <div className="hiw-mock">
                <div className="hiw-mock__top">
                    <div className="hiw-mock__window">
                        <span />
                        <span />
                        <span />
                    </div>
                    <div className="hiw-mock__phTitle" />
                    <div className="hiw-mock__phSub" />
                </div>

                <div className="hiw-mock__body">
                    <div className="hiw-mock__phBlock hiw-mock__phBlock--lg" />
                    <div className="hiw-mock__phBlock" />
                    <div className="hiw-mock__phBlock" />
                    <div className="hiw-mock__phRow">
                        <div className="hiw-mock__phPill" />
                        <div className="hiw-mock__phPill" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function HowItWorks() {
    return (
        <section className="hiw" aria-label="How KonarCard works in 3 simple steps">
            <div className="hiw__inner">
                <header className="hiw__head">
                    <p className="kc-pill hiw__kicker">3 simple steps</p>

                    <h2 className="h3 hiw__title">
                        Create Your <span className="hiw-accent">Digital Card</span> in Minutes
                    </h2>

                    {/* ✅ Shortened subtitle */}
                    <p className="body-s hiw__sub">
                        Set up once, customise your profile, and share instantly — no apps needed.
                    </p>
                </header>

                <ol className="hiw__grid" aria-label="Step-by-step setup">
                    {steps.map((s, idx) => (
                        <li className="hiw__card" key={idx}>
                            <PlaceholderMock label={s.step} />

                            <div className="hiw__body">
                                <h3 className="h6 hiw__stepTitle">{s.title}</h3>
                                <p className="body-s hiw__stepDesc">{s.desc}</p>
                            </div>
                        </li>
                    ))}
                </ol>

                {/* ✅ NEW short supporting line above CTA */}
                <p className="body-s hiw__ctaDesc">
                    Ready to get your own KonarCard link and start sharing today?
                </p>

                <div className="hiw__cta">
                    <Link to="/register" className="kx-btn kx-btn--black">
                        Claim your link
                    </Link>

                    <Link to="/how-it-works" className="kx-btn kx-btn--white">
                        Watch how it works
                    </Link>
                </div>
            </div>
        </section>
    );
}
