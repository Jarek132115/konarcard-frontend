// frontend/src/pages/website/Products.jsx
import React from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Breadcrumbs from "../../components/Breadcrumbs";
import Footer from "../../components/Footer";

/**
 * NOTE:
 * This page intentionally uses NO local image imports.
 * Your deploy was failing because Products.jsx imported missing images.
 * Use placeholders now (safe for Vercel), then later swap placeholders for real assets.
 */

export default function Products() {
    const topPerks = [
        { title: "One link for everything", desc: "Details, photos, prices and contact options in one place." },
        { title: "Easy to update anytime", desc: "Change your details instantly without reprinting cards." },
        { title: "Share by tap or QR", desc: "Works in person, online and anywhere in between." },
        { title: "Built for real trades", desc: "Designed for on-site, not offices." },
        { title: "Looks professional", desc: "Make a strong first impression every time." },
    ];

    const products = [
        {
            tag: "Best seller",
            name: "KonarCard — Plastic Edition",
            desc: "Lightweight, affordable and perfect for everyday use.",
            price: "£29.99",
            sub: "Includes NFC + QR and your live KonarCard profile.",
        },
        {
            tag: "Premium",
            name: "KonarCard — Metal Edition",
            desc: "A premium feel for a stronger first impression.",
            price: "£49.99",
            sub: "Matte finish, durable build, NFC + QR included.",
        },
        {
            tag: "Accessory",
            name: "KonarTag",
            desc: "Clip it to your keys and tap to share instantly.",
            price: "£19.99",
            sub: "Same KonarCard link — always on you.",
        },
    ];

    const bundles = [
        {
            tag: "Best value",
            name: "2x KonarCard — Plastic Edition",
            desc: "Keep one in the van and one in your wallet.",
            price: "£49.99",
            was: "£59.98",
        },
        {
            tag: "Best value",
            name: "3x KonarCard — Plastic Edition",
            desc: "Ideal for teams or keeping spares on site.",
            price: "£69.99",
            was: "£89.97",
        },
    ];

    const realWorldTop = [
        {
            tag: "Use it on-site",
            title: "Tap to swap details on the spot",
            points: ["Type their phone number and tap their phone", "Works even when you’re busy on a job", "No app needed — just tap or scan"],
        },
        {
            tag: "Win more jobs",
            title: "Turn taps into customers",
            points: ["Create a clean, trustworthy profile", "Show photos, services, reviews and contact buttons", "Faster follow-ups and fewer missed calls"],
        },
    ];

    const realWorldGrid = [
        {
            title: "On Site, With a Client",
            desc: "Tap your KonarCard. Their phone opens your profile and saves your details instantly — no typing, no fuss.",
        },
        {
            title: "After a Quote",
            desc: "Send your link by WhatsApp so they can review your work, services and reviews while deciding.",
        },
        {
            title: "Networking / Trade Counter",
            desc: "No stacks of cards. Tap to share your details as many times as you want.",
        },
        {
            title: "Van QR & Site Boards",
            desc: "Stick the QR on your van or signage so customers can scan and call you straight away.",
        },
        {
            title: "Social & Link in Bio",
            desc: "Add your KonarCard link to Instagram, Facebook or TikTok so new leads land on your profile.",
        },
        {
            title: "Updates in Seconds",
            desc: "New number, new prices, new photos — update once and it’s live everywhere instantly.",
        },
    ];

    const chooseCards = [
        {
            title: "Metal Cards",
            desc: "Best if you want a premium feel and strong first impressions.",
        },
        {
            title: "Plastic Cards",
            desc: "Lightweight, affordable, and perfect for everyday use.",
        },
        {
            title: "Custom Logo Cards",
            desc: "Ideal for established businesses that want branded cards.",
        },
    ];

    return (
        <>
            <Navbar />

            <div style={{ marginTop: 20 }} className="section-breadcrumbs">
                <Breadcrumbs />
            </div>

            {/* ================= HERO ================= */}
            <section className="kc-products section">
                <div className="kc-products__hero">
                    <p className="desktop-body-xs kc-products__kicker">Cards that link directly to your KonarCard profile</p>
                    <h1 className="desktop-h1 text-center">Shop KonarCards</h1>
                    <p className="desktop-body-xs text-center kc-products__sub">
                        Physical NFC business cards that open your profile instantly — so customers can save your details and contact you fast.
                    </p>

                    <div className="kc-products__perks">
                        {topPerks.map((p) => (
                            <div key={p.title} className="kc-products__perk">
                                <div className="kc-products__perkIcon" aria-hidden="true" />
                                <div>
                                    <p className="desktop-h6">{p.title}</p>
                                    <p className="desktop-body-xs">{p.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= PRODUCTS GRID ================= */}
                <div className="kc-products__grid">
                    {products.map((item) => (
                        <div key={item.name} className="kc-products__card">
                            <div className="kc-products__cardTop">
                                <span className="kc-products__tag">{item.tag}</span>
                            </div>

                            <div className="kc-products__imgWrap" aria-hidden="true">
                                <div className="kc-products__imgPlaceholder">Image</div>
                            </div>

                            <div className="kc-products__cardBody">
                                <p className="desktop-h6">{item.name}</p>
                                <p className="desktop-body-xs kc-products__muted">{item.desc}</p>

                                <div className="kc-products__priceRow">
                                    <p className="desktop-h6">{item.price}</p>
                                </div>

                                <p className="desktop-body-xs kc-products__muted">{item.sub}</p>

                                <div className="kc-products__ctaRow">
                                    <Link to="/register" className="desktop-button orange-button kc-products__btn">
                                        Claim Your Link
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ================= BUNDLES ================= */}
                <div className="kc-products__sectionTitle">
                    <h2 className="desktop-h2 text-center">Save More With KonarCard Bundles</h2>
                    <p className="desktop-body-xs text-center kc-products__sub">
                        Everything you need to share your profile everywhere — at a better price.
                    </p>
                </div>

                <div className="kc-products__bundles">
                    {bundles.map((b) => (
                        <div key={b.name} className="kc-products__bundleCard">
                            <div className="kc-products__bundleHeader">
                                <span className="kc-products__tag">{b.tag}</span>
                            </div>

                            <div className="kc-products__bundleImg" aria-hidden="true">
                                <div className="kc-products__imgPlaceholder">Image</div>
                            </div>

                            <div className="kc-products__bundleBody">
                                <p className="desktop-h6">{b.name}</p>
                                <p className="desktop-body-xs kc-products__muted">{b.desc}</p>

                                <div className="kc-products__bundlePrice">
                                    <p className="desktop-h6">{b.price}</p>
                                    <p className="desktop-body-xs kc-products__strike">{b.was}</p>
                                </div>

                                <Link to="/register" className="desktop-button orange-button kc-products__btn">
                                    Claim Your Link
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ================= REAL WORLD ================= */}
                <div className="kc-products__sectionTitle">
                    <h2 className="desktop-h2 text-center">How you’ll use it in the Real World</h2>
                    <p className="desktop-body-xs text-center kc-products__sub">
                        Your KonarCard profile puts your work, reviews and contact details in one place — so customers can quickly see you’re legit and get in touch without friction.
                    </p>
                </div>

                <div className="kc-products__twoUp">
                    {realWorldTop.map((box) => (
                        <div key={box.title} className="kc-products__twoUpCard">
                            <span className="kc-products__tag kc-products__tagSoft">{box.tag}</span>
                            <p className="desktop-h6">{box.title}</p>
                            <ul className="kc-products__bullets">
                                {box.points.map((pt) => (
                                    <li key={pt} className="desktop-body-xs">
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
                            <p className="desktop-h6">{g.title}</p>
                            <p className="desktop-body-xs kc-products__muted">{g.desc}</p>
                        </div>
                    ))}
                </div>

                {/* ================= CHOOSE ================= */}
                <div className="kc-products__sectionTitle">
                    <h2 className="desktop-h2 text-center">Not sure which card to choose?</h2>
                    <p className="desktop-body-xs text-center kc-products__sub">
                        Pick the card that fits how you work — all cards link to the same powerful profile.
                    </p>
                </div>

                <div className="kc-products__chooseGrid">
                    {chooseCards.map((c) => (
                        <div key={c.title} className="kc-products__chooseCard">
                            <div className="kc-products__chooseImg" aria-hidden="true">
                                <div className="kc-products__imgPlaceholder">Image</div>
                            </div>
                            <div className="kc-products__chooseBody">
                                <p className="desktop-h6">{c.title}</p>
                                <p className="desktop-body-xs kc-products__muted">{c.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </>
    );
}
