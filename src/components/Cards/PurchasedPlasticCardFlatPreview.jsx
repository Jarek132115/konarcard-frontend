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

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getVariantFromCard(card, explicitProductKey = "") {
    const productKey = safeTrim(explicitProductKey || card?.productKey).toLowerCase();
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
                textShadow: "0 2px 10px rgba(0,0,0,0.22)",
            };
        case "blue":
            return {
                frontSrc: BlueFrontImg,
                textColor: "#ffffff",
                textShadow: "0 2px 10px rgba(15, 23, 42, 0.18)",
            };
        case "green":
            return {
                frontSrc: GreenFrontImg,
                textColor: "#ffffff",
                textShadow: "0 2px 10px rgba(15, 23, 42, 0.18)",
            };
        case "magenta":
            return {
                frontSrc: MagentaFrontImg,
                textColor: "#ffffff",
                textShadow: "0 2px 10px rgba(15, 23, 42, 0.18)",
            };
        case "orange":
            return {
                frontSrc: OrangeFrontImg,
                textColor: "#ffffff",
                textShadow: "0 2px 10px rgba(15, 23, 42, 0.18)",
            };
        case "white":
        default:
            return {
                frontSrc: WhiteFrontImg,
                textColor: "#111111",
                textShadow: "0 1px 0 rgba(255,255,255,0.22)",
            };
    }
}

function resolveFrontText(card) {
    const text =
        safeTrim(card?.frontText) ||
        safeTrim(card?._raw?.preview?.customization?.frontText) ||
        safeTrim(card?._raw?.customization?.frontText) ||
        "KONAR";

    return text.slice(0, 26);
}

function resolveFontWeight(card) {
    const raw =
        Number(card?.frontFontWeight) ||
        Number(card?._raw?.preview?.customization?.fontWeight) ||
        Number(card?._raw?.customization?.fontWeight) ||
        700;

    return clamp(raw, 500, 900);
}

function resolveTextColor(card, fallback) {
    return (
        safeTrim(card?.frontTextColor) ||
        safeTrim(card?._raw?.preview?.customization?.textColor) ||
        safeTrim(card?._raw?.customization?.textColor) ||
        fallback
    );
}

function resolveTextScaleClass(text) {
    const len = safeTrim(text).length;

    if (len >= 19) return "ppcfp-frontText--xs";
    if (len >= 15) return "ppcfp-frontText--sm";
    if (len >= 11) return "ppcfp-frontText--md";
    return "ppcfp-frontText--lg";
}

export default function PurchasedPlasticCardFlatPreview({
    card,
    productKey = "",
    className = "",
}) {
    const variant = getVariantFromCard(card, productKey);

    const artwork = useMemo(() => getArtworkByVariant(variant), [variant]);

    const frontText = resolveFrontText(card);
    const fontWeight = resolveFontWeight(card);
    const textColor = resolveTextColor(card, artwork.textColor);
    const textScaleClass = resolveTextScaleClass(frontText);

    return (
        <div className={`ppcfp ${className}`.trim()} aria-hidden="true">
            <div className="ppcfp-stage">
                <div
                    className="ppcfp-card"
                    style={{
                        backgroundImage: `url(${artwork.frontSrc})`,
                    }}
                >
                    <div
                        className={`ppcfp-frontText ${textScaleClass}`}
                        style={{
                            color: textColor,
                            fontWeight,
                            textShadow: artwork.textShadow,
                        }}
                        title={frontText}
                    >
                        {frontText}
                    </div>
                </div>
            </div>
        </div>
    );
}