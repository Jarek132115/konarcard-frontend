import React, { useEffect, useMemo, useRef, useState } from "react";

import PlasticCard3D from "../PlasticCard3D";
import MetalCard3D from "../MetalCard3D";
import KonarTag3D from "../KonarTag3D";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import LogoIconWhite from "../../assets/icons/Logo-Icon-White.svg";

import CardChangeLogo1 from "../../assets/icons/CardChangeLogo1.svg";
import CardChangeLogo2 from "../../assets/icons/CardChangeLogo2.svg";
import CardChangeLogo3 from "../../assets/icons/CardChangeLogo3.svg";
import CardChangeLogo4 from "../../assets/icons/CardChangeLogo4.svg";
import CardChangeLogo5 from "../../assets/icons/CardChangeLogo5.svg";
import CardChangeLogo6 from "../../assets/icons/CardChangeLogo6.svg";

import CardQrCode from "../../assets/images/CardQrCode.png";

const LOGO_CHANGE_MS = 4000;
const LOGO_STEPS_PER_VARIANT = 7; // Konar logo + 6 uploaded logos
const FADE_OUT_MS = 180;
const FADE_IN_MS = 220;
const DEFAULT_LOGO_PERCENT = 70;

function getVariantSequence(productKey) {
    if (productKey === "metal-card") return ["black", "gold"];
    if (productKey === "konartag") return ["black", "gold"];
    return ["white", "black"];
}

function getProductDelay(productKey) {
    if (productKey === "plastic-card") return 0;
    if (productKey === "metal-card") return Math.round(LOGO_CHANGE_MS / 3);
    if (productKey === "konartag") return Math.round((LOGO_CHANGE_MS / 3) * 2);
    return 0;
}

function getLogoSequenceForVariant(productKey, variant) {
    const isDark =
        variant === "black" ||
        (productKey === "metal-card" && variant === "black") ||
        (productKey === "konartag" && variant === "black");

    const firstLogo = isDark ? LogoIconWhite : LogoIcon;

    return [
        firstLogo,
        CardChangeLogo1,
        CardChangeLogo2,
        CardChangeLogo3,
        CardChangeLogo4,
        CardChangeLogo5,
        CardChangeLogo6,
    ];
}

function preloadAssets(urls) {
    urls.forEach((src) => {
        if (!src) return;
        const img = new Image();
        img.src = src;
    });
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
    const [isFading, setIsFading] = useState(false);

    const fadeTimeoutRef = useRef(null);
    const loopTimeoutRef = useRef(null);

    const currentVariant =
        variantSequence[variantIndex] || variantSequence[0] || "white";

    const logoSequence = useMemo(
        () => getLogoSequenceForVariant(productKey, currentVariant),
        [productKey, currentVariant]
    );

    const currentLogo = logoSequence[logoStep] || logoSequence[0] || LogoIcon;

    useEffect(() => {
        const allAssets = [
            LogoIcon,
            LogoIconWhite,
            CardChangeLogo1,
            CardChangeLogo2,
            CardChangeLogo3,
            CardChangeLogo4,
            CardChangeLogo5,
            CardChangeLogo6,
            CardQrCode,
        ];
        preloadAssets(allAssets);
    }, []);

    useEffect(() => {
        setVariantIndex(0);
        setLogoStep(0);
        setIsFading(false);
    }, [productKey]);

    useEffect(() => {
        const clearTimers = () => {
            if (fadeTimeoutRef.current) {
                window.clearTimeout(fadeTimeoutRef.current);
                fadeTimeoutRef.current = null;
            }
            if (loopTimeoutRef.current) {
                window.clearTimeout(loopTimeoutRef.current);
                loopTimeoutRef.current = null;
            }
        };

        const runStep = () => {
            setIsFading(true);

            fadeTimeoutRef.current = window.setTimeout(() => {
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

                setIsFading(false);

                loopTimeoutRef.current = window.setTimeout(runStep, LOGO_CHANGE_MS - FADE_OUT_MS);
            }, FADE_OUT_MS);
        };

        const initialDelay = getProductDelay(productKey);

        loopTimeoutRef.current = window.setTimeout(runStep, initialDelay || LOGO_CHANGE_MS);

        return () => {
            clearTimers();
        };
    }, [productKey, variantSequence.length]);

    return (
        <div className={`cp-preview3dWrap ${className}`.trim()} aria-hidden="true">
            <div
                className={`cp-preview3dInner ${isFading ? "is-fading" : ""}`}
                style={{
                    transition: `opacity ${isFading ? FADE_OUT_MS : FADE_IN_MS}ms ease`,
                    pointerEvents: "none",
                }}
            >
                {renderCard3D({
                    productKey,
                    logoSrc: currentLogo,
                    qrSrc: CardQrCode,
                    logoPercent,
                    variant: currentVariant,
                })}
            </div>
        </div>
    );
}