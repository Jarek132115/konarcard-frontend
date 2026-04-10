// src/pages/admin/AdminUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";

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

function buildPublicProfileUrl(slug) {
    const safe = cleanString(slug).toLowerCase();
    return safe ? `https://www.konarcard.com/u/${encodeURIComponent(safe)}` : "";
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

function getPlanTone(plan) {
    const p = cleanString(plan).toLowerCase();
    if (p === "teams") return "info";
    if (p === "plus") return "success";
    return "neutral";
}

function getSubscriptionTone(status) {
    const s = cleanString(status).toLowerCase();
    if (s === "active" || s === "trialing") return "success";
    if (s === "past_due") return "warn";
    if (s === "canceled" || s === "cancelled") return "danger";
    return "neutral";
}

function getFulfillmentTone(status) {
    const s = cleanString(status).toLowerCase();
    if (s === "delivered") return "success";
    if (s === "shipped") return "info";
    if (s === "packaged" || s === "designing_card") return "warn";
    return "neutral";
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

function InfoGrid({ children }) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                gap: 12,
                fontSize: 14,
            }}
        >
            {children}
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div>
            <strong>{label}:</strong> {value || "—"}
        </div>
    );
}

export default function AdminUsers() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [usersLoading, setUsersLoading] = useState(false);
    const [selectedUserLoading, setSelectedUserLoading] = useState(false);

    const [usersError, setUsersError] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUserData, setSelectedUserData] = useState(null);

    const [userSearch, setUserSearch] = useState("");

    const selectedUserId = searchParams.get("selected") || "";

    async function copyText(value, label = "Copied") {
        if (!navigator?.clipboard || !value) return;
        try {
            await navigator.clipboard.writeText(value);
            toast.success(label);
        } catch {
            toast.error("Could not copy");
        }
    }

    async function loadUsers(searchOverride) {
        setUsersLoading(true);
        setUsersError("");

        try {
            const params = {};
            const finalSearch =
                typeof searchOverride === "string" ? searchOverride : userSearch;

            if (cleanString(finalSearch)) params.q = cleanString(finalSearch);

            const res = await api.get("/api/admin/users", { params });
            const data = Array.isArray(res?.data?.data) ? res.data.data : [];
            setUsers(data);
        } catch (e) {
            setUsersError(e?.response?.data?.error || "Failed to load users");
        } finally {
            setUsersLoading(false);
        }
    }

    async function loadUserDetails(userId) {
        if (!userId) {
            setSelectedUserData(null);
            return;
        }

        setSelectedUserLoading(true);

        try {
            const res = await api.get(`/api/admin/users/${userId}`);
            setSelectedUserData(res?.data?.data || null);
        } catch (e) {
            toast.error(e?.response?.data?.error || "Failed to load user details");
            setSelectedUserData(null);
        } finally {
            setSelectedUserLoading(false);
        }
    }

    useEffect(() => {
        loadUsers("");
    }, []);

    useEffect(() => {
        if (!selectedUserId) {
            setSelectedUserData(null);
            return;
        }

        loadUserDetails(selectedUserId);
    }, [selectedUserId]);

    const selectedUser = selectedUserData?.user || null;

    const selectedUserProfiles = useMemo(() => {
        const rows = selectedUserData?.profiles;
        return Array.isArray(rows) ? rows : [];
    }, [selectedUserData]);

    const selectedUserOrders = useMemo(() => {
        const rows = selectedUserData?.orders;
        return Array.isArray(rows) ? rows : [];
    }, [selectedUserData]);

    return (
        <AdminLayout>
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
                        Users
                    </h1>

                    <p
                        style={{
                            margin: "10px 0 0",
                            color: "#64748b",
                            fontSize: 15,
                        }}
                    >
                        Search users, inspect accounts, view profiles, subscriptions, and all purchased products.
                    </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Btn tone="ghost" onClick={() => loadUsers()}>
                        Refresh users
                    </Btn>
                    <Btn tone="orange" onClick={() => navigate("/admin/orders")}>
                        Open orders
                    </Btn>
                </div>
            </header>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "0.95fr 1.05fr",
                    gap: 20,
                }}
            >
                <SectionCard
                    title="All users"
                    subtitle="Search by email, name, username, or slug."
                    right={
                        <Btn tone="ghost" onClick={() => loadUsers()}>
                            Refresh
                        </Btn>
                    }
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(0,1fr) auto auto",
                            gap: 10,
                            marginBottom: 16,
                        }}
                    >
                        <TextInput
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Search by email, name, username or slug"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") loadUsers();
                            }}
                        />
                        <Btn tone="primary" onClick={() => loadUsers()}>
                            Search
                        </Btn>
                        <Btn
                            tone="ghost"
                            onClick={() => {
                                setUserSearch("");
                                loadUsers("");
                            }}
                        >
                            Reset
                        </Btn>
                    </div>

                    {usersLoading ? (
                        <p style={{ color: "#64748b", margin: 0 }}>Loading users…</p>
                    ) : usersError ? (
                        <p style={{ color: "#991b1b", margin: 0 }}>{usersError}</p>
                    ) : users.length === 0 ? (
                        <p style={{ color: "#64748b", margin: 0 }}>No users found.</p>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gap: 12,
                                maxHeight: 760,
                                overflow: "auto",
                                paddingRight: 4,
                            }}
                        >
                            {users.map((user) => {
                                const isSelected = selectedUserId === user._id;

                                return (
                                    <button
                                        key={user._id}
                                        type="button"
                                        onClick={() => setSearchParams({ selected: user._id })}
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
                                        <div style={{ fontWeight: 700, fontSize: 15 }}>
                                            {user.name || user.username || user.email || "User"}
                                        </div>

                                        <div
                                            style={{
                                                marginTop: 4,
                                                color: "#64748b",
                                                fontSize: 13,
                                            }}
                                        >
                                            {user.email || "—"}
                                        </div>

                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 8,
                                                flexWrap: "wrap",
                                                marginTop: 12,
                                            }}
                                        >
                                            <Pill tone={getPlanTone(user.plan)}>
                                                {user.plan || "free"}
                                            </Pill>
                                            <Pill tone={getSubscriptionTone(user.subscriptionStatus)}>
                                                {user.subscriptionStatus || "free"}
                                            </Pill>
                                            <Pill>{user.profileCount || 0} profiles</Pill>
                                            <Pill>{user.orderCount || 0} orders</Pill>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    title="User details"
                    subtitle="Inspect profile ownership, billing state, and order history."
                >
                    {!selectedUserId ? (
                        <p style={{ color: "#64748b", margin: 0 }}>
                            Select a user from the list to inspect their account.
                        </p>
                    ) : selectedUserLoading ? (
                        <p style={{ color: "#64748b", margin: 0 }}>Loading user details…</p>
                    ) : !selectedUser ? (
                        <p style={{ color: "#64748b", margin: 0 }}>No user details available.</p>
                    ) : (
                        <div style={{ display: "grid", gap: 20 }}>
                            <div
                                style={{
                                    borderRadius: 18,
                                    border: "1px solid rgba(15,23,42,0.08)",
                                    background: "#fff",
                                    padding: 18,
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
                                        <div style={{ fontWeight: 700, fontSize: 20 }}>
                                            {selectedUser.name ||
                                                selectedUser.username ||
                                                selectedUser.email ||
                                                "User"}
                                        </div>
                                        <div
                                            style={{
                                                color: "#64748b",
                                                marginTop: 6,
                                                fontSize: 14,
                                            }}
                                        >
                                            {selectedUser.email || "—"}
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        <Pill tone={getPlanTone(selectedUser.plan)}>
                                            {selectedUser.plan || "free"}
                                        </Pill>
                                        <Pill tone={getSubscriptionTone(selectedUser.subscriptionStatus)}>
                                            {selectedUser.subscriptionStatus || "free"}
                                        </Pill>
                                        <Pill>{selectedUser.role || "user"}</Pill>
                                    </div>
                                </div>

                                <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    <Btn
                                        tone="ghost"
                                        onClick={() =>
                                            copyText(selectedUser._id, "User ID copied")
                                        }
                                    >
                                        Copy user ID
                                    </Btn>

                                    <Btn
                                        tone="ghost"
                                        onClick={() =>
                                            copyText(selectedUser.email, "User email copied")
                                        }
                                        disabled={!selectedUser.email}
                                    >
                                        Copy email
                                    </Btn>

                                    <Btn
                                        tone="ghost"
                                        onClick={() => {
                                            const publicUrl =
                                                selectedUser.profileUrl ||
                                                buildPublicProfileUrl(selectedUser.slug || selectedUser.username);
                                            if (publicUrl) {
                                                window.open(publicUrl, "_blank", "noopener,noreferrer");
                                            }
                                        }}
                                        disabled={
                                            !selectedUser.profileUrl &&
                                            !selectedUser.slug &&
                                            !selectedUser.username
                                        }
                                    >
                                        Open public link
                                    </Btn>
                                </div>

                                <div style={{ marginTop: 18 }}>
                                    <InfoGrid>
                                        <InfoRow label="Username" value={selectedUser.username || "—"} />
                                        <InfoRow label="Slug" value={selectedUser.slug || "—"} />
                                        <InfoRow
                                            label="Verified"
                                            value={selectedUser.isVerified ? "Yes" : "No"}
                                        />
                                        <InfoRow
                                            label="Joined"
                                            value={formatDate(selectedUser.createdAt)}
                                        />
                                        <InfoRow
                                            label="Plan interval"
                                            value={selectedUser.planInterval || "—"}
                                        />
                                        <InfoRow
                                            label="Current period end"
                                            value={formatDate(selectedUser.currentPeriodEnd)}
                                        />
                                        <InfoRow
                                            label="Team profiles allowed"
                                            value={selectedUser.teamsProfilesQty || 1}
                                        />
                                        <InfoRow
                                            label="Paid extra profiles"
                                            value={selectedUser.extraProfilesQty || 0}
                                        />
                                        <InfoRow
                                            label="Stripe customer"
                                            value={selectedUser.stripeCustomerId || "—"}
                                        />
                                        <InfoRow
                                            label="Stripe subscription"
                                            value={selectedUser.stripeSubscriptionId || "—"}
                                        />
                                    </InfoGrid>
                                </div>
                            </div>

                            <div
                                style={{
                                    borderRadius: 18,
                                    border: "1px solid rgba(15,23,42,0.08)",
                                    background: "#fff",
                                    padding: 18,
                                }}
                            >
                                <h3 style={{ margin: 0, fontSize: 18 }}>Profiles</h3>

                                <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                                    {selectedUserProfiles.length === 0 ? (
                                        <p style={{ color: "#64748b", margin: 0 }}>No profiles found.</p>
                                    ) : (
                                        selectedUserProfiles.map((profile) => {
                                            const profileUrl =
                                                profile.publicUrl ||
                                                buildPublicProfileUrl(profile.profile_slug);

                                            return (
                                                <div
                                                    key={profile._id}
                                                    style={{
                                                        borderRadius: 16,
                                                        border: "1px solid rgba(15,23,42,0.08)",
                                                        padding: 14,
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 700 }}>
                                                        {profile.business_card_name ||
                                                            profile.business_name ||
                                                            profile.full_name ||
                                                            profile.profile_slug}
                                                    </div>

                                                    <div
                                                        style={{
                                                            color: "#64748b",
                                                            fontSize: 13,
                                                            marginTop: 6,
                                                        }}
                                                    >
                                                        /u/{profile.profile_slug}
                                                    </div>

                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: 10,
                                                            marginTop: 10,
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        <Btn
                                                            tone="ghost"
                                                            onClick={() =>
                                                                window.open(
                                                                    profileUrl,
                                                                    "_blank",
                                                                    "noopener,noreferrer"
                                                                )
                                                            }
                                                        >
                                                            Open profile
                                                        </Btn>

                                                        <Btn
                                                            tone="ghost"
                                                            onClick={() =>
                                                                copyText(profileUrl, "Profile link copied")
                                                            }
                                                        >
                                                            Copy link
                                                        </Btn>

                                                        <Btn
                                                            tone="ghost"
                                                            onClick={() =>
                                                                copyText(profile.profile_slug, "Profile slug copied")
                                                            }
                                                        >
                                                            Copy slug
                                                        </Btn>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div
                                style={{
                                    borderRadius: 18,
                                    border: "1px solid rgba(15,23,42,0.08)",
                                    background: "#fff",
                                    padding: 18,
                                }}
                            >
                                <h3 style={{ margin: 0, fontSize: 18 }}>Orders</h3>

                                <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                                    {selectedUserOrders.length === 0 ? (
                                        <p style={{ color: "#64748b", margin: 0 }}>No orders found.</p>
                                    ) : (
                                        selectedUserOrders.map((order) => (
                                            <div
                                                key={order._id}
                                                style={{
                                                    borderRadius: 16,
                                                    border: "1px solid rgba(15,23,42,0.08)",
                                                    padding: 14,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        gap: 12,
                                                        alignItems: "center",
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ fontWeight: 700 }}>
                                                            {order.productKey || "Product"}{" "}
                                                            {order.variant ? `• ${order.variant}` : ""}
                                                        </div>
                                                        <div
                                                            style={{
                                                                color: "#64748b",
                                                                fontSize: 13,
                                                                marginTop: 6,
                                                            }}
                                                        >
                                                            {formatAmount(order.amountTotal, order.currency)} • Qty{" "}
                                                            {order.quantity || 1}
                                                        </div>
                                                    </div>

                                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                        <Pill>{order.status || "pending"}</Pill>
                                                        <Pill tone={getFulfillmentTone(order.fulfillmentStatus)}>
                                                            {order.fulfillmentStatus || "order_placed"}
                                                        </Pill>
                                                    </div>
                                                </div>

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: 10,
                                                        marginTop: 12,
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <Btn
                                                        tone="ghost"
                                                        onClick={() => navigate(`/admin/orders?selected=${order._id}`)}
                                                    >
                                                        Open in orders
                                                    </Btn>

                                                    <Btn
                                                        tone="ghost"
                                                        onClick={() =>
                                                            copyText(order._id, "Order ID copied")
                                                        }
                                                    >
                                                        Copy order ID
                                                    </Btn>

                                                    {order.profile?.profile_slug ? (
                                                        <Btn
                                                            tone="ghost"
                                                            onClick={() =>
                                                                window.open(
                                                                    buildPublicProfileUrl(order.profile.profile_slug),
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
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </SectionCard>
            </div>
        </AdminLayout>
    );
}