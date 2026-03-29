import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
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

function writeIntent(v) {
  try {
    if (!v) localStorage.removeItem(NFC_INTENT_KEY);
    else localStorage.setItem(NFC_INTENT_KEY, JSON.stringify(v));
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
  if (r.status !== 200) throw new Error(r.data?.message || r.data?.error || "Failed to load orders");
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

export default function Cards() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

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

  useEffect(() => {
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
    };
  }, [logoUrl]);

  const cards = useMemo(() => {
    return (orders || []).map((o) => ({
      id: String(o?._id || o?.id || ""),
      productKey: String(o?.productKey || ""),
      title: prettyProduct(o?.productKey),
      profileSlug: profileSlugFromOrder(o),
      link: profileLinkFromOrder(o),
      variantRaw: String(o?.variant || o?.preview?.variant || ""),
      status: String(o?.status || ""),
      quantity: Number(o?.quantity || 1),
      amountTotal: Number(o?.amountTotal || 0),
      currency: String(o?.currency || ""),
      createdAt: o?.createdAt ? new Date(o.createdAt).toLocaleString() : "",
      logoUrl: String(o?.logoUrl || ""),
      preview: o?.preview || {},
      _raw: o,
    }));
  }, [orders]);

  useEffect(() => {
    if (!cards.length) return;
    if (selectedId && cards.some((c) => c.id === selectedId)) return;
    setSelectedId(cards[0].id);
  }, [cards, selectedId]);

  const selectedOrder = useMemo(
    () => cards.find((c) => c.id === selectedId) || null,
    [cards, selectedId]
  );

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const checkout = sp.get("checkout");
    const product = sp.get("product");
    const intent = readIntent();

    if (checkout === "success") {
      toast.success("Payment received ✅");
      writeIntent(null);

      if (product && PRODUCT_META[product]) {
        setSelectedProductKey(product);
      }

      navigate("/cards", { replace: true });
      return;
    }

    if (checkout === "cancel") {
      toast.error("Checkout cancelled.");
      if (product && PRODUCT_META[product]) {
        setSelectedProductKey(product);
      } else if (intent?.productKey && PRODUCT_META[intent.productKey]) {
        setSelectedProductKey(intent.productKey);
      }
      navigate("/cards", { replace: true });
      return;
    }

    if (product && PRODUCT_META[product]) {
      setSelectedProductKey(product);
      return;
    }

    if (intent?.productKey && PRODUCT_META[intent.productKey]) {
      setSelectedProductKey(intent.productKey);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const intent = readIntent();
    if (!intent?.productKey || intent.productKey !== selectedProductKey) return;

    if (typeof intent.quantity === "number") setQty(Math.max(1, intent.quantity));
    if (typeof intent.profileId === "string") setProfileId(intent.profileId);
    if (typeof intent.logoPreset === "string") setLogoPreset(intent.logoPreset);
    if (typeof intent.variant === "string") setVariant(intent.variant);
    else if (typeof intent.finish === "string") setVariant(intent.finish);

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      returnTo: "/cards",
      createdAt: readIntent()?.createdAt || Date.now(),
      updatedAt: Date.now(),
    });
  }, [selectedProductKey, qty, profileId, logoFile, variant, logoPreset]);

  const selectedProduct = selectedProductKey ? PRODUCT_META[selectedProductKey] : null;
  const logoPercent = PRESET_TO_PERCENT[logoPreset] || 70;

  const displayedLogo = logoUrl || selectedOrder?.logoUrl || DEFAULT_LOGO_DATAURL;
  const displayedQr = selectedOrder?.link ? qrSrcFromLink(selectedOrder.link) : "";
  const selectedVariant = variant || selectedProduct?.defaultVariant || "white";

  const onPickLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoFile(file);
    setLogoUrl(URL.createObjectURL(file));
  };

  const clearLogo = () => {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl("");
    setLogoFile(null);
  };

  const openConfigurator = (productKey) => {
    const meta = PRODUCT_META[productKey];
    setSelectedProductKey(productKey);
    setQty(1);
    setVariant(meta.defaultVariant);
    setLogoPreset("medium");
    setLogoUrl("");
    setLogoFile(null);
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

      const resp = await api.post("/api/checkout/nfc/session", {
        productKey: selectedProduct.key,
        variant: selectedVariant,
        quantity: qty,
        profileId,
        logoUrl: savedLogoUrl || "",
        returnUrl: `${window.location.origin}/cards?product=${encodeURIComponent(selectedProduct.key)}`,
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

      writeIntent(null);
      window.location.href = resp.data.url;
    } catch (e) {
      toast.error(e?.message || "Checkout failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const headerRight = (
    <div className="cp-headRight">
      <span className="cp-pill">
        Cards: <strong>{cards.length}</strong>
      </span>

      <button
        type="button"
        className="kx-btn kx-btn--black"
        onClick={() => setSelectedProductKey("")}
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

        <section className="cp-card">
          {!selectedProduct ? (
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

              {!!cards.length && (
                <>
                  <div className="cp-divider" />
                  <div className="cp-cardHead">
                    <div>
                      <h2 className="cp-cardTitle">Your purchased products</h2>
                      <p className="cp-muted">Cards you already bought will show here.</p>
                    </div>
                  </div>

                  <div className="cp-grid">
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
                            <div className="cp-sub">
                              <span className="cp-subLabel">Status:</span>
                              <span className="cp-subValue">{c.status || "—"}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="cp-cardHead">
                <div>
                  <h2 className="cp-cardTitle">{selectedProduct.title}</h2>
                  <p className="cp-muted">{selectedProduct.subtitle}</p>
                </div>

                <button
                  type="button"
                  className="cp-selectBtn"
                  onClick={() => setSelectedProductKey("")}
                >
                  Back to products
                </button>
              </div>

              <div className="cp-detailsGrid">
                <div className="cp-previewCard">
                  <Card3DDetails
                    productKey={selectedProduct.key}
                    logoSrc={displayedLogo}
                    qrSrc={displayedQr}
                    logoPercent={logoPercent}
                    variant={selectedVariant}
                  />
                </div>

                <div className="cp-innerCard">
                  <div className="cp-innerTitle">Customise your product</div>

                  <div className="cp-formBlock">
                    <div className="cp-fieldLabel">Logo</div>
                    <div className="cp-actions">
                      <label className="cp-selectBtn" style={{ justifyContent: "center", display: "inline-flex", alignItems: "center" }}>
                        <input type="file" accept="image/*" onChange={onPickLogo} style={{ display: "none" }} />
                        {logoFile?.name || "Upload logo"}
                      </label>
                      <button type="button" className="cp-selectBtn" onClick={clearLogo} disabled={!logoUrl}>
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

                  <div style={{ marginTop: 16 }}>
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
                  ) : !cards.length ? (
                    <div className="cp-muted">No purchases yet.</div>
                  ) : (
                    cards.map((card) => (
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
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}