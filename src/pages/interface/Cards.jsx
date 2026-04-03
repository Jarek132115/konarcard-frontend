import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import OrderDetailsView from "../../components/Cards/OrderDetailsView";
import CardCustomizer from "../../components/Cards/CardCustomizer";
import CardsCatalog from "../../components/Cards/CardsCatalog";

import "../../styling/spacing.css";
import "../../styling/dashboard/cards.css";

import api from "../../services/api";

import {
  DEFAULT_LOGO_DATAURL,
  formatMoneyMinor,
  normalizeOrder,
  qrSrcFromLink,
} from "../../components/Cards/cardsHelpers";

import PlasticCard3D from "../../components/PlasticCard3D";
import MetalCard3D from "../../components/MetalCard3D";
import KonarTag3D from "../../components/KonarTag3D";

const NFC_INTENT_KEY = "konar_nfc_intent_v1";

const PRODUCT_META = {
  "plastic-card": {
    key: "plastic-card",
    name: "Plastic Card",
    title: "Plastic NFC Business Card",
    subtitle: "Durable, lightweight, and perfect for everyday jobs.",
    price: "£29.99",
    maxQty: 20,
    defaultVariant: "white",
    variants: ["white", "black"],
    sizeLabel: "Logo size",
    variantLabel: "Colour",
    buyLabel: "Buy KonarCard",
    edition: "plastic",
    topTag: "Plastic Card",
  },
  "metal-card": {
    key: "metal-card",
    name: "Metal Card",
    title: "Metal NFC Business Card",
    subtitle: "Premium finish for a stronger first impression.",
    price: "£44.99",
    maxQty: 20,
    defaultVariant: "black",
    variants: ["black", "gold"],
    sizeLabel: "Logo size",
    variantLabel: "Finish",
    buyLabel: "Buy KonarCard",
    edition: "metal",
    topTag: "Metal Card",
  },
  konartag: {
    key: "konartag",
    name: "KonarTag",
    title: "KonarTag NFC Key Tag",
    subtitle: "Compact, fast to share, and easy to carry every day.",
    price: "£9.99",
    maxQty: 50,
    defaultVariant: "black",
    variants: ["black", "gold"],
    sizeLabel: "Logo size",
    variantLabel: "Finish",
    buyLabel: "Buy KonarTag",
    edition: "tag",
    topTag: "KonarTag",
  },
};

class CardPreviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.error("3D preview crashed:", err);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}

