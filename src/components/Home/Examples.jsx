import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import "../../styling/fonts.css";
import "../../styling/home/examples.css";

import ExampleTest from "../../assets/images/ExampleTest.jpg";

export default function Examples() {
    const items = useMemo(
        () => [
            {
                role: "Electrician",
                name: "James",
                desc: "Shares contact details instantly after jobs and quotes.",
            },
            {
                role: "Builder",
                name: "David",
                desc: "Shows reviews + gallery to build trust on the first visit.",
            },
            {
                role: "Plumber",
                name: "Ryan",
                desc: "Shares portfolio + booking link to win higher-value work.",
            },
        ],
        []
    );

    return (
        <section className="khe-examples" aria-labelledby="khe-title">
            <div className="khe-container">
                <header className="khe-hero">
                    <div className="khe-hero__inner">
                        <p className="kc-pill khe-kicker">Real examples</p>

                        {/* ✅ No <br />, constrained width instead */}
                        <h2 id="khe-title" className="h3 khe-title">
                            See How UK Trades <span className="khe-accent">Win More Work</span> With KonarCard
                        </h2>

                        <p className="kc-subheading khe-sub">
                            Real examples of trades turning taps into booked jobs.
                        </p>
                    </div>
                </header>

                <div className="khe-grid" role="list" aria-label="Example profiles">
                    {items.map((it) => (
                        <article className="khe-card" key={`${it.role}-${it.name}`} role="listitem">
                            <span className="khe-pill">{it.role}</span>

                            <div className="khe-copy">
                                <p className="kc-title khe-name">{it.name}</p>
                                <p className="body khe-desc">{it.desc}</p>
                            </div>

                            <div className="khe-media" aria-hidden="true">
                                <img
                                    src={ExampleTest}
                                    alt="Example KonarCard digital business card profile preview"
                                    className="khe-img"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                        </article>
                    ))}
                </div>

                <p className="body khe-ctaHint">
                    See more real profiles from UK trades.
                </p>

                <div className="khe-ctaRow">
                    <Link to="/examples" className="kx-btn kx-btn--black">
                        View More Real Profiles
                    </Link>
                </div>
            </div>
        </section>
    );
}