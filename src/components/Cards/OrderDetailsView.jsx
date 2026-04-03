import React from "react";
import "../../styling/dashboard/order-details-view.css";

function OrderFlatPreview({ order, productMeta, defaultLogoDataUrl }) {
    const productKey = String(order?.productKey || "");
    const meta = productMeta?.[productKey] || null;
    const variant = String(
        order?.variantRaw || order?.preview?.variant || meta?.defaultVariant || "white"
    ).toLowerCase();

    const logoSrc =
        (typeof order?.logoUrl === "string" && order.logoUrl.trim()) ||
        defaultLogoDataUrl;

    const isTag = productKey === "konartag";
    const isDark =
        variant === "black" ||
        (productKey === "metal-card" && variant === "black") ||
        (productKey === "konartag" && variant === "black");

    const bg =
        productKey === "metal-card"
            ? variant === "gold"
                ? "linear-gradient(135deg, #f7e3a2 0%, #ddb85a 100%)"
                : "linear-gradient(135deg, #20242d 0%, #11151c 100%)"
            : productKey === "konartag"
                ? variant === "gold"
                    ? "linear-gradient(135deg, #f7e3a2 0%, #ddb85a 100%)"
                    : "linear-gradient(135deg, #20242d 0%, #11151c 100%)"
                : variant === "black"
                    ? "linear-gradient(135deg, #1f2430 0%, #0f141c 100%)"
                    : "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)";

    return (
        <div
            className={`odv-flatCard ${isTag ? "is-tag" : "is-card"}`}
            style={{ background: bg }}
        >
            <div className="odv-flatCardInner">
                <div className={`odv-flatLogoWrap ${isDark ? "is-dark" : "is-light"}`}>
                    <img src={logoSrc} alt="" className="odv-flatLogo" />
                </div>

                <div className="odv-flatFooter">
                    <div className={`odv-flatName ${isDark ? "is-dark" : "is-light"}`}>
                        {meta?.name || "KonarCard"}
                    </div>

                    <div className="odv-flatQr" />
                </div>
            </div>
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
    if (!selectedOrder) {
        return <div className="cp-alert danger">This order could not be found.</div>;
    }

    const variant =
        selectedOrder.variantRaw ||
        selectedOrder?.preview?.variant ||
        productMeta?.[selectedOrder.productKey]?.defaultVariant ||
        "white";

    const logoPercent = Number(selectedOrder?.preview?.logoPercent || 70);
    const logoSrc = selectedOrder.logoUrl || defaultLogoDataUrl;
    const qrSrc = selectedOrder.link ? qrSrcFromLink(selectedOrder.link) : "";

    return (
        <div className="odv-shell">
            <div className="cp-cardHead">
                <div>
                    <div className="cp-eyebrow">Order details</div>
                    <h2 className="cp-cardTitle">{selectedOrder.title || "Order details"}</h2>
                    <p className="cp-muted">
                        View your saved card, order status, and full order details.
                    </p>
                </div>

                <button type="button" className="cp-selectBtn" onClick={onBack}>
                    Back to cards
                </button>
            </div>

            <div className="cp-detailsGrid">
                <div className="cp-previewCard odv-previewCard">
                    <div className="odv-flatPreviewWrap">
                        <OrderFlatPreview
                            order={selectedOrder}
                            productMeta={productMeta}
                            defaultLogoDataUrl={defaultLogoDataUrl}
                        />
                    </div>
                </div>

                <div className="cp-innerCard">
                    <div className="cp-innerTitle">Order summary</div>

                    <div className="cp-row">
                        <span className="cp-rowKey">Product</span>
                        <span className="cp-rowVal">{selectedOrder.title}</span>
                    </div>

                    <div className="cp-row">
                        <span className="cp-rowKey">Status</span>
                        <span className="cp-rowVal">{selectedOrder.status || "—"}</span>
                    </div>

                    <div className="cp-row">
                        <span className="cp-rowKey">Assigned profile</span>
                        <span className="cp-rowVal">{selectedOrder.profileSlug || "—"}</span>
                    </div>

                    <div className="cp-row">
                        <span className="cp-rowKey">Variant</span>
                        <span className="cp-rowVal">{selectedOrder.variantRaw || "—"}</span>
                    </div>

                    <div className="cp-row">
                        <span className="cp-rowKey">Quantity</span>
                        <span className="cp-rowVal">{selectedOrder.quantity || 1}</span>
                    </div>

                    <div className="cp-row">
                        <span className="cp-rowKey">Total</span>
                        <span className="cp-rowVal">
                            {formatMoneyMinor(selectedOrder.amountTotal, selectedOrder.currency)}
                        </span>
                    </div>

                    <div className="cp-row">
                        <span className="cp-rowKey">Ordered</span>
                        <span className="cp-rowVal">{selectedOrder.createdAt || "—"}</span>
                    </div>

                    <div className="cp-row">
                        <span className="cp-rowKey">Custom logo</span>
                        <span className="cp-rowVal">{selectedOrder.logoUrl ? "yes" : "no"}</span>
                    </div>
                </div>
            </div>

            <div className="cp-divider" />

            <div className="cp-cardHead">
                <div>
                    <h2 className="cp-cardTitle">3D preview</h2>
                    <p className="cp-muted">A live 3D preview of the saved card configuration.</p>
                </div>
            </div>

            <div className="cp-detailsGrid">
                <div className="cp-previewCard">
                    <CardPreviewErrorBoundary
                        resetKey={`${selectedOrder.id}-${selectedOrder.productKey}-${selectedOrder.variantRaw}`}
                        fallback={<div className="cp-previewFallback">3D preview unavailable</div>}
                    >
                        <Card3DDetails
                            productKey={selectedOrder.productKey}
                            logoSrc={logoSrc}
                            qrSrc={qrSrc}
                            logoPercent={logoPercent}
                            variant={variant}
                        />
                    </CardPreviewErrorBoundary>
                </div>

                <div className="cp-innerCard">
                    <div className="cp-innerTitle">Saved configuration</div>

                    <div className="cp-row">
                        <span className="cp-rowKey">Edition</span>
                        <span className="cp-rowVal">
                            {productMeta?.[selectedOrder.productKey]?.edition || "—"}
                        </span>
                    </div>

                    <div className="cp-row">
                        <span className="cp-rowKey">Logo size</span>
                        <span className="cp-rowVal">
                            {selectedOrder?.preview?.logoPreset || "medium"}
                        </span>
                    </div>

                    <div className="cp-row">
                        <span className="cp-rowKey">Profile link</span>
                        <span className="cp-rowVal">{selectedOrder.link || "—"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}