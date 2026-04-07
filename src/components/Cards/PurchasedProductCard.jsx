import React from "react";
import PlasticCard3D from "../PlasticCard3D";
import MetalCard3D from "../MetalCard3D";
import KonarTag3D from "../KonarTag3D";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import LogoIconWhite from "../../assets/icons/Logo-Icon-White.svg";
import { qrSrcFromLink } from "./cardsHelpers";

function isUsableTextureSrc(src) {
    const value = String(src || "").trim();
    return (
        !!value &&
        (
            value.startsWith("data:") ||
            value.startsWith("blob:") ||
            value.startsWith("/") ||
            value.startsWith("http://") ||
            value.startsWith("https://")
        )
    );
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

function formatOwnedTitle(card) {
    const slugName =
        String(
            card?.assignedProfile ||
            card?.profileSlug ||
            "KonarCard"
        ).trim() || "KonarCard";

    const cardLabel =
        String(card?.title || "Konar Card")
            .replace(/\bNFC\b/gi, "")
            .replace(/\bBusiness\b/gi, "")
            .replace(/\s{2,}/g, " ")
            .trim() || "Konar Card";

    return `${slugName}'s ${cardLabel}`;
}

function formatOrderDateOnly(value) {
    const raw = String(value || "").trim();
    if (!raw || raw === "—") return "Order placed —";

    const directMatch = raw.match(/^(\d{2}\/\d{2}\/\d{4})/);
    if (directMatch) return `Order placed ${directMatch[1]}`;

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return `Order placed ${raw}`;

    return `Order placed ${parsed.toLocaleDateString("en-GB")}`;
}

export default function PurchasedProductCard({ card, onOpenDetails }) {
    const productKey = String(card?.productKey || "");
    const variant = String(card?.variantRaw || card?.preview?.variant || "white").toLowerCase();

    const isDark =
        variant === "black" ||
        (productKey === "metal-card" && variant === "black") ||
        (productKey === "konartag" && variant === "black");

    const fallbackLogo = isDark ? LogoIconWhite : LogoIcon;

    const resolvedLogoSrc = isUsableTextureSrc(card?.logoUrl)
        ? card.logoUrl
        : fallbackLogo;

    const resolvedQrSrc = card?.link ? qrSrcFromLink(card.link) : "";

    const sharedProps = {
        logoSrc: resolvedLogoSrc,
        qrSrc: resolvedQrSrc,
        logoSize: Number(card?.preview?.logoPercent || 70),
        interactive: false,
        autoRotate: true,
        autoRotateSpeed: 0.68,
        compact: true,
        stageClassName: "cp-preview3dScene",
    };

    const ownedTitle = formatOwnedTitle(card);
    const orderPlaced = formatOrderDateOnly(card?.createdAt);

    return (
        <article className="cp-catalogCard cp-ownedCard">
            <div className="cp-catalogMedia cp-ownedMedia">
                <span className="cp-catalogTag">Owned</span>

                <div className="cp-catalogPreview3D cp-ownedPreview3D">
                    {renderOwnedPreview(productKey, sharedProps, variant)}
                </div>
            </div>

            <div className="cp-catalogBody cp-ownedBody">
                <div className="cp-catalogTextGroup cp-ownedTextGroup">
                    <h3 className="cp-catalogTitle cp-ownedTitle" title={ownedTitle}>
                        {ownedTitle}
                    </h3>

                    <p className="cp-catalogDesc cp-ownedOrderDate">
                        {orderPlaced}
                    </p>
                </div>

                <div className="cp-catalogFoot cp-ownedFoot">
                    <button
                        type="button"
                        className="kx-btn kx-btn--black cp-catalogBtn cp-ownedBtn"
                        onClick={() => onOpenDetails(card?.id)}
                    >
                        View details
                    </button>
                </div>
            </div>
        </article>
    );
}