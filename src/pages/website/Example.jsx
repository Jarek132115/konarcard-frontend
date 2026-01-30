// frontend/src/pages/website/Example.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Breadcrumbs from "../../components/Breadcrumbs";
import Footer from "../../components/Footer";

/* Global typography/tokens */
import "../../styling/fonts.css";

/* Page CSS */
import "../../styling/example.css";

/* Icons */
import WorksOnEveryPhone from "../../assets/icons/Works_On_Every_Phone.svg";
import BuiltForRealTrades from "../../assets/icons/Built_For_Real_Trades.svg";
import OneLinkForEverything from "../../assets/icons/One_Link_For_Everything.svg";

function ExampleThumb({ initials = "K" }) {
    return (
        <div className="ex-cardThumb" aria-hidden="true">
            <div className="ex-phone">
                <div className="ex-phoneTop" />
                <div className="ex-phoneScreen">
                    <div className="ex-bar" />
                    <div className="ex-bar ex-bar2" />
                    <div className="ex-grid">
                        <div className="ex-tile" />
                        <div className="ex-tile" />
                        <div className="ex-tile" />
                        <div className="ex-tile" />
                    </div>
                </div>
            </div>

            <div className="ex-physicalCard">
                <div className="ex-physicalK">{initials}</div>
                <div className="ex-physicalSub">KonarCard</div>
            </div>
        </div>
    );
}

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
            {
                id: "el-1",
                category: "electrician",
                role: "Electrician",
                name: "James Carter",
                desc: "Uses KonarCard to share contact details instantly after jobs and quotes.",
            },
            {
                id: "el-2",
                category: "electrician",
                role: "Electrician",
                name: "Liam Hughes",
                desc: "Taps to send a booking link and Google reviews — no paper cards needed.",
            },
            {
                id: "el-3",
                category: "electrician",
                role: "Electrician",
                name: "Aaron Walsh",
                desc: "Shares services + pricing from his profile when customers ask on-site.",
            },
            {
                id: "el-4",
                category: "electrician",
                role: "Electrician",
                name: "Kai Reynolds",
                desc: "QR backup for older phones so every lead still gets his details.",
            },

            // Plumber (4)
            {
                id: "pl-1",
                category: "plumber",
                role: "Plumber",
                name: "Ben Thompson",
                desc: "Shares emergency call-out details and lets customers save his number fast.",
            },
            {
                id: "pl-2",
                category: "plumber",
                role: "Plumber",
                name: "Oliver Price",
                desc: "Shows before/after photos and gets more trust on the first visit.",
            },
            {
                id: "pl-3",
                category: "plumber",
                role: "Plumber",
                name: "Ethan Brooks",
                desc: "Sends invoice email + WhatsApp link in one tap — simple and quick.",
            },
            {
                id: "pl-4",
                category: "plumber",
                role: "Plumber",
                name: "Noah Davies",
                desc: "Uses KonarCard at supply stores to get referrals from other trades.",
            },

            // Builder (4)
            {
                id: "bu-1",
                category: "builder",
                role: "Builder",
                name: "Ryan Mitchell",
                desc: "Shares portfolio and booking link to win higher-value jobs.",
            },
            {
                id: "bu-2",
                category: "builder",
                role: "Builder",
                name: "Jack Foster",
                desc: "Shows his services list and timeline expectations right on the profile.",
            },
            {
                id: "bu-3",
                category: "builder",
                role: "Builder",
                name: "Callum Baker",
                desc: "Uses reviews + gallery to stand out when quoting against competitors.",
            },
            {
                id: "bu-4",
                category: "builder",
                role: "Builder",
                name: "Mason Clarke",
                desc: "Shares a single link for everything — phone, email, socials and site.",
            },

            // Renovator (4)
            {
                id: "re-1",
                category: "renovator",
                role: "Renovator",
                name: "Daniel Evans",
                desc: "Shows project transformations to help customers decide faster.",
            },
            {
                id: "re-2",
                category: "renovator",
                role: "Renovator",
                name: "Harvey Scott",
                desc: "Uses KonarCard at showrooms to collect new leads with a tap.",
            },
            {
                id: "re-3",
                category: "renovator",
                role: "Renovator",
                name: "Theo Morgan",
                desc: "Sends quote request form link so customers can book a survey easily.",
            },
            {
                id: "re-4",
                category: "renovator",
                role: "Renovator",
                name: "Finley Green",
                desc: "Updates photos weekly — no reprinting when branding changes.",
            },

            // Landscaper (4)
            {
                id: "la-1",
                category: "landscaper",
                role: "Landscaper",
                name: "Charlie Turner",
                desc: "Shares seasonal packages and availability on-site in seconds.",
            },
            {
                id: "la-2",
                category: "landscaper",
                role: "Landscaper",
                name: "Oscar Reed",
                desc: "Uses gallery + reviews to secure weekly maintenance clients.",
            },
            {
                id: "la-3",
                category: "landscaper",
                role: "Landscaper",
                name: "Alfie King",
                desc: "Sends Instagram + booking link from one profile — easy for customers.",
            },
            {
                id: "la-4",
                category: "landscaper",
                role: "Landscaper",
                name: "Harrison Cox",
                desc: "Drops the QR on quotes so customers can follow up instantly.",
            },

            // Handyman (4)
            {
                id: "ha-1",
                category: "handyman",
                role: "Handyman",
                name: "George Ward",
                desc: "Shares a quick contact button so customers can call while he’s on-site.",
            },
            {
                id: "ha-2",
                category: "handyman",
                role: "Handyman",
                name: "Leo Phillips",
                desc: "Uses KonarCard for repeat work — customers always have the right details.",
            },
            {
                id: "ha-3",
                category: "handyman",
                role: "Handyman",
                name: "Sam Bennett",
                desc: "Shares services list and pricing so customers know what’s covered.",
            },
            {
                id: "ha-4",
                category: "handyman",
                role: "Handyman",
                name: "Alex Parker",
                desc: "One tap to save contact, view reviews, and message directly.",
            },
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

            <div className="ex-breadcrumbs section-breadcrumbs" style={{ marginTop: 20 }}>
                <Breadcrumbs />
            </div>

            {/* Hero */}
            <section className="ex-hero">
                <h1 className="ex-h1">
                    See How Other Tradies
                    <br />
                    Use KonarCard
                </h1>
                <p className="ex-sub">
                    Real profiles. Real cards. Real examples of how KonarCard helps
                    <br />
                    win more work.
                </p>

                <div className="ex-tabs" role="tablist" aria-label="Example categories">
                    {categories.map((c) => (
                        <button
                            key={c.key}
                            type="button"
                            className={`ex-tab ${active === c.key ? "isActive" : ""}`}
                            onClick={() => setActive(c.key)}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Grid */}
            <section className="ex-gridWrap">
                <div className="ex-gridCards">
                    {visible.map((item) => {
                        const initials = item.name
                            .split(" ")
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase();

                        return (
                            <div className="ex-card" key={item.id}>
                                <ExampleThumb initials={initials} />

                                <div className="ex-cardBody">
                                    <p className="ex-cardTitle">
                                        {item.role} — {item.name}
                                    </p>
                                    <p className="ex-cardDesc">{item.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Why this works */}
            <section className="ex-why">
                <h2 className="ex-h2">Why This Works For Any Trade</h2>
                <p className="ex-sub2">Popular reasons KonarCard helps you get more work.</p>

                <div className="ex-whyGrid">
                    <div className="ex-whyCard">
                        <img src={WorksOnEveryPhone} alt="" className="ex-whyIcon" />
                        <p className="ex-whyTitle">Works on every phone</p>
                        <p className="ex-whyDesc">No apps. Just tap or scan.</p>
                    </div>

                    <div className="ex-whyCard">
                        <img src={BuiltForRealTrades} alt="" className="ex-whyIcon" />
                        <p className="ex-whyTitle">Built for real jobs</p>
                        <p className="ex-whyDesc">Designed for on-site, not offices.</p>
                    </div>

                    <div className="ex-whyCard">
                        <img src={OneLinkForEverything} alt="" className="ex-whyIcon" />
                        <p className="ex-whyTitle">One link for everything</p>
                        <p className="ex-whyDesc">Details, work, and contact options in one place.</p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="ex-cta">
                <h2 className="ex-h2">See The Card Behind The Profile</h2>
                <p className="ex-sub2">
                    Each example pairs a real profile with a physical KonarCard —<br />
                    built for everyday use on real jobs.
                </p>

                <Link to="/productandplan/konarcard" className="ex-ctaBtn">
                    Shop cards
                </Link>
            </section>

            <Footer />
        </>
    );
}
