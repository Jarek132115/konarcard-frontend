// src/pages/interface/Profiles.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import "../../styling/dashboard/profiles.css";

import { useAuthUser } from "../../hooks/useAuthUser";
import { useMyProfiles, useCreateProfile, useDeleteProfile } from "../../hooks/useBusinessCard";
import api from "../../services/api";

const TEMPLATE_OPTIONS = [
    { id: "template-1", name: "Template 1" },
    { id: "template-2", name: "Template 2" },
    { id: "template-3", name: "Template 3" },
    { id: "template-4", name: "Template 4" },
    { id: "template-5", name: "Template 5" },
];

/**
 * This creates or updates Teams subscription (add profile via quantity).
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

    // ✅ User + plan
    const { data: authUser, refetch: refetchAuthUser } = useAuthUser();
    const plan = safeLower(authUser?.plan || "free"); // free | plus | teams
    const isTeams = plan === "teams";

    // ✅ Teams profile cap comes from Stripe entitlements stored on user
    // NOTE: after backend fix, teamsProfilesQty should be TOTAL allowed profiles (1 + extraProfilesQty)
    const teamsCap = Math.max(1, Number(authUser?.teamsProfilesQty || 1));
    const maxProfiles = isTeams ? teamsCap : 1;

    // ✅ list of profiles (multi-profile)
    const {
        data: cards,
        isLoading,
        isError,
        refetch: refetchProfiles,
    } = useMyProfiles();

    // ✅ mutations
    const createProfile = useCreateProfile();
    const deleteProfile = useDeleteProfile();

    const profiles = useMemo(() => {
        const xs = Array.isArray(cards) ? cards : [];

        return xs.map((c) => {
            const displayName =
                centerTrim(c.business_card_name) ||
                centerTrim(c.full_name) ||
                (c.profile_slug === "main" ? "Main Profile" : "Profile");

            const trade = centerTrim(c.job_title) || "Trade";

            const isComplete = Boolean(
                centerTrim(c.full_name) || centerTrim(c.main_heading) || centerTrim(c.business_card_name)
            );

            const updatedAtText = c.updatedAt
                ? `Updated ${new Date(c.updatedAt).toLocaleDateString()}`
                : "Updated recently";

            return {
                id: c._id,
                slug: c.profile_slug || "",
                templateId: c.template_id || "template-1",
                name: displayName,
                trade,
                status: isComplete ? "complete" : "incomplete",
                updatedAt: updatedAtText,
            };
        });
    }, [cards]);

    const sortedProfiles = useMemo(() => {
        const xs = [...profiles].filter((p) => !!p.slug);
        xs.sort((a, b) => a.slug.localeCompare(b.slug));
        return xs;
    }, [profiles]);

    const [selectedSlug, setSelectedSlug] = useState(null);

    useEffect(() => {
        if (!sortedProfiles.length) {
            setSelectedSlug(null);
            return;
        }
        setSelectedSlug((prev) => prev || sortedProfiles[0].slug);
    }, [sortedProfiles]);

    const selectedProfile = useMemo(() => {
        if (!sortedProfiles.length) return null;
        return sortedProfiles.find((p) => p.slug === selectedSlug) || sortedProfiles[0];
    }, [sortedProfiles, selectedSlug]);

    /**
     * ✅ RULES:
     * - Free: 1 profile + 1 template
     * - Plus: 1 profile + all templates
     * - Teams: up to teamsProfilesQty profiles
     */
    const canCreateMoreProfilesWithoutCheckout = isTeams && sortedProfiles.length < maxProfiles;

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

    /**
     * ✅ PUBLIC URL:
     * Every profile is GLOBAL at:
     *   /u/:slug
     */
    const buildPublicUrl = (profileSlug) => {
        const s = normalizeSlug(profileSlug);
        if (!s) return `${window.location.origin}/u/`;
        return `${window.location.origin}/u/${encodeURIComponent(s)}`;
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
        navigate(`/profiles/edit?slug=${encodeURIComponent(slug || "")}`);
    };

    const handleVisit = (slug) => {
        window.open(buildPublicUrl(slug || ""), "_blank", "noreferrer");
    };

    const handleDelete = async (slug) => {
        const ok = window.confirm("Delete this profile? This cannot be undone.");
        if (!ok) return;

        try {
            await deleteProfile.mutateAsync(slug);
            await refetchProfiles();
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || "Delete failed.";
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
          INLINE "CLAIM YOUR LINK" FLOW
    ========================================================= */

    const [claimOpen, setClaimOpen] = useState(false);
    const [claimSlugInput, setClaimSlugInput] = useState("");
    const [claimSlugNormalized, setClaimSlugNormalized] = useState("");
    const [claimStatus, setClaimStatus] = useState("idle");
    // idle | invalid | checking | available | taken | creating | created | subscribing | error
    const [claimMessage, setClaimMessage] = useState("");

    // next desired total (used for checkout/update)
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
        // If Teams user already at cap, explain clearly
        if (isTeams && sortedProfiles.length >= maxProfiles) {
            setClaimOpen(true);
            resetClaim();
            setClaimStatus("error");
            setClaimMessage(
                `You’re at your Teams limit (${sortedProfiles.length}/${maxProfiles}). Increase your Teams quantity to add more profiles.`
            );
            return;
        }
        openClaimPanel();
    };

    const validateClaimSlug = (raw) => {
        const s = normalizeSlug(raw);
        if (!s || s.length < 3) {
            return { ok: false, slug: s, msg: "Slug must be at least 3 characters (a-z, 0-9, hyphen)." };
        }
        // Avoid legacy reserved slug
        if (s === "main") {
            return { ok: false, slug: s, msg: "Please choose a real slug (not “main”)." };
        }
        return { ok: true, slug: s, msg: "" };
    };

    /**
     * ✅ Availability:
     * GET /api/business-card/slug-available/:slug
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
            const r = await api.get(`/api/business-card/slug-available/${encodeURIComponent(v.slug)}`, { headers });
            const available = !!r?.data?.available;

            if (available) {
                setClaimStatus("available");
                setClaimMessage("Nice! That link is available ✅");
            } else {
                setClaimStatus("taken");
                setClaimMessage("Sorry — that link is already taken. Try a different one.");
            }
        } catch (err) {
            setClaimStatus("error");
            setClaimMessage(err?.response?.data?.error || "Could not check availability. Try again.");
        }
    };

    /**
     * If Teams and within cap: create profile immediately.
     */
    const createTeamsProfileNow = async () => {
        if (!isTeams) return;
        if (claimStatus !== "available") return;

        if (sortedProfiles.length >= maxProfiles) {
            setClaimStatus("error");
            setClaimMessage(`You’re at your Teams limit (${sortedProfiles.length}/${maxProfiles}). Increase quantity to add more.`);
            return;
        }

        const slug = claimSlugNormalized || normalizeSlug(claimSlugInput);
        if (!slug) return;

        setClaimStatus("creating");
        setClaimMessage("");

        try {
            const createdResp = await createProfile.mutateAsync({
                profile_slug: slug,
                template_id: "template-1",
                business_card_name: "",
            });

            await refetchProfiles();

            setClaimStatus("created");
            setClaimMessage("Profile created ✅ Opening editor...");

            const createdSlug = createdResp?.profile_slug || createdResp?.data?.profile_slug || slug;

            setTimeout(() => {
                closeClaimPanel();
                handleEdit(createdSlug);
            }, 350);
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
     * Start Teams checkout (new sub) OR update existing sub (proration) depending on backend.
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
                claimedSlug: v.slug, // backend uses this to create profile via webhook
                desiredQuantity: desiredNewCount,
            });

            // If backend returned a checkout url -> redirect
            const url = res?.data?.url || res?.data?.checkoutUrl || res?.data?.sessionUrl || res?.data?.redirectUrl;

            if (url) {
                window.location.href = url;
                return;
            }

            // If backend updated subscription directly (no URL), refresh and wait for profile creation
            if (res?.data?.updated) {
                // This path covers: existing Teams user increasing quantity
                // Backend charges proration now; webhook updates entitlements
                // User still needs profile created:
                // - If backend created it via webhook path, it will appear shortly
                // - Otherwise user can click Create profile again
                setClaimMessage("Subscription updated ✅ Finishing setup...");
                await refetchAuthUser?.();
                await refetchProfiles();
                setClaimStatus("created");
                setTimeout(() => closeClaimPanel(), 600);
                return;
            }

            setClaimStatus("error");
            setClaimMessage("Checkout was created but no redirect URL was returned.");
        } catch (e) {
            setClaimStatus("error");
            setClaimMessage(e?.response?.data?.error || e?.message || "Could not start checkout.");
        }
    };

    /**
     * ✅ Stripe return handler (Teams add-profile flow)
     *
     * Backend successUrl:
     *   /profiles?checkout=success&slug=...&profiles=...&session_id=...
     *
     * We:
     *  - refetch user + profiles
     *  - poll a few times for webhook-created profile to appear
     *  - auto-select it when it does
     *  - clean URL
     */
    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const checkout = params.get("checkout"); // success | cancel
        const returnedSlug = normalizeSlug(params.get("slug") || "");
        const sessionId = params.get("session_id") || "";

        const isTeamsReturn = checkout === "success" && !!returnedSlug && !!sessionId;
        if (!isTeamsReturn) return;

        let cancelled = false;

        const run = async () => {
            setClaimOpen(false);
            setClaimStatus("idle");
            setClaimMessage("");

            for (let attempt = 0; attempt < 7; attempt++) {
                if (cancelled) return;

                try {
                    await refetchAuthUser?.();
                } catch { }

                try {
                    // IMPORTANT: refetchProfiles returns latest list (avoid stale `cards`)
                    const fresh = await refetchProfiles?.();
                    const freshCards = fresh?.data ?? fresh?.data?.data ?? null;

                    // But hooks differ; safest is to read from window by calling API directly if needed
                    // So: also check current cards state after refetch
                    const current = Array.isArray(cards) ? cards : [];
                    const found = current.find((c) => normalizeSlug(c?.profile_slug) === returnedSlug);

                    if (found) {
                        setSelectedSlug(returnedSlug);
                        break;
                    }
                } catch { }

                await new Promise((r) => setTimeout(r, 900));
            }

            // Clean URL
            try {
                const clean = new URL(window.location.href);
                clean.search = "";
                window.history.replaceState({}, document.title, clean.toString());
            } catch { }
        };

        run();

        return () => {
            cancelled = true;
        };
        // do not depend on `cards` (would loop)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, refetchProfiles, refetchAuthUser]);

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
                    <button type="button" className="profiles-btn profiles-btn-primary" onClick={() => refetchProfiles()}>
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
                            Profiles: <strong>{sortedProfiles.length}</strong> / <strong>{maxProfiles}</strong>
                        </span>
                    </div>
                </div>

                {/* INLINE CLAIM PANEL */}
                {claimOpen && (
                    <section className="profiles-card" style={{ marginBottom: 16 }}>
                        <div className="profiles-card-head" style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                                <h2 className="profiles-card-title">Claim your link</h2>
                                <p className="profiles-muted" style={{ marginBottom: 0 }}>
                                    Choose the link customers will visit. Example:{" "}
                                    <strong>
                                        {window.location.origin}/u/<span style={{ opacity: 0.9 }}>your-link</span>
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
                                    disabled={claimStatus === "checking" || claimStatus === "subscribing" || claimStatus === "creating"}
                                >
                                    {claimStatus === "checking" ? "Checking..." : "Check availability"}
                                </button>

                                {claimStatus === "available" && (
                                    <div style={{ opacity: 0.85 }}>
                                        Available link:{" "}
                                        <strong>
                                            {window.location.origin}/u/{claimSlugNormalized || normalizeSlug(claimSlugInput)}
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
                                                {claimStatus === "subscribing" ? "Opening checkout..." : "Subscribe / Update Teams to add it"}
                                            </button>

                                            <button
                                                type="button"
                                                className="profiles-btn profiles-btn-ghost"
                                                onClick={() => {
                                                    setClaimMessage(
                                                        "To add more profiles you need Teams (or higher Teams quantity). After checkout completes, we’ll auto-create the profile."
                                                    );
                                                }}
                                            >
                                                Why?
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}

                            {!isTeams && (
                                <div className="profiles-muted" style={{ fontSize: 13 }}>
                                    Your current plan allows <strong>1 profile</strong>. Plus unlocks templates. Teams unlocks multiple profiles.
                                </div>
                            )}

                            {isTeams && (
                                <div className="profiles-muted" style={{ fontSize: 13 }}>
                                    Teams cap is controlled by your subscription: <strong>{maxProfiles}</strong>. If you hit the limit, increase quantity.
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
                            <button type="button" className="profiles-btn profiles-btn-primary" onClick={() => handleEdit("")}>
                                Create your first profile
                            </button>
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
                                                    <span className="profiles-link">{p.slug}</span>
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
                                                Teams plan: <strong>{sortedProfiles.length}</strong> / <strong>{maxProfiles}</strong> profiles.
                                            </>
                                        ) : (
                                            <>
                                                Want more profiles? <strong>Teams</strong> lets you add more links.
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
                                    <div className="profiles-templates-note">
                                        {templatesLocked ? "Upgrade to use templates" : "Pick a template"}
                                    </div>
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

                {/* Upgrade modal */}
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
                                    <p className="profiles-modal-sub">Upgrade to unlock all 5 templates.</p>
                                </>
                            ) : (
                                <>
                                    <h2 className="profiles-modal-title">Add more profiles</h2>
                                    <p className="profiles-modal-sub">
                                        Subscribe to Teams (or increase quantity) to create more profiles and claim more links.
                                    </p>
                                </>
                            )}

                            <div className="profiles-modal-actions">
                                <button type="button" className="profiles-btn profiles-btn-primary" onClick={openClaimPanel}>
                                    Claim a link
                                </button>
                                <button type="button" className="profiles-btn profiles-btn-ghost" onClick={closeUpgrade}>
                                    Not now
                                </button>
                            </div>

                            <div className="profiles-modal-fine">Tip: Teams quantity controls how many profiles you can create.</div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
