import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import "../../styling/dashboard/cards.css";
import api from "../../services/api";

/* -----------------------------
   Helpers
----------------------------- */

function prettyProduct(productKey) {
    if (productKey === "plastic-card") return "Plastic Card";
    if (productKey === "metal-card") return "Metal Card";
    if (productKey === "konartag") return "KonarTag";
    return "KonarCard";
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
    return String(order?.productKey || "") === "konartag" ? "NFC Tag" : "NFC Card";
}

function variantRaw(order) {
    return order?.variant || order?.preview?.variant || "";
}

function variantFromOrder(order) {
    const v = variantRaw(order);
    return v ? String(v).toUpperCase() : "";
}

function uiStatusFromOrder(order) {
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

function profileSlugFromOrder(order) {
    return (
        order?.profile?.profile_slug ||
        order?.profile?.slug ||
        order?.profile?.username ||
        ""
    );
}

function profileLinkFromOrder(order) {
    const slug = profileSlugFromOrder(order);
    if (!slug) return "";
    return `${window.location.origin}/u/${slug}`;
}

function formatMoneyMinor(amountMinor, currency) {
    const a = Number(amountMinor || 0);
    const c = String(currency || "").toUpperCase();
    // amountTotal stored in minor units by Stripe (e.g. 1299 => £12.99)
    const major = (a / 100).toFixed(2);
    return c ? `${c} ${major}` : major;
}

/* -----------------------------
   Thumbnail (static) for list
----------------------------- */

function thumbTheme(productKey, variant) {
    const pk = String(productKey || "");
    const v = String(variant || "").toLowerCase();

    // CSS classes only; actual look is in cards.css (added below)
    if (pk === "metal-card") {
        if (v === "gold") return "thumb thumb-metal thumb-gold";
        return "thumb thumb-metal thumb-black";
    }
    if (pk === "konartag") {
        if (v === "white") return "thumb thumb-tag thumb-white";
        return "thumb thumb-tag thumb-black";
    }

    // plastic default
    if (v === "black") return "thumb thumb-plastic thumb-black";
    return "thumb thumb-plastic thumb-white";
}

function CardThumb({ productKey, variant, logoUrl }) {
    const cls = thumbTheme(productKey, variant);

    return (
        <div className={cls} aria-hidden="true">
            <div className="thumb-inner">
                <div className="thumb-logo">
                    {logoUrl ? (
                        <img src={logoUrl} alt="" />
                    ) : (
                        <span className="thumb-k">K</span>
                    )}
                </div>
                <div className="thumb-chip" />
                <div className="thumb-line" />
            </div>
        </div>
    );
}

/* -----------------------------
   API
----------------------------- */

async function getMyOrders() {
    const r = await api.get("/api/nfc-orders/mine");
    if (r.status !== 200) throw new Error(r.data?.message || r.data?.error || "Failed to load orders");
    return r.data;
}

/* -----------------------------
   Page
----------------------------- */

export default function Cards() {
    const [plan] = useState("free"); // later wire to subscription

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [orders, setOrders] = useState([]);

    // local UI enable/disable override (until you add backend field)
    const [overrides, setOverrides] = useState({}); // { [id]: "active" | "inactive" }

    const [selectedId, setSelectedId] = useState(null);

    const orderIdFromUrl = useMemo(() => {
        try {
            return new URLSearchParams(window.location.search).get("orderId") || "";
        } catch {
            return "";
        }
    }, []);

    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMyOrders();
                const list = Array.isArray(data) ? data : data?.orders || data?.data || [];

                if (!alive) return;
                setOrders(Array.isArray(list) ? list : []);
            } catch (e) {
                if (!alive) return;
                setError(e?.response?.data?.message || e?.response?.data?.error || e?.message || "Failed to load orders.");
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
            const id = String(o?._id || o?.id || "");
            const baseStatus = uiStatusFromOrder(o);

            return {
                id,
                name: titleFromOrder(o),
                type: typeFromOrder(o),
                material: materialFromOrder(o),
                productKey: String(o?.productKey || ""),
                variant: variantFromOrder(o),
                variantRaw: String(variantRaw(o) || ""),
                quantity: Number(o?.quantity || 1),
                status: overrides[id] || baseStatus,
                orderStatus: String(o?.status || ""),
                assignedProfile: assignedProfileFromOrder(o),
                profileSlug: profileSlugFromOrder(o),
                logoUrl: o?.logoUrl || "",
                createdAtISO: o?.createdAt || "",
                createdAt: o?.createdAt ? new Date(o.createdAt).toLocaleString() : "",
                link: profileLinkFromOrder(o),
                amountTotal: Number(o?.amountTotal || 0),
                currency: String(o?.currency || ""),
                stripeCheckoutSessionId: String(o?.stripeCheckoutSessionId || ""),
                stripePaymentIntentId: String(o?.stripePaymentIntentId || ""),
                _raw: o, // ✅ keep full order for any future UI
            };
        });
    }, [orders, overrides]);

    useEffect(() => {
        if (!cards.length) return;

        if (orderIdFromUrl && cards.some((c) => c.id === orderIdFromUrl)) {
            setSelectedId(orderIdFromUrl);
            return;
        }

        if (selectedId && cards.some((c) => c.id === selectedId)) return;

        setSelectedId(cards[0].id);
    }, [cards, orderIdFromUrl, selectedId]);

    const selectedCard = useMemo(
        () => cards.find((c) => c.id === selectedId) || cards[0] || null,
        [cards, selectedId]
    );

    // Placeholder rules (wire to subscription later)
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

    const handleOpenProfile = () => {
        if (!selectedCard?.link) return;
        window.open(selectedCard.link, "_blank", "noopener,noreferrer");
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
                {/* Header */}
                <div className="cards-header">
                    <div>
                        <h1 className="cards-title">Cards</h1>
                        <p className="cards-subtitle">
                            Your KonarCards are physical NFC products. Assign each card to a profile so customers always land on the right page.
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

                {/* Empty */}
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
                        {/* List */}
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
                                            {/* ✅ STATIC THUMBNAIL */}
                                            <CardThumb productKey={c.productKey} variant={c.variantRaw} logoUrl={c.logoUrl} />

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
                                                        Assigned: <strong>{c.assignedProfile}</strong>
                                                    </span>
                                                    <span className="cards-dot">•</span>
                                                    <span className="cards-muted">
                                                        {c.orderStatus ? `Order: ${String(c.orderStatus).toUpperCase()}` : "—"}
                                                    </span>
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

                        {/* Preview + Details */}
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

                                    {/* ✅ REAL DETAILS */}
                                    {selectedCard ? (
                                        <div className="cards-order-details">
                                            <div className="cards-order-details-title">Order details</div>

                                            <div className="cards-detail-row">
                                                <span className="cards-muted">Product</span>
                                                <strong>{prettyProduct(selectedCard.productKey)}</strong>
                                            </div>

                                            <div className="cards-detail-row">
                                                <span className="cards-muted">Variant</span>
                                                <strong>{selectedCard.variantRaw || "—"}</strong>
                                            </div>

                                            <div className="cards-detail-row">
                                                <span className="cards-muted">Quantity</span>
                                                <strong>{selectedCard.quantity}</strong>
                                            </div>

                                            <div className="cards-detail-row">
                                                <span className="cards-muted">Status</span>
                                                <strong>{String(selectedCard.orderStatus || "—").toUpperCase()}</strong>
                                            </div>

                                            <div className="cards-detail-row">
                                                <span className="cards-muted">Total</span>
                                                <strong>{formatMoneyMinor(selectedCard.amountTotal, selectedCard.currency)}</strong>
                                            </div>

                                            <div className="cards-detail-row">
                                                <span className="cards-muted">Profile</span>
                                                <strong>{selectedCard.profileSlug || "—"}</strong>
                                            </div>

                                            <div className="cards-detail-row">
                                                <span className="cards-muted">Custom logo</span>
                                                <strong>{selectedCard.logoUrl ? "YES" : "NO"}</strong>
                                            </div>

                                            {/* Optional advanced info (kept small) */}
                                            {selectedCard.stripeCheckoutSessionId ? (
                                                <div className="cards-detail-row">
                                                    <span className="cards-muted">Stripe session</span>
                                                    <strong className="cards-mono">
                                                        {selectedCard.stripeCheckoutSessionId.slice(0, 10)}…
                                                    </strong>
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="cards-actions">
                                    <h3 className="cards-actions-title">Card actions</h3>

                                    <div className="cards-actions-row">
                                        <button className="cards-btn cards-btn-primary" type="button" onClick={handleAssignProfile}>
                                            Assign profile
                                        </button>

                                        <button className="cards-btn cards-btn-ghost" type="button" onClick={handleOpenProfile} disabled={!selectedCard?.link}>
                                            Open profile
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
                                        Teams lets you manage multiple cards and assign them to multiple profiles — perfect for staff or growing businesses.
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