function readIntent() {
  try {
    const raw = localStorage.getItem(NFC_INTENT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.productKey) return null;

    const age = Date.now() - Number(parsed.createdAt || parsed.updatedAt || 0);
    if (Number.isFinite(age) && age > 30 * 60 * 1000) {
      localStorage.removeItem(NFC_INTENT_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function clearIntent() {
  try {
    localStorage.removeItem(NFC_INTENT_KEY);
  } catch {
    // ignore
  }
}

async function getMyOrders() {
  const r = await api.get("/api/nfc-orders/mine");
  if (r.status !== 200) {
    throw new Error(r.data?.message || r.data?.error || "Failed to load orders");
  }
  return r.data;
}

function Card3DDetails({ productKey, logoSrc, qrSrc, logoPercent, variant }) {
  if (productKey === "metal-card") {
    return (
      <MetalCard3D
        logoSrc={logoSrc}
        qrSrc={qrSrc}
        logoSize={logoPercent}
        finish={variant}
      />
    );
  }

  if (productKey === "konartag") {
    return (
      <KonarTag3D
        logoSrc={logoSrc}
        qrSrc={qrSrc}
        logoSize={logoPercent}
        finish={variant}
      />
    );
  }

  return (
    <PlasticCard3D
      logoSrc={logoSrc}
      qrSrc={qrSrc}
      logoSize={logoPercent}
      variant={variant}
    />
  );
}

function PurchasedCardItem({ card, isActive, onOpenDetails }) {
  return (
    <article className={`cp-item ${isActive ? "active" : ""}`}>
      <div className="cp-info cp-info--full">
        <div className="cp-name">{card.title}</div>

        <div className="cp-sub">
          <span className="cp-subLabel">Assigned Profile:</span>
          <span className="cp-subValue">{card.assignedProfile || card.profileSlug || "—"}</span>
        </div>

        <div className="cp-sub">
          <span className="cp-subLabel">Status:</span>
          <span className="cp-subValue">{card.status || "—"}</span>
        </div>

        <div className="cp-sub">
          <span className="cp-subLabel">Total:</span>
          <span className="cp-subValue">
            {formatMoneyMinor(card.amountTotal, card.currency)}
          </span>
        </div>

        <div className="cp-sub">
          <span className="cp-subLabel">Ordered:</span>
          <span className="cp-subValue">{card.createdAt || "—"}</span>
        </div>

        <div className="cp-itemActions">
          <button
            type="button"
            className="kx-btn kx-btn--black"
            onClick={() => onOpenDetails(card.id)}
          >
            View details
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Cards() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchasedOrders, setPurchasedOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedOrderView, setSelectedOrderView] = useState(false);
  const [selectedProductKey, setSelectedProductKey] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyOrders();

        const all = Array.isArray(data)
          ? data
          : Array.isArray(data?.orders)
            ? data.orders
            : Array.isArray(data?.data)
              ? data.data
              : [];

        const purchased = Array.isArray(data?.purchasedOrders) ? data.purchasedOrders : [];

        if (!alive) return;

        setPurchasedOrders(
          purchased.length
            ? purchased
            : all.filter((o) => {
              const s = String(o?.normalizedStatus || o?.status || "").toLowerCase();
              return [
                "paid",
                "processing",
                "fulfilled",
                "shipped",
                "complete",
                "completed",
              ].includes(s);
            })
        );
      } catch (e) {
        if (!alive) return;
        setError(
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Failed to load orders."
        );
        setPurchasedOrders([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const purchasedCards = useMemo(
    () => (purchasedOrders || []).map(normalizeOrder),
    [purchasedOrders]
  );

  useEffect(() => {
    if (!purchasedCards.length) return;
    if (selectedId && purchasedCards.some((c) => c.id === selectedId)) return;
    setSelectedId(purchasedCards[0].id);
  }, [purchasedCards, selectedId]);

  const selectedOrder = useMemo(
    () => purchasedCards.find((c) => c.id === selectedId) || null,
    [purchasedCards, selectedId]
  );

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const checkout = sp.get("checkout");
    const product = sp.get("product");
    const intent = readIntent();

    if (checkout === "success") {
      toast.success("Payment received ✅");
      clearIntent();

      const resumeProduct =
        (product && PRODUCT_META[product] && product) ||
        (intent?.productKey && PRODUCT_META[intent.productKey] && intent.productKey) ||
        "";

      navigate(resumeProduct ? `/cards?product=${encodeURIComponent(resumeProduct)}` : "/cards", {
        replace: true,
      });
      return;
    }

    if (checkout === "cancel") {
      toast.error("Checkout cancelled.");
      navigate("/cards", { replace: true });
      return;
    }

    if (product && PRODUCT_META[product]) {
      setSelectedOrderView(false);
      setSelectedProductKey(product);
      return;
    }

    if (intent?.productKey && PRODUCT_META[intent.productKey]) {
      setSelectedOrderView(false);
      setSelectedProductKey(intent.productKey);
    }
  }, [location.search, navigate]);

  const openConfigurator = (productKey) => {
    setSelectedOrderView(false);
    setSelectedProductKey(productKey);
    navigate(`/cards?product=${encodeURIComponent(productKey)}`, { replace: true });
  };

  const openOrderDetails = (orderId) => {
    setSelectedProductKey("");
    setSelectedId(orderId);
    setSelectedOrderView(true);
    navigate("/cards", { replace: true });
  };

  const backToCardsHome = () => {
    setSelectedProductKey("");
    setSelectedOrderView(false);
    navigate("/cards", { replace: true });
  };

  const headerRight = (
    <div className="cp-headRight">
      <span className="cp-pill">
        Cards: <strong>{purchasedCards.length}</strong>
      </span>

      <button
        type="button"
        className="kx-btn kx-btn--black"
        onClick={backToCardsHome}
      >
        View Products
      </button>
    </div>
  );

  return (
    <DashboardLayout title="Cards" subtitle="Manage your KonarCards." hideDesktopHeader>
      <div className="cp-shell">
        <PageHeader
          title="Cards"
          subtitle="Choose a product, customise it, and check out without leaving your dashboard."
          rightSlot={headerRight}
        />

        {selectedProductKey ? (
          <CardCustomizer
            productKey={selectedProductKey}
            initialIntent={readIntent()}
            onBack={backToCardsHome}
            onCheckoutSuccess={async () => { }}
          />
        ) : selectedOrderView ? (
          <section className="cp-card">
            <OrderDetailsView
              selectedOrder={selectedOrder}
              productMeta={PRODUCT_META}
              defaultLogoDataUrl={DEFAULT_LOGO_DATAURL}
              qrSrcFromLink={qrSrcFromLink}
              Card3DDetails={Card3DDetails}
              CardPreviewErrorBoundary={CardPreviewErrorBoundary}
              formatMoneyMinor={formatMoneyMinor}
              onBack={backToCardsHome}
            />
          </section>
        ) : (
          <>
            <section className="cp-card">
              <div className="cp-cardHead">
                <div>
                  <div className="cp-eyebrow">Your cards</div>
                  <h2 className="cp-cardTitle">Your purchased products</h2>
                  <p className="cp-muted">
                    {purchasedCards.length
                      ? "View the products you already bought and open any order for full details."
                      : "Once you buy your first product, it will appear here."}
                  </p>
                </div>
              </div>

              {error ? <div className="cp-alert danger">{error}</div> : null}

              {!loading && !purchasedCards.length ? (
                <div className="cp-emptyState">
                  <div className="cp-emptyStateCard">
                    <div className="cp-emptyStateTitle">No cards yet</div>
                    <p className="cp-emptyStateText">
                      Your purchased products will appear here after checkout.
                    </p>
                  </div>
                </div>
              ) : null}

              {!!purchasedCards.length && (
                <div className="cp-grid">
                  {purchasedCards.map((card) => (
                    <PurchasedCardItem
                      key={card.id}
                      card={card}
                      isActive={card.id === selectedId}
                      onOpenDetails={openOrderDetails}
                    />
                  ))}
                </div>
              )}
            </section>

            <CardsCatalog
              onChooseProduct={openConfigurator}
              hasPurchasedCards={purchasedCards.length > 0}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}