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
    const status = safeTrim(selectedOrder?.status);
    if (!status) return "—";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function resolvedLogoSrc(selectedOrder, defaultLogoDataUrl) {
    const raw = safeTrim(selectedOrder?.logoUrl);
    if (raw) return raw;
    return defaultLogoDataUrl || "";
}

function resolvedQrSrc(selectedOrder, qrSrcFromLink) {
    const explicitQr =
        safeTrim(selectedOrder?._raw?.preview?.qrCodeUrl) ||
        safeTrim(selectedOrder?._raw?.profile?.qr_code_url);

    if (explicitQr) return explicitQr;

    const nfcTrackedUrl =
        safeTrim(selectedOrder?._raw?.preview?.nfcProfileUrl) ||
        safeTrim(selectedOrder?._raw?.preview?.publicProfileUrl) ||
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
    const status = orderStatusLabel(selectedOrder);
    const quantity = quantityLabel(selectedOrder);
    const profileSlug = safeTrim(selectedOrder?.profileSlug) || "—";

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
                            fallback={
                                <div className="cp-previewFallback">
                                    Preview unavailable
                                </div>
                            }
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
                            <div className="cp-rowKey">Status</div>
                            <div className="cp-rowVal">{status}</div>
                        </div>

                        <div className="cp-row">
                            <div className="cp-rowKey">Ordered on</div>
                            <div className="cp-rowVal">{createdAt}</div>
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