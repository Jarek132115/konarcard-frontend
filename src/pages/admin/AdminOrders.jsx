import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";

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

function SectionCard({ title, subtitle, right, children }) {
    return (
        <section
            style={{
                background: "#fff",
                border: "1px solid rgba(15,23,42,0.08)",
                borderRadius: 24,
                padding: 24,
                boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    gap: 16,
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 18,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: 22,
                            lineHeight: 1.15,
                            color: "#0f172a",
                        }}
                    >
                        {title}
                    </h2>
                    {subtitle ? (
                        <p
                            style={{
                                margin: "8px 0 0",
                                color: "#64748b",
                                fontSize: 14,
                            }}
                        >
                            {subtitle}
                        </p>
                    ) : null}
                </div>
                {right ? <div>{right}</div> : null}
            </div>

            {children}
        </section>
    );
}

function Pill({ children, tone = "neutral" }) {
    const styles = {
        neutral: {
            background: "#f8fafc",
            border: "1px solid rgba(15,23,42,0.08)",
            color: "#334155",
        },
        success: {
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
        },
        warn: {
            background: "#fff7ed",
            border: "1px solid #fdba74",
            color: "#9a3412",
        },
        danger: {
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
        },
        info: {
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1d4ed8",
        },
    };

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 999,
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                ...styles[tone],
            }}
        >
            {children}
        </span>
    );
}

function Btn({ children, tone = "primary", ...props }) {
    const styles = {
        primary: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid #0f172a",
        },
        ghost: {
            background: "#fff",
            color: "#0f172a",
            border: "1px solid rgba(15,23,42,0.10)",
        },
        orange: {
            background: "#f97316",
            color: "#fff",
            border: "1px solid #f97316",
        },
    };

    return (
        <button
            {...props}
            style={{
                minHeight: 42,
                padding: "0 14px",
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 600,
                cursor: props.disabled ? "not-allowed" : "pointer",
                opacity: props.disabled ? 0.6 : 1,
                ...styles[tone],
                ...(props.style || {}),
            }}
        >
            {children}
        </button>
    );
}

function TextInput(props) {
    return (
        <input
            {...props}
            style={{
                width: "100%",
                minHeight: 44,
                borderRadius: 14,
                border: "1px solid rgba(15,23,42,0.10)",
                background: "#fff",
                padding: "0 14px",
                fontSize: 14,
                color: "#0f172a",
                outline: "none",
                ...(props.style || {}),
            }}
        />
    );
}

function SelectInput(props) {
    return (
        <select
            {...props}
            style={{
                width: "100%",
                minHeight: 44,
                borderRadius: 14,
                border: "1px solid rgba(15,23,42,0.10)",
                background: "#fff",
                padding: "0 14px",
                fontSize: 14,
                color: "#0f172a",
                outline: "none",
                ...(props.style || {}),
            }}
        />
    );
}

function InfoRow({ label, value }) {
    return (
        <div>
            <strong>{label}:</strong> {value || "—"}
        </div>
    );
}

function PreviewImageCard({ title, src, alt, onOpen, onDownload }) {
    return (
        <div
            style={{
                borderRadius: 18,
                border: "1px solid rgba(15,23,42,0.08)",
                background: "#fff",
                padding: 14,
                display: "grid",
                gap: 12,
            }}
        >
            <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>

            <div
                style={{
                    borderRadius: 16,
                    border: "1px solid rgba(15,23,42,0.08)",
                    background: "#f8fafc",
                    minHeight: 220,
                    display: "grid",
                    placeItems: "center",
                    overflow: "hidden",
                }}
            >
                {src ? (
                    <img
                        src={src}
                        alt={alt}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            maxHeight: 360,
                            display: "block",
                        }}
                    />
                ) : (
                    <div style={{ color: "#94a3b8", fontSize: 14 }}>No image available</div>
                )}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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

function extractFrontText(order) {
    return cleanString(
        order?.preview?.customization?.frontText ||
        order?.preview?.frontText ||
        ""
    );
}

function extractFontFamily(order) {
    return cleanString(
        order?.preview?.customization?.fontFamily ||
        order?.preview?.fontFamily ||
        ""
    );
}

function extractFontWeight(order) {
    return cleanString(
        order?.preview?.customization?.fontWeight ||
        order?.preview?.fontWeight ||
        ""
    );
}

function extractFontSize(order) {
    return cleanString(
        order?.preview?.customization?.fontSize ||
        order?.preview?.fontSize ||
        ""
    );
}

function extractTextColor(order) {
    return cleanString(
        order?.preview?.customization?.textColor ||
        order?.preview?.textColor ||
        ""
    );
}

function extractOrientation(order) {
    return cleanString(
        order?.preview?.customization?.orientation ||
        order?.preview?.orientation ||
        ""
    );
}

