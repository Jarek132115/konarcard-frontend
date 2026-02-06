import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import "../../styling/dashboard/cards.css";

/**
 * Fetch helper (uses JWT token in localStorage like the rest of the app)
 */
async function apiGetJson(path) {
    const token = localStorage.getItem("token") || "";
    const res = await fetch(path, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
    });

    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        // ignore
    }

    if (!res.ok) {
        const msg =
            data?.message ||
            data?.error ||
            `Request failed (${res.status})`;
        throw new Error(msg);
    }

    return data;
}

function titleFromOrder(order) {
    const productKey = String(order?.productKey || "");
    const profileName =
        order?.profile?.business_card_name ||
        order?.profile?.main_heading ||
        order?.profile?.full_name ||
        order?.profile?.username ||
        "";

    if (productKey === "plastic-card") return profileName ? `Plastic Card • ${profileName}` : "Plastic Card";
    if (productKey === "metal-card") return profileName ? `Metal Card • ${profileName}` : "Metal Card";
    if (productKey === "konartag") return profileName ? `KonarTag • ${profileName}` : "KonarTag";

    return profileName ? `KonarCard • ${profileName}` : "KonarCard";
}

function materialFromOrder(order) {
    const productKey = String(order?.productKey || "");
    if (productKey === "plastic-card") return "Plastic";
    if (productKey === "metal-card") return "Metal";
    if (productKey === "konartag") return "KonarTag";
    return "NFC";
}

function typeFromOrder(order) {
    const productKey = String(order?.productKey || "");
    if (productKey === "konartag") return "NFC Tag";
    return "NFC Card";
}

function variantFromOrder(order) {
    // We currently store variant in preview.variant (and also in Stripe metadata)
    const v =
        order?.variant ||
        order?.preview?.variant ||
        order?.preview?.color ||
        "";
    return v ? String(v).toUpperCase() : "";
}

function uiStatusFromOrder(order) {
    // UI only has active/inactive right now.
    // Paid -> active, everything else -> inactive
    const s = String(order?.status || "").toLowerCase();
    return s === "paid" || s === "fulfilled" ? "active" : "inactive";
}

function assignedProfileFromOrder(order) {
    return (
        order?.profile?.business_card_name ||
        order?.profile?.main_heading ||
        order?.profile?.full_name ||
        order?.profile?.username ||
        "Not assigned"
    );
}

function profileLinkFromOrder(order) {
    // Adjust these keys to whatever your BusinessCard doc actually stores.
    const slug =
        order?.profile?.slug ||
        order?.profile?.username ||
        order?.profile?.profile_username ||
        order?.profile?.safeSlug ||
        "";

    if (!slug) return "";
    return `${window.location.origin}/u/${slug}`;
}

