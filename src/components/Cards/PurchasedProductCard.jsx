import React from "react";
import PlasticCard3D from "../PlasticCard3D";
import MetalCard3D from "../MetalCard3D";
import KonarTag3D from "../KonarTag3D";

import LogoIcon from "../../assets/icons/Logo-Icon.svg";
import LogoIconWhite from "../../assets/icons/Logo-Icon-White.svg";
import { qrSrcFromLink } from "./cardsHelpers";

import WhiteFrontImg from "../../assets/images/Products/WhiteFront.jpg";
import WhiteBackImg from "../../assets/images/Products/WhiteBack.jpg";
import BlackFrontImg from "../../assets/images/Products/BlackFront.jpg";
import BlackBackImg from "../../assets/images/Products/BlackBack.jpg";
import BlueFrontImg from "../../assets/images/Products/BlueFront.jpg";
import BlueBackImg from "../../assets/images/Products/BlueBack.jpg";
import GreenFrontImg from "../../assets/images/Products/GreenFront.jpg";
import GreenBackImg from "../../assets/images/Products/GreenBack.jpg";
import MagentaFrontImg from "../../assets/images/Products/MagentaFront.jpg";
import MagentaBackImg from "../../assets/images/Products/MagentaBack.jpg";
import OrangeFrontImg from "../../assets/images/Products/OrangeFront.jpg";
import OrangeBackImg from "../../assets/images/Products/OrangeBack.jpg";

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

function getPlasticArtwork(productKey) {
    switch (String(productKey || "").trim().toLowerCase()) {
        case "plastic-black":
            return {
                frontSrc: BlackFrontImg,
                backSrc: BlackBackImg,
                edgeColor: "#111111",
                fallbackTextColor: "#ffffff",
            };
        case "plastic-blue":
            return {
                frontSrc: BlueFrontImg,
                backSrc: BlueBackImg,
                edgeColor: "#0f52ff",
                fallbackTextColor: "#ffffff",
            };
        case "plastic-green":
            return {
                frontSrc: GreenFrontImg,
                backSrc: GreenBackImg,
                edgeColor: "#15a53a",
                fallbackTextColor: "#ffffff",
            };
        case "plastic-magenta":
            return {
                frontSrc: MagentaFrontImg,
                backSrc: MagentaBackImg,
                edgeColor: "#d1008f",
                fallbackTextColor: "#ffffff",
            };
        case "plastic-orange":
            return {
                frontSrc: OrangeFrontImg,
                backSrc: OrangeBackImg,
                edgeColor: "#ff7b00",
                fallbackTextColor: "#ffffff",
            };
        case "plastic-white":
        default:
            return {
                frontSrc: WhiteFrontImg,
                backSrc: WhiteBackImg,
                edgeColor: "#ffffff",
                fallbackTextColor: "#111111",
            };
    }
}

function renderOwnedPreview({
    productKey,
    variant,
    card,
    resolvedLogoSrc,
    resolvedQrSrc,
}) {
    if (productKey === "metal-card") {
        return (
            <MetalCard3D
                logoSrc={resolvedLogoSrc}
                qrSrc={resolvedQrSrc}
                logoSize={Number(card?.preview?.logoPercent || 70)}
                finish={variant || "gold"}
                interactive={false}
                autoRotate={true}
                autoRotateSpeed={0.68}
                compact={true}
                stageClassName="cp-preview3dScene"
            />
        );
    }

    if (productKey === "konartag") {
        return (
            <KonarTag3D
                logoSrc={resolvedLogoSrc}
                qrSrc={resolvedQrSrc}
                logoSize={Number(card?.preview?.logoPercent || 70)}
                finish={variant || "black"}
                interactive={false}
                autoRotate={true}
                autoRotateSpeed={0.68}
                compact={true}
                stageClassName="cp-preview3dScene"
            />
        );
    }

    const artwork = getPlasticArtwork(productKey);

    return (
        <PlasticCard3D
            frontSrc={artwork.frontSrc}
            backSrc={artwork.backSrc}
            qrSrc={resolvedQrSrc}
            edgeColor={artwork.edgeColor}
            frontText={String(card?.frontText || "").trim() || "KONAR"}
            frontFontSize={Number(card?.frontFontSize || 42)}
            frontFontWeight={Number(card?.frontFontWeight || 700)}
            frontTextColor={
                String(card?.frontTextColor || "").trim() || artwork.fallbackTextColor
            }
            interactive={false}
            autoRotate={true}
            autoRotateSpeed={0.68}
            compact={true}
            stageClassName="cp-preview3dScene"
        />
    );
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
    const productKey = String(card?.productKey || "").trim().toLowerCase();
    const variant = String(card?.variantRaw || card?.preview?.variant || "white")
        .trim()
        .toLowerCase();

    const isDark =
        variant === "black" ||
        variant === "blue" ||
        variant === "green" ||
        variant === "magenta" ||
        variant === "orange" ||
        (productKey === "metal-card" && variant === "black") ||
        (productKey === "konartag" && variant === "black");

    const fallbackLogo = isDark ? LogoIconWhite : LogoIcon;

    const resolvedLogoSrc = isUsableTextureSrc(card?.logoUrl)
        ? card.logoUrl
        : fallbackLogo;

    const resolvedQrSrc = card?.link ? qrSrcFromLink(card.link) : "";

    const ownedTitle = formatOwnedTitle(card);
    const orderPlaced = formatOrderDateOnly(card?.createdAt);

    return (
        <article className="cp-catalogCard cp-ownedCard">
            <div className="cp-catalogMedia cp-ownedMedia">
                <span className="cp-catalogTag">Owned</span>

                <div className="cp-catalogPreview3D cp-ownedPreview3D">
                    {renderOwnedPreview({
                        productKey,
                        variant,
                        card,
                        resolvedLogoSrc,
                        resolvedQrSrc,
                    })}
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