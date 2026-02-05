// frontend/src/pages/website/Products.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

/* Global typography/tokens */
import "../../styling/fonts.css";

/* Page CSS */
import "../../styling/products.css";

/* ✅ Product images (from src/assets/images/) */
import PlasticCardImg from "../../assets/images/PlasticCard.jpg";
import MetalCardImg from "../../assets/images/MetalCard.jpg";
import KonarTagImg from "../../assets/images/KonarTag.jpg";

export default function Products() {
    const products = useMemo(
        () => [
            {
                tag: "Best seller",
                name: "KonarCard — Plastic Edition",
                desc: "Durable, lightweight NFC business card for everyday use.",
                price: "£29.99",
                sub: "Includes NFC + QR and your live KonarCard profile.",
                to: "/products/plastic-card",
                cta: "View Plastic Card",
                img: PlasticCardImg,
            },
            {
                tag: "Premium",
                name: "KonarCard — Metal Edition",
                desc: "Premium metal NFC card designed to make a strong first impression.",
                price: "£44.99",
                sub: "Premium finish, durable build, NFC + QR included.",
                to: "/products/metal-card",
                cta: "View Metal Card",
                img: MetalCardImg,
            },
            {
                tag: "Accessory",
                name: "KonarTag",
                desc: "Compact NFC key tag that shares your profile with a tap.",
                price: "£9.99",
                sub: "Same KonarCard link — always on you.",
                to: "/products/konartag",
                cta: "View KonarTag",
                img: KonarTagImg,
            },
        ],
        []
    );

    const bundles = useMemo(
        () => [
            {
                tag: "Best value",
                name: "Plastic Bundle",
                desc: "Plastic KonarCard + KonarTag + 1 month subscription.",
                price: "£39.99",
                was: "£49.97",
                to: "/products/plastic-bundle",
                cta: "View Plastic Bundle",
                img: PlasticCardImg, // ✅ same plastic image
            },
            {
                tag: "Premium bundle",
                name: "Metal Bundle",
                desc: "Metal KonarCard + KonarTag + 1 month subscription.",
                price: "£54.99",
                was: "£69.97",
                to: "/products/metal-bundle",
                cta: "View Metal Bundle",
                img: MetalCardImg, // ✅ same metal image
            },
        ],
        []
    );

    const realWorldTop = useMemo(
        () => [
            {
                tag: "Use it on-site",
                title: "Tap to swap details on the spot",
                points: [
                    "Tap to open your profile instantly",
                    "Works even when you’re busy on a job",
                    "No app needed — just tap or scan",
                ],
            },
            {
                tag: "Win more jobs",
                title: "Turn taps into customers",
                points: [
                    "Create a clean, trustworthy profile",
                    "Show photos, services, reviews and contact buttons",
                    "Faster follow-ups and fewer missed calls",
                ],
            },
        ],
        []
    );

    const realWorldGrid = useMemo(
        () => [
            {
                title: "On site, with a client",
                desc: "Tap your KonarCard. Their phone opens your profile and saves your details instantly — no typing.",
            },
            {
                title: "After a quote",
                desc: "Send your link by WhatsApp so they can review your work, services and reviews while deciding.",
            },
            {
                title: "Networking / trade counter",
                desc: "No stacks of cards. Tap to share your details as many times as you want.",
            },
            {
                title: "Van QR & site boards",
                desc: "Stick the QR on your van or signage so customers can scan and call you straight away.",
            },
            {
                title: "Social & link in bio",
                desc: "Add your KonarCard link to Instagram, Facebook or TikTok so new leads land on your profile.",
            },
            {
                title: "Updates in seconds",
                desc: "New number, new prices, new photos — update once and it’s live everywhere instantly.",
            },
        ],
        []
    );

    const chooseCards = useMemo(
        () => [
            {
                title: "Metal cards",
                desc: "Best if you want a premium feel and strong first impressions.",
                img: MetalCardImg,
            },
            {
                title: "Plastic cards",
                desc: "Lightweight, affordable, and perfect for everyday use.",
                img: PlasticCardImg,
            },
            {
                title: "Custom logo cards",
                desc: "Ideal for established businesses that want branded cards.",
                img: PlasticCardImg, // placeholder (swap later)
            },
        ],
        []
    );

    const productFaqs = useMemo(
        () => [
            {
                q: "Will it work on iPhone and Android?",
                a: "Yes — KonarCard works on iPhone and Android. Most modern phones support NFC. QR works on any phone with a camera.",
            },
            {
                q: "Do customers need an app to tap my card?",
                a: "No app needed. The tap opens your KonarCard profile instantly in their browser.",
            },
            {
                q: "Can I update my details after ordering?",
                a: "Yes. Update your profile anytime — changes go live instantly without reprinting anything.",
            },
            {
                q: "What if someone’s phone doesn’t support NFC?",
                a: "Every card includes a QR code backup, so anyone can scan and view your profile.",
            },
            {
                q: "Can I use one profile on multiple products?",
                a: "Yes — your card and keytag can link to the same KonarCard profile.",
            },
        ],
        []
    );

    const [openIndex, setOpenIndex] = useState(0);

    return (
        <>
            <Navbar />

            {/* ✅ Use kc-page like Pricing for consistent top spacing under navbar */}
            <main className="kc-products kc-page">
                {/* HERO (no perks grid) */}
                <section className="kp-hero">
                    <div className="kp-container kp-hero__inner">
                        <p className="kp-kicker">Cards that link directly to your KonarCard profile</p>
                        <h1 className="h2 kp-title">Shop KonarCards</h1>
                        <p className="body-s kp-sub">
                            Physical NFC business cards that open your profile instantly — so customers can save your details and
                            contact you fast.
                        </p>
                    </div>
                </section>

                {/* PRODUCTS */}
                <section className="kp-section">
                    <div className="kp-container">
                        <div className="kp-grid">
                            {products.map((item) => (
                                <article key={item.name} className="kp-card">
                                    <div className="kp-card__topRow">
                                        <span className="kp-pill">{item.tag}</span>
                                    </div>

                                    {/* ✅ 1:1 media, cover */}
                                    <div className="kp-media" aria-hidden="true">
                                        <img src={item.img} alt="" className="kp-media__img" loading="lazy" />
                                    </div>

                                    <div className="kp-card__body">
                                        <p className="h6 kp-card__name">{item.name}</p>
                                        <p className="body-s kp-muted">{item.desc}</p>

                                        <div className="kp-priceRow">
                                            <p className="h6 kp-price">{item.price}</p>
                                        </div>

                                        <p className="body-s kp-muted">{item.sub}</p>

                                        <div className="kp-actions">
                                            <Link to={item.to} className="kp-btn">
                                                {item.cta}
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* BUNDLES */}
                <section className="kp-section kp-section--spaced">
                    <div className="kp-container">
                        <div className="kp-sectionHead">
                            <h2 className="h3 kp-h2">Save More With KonarCard Bundles</h2>
                            <p className="body-s kp-sectionSub">
                                Everything you need to share your profile everywhere — at a better price.
                            </p>
                        </div>

                        <div className="kp-bundles">
                            {bundles.map((b) => (
                                <article key={b.name} className="kp-card">
                                    <div className="kp-card__topRow">
                                        <span className="kp-pill">{b.tag}</span>
                                    </div>

                                    {/* ✅ 1:1 media, cover */}
                                    <div className="kp-media" aria-hidden="true">
                                        <img src={b.img} alt="" className="kp-media__img" loading="lazy" />
                                    </div>

                                    <div className="kp-card__body">
                                        <p className="h6 kp-card__name">{b.name}</p>
                                        <p className="body-s kp-muted">{b.desc}</p>

                                        <div className="kp-bundlePrice">
                                            <p className="h6 kp-price">{b.price}</p>
                                            <p className="body-s kp-strike">{b.was}</p>
                                        </div>

                                        <div className="kp-actions">
                                            <Link to={b.to} className="kp-btn">
                                                {b.cta}
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* REAL WORLD */}
                <section className="kp-section kp-section--spaced">
                    <div className="kp-container">
                        <div className="kp-sectionHead">
                            <h2 className="h3 kp-h2">How you’ll use it in the real world</h2>
                            <p className="body-s kp-sectionSub">
                                Your KonarCard profile puts your work, reviews and contact details in one place — so customers can see
                                you’re legit and get in touch fast.
                            </p>
                        </div>

                        <div className="kp-twoUp">
                            {realWorldTop.map((box) => (
                                <div key={box.title} className="kp-miniCard">
                                    <span className="kp-pill kp-pill--soft">{box.tag}</span>
                                    <p className="h6 kp-miniCard__title">{box.title}</p>
                                    <ul className="kp-bullets">
                                        {box.points.map((pt) => (
                                            <li key={pt} className="body-s">
                                                {pt}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="kp-realGrid">
                            {realWorldGrid.map((g) => (
                                <div key={g.title} className="kp-realCard">
                                    <div className="kp-miniIcon" aria-hidden="true" />
                                    <p className="h6">{g.title}</p>
                                    <p className="body-s kp-muted">{g.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CHOOSE */}
                <section className="kp-section kp-section--spaced kp-section--bottom">
                    <div className="kp-container">
                        <div className="kp-sectionHead">
                            <h2 className="h3 kp-h2">Not sure which card to choose?</h2>
                            <p className="body-s kp-sectionSub">
                                Pick the card that fits how you work — all cards link to the same powerful profile.
                            </p>
                        </div>

                        <div className="kp-grid">
                            {chooseCards.map((c) => (
                                <article key={c.title} className="kp-card">
                                    <div className="kp-media" aria-hidden="true">
                                        <img src={c.img} alt="" className="kp-media__img" loading="lazy" />
                                    </div>

                                    <div className="kp-card__body">
                                        <p className="h6 kp-card__name">{c.title}</p>
                                        <p className="body-s kp-muted">{c.desc}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="kp-faq">
                    <div className="kp-container kp-faq__inner">
                        <h2 className="h3 kp-h2">Product FAQs</h2>
                        <p className="body-s kp-sectionSub">Quick answers before you order.</p>

                        <div className="kp-faqList" role="region" aria-label="Product FAQs">
                            {productFaqs.map((item, idx) => {
                                const isOpen = idx === openIndex;
                                return (
                                    <div className="kp-faqItem" key={`${item.q}-${idx}`}>
                                        <button
                                            type="button"
                                            className="kp-qRow"
                                            onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                                            aria-expanded={isOpen}
                                        >
                                            <span className="h6 kp-q">{item.q}</span>
                                            <span className={`kp-chev ${isOpen ? "is-open" : ""}`} aria-hidden="true">
                                                ▾
                                            </span>
                                        </button>

                                        {isOpen && <div className="body-s kp-a">{item.a}</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
