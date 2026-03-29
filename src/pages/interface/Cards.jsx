import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/cards.css";
import api from "../../services/api";

import CardsCatalog from "../../components/Cards/CardsCatalog";
import CardsOwnedList from "../../components/Cards/CardsOwnedList";
import CardDetailsPanel from "../../components/Cards/CardDetailsPanel";
import { isOwnedOrder, normalizeOrder } from "../../components/Cards/cardsHelpers";

async function getMyOrders() {
  const r = await api.get("/api/nfc-orders/mine");
  if (r.status !== 200) {
    throw new Error(r.data?.message || r.data?.error || "Failed to load orders");
  }
  return r.data;
}

export default function Cards() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("owned");

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
        setError(
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "Failed to load orders."
        );
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

  const ownedCards = useMemo(() => {
    return (orders || [])
      .filter(isOwnedOrder)
      .map(normalizeOrder);
  }, [orders]);

  useEffect(() => {
    if (loading) return;

    if (!ownedCards.length) {
      setMode("catalog");
      return;
    }

    setMode("owned");
  }, [loading, ownedCards.length]);

  useEffect(() => {
    if (!ownedCards.length) return;
    if (selectedId && ownedCards.some((c) => c.id === selectedId)) return;
    setSelectedId(ownedCards[0].id);
  }, [ownedCards, selectedId]);

  const selected = useMemo(
    () => ownedCards.find((c) => c.id === selectedId) || null,
    [ownedCards, selectedId]
  );

  const handleChooseProduct = (productKey) => {
    if (productKey === "plastic-card") {
      window.location.href = "/products/plastic-card";
      return;
    }

    if (productKey === "metal-card") {
      window.location.href = "/products/metal-card";
      return;
    }

    if (productKey === "konartag") {
      window.location.href = "/products/konartag";
      return;
    }

    window.location.href = "/products";
  };

  const handleAssign = () => {
    alert("Assign a profile to this card (coming next)");
  };

  const headerRight = (
    <div className="cp-headRight">
      {mode === "owned" ? (
        <>
          <span className="cp-pill">
            Cards: <strong>{ownedCards.length}</strong>
          </span>

          <button
            type="button"
            className="kx-btn kx-btn--black"
            onClick={() => setMode("catalog")}
          >
            <span className="cp-btnIcon" aria-hidden="true">▭</span>
            Buy another
          </button>
        </>
      ) : null}
    </div>
  );

  return (
    <DashboardLayout title="Cards" subtitle="Manage your KonarCards." hideDesktopHeader>
      <div className="cp-shell">
        <PageHeader
          title="Cards"
          subtitle="Your KonarCards are physical NFC products. Assign each card to a profile so customers always land on the right page."
          rightSlot={headerRight}
        />

        {mode === "catalog" ? (
          <CardsCatalog onChooseProduct={handleChooseProduct} />
        ) : (
          <>
            <CardsOwnedList
              loading={loading}
              error={error}
              cards={ownedCards}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onAssign={handleAssign}
              onBuyAnother={() => setMode("catalog")}
            />

            <CardDetailsPanel loading={loading} selected={selected} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}