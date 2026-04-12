import React, { useMemo } from "react";

import "../../styling/dashboard/purchased-plastic-card-flat-preview.css";

import WhiteFrontImg from "../../assets/images/Products/WhiteFront.jpg";
import BlackFrontImg from "../../assets/images/Products/BlackFront.jpg";
import BlueFrontImg from "../../assets/images/Products/BlueFront.jpg";
import GreenFrontImg from "../../assets/images/Products/GreenFront.jpg";
import MagentaFrontImg from "../../assets/images/Products/MagentaFront.jpg";
import OrangeFrontImg from "../../assets/images/Products/OrangeFront.jpg";

function safeTrim(v) {
    return String(v || "").trim();
}

function getVariantFromCard(card) {
    const productKey = safeTrim(card?.productKey).toLowerCase();
    const variantRaw = safeTrim(card?.variantRaw || card?.preview?.variant).toLowerCase();

    if (variantRaw) return variantRaw;

    if (productKey === "plastic-black") return "black";
    if (productKey === "plastic-blue") return "blue";
    if (productKey === "plastic-green") return "green";
    if (productKey === "plastic-magenta") return "magenta";
    if (productKey === "plastic-orange") return "orange";

    return "white";
}

function getArtworkByVariant(variant) {
    switch (safeTrim(variant).toLowerCase()) {
        case "black":
            return {
                frontSrc: BlackFrontImg,
                textColor: "#ffffff",
                shadow: "0 18px 42px rgba(15, 23, 42, 0.22)",
            };
        case "blue":
            return {
                frontSrc: BlueFrontImg,
                textColor: "#ffffff",
                shadow: "0 18px 42px rgba(15, 82, 255, 0.22)",
            };
        case "green":
            return {
                frontSrc: GreenFrontImg,
                textColor: "#ffffff",
                shadow: "0 18px 42px rgba(21, 165, 58, 0.22)",
            };
        case "magenta":
            return {
                frontSrc: MagentaFrontImg,
                textColor: "#ffffff",
                shadow: "0 18px 42px rgba(209, 0, 143, 0.22)",
            };
        case "orange":
            return {
                frontSrc: OrangeFrontImg,
                textColor: "#ffffff",
                shadow: "0 18px 42px rgba(255, 123, 0, 0.22)",
            };
        case "white":
        default:
            return {
                frontSrc: WhiteFrontImg,
                textColor: "#111111",
                shadow: "0 18px 42px rgba(15, 23, 42, 0.12)",
            };
    }
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function resolveFrontText(card) {
    const text =
        safeTrim(card?.frontText) ||
        safeTrim(card?._raw?.preview?.customization?.frontText) ||
        safeTrim(card?._raw?.customization?.frontText) ||
        "KONAR";

    return text.slice(0, 22);
}

function resolveFontWeight(card) {
    const raw =
        Number(card?.frontFontWeight) ||
        Number(card?._raw?.preview?.customization?.fontWeight) ||
        Number(card?._raw?.customization?.fontWeight) ||
        700;

    return clamp(raw, 400, 900);
}

function resolveFontSize(card) {
    const raw =
        Number(card?.frontFontSize) ||
        Number(card?._raw?.preview?.customization?.fontSize) ||
        Number(card?._raw?.customization?.fontSize) ||
        42;

    return clamp(raw, 20, 52);
}

function resolveTextColor(card, fallback) {
    return (
        safeTrim(card?.frontTextColor) ||
        safeTrim(card?._raw?.preview?.customization?.textColor) ||
        safeTrim(card?._raw?.customization?.textColor) ||
        fallback
    );
}

export default function PurchasedPlasticCardFlatPreview({
    card,
    className = "",
}) {
    const variant = getVariantFromCard(card);

    const artwork = useMemo(() => getArtworkByVariant(variant), [variant]);

    const frontText = resolveFrontText(card);
    const fontWeight = resolveFontWeight(card);
    const fontSize = resolveFontSize(card);
    const textColor = resolveTextColor(card, artwork.textColor);

    return (
        <div className={`ppcfp ${className}`.trim()} aria-hidden="true">
            <div
                className="ppcfp-card"
                style={{
                    backgroundImage: `url(${artwork.frontSrc})`,
                    boxShadow: artwork.shadow,
                }}
            >
                <div
                    className="ppcfp-frontText"
                    style={{
                        color: textColor,
                        fontWeight,
                        fontSize: `${fontSize}px`,
                    }}
                    title={frontText}
                >
                    {frontText}
                </div>
            </div>
        </div>
    );
}