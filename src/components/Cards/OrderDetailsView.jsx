import React, { useMemo } from "react";

function safeTrim(v) {
    return String(v || "").trim();
}

function formatOrderDate(value) {
    const raw = safeTrim(value);
    if (!raw) return "—";

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;

    return parsed.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
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

    /*
      Fallback ETA logic:
      - before 2pm: 2–4 business days
      - after 2pm: 3–5 business days

      If you already have a stricter business rule elsewhere, you can
      swap just this helper and everything else below will still work.
    */
    const hour = orderDate.getHours();
    const minDays = hour < 14 ? 2 : 3;
    const maxDays = hour < 14 ? 4 : 5;

    const minDate = addBusinessDays(orderDate, minDays);
    const maxDate = addBusinessDays(orderDate, maxDays);

    return `${formatShortDate(minDate)} – ${formatShortDate(maxDate)}`;
}

function titleFromOrder(selectedOrder, productMeta) {
    const productKey = safeTrim(selectedOrder?.productKey);
    const metaTitle = productMeta?.[productKey]?.title;
    return metaTitle || safeTrim(selectedOrder?.title) || "KonarCard";
}

function assignedProfileLabel(selectedOrder) {
    return (
        safeTrim(selectedOrder?.assignedProfile) ||
        safeTrim(selectedOrder?.profileSlug) ||
        "Not assigned"
    );
}

function variantLabel(selectedOrder) {
    const value =
        safeTrim(selectedOrder?.variantRaw) ||
        safeTrim(selectedOrder?.preview?.variant);

    if (!value) return "—";

    return value.charAt(0).toUpperCase() + value.slice(1);
}

function quantityLabel(selectedOrder) {
    const qty = Number(selectedOrder?.quantity || 1);
    return Number.isFinite(qty) && qty > 0 ? String(qty) : "1";
}

