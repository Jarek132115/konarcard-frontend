// frontend/src/pages/website/Products.jsx
import React from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

/* Global typography/tokens */
import "../../styling/fonts.css";

/* Page CSS */
import "../../styling/products.css";

export default function Products() {
    const topPerks = [
        { title: "One link for everything", desc: "Details, photos, prices and contact options in one place." },
        { title: "Easy to update anytime", desc: "Change your details instantly without reprinting cards." },
        { title: "Share by tap or QR", desc: "Works in person, online and anywhere in between." },
        { title: "Built for real trades", desc: "Designed for on-site, not offices." },
        { title: "Looks professional", desc: "Make a strong first impression every time." },
    ];

    // ✅ Add routes for each product page
    const products = [
        {
            tag: "Best seller",
            name: "KonarCard — Plastic Edition",
            desc: "Lightweight, affordable and perfect for everyday use.",
            price: "£29.99",
            sub: "Includes NFC + QR and your live KonarCard profile.",
            to: "/products/plastic-card",
            cta: "View Plastic Card",
        },
        {
            tag: "Premium",
            name: "KonarCard — Metal Edition",
            desc: "A premium feel for a stronger first impression.",
            price: "£49.99",
            sub: "Matte finish, durable build, NFC + QR included.",
            to: "/products/metal-card",
            cta: "View Metal Card",
        },
        {
            tag: "Accessory",
            name: "KonarTag",
            desc: "Clip it to your keys and tap to share instantly.",
            price: "£19.99",
            sub: "Same KonarCard link — always on you.",
            to: "/products/konartag",
            cta: "View KonarTag",
        },
    ];

    // ✅ Bundle routes
    const bundles = [
        {
            tag: "Best value",
            name: "Plastic Bundle",
            desc: "Plastic KonarCard + KonarTag + 1 month subscription.",
            price: "£39.99",
            was: "£49.97",
            to: "/products/plastic-bundle",
            cta: "View Plastic Bundle",
        },
        {
            tag: "Premium bundle",
            name: "Metal Bundle",
            desc: "Metal KonarCard + KonarTag + 1 month subscription.",
            price: "£54.99",
            was: "£69.97",
            to: "/products/metal-bundle",
            cta: "View Metal Bundle",
        },
    ];

    const realWorldTop = [
        {
            tag: "Use it on-site",
            title: "Tap to swap details on the spot",
            points: ["Tap to open your profile instantly", "Works even when you’re busy on a job", "No app needed — just tap or scan"],
        },
        {
            tag: "Win more jobs",
            title: "Turn taps into customers",
            points: ["Create a clean, trustworthy profile", "Show photos, services, reviews and contact buttons", "Faster follow-ups and fewer missed calls"],
        },
    ];

    const realWorldGrid = [
        { title: "On site, with a client", desc: "Tap your KonarCard. Their phone opens your profile and saves your details instantly — no typing." },
        { title: "After a quote", desc: "Send your link by WhatsApp so they can review your work, services and reviews while deciding." },
        { title: "Networking / trade counter", desc: "No stacks of cards. Tap to share your details as many times as you want." },
        { title: "Van QR & site boards", desc: "Stick the QR on your van or signage so customers can scan and call you straight away." },
        { title: "Social & link in bio", desc: "Add your KonarCard link to Instagram, Facebook or TikTok so new leads land on your profile." },
        { title: "Updates in seconds", desc: "New number, new prices, new photos — update once and it’s live everywhere instantly." },
    ];

    const chooseCards = [
        { title: "Metal cards", desc: "Best if you want a premium feel and strong first impressions." },
        { title: "Plastic cards", desc: "Lightweight, affordable, and perfect for everyday use." },
        { title: "Custom logo cards", desc: "Ideal for established businesses that want branded cards." },
    ];

    return (
        <>
            <Navbar />

            <main className="kc-products">
                {/* HERO */}
                <section className="kc-products__hero">
                    <div className="kc-products__heroInner">
                        <p className="kc-products__kicker body-s">Cards that link directly to your KonarCard profile</p>
                        <h1 className="h2 kc-products__title">Shop KonarCards</h1>
                        <p className="body-s kc-products__subtitle">
                            Physical NFC business cards that open your profile instantly — so customers can save your details and contact you fast.
                        </p>

                        <div className="kc-products__perks">
                            {topPerks.map((p) => (
                                <div key={p.title} className="kc-products__perk">
                                    <div className="kc-products__perkIcon" aria-hidden="true" />
                                    <div>
                                        <p className="h6 kc-products__perkTitle">{p.title}</p>
                                        <p className="body-s kc-products__perkDesc">{p.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PRODUCTS GRID */}
                <section className="kc-products__section">
                    <div className="kc-products__grid">
                        {products.map((item) => (
                            <article key={item.name} className="kc-products__card">
                                <div className="kc-products__cardTop">
                                    <span className="kc-products__tag">{item.tag}</span>
                                </div>

                                <div className="kc-products__imgWrap" aria-hidden="true">
                                    <div className="kc-products__imgPlaceholder">Image</div>
                                </div>

                                <div className="kc-products__cardBody">
                                    <p className="h6">{item.name}</p>
                                    <p className="body-s kc-products__muted">{item.desc}</p>

                                    <div className="kc-products__priceRow">
                                        <p className="h6 kc-products__price">{item.price}</p>
                                    </div>

                                    <p className="body-s kc-products__muted">{item.sub}</p>

                                    <div className="kc-products__ctaRow">
                                        {/* ✅ now links to product page */}
                                        <Link to={item.to} className="kc-products__btn">
                                            {item.cta}
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* BUNDLES */}
                <section className="kc-products__section kc-products__section--spaced">
                    <div className="kc-products__sectionHead">
                        <h2 className="h3 kc-products__sectionTitle">Save More With KonarCard Bundles</h2>
                        <p className="body-s kc-products__sectionSub">Everything you need to share your profile everywhere — at a better price.</p>
                    </div>

                    <div className="kc-products__bundles">
                        {bundles.map((b) => (
                            <article key={b.name} className="kc-products__bundleCard">
                                <div className="kc-products__bundleHeader">
                                    <span className="kc-products__tag">{b.tag}</span>
                                </div>

                                <div className="kc-products__bundleImg" aria-hidden="true">
                                    <div className="kc-products__imgPlaceholder">Image</div>
                                </div>

                                <div className="kc-products__bundleBody">
                                    <p className="h6">{b.name}</p>
                                    <p className="body-s kc-products__muted">{b.desc}</p>

                                    <div className="kc-products__bundlePrice">
                                        <p className="h6">{b.price}</p>
                                        <p className="body-s kc-products__strike">{b.was}</p>
                                    </div>

                                    {/* ✅ now links to bundle page */}
                                    <Link to={b.to} className="kc-products__btn">
                                        {b.cta}
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* REAL WORLD */}
                <section className="kc-products__section kc-products__section--spaced">
                    <div className="kc-products__sectionHead">
                        <h2 className="h3 kc-products__sectionTitle">How you’ll use it in the real world</h2>
                        <p className="body-s kc-products__sectionSub">
                            Your KonarCard profile puts your work, reviews and contact details in one place — so customers can see you’re legit and get in touch fast.
                        </p>
                    </div>

                    <div className="kc-products__twoUp">
                        {realWorldTop.map((box) => (
                            <div key={box.title} className="kc-products__twoUpCard">
                                <span className="kc-products__tag kc-products__tagSoft">{box.tag}</span>
                                <p className="h6">{box.title}</p>
                                <ul className="kc-products__bullets">
                                    {box.points.map((pt) => (
                                        <li key={pt} className="body-s">
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="kc-products__realGrid">
                        {realWorldGrid.map((g) => (
                            <div key={g.title} className="kc-products__realCard">
                                <div className="kc-products__miniIcon" aria-hidden="true" />
                                <p className="h6">{g.title}</p>
                                <p className="body-s kc-products__muted">{g.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CHOOSE */}
                <section className="kc-products__section kc-products__section--spaced kc-products__section--bottom">
                    <div className="kc-products__sectionHead">
                        <h2 className="h3 kc-products__sectionTitle">Not sure which card to choose?</h2>
                        <p className="body-s kc-products__sectionSub">Pick the card that fits how you work — all cards link to the same powerful profile.</p>
                    </div>

                    <div className="kc-products__chooseGrid">
                        {chooseCards.map((c) => (
                            <div key={c.title} className="kc-products__chooseCard">
                                <div className="kc-products__chooseImg" aria-hidden="true">
                                    <div className="kc-products__imgPlaceholder">Image</div>
                                </div>
                                <div className="kc-products__chooseBody">
                                    <p className="h6">{c.title}</p>
                                    <p className="body-s kc-products__muted">{c.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
