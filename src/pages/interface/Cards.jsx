// frontend/src/pages/interface/Cards.jsx
import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/cards.css";
import api from "../../services/api";

// ✅ 3D components you already have
import PlasticCard3D from "../../components/PlasticCard3D";
import MetalCard3D from "../../components/MetalCard3D";
import KonarTag3D from "../../components/KonarTag3D";

/* -----------------------------
   ErrorBoundary (prevents crash/reload loops)
----------------------------- */
class CardPreviewErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(err) {
        // keep console log so we can diagnose props later
        // eslint-disable-next-line no-console
        console.error("3D preview crashed:", err);
    }
    render() {
        if (this.state.hasError) return this.props.fallback || null;
        return this.props.children;
    }
}

/* -----------------------------
   Helpers
----------------------------- */

const centerTrim = (v) => (v ?? "").toString().trim();
const safeUpper = (v) => centerTrim(v).toUpperCase();

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
    return order?.profile?.profile_slug || order?.profile?.slug || order?.profile?.username || "";
}

function profileLinkFromOrder(order) {
    const slug = profileSlugFromOrder(order);
    if (!slug) return "";
    return `${window.location.origin}/u/${slug}`;
}

function formatMoneyMinor(amountMinor, currency) {
    const a = Number(amountMinor || 0);
    const c = String(currency || "").toUpperCase();
    const major = (a / 100).toFixed(2);
    return c ? `${c} ${major}` : major;
}

/* -----------------------------
   SAFE Static Thumbnail (tile)
----------------------------- */

function thumbTheme(productKey, variant) {
    const pk = String(productKey || "");
    const v = String(variant || "").toLowerCase();

    if (pk === "metal-card") {
        if (v === "gold") return "thumb thumb-metal thumb-gold";
        return "thumb thumb-metal thumb-black";
    }
    if (pk === "konartag") {
        if (v === "white") return "thumb thumb-tag thumb-white";
        return "thumb thumb-tag thumb-black";
    }

    if (v === "black") return "thumb thumb-plastic thumb-black";
    return "thumb thumb-plastic thumb-white";
}

function CardThumb({ productKey, variant, logoUrl }) {
    const cls = thumbTheme(productKey, variant);

    return (
        <div className={cls} aria-hidden="true">
            <div className="thumb-inner">
                <div className="thumb-logo">
                    {logoUrl ? <img src={logoUrl} alt="" /> : <span className="thumb-k">K</span>}
                </div>
                <div className="thumb-chip" />
                <div className="thumb-line" />
            </div>
        </div>
    );
}

/* -----------------------------
   3D Details Preview (ONLY here, with ErrorBoundary)
   IMPORTANT: we render without custom props first to avoid undefined-loader crashes.
   After it works, we will pass the correct prop names matching your Product page usage.
----------------------------- */

