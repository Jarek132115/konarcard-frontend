import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";

const STATUS_OPTIONS = [
    { value: "order_placed", label: "Order placed" },
    { value: "designing_card", label: "Card is being prepared" },
    { value: "packaged", label: "Packaged" },
    { value: "shipped", label: "Shipment is on the way" },
    { value: "delivered", label: "Delivered" },
];

function cleanString(v) {
    return String(v || "").trim();
}

function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatAmount(amount, currency = "gbp") {
    if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";

    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: String(currency || "gbp").toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount / 100);
}

function buildPublicProfileUrl(slug) {
    const safe = cleanString(slug).toLowerCase();
    return safe ? `https://www.konarcard.com/u/${encodeURIComponent(safe)}` : "";
}

function appendVia(url, via) {
    const base = cleanString(url);
    const safeVia = cleanString(via).toLowerCase();

    if (!base || !safeVia) return base;

    try {
        const u = new URL(base);
        u.searchParams.set("via", safeVia);
        return u.toString();
    } catch {
        const joiner = base.includes("?") ? "&" : "?";
        return `${base}${joiner}via=${encodeURIComponent(safeVia)}`;
    }
}

function getPlanTone(plan) {
    const p = cleanString(plan).toLowerCase();
    if (p === "teams") return "info";
    if (p === "plus") return "success";
    return "neutral";
}

function getFulfillmentTone(status) {
    const s = cleanString(status).toLowerCase();
    if (s === "delivered") return "success";
    if (s === "shipped") return "info";
    if (s === "packaged" || s === "designing_card") return "warn";
    return "neutral";
}

function getStatusTone(status) {
    const s = cleanString(status).toLowerCase();
    if (["paid", "processing", "fulfilled", "shipped", "complete", "completed"].includes(s)) {
        return "success";
    }
    if (["failed", "payment_failed"].includes(s)) return "danger";
    if (["cancelled", "canceled", "expired"].includes(s)) return "danger";
    return "neutral";
}

function getProductLabel(productKey) {
    const key = cleanString(productKey).toLowerCase();
    if (key === "plastic-white") return "KonarCard White";
    if (key === "plastic-black") return "KonarCard Black";
    if (key === "plastic-blue") return "KonarCard Blue";
    if (key === "plastic-green") return "KonarCard Green";
    if (key === "plastic-magenta") return "KonarCard Magenta";
    if (key === "plastic-orange") return "KonarCard Orange";
    if (key === "metal-card") return "Metal NFC Business Card";
    if (key === "konartag") return "KonarTag NFC Key Tag";
    return productKey || "Product";
}

function getCardTheme(productKey, styleKey) {
    const key = cleanString(productKey).toLowerCase();
    const style = cleanString(styleKey).toLowerCase();

    if (key === "plastic-black") {
        return {
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.08)",
            accent: "rgba(255,255,255,0.08)",
            defaultText: "#ffffff",
        };
    }

    if (key === "plastic-white") {
        return {
            background: "#ffffff",
            border: "1px solid rgba(15,23,42,0.12)",
            accent: "rgba(15,23,42,0.05)",
            defaultText: "#0f172a",
        };
    }

    if (key === "plastic-blue" || style === "blue") {
        return {
            background: "#2563eb",
            border: "1px solid rgba(255,255,255,0.12)",
            accent: "rgba(255,255,255,0.12)",
            defaultText: "#ffffff",
        };
    }

    if (key === "plastic-green" || style === "green") {
        return {
            background: "#16a34a",
            border: "1px solid rgba(255,255,255,0.12)",
            accent: "rgba(255,255,255,0.12)",
            defaultText: "#ffffff",
        };
    }

    if (key === "plastic-magenta" || style === "magenta") {
        return {
            background: "#db2777",
            border: "1px solid rgba(255,255,255,0.12)",
            accent: "rgba(255,255,255,0.12)",
            defaultText: "#ffffff",
        };
    }

    if (key === "plastic-orange" || style === "orange") {
        return {
            background: "#f97316",
            border: "1px solid rgba(255,255,255,0.12)",
            accent: "rgba(255,255,255,0.12)",
            defaultText: "#ffffff",
        };
    }

    if (key === "metal-card") {
        return {
            background: "linear-gradient(135deg, #1f2937 0%, #6b7280 50%, #111827 100%)",
            border: "1px solid rgba(255,255,255,0.10)",
            accent: "rgba(255,255,255,0.14)",
            defaultText: "#ffffff",
        };
    }

    if (key === "konartag") {
        return {
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.08)",
            accent: "rgba(255,255,255,0.08)",
            defaultText: "#ffffff",
        };
    }

    return {
        background: "#0f172a",
        border: "1px solid rgba(255,255,255,0.08)",
        accent: "rgba(255,255,255,0.08)",
        defaultText: "#ffffff",
    };
}

