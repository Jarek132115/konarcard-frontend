// frontend/src/pages/interface/Cards.jsx
import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/cards.css";
import api from "../../services/api";

// ✅ 3D components
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
   Konar default logo (SVG data URL)
----------------------------- */
const KONAR_LOGO_SVG = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <defs>
    <radialGradient id="g" cx="30%" cy="25%" r="80%">
      <stop offset="0" stop-color="#FFB07A"/>
      <stop offset="1" stop-color="#F97316"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="120" fill="url(#g)"/>
  <text x="50%" y="56%" text-anchor="middle" font-size="260" font-family="Arial, Helvetica, sans-serif" font-weight="900" fill="#0B1220">K</text>
</svg>
`);
const DEFAULT_LOGO_DATAURL = `data:image/svg+xml;charset=utf-8,${KONAR_LOGO_SVG}`;

/* -----------------------------
   QR generator (safe external)
----------------------------- */
function qrSrcFromLink(link) {
    const url = centerTrim(link);
    if (!url) return "";
    const data = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=700x700&margin=10&data=${data}`;
}

function finishFromVariant(variantRawValue) {
    const v = String(variantRawValue || "").toLowerCase();
    if (v === "gold") return "gold";
    return "black";
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
   3D Details Preview
----------------------------- */
function Card3DDetails({ productKey, logoSrc, qrSrc, variantRaw }) {
    const pk = String(productKey || "");
    if (pk === "metal-card") {
        return <MetalCard3D logoSrc={logoSrc} qrSrc={qrSrc} finish={finishFromVariant(variantRaw)} />;
    }
    if (pk === "konartag") {
        return <KonarTag3D logoSrc={logoSrc} qrSrc={qrSrc} finish={finishFromVariant(variantRaw)} />;
    }
    return <PlasticCard3D logoSrc={logoSrc} qrSrc={qrSrc} />;
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

    const selectedCard = useMemo(() => cards.find((c) => c.id === selectedId) || cards[0] || null, [cards, selectedId]);

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

    const detailsLogoSrc = selectedCard?.logoUrl ? selectedCard.logoUrl : DEFAULT_LOGO_DATAURL;
    const detailsQrSrc = qrSrcFromLink(selectedCard?.link);

    return (
        <DashboardLayout title="Cards" subtitle="Manage your KonarCards." hideDesktopHeader>
            <div className="cards-shell">
                <PageHeader
                    title="Cards"
                    subtitle="Your KonarCards are physical NFC products. Assign each card to a profile so customers always land on the right page."
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                    rightSlot={
                        <div className="cards-header-right">
                            <div className="cards-header-badges">
                                <span className="cards-pill">
                                    Plan: <strong>{safeUpper(plan)}</strong>
                                </span>
                                <span className="cards-pill">
                                    Cards: <strong>{cards.length}</strong> / <strong>{maxCards === 999 ? "∞" : maxCards}</strong>
                                </span>
                            </div>

                            <div className="cards-header-actions">
                                {isLimitReached ? (
                                    <button className="kx-btn kx-btn--black" type="button" disabled>
                                        Locked
                                    </button>
                                ) : (
                                    <button className="kx-btn kx-btn--orange" type="button" onClick={handleOrderCard}>
                                        + Order a card
                                    </button>
                                )}
                            </div>
                        </div>
                    }
                />

                {/* IMPORTANT: layout never collapses — cards always render */}
                <section className="cards-card">
                    <div className="cards-card-head">
                        <div>
                            <h2 className="cards-card-title">Your cards</h2>
                            <p className="cards-muted">Tap a card to view details below.</p>
                        </div>
                    </div>

                    <div className="cards-toprow">
                        {/* Selected tile */}
                        <div className="cards-topcol">
                            <div className={`cards-compact ${loading ? "is-loading" : ""}`}>
                                <div className="cards-compact-preview">
                                    <div className={`cards-compact-skel ${loading ? "" : "hide"}`} />
                                    {!loading && selectedCard ? (
                                        <div className="cards-compact-3dwrap">
                                            <CardPreviewErrorBoundary fallback={<div className="cards-3d-fallback">Preview unavailable</div>}>
                                                <Card3DDetails
                                                    productKey={selectedCard.productKey}
                                                    logoSrc={detailsLogoSrc}
                                                    qrSrc={detailsQrSrc}
                                                    variantRaw={selectedCard.variantRaw}
                                                />
                                            </CardPreviewErrorBoundary>
                                        </div>
                                    ) : null}

                                    <div className="cards-compact-badges">
                                        <span className={`cards-status ${selectedCard?.status || "neutral"}`}>
                                            {selectedCard ? (selectedCard.status === "active" ? "ACTIVE" : "INACTIVE") : "—"}
                                        </span>
                                        <span className="cards-status neutral">{selectedCard?.variant || "—"}</span>
                                    </div>
                                </div>

                                <div className="cards-compact-meta">
                                    <div className={`cards-name ${loading ? "skel-line w80" : ""}`}>{loading ? "" : selectedCard?.name || "—"}</div>

                                    <div className="cards-sub">
                                        <span className={`cards-muted ${loading ? "skel-line w55" : ""}`}>
                                            {loading ? "" : `${selectedCard?.material || "—"} • ${prettyProduct(selectedCard?.productKey || "")}`}
                                        </span>
                                        <span className="cards-dot">•</span>
                                        <span className={`cards-muted ${loading ? "skel-line w40" : ""}`}>
                                            {loading ? "" : selectedCard?.orderStatus ? `Order: ${safeUpper(selectedCard.orderStatus)}` : "Order: —"}
                                        </span>
                                    </div>

                                    <div className="cards-sub">
                                        <span className={`cards-muted ${loading ? "skel-line w70" : ""}`}>
                                            {loading ? "" : (
                                                <>
                                                    Assigned: <strong>{selectedCard?.assignedProfile || "—"}</strong>
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    <div className="cards-compact-actions">
                                        <button
                                            type="button"
                                            className="kx-btn kx-btn--white"
                                            disabled={loading || !selectedCard}
                                            onClick={() => selectedCard && handleDeactivate(selectedCard.id)}
                                        >
                                            {selectedCard?.status === "active" ? "Disable" : "Enable"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buy tile */}
                        <div className="cards-topcol">
                            <button type="button" className="cards-buy" onClick={handleOrderCard} disabled={loading}>
                                <div className="cards-buy-icon" aria-hidden="true">
                                    +
                                </div>
                                <div className="cards-buy-title">Buy another product</div>
                                <div className="cards-buy-sub">View cards, tags & bundles</div>
                            </button>
                        </div>
                    </div>

                    {/* Mini picker stays mounted too */}
                    <div className="cards-mini-picker">
                        {(loading ? Array.from({ length: 3 }) : cards).map((c, idx) => {
                            const isActive = !loading && selectedCard?.id === c.id;
                            return (
                                <button
                                    key={loading ? `sk-${idx}` : c.id}
                                    type="button"
                                    className={`cards-mini-pill ${isActive ? "active" : ""} ${loading ? "is-loading" : ""}`}
                                    onClick={() => !loading && setSelectedId(c.id)}
                                    disabled={loading}
                                >
                                    {loading ? "" : `${prettyProduct(c.productKey)}${c.variant ? ` • ${c.variant}` : ""}`}
                                </button>
                            );
                        })}
                    </div>

                    {/* Error inside the mounted card */}
                    {error ? <div className="cards-alert danger">{error}</div> : null}
                </section>

                {/* Details always mounted */}
                <section className="cards-card">
                    <div className="cards-card-head">
                        <div>
                            <h2 className="cards-card-title">Card details</h2>
                            <p className="cards-muted">Everything about your selected order.</p>
                        </div>
                    </div>

                    <div className="cards-details">
                        <div className="cards-details-top">
                            <div className="cards-details-left">
                                <div className={`cards-details-title ${loading ? "skel-line w70" : ""}`}>{loading ? "" : selectedCard?.name || "—"}</div>
                                <div className={`cards-details-sub ${loading ? "skel-line w55" : ""}`}>
                                    {loading ? "" : `${selectedCard?.material || "—"} • ${selectedCard?.type || "—"}${selectedCard?.variant ? ` • ${selectedCard.variant}` : ""}`}
                                </div>
                            </div>

                            <div className="cards-details-actions">
                                <button className="kx-btn kx-btn--orange" type="button" onClick={handleAssignProfile} disabled={loading}>
                                    Assign profile
                                </button>

                                <button className="kx-btn kx-btn--white" type="button" onClick={handleOpenProfile} disabled={loading || !selectedCard?.link}>
                                    Open profile
                                </button>

                                <button className="kx-btn kx-btn--white" type="button" onClick={handleShare} disabled={loading}>
                                    Share link
                                </button>

                                <button className="kx-btn kx-btn--white" type="button" onClick={handleCopyLink} disabled={loading}>
                                    Copy link
                                </button>
                            </div>
                        </div>

                        <div className="cards-3dpanel">
                            <div className={`cards-3d-skel ${loading ? "" : "hide"}`} />
                            {!loading && selectedCard ? (
                                <CardPreviewErrorBoundary fallback={<div className="cards-3d-fallback">3D preview unavailable</div>}>
                                    <Card3DDetails
                                        productKey={selectedCard.productKey}
                                        logoSrc={detailsLogoSrc}
                                        qrSrc={detailsQrSrc}
                                        variantRaw={selectedCard.variantRaw}
                                    />
                                </CardPreviewErrorBoundary>
                            ) : null}
                        </div>

                        <div className="cards-order">
                            <div className="cards-order-title">Order details</div>

                            <div className="cards-row">
                                <span className="cards-muted">Product</span>
                                <strong className={loading ? "skel-line w35" : ""}>{loading ? "" : prettyProduct(selectedCard?.productKey)}</strong>
                            </div>

                            <div className="cards-row">
                                <span className="cards-muted">Variant</span>
                                <strong className={loading ? "skel-line w30" : ""}>{loading ? "" : selectedCard?.variantRaw || "—"}</strong>
                            </div>

                            <div className="cards-row">
                                <span className="cards-muted">Quantity</span>
                                <strong className={loading ? "skel-line w15" : ""}>{loading ? "" : selectedCard?.quantity}</strong>
                            </div>

                            <div className="cards-row">
                                <span className="cards-muted">Status</span>
                                <strong className={loading ? "skel-line w35" : ""}>{loading ? "" : safeUpper(selectedCard?.orderStatus || "—")}</strong>
                            </div>

                            <div className="cards-row">
                                <span className="cards-muted">Total</span>
                                <strong className={loading ? "skel-line w25" : ""}>
                                    {loading ? "" : formatMoneyMinor(selectedCard?.amountTotal, selectedCard?.currency)}
                                </strong>
                            </div>

                            <div className="cards-row">
                                <span className="cards-muted">Profile</span>
                                <strong className={loading ? "skel-line w35" : ""}>{loading ? "" : selectedCard?.profileSlug || "—"}</strong>
                            </div>

                            <div className="cards-row">
                                <span className="cards-muted">Custom logo</span>
                                <strong className={loading ? "skel-line w20" : ""}>{loading ? "" : selectedCard?.logoUrl ? "YES" : "NO"}</strong>
                            </div>

                            <div className="cards-row">
                                <span className="cards-muted">Ordered</span>
                                <strong className={loading ? "skel-line w35" : ""}>{loading ? "" : selectedCard?.createdAt || "—"}</strong>
                            </div>

                            <div className="cards-row">
                                <span className="cards-muted">Stripe session</span>
                                <strong className={`cards-mono ${loading ? "skel-line w55" : ""}`}>
                                    {loading ? "" : selectedCard?.stripeCheckoutSessionId ? `${selectedCard.stripeCheckoutSessionId.slice(0, 14)}…` : "—"}
                                </strong>
                            </div>
                        </div>

                        <div className="cards-note">
                            3D preview uses your profile link QR + your uploaded logo (or Konar logo if none).
                        </div>
                    </div>
                </section>

                {/* Upsell always mounted */}
                <section className="cards-card">
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
                                    <div className="cards-locked">You’ve reached your plan limit.</div>
                                    <a className="kx-btn kx-btn--orange" href="/subscription">
                                        Upgrade to Teams
                                    </a>
                                </>
                            ) : (
                                <button className="kx-btn kx-btn--orange" type="button" onClick={handleOrderCard} disabled={loading}>
                                    + Order another card
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
