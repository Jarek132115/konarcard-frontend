// frontend/src/components/home/HowItWorks.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../../styling/home/howitworks.css";

import Step1 from "../../assets/images/Step1.jpg";
import Step2 from "../../assets/images/Step2.jpg";
import Step3 from "../../assets/images/Step3.jpg";

export default function HowItWorks() {
    const steps = useMemo(
        () => [
            {
                step: "Step 1",
                title: "Claim Your Link",
                desc: "Secure your personal KonarCard link in seconds – no payment required.",
                img: Step1,
                alt: "Claim your KonarCard link on mobile",
            },
            {
                step: "Step 2",
                title: "Build Your Profile",
                desc: "Upload photos, list your services, add reviews and contact buttons in one place.",
                img: Step2,
                alt: "Build your KonarCard profile",
            },
            {
                step: "Step 3",
                title: "Share It Anywhere",
                desc: "Tap your card, send your link, or use a QR code – online or on site.",
                img: Step3,
                alt: "Share your KonarCard anywhere",
            },
        ],
        []
    );

    return (
        <section className="hiw" aria-label="Set up your profile in 3 simple steps">
            <div className="hiw__inner">
                <header className="hiw__head">
                    <p className="kc-pill hiw__kicker">3 Simple Steps</p>

                    {/* SECTION TITLE → H3 */}
                    <h2 className="h3 hiw__title">
                        Set Up Your <span className="hiw__accent">Profile</span> in{" "}
                        <span className="hiw__accent">Minutes.</span>
                    </h2>

                    {/* SUBHEADING */}
                    <p className="kc-subheading hiw__sub">
                        Add your work, reviews, and contact buttons - then share one simple link.
                    </p>
                </header>

                <ol className="hiw__grid">
                    {steps.map((s, idx) => (
                        <li className="hiw__card" key={idx}>
                            <div className="hiw__cardTop">
                                <span className="hiw__stepPill">{s.step}</span>

                                {/* ✅ DESKTOP TITLE (20px) */}
                                <h3 className="kc-title hiw__cardTitle">{s.title}</h3>

                                {/* BODY */}
                                <p className="body hiw__cardDesc">{s.desc}</p>
                            </div>

                            <div className="hiw__imgWrap">
                                <img src={s.img} alt={s.alt} className="hiw__img" loading="lazy" />
                            </div>
                        </li>
                    ))}
                </ol>

                <p className="body hiw__ctaDesc">
                    Ready to look more professional today?
                </p>

                <div className="hiw__cta">
                    <Link to="/register" className="kx-btn kx-btn--black">
                        Claim Your Link
                    </Link>

                    <Link to="/how-it-works" className="kx-btn kx-btn--white">
                        See How It Works
                    </Link>
                </div>
            </div>
        </section>
    );
}