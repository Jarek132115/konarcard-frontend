import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import "../../styling/fonts.css";
import "../../styling/home/products.css";

/* ✅ Product images (same as Products page) */
import PlasticCardImg from "../../assets/images/PlasticCard.jpg";
import MetalCardImg from "../../assets/images/MetalCard.jpg";
import KonarTagImg from "../../assets/images/KonarTag.jpg";

export default function Products() {
    const products = useMemo(
        () => [
            {
                tag: "Best Value",
                name: "KonarCard - Plastic Edition",
                desc: "Durable, lightweight NFC business card for everyday use.",
                priceText: "£29.99",
                priceValue: 29.99,
                currency: "GBP",
                to: "/products/plastic-card",
                img: PlasticCardImg,
                alt: "KonarCard Plastic Edition – plastic NFC business card with QR code",
                sku: "konarcard-plastic",
                cta: "View Plastic Card",
            },
            {
                tag: "Premium",
                name: "KonarCard - Metal Edition",
                desc: "Premium metal NFC card designed to make a strong first impression.",
                priceText: "£44.99",
                priceValue: 44.99,
                currency: "GBP",
                to: "/products/metal-card",
                img: MetalCardImg,
                alt: "KonarCard Metal Edition – metal NFC business card with QR code",
                sku: "konarcard-metal",
                cta: "View Metal Card",
            },
            {
                tag: "Accessory",
                name: "KonarTag",
                desc: "Compact NFC key tag that shares your profile with a tap.",
                priceText: "£9.99",
                priceValue: 9.99,
                currency: "GBP",
                to: "/products/konartag",
                img: KonarTagImg,
                alt: "KonarTag – NFC key tag that opens your digital business card profile",
                sku: "konartag",
                cta: "View KonarTag",
            },
        ],
        []
    );

    // ✅ SEO: Product list schema (JSON-LD)
    const productSchema = useMemo(() => {
        const origin =
            typeof window !== "undefined" && window.location?.origin
                ? window.location.origin
                : "https://konarcard.com";

        return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "KonarCard Physical Cards",
            itemListElement: products.map((p, idx) => ({
                "@type": "ListItem",
                position: idx + 1,
                item: {
                    "@type": "Product",
                    name: p.name,
                    description: p.desc,
                    image: p.img,
                    sku: p.sku,
                    brand: { "@type": "Brand", name: "KonarCard" },
                    offers: {
                        "@type": "Offer",
                        priceCurrency: p.currency,
                        price: p.priceValue,
                        availability: "https://schema.org/InStock",
                        url: `${origin}${p.to}`,
                    },
                },
            })),
        };
    }, [products]);

    return (
        <section className="khp-products" aria-labelledby="khp-products-title">
            <div className="khp-container">
                <header className="khp-head">
                    <p className="kc-pill">Physical Cards</p>

                    <h2 id="khp-products-title" className="h3 khp-title">
                        Tap-to-Share Cards for Your{" "}
                        <span className="khp-accent">Digital</span>
                        <br />
                        <span className="khp-accent">Profile</span>
                    </h2>

                    <p className="kc-subheading khp-sub">
                        Tap to open your profile instantly - QR backup included.
                    </p>
                </header>

                <div className="khp-grid" role="list" aria-label="KonarCard products">
                    {products.map((item) => (
                        <article
                            key={item.sku}
                            className="khp-card"
                            role="listitem"
                            itemScope
                            itemType="https://schema.org/Product"
                        >
                            <meta itemProp="name" content={item.name} />
                            <meta itemProp="description" content={item.desc} />
                            <meta itemProp="sku" content={item.sku} />
                            <meta itemProp="image" content={item.img} />

                            <div className="khp-media">
                                {/* ✅ pill style now white outlined (like screenshot 2) */}
                                <span className="khp-tagPill" aria-label={item.tag}>
                                    {item.tag}
                                </span>

                                <img
                                    src={item.img}
                                    alt={item.alt}
                                    className="khp-media__img"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>

                            <div className="khp-divider" aria-hidden="true" />

                            <div className="khp-card__body">
                                <div className="khp-topCopy">
                                    {/* ✅ use global title class (no h6) */}
                                    <h3 className="kc-title khp-card__name">{item.name}</h3>
                                    <p className="body khp-desc">{item.desc}</p>
                                </div>

                                <div className="khp-buy">
                                    <div
                                        className="khp-priceRow"
                                        itemProp="offers"
                                        itemScope
                                        itemType="https://schema.org/Offer"
                                    >
                                        {/* ✅ use global body class, keep price styling via a small utility class in CSS (no font-size) */}
                                        <p className="body khp-price">
                                            {item.priceText}
                                            <meta itemProp="priceCurrency" content={item.currency} />
                                            <meta itemProp="price" content={String(item.priceValue)} />
                                            <link itemProp="availability" href="https://schema.org/InStock" />
                                        </p>
                                    </div>

                                    <div className="khp-actions">
                                        <Link
                                            to={item.to}
                                            className="kx-btn kx-btn--white khp-btn"
                                            aria-label={`View ${item.name}`}
                                            itemProp="url"
                                        >
                                            {item.cta}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* ✅ match screenshot copy */}
                <p className="body khp-note">
                    One-time card purchase. Your digital profile is free to start.
                </p>

                <div className="khp-ctaRow">
                    <Link to="/products" className="kx-btn kx-btn--black">
                        Shop Cards
                    </Link>
                </div>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
                />
            </div>
        </section>
    );
}