function normalizeFontWeight(value) {
    const raw = cleanString(value);
    const asNumber = Number(raw);
    if (Number.isFinite(asNumber) && asNumber > 0) return asNumber;
    return 700;
}

function normalizeFontSize(value) {
    const raw = cleanString(value);
    const asNumber = Number(raw);
    if (Number.isFinite(asNumber) && asNumber > 0) return asNumber;
    return 24;
}

function normalizeOrientation(value) {
    const raw = cleanString(value).toLowerCase();
    return raw === "vertical" ? "vertical" : "horizontal";
}

function SectionCard({ title, subtitle, right, children }) {
    return (
        <section className="admin-section-card">
            <div className="admin-section-head">
                <div>
                    <h2 className="admin-section-title">{title}</h2>
                    {subtitle ? <p className="admin-section-subtitle">{subtitle}</p> : null}
                </div>
                {right ? <div className="admin-section-right">{right}</div> : null}
            </div>
            {children}
        </section>
    );
}

function Pill({ children, tone = "neutral" }) {
    return <span className={`admin-pill admin-pill--${tone}`}>{children}</span>;
}

function Btn({ children, tone = "primary", className = "", ...props }) {
    return (
        <button
            {...props}
            className={`admin-btn admin-btn--${tone} ${className}`.trim()}
        >
            {children}
        </button>
    );
}

function TextInput({ className = "", ...props }) {
    return <input {...props} className={`admin-input ${className}`.trim()} />;
}

function SelectInput({ className = "", ...props }) {
    return <select {...props} className={`admin-select ${className}`.trim()} />;
}

function InfoRow({ label, value, full = false, mono = false }) {
    return (
        <div className={`admin-info-row ${full ? "admin-info-row--full" : ""}`.trim()}>
            <strong>{label}:</strong>{" "}
            <span className={mono ? "admin-mono" : ""}>{value || "—"}</span>
        </div>
    );
}

function PreviewImageCard({ title, src, alt, onOpen, onDownload }) {
    return (
        <div className="admin-preview-card">
            <div className="admin-preview-title">{title}</div>

            <div className="admin-preview-frame">
                {src ? (
                    <img src={src} alt={alt} />
                ) : (
                    <div className="admin-preview-empty">No image available</div>
                )}
            </div>

            <div className="admin-preview-actions">
                <Btn tone="ghost" onClick={onOpen} disabled={!src}>
                    Open
                </Btn>
                <Btn tone="ghost" onClick={onDownload} disabled={!src}>
                    Download
                </Btn>
            </div>
        </div>
    );
}

