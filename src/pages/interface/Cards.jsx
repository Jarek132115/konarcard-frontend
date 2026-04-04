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
  },
  "metal-card": {
    key: "metal-card",
    title: "Metal NFC Business Card",
  },
  konartag: {
    key: "konartag",
    title: "KonarTag NFC Key Tag",
  },
};

function readIntent() {
  try {
    const raw = localStorage.getItem(NFC_INTENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.productKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearIntent() {
  try {
    localStorage.removeItem(NFC_INTENT_KEY);
  } catch { }
}

async function getMyOrders() {
  const r = await api.get("/api/nfc-orders/mine");
  if (r.status !== 200) {
    throw new Error(r.data?.message || "Failed to load orders");
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
            : [];

        if (!alive) return;

        setPurchasedOrders(
          all.filter((o) => {
            const s = String(o?.status || "").toLowerCase();
            return ["paid", "processing", "fulfilled", "shipped"].includes(s);
          })
        );
      } catch (e) {
        if (!alive) return;
        setError(e.message || "Failed to load orders.");
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
    const sp = new URLSearchParams(location.search);
    const product = sp.get("product");
    const intent = readIntent();

    if (product && PRODUCT_META[product]) {
      setSelectedProductKey(product);
      return;
    }

    if (intent?.productKey) {
      setSelectedProductKey(intent.productKey);
    }
  }, [location.search]);

  const openConfigurator = (productKey) => {
    setSelectedProductKey(productKey);
    navigate(`/cards?product=${productKey}`, { replace: true });
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

  return (
    <DashboardLayout title="Cards" subtitle="Manage your KonarCards.">
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
          />
        ) : selectedOrderView ? (
          <OrderDetailsView
            selectedOrder={purchasedCards.find((c) => c.id === selectedId)}
            productMeta={PRODUCT_META}
            defaultLogoDataUrl={DEFAULT_LOGO_DATAURL}
            qrSrcFromLink={qrSrcFromLink}
            Card3DDetails={Card3DDetails}
            formatMoneyMinor={formatMoneyMinor}
            onBack={backToCardsHome}
          />
        ) : (
          <>
            {/* PURCHASED PRODUCTS */}
            {!!purchasedCards.length && (
              <section className="cp-card">
                <div className="cp-cardHead">
                  <div>
                    <div className="cp-eyebrow">Your cards</div>
                    <h2 className="cp-cardTitle">
                      Your purchased products
                    </h2>
                  </div>
                </div>

                <div className="cp-catalogGrid">
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
              </section>
            )}

            {/* CATALOG */}
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