function orderStatusLabel(selectedOrder) {
    const raw =
        safeTrim(selectedOrder?.status) ||
        safeTrim(selectedOrder?._raw?.status);

    if (!raw) return "—";

    const normalized = raw.toLowerCase();

    if (normalized === "paid") return "Paid";
    if (normalized === "pending") return "Pending";
    if (normalized === "failed") return "Failed";
    if (normalized === "cancelled" || normalized === "canceled") return "Cancelled";
    if (normalized === "fulfilled") return "Fulfilled";

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function fulfillmentStatusLabel(selectedOrder) {
    const raw =
        safeTrim(selectedOrder?._raw?.fulfillmentStatus) ||
        safeTrim(selectedOrder?.fulfillmentStatus);

    if (!raw) return "—";

    const normalized = raw.toLowerCase();

    if (normalized === "order_placed") return "Order placed";
    if (normalized === "designing_card") return "Card is being prepared";
    if (normalized === "packaged") return "Packaged";
    if (normalized === "shipped") return "Shipment is on the way";
    if (normalized === "delivered") return "Delivered";

    return normalized.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function resolvedLogoSrc(selectedOrder, defaultLogoDataUrl) {
    const raw = safeTrim(selectedOrder?.logoUrl);
    if (raw) return raw;
    return defaultLogoDataUrl || "";
}

function resolvedQrSrc(selectedOrder, qrSrcFromLink) {
    const explicitQr =
        safeTrim(selectedOrder?._raw?.preview?.qrCodeUrl) ||
        safeTrim(selectedOrder?._raw?.profile?.qr_code_url) ||
        safeTrim(selectedOrder?._raw?.qrCodeUrl);

    if (explicitQr) return explicitQr;

    const nfcTrackedUrl =
        safeTrim(selectedOrder?._raw?.preview?.nfcTargetUrl) ||
        safeTrim(selectedOrder?._raw?.preview?.nfcProfileUrl) ||
        safeTrim(selectedOrder?._raw?.preview?.publicProfileUrl) ||
        safeTrim(selectedOrder?.nfcTargetUrl) ||
        safeTrim(selectedOrder?.link);

    if (!nfcTrackedUrl) return "";

    return typeof qrSrcFromLink === "function" ? qrSrcFromLink(nfcTrackedUrl) : "";
}

function resolvedLogoPercent(selectedOrder) {
    const value = Number(selectedOrder?.preview?.logoPercent || 70);
    if (!Number.isFinite(value)) return 70;
    return Math.max(40, Math.min(90, value));
}

function plasticTextProps(selectedOrder) {
    const previewCustomization = selectedOrder?._raw?.preview?.customization || {};
    const topLevelCustomization = selectedOrder?._raw?.customization || {};

    const frontText =
        safeTrim(previewCustomization?.frontText) ||
        safeTrim(topLevelCustomization?.frontText) ||
        "KONAR";

    const frontFontWeight = Number(
        previewCustomization?.fontWeight ||
        topLevelCustomization?.fontWeight ||
        700
    );

    const frontFontSize = Number(
        previewCustomization?.fontSize ||
        topLevelCustomization?.fontSize ||
        42
    );

    const frontTextColor =
        safeTrim(previewCustomization?.textColor) ||
        safeTrim(topLevelCustomization?.textColor) ||
        "";

    return {
        frontText,
        frontFontWeight: Number.isFinite(frontFontWeight) ? frontFontWeight : 700,
        frontFontSize: Number.isFinite(frontFontSize) ? frontFontSize : 42,
        frontTextColor,
    };
}

function trackingCodeLabel(selectedOrder) {
    return (
        safeTrim(selectedOrder?._raw?.trackingCode) ||
        safeTrim(selectedOrder?.trackingCode) ||
        "—"
    );
}

function trackingLinkLabel(selectedOrder) {
    return (
        safeTrim(selectedOrder?._raw?.trackingUrl) ||
        safeTrim(selectedOrder?.trackingUrl) ||
        "—"
    );
}

function estimatedDeliveryLabel(selectedOrder) {
    const saved =
        safeTrim(selectedOrder?._raw?.deliveryWindow) ||
        safeTrim(selectedOrder?.deliveryWindow);

    if (saved) return saved;

    const createdAt = selectedOrder?._raw?.createdAt || selectedOrder?.createdAt;
    return fallbackEstimatedDelivery(createdAt);
}

export default function OrderDetailsView({
    selectedOrder,
    productMeta,
    defaultLogoDataUrl,
    qrSrcFromLink,
    Card3DDetails,
    CardPreviewErrorBoundary,
    formatMoneyMinor,
    onBack,
}) {
    const previewProps = useMemo(() => {
        if (!selectedOrder) return null;

        const productKey = safeTrim(selectedOrder?.productKey);
        const meta = productMeta?.[productKey] || {};
        const edition = safeTrim(meta?.edition || selectedOrder?.preview?.edition || "plastic");
        const variant =
            safeTrim(selectedOrder?.variantRaw) ||
            safeTrim(selectedOrder?.preview?.variant) ||
            safeTrim(meta?.variant) ||
            "white";

        const common = {
            productKey,
            variant,
            logoSrc: resolvedLogoSrc(selectedOrder, defaultLogoDataUrl),
            qrSrc: resolvedQrSrc(selectedOrder, qrSrcFromLink),
            logoPercent: resolvedLogoPercent(selectedOrder),
        };

        if (edition === "plastic") {
            return {
                ...common,
                ...plasticTextProps(selectedOrder),
            };
        }

        return common;
    }, [selectedOrder, productMeta, defaultLogoDataUrl, qrSrcFromLink]);

    if (!selectedOrder) {
        return (
            <>
                <div className="ccz-backRow">
                    <button type="button" className="kx-btn kx-btn--white" onClick={onBack}>
                        Back to cards
                    </button>
                </div>

                <section className="cp-card">
                    <div className="cp-emptyState">
                        <div className="cp-emptyStateCard">
                            <div className="cp-emptyStateTitle">Order not found</div>
                            <p className="cp-emptyStateText">
                                We could not find that order. Please go back to your cards list.
                            </p>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    const productTitle = titleFromOrder(selectedOrder, productMeta);
    const amountFormatted =
        safeTrim(selectedOrder?.amountTotalFormatted) ||
        (typeof formatMoneyMinor === "function"
            ? formatMoneyMinor(selectedOrder?.amountTotal, selectedOrder?.currency)
            : "—");

    const profileLabel = assignedProfileLabel(selectedOrder);
    const createdAt = formatOrderDate(selectedOrder?._raw?.createdAt || selectedOrder?.createdAt);
    const variant = variantLabel(selectedOrder);
    const paymentStatus = orderStatusLabel(selectedOrder);
    const fulfillmentStatus = fulfillmentStatusLabel(selectedOrder);
    const quantity = quantityLabel(selectedOrder);
    const profileSlug = safeTrim(selectedOrder?.profileSlug) || "—";
    const trackingCode = trackingCodeLabel(selectedOrder);
    const trackingLink = trackingLinkLabel(selectedOrder);
    const estimatedDelivery = estimatedDeliveryLabel(selectedOrder);

    return (
        <>
            <div className="ccz-backRow">
                <button type="button" className="kx-btn kx-btn--white" onClick={onBack}>
                    Back to cards
                </button>
            </div>

            <section className="cp-card">
                <div className="cp-cardHead">
                    <div className="cp-cardHeadCopy">
                        <div className="cp-eyebrow">Order details</div>
                        <h2 className="cp-cardTitle">{productTitle}</h2>
                        <p className="cp-muted">
                            View the exact product configuration saved for this order.
                        </p>
                    </div>
                </div>

                <div className="cp-detailsGrid">
                    <div className="cp-previewCard">
                        <CardPreviewErrorBoundary
                            resetKey={`${selectedOrder?.id || "order"}-${previewProps?.productKey || "product"}-${previewProps?.variant || "variant"}-${previewProps?.frontText || "text"}`}
                            fallback={<div className="cp-previewFallback">Preview unavailable</div>}
                        >
                            <div className="cp-preview3dWrap">
                                <Card3DDetails {...previewProps} />
                            </div>
                        </CardPreviewErrorBoundary>
                    </div>

                    <div className="cp-innerCard">
                        <h3 className="cp-innerTitle">Order summary</h3>

                        <div className="cp-row">
                            <div className="cp-rowKey">Product</div>
                            <div className="cp-rowVal">{productTitle}</div>
                        </div>

                        <div className="cp-row">
                            <div className="cp-rowKey">Assigned profile</div>
                            <div className="cp-rowVal">{profileLabel}</div>
                        </div>

                        <div className="cp-row">
                            <div className="cp-rowKey">Profile slug</div>
                            <div className="cp-rowVal">{profileSlug}</div>
                        </div>

                        <div className="cp-row">
                            <div className="cp-rowKey">Variant</div>
                            <div className="cp-rowVal">{variant}</div>
                        </div>

                        <div className="cp-row">
                            <div className="cp-rowKey">Quantity</div>
                            <div className="cp-rowVal">{quantity}</div>
                        </div>

                        <div className="cp-row">
                            <div className="cp-rowKey">Total</div>
                            <div className="cp-rowVal">{amountFormatted}</div>
                        </div>

                        <div className="cp-row">
                            <div className="cp-rowKey">Payment status</div>
                            <div className="cp-rowVal">{paymentStatus}</div>
                        </div>

                        <div className="cp-row">
                            <div className="cp-rowKey">Order status</div>
                            <div className="cp-rowVal">{fulfillmentStatus}</div>
                        </div>

                        <div className="cp-row">
                            <div className="cp-rowKey">Ordered on</div>
                            <div className="cp-rowVal">{createdAt}</div>
                        </div>

                        <div className="cp-row">
                            <div className="cp-rowKey">Estimated delivery</div>
                            <div className="cp-rowVal">{estimatedDelivery}</div>
                        </div>

                        <div className="cp-row">
                            <div className="cp-rowKey">Tracking code</div>
                            <div className="cp-rowVal">{trackingCode}</div>
                        </div>

                        <div className="cp-row cp-row--link">
                            <div className="cp-rowKey">Tracking link</div>
                            <div className="cp-rowVal cp-rowVal--link">
                                {trackingLink !== "—" ? (
                                    <a
                                        href={trackingLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="odv-link"
                                    >
                                        {trackingLink}
                                    </a>
                                ) : (
                                    "—"
                                )}
                            </div>
                        </div>

                        {previewProps?.frontText ? (
                            <div className="cp-row">
                                <div className="cp-rowKey">Front text</div>
                                <div className="cp-rowVal">{previewProps.frontText}</div>
                            </div>
                        ) : null}

                        {previewProps?.frontFontWeight ? (
                            <div className="cp-row">
                                <div className="cp-rowKey">Text weight</div>
                                <div className="cp-rowVal">{previewProps.frontFontWeight}</div>
                            </div>
                        ) : null}

                        {previewProps?.frontFontSize ? (
                            <div className="cp-row">
                                <div className="cp-rowKey">Text size</div>
                                <div className="cp-rowVal">{previewProps.frontFontSize}px</div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>
        </>
    );
}