export default function Cards() {
    // TEMP: you can later source this from the user/subscription object
    const [plan] = useState("free"); // "free" | "plus" | "teams"

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [orders, setOrders] = useState([]);

    // Local UI toggle (until you add a backend field for enabling/disabling)
    const [overrides, setOverrides] = useState({}); // { [orderId]: "active" | "inactive" }

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setError("");

                const data = await apiGetJson("/api/nfc-orders/mine");
                const list = Array.isArray(data) ? data : data?.orders || data?.data || [];

                if (!alive) return;
                setOrders(Array.isArray(list) ? list : []);
            } catch (e) {
                if (!alive) return;
                setError(e?.message || "Failed to load orders.");
                setOrders([]);
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    const cards = useMemo(() => {
        return (orders || []).map((o) => {
            const baseStatus = uiStatusFromOrder(o);
            const id = String(o?._id || o?.id || "");

            return {
                id,
                name: titleFromOrder(o),
                type: typeFromOrder(o),
                material: materialFromOrder(o),
                variant: variantFromOrder(o),
                quantity: Number(o?.quantity || 1),
                status: overrides[id] || baseStatus, // active|inactive
                orderStatus: String(o?.status || ""), // raw: pending/paid/...
                assignedProfile: assignedProfileFromOrder(o),
                logoUrl: o?.logoUrl || "",
                createdAt: o?.createdAt ? new Date(o.createdAt).toLocaleString() : "",
                link: profileLinkFromOrder(o),
                lastTap: "No taps yet", // not implemented yet
                _raw: o,
            };
        });
    }, [orders, overrides]);

    const [selectedId, setSelectedId] = useState(null);

    // Keep selectedId stable when data loads
    useEffect(() => {
        if (!selectedId && cards[0]?.id) setSelectedId(cards[0].id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cards.length]);

    const selectedCard = useMemo(
        () => cards.find((c) => c.id === selectedId) || cards[0] || null,
        [cards, selectedId]
    );

    // Placeholder rules (we will hook to subscriptions later)
    const maxCards = plan === "teams" ? 999 : 1;
    const canAddCard = cards.length < maxCards;
    const isLimitReached = !canAddCard && plan !== "teams";

    const handleOrderCard = () => {
        window.location.href = "/products";
    };

    const handleDeactivate = (id) => {
        setOverrides((prev) => {
            const current = prev[id] || cards.find((c) => c.id === id)?.status || "inactive";
            return { ...prev, [id]: current === "active" ? "inactive" : "active" };
        });
    };

    const handleAssignProfile = () => {
        alert("Assign a profile to this card (coming next)");
    };

    const handleCopyLink = async () => {
        if (!selectedCard) return;

        const link = selectedCard.link || `${window.location.origin}/products`;
        try {
            await navigator.clipboard.writeText(link);
            alert("Link copied ✅");
        } catch {
            alert("Copy failed — please copy manually: " + link);
        }
    };

    const handleShare = async () => {
        if (!selectedCard) return;

        const link = selectedCard.link || `${window.location.origin}/products`;

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
                            Your KonarCards are physical NFC products. Assign each card to a profile so customers always land on the
                            right page.
                        </p>

                        {loading ? (
                            <p className="cards-muted" style={{ marginTop: 10 }}>
                                Loading your orders…
                            </p>
                        ) : error ? (
                            <p className="cards-muted" style={{ marginTop: 10 }}>
                                {error}
                            </p>
                        ) : null}
                    </div>

                    <div className="cards-header-meta">
                        <span className="cards-pill">
                            Plan: <strong>{plan.toUpperCase()}</strong>
                        </span>
                        <span className="cards-pill">
                            Cards: <strong>{cards.length}</strong> / <strong>{maxCards === 999 ? "∞" : maxCards}</strong>
                        </span>
                    </div>
                </div>

                {/* Empty State */}
                {!loading && !error && cards.length === 0 ? (
                    <section className="cards-card cards-empty">
                        <h2 className="cards-card-title">Order your first KonarCard</h2>
                        <p className="cards-muted">
                            Your card lets customers tap their phone to instantly save your contact and open your profile.
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
                                                    {c.name}
                                                    <span className="cards-type">
                                                        {" "}
                                                        • {c.material}
                                                        {c.variant ? ` • ${c.variant}` : ""}
                                                        {c.quantity > 1 ? ` • x${c.quantity}` : ""}
                                                    </span>
                                                </div>
                                                <div className="cards-item-sub">
                                                    <span className="cards-muted">
                                                        Assigned: <strong>{c.assignedProfile || "Not assigned"}</strong>
                                                    </span>
                                                    <span className="cards-dot">•</span>
                                                    <span className="cards-muted">
                                                        {c.orderStatus ? `Order: ${String(c.orderStatus).toUpperCase()}` : c.lastTap}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="cards-item-right">
                                            <span className={`cards-status ${c.status}`}>{c.status === "active" ? "ACTIVE" : "INACTIVE"}</span>

                                            <button
                                                type="button"
                                                className="cards-mini-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeactivate(c.id);
                                                }}
                                            // If you want: disable toggling unless paid
                                            // disabled={String(c.orderStatus).toLowerCase() !== "paid" && String(c.orderStatus).toLowerCase() !== "fulfilled"}
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
                                    <div className="cards-preview-logo">
                                        {selectedCard?.logoUrl ? (
                                            <img
                                                src={selectedCard.logoUrl}
                                                alt="Logo"
                                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "999px" }}
                                            />
                                        ) : (
                                            "K"
                                        )}
                                    </div>

                                    <div className="cards-preview-name">{selectedCard?.name || "KonarCard"}</div>
                                    <div className="cards-preview-sub">
                                        {selectedCard?.material} • {selectedCard?.type}
                                        {selectedCard?.variant ? ` • ${selectedCard.variant}` : ""}
                                    </div>

                                    <div className="cards-preview-qr" />
                                    <div className="cards-preview-row">
                                        <div className="cards-preview-pill" />
                                        <div className="cards-preview-pill" />
                                    </div>

                                    {selectedCard?.createdAt ? (
                                        <div className="cards-muted" style={{ marginTop: 10, fontSize: 12 }}>
                                            Ordered: {selectedCard.createdAt}
                                        </div>
                                    ) : null}
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
                                        Teams lets you manage multiple cards and assign them to multiple profiles — perfect for staff or
                                        growing businesses.
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
