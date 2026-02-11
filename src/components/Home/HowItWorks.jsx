// frontend/src/components/home/HowItWorks.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../../styling/home/howitworks.css";

const steps = [
    {
        step: "Step 1",
        title: "Claim Your Link",
        desc: "Secure your KonarCard link in seconds. No payment required.",
    },
    {
        step: "Step 2",
        title: "Build Your Profile",
        desc: "Add your services, photos, reviews, and contact details — all in one place.",
    },
    {
        step: "Step 3",
        title: "Share It Anywhere",
        desc: "Tap your card, share your link, or use a QR code — online or in person.",
    },
];

function PlaceholderMock({ label }) {
    return (
        <div className="hiw-mock" aria-hidden="true">
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

                <div className="hiw-mock__phHint">{label}</div>
            </div>
        </div>
    );
}

export default function HowItWorks() {
    return (
        <section className="hiw" aria-label="How KonarCard works in 3 steps">
            <div className="hiw__inner">
                <header className="hiw__head">
                    <p className="hiw__kicker">3 steps</p>
                    <h2 className="h3 hiw__title">How it works</h2>
                    <p className="body-s hiw__sub">
                        Create your digital business card in minutes — no apps, no hassle.
                    </p>
                </header>

                <ol className="hiw__grid" aria-label="Step-by-step setup">
                    {steps.map((s, idx) => (
                        <li className="hiw__card" key={idx}>
                            <PlaceholderMock label={s.title} />

                            <div className="hiw__stepRow">
                                <div className="hiw__stepPill">{s.step}</div>
                            </div>

                            {/* ✅ NEW WRAPPER */}
                            <div className="hiw__content">
                                <h3 className="h5 hiw__stepTitle">{s.title}</h3>
                                <p className="body-s hiw__stepDesc">{s.desc}</p>
                            </div>

                        </li>
                    ))}
                </ol>

                <div className="hiw__cta">
                    <Link to="/register" className="hiw__btn hiw__btn--primary">
                        Claim your link
                    </Link>
                    <Link to="/products" className="hiw__btn hiw__btn--ghost">
                        Shop cards
                    </Link>
                </div>
            </div>
        </section>
    );
}
