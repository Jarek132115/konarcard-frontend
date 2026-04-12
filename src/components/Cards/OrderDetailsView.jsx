import React, { useMemo } from "react";
import { motion } from "framer-motion";
import "../../styling/dashboard/order-details-view.css";

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

function formatDeliveryDate(value) {
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
    const raw = safeTrim(selectedOrder?.status || selectedOrder?._raw?.status).toLowerCase();
    if (!raw) return "—";

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

function orderStatusTone(selectedOrder) {
    const raw = safeTrim(selectedOrder?.status || selectedOrder?._raw?.status).toLowerCase();

    if (["paid", "fulfilled", "processing", "complete", "completed", "shipped"].includes(raw)) {
        return "success";
    }
    if (raw === "pending") return "warn";
    if (raw === "failed" || raw === "cancelled" || raw === "canceled") return "danger";
    return "neutral";
}

function fulfillmentStatusLabel(selectedOrder) {
    const raw = safeTrim(
        selectedOrder?.fulfillmentStatus ||
        selectedOrder?._raw?.fulfillmentStatus
    ).toLowerCase();

    if (!raw) return "—";
    if (raw === "order_placed") return "Order placed";
    if (raw === "designing_card") return "Card is being prepared";
    if (raw === "packaged") return "Packaged";
    if (raw === "shipped") return "Shipment is on the way";
    if (raw === "delivered") return "Delivered";

    return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function fulfillmentStatusTone(selectedOrder) {
    const raw = safeTrim(
        selectedOrder?.fulfillmentStatus ||
        selectedOrder?._raw?.fulfillmentStatus
    ).toLowerCase();

    if (raw === "delivered") return "success";
    if (raw === "shipped" || raw === "packaged" || raw === "designing_card") return "info";
    if (raw === "order_placed") return "neutral";
    return "neutral";
}

function resolvedLogoSrc(selectedOrder, defaultLogoDataUrl) {
    const raw = safeTrim(selectedOrder?.logoUrl);
    if (raw) return raw;
    return defaultLogoDataUrl || "";
}

function resolvedQrSrc(selectedOrder, qrSrcFromLink) {
    const explicitQrImage =
        safeTrim(selectedOrder?.qrCodeUrl) ||
        safeTrim(selectedOrder?._raw?.qrCodeUrl) ||
        safeTrim(selectedOrder?._raw?.profile?.qr_code_url) ||
        safeTrim(selectedOrder?._raw?.preview?.qrCodeUrl);

    if (explicitQrImage) return explicitQrImage;

    const qrTargetUrl =
        safeTrim(selectedOrder?.qrTargetUrl) ||
        safeTrim(selectedOrder?._raw?.qrTargetUrl) ||
        safeTrim(selectedOrder?._raw?.preview?.qrTargetUrl);

    if (qrTargetUrl) {
        return typeof qrSrcFromLink === "function" ? qrSrcFromLink(qrTargetUrl) : "";
    }

    const publicUrl =
        safeTrim(selectedOrder?.publicProfileUrl) ||
        safeTrim(selectedOrder?._raw?.publicProfileUrl) ||
        safeTrim(selectedOrder?._raw?.preview?.publicProfileUrl) ||
        safeTrim(selectedOrder?.link);

    if (!publicUrl) return "";

    const fallbackQrUrl = `${publicUrl}${publicUrl.includes("?") ? "&" : "?"}via=qr`;
    return typeof qrSrcFromLink === "function" ? qrSrcFromLink(fallbackQrUrl) : "";
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
        safeTrim(selectedOrder?.frontText) ||
        "KONAR";

    const frontFontWeight = Number(
        previewCustomization?.fontWeight ||
        topLevelCustomization?.fontWeight ||
        selectedOrder?.frontFontWeight ||
        700
    );

    const frontFontSize = Number(
        previewCustomization?.fontSize ||
        topLevelCustomization?.fontSize ||
        selectedOrder?.frontFontSize ||
        42
    );

    const frontTextColor =
        safeTrim(previewCustomization?.textColor) ||
        safeTrim(topLevelCustomization?.textColor) ||
        safeTrim(selectedOrder?.frontTextColor) ||
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
        safeTrim(selectedOrder?.trackingCode) ||
        safeTrim(selectedOrder?._raw?.trackingCode) ||
        "—"
    );
}

function trackingUrlLabel(selectedOrder) {
    return (
        safeTrim(selectedOrder?.trackingUrl) ||
        safeTrim(selectedOrder?._raw?.trackingUrl) ||
        "—"
    );
}

function deliveryNameLabel(selectedOrder) {
    return (
        safeTrim(selectedOrder?.deliveryName) ||
        safeTrim(selectedOrder?._raw?.deliveryName) ||
        "—"
    );
}

function deliveryAddressLabel(selectedOrder) {
    return (
        safeTrim(selectedOrder?.deliveryAddress) ||
        safeTrim(selectedOrder?._raw?.deliveryAddress) ||
        "—"
    );
}

function deliveredDateLabel(selectedOrder) {
    const deliveredAt =
        safeTrim(selectedOrder?.deliveredAt) ||
        safeTrim(selectedOrder?._raw?.deliveredAt) ||
        safeTrim(selectedOrder?._raw?.updatedAt) ||
        safeTrim(selectedOrder?.updatedAt);

    if (!deliveredAt) return "—";
    return formatDeliveryDate(deliveredAt);
}

function estimatedDeliveryLabel(selectedOrder) {
    const raw =
        safeTrim(selectedOrder?.deliveryWindow) ||
        safeTrim(selectedOrder?._raw?.deliveryWindow);

    if (!raw) return "—";
    return formatDeliveryDate(raw);
}

function isDelivered(selectedOrder) {
    const raw = safeTrim(
        selectedOrder?.fulfillmentStatus ||
        selectedOrder?._raw?.fulfillmentStatus
    ).toLowerCase();

    return raw === "delivered";
}

function CopyButton({ value, label = "Copy" }) {
    const onCopy = async () => {
        if (!value || value === "—") return;
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // ignore
        }
    };

    return (
        <button type="button" className="odv-copyBtn" onClick={onCopy} disabled={!value || value === "—"}>
            {label}
        </button>
    );
}

