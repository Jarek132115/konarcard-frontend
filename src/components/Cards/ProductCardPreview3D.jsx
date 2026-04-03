import React, { useEffect, useMemo, useState } from "react";

import PlasticCard3D from "../PlasticCard3D";
import MetalCard3D from "../MetalCard3D";
import KonarTag3D from "../KonarTag3D";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import LogoIconWhite from "../../assets/icons/Logo-Icon-White.svg";
import CardQrCode from "../../assets/images/CardQrCode.png";

const LOGO_CHANGE_MS = 4000;
const LOGO_STEPS_PER_VARIANT = 4;
const DEFAULT_LOGO_PERCENT = 70;

function svgLogoDataUrl({
    text = "KC",
    color = "#0f172a",
    accent = "#f97316",
}) {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
      <rect x="64" y="64" width="384" height="384" rx="112" fill="${accent}" opacity="0.14"/>
      <text
        x="50%"
        y="54%"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="164"
        font-weight="800"
        fill="${color}"
      >${text}</text>
    </svg>
  `;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getVariantSequence(productKey) {
    if (productKey === "metal-card") return ["black", "gold"];
    if (productKey === "konartag") return ["black", "gold"];
    return ["white", "black"];
}

function getLogoSequenceForVariant(productKey, variant) {
    const isDark =
        variant === "black" ||
        (productKey === "metal-card" && variant === "black") ||
        (productKey === "konartag" && variant === "black");

    const isGold = variant === "gold";

    if (isDark) {
        return [
            LogoIconWhite,
            svgLogoDataUrl({ text: "KC", color: "#ffffff", accent: "#f97316" }),
            svgLogoDataUrl({ text: "K", color: "#fb923c", accent: "#ffffff" }),
            svgLogoDataUrl({ text: "KC", color: "#fdba74", accent: "#ffffff" }),
        ];
    }

    if (isGold) {
        return [
            LogoIcon,
            svgLogoDataUrl({ text: "KC", color: "#0f172a", accent: "#ffffff" }),
            svgLogoDataUrl({ text: "K", color: "#7c5a10", accent: "#ffffff" }),
            svgLogoDataUrl({ text: "KC", color: "#1e293b", accent: "#fff7d6" }),
        ];
    }

    return [
        LogoIcon,
        svgLogoDataUrl({ text: "KC", color: "#0f172a", accent: "#f97316" }),
        svgLogoDataUrl({ text: "K", color: "#f97316", accent: "#0f172a" }),
        svgLogoDataUrl({ text: "KC", color: "#1e293b", accent: "#fb923c" }),
    ];
}

function renderCard3D({ productKey, logoSrc, qrSrc, logoPercent, variant }) {
    if (productKey === "metal-card") {
        return (
            <MetalCard3D
                logoSrc={logoSrc}
                qrSrc={qrSrc}
                logoSize={logoPercent}
                finish={variant}
            />
        );
    }

    if (productKey === "konartag") {
        return (
            <KonarTag3D
                logoSrc={logoSrc}
                qrSrc={qrSrc}
                logoSize={logoPercent}
                finish={variant}
            />
        );
    }

    return (
        <PlasticCard3D
            logoSrc={logoSrc}
            qrSrc={qrSrc}
            logoSize={logoPercent}
            variant={variant}
        />
    );
}

export default function ProductCardPreview3D({
    productKey,
    className = "",
    logoPercent = DEFAULT_LOGO_PERCENT,
}) {
    const variantSequence = useMemo(() => getVariantSequence(productKey), [productKey]);

    const [variantIndex, setVariantIndex] = useState(0);
    const [logoStep, setLogoStep] = useState(0);

    const currentVariant =
        variantSequence[variantIndex] || variantSequence[0] || "white";

    const logoSequence = useMemo(
        () => getLogoSequenceForVariant(productKey, currentVariant),
        [productKey, currentVariant]
    );

    const currentLogo = logoSequence[logoStep] || logoSequence[0] || LogoIcon;

    useEffect(() => {
        setVariantIndex(0);
        setLogoStep(0);
    }, [productKey]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setLogoStep((prevLogoStep) => {
                const nextLogoStep = prevLogoStep + 1;

                if (nextLogoStep >= LOGO_STEPS_PER_VARIANT) {
                    setVariantIndex((prevVariantIndex) => {
                        const nextVariantIndex = prevVariantIndex + 1;
                        return nextVariantIndex >= variantSequence.length ? 0 : nextVariantIndex;
                    });
                    return 0;
                }

                return nextLogoStep;
            });
        }, LOGO_CHANGE_MS);

        return () => {
            window.clearInterval(timer);
        };
    }, [variantSequence.length]);

    return (
        <div className={`cp-preview3dWrap ${className}`.trim()} aria-hidden="true">
            {renderCard3D({
                productKey,
                logoSrc: currentLogo,
                qrSrc: CardQrCode,
                logoPercent,
                variant: currentVariant,
            })}
        </div>
    );
}