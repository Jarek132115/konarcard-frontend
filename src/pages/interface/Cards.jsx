import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/cards.css";
import api from "../../services/api";

// 3D components
import PlasticCard3D from "../../components/PlasticCard3D";
import MetalCard3D from "../../components/MetalCard3D";
import KonarTag3D from "../../components/KonarTag3D";

/* -----------------------------
   ErrorBoundary (prevents crash loops)
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
const trim = (v) => (v ?? "").toString().trim();

function prettyProduct(productKey) {
  if (productKey === "plastic-card") return "Plastic Card";
  if (productKey === "metal-card") return "Metal Card";
  if (productKey === "konartag") return "KonarTag";
  return "KonarCard";
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

function variantRaw(order) {
  return order?.variant || order?.preview?.variant || "";
}

function finishFromVariant(variantRawValue) {
  const v = String(variantRawValue || "").toLowerCase();
  if (v === "gold") return "gold";
  return "black";
}

function formatMoneyMinor(amountMinor, currency) {
  const a = Number(amountMinor || 0);
  const c = String(currency || "").toUpperCase();
  const major = (a / 100).toFixed(2);
  if (!c) return major;
  // if you store GBP etc, show symbol-ish style like screenshot
  if (c === "GBP") return `£${major}`;
  if (c === "EUR") return `€${major}`;
  if (c === "USD") return `$${major}`;
  return `${c} ${major}`;
}

/* -----------------------------
   Default logo (SVG data URL)
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
   QR generator
----------------------------- */
function qrSrcFromLink(link) {
  const url = trim(link);
  if (!url) return "";
  const data = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=700x700&margin=10&data=${data}`;
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
function Card3DDetails({ productKey, logoSrc, qrSrc, variantRaw: vraw }) {
  const pk = String(productKey || "");
  if (pk === "metal-card") {
    return <MetalCard3D logoSrc={logoSrc} qrSrc={qrSrc} finish={finishFromVariant(vraw)} />;
  }
  if (pk === "konartag") {
    return <KonarTag3D logoSrc={logoSrc} qrSrc={qrSrc} finish={finishFromVariant(vraw)} />;
  }
  return <PlasticCard3D logoSrc={logoSrc} qrSrc={qrSrc} />;
}

/* -----------------------------
   Icons
----------------------------- */
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

/* -----------------------------
   Page
----------------------------- */
export default function Cards() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

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
      const productKey = String(o?.productKey || "");
      const link = profileLinkFromOrder(o);

      return {
        id,
        productKey,
        title: prettyProduct(productKey),
        assignedProfile: assignedProfileFromOrder(o),
        profileSlug: profileSlugFromOrder(o),
        link,
        variantRaw: String(variantRaw(o) || ""),
        status: String(o?.status || ""),
        quantity: Number(o?.quantity || 1),
        amountTotal: Number(o?.amountTotal || 0),
        currency: String(o?.currency || ""),
        createdAt: o?.createdAt ? new Date(o.createdAt).toLocaleString() : "",
        logoUrl: String(o?.logoUrl || ""),
        _raw: o,
      };
    });
  }, [orders]);

  useEffect(() => {
    if (!cards.length) return;
    if (selectedId && cards.some((c) => c.id === selectedId)) return;
    setSelectedId(cards[0].id);
  }, [cards, selectedId]);

  const selected = useMemo(() => cards.find((c) => c.id === selectedId) || null, [cards, selectedId]);

  const handleOrderCard = () => {
    window.location.href = "/products";
  };

  const handleAssign = () => {
    alert("Assign a profile to this card (coming next)");
  };

  const detailsLogoSrc = selected?.logoUrl ? selected.logoUrl : DEFAULT_LOGO_DATAURL;
  const detailsQrSrc = qrSrcFromLink(selected?.link);

  const headerRight = (
    <div className="cp-headRight">
      <span className="cp-pill">Cards: <strong>{cards.length}</strong></span>

      <button type="button" className="kx-btn kx-btn--black" onClick={handleOrderCard}>
        <span className="cp-btnIcon" aria-hidden="true">▭</span>
        Order Card
      </button>
    </div>
  );

  return (
    <DashboardLayout
      title="Cards"
      subtitle="Manage your KonarCards."
      hideDesktopHeader
    >
      <div className="cp-shell">
        <PageHeader
          title="Cards"
          subtitle="Your KonarCards are physical NFC products. Assign each card to a profile so customers always land on the right page."
          rightSlot={headerRight}
        />

        {/* YOUR CARDS */}
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
                        onClick={() => setSelectedId(c.id)}
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
                                handleAssign();
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
                                  setSelectedId(c.id);
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

                  {/* Buy tile */}
                  <button type="button" className="cp-buyTile" onClick={handleOrderCard}>
                    <span className="cp-buyPlus" aria-hidden="true">＋</span>
                    <span className="cp-buyText">Buy Business Card</span>
                  </button>
                </>
              )}
          </div>
        </section>

        {/* CARD DETAILS */}
        <section className="cp-card">
          <div className="cp-cardHead">
            <div>
              <h2 className="cp-cardTitle">Card details</h2>
              <p className="cp-muted">Everything about your selected order.</p>
            </div>
          </div>

          <div className="cp-detailsGrid">
            {/* LEFT: order details */}
            <div className="cp-innerCard">
              <div className="cp-innerTitle">Order details</div>

              <div className="cp-row">
                <span className="cp-rowKey">Product</span>
                <span className="cp-rowVal">{selected ? prettyProduct(selected.productKey) : "—"}</span>
              </div>

              <div className="cp-row">
                <span className="cp-rowKey">Variant</span>
                <span className="cp-rowVal">{selected?.variantRaw || "—"}</span>
              </div>

              <div className="cp-row">
                <span className="cp-rowKey">Quantity</span>
                <span className="cp-rowVal">{selected ? String(selected.quantity) : "—"}</span>
              </div>

              <div className="cp-row">
                <span className="cp-rowKey">Status</span>
                <span className="cp-rowVal">{selected?.status ? selected.status : "—"}</span>
              </div>

              <div className="cp-row">
                <span className="cp-rowKey">Total</span>
                <span className="cp-rowVal">
                  {selected ? formatMoneyMinor(selected.amountTotal, selected.currency) : "—"}
                </span>
              </div>

              <div className="cp-row">
                <span className="cp-rowKey">Profile</span>
                <span className="cp-rowVal">{selected?.profileSlug || "—"}</span>
              </div>

              <div className="cp-row">
                <span className="cp-rowKey">Custom logo</span>
                <span className="cp-rowVal">{selected?.logoUrl ? "yes" : "no"}</span>
              </div>

              <div className="cp-row">
                <span className="cp-rowKey">Ordered</span>
                <span className="cp-rowVal">{selected?.createdAt || "—"}</span>
              </div>

              <div className="cp-row">
                <span className="cp-rowKey">Order No.</span>
                <span className="cp-rowVal">{selected?.id ? selected.id.slice(-12) : "—"}</span>
              </div>
            </div>

            {/* RIGHT: 3D preview */}
            <div className="cp-previewCard">
              {loading ? (
                <div className="cp-bigSkel" />
              ) : selected ? (
                <CardPreviewErrorBoundary fallback={<div className="cp-previewFallback">3D Card Preview</div>}>
                  <Card3DDetails
                    productKey={selected.productKey}
                    logoSrc={detailsLogoSrc}
                    qrSrc={detailsQrSrc}
                    variantRaw={selected.variantRaw}
                  />
                </CardPreviewErrorBoundary>
              ) : (
                <div className="cp-previewFallback">3D Card Preview</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}