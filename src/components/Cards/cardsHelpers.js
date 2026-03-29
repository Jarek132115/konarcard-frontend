const trim = (v) => (v ?? "").toString().trim();

export function prettyProduct(productKey) {
    if (productKey === "plastic-card") return "Plastic Card";
    if (productKey === "metal-card") return "Metal Card";
    if (productKey === "konartag") return "KonarTag";
    return "KonarCard";
}

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
        ""
    );
}

export function profileLinkFromOrder(order) {
    const slug = profileSlugFromOrder(order);
    if (!slug) return "";
    return `${window.location.origin}/u/${slug}`;
}

export function variantRaw(order) {
    return order?.variant || order?.preview?.variant || "";
}

export function finishFromVariant(variantRawValue) {
    const v = String(variantRawValue || "").toLowerCase();
    if (v === "gold") return "gold";
    return "black";
}

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

export function qrSrcFromLink(link) {
    const url = trim(link);
    if (!url) return "";
    const data = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=700x700&margin=10&data=${data}`;
}

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

export function normalizeOrder(order) {
    const id = String(order?._id || order?.id || "");
    const productKey = String(order?.productKey || "");
    const link = profileLinkFromOrder(order);

    return {
        id,
        productKey,
        title: prettyProduct(productKey),
        assignedProfile: assignedProfileFromOrder(order),
        profileSlug: profileSlugFromOrder(order),
        link,
        variantRaw: String(variantRaw(order) || ""),
        status: String(order?.status || ""),
        quantity: Number(order?.quantity || 1),
        amountTotal: Number(order?.amountTotal || 0),
        currency: String(order?.currency || ""),
        createdAt: order?.createdAt ? new Date(order.createdAt).toLocaleString() : "",
        logoUrl: String(order?.logoUrl || ""),
        previewImageUrl: String(order?.previewImageUrl || ""),
        _raw: order,
    };
}

export function isOwnedOrder(order) {
    const s = String(order?.status || "").toLowerCase();
    return s === "paid" || s === "fulfilled";
}