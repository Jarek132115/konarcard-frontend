// frontend/src/pages/website/Products.jsx
import React, { useEffect, useMemo } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";

/* Global typography/tokens */
import "../../styling/fonts.css";

/* Page CSS */
import "../../styling/products.css";

/* Product images */
import KonarCardWhiteImg from "../../assets/images/KonarCard-White.jpg";
import KonarCardBlackImg from "../../assets/images/KonarCard-Black.jpg";
import KonarCardBlueImg from "../../assets/images/KonarCard-Blue.jpg";
import KonarCardGreenImg from "../../assets/images/KonarCard-Green.jpg";
import KonarCardMagentaImg from "../../assets/images/KonarCard-Magenta.jpg";
import KonarCardOrangeImg from "../../assets/images/KonarCard-Orange.jpg";

/* Sections */
import ProductsPageHero from "./productspage/ProductsPageHero";
import ProductsPageRealWorld from "./productspage/ProductsPageRealWorld";
import ProductsPageFAQ from "./productspage/ProductsPageFAQ";

/* ─── SEO helpers (same pattern as Home.jsx) ─── */
function upsertMeta(attr, key, value) {
    const selector = `meta[${attr}="${key}"]`;
    let el = document.head.querySelector(selector);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", value);
}

function upsertLink(rel, href) {
    const selector = `link[rel="${rel}"]`;
    let el = document.head.querySelector(selector);
    if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
    }
    el.setAttribute("href", href);
}

