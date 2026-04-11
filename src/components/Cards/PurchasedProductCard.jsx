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

function safeTrim(v) {
    return String(v || "").trim();
}

function isUsableTextureSrc(src) {
    const value = safeTrim(src);
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

function formatShortDate(value) {
    const raw = safeTrim(value);
    if (!raw) return "—";

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;

    return parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function addBusinessDays(date, daysToAdd) {
    const result = new Date(date);
    let added = 0;

    while (added < daysToAdd) {
        result.setDate(result.getDate() + 1);
        const day = result.getDay();
        if (day !== 0 && day !== 6) {
            added += 1;
        }
    }

    return result;
}

function fallbackEstimatedDelivery(orderDateValue) {
    const raw = safeTrim(orderDateValue);
    if (!raw) return "—";

    const orderDate = new Date(raw);
    if (Number.isNaN(orderDate.getTime())) return "—";

    const hour = orderDate.getHours();
    const minDays = hour < 14 ? 2 : 3;
    const maxDays = hour < 14 ? 4 : 5;

    const minDate = addBusinessDays(orderDate, minDays);
    const maxDate = addBusinessDays(orderDate, maxDays);

    return `${formatShortDate(minDate)} – ${formatShortDate(maxDate)}`;
}

function getStatusLabel(card) {
    const raw = safeTrim(card?.status || card?._raw?.status).toLowerCase();

    if (!raw) return "Pending";
    if (raw === "paid") return "Paid";
    if (raw === "pending") return "Pending";
    if (raw === "failed") return "Failed";
    if (raw === "cancelled" || raw === "canceled") return "Cancelled";
    if (raw === "fulfilled") return "Fulfilled";
    if (raw === "processing") return "Processing";
    if (raw === "complete" || raw === "completed") return "Completed";
    if (raw === "shipped") return "Shipped";

    return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function getStatusTone(card) {
    const raw = safeTrim(card?.status || card?._raw?.status).toLowerCase();

    if (["paid", "fulfilled", "processing", "complete", "completed", "shipped"].includes(raw)) {
        return "success";
    }
    if (raw === "pending") return "warn";
    if (raw === "failed" || raw === "cancelled" || raw === "canceled") return "danger";
    return "neutral";
}

function getFulfillmentStatus(card) {
    return safeTrim(card?.fulfillmentStatus || card?._raw?.fulfillmentStatus).toLowerCase();
}

function getEstimatedDelivery(card) {
    const saved =
        safeTrim(card?.deliveryWindow) ||
        safeTrim(card?._raw?.deliveryWindow);

    if (saved) return saved;

    return fallbackEstimatedDelivery(card?._raw?.createdAt || card?.createdAt);
}

function getDeliveredDate(card) {
    const deliveredAt =
        safeTrim(card?.deliveredAt) ||
        safeTrim(card?._raw?.deliveredAt) ||
        safeTrim(card?._raw?.updatedAt) ||
        safeTrim(card?.updatedAt);

    if (!deliveredAt) return "—";
    return formatShortDate(deliveredAt);
}

function getMetaLine(card) {
    const fulfillment = getFulfillmentStatus(card);

    if (fulfillment === "delivered") {
        return {
            label: "Delivered on",
            value: getDeliveredDate(card),
        };
    }

    return {
        label: "Estimated delivery",
        value: getEstimatedDelivery(card),
    };
}

function getPlasticArtwork(productKey) {
    switch (safeTrim(productKey).toLowerCase()) {
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
            frontText={safeTrim(card?.frontText) || "KONAR"}
            frontFontSize={Number(card?.frontFontSize || 42)}
            frontFontWeight={Number(card?.frontFontWeight || 700)}
            frontTextColor={
                safeTrim(card?.frontTextColor) || artwork.fallbackTextColor
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
        safeTrim(card?.assignedProfile) ||
        safeTrim(card?.profileSlug) ||
        "KonarCard";

    const cardLabel =
        safeTrim(card?.title || "Konar Card")
            .replace(/\bNFC\b/gi, "")
            .replace(/\bBusiness\b/gi, "")
            .replace(/\s{2,}/g, " ")
            .trim() || "Konar Card";

    return `${slugName}'s ${cardLabel}`;
}

export default function PurchasedProductCard({ card, onOpenDetails }) {
    const productKey = safeTrim(card?.productKey).toLowerCase();
    const variant = safeTrim(card?.variantRaw || card?.preview?.variant || "white").toLowerCase();

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

    const explicitQrSrc =
        safeTrim(card?.qrCodeUrl) ||
        safeTrim(card?._raw?.qrCodeUrl) ||
        safeTrim(card?._raw?.profile?.qr_code_url) ||
        "";

    const resolvedQrSrc = explicitQrSrc || (card?.link ? qrSrcFromLink(card.link) : "");

    const ownedTitle = formatOwnedTitle(card);
    const statusLabel = getStatusLabel(card);
    const statusTone = getStatusTone(card);
    const meta = getMetaLine(card);

    return (
        <article className="cp-catalogCard cp-ownedCard">
            <div className="cp-catalogMedia cp-ownedMedia">
                <span className={`cp-catalogTag cp-orderPill cp-orderPill--${statusTone}`}>
                    {statusLabel}
                </span>

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
                        {meta.label} {meta.value}
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