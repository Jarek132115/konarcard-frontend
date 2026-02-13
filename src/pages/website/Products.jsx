// frontend/src/pages/website/Products.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

/* Global typography/tokens */
import "../../styling/fonts.css";

/* Page CSS */
import "../../styling/products.css";

/* ✅ Product images */
import PlasticCardImg from "../../assets/images/PlasticCard.jpg";
import MetalCardImg from "../../assets/images/MetalCard.jpg";
import KonarTagImg from "../../assets/images/KonarTag.jpg";

/* ✅ Real world icons */
import OnSiteIcon from "../../assets/icons/OnSite.svg";
import AfterQuoteIcon from "../../assets/icons/AfterQuote.svg";
import TradeCounterIcon from "../../assets/icons/TradeCounter.svg";
import VanQRIcon from "../../assets/icons/VanQR.svg";
import LinkInSocialIcon from "../../assets/icons/LinkInSocial.svg";
import UpdateSecondsIcon from "../../assets/icons/UpdateSeconds.svg";

export default function Products() {
    const products = useMemo(
        () => [
            {
                tag: "Best seller",
                name: "KonarCard — Plastic Edition",
                desc: "Durable, lightweight NFC business card for everyday use.",
                price: "£29.99",
                to: "/products/plastic-card",
                img: PlasticCardImg,
            },
            {
                tag: "Premium",
                name: "KonarCard — Metal Edition",
                desc: "Premium metal NFC card designed to make a strong first impression.",
                price: "£44.99",
                to: "/products/metal-card",
                img: MetalCardImg,
            },
            {
                tag: "Accessory",
                name: "KonarTag",
                desc: "Compact NFC key tag that shares your profile with a tap.",
                price: "£9.99",
                to: "/products/konartag",
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
                desc: "A complete starter setup for sharing your profile everywhere.",
                price: "£39.99",
                was: "£49.97",
                to: "/products/plastic-bundle",
                cardLabel: "KonarCard",
                tagLabel: "KonarTag",
                subLabel: "Subscription",
                imgCard: PlasticCardImg,
                imgTag: KonarTagImg,
            },
            {
                tag: "Premium bundle",
                name: "Metal Bundle",
                desc: "Premium setup designed to make a stronger first impression.",
                price: "£54.99",
                was: "£69.97",
                to: "/products/metal-bundle",
                cardLabel: "KonarCard",
                tagLabel: "KonarTag",
                subLabel: "Subscription",
                imgCard: MetalCardImg,
                imgTag: KonarTagImg,
            },
        ],
        []
    );

    const realWorldTop = useMemo(
        () => [
            {
                pill: "Use it on-site",
                title: "Tap to swap details on the spot",
                points: ["Tap to open your profile instantly", "Works even when you’re busy on a job", "No app needed, just tap or scan"],
            },
            {
                pill: "Win more jobs",
                title: "Turn taps into customers",
                points: ["Create a clean, trustworthy profile", "Show photos, services, reviews and contact buttons", "Faster follow-ups and fewer missed calls"],
            },
        ],
        []
    );

    const realWorldGrid = useMemo(
        () => [
            {
                icon: OnSiteIcon,
                alt: "On-site icon",
                title: "On site, with a client",
                desc: "Tap your KonarCard. Their phone opens your profile and saves your details instantly, no typing.",
            },
            {
                icon: AfterQuoteIcon,
                alt: "After quote icon",
                title: "After a quote",
                desc: "Send your link by WhatsApp so they can review your work and contact you fast.",
            },
            {
                icon: TradeCounterIcon,
                alt: "Trade counter icon",
                title: "Networking / trade counter",
                desc: "Tap to share your details as many times as you want, no stacks of cards.",
            },
            {
                icon: VanQRIcon,
                alt: "Van QR icon",
                title: "Van QR & site boards",
                desc: "Add the QR to your van or signage so customers can scan and call straight away.",
            },
            {
                icon: LinkInSocialIcon,
                alt: "Link in social icon",
                title: "Social & link in bio",
                desc: "Add your KonarCard link to socials so new leads land on your profile first.",
            },
            {
                icon: UpdateSecondsIcon,
                alt: "Update icon",
                title: "Updates in seconds",
                desc: "Update once and it’s live everywhere instantly, new number, prices, photos or services.",
            },
        ],
        []
    );

    const productFaqs = useMemo(
        () => [
            {
                q: "Will it work on iPhone and Android?",
                a: "Yes. KonarCard works on iPhone and Android. Most modern phones support NFC. QR works on any phone with a camera.",
            },
            { q: "Do customers need an app to tap my card?", a: "No app needed. The tap opens your KonarCard profile instantly in their browser." },
            { q: "Can I update my details after ordering?", a: "Yes. Update your profile anytime, changes go live instantly without reprinting anything." },
            { q: "What if someone’s phone doesn’t support NFC?", a: "Every card includes a QR code backup, so anyone can scan and view your profile." },
            { q: "Can I use one profile on multiple products?", a: "Yes. Your card and keytag can link to the same KonarCard profile." },
        ],
        []
    );

    const [openIndex, setOpenIndex] = useState(0);

    return (
        <>
            <Navbar />

            <main className="kc-products kc-page kp-page">
                {/* HERO */}
                <section className="kp-hero">
                    <div className="kp-container kp-hero__inner">
                        <div className="kp-heroCopyGrid">
                            <p className="kc-pill kp-heroPill">Cards that link directly to your KonarCard profile</p>

                            <h1 className="h2 kp-title">
                                Shop the <span className="kp-accent">Konar</span> product range
                            </h1>

                            <p className="body-s kp-sub">
                                Physical NFC business cards that open your profile instantly, so customers can save your details and contact you fast.
                            </p>
                        </div>
                    </div>
                </section>

                {/* PRODUCTS */}
                <section className="kp-section kp-section--cards">
                    <div className="kp-container">
                        <div className="kp-grid" role="list" aria-label="KonarCard products">
                            {products.map((item) => (
                                <article key={item.name} className="kp-card" role="listitem">
                                    <div className="kp-media" aria-hidden="true">
                                        <span className="kp-mediaPill" aria-label={item.tag}>
                                            {item.tag}
                                        </span>
                                        <img src={item.img} alt="" className="kp-media__img" loading="lazy" />
                                    </div>

                                    <div className="kp-divider" aria-hidden="true" />

                                    <div className="kp-card__body">
                                        <div className="kp-topCopy">
                                            <p className="h6 kp-card__name">{item.name}</p>
                                            <p className="body-s kp-desc">{item.desc}</p>
                                        </div>

                                        <div className="kp-buy">
                                            <div className="kp-priceRow">
                                                <p className="kp-price">{item.price}</p>
                                            </div>

                                            <div className="kp-actions">
                                                {/* ✅ WHITE CTA */}
                                                <Link to={item.to} className="kx-btn kx-btn--white kp-btn kp-btn--white" aria-label={`View ${item.name}`}>
                                                    View product
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <p className="kp-note">One-time card purchase — profiles are free to start.</p>
                    </div>
                </section>

                {/* BUNDLES */}
                <section className="kp-bundlesSection">
                    <div className="kp-container">
                        <header className="kp-sectionHead">
                            <p className="kc-pill kp-kicker">Bundles</p>
                            <h2 className="h3 kp-h2">
                                Save More With KonarCard <span className="kp-accent">Bundles</span>
                            </h2>
                            <p className="body-s kp-sectionSub">Each bundle includes a card, a KonarTag, and 12 months subscription.</p>
                        </header>

                        <div className="kp-bundleList" role="list" aria-label="KonarCard bundles">
                            {bundles.map((b) => (
                                <article key={b.name} className="kp-bundleCard" role="listitem">
                                    <div className="kp-bundleLeft">
                                        <span className="kp-softPill" aria-label={b.tag}>
                                            {b.tag}
                                        </span>

                                        <h3 className="h6 kp-bundleTitle">{b.name}</h3>
                                        <p className="body-s kp-bundleDesc">{b.desc}</p>

                                        <div className="kp-bundlePriceRow">
                                            <span className="kp-bundlePrice">{b.price}</span>
                                            <span className="kp-bundleWas">{b.was}</span>
                                        </div>

                                        {/* ✅ WHITE CTA */}
                                        <Link to={b.to} className="kx-btn kx-btn--white kp-bundleBtn kp-btn--white">
                                            View bundle
                                        </Link>
                                    </div>

                                    <div className="kp-bundleRight" aria-label="Bundle includes">
                                        <div className="kp-bundleRightTop">
                                            <div className="kp-bundleRightTitle">Includes</div>
                                            <div className="kp-bundleRightSub">One setup, share anywhere — tap, scan, or link.</div>
                                        </div>

                                        <div className="kp-bundleItems">
                                            <div className="kp-bundleItem">
                                                <div className="kp-bundleLabel">{b.cardLabel}</div>
                                                <div className="kp-bundleThumb">
                                                    <img src={b.imgCard} alt={`${b.name} card`} loading="lazy" />
                                                </div>
                                            </div>

                                            <div className="kp-bundlePlus" aria-hidden="true">
                                                +
                                            </div>

                                            <div className="kp-bundleItem">
                                                <div className="kp-bundleLabel">{b.tagLabel}</div>
                                                <div className="kp-bundleThumb">
                                                    <img src={b.imgTag} alt={`${b.name} KonarTag`} loading="lazy" />
                                                </div>
                                            </div>

                                            <div className="kp-bundlePlus" aria-hidden="true">
                                                +
                                            </div>

                                            <div className="kp-bundleItem">
                                                <div className="kp-bundleLabel">{b.subLabel}</div>
                                                <div className="kp-bundleThumb kp-bundleSubBox" aria-label="Subscription included">
                                                    <div className="kp-subTop">12 months</div>
                                                    <div className="kp-subBottom">INCLUDED</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* REAL WORLD */}
                <section className="kp-realWorld">
                    <div className="kp-container">
                        <header className="kp-sectionHead">
                            <p className="kc-pill kp-kicker">Built for trades</p>
                            <h2 className="h3 kp-h2">
                                How you’ll use it in the <span className="kp-accent">real world</span>
                            </h2>
                            <p className="body-s kp-sectionSub">
                                Your KonarCard profile puts your work, reviews and contact details in one place, so customers can trust you fast and get in touch quickly.
                            </p>
                        </header>

                        <div className="kp-twoUp" role="list" aria-label="Real world highlights">
                            {realWorldTop.map((box) => (
                                <article key={box.title} className="kp-highlightCard" role="listitem">
                                    <span className="kp-softPill kp-softPill--tight">{box.pill}</span>
                                    <h3 className="h6 kp-highlightTitle">{box.title}</h3>
                                    <ul className="kp-bullets">
                                        {box.points.map((pt) => (
                                            <li key={pt} className="body-s">
                                                {pt}
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>

                        <div className="kp-realGrid" role="list" aria-label="Real world examples">
                            {realWorldGrid.map((g) => (
                                <article key={g.title} className="kp-realCard" role="listitem">
                                    <div className="kp-realIconTop" aria-hidden="true">
                                        <img src={g.icon} alt="" />
                                    </div>
                                    <h3 className="h6 kp-realTitle">{g.title}</h3>

                                    {/* ✅ IMPORTANT: This class now matches the CSS clamp */}
                                    <p className="body-s kp-rwCardDesc">{g.desc}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="kp-faq">
                    <div className="kp-container kp-faq__inner">
                        <header className="kp-faqHead">
                            <p className="kc-pill kp-kicker">FAQs</p>
                            <h2 className="h3 kp-h2">Product FAQs</h2>
                            <p className="body-s kp-sectionSub">Quick answers before you order.</p>
                        </header>

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

                        <div className="kp-faqCta">
                            <p className="body-s kp-faqCtaText">Still got questions? We’re happy to help.</p>
                            <Link to="/contactus" className="kx-btn kx-btn--black">
                                Contact support
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
