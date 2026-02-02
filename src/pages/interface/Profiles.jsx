// src/pages/interface/Profiles.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import "../../styling/dashboard/profiles.css";

import { useAuthUser } from "../../hooks/useAuthUser";
import {
    useMyProfiles,
    useCreateProfile,
    useDeleteProfile,
    useSetDefaultProfile,
} from "../../hooks/useBusinessCard";

import api from "../../services/api";

const TEMPLATE_OPTIONS = [
    { id: "template-1", name: "Template 1" },
    { id: "template-2", name: "Template 2" },
    { id: "template-3", name: "Template 3" },
    { id: "template-4", name: "Template 4" },
    { id: "template-5", name: "Template 5" },
];

/**
 * ✅ CHANGE THIS IF YOUR CHECKOUT ROUTE NAME IS DIFFERENT
 * This should create a Stripe checkout session for TEAMS.
 */
const TEAMS_CHECKOUT_ENDPOINT = "/api/checkout/teams";

const centerTrim = (v) => (v ?? "").toString().trim();
const safeLower = (v) => centerTrim(v).toLowerCase();

/**
 * ✅ Backend rule: ^[a-z0-9-]+$ (hyphen only)
 */
const normalizeSlug = (raw) => {
    return safeLower(raw)
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

export default function Profiles() {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ REAL plan from user model (fallback to free)
    const { data: authUser, refetch: refetchAuthUser } = useAuthUser();
    const plan = safeLower(authUser?.plan || "free"); // free | plus | teams
    const isTeams = plan === "teams";

    // ✅ list of profiles (multi-profile)
    const { data: cards, isLoading, isError, refetch } = useMyProfiles();

    // ✅ mutations
    const createProfile = useCreateProfile();
    const deleteProfile = useDeleteProfile();
    const setDefault = useSetDefaultProfile();

    const username = safeLower(authUser?.username || "").trim() || "yourname";

    const profiles = useMemo(() => {
        const xs = Array.isArray(cards) ? cards : [];

        return xs.map((c) => {
            const displayName =
                centerTrim(c.business_card_name) ||
                centerTrim(c.full_name) ||
                (c.profile_slug === "main" ? "Main Profile" : "Profile");

            const trade = centerTrim(c.job_title) || "Trade";

            const isComplete = Boolean(
                centerTrim(c.full_name) ||
                centerTrim(c.main_heading) ||
                centerTrim(c.business_card_name)
            );

            const updatedAtText = c.updatedAt
                ? `Updated ${new Date(c.updatedAt).toLocaleDateString()}`
                : "Updated recently";

            return {
                id: c._id,
                slug: c.profile_slug || "main",
                isDefault: !!c.is_default,
                templateId: c.template_id || "template-1",
                name: displayName,
                trade,
                status: isComplete ? "complete" : "incomplete",
                updatedAt: updatedAtText,
            };
        });
    }, [cards]);

    // Sort: default first
    const sortedProfiles = useMemo(() => {
        const xs = [...profiles];
        xs.sort((a, b) => {
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0;
        });
        return xs;
    }, [profiles]);

    const [selectedSlug, setSelectedSlug] = useState(null);

    useEffect(() => {
        if (!sortedProfiles.length) {
            setSelectedSlug(null);
            return;
        }
        const defaultOne = sortedProfiles.find((p) => p.isDefault) || sortedProfiles[0];
        setSelectedSlug((prev) => prev || defaultOne.slug);
    }, [sortedProfiles]);

    const selectedProfile = useMemo(() => {
        if (!sortedProfiles.length) return null;
        return sortedProfiles.find((p) => p.slug === selectedSlug) || sortedProfiles[0];
    }, [sortedProfiles, selectedSlug]);

    /**
     * ✅ RULES:
     * - Free/Plus: 1 profile
     * - Teams: multiple profiles (quantity controlled by Stripe)
     */
    const canCreateMoreProfilesWithoutCheckout = isTeams;

    // Templates:
    const templatesLocked = plan === "free";

    // Upgrade modal (kept)
    const [upgradeOpen, setUpgradeOpen] = useState(false);
    const [upgradeMode, setUpgradeMode] = useState("templates"); // templates | profiles
    const openUpgrade = (mode) => {
        setUpgradeMode(mode);
        setUpgradeOpen(true);
    };
    const closeUpgrade = () => setUpgradeOpen(false);

    const buildPublicUrl = (profileSlug) => {
        const s = safeLower(profileSlug);

        // default profile uses /u/:username
        if (!s || s === "main") return `${window.location.origin}/u/${username}`;

        // other profiles use /u/:username/:slug
        return `${window.location.origin}/u/${username}/${encodeURIComponent(s)}`;
    };

    const handleCopyLink = async () => {
        if (!selectedProfile) return;
        const link = buildPublicUrl(selectedProfile.slug);
        try {
            await navigator.clipboard.writeText(link);
            alert("Link copied ✅");
        } catch {
            alert("Copy failed — please copy manually: " + link);
        }
    };

    const handleShare = async () => {
        if (!selectedProfile) return;
        const link = buildPublicUrl(selectedProfile.slug);

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "My KonarCard Profile",
                    text: "Here’s my profile link:",
                    url: link,
                });
            } catch {
                // ignore cancel
            }
        } else {
            await handleCopyLink();
        }
    };

    const handleEdit = (slug) => {
        navigate(`/profiles/edit?slug=${encodeURIComponent(slug || "main")}`);
    };

    const handleVisit = (slug) => {
        window.open(buildPublicUrl(slug || "main"), "_blank", "noreferrer");
    };

    const handleDelete = async (slug) => {
        const ok = window.confirm("Delete this profile? This cannot be undone.");
        if (!ok) return;

        try {
            await deleteProfile.mutateAsync(slug);
            await refetch();
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || "Delete failed.";
            alert(msg);
        }
    };

    const handleSetDefault = async (slug) => {
        try {
            await setDefault.mutateAsync(slug);
            await refetch();
            setSelectedSlug(slug);
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || "Could not set default.";
            alert(msg);
        }
    };

    const handleTemplatePick = async (templateId) => {
        if (!selectedProfile) return;

        if (templatesLocked) {
            openUpgrade("templates");
            return;
        }

        try {
            localStorage.setItem(
                "kc_template_pick",
                JSON.stringify({
                    slug: selectedProfile.slug,
                    template_id: templateId,
                    t: Date.now(),
                })
            );
        } catch { }

        handleEdit(selectedProfile.slug);
    };

    /* =========================================================
         ✅ INLINE "CLAIM YOUR LINK" FLOW (NO REDIRECT)
    ========================================================= */

    const [claimOpen, setClaimOpen] = useState(false);
    const [claimSlugInput, setClaimSlugInput] = useState("");
    const [claimSlugNormalized, setClaimSlugNormalized] = useState("");
    const [claimStatus, setClaimStatus] = useState("idle");
    // idle | invalid | checking | available | taken | creating | created | subscribing | error
    const [claimMessage, setClaimMessage] = useState("");

    const desiredNewCount = Math.max(2, sortedProfiles.length + 1);

    const resetClaim = () => {
        setClaimSlugInput("");
        setClaimSlugNormalized("");
        setClaimStatus("idle");
        setClaimMessage("");
    };

    const openClaimPanel = () => {
        setClaimOpen(true);
        resetClaim();
    };

    const closeClaimPanel = () => {
        setClaimOpen(false);
        resetClaim();
    };

    const handleCreateButtonClick = () => {
        openClaimPanel();
    };

    const validateClaimSlug = (raw) => {
        const s = normalizeSlug(raw);
        if (!s || s.length < 3) {
            return { ok: false, slug: s, msg: "Slug must be at least 3 characters (a-z, 0-9, hyphen)." };
        }
        return { ok: true, slug: s, msg: "" };
    };

    /**
     * Check availability:
     * GET /api/business-card/public/:slug
     * - 404 => available
     * - 200 => taken
     */
    const checkSlugAvailability = async () => {
        const v = validateClaimSlug(claimSlugInput);
        setClaimSlugNormalized(v.slug);

        if (!v.ok) {
            setClaimStatus("invalid");
            setClaimMessage(v.msg);
            return;
        }

        setClaimStatus("checking");
        setClaimMessage("");

        try {
            const headers = { "x-no-auth": "1" };
            await api.get(`/api/business-card/public/${encodeURIComponent(v.slug)}`, { headers });

            setClaimStatus("taken");
            setClaimMessage("Sorry — that link is already taken. Try a different one.");
        } catch (err) {
            const status = err?.response?.status;

            if (status === 404) {
                setClaimStatus("available");
                setClaimMessage("Nice! That link is available ✅");
                return;
            }

            setClaimStatus("error");
            setClaimMessage(err?.response?.data?.error || "Could not check availability. Try again.");
        }
    };

    /**
     * If Teams: create profile immediately (POST /api/business-card/profiles).
     * If not Teams: start Teams checkout.
     */
    const createTeamsProfileNow = async () => {
        if (!isTeams) return;
        if (claimStatus !== "available") return;

        const slug = claimSlugNormalized || normalizeSlug(claimSlugInput);
        if (!slug) return;

        setClaimStatus("creating");
        setClaimMessage("");

        try {
            const created = await createProfile.mutateAsync({
                profile_slug: slug,
                template_id: "template-1",
                business_card_name: "",
            });

            await refetch();

            setClaimStatus("created");
            setClaimMessage("Profile created ✅ Redirecting to editor...");

            const createdSlug = created?.profile_slug || slug;

            setTimeout(() => {
                handleEdit(createdSlug);
            }, 400);
        } catch (e) {
            const code = e?.response?.data?.code;
            const msg = e?.response?.data?.error || e?.message || "Could not create profile.";

            if (code === "UPGRADE_REQUIRED") {
                setClaimStatus("available");
                setClaimMessage("Your plan needs Teams to add profiles. Click Subscribe now.");
                return;
            }

            setClaimStatus("error");
            setClaimMessage(msg);
        }
    };

    /**
     * ✅ FIXED:
     * Send claimedSlug to backend (required for webhook-created profile).
     */
    const startTeamsCheckout = async () => {
        if (claimStatus !== "available") return;

        const v = validateClaimSlug(claimSlugInput);
        if (!v.ok) {
            setClaimStatus("invalid");
            setClaimMessage(v.msg);
            return;
        }

        setClaimStatus("subscribing");
        setClaimMessage("");

        try {
            const res = await api.post(TEAMS_CHECKOUT_ENDPOINT, {
                claimedSlug: v.slug, // ✅ REQUIRED
                desiredQuantity: desiredNewCount,
            });

            const url =
                res?.data?.url || res?.data?.checkoutUrl || res?.data?.sessionUrl || res?.data?.redirectUrl;

            if (!url) {
                setClaimStatus("error");
                setClaimMessage("Checkout was created but no redirect URL was returned.");
                return;
            }

            window.location.href = url;
        } catch (e) {
            setClaimStatus("error");
            setClaimMessage(e?.response?.data?.error || e?.message || "Could not start checkout.");
        }
    };

    /**
     * Stripe return handler:
     * refresh user + profiles and clean query params.
     */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sessionId = params.get("session_id");
        const subscribed = params.get("subscribed");
        const paymentSuccess = params.get("payment_success");

        const isStripeReturn = !!sessionId || subscribed === "1" || paymentSuccess === "true";
        if (!isStripeReturn) return;

        (async () => {
            try {
                await refetchAuthUser?.();
            } catch { }

            try {
                await refetch?.();
            } catch { }

            // Clean URL
            try {
                const clean = new URL(window.location.href);
                clean.search = "";
                window.history.replaceState({}, document.title, clean.toString());
            } catch { }
        })();
    }, [location.search, refetch, refetchAuthUser]);

    if (isLoading) {
        return (
            <DashboardLayout title="Profiles" subtitle="Create, view, and manage your digital business card profiles.">
                <div style={{ minHeight: "40vh" }} />
            </DashboardLayout>
        );
    }

    if (isError) {
        return (
            <DashboardLayout
                title="Profiles"
                subtitle="Create, view, and manage your digital business card profiles."
                rightSlot={
                    <button type="button" className="profiles-btn profiles-btn-primary" onClick={() => refetch()}>
                        Retry
                    </button>
                }
            >
                <div className="profiles-shell">
                    <section className="profiles-card profiles-empty">
                        <h2 className="profiles-card-title">We couldn’t load your profiles</h2>
                        <p className="profiles-muted">Please try again. If this keeps happening, contact support.</p>
                    </section>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Profiles"
            subtitle="Create, view, and manage your digital business card profiles."
            rightSlot={
                <button type="button" className="profiles-btn profiles-btn-primary" onClick={handleCreateButtonClick}>
                    + Add Profile
                </button>
            }
        >
            <div className="profiles-shell">
                <div className="profiles-header">
                    <div>
                        <h1 className="profiles-title">Profiles</h1>
                        <p className="profiles-subtitle">
                            Profiles are your public digital business cards. Each profile has its own link you can share after every job.
                        </p>
                    </div>

                    <div className="profiles-header-meta">
                        <span className="profiles-pill">
                            Plan: <strong>{plan.toUpperCase()}</strong>
                        </span>
                        <span className="profiles-pill">
                            Profiles: <strong>{sortedProfiles.length}</strong> / <strong>{isTeams ? "∞" : 1}</strong>
                        </span>
                    </div>
                </div>

                {/* ✅ INLINE CLAIM PANEL (no redirect) */}
                {claimOpen && (
                    <section className="profiles-card" style={{ marginBottom: 16 }}>
                        <div className="profiles-card-head" style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                                <h2 className="profiles-card-title">Claim your link</h2>
                                <p className="profiles-muted" style={{ marginBottom: 0 }}>
                                    Choose the link your customers will visit. Example:{" "}
                                    <strong>
                                        {window.location.origin}/u/{username}/your-link
                                    </strong>
                                </p>
                            </div>

                            <button type="button" className="profiles-btn profiles-btn-ghost" onClick={closeClaimPanel}>
                                Close
                            </button>
                        </div>

                        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                                <input
                                    className="text-input"
                                    style={{ maxWidth: 320 }}
                                    value={claimSlugInput}
                                    onChange={(e) => {
                                        setClaimSlugInput(e.target.value);
                                        setClaimStatus("idle");
                                        setClaimMessage("");
                                    }}
                                    placeholder="e.g. plumbing-north-london"
                                />

                                <button
                                    type="button"
                                    className="profiles-btn profiles-btn-primary"
                                    onClick={checkSlugAvailability}
                                    disabled={
                                        claimStatus === "checking" || claimStatus === "subscribing" || claimStatus === "creating"
                                    }
                                >
                                    {claimStatus === "checking" ? "Checking..." : "Check availability"}
                                </button>

                                {claimStatus === "available" && (
                                    <div style={{ opacity: 0.85 }}>
                                        Available link:{" "}
                                        <strong>
                                            {window.location.origin}/u/{username}/{claimSlugNormalized || normalizeSlug(claimSlugInput)}
                                        </strong>
                                    </div>
                                )}
                            </div>

                            {claimMessage ? (
                                <div
                                    style={{
                                        padding: "10px 12px",
                                        borderRadius: 10,
                                        background: claimStatus === "available" ? "rgba(0,128,0,0.08)" : "rgba(0,0,0,0.04)",
                                        border: "1px solid rgba(0,0,0,0.08)",
                                    }}
                                >
                                    {claimMessage}
                                </div>
                            ) : null}

                            {/* Action buttons */}
                            {claimStatus === "available" && (
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    {canCreateMoreProfilesWithoutCheckout ? (
                                        <button
                                            type="button"
                                            className="profiles-btn profiles-btn-primary"
                                            onClick={createTeamsProfileNow}
                                            disabled={claimStatus === "creating"}
                                        >
                                            {claimStatus === "creating" ? "Creating..." : "Create profile"}
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className="profiles-btn profiles-btn-primary"
                                                onClick={startTeamsCheckout}
                                                disabled={claimStatus === "subscribing"}
                                            >
                                                {claimStatus === "subscribing" ? "Opening checkout..." : "Subscribe now (Teams)"}
                                            </button>

                                            <button
                                                type="button"
                                                className="profiles-btn profiles-btn-ghost"
                                                onClick={() => {
                                                    setClaimMessage(
                                                        "To add more profiles you need Teams. After checkout completes, come back here and click Create profile."
                                                    );
                                                }}
                                            >
                                                Why Teams?
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Small hint when user is Plus/Free */}
                            {!isTeams && (
                                <div className="profiles-muted" style={{ fontSize: 13 }}>
                                    Your current plan allows <strong>1 profile</strong>. Teams lets you add more profiles and links. When you
                                    subscribe, we’ll automatically update your account.
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {sortedProfiles.length === 0 ? (
                    <section className="profiles-card profiles-empty">
                        <h2 className="profiles-card-title">Create your first profile</h2>
                        <p className="profiles-muted">
                            Your profile is what customers see when they scan your KonarCard. Create it once — update it any time.
                        </p>

                        <div className="profiles-actions-row">
                            <button type="button" className="profiles-btn profiles-btn-primary" onClick={() => handleEdit("main")}>
                                Create your first profile
                            </button>
                        </div>

                        <div className="profiles-empty-preview" aria-hidden="true">
                            <div className="profiles-phone">
                                <div className="profiles-phone-top" />
                                <div className="profiles-phone-line" />
                                <div className="profiles-phone-line short" />
                                <div className="profiles-phone-block" />
                                <div className="profiles-phone-row">
                                    <div className="profiles-chip" />
                                    <div className="profiles-chip" />
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    <div className="profiles-grid">
                        {/* Left */}
                        <section className="profiles-card">
                            <div className="profiles-card-head">
                                <div>
                                    <h2 className="profiles-card-title">Profiles list</h2>
                                    <p className="profiles-muted">Select a profile to preview, edit, share or manage it.</p>
                                </div>
                            </div>

                            <div className="profiles-list">
                                {sortedProfiles.map((p) => (
                                    <button
                                        key={p.slug}
                                        type="button"
                                        className={`profiles-item ${selectedProfile?.slug === p.slug ? "active" : ""}`}
                                        onClick={() => setSelectedSlug(p.slug)}
                                    >
                                        <div className="profiles-item-left">
                                            <div className="profiles-avatar">{p.name?.slice(0, 1) || "P"}</div>
                                            <div className="profiles-item-meta">
                                                <div className="profiles-item-title">
                                                    {p.name} <span className="profiles-trade">• {p.trade}</span>
                                                </div>
                                                <div className="profiles-item-sub">
                                                    <span className="profiles-link">{p.isDefault ? "DEFAULT" : p.slug}</span>
                                                    <span className="profiles-dot">•</span>
                                                    <span className="profiles-muted">{p.updatedAt}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="profiles-item-right">
                                            <span className={`profiles-status ${p.status}`}>
                                                {p.status === "complete" ? "COMPLETE" : "INCOMPLETE"}
                                            </span>

                                            <div className="profiles-inline-actions">
                                                <button
                                                    type="button"
                                                    className="profiles-mini-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(p.slug);
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="profiles-mini-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleVisit(p.slug);
                                                    }}
                                                >
                                                    Visit
                                                </button>

                                                {!p.isDefault && (
                                                    <button
                                                        type="button"
                                                        className="profiles-mini-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSetDefault(p.slug);
                                                        }}
                                                    >
                                                        Set default
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="profiles-mini-btn danger"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(p.slug);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="profiles-under-list">
                                <div className="profiles-upsell-row">
                                    <div className="profiles-upsell-text">
                                        {isTeams ? (
                                            <>
                                                Teams plan: <strong>Create unlimited profiles</strong>.
                                            </>
                                        ) : (
                                            <>
                                                Want more profiles? <strong>Claim a link</strong> and then subscribe to <strong>Teams</strong>.
                                            </>
                                        )}
                                    </div>

                                    <button type="button" className="profiles-btn profiles-btn-primary" onClick={handleCreateButtonClick}>
                                        + Add profile
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Right */}
                        <section className="profiles-card">
                            <div className="profiles-card-head">
                                <div>
                                    <h2 className="profiles-card-title">Profile preview</h2>
                                    <p className="profiles-muted">A quick look at what customers see on mobile.</p>
                                </div>
                            </div>

                            <div className="profiles-preview">
                                <div className="profiles-phone">
                                    <div className="profiles-phone-top" />
                                    <div className="profiles-preview-name">{selectedProfile?.name || "Profile"}</div>
                                    <div className="profiles-preview-trade">{selectedProfile?.trade || "Trade"}</div>
                                    <div className="profiles-phone-line" />
                                    <div className="profiles-phone-line short" />
                                    <div className="profiles-phone-block" />
                                    <div className="profiles-phone-row">
                                        <div className="profiles-chip" />
                                        <div className="profiles-chip" />
                                    </div>
                                </div>

                                <div className="profiles-actions-row">
                                    <button
                                        type="button"
                                        className="profiles-btn profiles-btn-primary"
                                        onClick={() => handleEdit(selectedProfile?.slug)}
                                    >
                                        Edit profile
                                    </button>

                                    <button
                                        type="button"
                                        className="profiles-btn profiles-btn-ghost"
                                        onClick={() => handleVisit(selectedProfile?.slug)}
                                    >
                                        Visit
                                    </button>
                                </div>
                            </div>

                            <div className="profiles-actions-card">
                                <h3 className="profiles-actions-title">Profile actions</h3>
                                <div className="profiles-actions-row">
                                    <button type="button" className="profiles-btn profiles-btn-ghost" onClick={handleShare}>
                                        Share link
                                    </button>
                                    <button type="button" className="profiles-btn profiles-btn-ghost" onClick={handleCopyLink}>
                                        Copy link
                                    </button>
                                </div>
                            </div>

                            <div className="profiles-templates-card">
                                <div className="profiles-templates-head">
                                    <h3 className="profiles-actions-title">Templates</h3>
                                    <div className="profiles-templates-note">{templatesLocked ? "Upgrade to use templates" : "Pick a template"}</div>
                                </div>

                                <div className={`profiles-templates-grid ${templatesLocked ? "locked" : ""}`}>
                                    {TEMPLATE_OPTIONS.map((t) => {
                                        const isActive = selectedProfile?.templateId === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                className={`profiles-template ${isActive ? "active" : ""}`}
                                                onClick={() => handleTemplatePick(t.id)}
                                            >
                                                <div className="profiles-template-thumb" />
                                                <div className="profiles-template-name">{t.name}</div>
                                                {templatesLocked && <div className="profiles-template-lock">Locked</div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Existing upgrade modal (kept) */}
                {upgradeOpen && (
                    <div className="profiles-modal-overlay" role="dialog" aria-modal="true">
                        <div className="profiles-modal">
                            <button type="button" className="profiles-modal-x" onClick={closeUpgrade} aria-label="Close">
                                ✕
                            </button>

                            <div className="profiles-modal-badge">Upgrade required</div>

                            {upgradeMode === "templates" ? (
                                <>
                                    <h2 className="profiles-modal-title">Templates are a paid feature</h2>
                                    <p className="profiles-modal-sub">Upgrade your plan to unlock all 5 templates and make your profile stand out.</p>
                                </>
                            ) : (
                                <>
                                    <h2 className="profiles-modal-title">Add more profiles</h2>
                                    <p className="profiles-modal-sub">Subscribe to Teams to create multiple profiles and claim multiple links.</p>
                                </>
                            )}

                            <div className="profiles-modal-actions">
                                <button type="button" className="profiles-btn profiles-btn-primary" onClick={() => openClaimPanel()}>
                                    Claim a link
                                </button>
                                <button type="button" className="profiles-btn profiles-btn-ghost" onClick={closeUpgrade}>
                                    Not now
                                </button>
                            </div>

                            <div className="profiles-modal-fine">
                                Tip: Teams is what enables multiple profiles (billing controls how many profiles you can create).
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
