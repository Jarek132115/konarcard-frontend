// frontend/src/components/Cards/FlatCardPreview.jsx
// 2D flat card preview that overlays the custom text, logo and QR on top of
// the product artwork. Used as the primary admin preview and as the fallback
// for the user-facing order details when the 3D preview fails.

import React from "react";

import WhiteFrontImg from "../../assets/images/Products/WhiteFront.jpg";
import BlackFrontImg from "../../assets/images/Products/BlackFront.jpg";
import BlueFrontImg from "../../assets/images/Products/BlueFront.jpg";
import GreenFrontImg from "../../assets/images/Products/GreenFront.jpg";
import MagentaFrontImg from "../../assets/images/Products/MagentaFront.jpg";
import OrangeFrontImg from "../../assets/images/Products/OrangeFront.jpg";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import LogoIconWhite from "../../assets/icons/Logo-Icon-White.svg";

const ARTWORK = {
    "plastic-white": { src: WhiteFrontImg, dark: false, textColor: "#111111" },
    "plastic-black": { src: BlackFrontImg, dark: true, textColor: "#ffffff" },
    "plastic-blue": { src: BlueFrontImg, dark: true, textColor: "#ffffff" },
    "plastic-green": { src: GreenFrontImg, dark: true, textColor: "#ffffff" },
    "plastic-magenta": { src: MagentaFrontImg, dark: true, textColor: "#ffffff" },
    "plastic-orange": { src: OrangeFrontImg, dark: true, textColor: "#ffffff" },
};

const str = (v) => String(v ?? "").trim();

export default function FlatCardPreview({
    productKey,
    variant,
    frontText = "",
    frontFontSize = 42,
    frontFontWeight = 700,
    frontTextColor,
    qrSrc,
    logoSrc,
    nfcIndicator = true,
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
    const resolvedLogo = str(logoSrc) || (art.dark ? LogoIconWhite : LogoIcon);

    // Card aspect is 85.6 × 54 (≈ 1.585:1)
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
            }}
            aria-label="Card preview"
        >
            {/* Base artwork */}
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

            {/* Top-left logo */}
            <img
                src={resolvedLogo}
                alt="Logo"
                style={{
                    position: "absolute",
                    top: "10%",
                    left: "7%",
                    width: "13%",
                    height: "auto",
                    opacity: 0.95,
                    pointerEvents: "none",
                }}
                draggable={false}
            />

            {/* NFC indicator top-right */}
            {nfcIndicator ? (
                <svg
                    viewBox="0 0 32 32"
                    style={{
                        position: "absolute",
                        top: "10%",
                        right: "7%",
                        width: "11%",
                        height: "auto",
                        color: textColor,
                        opacity: 0.85,
                    }}
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M12 8c3 2 3 14 0 16M17 6c5 3 5 17 0 20M22 4c7 4 7 20 0 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            ) : null}

            {/* Front text — centered */}
            {frontText ? (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 14%",
                        pointerEvents: "none",
                    }}
                >
                    <span
                        style={{
                            fontFamily: "'Cal Sans', Inter, sans-serif",
                            color: textColor,
                            fontSize: `clamp(14px, ${Math.max(18, Math.min(56, Number(frontFontSize) || 42)) * 0.32}vw, ${Math.max(18, Math.min(56, Number(frontFontSize) || 42))}px)`,
                            fontWeight: Math.max(400, Math.min(900, Number(frontFontWeight) || 700)),
                            letterSpacing: "0.01em",
                            lineHeight: 1.1,
                            textAlign: "center",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "100%",
                        }}
                    >
                        {frontText}
                    </span>
                </div>
            ) : null}

            {/* Small QR bottom-right */}
            {qrSrc ? (
                <img
                    src={qrSrc}
                    alt="QR"
                    style={{
                        position: "absolute",
                        bottom: "7%",
                        right: "6%",
                        width: "22%",
                        height: "auto",
                        borderRadius: 4,
                        background: "#ffffff",
                        padding: "3%",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                    draggable={false}
                />
            ) : null}
        </div>
    );
}
