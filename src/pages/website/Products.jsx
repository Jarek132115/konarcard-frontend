// frontend/src/pages/website/Products.jsx
import React, { useMemo } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";

/* Global typography/tokens */
import "../../styling/fonts.css";

/* Page CSS */
import "../../styling/products.css";

/* ✅ Product images */
import KonarCardWhiteImg from "../../assets/images/KonarCard-White.jpg";
import KonarCardBlackImg from "../../assets/images/KonarCard-Black.jpg";
import KonarCardBlueImg from "../../assets/images/KonarCard-Blue.jpg";
import KonarCardGreenImg from "../../assets/images/KonarCard-Green.jpg";
import KonarCardMagentaImg from "../../assets/images/KonarCard-Magenta.jpg";
import KonarCardOrangeImg from "../../assets/images/KonarCard-Orange.jpg";

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

                <ProductsPageFAQ />
            </main>

            <Footer />
        </>
    );
}