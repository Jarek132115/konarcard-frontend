// frontend/src/components/Cards/FlatCardPreview.jsx
// 2D flat card preview — base artwork (logo + NFC already baked into the image)
// plus the customer's custom text overlaid. Matches the purchased-products
// card list visual exactly.

import React from "react";

import WhiteFrontImg from "../../assets/images/Products/WhiteFront.jpg";
import BlackFrontImg from "../../assets/images/Products/BlackFront.jpg";
import BlueFrontImg from "../../assets/images/Products/BlueFront.jpg";
import GreenFrontImg from "../../assets/images/Products/GreenFront.jpg";
import MagentaFrontImg from "../../assets/images/Products/MagentaFront.jpg";
import OrangeFrontImg from "../../assets/images/Products/OrangeFront.jpg";

const ARTWORK = {
    "plastic-white": { src: WhiteFrontImg, textColor: "#111111" },
    "plastic-black": { src: BlackFrontImg, textColor: "#ffffff" },
    "plastic-blue": { src: BlueFrontImg, textColor: "#ffffff" },
    "plastic-green": { src: GreenFrontImg, textColor: "#ffffff" },
    "plastic-magenta": { src: MagentaFrontImg, textColor: "#ffffff" },
    "plastic-orange": { src: OrangeFrontImg, textColor: "#ffffff" },
};

const str = (v) => String(v ?? "").trim();

export default function FlatCardPreview({
    productKey,
    variant,
    frontText = "",
    frontFontWeight = 700,
    frontTextColor,
    maxWidth = 380,
}) {
    const key = str(productKey).toLowerCase();
    const v = str(variant).toLowerCase();
    const artworkKey = ARTWORK[key]
        ? key
        : v
            ? `plastic-${v}`
            : "plastic-white";
    const art = ARTWORK[artworkKey] || ARTWORK["plastic-white"];

    const textColor = str(frontTextColor) || art.textColor;
    const text = str(frontText);

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                maxWidth,
                aspectRatio: "85.6 / 54",
                borderRadius: 16,
                overflow: "hidden",
                background: "#f1f5f9",
                boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
                containerType: "inline-size",
            }}
            aria-label="Card preview"
        >
            {/* Base card artwork (logo + NFC are already in the image) */}
            <img
                src={art.src}
                alt=""
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                }}
                draggable={false}
            />

            {/* Custom business name — always fits inside the card */}
            {text ? (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 16%",
                        pointerEvents: "none",
                    }}
                >
                    <span
                        style={{
                            fontFamily: "'Cal Sans', Inter, sans-serif",
                            color: textColor,
                            // Scales with card width — always fits
                            fontSize: "clamp(14px, 8cqw, 38px)",
                            fontWeight: Math.max(400, Math.min(900, Number(frontFontWeight) || 700)),
                            letterSpacing: "0.01em",
                            lineHeight: 1.1,
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "100%",
                        }}
                    >
                        {text}
                    </span>
                </div>
            ) : null}
        </div>
    );
}
