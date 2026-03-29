import PlasticCardImg from "../../assets/images/PlasticCard.jpg";
import MetalCardImg from "../../assets/images/MetalCard.jpg";
import KonarTagImg from "../../assets/images/KonarTag.jpg";

export const CARDS_PRODUCT_CATALOG = [
    {
        key: "plastic-card",
        tag: "Best Value",
        title: "Plastic NFC Business Card",
        desc: "Durable, lightweight NFC business card for everyday networking and on-site use.",
        priceText: "£29.99",
        cta: "Choose Plastic Card",
        image: PlasticCardImg,
        imageAlt: "Plastic NFC business card",
    },
    {
        key: "metal-card",
        tag: "Premium",
        title: "Metal NFC Business Card",
        desc: "Premium metal NFC business card designed to make a strong first impression.",
        priceText: "£44.99",
        cta: "Choose Metal Card",
        image: MetalCardImg,
        imageAlt: "Metal NFC business card",
    },
    {
        key: "konartag",
        tag: "Accessory",
        title: "KonarTag NFC Key Tag",
        desc: "Compact NFC key tag that shares your profile instantly with a tap or QR scan.",
        priceText: "£9.99",
        cta: "Choose KonarTag",
        image: KonarTagImg,
        imageAlt: "KonarTag NFC key tag",
    },
];