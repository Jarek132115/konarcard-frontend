import React from "react";
import { Link } from "react-router-dom";
import "../../styling/home/howitworks.css";

/*
  This section is purely UI (no functional form).
  It matches the screenshot style: big header + sub, 3 large cards with a
  "mock UI" panel on top and Step pill + title + description below.
*/

const steps = [
    {
        step: "Step 1",
        title: "Claim Your Link",
        desc: "Secure your KonarCard link in seconds. No payment required.",
        mock: {
            heading: "Claim Your Link",
            sub: "This is your unique link. When someone clicks it, they see your digital business card.",
            label: "Claim Your Link Name",
            value: "www.konarcard.com/u/ yourbusinessname",
            button: "Claim Link",
            foot: "Already have an account?",
            footLink: "Sign In",
        },
    },
    {
        step: "Step 2",
        title: "Build Your Profile",
        desc: "Add your services, photos, reviews, and contact details — all in one place.",
        mock: {
            heading: "Claim Your Link",
            sub: "This is your unique link. When someone clicks it, they see your digital business card.",
            label: "Claim Your Link Name",
            value: "www.konarcard.com/u/ yourbusinessname",
            button: "Claim Link",
            foot: "Already have an account?",
            footLink: "Sign In",
        },
    },
    {
        step: "Step 3",
        title: "Share It Anywhere",
        desc: "Tap your card, share your link, or use a QR code — online or in person.",
        mock: {
            heading: "Claim Your Link",
            sub: "This is your unique link. When someone clicks it, they see your digital business card.",
            label: "Claim Your Link Name",
            value: "www.konarcard.com/u/ yourbusinessname",
            button: "Claim Link",
            foot: "Already have an account?",
            footLink: "Sign In",
        },
    },
];

export default function HowItWorks() {
    return (
        <section className="kc-hiw section" aria-label="How it works">
            <div className="kc-hiw__inner">
                <div className="kc-hiw__header">
                    <h2 className="kc-hiw__title desktop-h2 text-center">How It Works</h2>
                    <p className="kc-hiw__sub desktop-body-s text-center">
                        Create your digital business card in minutes — no apps, no hassle.
                    </p>
                </div>

                <div className="kc-hiw__grid">
                    {steps.map((s, idx) => (
                        <div className="kc-hiw__card" key={idx}>
                            {/* Mock UI panel */}
                            <div className="kc-hiw__mock">
                                <div className="kc-hiw__mockTop">
                                    <h3 className="kc-hiw__mockTitle">{s.mock.heading}</h3>
                                    <p className="kc-hiw__mockSub">{s.mock.sub}</p>
                                </div>

                                <div className="kc-hiw__mockForm">
                                    <div className="kc-hiw__mockLabel">{s.mock.label}</div>
                                    <div className="kc-hiw__mockInput" aria-hidden="true">
                                        {s.mock.value}
                                    </div>

                                    <div className="kc-hiw__mockNote">Free to claim. No payment needed.</div>

                                    <div className="kc-hiw__mockBtnRow">
                                        <button type="button" className="kc-hiw__mockBtn" aria-hidden="true">
                                            {s.mock.button}
                                        </button>
                                    </div>

                                    <div className="kc-hiw__mockFoot">
                                        <span>{s.mock.foot}</span>{" "}
                                        <span className="kc-hiw__mockFootLink">{s.mock.footLink}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step info */}
                            <div className="kc-hiw__stepPill">{s.step}</div>
                            <h3 className="kc-hiw__stepTitle">{s.title}</h3>
                            <p className="kc-hiw__stepDesc">{s.desc}</p>

                            {/* Optional CTA on last card (subtle) */}
                            {idx === 2 && (
                                <div className="kc-hiw__miniCta">
                                    <Link to="/register" className="kc-hiw__miniLink">
                                        Get started →
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