function extractQrUrl(order) {
    return cleanString(
        order?.preview?.publicProfileUrl ||
        (order?.profile?.profile_slug ? buildPublicProfileUrl(order.profile.profile_slug) : "")
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
        if (!navigator?.clipboard || !value) return;
        try {
            await navigator.clipboard.writeText(value);
            toast.success(label);
        } catch {
            toast.error("Could not copy");
        }
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
        <>
            <header
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <p
                        style={{
                            margin: 0,
                            color: "#f97316",
                            fontWeight: 700,
                            fontSize: 13,
                            letterSpacing: "0.02em",
                            textTransform: "uppercase",
                        }}
                    >
                        KonarCard Admin
                    </p>

                    <h1
                        style={{
                            margin: "8px 0 0",
                            fontSize: 34,
                            lineHeight: 1.05,
                            color: "#0f172a",
                        }}
                    >
                        Orders
                    </h1>

                    <p
                        style={{
                            margin: "10px 0 0",
                            color: "#64748b",
                            fontSize: 15,
                        }}
                    >
                        Manage fulfilment, tracking, preview assets, QR targets, and customer-ready order details.
                    </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
                subtitle="Search orders, update shipping progress, open print assets, and view customer customisation."
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0,1fr) 220px auto auto",
                        gap: 10,
                        marginBottom: 18,
                    }}
                >
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
                    <p style={{ color: "#64748b", margin: 0 }}>Loading orders…</p>
                ) : ordersError ? (
                    <p style={{ color: "#991b1b", margin: 0 }}>{ordersError}</p>
                ) : orders.length === 0 ? (
                    <p style={{ color: "#64748b", margin: 0 }}>No orders found.</p>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: selectedOrder ? "0.78fr 1.22fr" : "1fr",
                            gap: 20,
                        }}
                    >
                        <div style={{ display: "grid", gap: 14, maxHeight: "75vh", overflow: "auto", paddingRight: 4 }}>
                            {orders.map((order) => {
                                const isSelected = selectedOrderId === order._id;

                                return (
                                    <button
                                        key={order._id}
                                        type="button"
                                        onClick={() => setSearchParams({ selected: order._id })}
                                        style={{
                                            width: "100%",
                                            textAlign: "left",
                                            borderRadius: 18,
                                            border: isSelected
                                                ? "1px solid #f97316"
                                                : "1px solid rgba(15,23,42,0.08)",
                                            background: isSelected ? "#fff7ed" : "#fff",
                                            padding: 16,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 12,
                                                alignItems: "flex-start",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 15 }}>
                                                    {order.customerName || order?.user?.name || order.customerEmail || "Order"}
                                                </div>
                                                <div style={{ marginTop: 4, color: "#64748b", fontSize: 13 }}>
                                                    {getProductLabel(order.productKey)}
                                                    {order.variant ? ` • ${order.variant}` : ""}
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                <Pill tone={getStatusTone(order.status)}>
                                                    {order.status || "pending"}
                                                </Pill>
                                                <Pill tone={getFulfillmentTone(order.fulfillmentStatus)}>
                                                    {order.fulfillmentStatus || "order_placed"}
                                                </Pill>
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 12,
                                                marginTop: 12,
                                                flexWrap: "wrap",
                                                fontSize: 13,
                                                color: "#64748b",
                                            }}
                                        >
                                            <span>{formatAmount(order.amountTotal, order.currency)}</span>
                                            <span>Qty {order.quantity || 1}</span>
                                            <span>{formatDate(order.createdAt)}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedOrder ? (
                            <div style={{ display: "grid", gap: 18 }}>
                                <div
                                    style={{
                                        borderRadius: 20,
                                        border: "1px solid rgba(15,23,42,0.08)",
                                        background: "#fff",
                                        padding: 18,
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 14,
                                            alignItems: "flex-start",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
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

                                            <h3 style={{ margin: "12px 0 0", fontSize: 22 }}>
                                                {selectedOrder.customerName || selectedOrder?.user?.name || selectedOrder.customerEmail || "Order"}
                                            </h3>

                                            <div style={{ marginTop: 6, color: "#64748b", fontSize: 14 }}>
                                                {selectedOrder.customerEmail || selectedOrder?.user?.email || "—"}
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                            <Btn
                                                tone="ghost"
                                                onClick={() => copyText(selectedOrder._id, "Order ID copied")}
                                            >
                                                Copy order ID
                                            </Btn>

                                            {selectedOrder.profile?.profile_slug ? (
                                                <Btn
                                                    tone="ghost"
                                                    onClick={() =>
                                                        window.open(
                                                            buildPublicProfileUrl(selectedOrder.profile.profile_slug),
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

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                                            gap: 12,
                                            marginTop: 18,
                                            fontSize: 14,
                                        }}
                                    >
                                        <InfoRow
                                            label="Product"
                                            value={getProductLabel(selectedOrder.productKey)}
                                        />
                                        <InfoRow label="Variant" value={selectedOrder.variant || "—"} />
                                        <InfoRow
                                            label="Amount"
                                            value={formatAmount(selectedOrder.amountTotal, selectedOrder.currency)}
                                        />
                                        <InfoRow label="Quantity" value={selectedOrder.quantity || 1} />
                                        <InfoRow label="Created" value={formatDate(selectedOrder.createdAt)} />
                                        <InfoRow
                                            label="Profile"
                                            value={selectedOrder.profile?.profile_slug || "—"}
                                        />
                                        <InfoRow
                                            label="Tracking URL"
                                            value={selectedOrder.trackingUrl || "—"}
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
                                            label="QR target URL"
                                            value={extractQrUrl(selectedOrder) || "—"}
                                        />
                                        <div style={{ gridColumn: "1 / -1" }}>
                                            <strong>Address:</strong> {selectedOrder.deliveryAddress || "—"}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                                        gap: 16,
                                    }}
                                >
                                    <PreviewImageCard
                                        title="Flat order preview"
                                        src={selectedOrder.previewImageUrl}
                                        alt="Order preview"
                                        onOpen={() => {
                                            if (selectedOrder.previewImageUrl) {
                                                window.open(selectedOrder.previewImageUrl, "_blank", "noopener,noreferrer");
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

                                    <PreviewImageCard
                                        title="Uploaded logo"
                                        src={selectedOrder.logoUrl}
                                        alt="Uploaded logo"
                                        onOpen={() => {
                                            if (selectedOrder.logoUrl) {
                                                window.open(selectedOrder.logoUrl, "_blank", "noopener,noreferrer");
                                            }
                                        }}
                                        onDownload={async () => {
                                            if (!selectedOrder.logoUrl) return;
                                            try {
                                                await downloadImageFromUrl(
                                                    selectedOrder.logoUrl,
                                                    `${selectedOrder._id}-logo.png`
                                                );
                                                toast.success("Logo downloaded");
                                            } catch {
                                                toast.error("Could not download logo");
                                            }
                                        }}
                                    />
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                                        gap: 16,
                                    }}
                                >
                                    <SectionCard
                                        title="Customisation"
                                        subtitle="Use this when checking what should be printed on the card."
                                    >
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                                                gap: 12,
                                                fontSize: 14,
                                            }}
                                        >
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
                                                value={cleanString(selectedOrder?.preview?.styleKey) || "—"}
                                            />
                                            <InfoRow
                                                label="Uses preset artwork"
                                                value={selectedOrder?.preview?.usesPresetArtwork ? "Yes" : "No"}
                                            />
                                        </div>
                                    </SectionCard>

                                    <SectionCard
                                        title="Quick actions"
                                        subtitle="Useful admin shortcuts for printing and support."
                                    >
                                        <div style={{ display: "grid", gap: 10 }}>
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
                                                        selectedOrder.customerEmail || selectedOrder?.user?.email,
                                                        "Customer email copied"
                                                    )
                                                }
                                                disabled={!selectedOrder.customerEmail && !selectedOrder?.user?.email}
                                            >
                                                Copy customer email
                                            </Btn>

                                            <Btn
                                                tone="ghost"
                                                onClick={() => navigate(`/admin/users?selected=${selectedOrder.userId}`)}
                                                disabled={!selectedOrder.userId}
                                            >
                                                Open customer
                                            </Btn>
                                        </div>
                                    </SectionCard>
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                                        gap: 16,
                                    }}
                                >
                                    <div
                                        style={{
                                            borderRadius: 16,
                                            border: "1px solid rgba(15,23,42,0.08)",
                                            padding: 16,
                                            background: "#fff",
                                        }}
                                    >
                                        <h4 style={{ margin: 0, fontSize: 16 }}>Tracking & shipping</h4>

                                        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                                            <TextInput
                                                placeholder="Tracking URL"
                                                value={edit[selectedOrder._id]?.trackingUrl || ""}
                                                onChange={(e) =>
                                                    setEditField(selectedOrder._id, "trackingUrl", e.target.value)
                                                }
                                            />
                                            <TextInput
                                                placeholder="Tracking code"
                                                value={edit[selectedOrder._id]?.trackingCode || ""}
                                                onChange={(e) =>
                                                    setEditField(selectedOrder._id, "trackingCode", e.target.value)
                                                }
                                            />
                                            <TextInput
                                                placeholder="Estimated delivery window"
                                                value={edit[selectedOrder._id]?.deliveryWindow || ""}
                                                onChange={(e) =>
                                                    setEditField(selectedOrder._id, "deliveryWindow", e.target.value)
                                                }
                                            />

                                            <label
                                                style={{
                                                    display: "flex",
                                                    gap: 10,
                                                    alignItems: "center",
                                                    fontSize: 14,
                                                    color: "#475569",
                                                }}
                                            >
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

                                            <Btn tone="primary" onClick={() => saveTracking(selectedOrder)}>
                                                Save tracking
                                            </Btn>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            borderRadius: 16,
                                            border: "1px solid rgba(15,23,42,0.08)",
                                            padding: 16,
                                            background: "#fff",
                                        }}
                                    >
                                        <h4 style={{ margin: 0, fontSize: 16 }}>Fulfilment status</h4>

                                        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                                            <SelectInput
                                                value={edit[selectedOrder._id]?.fulfillmentStatus || "order_placed"}
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

                                            <label
                                                style={{
                                                    display: "flex",
                                                    gap: 10,
                                                    alignItems: "center",
                                                    fontSize: 14,
                                                    color: "#475569",
                                                }}
                                            >
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

                                            <Btn tone="orange" onClick={() => saveStatus(selectedOrder)}>
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
        </>
    );
}