function FrontCardPreview({ order, onCopyText }) {
    const frontText = extractFrontText(order) || "No front text saved";
    const fontFamily = extractFontFamily(order) || "inherit";
    const fontWeight = normalizeFontWeight(extractFontWeight(order));
    const fontSize = normalizeFontSize(extractFontSize(order));
    const orientation = normalizeOrientation(extractOrientation(order));
    const styleKey = cleanString(order?.previewMeta?.styleKey || order?.preview?.styleKey);
    const theme = getCardTheme(order?.productKey, styleKey);

    const textColor = cleanString(extractTextColor(order)) || theme.defaultText;
    const isTag = cleanString(order?.productKey).toLowerCase() === "konartag";

    const shellStyle = {
        width: "100%",
        maxWidth: isTag ? 280 : 520,
        aspectRatio: isTag ? "1 / 1" : "1.75 / 1",
        borderRadius: isTag ? 28 : 24,
        border: theme.border,
        background: theme.background,
        boxShadow: "0 16px 40px rgba(15,23,42,0.18)",
        position: "relative",
        overflow: "hidden",
        padding: isTag ? 24 : 28,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        margin: "0 auto",
    };

    const stripeStyle = {
        position: "absolute",
        inset: 0,
        background:
            orientation === "vertical"
                ? `linear-gradient(90deg, transparent 0%, ${theme.accent} 50%, transparent 100%)`
                : `linear-gradient(180deg, transparent 0%, ${theme.accent} 50%, transparent 100%)`,
        opacity: 0.55,
        pointerEvents: "none",
    };

    const textWrapStyle = {
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: orientation === "vertical" ? "center" : "flex-start",
        justifyContent: orientation === "vertical" ? "center" : "flex-start",
        height: "100%",
    };

    const textStyle = {
        color: textColor,
        fontFamily,
        fontWeight,
        fontSize: `${Math.max(14, Math.min(fontSize, 38))}px`,
        lineHeight: 1.08,
        letterSpacing: "-0.02em",
        wordBreak: "break-word",
        maxWidth: orientation === "vertical" ? "80%" : "100%",
        textAlign: orientation === "vertical" ? "center" : "left",
        transform: orientation === "vertical" ? "rotate(-90deg)" : "none",
        transformOrigin: "center",
        whiteSpace: "pre-wrap",
    };

    const footerStyle = {
        position: "relative",
        zIndex: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 12,
        marginTop: 16,
        color: textColor,
        opacity: 0.92,
        fontSize: 12,
        fontWeight: 600,
    };

    return (
        <div className="admin-preview-card">
            <div className="admin-preview-title">Card front preview</div>

            <div
                className="admin-preview-frame"
                style={{
                    padding: 20,
                    background: "var(--admin-surface-soft)",
                }}
            >
                <div style={shellStyle}>
                    <div style={stripeStyle} />
                    <div style={textWrapStyle}>
                        <div style={textStyle}>{frontText}</div>
                    </div>

                    <div style={footerStyle}>
                        <span>{getProductLabel(order?.productKey)}</span>
                        <span>{styleKey || cleanString(order?.variant) || "standard"}</span>
                    </div>
                </div>
            </div>

            <div className="admin-preview-actions">
                <Btn
                    tone="ghost"
                    onClick={onCopyText}
                    disabled={!extractFrontText(order)}
                >
                    Copy text
                </Btn>
            </div>
        </div>
    );
}

function extractFrontText(order) {
    return cleanString(
        order?.customization?.frontText ||
        order?.preview?.customization?.frontText ||
        order?.preview?.frontText ||
        ""
    );
}

function extractFontFamily(order) {
    return cleanString(
        order?.customization?.fontFamily ||
        order?.preview?.customization?.fontFamily ||
        order?.preview?.fontFamily ||
        ""
    );
}

function extractFontWeight(order) {
    return cleanString(
        order?.customization?.fontWeight ||
        order?.preview?.customization?.fontWeight ||
        order?.preview?.fontWeight ||
        ""
    );
}

function extractFontSize(order) {
    return cleanString(
        order?.customization?.fontSize ||
        order?.preview?.customization?.fontSize ||
        order?.preview?.fontSize ||
        ""
    );
}

function extractTextColor(order) {
    return cleanString(
        order?.customization?.textColor ||
        order?.preview?.customization?.textColor ||
        order?.preview?.textColor ||
        ""
    );
}

