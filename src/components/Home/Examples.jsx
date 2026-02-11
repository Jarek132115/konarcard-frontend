import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import "../../styling/fonts.css";
import "../../styling/home/examples.css";

/* ✅ Use the same image as Examples page for now (swap later) */
import ExampleTest from "../../assets/images/ExampleTest.jpg";

export default function Examples() {
    const items = useMemo(
        () => [
            { role: "Electrician", name: "James", desc: "Shares contact details instantly after jobs and quotes." },
            { role: "Plumber", name: "Ben", desc: "Shows reviews + gallery to build trust on the first visit." },
            { role: "Builder", name: "Ryan", desc: "Shares portfolio + booking link to win higher-value work." },
            { role: "Landscaper", name: "Charlie", desc: "Shares seasonal packages and availability on-site." },
        ],
        []
    );

    return (
        <section className="khe-examples" aria-labelledby="khe-title">
            <div className="khe-container">
                <header className="khe-hero">
                    <div className="khe-hero__inner">
                        <p className="khe-kicker">Real examples</p>

                        <h2 id="khe-title" className="h3 khe-title">
                            See How UK Tradespeople
                            <br />
                            Use KonarCard
                        </h2>

                        <p className="body-s khe-sub">
                            Real profiles. Real cards. Real examples of how a digital business card helps you win more work — shared by NFC
                            tap, QR code, or link.
                        </p>
                    </div>
                </header>

                <div className="khe-grid" aria-label="Example profiles">
                    {items.map((it) => (
                        <article className="khe-card" key={`${it.role}-${it.name}`}>
                            <div className="khe-imageWrap" aria-hidden="true">
                                <img
                                    src={ExampleTest}
                                    alt="Example KonarCard digital business card profile preview"
                                    className="khe-image"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>

                            <div className="khe-cardBody">
                                <p className="h6 khe-cardTitle">
                                    {it.role} — {it.name}
                                </p>
                                <p className="body-s khe-cardDesc">{it.desc}</p>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="khe-ctaRow">
                    <Link to="/examples" className="khe-btn khe-btn--primary">
                        See More Real Examples
                    </Link>

                    <Link to="/register" className="khe-btn khe-btn--ghost">
                        Create Your Own Profile
                    </Link>
                </div>
            </div>
        </section>
    );
}
