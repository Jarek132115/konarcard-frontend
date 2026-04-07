import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import OrderDetailsView from "../../components/Cards/OrderDetailsView";
import CardCustomizer from "../../components/Cards/CardCustomizer";
import CardsCatalog from "../../components/Cards/CardsCatalog";
import PurchasedProductCard from "../../components/Cards/PurchasedProductCard";

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
    title: "Plastic NFC Business Card",
    edition: "plastic",
  },
  "metal-card": {
    key: "metal-card",
    title: "Metal NFC Business Card",
    edition: "metal",
  },
  konartag: {
    key: "konartag",
    title: "KonarTag NFC Key Tag",
    edition: "tag",
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

        const purchased = Array.isArray(data?.purchasedOrders)
          ? data.purchasedOrders
          : [];

        if (!alive) return;

        setPurchasedOrders(
          purchased.length
            ? purchased
            : all.filter((o) => {
              const s = String(
                o?.normalizedStatus || o?.status || ""
              ).toLowerCase();

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
      setSelectedOrderView(false);
      setSelectedProductKey("");
      setSelectedId(null);
      navigate("/cards", { replace: true });
      return;
    }

    if (checkout === "cancel") {
      toast.error("Checkout cancelled.");
      clearIntent();
      setSelectedOrderView(false);
      setSelectedProductKey("");
      setSelectedId(null);
      navigate("/cards", { replace: true });
      return;
    }

    if (product && PRODUCT_META[product]) {
      setSelectedOrderView(false);
      setSelectedId(null);
      setSelectedProductKey(product);
      return;
    }

    if (location.search) return;
    if (selectedOrderView) return;
    if (selectedId) return;

    if (intent?.productKey && PRODUCT_META[intent.productKey]) {
      setSelectedOrderView(false);
      setSelectedProductKey(intent.productKey);
      return;
    }

    setSelectedProductKey("");
  }, [location.search, navigate, selectedOrderView, selectedId]);

  const openConfigurator = (productKey) => {
    setSelectedOrderView(false);
    setSelectedId(null);
    setSelectedProductKey(productKey);
    navigate(`/cards?product=${encodeURIComponent(productKey)}`, { replace: true });
  };

  const openOrderDetails = (orderId) => {
    clearIntent();
    setSelectedProductKey("");
    setSelectedId(orderId);
    setSelectedOrderView(true);
    navigate("/cards", { replace: true });
  };

  const backToCardsHome = () => {
    clearIntent();
    setSelectedProductKey("");
    setSelectedId(null);
    setSelectedOrderView(false);
    navigate("/cards", { replace: true });
  };

  return (
    <DashboardLayout hideDesktopHeader>
      <div className="cp-shell">
        <PageHeader
          title="Cards"
          subtitle="Choose a product, customise it, and check out."
        />

        {selectedProductKey ? (
          <CardCustomizer
            productKey={selectedProductKey}
            initialIntent={readIntent()}
            onBack={backToCardsHome}
            onCheckoutSuccess={async () => { }}
          />
        ) : selectedOrderView ? (
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
        ) : (
          <>
            <section className="cp-card">
              <div className="cp-cardHead">
                <div className="cp-cardHeadCopy">
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

              {loading ? (
                <div className="cp-ownedRail cp-ownedRail--loading">
                  <div className="cp-ownedSkeleton" />
                  <div className="cp-ownedSkeleton" />
                </div>
              ) : null}

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

              {!loading && !!purchasedCards.length && (
                <div className="cp-ownedRail" aria-label="Purchased cards">
                  {purchasedCards.map((card) => (
                    <PurchasedProductCard
                      key={card.id}
                      card={{
                        ...card,
                        amountTotalFormatted: formatMoneyMinor(
                          card.amountTotal,
                          card.currency
                        ),
                      }}
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