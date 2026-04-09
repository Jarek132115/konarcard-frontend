// frontend/src/pages/website/Products.jsx
import React, { useMemo } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";

/* Global typography/tokens */
import "../../styling/fonts.css";

/* Page CSS */
import "../../styling/products.css";

/* ✅ Product image (same image used for all 6 for now) */
import PlasticCardImg from "../../assets/images/PlasticCard.jpg";

/* ✅ Sections */
import ProductsPageHero from "./productspage/ProductsPageHero";
import ProductsPageRealWorld from "./productspage/ProductsPageRealWorld";
import ProductsPageFAQ from "./productspage/ProductsPageFAQ";

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
                tag: "Essential",
                name: "KonarCard Basic",
                desc: "Clean white plastic NFC business card with your logo and QR code.",
                priceText: "£29.99",
                to: "/products/plastic-basic",
                img: PlasticCardImg,
                alt: "KonarCard Basic plastic NFC business card",
                sku: "konarcard-plastic-basic",
                cta: "View Basic Card",
            },
            {
                tag: "Popular",
                name: "KonarCard Signature",
                desc: "Plastic NFC business card with a premium branded background design.",
                priceText: "£29.99",
                to: "/products/plastic-signature",
                img: PlasticCardImg,
                alt: "KonarCard Signature plastic NFC business card",
                sku: "konarcard-plastic-signature",
                cta: "View Signature Card",
            },
            {
                tag: "Modern",
                name: "KonarCard Midnight",
                desc: "Dark premium-style plastic NFC business card with a bold modern look.",
                priceText: "£29.99",
                to: "/products/plastic-midnight",
                img: PlasticCardImg,
                alt: "KonarCard Midnight plastic NFC business card",
                sku: "konarcard-plastic-midnight",
                cta: "View Midnight Card",
            },
            {
                tag: "Minimal",
                name: "KonarCard Graphite",
                desc: "Plastic NFC business card with a refined background built for clean branding.",
                priceText: "£29.99",
                to: "/products/plastic-graphite",
                img: PlasticCardImg,
                alt: "KonarCard Graphite plastic NFC business card",
                sku: "konarcard-plastic-graphite",
                cta: "View Graphite Card",
            },
            {
                tag: "Warm",
                name: "KonarCard Sand",
                desc: "Plastic NFC business card with a softer premium design and logo-led finish.",
                priceText: "£29.99",
                to: "/products/plastic-sand",
                img: PlasticCardImg,
                alt: "KonarCard Sand plastic NFC business card",
                sku: "konarcard-plastic-sand",
                cta: "View Sand Card",
            },
            {
                tag: "Professional",
                name: "KonarCard Slate",
                desc: "Plastic NFC business card with a polished background for a premium first impression.",
                priceText: "£29.99",
                to: "/products/plastic-slate",
                img: PlasticCardImg,
                alt: "KonarCard Slate plastic NFC business card",
                sku: "konarcard-plastic-slate",
                cta: "View Slate Card",
            },
        ],
        []
    );

    const realWorldTop = useMemo(
        () => [
            {
                pill: "Use it on-site",
                title: "Tap to swap details on the spot",
                points: [
                    "Tap to open your profile instantly",
                    "Works even when you’re busy on a job",
                    "No app needed, just tap or scan",
                ],
            },
            {
                pill: "Win more jobs",
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

    return (
        <>
            <Navbar />

            <main className="kc-products kc-page kp-page">
                <ProductsPageHero products={products} />

                <ProductsPageRealWorld
                    topCards={realWorldTop}
                    gridCards={realWorldGrid}
                />

                {/* ❌ Removed BestChoice section */}

                <ProductsPageFAQ />
            </main>

            <Footer />
        </>
    );
}