function InfoRow({ label, value, link = false, copy = false }) {
    const hasValue = !!safeTrim(value) && value !== "—";

    return (
        <div className={`odv-infoRow ${link ? "odv-infoRow--link" : ""}`}>
            <div className="odv-infoLabel">{label}</div>
            <div className="odv-infoValueWrap">
                {link ? (
                    hasValue ? (
                        <a
                            className="odv-link"
                            href={value}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {value}
                        </a>
                    ) : (
                        <div className="odv-infoValue">—</div>
                    )
                ) : (
                    <div className="odv-infoValue">{value || "—"}</div>
                )}

                {copy ? <CopyButton value={value} /> : null}
            </div>
        </div>
    );
}

function MetricTile({ label, value, tone = "neutral" }) {
    return (
        <div className={`odv-metricTile odv-metricTile--${tone}`}>
            <div className="odv-metricLabel">{label}</div>
            <div className="odv-metricValue">{value}</div>
        </div>
    );
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
        const edition = safeTrim(
            meta?.edition ||
            selectedOrder?.preview?.edition ||
            selectedOrder?._raw?.preview?.edition ||
            "plastic"
        );

        const variant =
            safeTrim(selectedOrder?.variantRaw) ||
            safeTrim(selectedOrder?.preview?.variant) ||
            safeTrim(selectedOrder?._raw?.preview?.variant) ||
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
            <div className="odv-shell">
                <div className="odv-topActions">
                    <button type="button" className="odv-backBtn" onClick={onBack}>
                        Back to cards
                    </button>
                </div>

                <section className="cp-card odv-heroCard">
                    <div className="cp-emptyState">
                        <div className="cp-emptyStateCard">
                            <div className="cp-emptyStateTitle">Order not found</div>
                            <p className="cp-emptyStateText">
                                We could not find that order. Please go back to your cards list.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
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
    const status = orderStatusLabel(selectedOrder);
    const statusTone = orderStatusTone(selectedOrder);
    const fulfillmentStatus = fulfillmentStatusLabel(selectedOrder);
    const fulfillmentTone = fulfillmentStatusTone(selectedOrder);
    const quantity = quantityLabel(selectedOrder);
    const profileSlug = safeTrim(selectedOrder?.profileSlug) || "—";
    const trackingCode = trackingCodeLabel(selectedOrder);
    const trackingUrl = trackingUrlLabel(selectedOrder);
    const deliveryName = deliveryNameLabel(selectedOrder);
    const deliveryAddress = deliveryAddressLabel(selectedOrder);

    const deliveryInfoLabel = isDelivered(selectedOrder)
        ? "Delivered on"
        : "Estimated delivery";

    const deliveryInfoValue = isDelivered(selectedOrder)
        ? deliveredDateLabel(selectedOrder)
        : estimatedDeliveryLabel(selectedOrder);

    return (
        <div className="odv-shell">
            <div className="odv-topActions">
                <button type="button" className="odv-backBtn" onClick={onBack}>
                    Back to cards
                </button>
            </div>

            <motion.section
                className="cp-card odv-heroCard"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
            >
                <div className="odv-heroHead">
                    <div className="cp-eyebrow">Order details</div>
                    <h2 className="cp-cardTitle">{productTitle}</h2>
                    <p className="cp-muted">
                        View your product details, delivery progress, shipping information, and linked profile setup.
                    </p>
                </div>

                <div className="odv-metricsGrid">
                    <MetricTile label="Order status" value={status} tone={statusTone} />
                    <MetricTile label="Delivery status" value={fulfillmentStatus} tone={fulfillmentTone} />
                    <MetricTile label="Total" value={amountFormatted} />
                    <MetricTile label="Quantity" value={quantity} />
                </div>

                <div className="odv-heroGrid">
                    <motion.div
                        className="cp-previewCard odv-previewCard"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.04, ease: "easeOut" }}
                    >
                        <CardPreviewErrorBoundary
                            resetKey={`${selectedOrder?.id || "order"}-${previewProps?.productKey || "product"}-${previewProps?.variant || "variant"}-${previewProps?.frontText || "text"}`}
                            fallback={<div className="cp-previewFallback">Preview unavailable</div>}
                        >
                            <div className="cp-preview3dWrap">
                                <Card3DDetails {...previewProps} />
                            </div>
                        </CardPreviewErrorBoundary>
                    </motion.div>

                    <div className="odv-sideStack">
                        <motion.section
                            className="cp-innerCard odv-infoCard"
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.08, ease: "easeOut" }}
                        >
                            <div className="odv-sectionHead">
                                <h3 className="odv-sectionTitle">Order summary</h3>
                                <p className="odv-sectionText">Core order and product details.</p>
                            </div>

                            <div className="odv-infoList">
                                <InfoRow label="Product" value={productTitle} />
                                <InfoRow label="Assigned profile" value={profileLabel} />
                                <InfoRow label="Profile slug" value={profileSlug} copy={profileSlug !== "—"} />
                                <InfoRow label="Variant" value={variant} />
                                <InfoRow label="Ordered on" value={createdAt} />
                                <InfoRow label={deliveryInfoLabel} value={deliveryInfoValue} />
                            </div>
                        </motion.section>

                        <motion.section
                            className="cp-innerCard odv-infoCard"
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.12, ease: "easeOut" }}
                        >
                            <div className="odv-sectionHead">
                                <h3 className="odv-sectionTitle">Shipping & tracking</h3>
                                <p className="odv-sectionText">Delivery contact and tracking info.</p>
                            </div>

                            <div className="odv-infoList">
                                <InfoRow label="Tracking code" value={trackingCode} copy={trackingCode !== "—"} />
                                <InfoRow label="Tracking link" value={trackingUrl} link copy={trackingUrl !== "—"} />
                                <InfoRow label="Delivery name" value={deliveryName} />
                                <InfoRow label="Delivery address" value={deliveryAddress} />
                            </div>
                        </motion.section>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}