function upsertJsonLd(id, json) {
    const selector = `script[type="application/ld+json"][data-kc="${id}"]`;
    let el = document.head.querySelector(selector);
    if (!el) {
        el = document.createElement("script");
        el.type = "application/ld+json";
        el.setAttribute("data-kc", id);
        document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(json);
}

export default function Products() {
    /* ─── SEO ─── */
    useEffect(() => {
        const siteUrl = "https://www.konarcard.com";
        const pageUrl = `${siteUrl}/products`;

        // Absolute URLs to product images (Google requires absolute URLs for schema.org)
        const absoluteImage = (src) => {
            const s = String(src || "");
            if (!s) return `${siteUrl}/konarcard-og.jpg`;
            if (/^https?:\/\//i.test(s)) return s;
            if (s.startsWith("/")) return `${siteUrl}${s}`;
            return `${siteUrl}/${s}`;
        };
        const imgWhite = absoluteImage(KonarCardWhiteImg);
        const imgBlack = absoluteImage(KonarCardBlackImg);
        const imgBlue = absoluteImage(KonarCardBlueImg);
        const imgGreen = absoluteImage(KonarCardGreenImg);
        const imgMagenta = absoluteImage(KonarCardMagentaImg);
        const imgOrange = absoluteImage(KonarCardOrangeImg);

        const title =
            "NFC Business Cards & Contactless Cards UK | KonarCard Shop";
        const description =
            "Browse KonarCard NFC business cards — plastic cards, metal cards and key tags. Tap or scan to share your digital profile instantly. Free UK delivery.";

        document.title = title;

        upsertMeta("name", "description", description);
        upsertLink("canonical", pageUrl);

        // Open Graph
        upsertMeta("property", "og:title", title);
        upsertMeta("property", "og:description", description);
        upsertMeta("property", "og:url", pageUrl);
        upsertMeta("property", "og:type", "website");

        // Twitter
        upsertMeta("name", "twitter:card", "summary_large_image");
        upsertMeta("name", "twitter:title", title);
        upsertMeta("name", "twitter:description", description);

        // Breadcrumb schema
        upsertJsonLd("products-breadcrumb", {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: siteUrl,
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: "NFC Business Cards",
                    item: pageUrl,
                },
            ],
        });

        // ItemList schema for product grid
        upsertJsonLd("products-itemlist", {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "KonarCard NFC Business Cards",
            url: pageUrl,
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    item: {
                        "@type": "Product",
                        name: "KonarCard White",
                        description:
                            "Clean white plastic NFC business card with your logo and QR code.",
                        url: `${siteUrl}/products/plastic-white`,
                        image: [imgWhite],
                        sku: "konarcard-plastic-white",
                        brand: { "@type": "Brand", name: "KonarCard" },
                        offers: {
                            "@type": "Offer",
                            price: "19.99",
                            priceCurrency: "GBP",
                            availability: "https://schema.org/InStock",
                            url: `${siteUrl}/products/plastic-white`,
                        },
                    },
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    item: {
                        "@type": "Product",
                        name: "KonarCard Black",
                        description:
                            "Bold black plastic NFC business card with a sleek premium finish.",
                        url: `${siteUrl}/products/plastic-black`,
                        image: [imgBlack],
                        sku: "konarcard-plastic-black",
                        brand: { "@type": "Brand", name: "KonarCard" },
                        offers: {
                            "@type": "Offer",
                            price: "19.99",
                            priceCurrency: "GBP",
                            availability: "https://schema.org/InStock",
                            url: `${siteUrl}/products/plastic-black`,
                        },
                    },
                },
                {
                    "@type": "ListItem",
                    position: 3,
                    item: {
                        "@type": "Product",
                        name: "KonarCard Blue",
                        description:
                            "Professional blue plastic NFC business card designed to stand out cleanly.",
                        url: `${siteUrl}/products/plastic-blue`,
                        image: [imgBlue],
                        sku: "konarcard-plastic-blue",
                        brand: { "@type": "Brand", name: "KonarCard" },
                        offers: {
                            "@type": "Offer",
                            price: "19.99",
                            priceCurrency: "GBP",
                            availability: "https://schema.org/InStock",
                            url: `${siteUrl}/products/plastic-blue`,
                        },
                    },
                },
                {
                    "@type": "ListItem",
                    position: 4,
                    item: {
                        "@type": "Product",
                        name: "KonarCard Green",
                        description:
                            "Modern green plastic NFC business card with a sharp branded look.",
                        url: `${siteUrl}/products/plastic-green`,
                        image: [imgGreen],
                        sku: "konarcard-plastic-green",
                        brand: { "@type": "Brand", name: "KonarCard" },
                        offers: {
                            "@type": "Offer",
                            price: "19.99",
                            priceCurrency: "GBP",
                            availability: "https://schema.org/InStock",
                            url: `${siteUrl}/products/plastic-green`,
                        },
                    },
                },
                {
                    "@type": "ListItem",
                    position: 5,
                    item: {
                        "@type": "Product",
                        name: "KonarCard Magenta",
                        description:
                            "Strong magenta plastic NFC business card for a vibrant premium finish.",
                        url: `${siteUrl}/products/plastic-magenta`,
                        image: [imgMagenta],
                        sku: "konarcard-plastic-magenta",
                        brand: { "@type": "Brand", name: "KonarCard" },
                        offers: {
                            "@type": "Offer",
                            price: "19.99",
                            priceCurrency: "GBP",
                            availability: "https://schema.org/InStock",
                            url: `${siteUrl}/products/plastic-magenta`,
                        },
                    },
                },
                {
                    "@type": "ListItem",
                    position: 6,
                    item: {
                        "@type": "Product",
                        name: "KonarCard Orange",
                        description:
                            "High-impact orange plastic NFC business card with a confident branded style.",
                        url: `${siteUrl}/products/plastic-orange`,
                        image: [imgOrange],
                        sku: "konarcard-plastic-orange",
                        brand: { "@type": "Brand", name: "KonarCard" },
                        offers: {
                            "@type": "Offer",
                            price: "19.99",
                            priceCurrency: "GBP",
                            availability: "https://schema.org/InStock",
                            url: `${siteUrl}/products/plastic-orange`,
                        },
                    },
                },
            ],
        });
    }, []);

    /* ─── Product data ─── */
    const products = useMemo(
        () => [
            {
                tag: "Essential",
                name: "KonarCard White",
                desc: "Clean white plastic NFC business card with your logo and QR code.",
                priceText: "£19.99",
                to: "/products/plastic-white",
                img: KonarCardWhiteImg,
                alt: "KonarCard White plastic NFC business card",
                sku: "konarcard-plastic-white",
                cta: "View White Card",
            },
            {
                tag: "Popular",
                name: "KonarCard Black",
                desc: "Bold black plastic NFC business card with a sleek premium finish.",
                priceText: "£19.99",
                to: "/products/plastic-black",
                img: KonarCardBlackImg,
                alt: "KonarCard Black plastic NFC business card",
                sku: "konarcard-plastic-black",
                cta: "View Black Card",
            },
            {
                tag: "Modern",
                name: "KonarCard Blue",
                desc: "Professional blue plastic NFC business card designed to stand out cleanly.",
                priceText: "£19.99",
                to: "/products/plastic-blue",
                img: KonarCardBlueImg,
                alt: "KonarCard Blue plastic NFC business card",
                sku: "konarcard-plastic-blue",
                cta: "View Blue Card",
            },
            {
                tag: "Fresh",
                name: "KonarCard Green",
                desc: "Modern green plastic NFC business card with a sharp branded look.",
                priceText: "£19.99",
                to: "/products/plastic-green",
                img: KonarCardGreenImg,
                alt: "KonarCard Green plastic NFC business card",
                sku: "konarcard-plastic-green",
                cta: "View Green Card",
            },
            {
                tag: "Bold",
                name: "KonarCard Magenta",
                desc: "Strong magenta plastic NFC business card for a vibrant premium finish.",
                priceText: "£19.99",
                to: "/products/plastic-magenta",
                img: KonarCardMagentaImg,
                alt: "KonarCard Magenta plastic NFC business card",
                sku: "konarcard-plastic-magenta",
                cta: "View Magenta Card",
            },
            {
                tag: "Warm",
                name: "KonarCard Orange",
                desc: "High-impact orange plastic NFC business card with a confident branded style.",
                priceText: "£19.99",
                to: "/products/plastic-orange",
                img: KonarCardOrangeImg,
                alt: "KonarCard Orange plastic NFC business card",
                sku: "konarcard-plastic-orange",
                cta: "View Orange Card",
            },
        ],
        []
    );

    return (
        <>
            <Navbar />

            <main className="kc-products kc-page kp-page">
                <ProductsPageHero products={products} />
                <ProductsPageRealWorld />
                <ProductsPageFAQ />
            </main>

            <Footer />
        </>
    );
}
