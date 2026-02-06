// frontend/src/components/home/HowItWorks.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../../styling/home/howitworks.css";

/*
  HOME — HOW IT WORKS (Upgraded)
  - Same “Droxy-ish” vibe as Products/Pricing pages (tokens + spacing)
  - 3 cards with a polished mock UI top + step pill + copy
  - Each step has a DIFFERENT mock (not repeated)
*/

const steps = [
    {
        step: "Step 1",
        title: "Claim Your Link",
        desc: "Secure your KonarCard link in seconds. No payment required.",
        mockType: "claim",
    },
    {
        step: "Step 2",
        title: "Build Your Profile",
        desc: "Add your services, photos, reviews, and contact details — all in one place.",
        mockType: "profile",
    },
    {
        step: "Step 3",
        title: "Share It Anywhere",
        desc: "Tap your card, share your link, or use a QR code — online or in person.",
        mockType: "share",
    },
];

function MockClaim() {
    return (
        <div className="hiw-mock">
            <div className="hiw-mock__top">
                <div className="hiw-mock__window" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
                <h3 className="hiw-mock__title">Claim your link</h3>
                <p className="hiw-mock__sub">Pick a name customers remember.</p>
            </div>

            <div className="hiw-mock__body">
                <div className="hiw-mock__label">Your KonarCard link</div>
                <div className="hiw-mock__input" aria-hidden="true">
                    <span className="hiw-mock__prefix">konarcard.com/u/</span>
                    <span className="hiw-mock__value">yourbusinessname</span>
                </div>

                <div className="hiw-mock__hint">Free to claim. No payment needed.</div>

                <div className="hiw-mock__btnRow" aria-hidden="true">
                    <div className="hiw-mock__btn">Claim link</div>
                </div>

                <div className="hiw-mock__foot" aria-hidden="true">
                    Already have an account? <span className="hiw-mock__footLink">Sign in</span>
                </div>
            </div>
        </div>
    );
}

function MockProfile() {
    return (
        <div className="hiw-mock">
            <div className="hiw-mock__top">
                <div className="hiw-mock__window" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
                <h3 className="hiw-mock__title">Edit your profile</h3>
                <p className="hiw-mock__sub">Services, photos, reviews and contact buttons.</p>
            </div>

            <div className="hiw-mock__body">
                <div className="hiw-mock__row" aria-hidden="true">
                    <div className="hiw-mock__chip">Gallery</div>
                    <div className="hiw-mock__chip">Services</div>
                    <div className="hiw-mock__chip">Reviews</div>
                </div>

                <div className="hiw-mock__miniGrid" aria-hidden="true">
                    <div className="hiw-mock__tile" />
                    <div className="hiw-mock__tile" />
                    <div className="hiw-mock__tile" />
                    <div className="hiw-mock__tile" />
                </div>

                <div className="hiw-mock__btnRow hiw-mock__btnRow--split" aria-hidden="true">
                    <div className="hiw-mock__ghost">Preview</div>
                    <div className="hiw-mock__btn">Publish</div>
                </div>

                <div className="hiw-mock__hint">Update anytime — changes go live instantly.</div>
            </div>
        </div>
    );
}

function MockShare() {
    return (
        <div className="hiw-mock">
            <div className="hiw-mock__top">
                <div className="hiw-mock__window" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
                <h3 className="hiw-mock__title">Share anywhere</h3>
                <p className="hiw-mock__sub">Tap, scan, or send your link.</p>
            </div>

            <div className="hiw-mock__body">
                <div className="hiw-share" aria-hidden="true">
                    <div className="hiw-share__phone">
                        <div className="hiw-share__screen">
                            <div className="hiw-share__line hiw-share__line--lg" />
                            <div className="hiw-share__line" />
                            <div className="hiw-share__line" />
                            <div className="hiw-share__ctaRow">
                                <div className="hiw-share__cta" />
                                <div className="hiw-share__cta" />
                            </div>
                        </div>
                    </div>

                    <div className="hiw-share__stack">
                        <div className="hiw-share__pill">NFC tap</div>
                        <div className="hiw-share__pill">QR scan</div>
                        <div className="hiw-share__pill">WhatsApp</div>
                        <div className="hiw-share__pill">Link in bio</div>
                    </div>
                </div>

                <div className="hiw-mock__hint">Works on iPhone + Android. No app needed.</div>
            </div>
        </div>
    );
}

function StepMock({ type }) {
    if (type === "profile") return <MockProfile />;
    if (type === "share") return <MockShare />;
    return <MockClaim />;
}

export default function HowItWorks() {
    return (
        <section className="hiw" aria-label="How it works">
            <div className="hiw__inner">
                <header className="hiw__head">
                    <p className="hiw__kicker">3 steps</p>
                    <h2 className="h3 hiw__title">How it works</h2>
                    <p className="body-s hiw__sub">Create your digital business card in minutes — no apps, no hassle.</p>
                </header>

                <div className="hiw__grid">
                    {steps.map((s, idx) => (
                        <article className="hiw__card" key={idx}>
                            <StepMock type={s.mockType} />

                            <div className="hiw__stepRow">
                                <div className="hiw__stepPill">{s.step}</div>
                            </div>

                            <h3 className="h5 hiw__stepTitle">{s.title}</h3>
                            <p className="body-s hiw__stepDesc">{s.desc}</p>

                            {idx === 2 && (
                                <div className="hiw__miniCta">
                                    <Link to="/register" className="hiw__miniLink">
                                        Get started →
                                    </Link>
                                </div>
                            )}
                        </article>
                    ))}
                </div>

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
