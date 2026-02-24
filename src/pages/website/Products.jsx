// frontend/src/pages/website/Products.jsx
import React, { useMemo } from "react";
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

/* ✅ Sections */
import ProductsPageHero from "./productspage/ProductsPageHero";
import ProductsPageBundles from "./productspage/ProductsPageBundles";
import ProductsPageRealWorld from "./productspage/ProductsPageRealWorld";
import ProductsPageBestChoice from "./productspage/ProductsPageBestChoice";
import ProductsPageFAQ from "./productspage/ProductsPageFAQ"; // ✅ NEW

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
                tag: "Best Value",
                name: "KonarCard - Plastic NFC Business Card",
                desc: "Durable, lightweight NFC business card for everyday networking and on-site use.",
                priceText: "£29.99",
                to: "/products/plastic-card",
                img: PlasticCardImg,
                alt: "KonarCard Plastic Edition – plastic NFC business card with QR code",
                sku: "konarcard-plastic",
                cta: "View Plastic Card",
            },
            {
                tag: "Premium",
                name: "KonarCard - Metal NFC Business Card",
                desc: "Premium metal NFC business card designed to make a strong first impression.",
                priceText: "£44.99",
                to: "/products/metal-card",
                img: MetalCardImg,
                alt: "KonarCard Metal Edition – metal NFC business card with QR code",
                sku: "konarcard-metal",
                cta: "View Metal Card",
            },
            {
                tag: "Accessory",
                name: "KonarTag - NFC Key Tag",
                desc: "Compact NFC key tag that shares your profile instantly with a tap or QR scan.",
                priceText: "£9.99",
                to: "/products/konartag",
                img: KonarTagImg,
                alt: "KonarTag – NFC key tag that opens your digital business card profile",
                sku: "konartag",
                cta: "View KonarTag",
            },
        ],
        []
    );

    const bundles = useMemo(
        () => [
            {
                sku: "bundle-plastic-starter",
                tag: "Best value",
                name: "Plastic NFC Starter Bundle",
                desc: "Everything you need to start sharing your profile today.",
                includes: ["1x Plastic NFC Business Card", "1x KonarTag NFC Key Tag", "12-Month Plus Plan Subscription"],
                price: "£39.99",
                was: "£49.97",
                save: "Save £10",
                to: "/products/plastic-bundle",
                cta: "Get Starter Bundle",
                imgCard: PlasticCardImg,
                imgTag: KonarTagImg,
                altCard: "Plastic NFC business card included in the starter bundle",
                altTag: "KonarTag key tag included in the starter bundle",
            },
            {
                sku: "bundle-metal-pro",
                tag: "Premium bundle",
                name: "Metal NFC Pro Bundle",
                desc: "Premium setup for trades who want to stand out instantly.",
                includes: ["1x Metal NFC Business Card", "1x KonarTag NFC Key Tag", "12-Month Plus Plan Subscription"],
                price: "£54.99",
                was: "£69.97",
                save: "Save £15",
                to: "/products/metal-bundle",
                cta: "Get Pro Bundle",
                imgCard: MetalCardImg,
                imgTag: KonarTagImg,
                altCard: "Metal NFC business card included in the pro bundle",
                altTag: "KonarTag key tag included in the pro bundle",
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

    return (
        <>
            <Navbar />

            <main className="kc-products kc-page kp-page">
                {/* HERO (heading + 3 product cards) */}
                <ProductsPageHero products={products} />

                {/* BUNDLES */}
                <ProductsPageBundles bundles={bundles} />

                {/* REAL WORLD */}
                <ProductsPageRealWorld topCards={realWorldTop} gridCards={realWorldGrid} />

                {/* BEST CHOICE (Choose the right card) */}
                <ProductsPageBestChoice />

                {/* PRODUCT FAQ */}
                <ProductsPageFAQ />
            </main>

            <Footer />
        </>
    );
}