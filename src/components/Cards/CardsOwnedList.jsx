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

                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        className={`cp-item ${isSelected ? "active" : ""}`}
                                        onClick={() => onSelect(c.id)}
                                    >
                                        <div className="cp-preview" aria-hidden="true" />

                                        <div className="cp-info">
                                            <div className="cp-name">{c.title}</div>

                                            <div className="cp-sub">
                                                <span className="cp-subLabel">Assigned Profile:</span>
                                                <span className="cp-subValue">{c.profileSlug || "—"}</span>
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