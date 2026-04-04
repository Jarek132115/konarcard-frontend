import React from "react";
import PlasticCard3D from "../PlasticCard3D";
import MetalCard3D from "../MetalCard3D";
import KonarTag3D from "../KonarTag3D";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import LogoIconWhite from "../../assets/icons/Logo-Icon-White.svg";

function get3DComponent(productKey, props) {
    if (productKey === "metal-card") return <MetalCard3D {...props} />;
    if (productKey === "konartag") return <KonarTag3D {...props} />;
    return <PlasticCard3D {...props} />;
}

export default function PurchasedProductCard({ card, onOpenDetails }) {
    const variant = card.variant || "white";

    const defaultLogo =
        variant === "black" ? LogoIconWhite : LogoIcon;

    const logoSrc = card.logoUrl || defaultLogo;

    return (
        <article className="cp-catalogCard cp-ownedCard">
            <div className="cp-catalogMedia">
                <span className="cp-catalogTag">Owned</span>

                <div className="cp-catalogPreview3D">
                    {get3DComponent(card.productKey, {
                        logoSrc,
                        qrSrc: card.qrCodeUrl || "",
                        logoSize: card.logoPercent || 70,
                        variant: card.variant,
                        finish: card.variant,
                    })}
                </div>
            </div>

            <div className="cp-catalogBody">
                <div className="cp-catalogTextGroup">
                    <h3 className="cp-catalogTitle">{card.title}</h3>

                    <p className="cp-catalogDesc">
                        {card.assignedProfile || card.profileSlug || "—"}
                    </p>

                    <div className="cp-ownedMeta">
                        <span>Status: {card.status}</span>
                        <span>{card.createdAt}</span>
                    </div>
                </div>

                <div className="cp-catalogFoot">
                    <div className="cp-catalogPrice">
                        {card.amountTotalFormatted}
                    </div>

                    <button
                        className="kx-btn kx-btn--black cp-catalogBtn"
                        onClick={() => onOpenDetails(card.id)}
                    >
                        View details
                    </button>
                </div>
            </div>
        </article>
    );
}