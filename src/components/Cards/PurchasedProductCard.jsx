import React from "react";
import PurchasedPlasticCardFlatPreview from "./PurchasedPlasticCardFlatPreview";

import "../../styling/dashboard/purchased-plastic-card-flat-preview.css";

function safeTrim(v) {
    return String(v || "").trim();
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
            label: "Delivered",
            value: getDeliveredDate(card),
        };
    }

    return {
        label: "Estimated delivery",
        value: getEstimatedDelivery(card),
    };
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
    const ownedTitle = formatOwnedTitle(card);
    const statusLabel = getStatusLabel(card);
    const statusTone = getStatusTone(card);
    const meta = getMetaLine(card);
    const productKey = safeTrim(card?.productKey).toLowerCase();

    return (
        <article className="cp-catalogCard cp-ownedCard">
            <div className="cp-catalogMedia cp-ownedMedia">
                <span className={`cp-catalogTag cp-orderPill cp-orderPill--${statusTone}`}>
                    {statusLabel}
                </span>

                <div className="cp-catalogImageWrap cp-ownedImageWrap">
                    <PurchasedPlasticCardFlatPreview
                        card={card}
                        productKey={productKey}
                        className="cp-ownedFlatPreview"
                    />
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