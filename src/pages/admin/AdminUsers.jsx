// src/pages/admin/AdminUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useKonarToast } from "../../hooks/useKonarToast";
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

function InfoGrid({ children }) {
    return <div className="admin-info-grid">{children}</div>;
}

function InfoRow({ label, value, full = false, mono = false }) {
    return (
        <div className={`admin-info-row ${full ? "admin-info-row--full" : ""}`.trim()}>
            <strong>{label}:</strong>{" "}
            <span className={mono ? "admin-mono" : ""}>{value || "—"}</span>
        </div>
    );
}

export default function AdminUsers() {
    const toast    = useKonarToast();
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
            <header className="admin-page-header">
                <div className="admin-page-header-copy">
                    <p className="admin-page-kicker">KonarCard Admin</p>
                    <h1 className="admin-page-title">Users</h1>
                    <p className="admin-page-subtitle">
                        Search users, inspect accounts, view profiles, subscriptions,
                        and all purchased products.
                    </p>
                </div>

                <div className="admin-page-actions">
                    <Btn tone="ghost" onClick={() => loadUsers()}>
                        Refresh users
                    </Btn>
                    <Btn tone="orange" onClick={() => navigate("/admin/orders")}>
                        Open orders
                    </Btn>
                </div>
            </header>

            <div className="admin-grid-users">
                <SectionCard
                    title="All users"
                    subtitle="Search by email, name, username, or slug."
                    right={
                        <Btn tone="ghost" onClick={() => loadUsers()}>
                            Refresh
                        </Btn>
                    }
                >
                    <div className="admin-toolbar admin-toolbar--users">
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
                        <p className="admin-muted" style={{ margin: 0 }}>
                            Loading users…
                        </p>
                    ) : usersError ? (
                        <div className="admin-error-banner">{usersError}</div>
                    ) : users.length === 0 ? (
                        <div className="admin-empty-state">No users found.</div>
                    ) : (
                        <div className="admin-list-scroll">
                            {users.map((user) => {
                                const isSelected = selectedUserId === user._id;

                                return (
                                    <button
                                        key={user._id}
                                        type="button"
                                        className={`admin-user-card ${isSelected ? "is-selected" : ""}`.trim()}
                                        onClick={() => setSearchParams({ selected: user._id })}
                                    >
                                        <div className="admin-item-title">
                                            {user.name || user.username || user.email || "User"}
                                        </div>

                                        <div className="admin-item-subtitle">
                                            {user.email || "—"}
                                        </div>

                                        <div className="admin-row" style={{ marginTop: 12 }}>
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
                        <div className="admin-empty-state">
                            Select a user from the list to inspect their account.
                        </div>
                    ) : selectedUserLoading ? (
                        <p className="admin-muted" style={{ margin: 0 }}>
                            Loading user details…
                        </p>
                    ) : !selectedUser ? (
                        <div className="admin-empty-state">No user details available.</div>
                    ) : (
                        <div className="admin-stack-lg">
                            <div className="admin-detail-card">
                                <div className="admin-detail-head">
                                    <div>
                                        <div className="admin-detail-title">
                                            {selectedUser.name ||
                                                selectedUser.username ||
                                                selectedUser.email ||
                                                "User"}
                                        </div>
                                        <div className="admin-detail-subtitle">
                                            {selectedUser.email || "—"}
                                        </div>
                                    </div>

                                    <div className="admin-row">
                                        <Pill tone={getPlanTone(selectedUser.plan)}>
                                            {selectedUser.plan || "free"}
                                        </Pill>
                                        <Pill
                                            tone={getSubscriptionTone(
                                                selectedUser.subscriptionStatus
                                            )}
                                        >
                                            {selectedUser.subscriptionStatus || "free"}
                                        </Pill>
                                        <Pill>{selectedUser.role || "user"}</Pill>
                                    </div>
                                </div>

                                <div className="admin-detail-actions" style={{ marginTop: 14 }}>
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
                                                buildPublicProfileUrl(
                                                    selectedUser.slug || selectedUser.username
                                                );

                                            if (publicUrl) {
                                                window.open(
                                                    publicUrl,
                                                    "_blank",
                                                    "noopener,noreferrer"
                                                );
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
                                            mono
                                        />
                                        <InfoRow
                                            label="Stripe subscription"
                                            value={selectedUser.stripeSubscriptionId || "—"}
                                            mono
                                        />
                                    </InfoGrid>
                                </div>
                            </div>

                            <div className="admin-detail-card">
                                <div className="admin-detail-title" style={{ fontSize: 18 }}>
                                    Profiles
                                </div>

                                <div className="admin-stack" style={{ marginTop: 14 }}>
                                    {selectedUserProfiles.length === 0 ? (
                                        <div className="admin-empty-state">No profiles found.</div>
                                    ) : (
                                        selectedUserProfiles.map((profile) => {
                                            const profileUrl =
                                                profile.publicUrl ||
                                                buildPublicProfileUrl(profile.profile_slug);

                                            return (
                                                <div
                                                    key={profile._id}
                                                    className="admin-profile-card"
                                                >
                                                    <div className="admin-item-title">
                                                        {profile.business_card_name ||
                                                            profile.business_name ||
                                                            profile.full_name ||
                                                            profile.profile_slug}
                                                    </div>

                                                    <div className="admin-item-subtitle">
                                                        /u/{profile.profile_slug}
                                                    </div>

                                                    <div className="admin-detail-actions" style={{ marginTop: 10 }}>
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
                                                                copyText(
                                                                    profile.profile_slug,
                                                                    "Profile slug copied"
                                                                )
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

                            <div className="admin-detail-card">
                                <div className="admin-detail-title" style={{ fontSize: 18 }}>
                                    Orders
                                </div>

                                <div className="admin-stack" style={{ marginTop: 14 }}>
                                    {selectedUserOrders.length === 0 ? (
                                        <div className="admin-empty-state">No orders found.</div>
                                    ) : (
                                        selectedUserOrders.map((order) => (
                                            <div key={order._id} className="admin-order-card">
                                                <div className="admin-item-head">
                                                    <div>
                                                        <div className="admin-item-title">
                                                            {order.productKey || "Product"}
                                                            {order.variant
                                                                ? ` • ${order.variant}`
                                                                : ""}
                                                        </div>
                                                        <div className="admin-item-subtitle">
                                                            {formatAmount(
                                                                order.amountTotal,
                                                                order.currency
                                                            )}{" "}
                                                            • Qty {order.quantity || 1}
                                                        </div>
                                                    </div>

                                                    <div className="admin-row">
                                                        <Pill>{order.status || "pending"}</Pill>
                                                        <Pill
                                                            tone={getFulfillmentTone(
                                                                order.fulfillmentStatus
                                                            )}
                                                        >
                                                            {order.fulfillmentStatus ||
                                                                "order_placed"}
                                                        </Pill>
                                                    </div>
                                                </div>

                                                <div
                                                    className="admin-detail-actions"
                                                    style={{ marginTop: 12 }}
                                                >
                                                    <Btn
                                                        tone="ghost"
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/orders?selected=${order._id}`
                                                            )
                                                        }
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
                                                                    buildPublicProfileUrl(
                                                                        order.profile.profile_slug
                                                                    ),
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