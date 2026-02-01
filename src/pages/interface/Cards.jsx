import React, { useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import "../../styling/dashboard/cards.css";

export default function Cards() {
    // TEMP: replace with real data later
    const [plan] = useState("free"); // "free" | "plus" | "teams"

    const [cards, setCards] = useState([
        {
            id: "c1",
            name: "KonarCard - Main",
            type: "NFC Card",
            material: "Plastic",
            status: "active", // active | inactive
            assignedProfile: "Main Profile",
            lastTap: "No taps yet",
        },
    ]);

    const [selectedId, setSelectedId] = useState(cards[0]?.id || null);

    const selectedCard = useMemo(
        () => cards.find((c) => c.id === selectedId) || cards[0] || null,
        [cards, selectedId]
    );

    // Placeholder rules (we will hook to subscriptions later)
    const maxCards = plan === "teams" ? 999 : 1;
    const canAddCard = cards.length < maxCards;
    const isLimitReached = !canAddCard && plan !== "teams";

    const handleOrderCard = () => {
        // Later: route to shop/cards or checkout flow
        window.location.href = "/products";
    };

    const handleDeactivate = (id) => {
        setCards((prev) =>
            prev.map((c) =>
                c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c
            )
        );
    };

    const handleAssignProfile = () => {
        alert("Assign a profile to this card (coming next)");
    };

    const handleCopyLink = async () => {
        if (!selectedCard) return;

        // Later: card will map to profile slug from DB
        const link = `${window.location.origin}/u/yourname`;
        try {
            await navigator.clipboard.writeText(link);
            alert("Profile link copied ✅");
        } catch {
            alert("Copy failed — please copy manually: " + link);
        }
    };

    const handleShare = async () => {
        if (!selectedCard) return;
        const link = `${window.location.origin}/u/yourname`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "My KonarCard Profile",
                    text: "Here’s my KonarCard profile link:",
                    url: link,
                });
            } catch {
                // user cancelled
            }
        } else {
            await handleCopyLink();
        }
    };

    return (
        <DashboardLayout
            title="Cards"
            subtitle="Manage your KonarCards and what profile each one links to."
            rightSlot={
                isLimitReached ? (
                    <button className="cards-btn cards-btn-primary locked" type="button" disabled>
                        Locked
                    </button>
                ) : (
                    <button className="cards-btn cards-btn-primary" type="button" onClick={handleOrderCard}>
                        + Order a card
                    </button>
                )
            }
        >
            <div className="cards-shell">
                {/* Page Header */}
                <div className="cards-header">
                    <div>
                        <h1 className="cards-title">Cards</h1>
                        <p className="cards-subtitle">
                            Your KonarCards are physical NFC products. Assign each card to a profile so customers
                            always land on the right page.
                        </p>
                    </div>

                    <div className="cards-header-meta">
                        <span className="cards-pill">
                            Plan: <strong>{plan.toUpperCase()}</strong>
                        </span>
                        <span className="cards-pill">
                            Cards: <strong>{cards.length}</strong> /{" "}
                            <strong>{maxCards === 999 ? "∞" : maxCards}</strong>
                        </span>
                    </div>
                </div>

                {/* Empty State */}
                {cards.length === 0 ? (
                    <section className="cards-card cards-empty">
                        <h2 className="cards-card-title">Order your first KonarCard</h2>
                        <p className="cards-muted">
                            Your card lets customers tap their phone to instantly save your contact and open your
                            profile.
                        </p>

                        <div className="cards-actions-row">
                            <button className="cards-btn cards-btn-primary" type="button" onClick={handleOrderCard}>
                                Order a card
                            </button>
                            <a className="cards-btn cards-btn-ghost" href="/products">
                                View card options
                            </a>
                        </div>

                        <div className="cards-empty-preview" aria-hidden="true">
                            <div className="cards-mock">
                                <div className="cards-mock-top" />
                                <div className="cards-mock-row">
                                    <div className="cards-mock-chip" />
                                    <div className="cards-mock-chip" />
                                </div>
                                <div className="cards-mock-block" />
                                <div className="cards-mock-line" />
                                <div className="cards-mock-line short" />
                            </div>
                        </div>
                    </section>
                ) : (
                    <div className="cards-grid">
                        {/* Cards list */}
                        <section className="cards-card cards-span-7">
                            <div className="cards-card-head">
                                <div>
                                    <h2 className="cards-card-title">Your cards</h2>
                                    <p className="cards-muted">Select a card to manage assignment & settings.</p>
                                </div>
                            </div>

                            <div className="cards-list">
                                {cards.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        className={`cards-item ${selectedCard?.id === c.id ? "active" : ""}`}
                                        onClick={() => setSelectedId(c.id)}
                                    >
                                        <div className="cards-item-left">
                                            <div className="cards-avatar" aria-hidden="true">
                                                K
                                            </div>

                                            <div className="cards-item-meta">
                                                <div className="cards-item-title">
                                                    {c.name} <span className="cards-type">• {c.material}</span>
                                                </div>
                                                <div className="cards-item-sub">
                                                    <span className="cards-muted">
                                                        Assigned: <strong>{c.assignedProfile || "Not assigned"}</strong>
                                                    </span>
                                                    <span className="cards-dot">•</span>
                                                    <span className="cards-muted">{c.lastTap}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="cards-item-right">
                                            <span className={`cards-status ${c.status}`}>
                                                {c.status === "active" ? "ACTIVE" : "INACTIVE"}
                                            </span>

                                            <button
                                                type="button"
                                                className="cards-mini-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeactivate(c.id);
                                                }}
                                            >
                                                {c.status === "active" ? "Disable" : "Enable"}
                                            </button>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Card Preview + Actions */}
                        <section className="cards-card cards-span-5">
                            <div className="cards-card-head">
                                <div>
                                    <h2 className="cards-card-title">Card preview</h2>
                                    <p className="cards-muted">Quick view of your selected card setup.</p>
                                </div>
                            </div>

                            <div className="cards-preview">
                                <div className="cards-preview-card">
                                    <div className="cards-preview-logo">K</div>
                                    <div className="cards-preview-name">{selectedCard?.name || "KonarCard"}</div>
                                    <div className="cards-preview-sub">
                                        {selectedCard?.material} • {selectedCard?.type}
                                    </div>
                                    <div className="cards-preview-qr" />
                                    <div className="cards-preview-row">
                                        <div className="cards-preview-pill" />
                                        <div className="cards-preview-pill" />
                                    </div>
                                </div>

                                <div className="cards-actions">
                                    <h3 className="cards-actions-title">Card actions</h3>

                                    <div className="cards-actions-row">
                                        <button className="cards-btn cards-btn-primary" type="button" onClick={handleAssignProfile}>
                                            Assign profile
                                        </button>

                                        <button className="cards-btn cards-btn-ghost" type="button" onClick={handleShare}>
                                            Share link
                                        </button>

                                        <button className="cards-btn cards-btn-ghost" type="button" onClick={handleCopyLink}>
                                            Copy link
                                        </button>
                                    </div>

                                    <div className="cards-note">
                                        Tip: Assign each card to a profile so the right details open when customers tap.
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Teams Upsell */}
                        <section className="cards-card cards-span-12">
                            <div className="cards-upsell">
                                <div>
                                    <h2 className="cards-card-title">Need multiple cards?</h2>
                                    <p className="cards-muted">
                                        Teams lets you manage multiple cards and assign them to multiple profiles —
                                        perfect for staff or growing businesses.
                                    </p>
                                </div>

                                <div className="cards-upsell-right">
                                    {isLimitReached ? (
                                        <>
                                            <div className="cards-locked-note">You’ve reached your plan limit.</div>
                                            <a className="cards-btn cards-btn-primary" href="/subscription">
                                                Upgrade to Teams
                                            </a>
                                        </>
                                    ) : (
                                        <button className="cards-btn cards-btn-primary" type="button" onClick={handleOrderCard}>
                                            + Order another card
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
