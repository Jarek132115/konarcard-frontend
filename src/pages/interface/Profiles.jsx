import React, { useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import "../../styling/dashboard/profiles.css";

export default function Profiles() {
    // TEMP: replace with real API later
    const [plan] = useState("free"); // "free" | "plus" | "teams"

    const maxProfiles = plan === "teams" ? 999 : 1;

    const [profiles, setProfiles] = useState([
        {
            id: "p1",
            name: "Main Profile",
            trade: "Electrician",
            slug: "yourname",
            status: "complete", // "complete" | "incomplete"
            updatedAt: "Updated today",
        },
    ]);

    const [selectedId, setSelectedId] = useState(profiles[0]?.id || null);

    const selectedProfile = useMemo(
        () => profiles.find((p) => p.id === selectedId) || profiles[0] || null,
        [profiles, selectedId]
    );

    const canCreateNew = profiles.length < maxProfiles;

    const isLimitReached = !canCreateNew && plan !== "teams";

    const handleCreate = () => {
        // placeholder - later open create flow
        alert("Create profile flow (coming next)");
    };

    const handleDelete = (id) => {
        // placeholder
        const next = profiles.filter((p) => p.id !== id);
        setProfiles(next);
        if (selectedId === id) setSelectedId(next[0]?.id || null);
    };

    const handleCopyLink = async () => {
        if (!selectedProfile) return;
        const link = `${window.location.origin}/u/${selectedProfile.slug}`;
        try {
            await navigator.clipboard.writeText(link);
            alert("Link copied ✅");
        } catch {
            alert("Copy failed — please copy manually: " + link);
        }
    };

    const handleShare = async () => {
        if (!selectedProfile) return;
        const link = `${window.location.origin}/u/${selectedProfile.slug}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "My KonarCard Profile",
                    text: "Here’s my profile link:",
                    url: link,
                });
            } catch {
                // user cancelled share — ignore
            }
        } else {
            await handleCopyLink();
        }
    };

    return (
        <DashboardLayout
            title="Profiles"
            subtitle="Create, view, and manage your digital business card profiles."
            rightSlot={
                <button
                    type="button"
                    className={`profiles-btn profiles-btn-primary ${isLimitReached ? "locked" : ""
                        }`}
                    onClick={isLimitReached ? undefined : handleCreate}
                    disabled={isLimitReached}
                >
                    {isLimitReached ? "Locked" : "+ Create New Profile"}
                </button>
            }
        >
            <div className="profiles-shell">
                {/* 2. Page Header */}
                <div className="profiles-header">
                    <div>
                        <h1 className="profiles-title">Profiles</h1>
                        <p className="profiles-subtitle">
                            Profiles are your public digital business cards. Each profile has its
                            own link you can share after every job.
                        </p>
                    </div>

                    <div className="profiles-header-meta">
                        <span className="profiles-pill">
                            Plan: <strong>{plan.toUpperCase()}</strong>
                        </span>
                        <span className="profiles-pill">
                            Profiles: <strong>{profiles.length}</strong> /{" "}
                            <strong>{maxProfiles === 999 ? "∞" : maxProfiles}</strong>
                        </span>
                    </div>
                </div>

                {/* 7. Empty State (If No Profiles) */}
                {profiles.length === 0 ? (
                    <section className="profiles-card profiles-empty">
                        <h2 className="profiles-card-title">Create your first profile</h2>
                        <p className="profiles-muted">
                            Your profile is what customers see when they scan your KonarCard. Create
                            it once — update it any time.
                        </p>

                        <div className="profiles-actions-row">
                            <button
                                type="button"
                                className="profiles-btn profiles-btn-primary"
                                onClick={handleCreate}
                            >
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
                        {/* 3. Profiles List */}
                        <section className="profiles-card profiles-span-7">
                            <div className="profiles-card-head">
                                <div>
                                    <h2 className="profiles-card-title">Profiles list</h2>
                                    <p className="profiles-muted">
                                        Select a profile to preview, edit, share or manage it.
                                    </p>
                                </div>
                            </div>

                            <div className="profiles-list">
                                {profiles.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        className={`profiles-item ${selectedProfile?.id === p.id ? "active" : ""
                                            }`}
                                        onClick={() => setSelectedId(p.id)}
                                    >
                                        <div className="profiles-item-left">
                                            <div className="profiles-avatar">
                                                {p.name?.slice(0, 1) || "P"}
                                            </div>
                                            <div className="profiles-item-meta">
                                                <div className="profiles-item-title">
                                                    {p.name}{" "}
                                                    <span className="profiles-trade">• {p.trade}</span>
                                                </div>
                                                <div className="profiles-item-sub">
                                                    <span className="profiles-link">/u/{p.slug}</span>
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
                                                        alert("Edit profile (coming next)");
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="profiles-mini-btn danger"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(p.id);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 4. Profile Preview */}
                        <section className="profiles-card profiles-span-5">
                            <div className="profiles-card-head">
                                <div>
                                    <h2 className="profiles-card-title">Profile preview</h2>
                                    <p className="profiles-muted">
                                        A quick look at what customers see on mobile.
                                    </p>
                                </div>
                            </div>

                            <div className="profiles-preview">
                                <div className="profiles-phone">
                                    <div className="profiles-phone-top" />
                                    <div className="profiles-preview-name">
                                        {selectedProfile?.name || "Profile"}
                                    </div>
                                    <div className="profiles-preview-trade">
                                        {selectedProfile?.trade || "Trade"}
                                    </div>
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
                                        onClick={() => alert("Edit profile (coming next)")}
                                    >
                                        Edit profile
                                    </button>
                                </div>
                            </div>

                            {/* 6. Profile Actions */}
                            <div className="profiles-actions-card">
                                <h3 className="profiles-actions-title">Profile actions</h3>

                                <div className="profiles-actions-row">
                                    <button
                                        type="button"
                                        className="profiles-btn profiles-btn-ghost"
                                        onClick={handleShare}
                                    >
                                        Share link
                                    </button>

                                    <button
                                        type="button"
                                        className="profiles-btn profiles-btn-ghost"
                                        onClick={handleCopyLink}
                                    >
                                        Copy link
                                    </button>

                                    <button
                                        type="button"
                                        className="profiles-btn profiles-btn-ghost"
                                        onClick={() => alert("Analytics shortcut (coming next)")}
                                    >
                                        View analytics
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* 5. Add Profile (Teams Upsell) */}
                        <section className="profiles-card profiles-span-12">
                            <div className="profiles-add">
                                <div>
                                    <h2 className="profiles-card-title">Add another profile</h2>
                                    <p className="profiles-muted">
                                        Create multiple profiles (and claim multiple links) for staff or
                                        multiple businesses. This is a Teams feature.
                                    </p>
                                </div>

                                <div className="profiles-add-right">
                                    {isLimitReached ? (
                                        <>
                                            <div className="profiles-locked-note">
                                                You’ve reached your plan limit.
                                            </div>
                                            <button
                                                type="button"
                                                className="profiles-btn profiles-btn-primary"
                                                onClick={() => (window.location.href = "/subscription")}
                                            >
                                                Upgrade to Teams
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            className="profiles-btn profiles-btn-primary"
                                            onClick={handleCreate}
                                        >
                                            + Create profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
