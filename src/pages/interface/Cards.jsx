import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import OrderDetailsView from "../../components/Cards/OrderDetailsView";
import "../../styling/dashboard/cards.css";

import api from "../../services/api";
import { useMyProfiles } from "../../hooks/useBusinessCard";

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
  },
};

const PRESET_TO_PERCENT = {
  small: 60,
  medium: 70,
  large: 80,
};

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

function prettyProduct(productKey) {
  return PRODUCT_META[productKey]?.name || "KonarCard";
}

function trim(v) {
  return (v ?? "").toString().trim();
}

function formatMoneyMinor(amountMinor, currency) {
  const a = Number(amountMinor || 0);
  const c = String(currency || "").toUpperCase();
  const major = (a / 100).toFixed(2);
  if (c === "GBP") return `£${major}`;
  if (c === "EUR") return `€${major}`;
  if (c === "USD") return `$${major}`;
  return c ? `${c} ${major}` : major;
}

function profileSlugFromOrder(order) {
  return order?.profile?.profile_slug || order?.profile?.slug || order?.profile?.username || "";
}

function profileLinkFromOrder(order) {
  const slug = profileSlugFromOrder(order);
  return slug ? `${window.location.origin}/u/${slug}` : "";
}

function qrSrcFromLink(link) {
  const url = trim(link);
  if (!url) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=700x700&margin=10&data=${encodeURIComponent(url)}`;
}

function buildCardsProductUrl(productKey) {
  const safe = String(productKey || "").trim();
  return safe ? `/cards?product=${encodeURIComponent(safe)}` : "/cards";
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

function writeIntent(v) {
  try {
    if (!v) {
      localStorage.removeItem(NFC_INTENT_KEY);
      return;
    }

    const existing = readIntent();
    localStorage.setItem(
      NFC_INTENT_KEY,
      JSON.stringify({
        ...(existing && typeof existing === "object" ? existing : {}),
        ...v,
        createdAt: v?.createdAt || existing?.createdAt || Date.now(),
        updatedAt: Date.now(),
      })
    );
  } catch {
    // ignore
  }
}

function clearIntent() {
  try {
    localStorage.removeItem(NFC_INTENT_KEY);
  } catch {
    // ignore
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
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
    return <MetalCard3D logoSrc={logoSrc} qrSrc={qrSrc} logoSize={logoPercent} finish={variant} />;
  }
  if (productKey === "konartag") {
    return <KonarTag3D logoSrc={logoSrc} qrSrc={qrSrc} logoSize={logoPercent} finish={variant} />;
  }
  return <PlasticCard3D logoSrc={logoSrc} qrSrc={qrSrc} logoSize={logoPercent} variant={variant} />;
}

function ProductPickerCard({ productKey, active, onSelect }) {
  const meta = PRODUCT_META[productKey];

  return (
    <button
      type="button"
      className={`cp-productTile ${active ? "is-active" : ""}`}
      onClick={() => onSelect(productKey)}
    >
      <div className="cp-productTileTop">
        <span className="cp-pill">{meta.name}</span>
      </div>

      <div className="cp-productTileBody">
        <h3 className="cp-productTileTitle">{meta.title}</h3>
        <p className="cp-muted">{meta.subtitle}</p>
      </div>

      <div className="cp-productTileFoot">
        <span className="cp-productTilePrice">{meta.price}</span>
        <span className="cp-productTileCta">Configure</span>
      </div>
    </button>
  );
}

function OrderFlatPreview({ order }) {
  const productKey = String(order?.productKey || "");
  const meta = PRODUCT_META[productKey] || null;
  const variant = String(order?.variantRaw || order?.preview?.variant || meta?.defaultVariant || "white").toLowerCase();
  const logoSrc = trim(order?.logoUrl) || DEFAULT_LOGO_DATAURL;
  const isTag = productKey === "konartag";
  const isDark =
    variant === "black" ||
    (productKey === "metal-card" && variant === "black") ||
    (productKey === "konartag" && variant === "black");

  const bg =
    productKey === "metal-card"
      ? variant === "gold"
        ? "linear-gradient(135deg, #f7e3a2 0%, #ddb85a 100%)"
        : "linear-gradient(135deg, #20242d 0%, #11151c 100%)"
      : productKey === "konartag"
        ? variant === "gold"
          ? "linear-gradient(135deg, #f7e3a2 0%, #ddb85a 100%)"
          : "linear-gradient(135deg, #20242d 0%, #11151c 100%)"
        : variant === "black"
          ? "linear-gradient(135deg, #1f2430 0%, #0f141c 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)";

  return (
    <div
      className={`cp-flatCard ${isTag ? "is-tag" : "is-card"}`}
      style={{ background: bg }}
    >
      <div className="cp-flatCardInner">
        <div className={`cp-flatLogoWrap ${isDark ? "is-dark" : "is-light"}`}>
          <img src={logoSrc} alt="" className="cp-flatLogo" />
        </div>

        <div className="cp-flatFooter">
          <div className={`cp-flatName ${isDark ? "is-dark" : "is-light"}`}>
            {meta?.name || "KonarCard"}
          </div>

          <div className="cp-flatQr" />
        </div>
      </div>
    </div>
  );
}

function mapOrder(o) {
  return {
    id: String(o?._id || o?.id || ""),
    productKey: String(o?.productKey || ""),
    title: prettyProduct(o?.productKey),
    profileSlug: profileSlugFromOrder(o),
    link: profileLinkFromOrder(o),
    variantRaw: String(o?.variant || o?.preview?.variant || ""),
    status: String(o?.status || o?.normalizedStatus || ""),
    normalizedStatus: String(o?.normalizedStatus || o?.status || ""),
    quantity: Number(o?.quantity || 1),
    amountTotal: Number(o?.amountTotal || 0),
    currency: String(o?.currency || ""),
    createdAt: o?.createdAt ? new Date(o.createdAt).toLocaleString() : "",
    logoUrl: String(o?.logoUrl || ""),
    preview: o?.preview || {},
    _raw: o,
  };
}

export default function Cards() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [orders, setOrders] = useState([]);
  const [purchasedOrders, setPurchasedOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedOrderView, setSelectedOrderView] = useState(false);

  const [selectedProductKey, setSelectedProductKey] = useState("");
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState("white");
  const [logoPreset, setLogoPreset] = useState("medium");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [profileId, setProfileId] = useState("");
  const [busy, setBusy] = useState(false);

  const profilesQuery = useMyProfiles();
  const isProfilesLoading = !!profilesQuery?.isLoading;

  const myProfiles = (() => {
    const d = profilesQuery?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.data?.data)) return d.data.data;
    return [];
  })();

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
        const pending = Array.isArray(data?.pendingOrders) ? data.pendingOrders : [];
        const cancelled = Array.isArray(data?.cancelledOrders) ? data.cancelledOrders : [];

        if (!alive) return;

        setOrders(all);
        setPurchasedOrders(
          purchased.length
            ? purchased
            : all.filter((o) => {
              const s = String(o?.normalizedStatus || o?.status || "").toLowerCase();
              return ["paid", "processing", "fulfilled", "shipped", "complete", "completed"].includes(s);
            })
        );
        setPendingOrders(
          pending.length
            ? pending
            : all.filter((o) => {
              const s = String(o?.normalizedStatus || o?.status || "").toLowerCase();
              return ["pending", "open", "unpaid"].includes(s);
            })
        );
        setCancelledOrders(
          cancelled.length
            ? cancelled
            : all.filter((o) => {
              const s = String(o?.normalizedStatus || o?.status || "").toLowerCase();
              return ["cancelled", "canceled", "expired", "failed", "payment_failed"].includes(s);
            })
        );
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.response?.data?.error || e?.message || "Failed to load orders.");
        setOrders([]);
        setPurchasedOrders([]);
        setPendingOrders([]);
        setCancelledOrders([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (logoUrl && logoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoUrl]);

  const cards = useMemo(() => (orders || []).map(mapOrder), [orders]);
  const purchasedCards = useMemo(() => (purchasedOrders || []).map(mapOrder), [purchasedOrders]);
  const pendingCards = useMemo(() => (pendingOrders || []).map(mapOrder), [pendingOrders]);
  const cancelledCards = useMemo(() => (cancelledOrders || []).map(mapOrder), [cancelledOrders]);

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

      navigate(resumeProduct ? buildCardsProductUrl(resumeProduct) : "/cards", { replace: true });
      return;
    }

    if (checkout === "cancel") {
      toast.error("Checkout cancelled.");

      const resumeProduct =
        (product && PRODUCT_META[product] && product) ||
        (intent?.productKey && PRODUCT_META[intent.productKey] && intent.productKey) ||
        "";

      navigate(resumeProduct ? buildCardsProductUrl(resumeProduct) : "/cards", { replace: true });
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

  useEffect(() => {
    const intent = readIntent();
    if (!intent?.productKey || intent.productKey !== selectedProductKey) return;

    if (typeof intent.quantity === "number") {
      setQty(Math.max(1, intent.quantity));
    }

    if (typeof intent.profileId === "string") {
      setProfileId(intent.profileId);
    }

    if (typeof intent.logoPreset === "string") {
      setLogoPreset(intent.logoPreset);
    }

    if (typeof intent.variant === "string") {
      setVariant(intent.variant);
    } else if (typeof intent.finish === "string") {
      setVariant(intent.finish);
    }

    if (intent.hadLogo) {
      setInfoMsg("Please re-upload your logo to continue checkout.");
    } else {
      setInfoMsg("");
    }
  }, [selectedProductKey]);

  useEffect(() => {
    if (!selectedProductKey) return;

    const meta = PRODUCT_META[selectedProductKey];
    if (!meta) return;

    if (!variant || !meta.variants.includes(variant)) {
      setVariant(meta.defaultVariant);
    }
  }, [selectedProductKey, variant]);

  useEffect(() => {
    if (!selectedProductKey) return;
    if (profileId) return;
    if (!myProfiles.length) return;

    const firstId = String(myProfiles[0]?._id || "");
    if (firstId) setProfileId(firstId);
  }, [myProfiles, profileId, selectedProductKey]);

  useEffect(() => {
    if (!selectedProductKey) return;

    writeIntent({
      productKey: selectedProductKey,
      quantity: qty,
      profileId,
      hadLogo: !!logoFile,
      variant,
      logoPreset,
      returnTo: buildCardsProductUrl(selectedProductKey),
      createdAt: readIntent()?.createdAt || Date.now(),
    });
  }, [selectedProductKey, qty, profileId, logoFile, variant, logoPreset]);

  const selectedProduct = selectedProductKey ? PRODUCT_META[selectedProductKey] : null;
  const logoPercent = PRESET_TO_PERCENT[logoPreset] || 70;

  const displayedLogo = logoUrl || DEFAULT_LOGO_DATAURL;
  const displayedQr = selectedOrder?.link ? qrSrcFromLink(selectedOrder.link) : "";
  const selectedVariant = variant || selectedProduct?.defaultVariant || "white";

  const onPickLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (logoUrl && logoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(logoUrl);
    }

    setLogoFile(file);
    setLogoUrl(URL.createObjectURL(file));
    setInfoMsg("");
  };

  const clearLogo = () => {
    if (logoUrl && logoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(logoUrl);
    }
    setLogoUrl("");
    setLogoFile(null);
  };

  const openConfigurator = (productKey) => {
    const meta = PRODUCT_META[productKey];

    if (logoUrl && logoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(logoUrl);
    }

    setSelectedOrderView(false);
    setSelectedProductKey(productKey);
    setQty(1);
    setVariant(meta.defaultVariant);
    setLogoPreset("medium");
    setLogoUrl("");
    setLogoFile(null);
    setInfoMsg("");
    navigate(buildCardsProductUrl(productKey), { replace: true });
  };

  const openOrderDetails = (orderId) => {
    setSelectedProductKey("");
    setSelectedId(orderId);
    setSelectedOrderView(true);
    setInfoMsg("");
    navigate("/cards", { replace: true });
  };

  const handleStartCheckout = async () => {
    if (!selectedProduct) return;

    if (!myProfiles.length) {
      toast.error("You need at least 1 profile before buying a card.");
      navigate("/profiles");
      return;
    }

    if (!profileId) {
      toast.error("Please choose which profile to link to this product.");
      return;
    }

    setBusy(true);

    try {
      let savedLogoUrl = "";

      if (logoFile) {
        const dataUrl = await fileToDataUrl(logoFile);

        const uploadRes = await api.post("/api/checkout/nfc/logo", {
          dataUrl,
          filename: logoFile?.name || "logo.png",
        });

        if (uploadRes?.status >= 400 || !uploadRes?.data?.logoUrl) {
          throw new Error(uploadRes?.data?.error || "Logo upload failed");
        }

        savedLogoUrl = uploadRes.data.logoUrl;
      }

      writeIntent({
        productKey: selectedProduct.key,
        quantity: qty,
        profileId,
        hadLogo: !!logoFile,
        variant: selectedVariant,
        logoPreset,
        returnTo: buildCardsProductUrl(selectedProduct.key),
        createdAt: readIntent()?.createdAt || Date.now(),
      });

      const resp = await api.post("/api/checkout/nfc/session", {
        productKey: selectedProduct.key,
        variant: selectedVariant,
        quantity: qty,
        profileId,
        logoUrl: savedLogoUrl || "",
        returnUrl: `${window.location.origin}${buildCardsProductUrl(selectedProduct.key)}`,
        preview: {
          logoPercent,
          logoPreset,
          usedCustomLogo: !!savedLogoUrl,
          variant: selectedVariant,
          edition: selectedProduct.edition,
        },
      });

      if (resp?.status >= 400 || !resp?.data?.url) {
        throw new Error(resp?.data?.error || "Failed to start checkout");
      }

      window.location.href = resp.data.url;
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || "Checkout failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const headerRight = (
    <div className="cp-headRight">
      <span className="cp-pill">
        Cards: <strong>{purchasedCards.length}</strong>
      </span>

      <button
        type="button"
        className="kx-btn kx-btn--black"
        onClick={() => {
          setSelectedOrderView(false);
          setSelectedProductKey("");
          setInfoMsg("");
          navigate("/cards", { replace: true });
        }}
      >
        View Products
      </button>
    </div>
  );

  const previewResetKey = `${selectedProduct?.key || "none"}-${selectedVariant}-${logoPreset}-${logoUrl ? "custom" : "default"}`;

  return (
    <DashboardLayout title="Cards" subtitle="Manage your KonarCards." hideDesktopHeader>
      <div className="cp-shell">
        <PageHeader
          title="Cards"
          subtitle="Choose a product, customise it, and check out without leaving your dashboard."
          rightSlot={headerRight}
        />

        <section className="cp-card">
          {!selectedProduct && !selectedOrderView ? (
            <>
              <div className="cp-cardHead">
                <div>
                  <h2 className="cp-cardTitle">Choose your product</h2>
                  <p className="cp-muted">
                    Pick the product you want to customise and buy.
                  </p>
                </div>
              </div>

              {error ? <div className="cp-alert danger">{error}</div> : null}

              <div className="cp-productGrid">
                {Object.keys(PRODUCT_META).map((key) => (
                  <ProductPickerCard
                    key={key}
                    productKey={key}
                    active={selectedProductKey === key}
                    onSelect={openConfigurator}
                  />
                ))}
              </div>

              {!!purchasedCards.length && (
                <>
                  <div className="cp-divider" />

                  <div className="cp-cardHead">
                    <div>
                      <h2 className="cp-cardTitle">Your purchased products</h2>
                      <p className="cp-muted">Cards you already bought will show here.</p>
                    </div>
                  </div>

                  <div className="cp-grid">
                    {purchasedCards.map((c) => (
                      <div
                        key={c.id}
                        className={`cp-item ${c.id === selectedId ? "active" : ""}`}
                      >
                        <div className="cp-preview" aria-hidden="true">
                          <OrderFlatPreview order={c} />
                        </div>

                        <div className="cp-info">
                          <div className="cp-name">{c.title}</div>

                          <div className="cp-sub">
                            <span className="cp-subLabel">Assigned Profile:</span>
                            <span className="cp-subValue">{c.profileSlug || "—"}</span>
                          </div>

                          <div className="cp-sub">
                            <span className="cp-subLabel">Status:</span>
                            <span className="cp-subValue">{c.status || "—"}</span>
                          </div>

                          <div className="cp-sub">
                            <span className="cp-subLabel">Total:</span>
                            <span className="cp-subValue">
                              {formatMoneyMinor(c.amountTotal, c.currency)}
                            </span>
                          </div>

                          <div className="cp-itemActions">
                            <button
                              type="button"
                              className="kx-btn kx-btn--black"
                              onClick={() => openOrderDetails(c.id)}
                            >
                              View details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!!pendingCards.length && (
                <>
                  <div className="cp-divider" />

                  <div className="cp-cardHead">
                    <div>
                      <h2 className="cp-cardTitle">Pending checkouts</h2>
                      <p className="cp-muted">
                        These have not been paid for yet, so they are not treated as purchased cards.
                      </p>
                    </div>
                  </div>

                  <div className="cp-grid">
                    {pendingCards.map((o) => (
                      <div key={o.id} className="cp-item cp-item--muted">
                        <div className="cp-preview" aria-hidden="true">
                          <OrderFlatPreview order={o} />
                        </div>

                        <div className="cp-info">
                          <div className="cp-name">{o.title}</div>

                          <div className="cp-sub">
                            <span className="cp-subLabel">Assigned Profile:</span>
                            <span className="cp-subValue">{o.profileSlug || "—"}</span>
                          </div>

                          <div className="cp-sub">
                            <span className="cp-subLabel">Status:</span>
                            <span className="cp-subValue">{o.status || "pending"}</span>
                          </div>

                          <div className="cp-sub">
                            <span className="cp-subLabel">Total:</span>
                            <span className="cp-subValue">
                              {formatMoneyMinor(o.amountTotal, o.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!!cancelledCards.length && (
                <>
                  <div className="cp-divider" />

                  <div className="cp-cardHead">
                    <div>
                      <h2 className="cp-cardTitle">Cancelled or failed</h2>
                      <p className="cp-muted">These were not completed successfully.</p>
                    </div>
                  </div>

                  <div className="cp-grid">
                    {cancelledCards.map((o) => (
                      <div key={o.id} className="cp-item cp-item--muted">
                        <div className="cp-preview" aria-hidden="true">
                          <OrderFlatPreview order={o} />
                        </div>

                        <div className="cp-info">
                          <div className="cp-name">{o.title}</div>

                          <div className="cp-sub">
                            <span className="cp-subLabel">Assigned Profile:</span>
                            <span className="cp-subValue">{o.profileSlug || "—"}</span>
                          </div>

                          <div className="cp-sub">
                            <span className="cp-subLabel">Status:</span>
                            <span className="cp-subValue">{o.status || "—"}</span>
                          </div>

                          <div className="cp-sub">
                            <span className="cp-subLabel">Total:</span>
                            <span className="cp-subValue">
                              {formatMoneyMinor(o.amountTotal, o.currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : selectedProduct ? (
            <>
              <div className="cp-cardHead">
                <div>
                  <h2 className="cp-cardTitle">{selectedProduct.title}</h2>
                  <p className="cp-muted">{selectedProduct.subtitle}</p>
                </div>

                <button
                  type="button"
                  className="cp-selectBtn"
                  onClick={() => {
                    setSelectedProductKey("");
                    setInfoMsg("");
                    navigate("/cards", { replace: true });
                  }}
                >
                  Back to products
                </button>
              </div>

              {infoMsg ? <div className="cp-alert">{infoMsg}</div> : null}
              {error ? <div className="cp-alert danger">{error}</div> : null}

              <div className="cp-detailsGrid">
                <div className="cp-previewCard">
                  <CardPreviewErrorBoundary
                    resetKey={previewResetKey}
                    fallback={<div className="cp-previewFallback">3D preview unavailable</div>}
                  >
                    <Card3DDetails
                      productKey={selectedProduct.key}
                      logoSrc={displayedLogo}
                      qrSrc={displayedQr}
                      logoPercent={logoPercent}
                      variant={selectedVariant}
                    />
                  </CardPreviewErrorBoundary>
                </div>

                <div className="cp-innerCard">
                  <div className="cp-innerTitle">Customise your product</div>

                  <div className="cp-formBlock">
                    <div className="cp-fieldLabel">Logo</div>

                    <div className="cp-actions">
                      <label className="cp-selectBtn cp-fileBtn">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onPickLogo}
                          style={{ display: "none" }}
                        />
                        {logoFile?.name || "Upload logo"}
                      </label>

                      <button
                        type="button"
                        className="cp-selectBtn"
                        onClick={clearLogo}
                        disabled={!logoUrl}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="cp-formBlock">
                    <div className="cp-fieldLabel">{selectedProduct.sizeLabel}</div>

                    <div className="cp-actions">
                      {["small", "medium", "large"].map((k) => (
                        <button
                          key={k}
                          type="button"
                          className={`cp-selectBtn ${logoPreset === k ? "selected" : ""}`}
                          onClick={() => setLogoPreset(k)}
                        >
                          {k === "small" ? "S" : k === "medium" ? "M" : "L"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cp-formBlock">
                    <div className="cp-fieldLabel">{selectedProduct.variantLabel}</div>

                    <div className="cp-actions">
                      {selectedProduct.variants.map((v) => (
                        <button
                          key={v}
                          type="button"
                          className={`cp-selectBtn ${selectedVariant === v ? "selected" : ""}`}
                          onClick={() => setVariant(v)}
                        >
                          {v.charAt(0).toUpperCase() + v.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cp-formBlock">
                    <div className="cp-fieldLabel">Link to profile</div>

                    <select
                      className="cp-profileSelect"
                      value={profileId}
                      onChange={(e) => setProfileId(e.target.value)}
                      disabled={isProfilesLoading || busy}
                    >
                      <option value="">
                        {isProfilesLoading ? "Loading..." : myProfiles.length ? "Choose profile" : "No profiles"}
                      </option>

                      {myProfiles.map((p) => {
                        const id = String(p?._id || "");
                        if (!id) return null;

                        const label =
                          p?.business_card_name ||
                          p?.full_name ||
                          p?.main_heading ||
                          p?.profile_slug ||
                          "Profile";

                        return (
                          <option key={id} value={id}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="cp-formBlock">
                    <div className="cp-fieldLabel">Quantity</div>

                    <div className="cp-actions">
                      <button
                        type="button"
                        className="cp-miniBtn"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={busy}
                      >
                        −
                      </button>

                      <div className="cp-pill">{qty}</div>

                      <button
                        type="button"
                        className="cp-miniBtn"
                        onClick={() => setQty((q) => Math.min(selectedProduct.maxQty, q + 1))}
                        disabled={busy}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cp-divider" />

                  <div className="cp-row">
                    <span className="cp-rowKey">Product</span>
                    <span className="cp-rowVal">{selectedProduct.name}</span>
                  </div>

                  <div className="cp-row">
                    <span className="cp-rowKey">Variant</span>
                    <span className="cp-rowVal">{selectedVariant}</span>
                  </div>

                  <div className="cp-row">
                    <span className="cp-rowKey">Price</span>
                    <span className="cp-rowVal">{selectedProduct.price}</span>
                  </div>

                  <div className="cp-buyWrap">
                    <button
                      type="button"
                      className="kx-btn kx-btn--black"
                      onClick={handleStartCheckout}
                      disabled={busy}
                    >
                      {busy ? "Starting checkout..." : selectedProduct.buyLabel}
                    </button>
                  </div>
                </div>
              </div>

              <div className="cp-divider" />

              <div className="cp-cardHead">
                <div>
                  <h2 className="cp-cardTitle">Product details</h2>
                  <p className="cp-muted">
                    Review what you selected before checkout.
                  </p>
                </div>
              </div>

              <div className="cp-detailsGrid">
                <div className="cp-innerCard">
                  <div className="cp-innerTitle">Configuration summary</div>

                  <div className="cp-row">
                    <span className="cp-rowKey">Product</span>
                    <span className="cp-rowVal">{selectedProduct.name}</span>
                  </div>

                  <div className="cp-row">
                    <span className="cp-rowKey">Variant</span>
                    <span className="cp-rowVal">{selectedVariant}</span>
                  </div>

                  <div className="cp-row">
                    <span className="cp-rowKey">Logo size</span>
                    <span className="cp-rowVal">{logoPreset}</span>
                  </div>

                  <div className="cp-row">
                    <span className="cp-rowKey">Profile</span>
                    <span className="cp-rowVal">
                      {myProfiles.find((p) => String(p?._id || "") === profileId)?.profile_slug || "—"}
                    </span>
                  </div>

                  <div className="cp-row">
                    <span className="cp-rowKey">Quantity</span>
                    <span className="cp-rowVal">{qty}</span>
                  </div>

                  <div className="cp-row">
                    <span className="cp-rowKey">Custom logo</span>
                    <span className="cp-rowVal">{logoFile ? "yes" : "no"}</span>
                  </div>
                </div>

                <div className="cp-innerCard">
                  <div className="cp-innerTitle">Your orders</div>

                  {loading ? (
                    <div className="cp-muted">Loading orders...</div>
                  ) : !purchasedCards.length ? (
                    <div className="cp-muted">No purchases yet.</div>
                  ) : (
                    purchasedCards.map((card) => (
                      <div key={card.id} className="cp-row">
                        <span className="cp-rowKey">{card.title}</span>
                        <span className="cp-rowVal">
                          {formatMoneyMinor(card.amountTotal, card.currency)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <OrderDetailsView
              selectedOrder={selectedOrder}
              productMeta={PRODUCT_META}
              defaultLogoDataUrl={DEFAULT_LOGO_DATAURL}
              qrSrcFromLink={qrSrcFromLink}
              Card3DDetails={Card3DDetails}
              CardPreviewErrorBoundary={CardPreviewErrorBoundary}
              formatMoneyMinor={formatMoneyMinor}
              onBack={() => {
                setSelectedOrderView(false);
                navigate("/cards", { replace: true });
              }}
            />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}