function extractOrientation(order) {
    return cleanString(
        order?.customization?.orientation ||
        order?.preview?.customization?.orientation ||
        order?.preview?.orientation ||
        ""
    );
}

function extractPublicUrl(order) {
    return cleanString(
        order?.publicProfileUrl ||
        order?.preview?.publicProfileUrl ||
        (order?.profileSlug
            ? buildPublicProfileUrl(order.profileSlug)
            : order?.profile?.profile_slug
                ? buildPublicProfileUrl(order.profile.profile_slug)
                : "")
    );
}

function extractQrUrl(order) {
    return cleanString(
        order?.qrTargetUrl ||
        order?.preview?.qrTargetUrl ||
        appendVia(extractPublicUrl(order), "qr")
    );
}

function extractNfcUrl(order) {
    return cleanString(
        order?.nfcTargetUrl ||
        order?.preview?.nfcTargetUrl ||
        appendVia(extractPublicUrl(order), "nfc")
    );
}

async function downloadImageFromUrl(url, filename) {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(blobUrl);
}

async function copyToClipboardHelper(value, label = "Copied") {
    if (!navigator?.clipboard || !value) return false;

    try {
        await navigator.clipboard.writeText(value);
        toast.success(label);
        return true;
    } catch {
        toast.error("Could not copy");
        return false;
    }
}

