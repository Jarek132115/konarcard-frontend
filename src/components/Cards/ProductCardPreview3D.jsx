// frontend/src/components/Cards/ProductCardPreview3D.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useTexture } from "@react-three/drei";

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
const DEFAULT_LOGO_PERCENT = 75;

const PRODUCT_PHASE_MAP = {
    "plastic-card": 0,
    "metal-card": 1,
    konartag: 2,
};

const PRODUCT_ROTATION_OFFSET_MAP = {
    "plastic-card": 0,
    "metal-card": (Math.PI * 2) / 3,
    konartag: (Math.PI * 4) / 3,
};

const ALL_LOGOS = [
    LogoIcon,
    LogoIconWhite,
    CardChangeLogo1,
    CardChangeLogo2,
    CardChangeLogo3,
    CardChangeLogo4,
    CardChangeLogo5,
    CardChangeLogo6,
];

function getVariantSequence(productKey) {
    if (productKey === "metal-card") return ["black", "gold"];
    if (productKey === "konartag") return ["black", "gold"];
    return ["white", "black"];
}

function getLogoSequence(productKey, variant) {
    const isDark =
        variant === "black" ||
        (productKey === "metal-card" && variant === "black") ||
        (productKey === "konartag" && variant === "black");

    return [
        isDark ? LogoIconWhite : LogoIcon,
        CardChangeLogo1,
        CardChangeLogo2,
        CardChangeLogo3,
        CardChangeLogo4,
        CardChangeLogo5,
        CardChangeLogo6,
    ];
}

function getFrameState(productKey, tick) {
    const variants = getVariantSequence(productKey);
    const logosPerVariant = 7;
    const totalFrames = variants.length * logosPerVariant;
    const safeTick = ((tick % totalFrames) + totalFrames) % totalFrames;

    const variantIndex = Math.floor(safeTick / logosPerVariant);
    const logoIndex = safeTick % logosPerVariant;

    return {
        variant: variants[variantIndex] || variants[0],
        logoIndex,
    };
}

function renderProduct3D({
    productKey,
    logoSrc,
    qrSrc,
    logoPercent,
    variant,
    rotationOffset,
}) {
    const sharedProps = {
        logoSrc,
        qrSrc,
        logoSize: logoPercent,
        interactive: false,
        autoRotate: true,
        autoRotateSpeed: 0.68,
        rotationOffset,
        compact: true,
        stageClassName: "cp-preview3dScene",
    };

    if (productKey === "metal-card") {
        return <MetalCard3D {...sharedProps} finish={variant} />;
    }

    if (productKey === "konartag") {
        return <KonarTag3D {...sharedProps} finish={variant} />;
    }

    return <PlasticCard3D {...sharedProps} variant={variant} />;
}

export default function ProductCardPreview3D({
    productKey,
    className = "",
    logoPercent = DEFAULT_LOGO_PERCENT,
}) {
    const phaseIndex = PRODUCT_PHASE_MAP[productKey] ?? 0;
    const rotationOffset = PRODUCT_ROTATION_OFFSET_MAP[productKey] ?? 0;

    const [tick, setTick] = useState(phaseIndex);

    useEffect(() => {
        ALL_LOGOS.forEach((src) => useTexture.preload(src));
        useTexture.preload(CardQrCode);
    }, []);

    useEffect(() => {
        setTick(phaseIndex);

        const delay = Math.round((LOGO_CHANGE_MS / 3) * phaseIndex);
        let intervalId;

        const timeoutId = window.setTimeout(() => {
            intervalId = window.setInterval(() => {
                setTick((prev) => prev + 1);
            }, LOGO_CHANGE_MS);
        }, delay);

        return () => {
            window.clearTimeout(timeoutId);
            if (intervalId) window.clearInterval(intervalId);
        };
    }, [phaseIndex, productKey]);

    const { variant, logoIndex } = useMemo(
        () => getFrameState(productKey, tick),
        [productKey, tick]
    );

    const logoSequence = useMemo(
        () => getLogoSequence(productKey, variant),
        [productKey, variant]
    );

    const currentLogo = logoSequence[logoIndex] || logoSequence[0] || LogoIcon;

    return (
        <div className={`cp-preview3dWrap ${className}`.trim()} aria-hidden="true">
            {renderProduct3D({
                productKey,
                logoSrc: currentLogo,
                qrSrc: CardQrCode,
                logoPercent,
                variant,
                rotationOffset,
            })}
        </div>
    );
}