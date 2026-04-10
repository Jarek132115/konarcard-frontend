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
    "plastic-white": 0,
    "plastic-black": 1,
    "plastic-blue": 2,
    "plastic-green": 3,
    "plastic-magenta": 4,
    "plastic-orange": 5,
    "metal-card": 6,
    konartag: 7,
};

const PRODUCT_ROTATION_OFFSET_MAP = {
    "plastic-white": 0,
    "plastic-black": (Math.PI * 2) / 8,
    "plastic-blue": (Math.PI * 4) / 8,
    "plastic-green": (Math.PI * 6) / 8,
    "plastic-magenta": (Math.PI * 8) / 8,
    "plastic-orange": (Math.PI * 10) / 8,
    "metal-card": (Math.PI * 12) / 8,
    konartag: (Math.PI * 14) / 8,
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

const PLASTIC_VARIANT_DEFAULT_LOGO = {
    white: LogoIcon,
    black: LogoIconWhite,
    blue: LogoIconWhite,
    green: LogoIconWhite,
    magenta: LogoIconWhite,
    orange: LogoIconWhite,
};

function getFixedVariant(productKey) {
    if (productKey === "plastic-white") return "white";
    if (productKey === "plastic-black") return "black";
    if (productKey === "plastic-blue") return "blue";
    if (productKey === "plastic-green") return "green";
    if (productKey === "plastic-magenta") return "magenta";
    if (productKey === "plastic-orange") return "orange";
    if (productKey === "metal-card") return "gold";
    if (productKey === "konartag") return "black";
    return "white";
}

function getLogoSequence(productKey, variant) {
    if (productKey === "metal-card") {
        return [variant === "black" ? LogoIconWhite : LogoIcon];
    }

    if (productKey === "konartag") {
        return [LogoIconWhite];
    }

    const baseLogo = PLASTIC_VARIANT_DEFAULT_LOGO[variant] || LogoIcon;

    return [
        baseLogo,
        CardChangeLogo1,
        CardChangeLogo2,
        CardChangeLogo3,
        CardChangeLogo4,
        CardChangeLogo5,
        CardChangeLogo6,
    ];
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
    const variant = getFixedVariant(productKey);

    const [tick, setTick] = useState(phaseIndex);

    useEffect(() => {
        ALL_LOGOS.forEach((src) => useTexture.preload(src));
        useTexture.preload(CardQrCode);
    }, []);

    useEffect(() => {
        setTick(phaseIndex);

        const delay = Math.round((LOGO_CHANGE_MS / 8) * phaseIndex);
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

    const logoSequence = useMemo(
        () => getLogoSequence(productKey, variant),
        [productKey, variant]
    );

    const currentLogo =
        logoSequence[Math.abs(tick) % logoSequence.length] || logoSequence[0] || LogoIcon;

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