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
                name: "KonarCard – Plastic Edition",
                desc: "Durable, lightweight NFC business card for everyday use.",
                priceText: "£29.99",
                priceValue: 29.99,
                currency: "GBP",
                to: "/products/plastic-card",
                img: PlasticCardImg,
                alt: "KonarCard Plastic Edition – plastic NFC business card with QR code",
                sku: "konarcard-plastic",
            },
            {
                tag: "Premium",
                name: "KonarCard – Metal Edition",
                desc: "Premium metal NFC card designed to make a strong first impression.",
                priceText: "£44.99",
                priceValue: 44.99,
                currency: "GBP",
                to: "/products/metal-card",
                img: MetalCardImg,
                alt: "KonarCard Metal Edition – metal NFC business card with QR code",
                sku: "konarcard-metal",
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
            name: "KonarCard NFC Business Cards",
            itemListElement: products.map((p, idx) => ({
                "@type": "ListItem",
                position: idx + 1,
                item: {
                    "@type": "Product",
                    name: p.name,
                    description: p.desc,
                    // In a bundled React app, imported images resolve to a full URL string.
                    // Use it directly rather than trying to prefix origin.
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
                <header className="khp-hero">
                    <p className="khp-kicker">NFC business cards that share your details instantly</p>

                    <h2 id="khp-products-title" className="h2 khp-title">
                        Contactless NFC Business Cards for Your Digital Profile
                    </h2>

                    <p className="body-s khp-sub">
                        KonarCard is a <strong>digital business card</strong> you can share in person with an{" "}
                        <strong>NFC business card</strong> tap — plus QR code and link sharing. A modern contactless business card
                        that replaces paper.
                    </p>
                </header>

                <div className="khp-grid" role="list">
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
                                <span className="khp-pill" aria-label={item.tag}>
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
                                <h3 className="h6 khp-card__name">{item.name}</h3>
                                <p className="body-s khp-desc">{item.desc}</p>

                                <div className="khp-priceRow" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                                    <p className="h6 khp-price">
                                        {item.priceText}
                                        <meta itemProp="priceCurrency" content={item.currency} />
                                        <meta itemProp="price" content={String(item.priceValue)} />
                                        <link itemProp="availability" href="https://schema.org/InStock" />
                                    </p>
                                </div>

                                <div className="khp-actions">
                                    <Link to={item.to} className="khp-btn" aria-label={`View ${item.name}`} itemProp="url">
                                        View product
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <p className="khp-note">
                    Your KonarCard works with your digital profile. The card is a one-time purchase. Profiles are free to start.
                </p>

                <div className="khp-ctaRow">
                    <Link to="/products" className="khp-cta khp-cta--primary">
                        Shop Business Cards
                    </Link>
                    <Link to="/how-it-works" className="khp-cta khp-cta--ghost">
                        See How The Cards Work
                    </Link>
                </div>

                {/* ✅ SEO schema */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
            </div>
        </section>
    );
}
