// src/pages/interface/Profiles.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import "../../styling/dashboard/profiles.css";

import { useAuthUser } from "../../hooks/useAuthUser";
import { useMyProfiles } from "../../hooks/useBusinessCard";

// ✅ IMPORTANT: use the service functions that actually exist
import { createMyProfile, deleteMyProfile, setDefaultProfile } from "../../services/businessCard";

const TEMPLATE_OPTIONS = [
    { id: "template-1", name: "Template 1" },
    { id: "template-2", name: "Template 2" },
    { id: "template-3", name: "Template 3" },
    { id: "template-4", name: "Template 4" },
    { id: "template-5", name: "Template 5" },
];

export default function Profiles() {
    const navigate = useNavigate();

    // ✅ REAL plan from user model (fallback to free)
    const { data: authUser } = useAuthUser();
    const plan = (authUser?.plan || "free").toLowerCase(); // free | plus | teams

    // ✅ list of profiles (multi-profile)
    const { data: cards, isLoading, isError, refetch } = useMyProfiles();

    const username = (authUser?.username || "").toLowerCase().trim() || "yourname";

    const profiles = useMemo(() => {
        const xs = Array.isArray(cards) ? cards : [];

        return xs.map((c) => {
            const displayName =
                (c.business_card_name || "").trim() ||
                (c.full_name || "").trim() ||
                (c.profile_slug === "main" ? "Main Profile" : "Profile");

            const trade = (c.job_title || "").trim() || "Trade";

            const isComplete = Boolean(
                (c.full_name || "").trim() ||
                (c.main_heading || "").trim() ||
                (c.business_card_name || "").trim()
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

    // ✅ Rules:
    // - Free: 1 profile, templates visible but locked (modal)
    // - Plus: allow extra profiles @ £1.95/mo each (we allow creation; billing wired later)
    // - Teams: unlimited profiles
    const isLimitReached = plan === "free" && sortedProfiles.length >= 1;

    // Templates:
    // - Free: show but locked (modal)
    const templatesLocked = plan === "free";

    // Modal
    const [upgradeOpen, setUpgradeOpen] = useState(false);
    const [upgradeMode, setUpgradeMode] = useState("templates"); // templates | profiles
    const openUpgrade = (mode) => {
        setUpgradeMode(mode);
        setUpgradeOpen(true);
    };
    const closeUpgrade = () => setUpgradeOpen(false);

    const buildPublicUrl = (_profileSlug) => {
        // ✅ Currently public route is /u/:username (default profile)
        // Later when you switch to /u/:username/:slug, update here.
        return `${window.location.origin}/u/${username}`;
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

    const handleCreate = async () => {
        if (isLimitReached) {
            openUpgrade("profiles");
            return;
        }

        // Create unique slug like profile-2, profile-3...
        const base = "profile";
        let n = sortedProfiles.length + 1;
        let candidate = `${base}-${n}`;
        const existing = new Set(sortedProfiles.map((p) => p.slug));
        while (existing.has(candidate)) {
            n += 1;
            candidate = `${base}-${n}`;
        }

        try {
            const created = await createMyProfile({
                profile_slug: candidate,
                template_id: "template-1",
                business_card_name: "",
            });

            await refetch();

            if (created?.profile_slug) {
                handleEdit(created.profile_slug);
            }
        } catch (e) {
            const msg =
                e?.response?.data?.error || e?.message || "Could not create profile. Please try again.";
            alert(msg);
        }
    };

    const handleDelete = async (slug) => {
        const ok = window.confirm("Delete this profile? This cannot be undone.");
        if (!ok) return;

        try {
            await deleteMyProfile(slug);
            await refetch();
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || "Delete failed.";
            alert(msg);
        }
    };

    const handleSetDefault = async (slug) => {
        try {
            await setDefaultProfile(slug);
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

        // store selection; editor can apply and save with FormData
        try {
            localStorage.setItem(
                "kc_template_pick",
                JSON.stringify({ slug: selectedProfile.slug, template_id: templateId, t: Date.now() })
            );
        } catch { }

        handleEdit(selectedProfile.slug);
    };

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
                <button
                    type="button"
                    className={`profiles-btn profiles-btn-primary ${isLimitReached ? "locked" : ""}`}
                    onClick={handleCreate}
                >
                    {isLimitReached ? "Upgrade to add profiles" : "+ Create New Profile"}
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
                            Profiles: <strong>{sortedProfiles.length}</strong> / <strong>{plan === "teams" ? "∞" : plan === "free" ? 1 : "∞"}</strong>
                        </span>
                    </div>
                </div>

                {sortedProfiles.length === 0 ? (
                    <section className="profiles-card profiles-empty">
                        <h2 className="profiles-card-title">Create your first profile</h2>
                        <p className="profiles-muted">
                            Your profile is what customers see when they scan your KonarCard. Create it once — update it any time.
                        </p>

                        <div className="profiles-actions-row">
                            <button type="button" className="profiles-btn profiles-btn-primary" onClick={handleCreate}>
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

                            {/* Under list upsell */}
                            <div className="profiles-under-list">
                                {plan === "free" ? (
                                    <div className="profiles-upsell-row">
                                        <div className="profiles-upsell-text">
                                            Want another profile? <strong>Upgrade to Teams</strong> to add more.
                                        </div>
                                        <button
                                            type="button"
                                            className="profiles-btn profiles-btn-primary"
                                            onClick={() => (window.location.href = "/subscription")}
                                        >
                                            Upgrade
                                        </button>
                                    </div>
                                ) : plan === "plus" ? (
                                    <div className="profiles-upsell-row">
                                        <div className="profiles-upsell-text">
                                            Add more profiles for <strong>£1.95 / month</strong> each.
                                        </div>
                                        <button type="button" className="profiles-btn profiles-btn-primary" onClick={handleCreate}>
                                            + Add profile
                                        </button>
                                    </div>
                                ) : (
                                    <div className="profiles-upsell-row">
                                        <div className="profiles-upsell-text">
                                            Teams plan: <strong>Unlimited profiles</strong>.
                                        </div>
                                        <button type="button" className="profiles-btn profiles-btn-primary" onClick={handleCreate}>
                                            + Add profile
                                        </button>
                                    </div>
                                )}
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
                                    <p className="profiles-modal-sub">
                                        Upgrade your plan to unlock all 5 templates and make your profile stand out.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="profiles-modal-title">Add more profiles</h2>
                                    <p className="profiles-modal-sub">
                                        Upgrade to Teams to create multiple profiles and claim multiple links.
                                    </p>
                                </>
                            )}

                            <div className="profiles-modal-actions">
                                <button
                                    type="button"
                                    className="profiles-btn profiles-btn-primary"
                                    onClick={() => (window.location.href = "/subscription")}
                                >
                                    Upgrade now
                                </button>
                                <button type="button" className="profiles-btn profiles-btn-ghost" onClick={closeUpgrade}>
                                    Not now
                                </button>
                            </div>

                            <div className="profiles-modal-fine">
                                Tip: On Plus, extra profiles are billed at <strong>£1.95/month</strong> each (we’ll wire billing next).
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
