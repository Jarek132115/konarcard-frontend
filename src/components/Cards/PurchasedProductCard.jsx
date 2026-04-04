import React from "react";
import PlasticCard3D from "../PlasticCard3D";
import MetalCard3D from "../MetalCard3D";
import KonarTag3D from "../KonarTag3D";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import LogoIconWhite from "../../assets/icons/Logo-Icon-White.svg";

function isSafeTextureUrl(src) {
    const value = String(src || "").trim();
    if (!value) return false;

    if (
        value.startsWith("data:") ||
        value.startsWith("blob:") ||
        value.startsWith("/") ||
        value.startsWith(window.location.origin)
    ) {
        return true;
    }

    return false;
}

function renderOwnedPreview(productKey, sharedProps, variant) {
    if (productKey === "metal-card") {
        return <MetalCard3D {...sharedProps} finish={variant} />;
    }

    if (productKey === "konartag") {
        return <KonarTag3D {...sharedProps} finish={variant} />;
    }

    return <PlasticCard3D {...sharedProps} variant={variant} />;
}

export default function PurchasedProductCard({ card, onOpenDetails }) {
    const variant = String(card?.variantRaw || card?.preview?.variant || "white").toLowerCase();
    const isDark = variant === "black";

    const fallbackLogo = isDark ? LogoIconWhite : LogoIcon;

    const safeLogoSrc = isSafeTextureUrl(card?.logoUrl) ? card.logoUrl : fallbackLogo;

    const sharedProps = {
        logoSrc: safeLogoSrc,
        qrSrc: "",
        logoSize: Number(card?.preview?.logoPercent || 70),
        interactive: false,
        autoRotate: true,
        autoRotateSpeed: 0.68,
        compact: true,
        stageClassName: "cp-preview3dScene",
    };

    return (
        <article className="cp-catalogCard cp-ownedCard">
            <div className="cp-catalogMedia">
                <span className="cp-catalogTag">Owned</span>

                <div className="cp-catalogPreview3D">
                    {renderOwnedPreview(card?.productKey, sharedProps, variant)}
                </div>
            </div>

            <div className="cp-catalogBody">
                <div className="cp-catalogTextGroup">
                    <h3 className="cp-catalogTitle">{card?.title || "Purchased product"}</h3>
                    <p className="cp-catalogDesc">
                        {card?.assignedProfile || card?.profileSlug || "—"}
                    </p>

                    <div className="cp-ownedMeta">
                        <span>Status: {card?.status || "—"}</span>
                        <span>{card?.createdAt || "—"}</span>
                    </div>
                </div>

                <div className="cp-catalogFoot">
                    <div className="cp-catalogPrice">{card?.amountTotalFormatted || "—"}</div>

                    <button
                        type="button"
                        className="kx-btn kx-btn--black cp-catalogBtn"
                        onClick={() => onOpenDetails(card?.id)}
                    >
                        View details
                    </button>
                </div>
            </div>
        </article>
    );
}