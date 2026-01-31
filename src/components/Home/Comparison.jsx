import React from "react";
import { Link } from "react-router-dom";
import "../../styling/home/comparison.css";

export default function Comparison() {
    return (
        <section className="kc-comparison section">
            <div className="kc-comparison__header">
                <h2 className="desktop-h3 text-center">
                    How You’ll Use It <span className="orange">In The Real World</span>
                </h2>
                <h3 className="desktop-body-xs text-center">
                    No more typing your number, digging for photos, or swapping paper. It’s almost 2026 — time for a change.
                </h3>
            </div>

            <div className="kc-comparison__twoCol">
                <div className="kc-comparison__box kc-comparison__box--old">
                    <span className="kc-comparison__badge kc-comparison__badge--old">The old way</span>
                    <ul className="kc-comparison__list">
                        <li>
                            <span className="kc-comparison__dot" aria-hidden="true" />
                            <span className="desktop-body-xs">Type your phone &amp; email into their phone</span>
                        </li>
                        <li>
                            <span className="kc-comparison__dot" aria-hidden="true" />
                            <span className="desktop-body-xs">Scroll your camera roll for examples</span>
                        </li>
                        <li>
                            <span className="kc-comparison__dot" aria-hidden="true" />
                            <span className="desktop-body-xs">Hope they don’t lose your details</span>
                        </li>
                    </ul>
                </div>

                <div className="kc-comparison__box kc-comparison__box--new">
                    <span className="kc-comparison__badge kc-comparison__badge--new">The Konar way</span>
                    <ul className="kc-comparison__list">
                        <li>
                            <span className="kc-comparison__dot" aria-hidden="true" />
                            <span className="desktop-body-xs">Tap once — they get your full profile</span>
                        </li>
                        <li>
                            <span className="kc-comparison__dot" aria-hidden="true" />
                            <span className="desktop-body-xs">Photos, services, reviews, and contact — saved</span>
                        </li>
                        <li>
                            <span className="kc-comparison__dot" aria-hidden="true" />
                            <span className="desktop-body-xs">Follow-ups are faster and more professional</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="kc-comparison__grid">
                <div className="kc-comparison__card">
                    <div className="kc-comparison__icon" aria-hidden="true">👷</div>
                    <div className="kc-comparison__cardText">
                        <h4 className="desktop-body-s">On Site, With a Client</h4>
                        <p className="desktop-body-xs">
                            Tap your KonarCard. Their phone opens your profile and saves your details instantly.
                        </p>
                    </div>
                </div>

                <div className="kc-comparison__card">
                    <div className="kc-comparison__icon" aria-hidden="true">📄</div>
                    <div className="kc-comparison__cardText">
                        <h4 className="desktop-body-s">After a Quote</h4>
                        <p className="desktop-body-xs">
                            Send the link in messages so they can revisit your services and reviews while deciding.
                        </p>
                    </div>
                </div>

                <div className="kc-comparison__card">
                    <div className="kc-comparison__icon" aria-hidden="true">🤝</div>
                    <div className="kc-comparison__cardText">
                        <h4 className="desktop-body-s">Networking / Trade Counter</h4>
                        <p className="desktop-body-xs">No stacks of cards. One tap per person, unlimited times.</p>
                    </div>
                </div>

                <div className="kc-comparison__card">
                    <div className="kc-comparison__icon" aria-hidden="true">🚐</div>
                    <div className="kc-comparison__cardText">
                        <h4 className="desktop-body-s">Van QR &amp; Site Board</h4>
                        <p className="desktop-body-xs">
                            Print your QR. Passers-by scan to view your work and save your number.
                        </p>
                    </div>
                </div>

                <div className="kc-comparison__card">
                    <div className="kc-comparison__icon" aria-hidden="true">📱</div>
                    <div className="kc-comparison__cardText">
                        <h4 className="desktop-body-s">Social &amp; Link In Bio</h4>
                        <p className="desktop-body-xs">
                            Add your link to Instagram, Facebook, and TikTok to convert views into enquiries.
                        </p>
                    </div>
                </div>

                <div className="kc-comparison__card">
                    <div className="kc-comparison__icon" aria-hidden="true">⚡</div>
                    <div className="kc-comparison__cardText">
                        <h4 className="desktop-body-s">Updates in Seconds</h4>
                        <p className="desktop-body-xs">
                            Change prices or photos once — your card shares the latest version everywhere.
                        </p>
                    </div>
                </div>
            </div>

            <div className="kc-comparison__cta">
                <Link to="/register" className="navy-button desktop-button">
                    Get Your KonarCard
                </Link>
            </div>
        </section>
    );
}
