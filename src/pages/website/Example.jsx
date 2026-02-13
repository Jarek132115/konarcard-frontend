import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

/* Global typography/tokens */
import "../../styling/fonts.css";

/* Page CSS */
import "../../styling/example.css";

/* Images */
import ExampleTest from "../../assets/images/ExampleTest.jpg";

/* Icons (you said you saved them with these exact names) */
import WorksOnEveryPhone from "../../assets/icons/WorksOnEveryPhone.svg";
import BuiltForRealJobs from "../../assets/icons/BuiltForRealJobs.svg";
import LinkInSocial from "../../assets/icons/LinkInSocial.svg";

export default function Example() {
    const categories = useMemo(
        () => [
            { key: "all", label: "All" },
            { key: "electrician", label: "Electrician" },
            { key: "plumber", label: "Plumber" },
            { key: "builder", label: "Builder" },
            { key: "renovator", label: "Renovator" },
            { key: "landscaper", label: "Landscaper" },
            { key: "handyman", label: "Handyman" },
        ],
        []
    );

    // ✅ Descriptions tightened so they don’t exceed ~2 lines (also clamped in CSS)
    const examples = useMemo(
        () => [
            // Electrician (4)
            { id: "el-1", category: "electrician", role: "Electrician", name: "James", desc: "Shares contact details instantly after jobs and quotes." },
            { id: "el-2", category: "electrician", role: "Electrician", name: "Liam", desc: "Sends a booking link and reviews in one quick tap." },
            { id: "el-3", category: "electrician", role: "Electrician", name: "Aaron", desc: "Shows services and pricing clearly while quoting on-site." },
            { id: "el-4", category: "electrician", role: "Electrician", name: "Kai", desc: "Uses QR backup so every lead still saves the details." },

            // Plumber (4)
            { id: "pl-1", category: "plumber", role: "Plumber", name: "Ben", desc: "Shares emergency call-out details and saves contacts fast." },
            { id: "pl-2", category: "plumber", role: "Plumber", name: "Oliver", desc: "Shows before/after photos to build trust on visit one." },
            { id: "pl-3", category: "plumber", role: "Plumber", name: "Ethan", desc: "Shares invoice email and WhatsApp link in one tap." },
            { id: "pl-4", category: "plumber", role: "Plumber", name: "Noah", desc: "Gets referrals at supply stores with a quick tap share." },

            // Builder (4)
            { id: "bu-1", category: "builder", role: "Builder", name: "Ryan", desc: "Shares portfolio and booking link to win higher-value jobs." },
            { id: "bu-2", category: "builder", role: "Builder", name: "Jack", desc: "Sets clear timelines and services so customers know what to expect." },
            { id: "bu-3", category: "builder", role: "Builder", name: "Callum", desc: "Uses reviews and gallery to stand out when quoting." },
            { id: "bu-4", category: "builder", role: "Builder", name: "Mason", desc: "Shares one link for phone, email, socials and website." },

            // Renovator (4)
            { id: "re-1", category: "renovator", role: "Renovator", name: "Daniel", desc: "Shows transformations so customers decide faster with confidence." },
            { id: "re-2", category: "renovator", role: "Renovator", name: "Harvey", desc: "Collects new leads at showrooms with a fast tap." },
            { id: "re-3", category: "renovator", role: "Renovator", name: "Theo", desc: "Shares a quote request form for easy survey booking." },
            { id: "re-4", category: "renovator", role: "Renovator", name: "Finley", desc: "Updates photos weekly so branding stays consistent everywhere." },

            // Landscaper (4)
            { id: "la-1", category: "landscaper", role: "Landscaper", name: "Charlie", desc: "Shares seasonal packages and availability while on-site." },
            { id: "la-2", category: "landscaper", role: "Landscaper", name: "Oscar", desc: "Uses gallery and reviews to secure maintenance clients." },
            { id: "la-3", category: "landscaper", role: "Landscaper", name: "Alfie", desc: "Shares Instagram and booking link from one clean profile." },
            { id: "la-4", category: "landscaper", role: "Landscaper", name: "Harrison", desc: "Adds QR to quotes so customers follow up instantly." },

            // Handyman (4)
            { id: "ha-1", category: "handyman", role: "Handyman", name: "George", desc: "Customers can call instantly while he’s still on-site." },
            { id: "ha-2", category: "handyman", role: "Handyman", name: "Leo", desc: "Perfect for repeat work — always the right details." },
            { id: "ha-3", category: "handyman", role: "Handyman", name: "Sam", desc: "Shares services and pricing so customers know what’s covered." },
            { id: "ha-4", category: "handyman", role: "Handyman", name: "Alex", desc: "One tap to save contact, view reviews, and message." },
        ],
        []
    );

    const [active, setActive] = useState("all");

    const visible = useMemo(() => {
        if (active === "all") return examples;
        return examples.filter((x) => x.category === active);
    }, [active, examples]);

    // ✅ “Why” section copy made longer so each sits ~2 lines (also clamped)
    const whyCards = useMemo(
        () => [
            {
                icon: WorksOnEveryPhone,
                title: "Works on every phone",
                desc: "Tap or scan and your profile opens instantly — no downloads needed, ever.",
            },
            {
                icon: BuiltForRealJobs,
                title: "Built for real jobs",
                desc: "Made for on-site work so customers can trust you quickly and contact you fast.",
            },
            {
                icon: LinkInSocial,
                title: "One link for everything",
                desc: "Keep photos, services, reviews and contact buttons together in one place.",
            },
        ],
        []
    );

    return (
        <>
            <Navbar />

            <main className="kc-examples kc-page ex-page">
                {/* HERO (Products-style grid background) */}
                <section className="ex-hero" aria-label="Examples hero">
                    <div className="ex-container ex-hero__inner">
                        <div className="ex-heroCopyGrid">
                            <p className="kc-pill ex-heroPill">Real profiles built with KonarCard</p>

                            <h1 className="h2 ex-title">
                                See how other <span className="ex-accent">tradies</span> use KonarCard
                            </h1>

                            <p className="body-s ex-sub">
                                Real profiles. Real cards. Real examples of how a digital business card helps you win more work — shared by NFC tap, QR
                                code, or link.
                            </p>

                            <div className="ex-tabs" role="tablist" aria-label="Example categories">
                                {categories.map((c) => {
                                    const isActive = active === c.key;
                                    return (
                                        <button
                                            key={c.key}
                                            type="button"
                                            className={`ex-tab pill ${isActive ? "is-active" : ""}`}
                                            onClick={() => setActive(c.key)}
                                            role="tab"
                                            aria-selected={isActive}
                                        >
                                            {c.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* EXAMPLES GRID (match Home examples cards) */}
                <section className="ex-gridSection" aria-label="Example profiles">
                    <div className="ex-container">
                        <div className="ex-grid">
                            {visible.map((item) => (
                                <article className="ex-card" key={item.id}>
                                    <div className="ex-media" aria-label={`${item.role} example`}>
                                        <span className="ex-rolePill">{item.role}</span>
                                        <img src={ExampleTest} alt="" className="ex-img" loading="lazy" decoding="async" />
                                    </div>

                                    <div className="ex-body">
                                        <p className="h6 ex-cardTitle">
                                            {item.role} — {item.name}
                                        </p>
                                        <p className="body-s ex-cardDesc">{item.desc}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* WHY (fafafa background + same spacing/padding style as other sections) */}
                <section className="ex-why" aria-label="Why this works">
                    <div className="ex-container">
                        <header className="ex-whyHead">
                            <h2 className="h3 ex-whyTitle">
                                Why This <span className="ex-accent">Works</span> For Any Trade
                            </h2>

                            <p className="body-s ex-whySub">The common reasons tradies get more work with KonarCard.</p>
                        </header>

                        <div className="ex-whyGrid" role="list" aria-label="Reasons it works">
                            {whyCards.map((c) => (
                                <article className="ex-whyCard" key={c.title} role="listitem">
                                    <div className="ex-whyIconWrap" aria-hidden="true">
                                        <img src={c.icon} alt="" className="ex-whyIcon" />
                                    </div>
                                    <p className="h6 ex-whyCardTitle">{c.title}</p>
                                    <p className="body-s ex-whyDesc">{c.desc}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA (single black button) */}
                <section className="ex-cta" aria-label="Claim your link call to action">
                    <div className="ex-container ex-ctaInner">
                        <h2 className="h3 ex-ctaTitle">Ready to make yours?</h2>
                        <p className="body-s ex-ctaSub">
                            Claim your KonarCard link, build your profile, then choose a card or keytag when you’re ready.
                        </p>

                        <div className="ex-ctaBtns">
                            <Link to="/claimyourlink" className="kx-btn kx-btn--black">
                                Claim your link
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
