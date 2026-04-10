const trim = (v) => (v ?? "").toString().trim();

/* =========================================================
   PRODUCT LABELS
========================================================= */

export function prettyProduct(productKey) {
    const key = String(productKey || "").trim().toLowerCase();

    if (key === "plastic-white") return "KonarCard White";
    if (key === "plastic-black") return "KonarCard Black";
    if (key === "plastic-blue") return "KonarCard Blue";
    if (key === "plastic-green") return "KonarCard Green";
    if (key === "plastic-magenta") return "KonarCard Magenta";
    if (key === "plastic-orange") return "KonarCard Orange";

    if (key === "plastic-card") return "Plastic Card";
    if (key === "metal-card") return "Metal Card";
    if (key === "konartag") return "KonarTag";

    return "KonarCard";
}

/* =========================================================
   PROFILE HELPERS
========================================================= */

export function assignedProfileFromOrder(order) {
    return (
        order?.profile?.business_card_name ||
        order?.profile?.main_heading ||
        order?.profile?.full_name ||
        order?.profile?.username ||
        "Not assigned"
    );
}

export function profileSlugFromOrder(order) {
    return (
        order?.profile?.profile_slug ||
        order?.profile?.slug ||
        order?.profile?.username ||
        order?.preview?.profileSlug ||
        ""
    );
}

export function profileLinkFromOrder(order) {
    const explicit =
        trim(order?.preview?.nfcProfileUrl) ||
        trim(order?.preview?.publicProfileUrl);

    if (explicit) return explicit;

    const slug = profileSlugFromOrder(order);
    if (!slug) return "";
    return `${window.location.origin}/u/${slug}`;
}

/* =========================================================
   VARIANT / FINISH
========================================================= */

export function variantRaw(order) {
    return order?.variant || order?.preview?.variant || "";
}

export function finishFromVariant(variantRawValue) {
    const v = String(variantRawValue || "").toLowerCase();
    if (v === "gold") return "gold";
    return "black";
}

/* =========================================================
   MONEY FORMAT
========================================================= */

export function formatMoneyMinor(amountMinor, currency) {
    const a = Number(amountMinor || 0);
    const c = String(currency || "").toUpperCase();
    const major = (a / 100).toFixed(2);

    if (!c) return major;
    if (c === "GBP") return `£${major}`;
    if (c === "EUR") return `€${major}`;
    if (c === "USD") return `$${major}`;
    return `${c} ${major}`;
}

/* =========================================================
   QR HELPER
========================================================= */

export function qrSrcFromLink(link) {
    const url = trim(link);
    if (!url) return "";
    const data = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=700x700&margin=10&data=${data}`;
}

/* =========================================================
   DEFAULT LOGO
========================================================= */

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

export const DEFAULT_LOGO_DATAURL = `data:image/svg+xml;charset=utf-8,${KONAR_LOGO_SVG}`;

/* =========================================================
   ORDER NORMALIZATION
========================================================= */

export function normalizeOrder(order) {
    const id = String(order?._id || order?.id || "");
    const productKey = String(order?.productKey || "").trim();
    const link = profileLinkFromOrder(order);

    const preview = order?.preview && typeof order.preview === "object"
        ? order.preview
        : {};

    const customization =
        preview?.customization && typeof preview.customization === "object"
            ? preview.customization
            : {};

    return {
        id,
        productKey,
        title: prettyProduct(productKey),

        /* profile */
        assignedProfile: assignedProfileFromOrder(order),
        profileSlug: profileSlugFromOrder(order),
        link,

        /* variant */
        variantRaw: String(variantRaw(order) || ""),
        finish: finishFromVariant(variantRaw(order)),

        /* order meta */
        status: String(order?.status || ""),
        quantity: Number(order?.quantity || 1),
        amountTotal: Number(order?.amountTotal || 0),
        currency: String(order?.currency || ""),
        createdAt: order?.createdAt
            ? new Date(order.createdAt).toLocaleString()
            : "",

        /* visuals */
        logoUrl: String(order?.logoUrl || ""),
        previewImageUrl: String(order?.previewImageUrl || ""),

        /* saved text customisation for plastic cards */
        frontText: String(customization?.frontText || ""),
        frontFontSize: Number(customization?.fontSize || 42),
        frontFontWeight: Number(customization?.fontWeight || 700),
        frontTextColor: String(customization?.textColor || ""),

        /* preview config */
        preview: {
            logoPercent: Number(preview?.logoPercent || 70),
            logoPreset: String(preview?.logoPreset || "medium"),
            variant: String(preview?.variant || ""),
            edition: String(preview?.edition || ""),
            family: String(preview?.family || ""),
            styleKey: String(preview?.styleKey || ""),
            frontTemplate: String(preview?.frontTemplate || ""),
            backTemplate: String(preview?.backTemplate || ""),
            publicProfileUrl: String(preview?.publicProfileUrl || ""),
            nfcProfileUrl: String(preview?.nfcProfileUrl || ""),
            profileSlug: String(preview?.profileSlug || ""),
            customization,
        },

        /* raw fallback */
        _raw: order,
    };
}

/* =========================================================
   OWNERSHIP CHECK
========================================================= */

export function isOwnedOrder(order) {
    const s = String(order?.status || "").toLowerCase();
    return s === "paid" || s === "fulfilled";
}