export default function AdminOrders() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState("");
    const [orders, setOrders] = useState([]);

    const [orderSearch, setOrderSearch] = useState("");
    const [fulfillmentStatus, setFulfillmentStatus] = useState("");
    const [edit, setEdit] = useState({});

    const selectedOrderId = searchParams.get("selected") || "";

    function setEditField(id, field, value) {
        setEdit((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                [field]: value,
            },
        }));
    }

    function seedOrderEditBuffers(rows) {
        const next = {};
        for (const order of rows || []) {
            next[order._id] = {
                trackingUrl: order.trackingUrl || "",
                trackingCode: order.trackingCode || "",
                deliveryWindow: order.deliveryWindow || "",
                fulfillmentStatus: order.fulfillmentStatus || "order_placed",
                notifyTracking: true,
                notifyStatus: false,
            };
        }
        setEdit(next);
    }

    async function copyText(value, label = "Copied") {
        await copyToClipboardHelper(value, label);
    }

    async function loadOrders(queryOverride, statusOverride) {
        setOrdersLoading(true);
        setOrdersError("");

        try {
            const params = {};
            const finalSearch = typeof queryOverride === "string" ? queryOverride : orderSearch;
            const finalStatus =
                typeof statusOverride === "string" ? statusOverride : fulfillmentStatus;

            if (cleanString(finalSearch)) params.q = cleanString(finalSearch);
            if (cleanString(finalStatus)) params.fulfillmentStatus = cleanString(finalStatus);

            const res = await api.get("/api/admin/orders", { params });
            const data = Array.isArray(res?.data?.data) ? res.data.data : [];
            setOrders(data);
            seedOrderEditBuffers(data);
        } catch (e) {
            setOrdersError(e?.response?.data?.error || "Failed to load orders");
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    }

    async function saveTracking(order) {
        const buffer = edit[order._id] || {};

        try {
            await api.patch(`/api/admin/orders/${order._id}/tracking`, {
                trackingUrl: buffer.trackingUrl || "",
                trackingCode: buffer.trackingCode || "",
                deliveryWindow: buffer.deliveryWindow || "",
                notify: !!buffer.notifyTracking && !!buffer.trackingUrl,
            });

            toast.success("Tracking updated");
            await loadOrders();
        } catch (e) {
            toast.error(e?.response?.data?.error || "Failed to update tracking");
        }
    }

    async function saveStatus(order) {
        const buffer = edit[order._id] || {};

        try {
            await api.patch(`/api/admin/orders/${order._id}/status`, {
                fulfillmentStatus: buffer.fulfillmentStatus || "order_placed",
                notify: !!buffer.notifyStatus,
            });

            toast.success("Status updated");
            await loadOrders();
        } catch (e) {
            toast.error(e?.response?.data?.error || "Failed to update status");
        }
    }

    useEffect(() => {
        loadOrders("", "");
    }, []);

    const selectedOrder = useMemo(() => {
        if (!selectedOrderId) return null;
        return orders.find((order) => order._id === selectedOrderId) || null;
    }, [orders, selectedOrderId]);

    return (
        <AdminLayout>
            <header className="admin-page-header">
                <div className="admin-page-header-copy">
                    <p className="admin-page-kicker">KonarCard Admin</p>
                    <h1 className="admin-page-title">Orders</h1>
                    <p className="admin-page-subtitle">
                        Manage fulfilment, tracking, preview assets, QR targets,
                        and customer-ready order details.
                    </p>
                </div>

                <div className="admin-page-actions">
                    <Btn tone="ghost" onClick={() => loadOrders()}>
                        Refresh orders
                    </Btn>
                    <Btn tone="orange" onClick={() => navigate("/admin/users")}>
                        Open users
                    </Btn>
                </div>
            </header>

            <SectionCard
                title="Order fulfilment"
                subtitle="Search orders, update shipping progress, check card front styling, and view public, QR, and NFC target links."
            >
                <div className="admin-toolbar">
                    <TextInput
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Search by email, name, username, slug, order ID"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") loadOrders();
                        }}
                    />
                    <SelectInput
                        value={fulfillmentStatus}
                        onChange={(e) => setFulfillmentStatus(e.target.value)}
                    >
                        <option value="">Any fulfilment status</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </SelectInput>
                    <Btn tone="primary" onClick={() => loadOrders()}>
                        Apply
                    </Btn>
                    <Btn
                        tone="ghost"
                        onClick={() => {
                            setOrderSearch("");
                            setFulfillmentStatus("");
                            loadOrders("", "");
                        }}
                    >
                        Reset
                    </Btn>
                </div>

                {ordersLoading ? (
                    <p className="admin-muted admin-no-margin">Loading orders…</p>
                ) : ordersError ? (
                    <div className="admin-error-banner">{ordersError}</div>
                ) : orders.length === 0 ? (
                    <div className="admin-empty-state">No orders found.</div>
                ) : (
                    <div
                        className={selectedOrder ? "admin-grid-orders" : ""}
                        style={!selectedOrder ? { display: "grid", gap: 20 } : undefined}
                    >
                        <div className="admin-list-scroll" style={{ maxHeight: "75vh" }}>
                            {orders.map((order) => {
                                const isSelected = selectedOrderId === order._id;

                                return (
                                    <button
                                        key={order._id}
                                        type="button"
                                        className={`admin-order-card ${isSelected ? "is-selected" : ""}`.trim()}
                                        onClick={() => setSearchParams({ selected: order._id })}
                                    >
                                        <div className="admin-item-head">
                                            <div>
                                                <div className="admin-item-title">
                                                    {order.customerName ||
                                                        order?.user?.name ||
                                                        order.customerEmail ||
                                                        "Order"}
                                                </div>
                                                <div className="admin-item-subtitle">
                                                    {getProductLabel(order.productKey)}
                                                    {order.variant ? ` • ${order.variant}` : ""}
                                                </div>
                                            </div>

                                            <div className="admin-row">
                                                <Pill tone={getStatusTone(order.status)}>
                                                    {order.status || "pending"}
                                                </Pill>
                                                <Pill tone={getFulfillmentTone(order.fulfillmentStatus)}>
                                                    {order.fulfillmentStatus || "order_placed"}
                                                </Pill>
                                            </div>
                                        </div>

                                        <div className="admin-item-meta">
                                            <span>{formatAmount(order.amountTotal, order.currency)}</span>
                                            <span>Qty {order.quantity || 1}</span>
                                            <span>{formatDate(order.createdAt)}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedOrder ? (
                            <div className="admin-stack-lg">
                                <div className="admin-detail-card">
                                    <div className="admin-detail-head">
                                        <div>
                                            <div className="admin-row">
                                                <Pill tone={getStatusTone(selectedOrder.status)}>
                                                    {selectedOrder.status || "pending"}
                                                </Pill>
                                                <Pill tone={getFulfillmentTone(selectedOrder.fulfillmentStatus)}>
                                                    {selectedOrder.fulfillmentStatus || "order_placed"}
                                                </Pill>
                                                <Pill tone={getPlanTone(selectedOrder?.user?.plan)}>
                                                    {selectedOrder?.user?.plan || "free"}
                                                </Pill>
                                            </div>

                                            <div className="admin-detail-title admin-detail-title--lg admin-mt-12">
                                                {selectedOrder.customerName ||
                                                    selectedOrder?.user?.name ||
                                                    selectedOrder.customerEmail ||
                                                    "Order"}
                                            </div>

                                            <div className="admin-detail-subtitle">
                                                {selectedOrder.customerEmail ||
                                                    selectedOrder?.user?.email ||
                                                    "—"}
                                            </div>
                                        </div>

                                        <div className="admin-detail-actions">
                                            <Btn
                                                tone="ghost"
                                                onClick={() =>
                                                    copyText(selectedOrder._id, "Order ID copied")
                                                }
                                            >
                                                Copy order ID
                                            </Btn>

                                            {extractPublicUrl(selectedOrder) ? (
                                                <Btn
                                                    tone="ghost"
                                                    onClick={() =>
                                                        window.open(
                                                            extractPublicUrl(selectedOrder),
                                                            "_blank",
                                                            "noopener,noreferrer"
                                                        )
                                                    }
                                                >
                                                    Open profile
                                                </Btn>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="admin-info-grid">
                                        <InfoRow
                                            label="Product"
                                            value={getProductLabel(selectedOrder.productKey)}
                                        />
                                        <InfoRow
                                            label="Variant"
                                            value={selectedOrder.variant || "—"}
                                        />
                                        <InfoRow
                                            label="Amount"
                                            value={formatAmount(
                                                selectedOrder.amountTotal,
                                                selectedOrder.currency
                                            )}
                                        />
                                        <InfoRow
                                            label="Quantity"
                                            value={selectedOrder.quantity || 1}
                                        />
                                        <InfoRow
                                            label="Created"
                                            value={formatDate(selectedOrder.createdAt)}
                                        />
                                        <InfoRow
                                            label="Profile"
                                            value={
                                                selectedOrder.profileSlug ||
                                                selectedOrder.profile?.profile_slug ||
                                                "—"
                                            }
                                        />
                                        <InfoRow
                                            label="Public URL"
                                            value={extractPublicUrl(selectedOrder) || "—"}
                                            mono
                                        />
                                        <InfoRow
                                            label="QR target URL"
                                            value={extractQrUrl(selectedOrder) || "—"}
                                            mono
                                        />
                                        <InfoRow
                                            label="NFC target URL"
                                            value={extractNfcUrl(selectedOrder) || "—"}
                                            mono
                                        />
                                        <InfoRow
                                            label="Tracking URL"
                                            value={selectedOrder.trackingUrl || "—"}
                                            mono
                                        />
                                        <InfoRow
                                            label="Tracking code"
                                            value={selectedOrder.trackingCode || "—"}
                                        />
                                        <InfoRow
                                            label="ETA"
                                            value={selectedOrder.deliveryWindow || "—"}
                                        />
                                        <InfoRow
                                            label="Address"
                                            value={selectedOrder.deliveryAddress || "—"}
                                            full
                                        />
                                    </div>
                                </div>

                                <div
                                    className="admin-grid-preview"
                                    style={
                                        selectedOrder.previewImageUrl
                                            ? undefined
                                            : { gridTemplateColumns: "1fr" }
                                    }
                                >
                                    <FrontCardPreview
                                        order={selectedOrder}
                                        onCopyText={() =>
                                            copyText(
                                                extractFrontText(selectedOrder),
                                                "Front text copied"
                                            )
                                        }
                                    />

                                    {selectedOrder.previewImageUrl ? (
                                        <PreviewImageCard
                                            title="Saved flat preview"
                                            src={selectedOrder.previewImageUrl}
                                            alt="Saved order preview"
                                            onOpen={() => {
                                                if (selectedOrder.previewImageUrl) {
                                                    window.open(
                                                        selectedOrder.previewImageUrl,
                                                        "_blank",
                                                        "noopener,noreferrer"
                                                    );
                                                }
                                            }}
                                            onDownload={async () => {
                                                if (!selectedOrder.previewImageUrl) return;
                                                try {
                                                    await downloadImageFromUrl(
                                                        selectedOrder.previewImageUrl,
                                                        `${selectedOrder._id}-preview.png`
                                                    );
                                                    toast.success("Preview downloaded");
                                                } catch {
                                                    toast.error("Could not download preview");
                                                }
                                            }}
                                        />
                                    ) : null}
                                </div>

                                <div className="admin-grid-split">
                                    <SectionCard
                                        title="Customisation"
                                        subtitle="Use this when checking what should be printed on the card."
                                    >
                                        <div className="admin-info-grid">
                                            <InfoRow
                                                label="Front text"
                                                value={extractFrontText(selectedOrder) || "—"}
                                            />
                                            <InfoRow
                                                label="Orientation"
                                                value={extractOrientation(selectedOrder) || "—"}
                                            />
                                            <InfoRow
                                                label="Font family"
                                                value={extractFontFamily(selectedOrder) || "—"}
                                            />
                                            <InfoRow
                                                label="Font weight"
                                                value={extractFontWeight(selectedOrder) || "—"}
                                            />
                                            <InfoRow
                                                label="Font size"
                                                value={extractFontSize(selectedOrder) || "—"}
                                            />
                                            <InfoRow
                                                label="Text colour"
                                                value={extractTextColor(selectedOrder) || "—"}
                                            />
                                            <InfoRow
                                                label="Style key"
                                                value={
                                                    cleanString(
                                                        selectedOrder?.previewMeta?.styleKey ||
                                                        selectedOrder?.preview?.styleKey
                                                    ) || "—"
                                                }
                                            />
                                            <InfoRow
                                                label="Uses preset artwork"
                                                value={
                                                    selectedOrder?.previewMeta?.usesPresetArtwork ||
                                                        selectedOrder?.preview?.usesPresetArtwork
                                                        ? "Yes"
                                                        : "No"
                                                }
                                            />
                                        </div>
                                    </SectionCard>

                                    <SectionCard
                                        title="Quick actions"
                                        subtitle="Useful admin shortcuts for printing and support."
                                    >
                                        <div className="admin-stack">
                                            <Btn
                                                tone="ghost"
                                                onClick={() =>
                                                    copyText(
                                                        extractPublicUrl(selectedOrder),
                                                        "Public URL copied"
                                                    )
                                                }
                                                disabled={!extractPublicUrl(selectedOrder)}
                                            >
                                                Copy public URL
                                            </Btn>

                                            <Btn
                                                tone="ghost"
                                                onClick={() =>
                                                    copyText(
                                                        extractQrUrl(selectedOrder),
                                                        "QR target URL copied"
                                                    )
                                                }
                                                disabled={!extractQrUrl(selectedOrder)}
                                            >
                                                Copy QR target URL
                                            </Btn>

                                            <Btn
                                                tone="ghost"
                                                onClick={() =>
                                                    copyText(
                                                        extractNfcUrl(selectedOrder),
                                                        "NFC target URL copied"
                                                    )
                                                }
                                                disabled={!extractNfcUrl(selectedOrder)}
                                            >
                                                Copy NFC target URL
                                            </Btn>

                                            <Btn
                                                tone="ghost"
                                                onClick={() =>
                                                    copyText(
                                                        extractFrontText(selectedOrder),
                                                        "Front text copied"
                                                    )
                                                }
                                                disabled={!extractFrontText(selectedOrder)}
                                            >
                                                Copy front text
                                            </Btn>

                                            <Btn
                                                tone="ghost"
                                                onClick={() =>
                                                    copyText(
                                                        selectedOrder.customerEmail ||
                                                        selectedOrder?.user?.email,
                                                        "Customer email copied"
                                                    )
                                                }
                                                disabled={
                                                    !selectedOrder.customerEmail &&
                                                    !selectedOrder?.user?.email
                                                }
                                            >
                                                Copy customer email
                                            </Btn>

                                            <Btn
                                                tone="ghost"
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/users?selected=${selectedOrder.userId ||
                                                        selectedOrder.user?._id
                                                        }`
                                                    )
                                                }
                                                disabled={
                                                    !selectedOrder.userId &&
                                                    !selectedOrder.user?._id
                                                }
                                            >
                                                Open customer
                                            </Btn>
                                        </div>
                                    </SectionCard>
                                </div>

                                <div className="admin-grid-order-actions">
                                    <div className="admin-detail-card">
                                        <div className="admin-detail-title" style={{ fontSize: 16 }}>
                                            Tracking & shipping
                                        </div>

                                        <div className="admin-stack admin-mt-14">
                                            <TextInput
                                                placeholder="Tracking URL"
                                                value={edit[selectedOrder._id]?.trackingUrl || ""}
                                                onChange={(e) =>
                                                    setEditField(
                                                        selectedOrder._id,
                                                        "trackingUrl",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <TextInput
                                                placeholder="Tracking code"
                                                value={edit[selectedOrder._id]?.trackingCode || ""}
                                                onChange={(e) =>
                                                    setEditField(
                                                        selectedOrder._id,
                                                        "trackingCode",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <TextInput
                                                placeholder="Estimated delivery window"
                                                value={edit[selectedOrder._id]?.deliveryWindow || ""}
                                                onChange={(e) =>
                                                    setEditField(
                                                        selectedOrder._id,
                                                        "deliveryWindow",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            <label className="admin-check-row">
                                                <input
                                                    type="checkbox"
                                                    checked={!!edit[selectedOrder._id]?.notifyTracking}
                                                    onChange={(e) =>
                                                        setEditField(
                                                            selectedOrder._id,
                                                            "notifyTracking",
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                                Email customer tracking update
                                            </label>

                                            <Btn
                                                tone="primary"
                                                onClick={() => saveTracking(selectedOrder)}
                                            >
                                                Save tracking
                                            </Btn>
                                        </div>
                                    </div>

                                    <div className="admin-detail-card">
                                        <div className="admin-detail-title" style={{ fontSize: 16 }}>
                                            Fulfilment status
                                        </div>

                                        <div className="admin-stack admin-mt-14">
                                            <SelectInput
                                                value={
                                                    edit[selectedOrder._id]?.fulfillmentStatus ||
                                                    "order_placed"
                                                }
                                                onChange={(e) =>
                                                    setEditField(
                                                        selectedOrder._id,
                                                        "fulfillmentStatus",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {STATUS_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </SelectInput>

                                            <label className="admin-check-row">
                                                <input
                                                    type="checkbox"
                                                    checked={!!edit[selectedOrder._id]?.notifyStatus}
                                                    onChange={(e) =>
                                                        setEditField(
                                                            selectedOrder._id,
                                                            "notifyStatus",
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                                Email customer status update
                                            </label>

                                            <Btn
                                                tone="orange"
                                                onClick={() => saveStatus(selectedOrder)}
                                            >
                                                Save status
                                            </Btn>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </SectionCard>
        </AdminLayout>
    );
}