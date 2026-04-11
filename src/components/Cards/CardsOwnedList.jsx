import React from "react";

function PencilIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M14.1 4.9l5 5L8 21H3v-5L14.1 4.9z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M13 6l5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function safeTrim(v) {
    return String(v || "").trim();
}

function formatShortDateTime(value) {
    const raw = safeTrim(value);
    if (!raw) return "—";

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;

    return parsed.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
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
        month: "short",
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

    return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function getStatusTone(card) {
    const raw = safeTrim(card?.status || card?._raw?.status).toLowerCase();

    if (raw === "paid" || raw === "fulfilled") return "success";
    if (raw === "pending") return "warn";
    if (raw === "failed" || raw === "cancelled" || raw === "canceled") return "danger";
    return "neutral";
}

function getFulfillmentStatus(card) {
    return safeTrim(card?._raw?.fulfillmentStatus || card?.fulfillmentStatus).toLowerCase();
}

function getEstimatedDelivery(card) {
    const saved =
        safeTrim(card?.deliveryWindow) ||
        safeTrim(card?._raw?.deliveryWindow);

    if (saved) return saved;

    return fallbackEstimatedDelivery(card?._raw?.createdAt || card?.createdAt);
}

function getMetaLine(card) {
    const fulfillment = getFulfillmentStatus(card);

    if (fulfillment === "delivered") {
        return {
            label: "Ordered on",
            value: formatShortDateTime(card?._raw?.createdAt || card?.createdAt),
        };
    }

    return {
        label: "Estimated delivery",
        value: getEstimatedDelivery(card),
    };
}

export default function CardsOwnedList({
    loading,
    error,
    cards,
    selectedId,
    onSelect,
    onAssign,
    onBuyAnother,
}) {
    return (
        <section className="cp-card">
            <div className="cp-cardHead">
                <div>
                    <h2 className="cp-cardTitle">Your cards</h2>
                    <p className="cp-muted">Tap a card to view details below.</p>
                </div>
            </div>

            {error ? <div className="cp-alert danger">{error}</div> : null}

            <div className="cp-grid">
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div key={`sk-${i}`} className="cp-item skel">
                            <div className="cp-preview" />
                            <div className="cp-info">
                                <div className="cp-name sk-line w60" />
                                <div className="cp-sub sk-line w40" />
                                <div className="cp-actions">
                                    <div className="cp-miniBtn sk-mini" />
                                    <div className="cp-selectBtn sk-btn" />
                                </div>
                            </div>
                        </div>
                    ))
                    : (
                        <>
                            {cards.map((c) => {
                                const isSelected = c.id === selectedId;
                                const statusLabel = getStatusLabel(c);
                                const statusTone = getStatusTone(c);
                                const meta = getMetaLine(c);

                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        className={`cp-item ${isSelected ? "active" : ""}`}
                                        onClick={() => onSelect(c.id)}
                                    >
                                        <div className="cp-preview" aria-hidden="true" />

                                        <div className="cp-info">
                                            <div className="cp-ownedTopRow">
                                                <div className="cp-name">{c.title}</div>
                                                <span className={`cp-orderPill cp-orderPill--${statusTone}`}>
                                                    {statusLabel}
                                                </span>
                                            </div>

                                            <div className="cp-sub">
                                                <span className="cp-subLabel">Assigned Profile:</span>
                                                <span className="cp-subValue">{c.profileSlug || "—"}</span>
                                            </div>

                                            <div className="cp-ownedMetaLine">
                                                <span className="cp-ownedMetaLabel">{meta.label}:</span>
                                                <span className="cp-ownedMetaValue">{meta.value}</span>
                                            </div>

                                            <div className="cp-actions">
                                                <button
                                                    type="button"
                                                    className="cp-miniBtn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAssign(c);
                                                    }}
                                                    aria-label="Assign profile"
                                                    title="Assign profile"
                                                >
                                                    <PencilIcon />
                                                </button>

                                                {isSelected ? (
                                                    <button type="button" className="cp-selectBtn selected" disabled>
                                                        Selected
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="cp-selectBtn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSelect(c.id);
                                                        }}
                                                    >
                                                        Select
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}

                            <button type="button" className="cp-buyTile" onClick={onBuyAnother}>
                                <span className="cp-buyPlus" aria-hidden="true">＋</span>
                                <span className="cp-buyText">Buy another product</span>
                            </button>
                        </>
                    )}
            </div>
        </section>
    );
}