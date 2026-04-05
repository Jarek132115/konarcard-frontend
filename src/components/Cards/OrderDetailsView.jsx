import React from "react";
import "../../styling/dashboard/order-details-view.css";

function prettyLabel(value) {
    const v = String(value || "").trim();
    if (!v) return "—";

    return v
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function prettyStatus(value) {
    const v = String(value || "").trim().toLowerCase();
    if (!v) return "—";

    if (v === "paid") return "Paid";
    if (v === "pending") return "Pending";
    if (v === "fulfilled") return "Fulfilled";
    if (v === "processing") return "Processing";
    if (v === "shipped") return "Shipped";
    if (v === "cancelled") return "Cancelled";
    if (v === "failed") return "Failed";

    return v.charAt(0).toUpperCase() + v.slice(1);
}

function prettyLogoSize(value) {
    const v = String(value || "").trim().toLowerCase();
    if (!v) return "Medium";

    if (v === "small") return "Small";
    if (v === "medium") return "Medium";
    if (v === "large") return "Large";

    return prettyLabel(v);
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

    const productKey = String(selectedOrder?.productKey || "");
    const meta = productMeta?.[productKey] || {};

    const variant =
        selectedOrder?.variantRaw ||
        selectedOrder?.preview?.variant ||
        meta?.defaultVariant ||
        "white";

    const logoPercent = Number(selectedOrder?.preview?.logoPercent || 70);
    const logoSrc = selectedOrder?.logoUrl || defaultLogoDataUrl;
    const qrSrc = selectedOrder?.link ? qrSrcFromLink(selectedOrder.link) : "";

    const orderTotal = formatMoneyMinor(
        selectedOrder?.amountTotal,
        selectedOrder?.currency
    );

    const profileName =
        selectedOrder?.assignedProfile ||
        selectedOrder?.profileSlug ||
        "—";

    const profileLink = selectedOrder?.link || "";

    return (
        <div className="odv-shell">
            <div className="odv-topActions">
                <button type="button" className="odv-backBtn" onClick={onBack}>
                    Back to cards
                </button>
            </div>

            <section className="cp-card odv-heroCard">
                <div className="cp-cardHead odv-heroHead">
                    <div>
                        <div className="cp-eyebrow">Order details</div>
                        <h2 className="cp-cardTitle">
                            {selectedOrder?.title || "Order details"}
                        </h2>
                        <p className="cp-muted">
                            View your purchased product, saved configuration, and current order information.
                        </p>
                    </div>
                </div>

                <div className="odv-heroGrid">
                    <div className="cp-previewCard odv-previewCard">
                        <CardPreviewErrorBoundary
                            resetKey={`${selectedOrder?.id}-${selectedOrder?.productKey}-${selectedOrder?.variantRaw}-${selectedOrder?.logoUrl}`}
                            fallback={
                                <div className="cp-previewFallback">
                                    3D preview unavailable
                                </div>
                            }
                        >
                            <Card3DDetails
                                productKey={selectedOrder?.productKey}
                                logoSrc={logoSrc}
                                qrSrc={qrSrc}
                                logoPercent={logoPercent}
                                variant={variant}
                            />
                        </CardPreviewErrorBoundary>
                    </div>

                    <div className="odv-sideStack">
                        <div className="cp-innerCard odv-infoCard">
                            <div className="cp-innerTitle">Order summary</div>

                            <div className="cp-row">
                                <span className="cp-rowKey">Product</span>
                                <span className="cp-rowVal">
                                    {selectedOrder?.title || "—"}
                                </span>
                            </div>

                            <div className="cp-row">
                                <span className="cp-rowKey">Status</span>
                                <span className="cp-rowVal">
                                    {prettyStatus(selectedOrder?.status)}
                                </span>
                            </div>

                            <div className="cp-row">
                                <span className="cp-rowKey">Assigned profile</span>
                                <span className="cp-rowVal">{profileName}</span>
                            </div>

                            <div className="cp-row">
                                <span className="cp-rowKey">Variant</span>
                                <span className="cp-rowVal">{prettyLabel(variant)}</span>
                            </div>

                            <div className="cp-row">
                                <span className="cp-rowKey">Quantity</span>
                                <span className="cp-rowVal">
                                    {selectedOrder?.quantity || 1}
                                </span>
                            </div>

                            <div className="cp-row">
                                <span className="cp-rowKey">Total</span>
                                <span className="cp-rowVal">{orderTotal}</span>
                            </div>

                            <div className="cp-row">
                                <span className="cp-rowKey">Ordered</span>
                                <span className="cp-rowVal">
                                    {selectedOrder?.createdAt || "—"}
                                </span>
                            </div>
                        </div>

                        <div className="cp-innerCard odv-infoCard">
                            <div className="cp-innerTitle">Saved configuration</div>

                            <div className="cp-row">
                                <span className="cp-rowKey">Edition</span>
                                <span className="cp-rowVal">
                                    {prettyLabel(
                                        selectedOrder?.preview?.edition ||
                                        meta?.edition ||
                                        ""
                                    )}
                                </span>
                            </div>

                            <div className="cp-row">
                                <span className="cp-rowKey">Logo size</span>
                                <span className="cp-rowVal">
                                    {prettyLogoSize(selectedOrder?.preview?.logoPreset)}
                                </span>
                            </div>

                            <div className="cp-row">
                                <span className="cp-rowKey">Custom logo</span>
                                <span className="cp-rowVal">
                                    {selectedOrder?.logoUrl ? "Yes" : "No"}
                                </span>
                            </div>

                            <div className="cp-row cp-row--link">
                                <span className="cp-rowKey">Profile link</span>
                                <span className="cp-rowVal cp-rowVal--link">
                                    {profileLink ? (
                                        <a
                                            href={profileLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="odv-link"
                                        >
                                            {profileLink}
                                        </a>
                                    ) : (
                                        "—"
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="cp-innerCard odv-infoCard">
                            <div className="cp-innerTitle">Delivery</div>

                            <div className="cp-row">
                                <span className="cp-rowKey">Current status</span>
                                <span className="cp-rowVal">
                                    {prettyStatus(selectedOrder?.status)}
                                </span>
                            </div>

                            <div className="cp-row">
                                <span className="cp-rowKey">Tracking</span>
                                <span className="cp-rowVal">Not available yet</span>
                            </div>

                            <div className="cp-row">
                                <span className="cp-rowKey">Dispatch</span>
                                <span className="cp-rowVal">Managed by admin panel later</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}