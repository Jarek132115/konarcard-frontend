import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/cards.css";

import api from "../../services/api";

import CardsCatalog from "../../components/Cards/CardsCatalog";
import CardsOwnedList from "../../components/Cards/CardsOwnedList";
import CardDetailsPanel from "../../components/Cards/CardDetailsPanel";
import CardCustomizer from "../../components/Cards/CardCustomizer";
import { isOwnedOrder, normalizeOrder } from "../../components/Cards/cardsHelpers";

async function getMyOrders() {
  const r = await api.get("/api/nfc-orders/mine");
  if (r.status !== 200) {
    throw new Error(r.data?.message || r.data?.error || "Failed to load orders");
  }
  return r.data;
}

export default function Cards() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [mode, setMode] = useState("owned"); // catalog | customize | owned
  const [activeProductKey, setActiveProductKey] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyOrders();
      const list = Array.isArray(data) ? data : data?.orders || data?.data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to load orders."
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const ownedCards = useMemo(() => {
    return (orders || []).filter(isOwnedOrder).map(normalizeOrder);
  }, [orders]);

  useEffect(() => {
    if (loading) return;

    if (!ownedCards.length && mode !== "customize") {
      setMode("catalog");
      return;
    }

    if (ownedCards.length && mode !== "customize") {
      setMode("owned");
    }
  }, [loading, ownedCards.length, mode]);

  useEffect(() => {
    if (!ownedCards.length) return;
    if (selectedId && ownedCards.some((c) => c.id === selectedId)) return;
    setSelectedId(ownedCards[0].id);
  }, [ownedCards, selectedId]);

  const selected = useMemo(
    () => ownedCards.find((c) => c.id === selectedId) || null,
    [ownedCards, selectedId]
  );

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const checkout = sp.get("checkout");
    const orderId = sp.get("order");

    if (checkout === "success") {
      void (async () => {
        await loadOrders();
        setMode("owned");

        if (orderId) {
          setSelectedId(orderId);
        }

        const clean = new URL(window.location.href);
        clean.searchParams.delete("checkout");
        clean.searchParams.delete("order");
        clean.searchParams.delete("session_id");
        navigate(`${clean.pathname}${clean.search}`, { replace: true });
      })();
    }

    if (checkout === "cancel") {
      const clean = new URL(window.location.href);
      clean.searchParams.delete("checkout");
      clean.searchParams.delete("order");
      navigate(`${clean.pathname}${clean.search}`, { replace: true });
    }
  }, [location.search, loadOrders, navigate]);

  const handleChooseProduct = (productKey) => {
    setActiveProductKey(productKey);
    setMode("customize");
  };

  const handleAssign = () => {
    alert("Assign a profile to this card (coming next)");
  };

  const handleCheckoutSuccess = async () => {
    await loadOrders();
    setMode("owned");
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
            <span className="cp-btnIcon" aria-hidden="true">
              ▭
            </span>
            Buy another
          </button>
        </>
      ) : mode === "customize" ? (
        <button
          type="button"
          className="kx-btn kx-btn--white"
          onClick={() => setMode(ownedCards.length ? "owned" : "catalog")}
        >
          Back
        </button>
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
        ) : null}

        {mode === "customize" ? (
          <CardCustomizer
            productKey={activeProductKey}
            onBack={() => setMode(ownedCards.length ? "owned" : "catalog")}
            onCheckoutSuccess={handleCheckoutSuccess}
          />
        ) : null}

        {mode === "owned" ? (
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
        ) : null}
      </div>
    </DashboardLayout>
  );
}