function Card3DDetails({ productKey }) {
    const pk = String(productKey || "");

    // ✅ Render the same way your product page likely does: no risky props yet.
    if (pk === "metal-card") return <MetalCard3D />;
    if (pk === "konartag") return <KonarTag3D />;
    return <PlasticCard3D />;
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
    const [overrides, setOverrides] = useState({});
    const [selectedId, setSelectedId] = useState(null);

    const isMobile = typeof window !== "undefined" ? window.innerWidth <= 1000 : false;
    const isSmallMobile = typeof window !== "undefined" ? window.innerWidth <= 520 : false;

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
                logoUrl: String(o?.logoUrl || ""),
                createdAt: o?.createdAt ? new Date(o.createdAt).toLocaleString() : "",
                link: profileLinkFromOrder(o),
                amountTotal: Number(o?.amountTotal || 0),
                currency: String(o?.currency || ""),
                stripeCheckoutSessionId: String(o?.stripeCheckoutSessionId || ""),
                _raw: o,
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
                // ignore cancel
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
                    <button className="kc-cards-btn kc-cards-btn-primary" type="button" disabled>
                        Locked
                    </button>
                ) : (
                    <button className="kc-cards-btn kc-cards-btn-primary" type="button" onClick={handleOrderCard}>
                        + Order a card
                    </button>
                )
            }
            hideDesktopHeader
        >
            <div className="kc-cards-shell">
                <PageHeader
                    title="Cards"
                    subtitle="Your KonarCards are physical NFC products. Assign each card to a profile so customers always land on the right page."
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                    rightSlot={
                        <div className="kc-cards-header-badges">
                            <span className="kc-cards-pill">
                                Plan: <strong>{safeUpper(plan)}</strong>
                            </span>
                            <span className="kc-cards-pill">
                                Cards: <strong>{cards.length}</strong> / <strong>{maxCards === 999 ? "∞" : maxCards}</strong>
                            </span>
                        </div>
                    }
                />

                {loading ? (
                    <section className="kc-cards-card kc-cards-mutedblock">Loading your orders…</section>
                ) : error ? (
                    <section className="kc-cards-card kc-cards-mutedblock">{error}</section>
                ) : null}

                {!loading && !error && cards.length === 0 ? (
                    <section className="kc-cards-card kc-cards-empty">
                        <h2 className="kc-cards-card-title">Order your first KonarCard</h2>
                        <p className="kc-cards-muted">
                            Your card lets customers tap their phone to instantly save your contact and open your profile.
                        </p>

                        <div className="kc-cards-actions-row">
                            <button className="kc-cards-btn kc-cards-btn-primary" type="button" onClick={handleOrderCard}>
                                Order a card
                            </button>
                            <a className="kc-cards-btn kc-cards-btn-ghost" href="/products">
                                View card options
                            </a>
                        </div>
                    </section>
                ) : (
                    <>
                        {/* SECTION 1: cards tiles */}
                        <section className="kc-cards-card">
                            <div className="kc-cards-card-head">
                                <div>
                                    <h2 className="kc-cards-card-title">Your cards</h2>
                                    <p className="kc-cards-muted">Tap a card to view details below.</p>
                                </div>
                            </div>

                            <div className="kc-cards-tiles">
                                {cards.map((c) => {
                                    const active = selectedCard?.id === c.id;

                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            className={`kc-card-tile ${active ? "active" : ""}`}
                                            onClick={() => setSelectedId(c.id)}
                                        >
                                            <div className="kc-card-preview static">
                                                <div className="kc-card-thumb-center">
                                                    <CardThumb productKey={c.productKey} variant={c.variantRaw} logoUrl={c.logoUrl} />
                                                </div>

                                                <div className="kc-card-preview-badges">
                                                    <span className={`kc-cards-status ${c.status}`}>
                                                        {c.status === "active" ? "ACTIVE" : "INACTIVE"}
                                                    </span>
                                                    {c.variant ? <span className="kc-cards-status neutral">{c.variant}</span> : null}
                                                </div>
                                            </div>

                                            <div className="kc-card-meta">
                                                <div className="kc-card-name">{c.name}</div>

                                                <div className="kc-card-sub">
                                                    <span className="kc-cards-muted">
                                                        {c.material} • {prettyProduct(c.productKey)}
                                                    </span>
                                                    <span className="kc-card-dot">•</span>
                                                    <span className="kc-cards-muted">
                                                        {c.orderStatus ? `Order: ${safeUpper(c.orderStatus)}` : "Order: —"}
                                                    </span>
                                                </div>

                                                <div className="kc-card-sub">
                                                    <span className="kc-cards-muted">
                                                        Assigned: <strong>{c.assignedProfile}</strong>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="kc-card-tile-actions">
                                                <button
                                                    type="button"
                                                    className="kc-cards-mini-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeactivate(c.id);
                                                    }}
                                                >
                                                    {c.status === "active" ? "Disable" : "Enable"}
                                                </button>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* SECTION 2: details */}
                        <section className="kc-cards-card">
                            <div className="kc-cards-card-head">
                                <div>
                                    <h2 className="kc-cards-card-title">Card details</h2>
                                    <p className="kc-cards-muted">Everything about your selected order.</p>
                                </div>
                            </div>

                            {!selectedCard ? (
                                <div className="kc-cards-muted">Select a card above.</div>
                            ) : (
                                <div className="kc-cards-details-wrap">
                                    <div className="kc-cards-details-top">
                                        <div>
                                            <div className="kc-cards-details-title">{selectedCard.name}</div>
                                            <div className="kc-cards-details-sub">
                                                {selectedCard.material} • {selectedCard.type}
                                                {selectedCard.variant ? ` • ${selectedCard.variant}` : ""}
                                            </div>
                                        </div>

                                        <div className="kc-cards-details-actions">
                                            <button className="kc-cards-btn kc-cards-btn-primary" type="button" onClick={handleAssignProfile}>
                                                Assign profile
                                            </button>

                                            <button
                                                className="kc-cards-btn kc-cards-btn-ghost"
                                                type="button"
                                                onClick={handleOpenProfile}
                                                disabled={!selectedCard.link}
                                            >
                                                Open profile
                                            </button>

                                            <button className="kc-cards-btn kc-cards-btn-ghost" type="button" onClick={handleShare}>
                                                Share link
                                            </button>

                                            <button className="kc-cards-btn kc-cards-btn-ghost" type="button" onClick={handleCopyLink}>
                                                Copy link
                                            </button>
                                        </div>
                                    </div>

                                    {/* ✅ BIG 3D PREVIEW BUT SAFE */}
                                    <div className="kc-details-3dpanel">
                                        <CardPreviewErrorBoundary
                                            fallback={
                                                <div className="kc-3d-fallback">
                                                    3D preview unavailable (we’ll fix props next).
                                                </div>
                                            }
                                        >
                                            <Card3DDetails productKey={selectedCard.productKey} />
                                        </CardPreviewErrorBoundary>
                                    </div>

                                    <div className="kc-cards-order-details">
                                        <div className="kc-cards-order-details-title">Order details</div>

                                        <div className="kc-cards-detail-row">
                                            <span className="kc-cards-muted">Product</span>
                                            <strong>{prettyProduct(selectedCard.productKey)}</strong>
                                        </div>

                                        <div className="kc-cards-detail-row">
                                            <span className="kc-cards-muted">Variant</span>
                                            <strong>{selectedCard.variantRaw || "—"}</strong>
                                        </div>

                                        <div className="kc-cards-detail-row">
                                            <span className="kc-cards-muted">Quantity</span>
                                            <strong>{selectedCard.quantity}</strong>
                                        </div>

                                        <div className="kc-cards-detail-row">
                                            <span className="kc-cards-muted">Status</span>
                                            <strong>{safeUpper(selectedCard.orderStatus || "—")}</strong>
                                        </div>

                                        <div className="kc-cards-detail-row">
                                            <span className="kc-cards-muted">Total</span>
                                            <strong>{formatMoneyMinor(selectedCard.amountTotal, selectedCard.currency)}</strong>
                                        </div>

                                        <div className="kc-cards-detail-row">
                                            <span className="kc-cards-muted">Profile</span>
                                            <strong>{selectedCard.profileSlug || "—"}</strong>
                                        </div>

                                        <div className="kc-cards-detail-row">
                                            <span className="kc-cards-muted">Custom logo</span>
                                            <strong>{selectedCard.logoUrl ? "YES" : "NO"}</strong>
                                        </div>

                                        {selectedCard.createdAt ? (
                                            <div className="kc-cards-detail-row">
                                                <span className="kc-cards-muted">Ordered</span>
                                                <strong>{selectedCard.createdAt}</strong>
                                            </div>
                                        ) : null}

                                        {selectedCard.stripeCheckoutSessionId ? (
                                            <div className="kc-cards-detail-row">
                                                <span className="kc-cards-muted">Stripe session</span>
                                                <strong className="kc-cards-mono">
                                                    {selectedCard.stripeCheckoutSessionId.slice(0, 14)}…
                                                </strong>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="kc-cards-note">
                                        Next: we’ll pass the *correct prop names* to the 3D component (same as your Products page),
                                        then we can safely show 3D inside each tile too.
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* SECTION 3: Upsell */}
                        <section className="kc-cards-card">
                            <div className="kc-cards-upsell">
                                <div>
                                    <h2 className="kc-cards-card-title">Need multiple cards?</h2>
                                    <p className="kc-cards-muted">
                                        Teams lets you manage multiple cards and assign them to multiple profiles — perfect for staff or growing businesses.
                                    </p>
                                </div>

                                <div className="kc-cards-upsell-right">
                                    {isLimitReached ? (
                                        <>
                                            <div className="kc-cards-locked-note">You’ve reached your plan limit.</div>
                                            <a className="kc-cards-btn kc-cards-btn-primary" href="/subscription">
                                                Upgrade to Teams
                                            </a>
                                        </>
                                    ) : (
                                        <button className="kc-cards-btn kc-cards-btn-primary" type="button" onClick={handleOrderCard}>
                                            + Order another card
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
