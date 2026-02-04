// frontend/src/pages/website/Example.jsx
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

/* Icons */
import WorksOnEveryPhone from "../../assets/icons/Works_On_Every_Phone.svg";
import BuiltForRealTrades from "../../assets/icons/Built_For_Real_Trades.svg";
import OneLinkForEverything from "../../assets/icons/One_Link_For_Everything.svg";

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

    const examples = useMemo(
        () => [
            // Electrician (4)
            { id: "el-1", category: "electrician", role: "Electrician", name: "James Carter", desc: "Shares contact details instantly after jobs and quotes." },
            { id: "el-2", category: "electrician", role: "Electrician", name: "Liam Hughes", desc: "Taps to send a booking link + Google reviews — no paper cards." },
            { id: "el-3", category: "electrician", role: "Electrician", name: "Aaron Walsh", desc: "Shares services + pricing from his profile on-site." },
            { id: "el-4", category: "electrician", role: "Electrician", name: "Kai Reynolds", desc: "Uses QR backup so every lead still gets details." },

            // Plumber (4)
            { id: "pl-1", category: "plumber", role: "Plumber", name: "Ben Thompson", desc: "Shares emergency call-out details and saves contacts fast." },
            { id: "pl-2", category: "plumber", role: "Plumber", name: "Oliver Price", desc: "Shows before/after photos to build trust on visit one." },
            { id: "pl-3", category: "plumber", role: "Plumber", name: "Ethan Brooks", desc: "Sends invoice email + WhatsApp link in one tap." },
            { id: "pl-4", category: "plumber", role: "Plumber", name: "Noah Davies", desc: "Gets referrals at supply stores with a quick tap." },

            // Builder (4)
            { id: "bu-1", category: "builder", role: "Builder", name: "Ryan Mitchell", desc: "Shares portfolio + booking link to win higher-value jobs." },
            { id: "bu-2", category: "builder", role: "Builder", name: "Jack Foster", desc: "Shows services and timeline expectations on the profile." },
            { id: "bu-3", category: "builder", role: "Builder", name: "Callum Baker", desc: "Uses reviews + gallery to stand out when quoting." },
            { id: "bu-4", category: "builder", role: "Builder", name: "Mason Clarke", desc: "Shares one link for phone, email, socials and website." },

            // Renovator (4)
            { id: "re-1", category: "renovator", role: "Renovator", name: "Daniel Evans", desc: "Shows transformations so customers decide faster." },
            { id: "re-2", category: "renovator", role: "Renovator", name: "Harvey Scott", desc: "Collects new leads at showrooms with a tap." },
            { id: "re-3", category: "renovator", role: "Renovator", name: "Theo Morgan", desc: "Shares a quote request form for easy survey booking." },
            { id: "re-4", category: "renovator", role: "Renovator", name: "Finley Green", desc: "Updates photos weekly — no reprints when branding changes." },

            // Landscaper (4)
            { id: "la-1", category: "landscaper", role: "Landscaper", name: "Charlie Turner", desc: "Shares seasonal packages + availability on-site." },
            { id: "la-2", category: "landscaper", role: "Landscaper", name: "Oscar Reed", desc: "Uses gallery + reviews to secure maintenance clients." },
            { id: "la-3", category: "landscaper", role: "Landscaper", name: "Alfie King", desc: "Shares Instagram + booking link from one profile." },
            { id: "la-4", category: "landscaper", role: "Landscaper", name: "Harrison Cox", desc: "Adds QR to quotes so customers follow up instantly." },

            // Handyman (4)
            { id: "ha-1", category: "handyman", role: "Handyman", name: "George Ward", desc: "Customers can call instantly while he’s on-site." },
            { id: "ha-2", category: "handyman", role: "Handyman", name: "Leo Phillips", desc: "Perfect for repeat work — always the right details." },
            { id: "ha-3", category: "handyman", role: "Handyman", name: "Sam Bennett", desc: "Shares services list and pricing so customers know what’s covered." },
            { id: "ha-4", category: "handyman", role: "Handyman", name: "Alex Parker", desc: "One tap to save contact, view reviews, and message." },
        ],
        []
    );

    const [active, setActive] = useState("all");

    const visible = useMemo(() => {
        if (active === "all") return examples;
        return examples.filter((x) => x.category === active);
    }, [active, examples]);

    return (
        <>
            <Navbar />

            {/* kc-page gives spacing; we also add extra safety padding in CSS */}
            <main className="kc-examples kc-page">
                {/* HERO */}
                <section className="kc-examples__hero">
                    <div className="kc-examples__heroInner">
                        <h1 className="h2 kc-examples__title">
                            See How Other Tradies
                            <br />
                            Use KonarCard
                        </h1>

                        <p className="body-s kc-examples__subtitle">
                            Real profiles. Real cards. Real examples of how KonarCard helps win more work.
                        </p>

                        <div className="kc-examples__tabs" role="tablist" aria-label="Example categories">
                            {categories.map((c) => {
                                const isActive = active === c.key;
                                return (
                                    <button
                                        key={c.key}
                                        type="button"
                                        className={`kc-examples__tab pill ${isActive ? "is-active" : ""}`}
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
                </section>

                {/* GRID */}
                <section className="kc-examples__gridSection" aria-label="Example profiles">
                    <div className="kc-examples__grid">
                        {visible.map((item) => (
                            <article className="ex-card" key={item.id}>
                                {/* 1:1 image */}
                                <div className="ex-imageWrap">
                                    <img src={ExampleTest} alt="" className="ex-image" loading="lazy" />
                                </div>

                                {/* info underneath */}
                                <div className="ex-cardBody">
                                    <p className="h6 ex-cardTitle">
                                        {item.role} — {item.name.split(" ")[0]}
                                    </p>
                                    <p className="body-s ex-cardDesc">{item.desc}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* WHY */}
                <section className="kc-examples__why">
                    <div className="kc-examples__whyInner">
                        <h2 className="h3 kc-examples__whyTitle">Why This Works For Any Trade</h2>
                        <p className="body-s kc-examples__whySub">The common reasons tradies get more work with KonarCard.</p>

                        <div className="kc-examples__whyGrid">
                            <div className="ex-whyCard">
                                <img src={WorksOnEveryPhone} alt="" className="ex-whyIcon" />
                                <p className="h6 ex-whyTitle">Works on every phone</p>
                                <p className="body-s ex-whyDesc">No apps. Just tap or scan.</p>
                            </div>

                            <div className="ex-whyCard">
                                <img src={BuiltForRealTrades} alt="" className="ex-whyIcon" />
                                <p className="h6 ex-whyTitle">Built for real jobs</p>
                                <p className="body-s ex-whyDesc">Designed for on-site, not offices.</p>
                            </div>

                            <div className="ex-whyCard">
                                <img src={OneLinkForEverything} alt="" className="ex-whyIcon" />
                                <p className="h6 ex-whyTitle">One link for everything</p>
                                <p className="body-s ex-whyDesc">Details, work, and contact options in one place.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="kc-examples__cta">
                    <div className="kc-examples__ctaInner">
                        <h2 className="h3 kc-examples__ctaTitle">Ready to make yours?</h2>
                        <p className="body-s kc-examples__ctaSub">
                            Claim your KonarCard link, build your profile, then choose a card or keytag when you’re ready.
                        </p>

                        <div className="kc-examples__ctaBtns">
                            <Link to="/claimyourlink" className="kc-examples__ctaBtn">
                                Claim your link
                            </Link>
                            <Link to="/productandplan/konarcard" className="kc-examples__ctaBtn kc-examples__ctaBtn--ghost">
                                Shop cards
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
