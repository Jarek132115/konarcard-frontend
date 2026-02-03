// src/pages/interface/Profiles.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/profiles.css";

import { useAuthUser } from "../../hooks/useAuthUser";
import { useMyProfiles, useCreateProfile, useDeleteProfile } from "../../hooks/useBusinessCard";
import api from "../../services/api";

const TEAMS_CHECKOUT_ENDPOINT = "/api/checkout/teams";

const centerTrim = (v) => (v ?? "").toString().trim();
const safeLower = (v) => centerTrim(v).toLowerCase();

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
    const plan = safeLower(authUser?.plan || "free");
    const isTeams = plan === "teams";

    // ✅ Teams cap
    const teamsCap = Math.max(1, Number(authUser?.teamsProfilesQty || 1));
    const maxProfiles = isTeams ? teamsCap : 1;

    // ✅ list of profiles
    const { data: cards, isLoading, isError, refetch: refetchProfiles } = useMyProfiles();
    const createProfile = useCreateProfile();
    const deleteProfile = useDeleteProfile();

    // --- PageHeader flags ---
    const isMobile = typeof window !== "undefined" ? window.innerWidth <= 1000 : false;
    const isSmallMobile = typeof window !== "undefined" ? window.innerWidth <= 520 : false;

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

    const canCreateMoreProfilesWithoutCheckout = isTeams && sortedProfiles.length < maxProfiles;

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

    // =========================================================
    // Profile actions (right panel)
    // =========================================================
    const handleDownloadQr = async () => {
        if (!selectedProfile?.slug) return;

        // If you already have a backend endpoint, swap this to it.
        // For now we do a safe fallback: open the public page and let you screenshot/QR it later.
        alert("QR download endpoint not wired yet. Tell me your backend QR endpoint and I’ll connect it.");
    };

    const handleAddGoogleWallet = async () => {
        alert("Google Wallet not wired yet. If you have an endpoint/URL for pass creation, send it and I’ll connect it.");
    };

    const handleAddAppleWallet = async () => {
        alert("Apple Wallet not wired yet. If you have an endpoint/URL for pass creation, send it and I’ll connect it.");
    };

    /* =========================================================
          INLINE "CLAIM YOUR LINK" FLOW
    ========================================================= */
    const [claimOpen, setClaimOpen] = useState(false);
    const [claimSlugInput, setClaimSlugInput] = useState("");
    const [claimSlugNormalized, setClaimSlugNormalized] = useState("");
    const [claimStatus, setClaimStatus] = useState("idle");
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
        if (s === "main") {
            return { ok: false, slug: s, msg: "Please choose a real slug (not “main”)." };
        }
        return { ok: true, slug: s, msg: "" };
    };

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

    const createTeamsProfileNow = async () => {
        if (!isTeams) return;
        if (claimStatus !== "available") return;

        if (sortedProfiles.length >= maxProfiles) {
            setClaimStatus("error");
            setClaimMessage(
                `You’re at your Teams limit (${sortedProfiles.length}/${maxProfiles}). Increase quantity to add more.`
            );
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
            const msg = e?.response?.data?.error || e?.message || "Could not create profile.";
            setClaimStatus("error");
            setClaimMessage(msg);
        }
    };

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
                claimedSlug: v.slug,
                desiredQuantity: desiredNewCount,
            });

            const url = res?.data?.url || res?.data?.checkoutUrl || res?.data?.sessionUrl || res?.data?.redirectUrl;

            if (url) {
                window.location.href = url;
                return;
            }

            if (res?.data?.updated) {
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

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const checkout = params.get("checkout");
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
                    await refetchProfiles?.();

                    const current = Array.isArray(cards) ? cards : [];
                    const found = current.find((c) => normalizeSlug(c?.profile_slug) === returnedSlug);

                    if (found) {
                        setSelectedSlug(returnedSlug);
                        break;
                    }
                } catch { }

                await new Promise((r) => setTimeout(r, 900));
            }

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, refetchProfiles, refetchAuthUser]);

    if (isLoading) {
        return (
            <DashboardLayout title={null} subtitle={null}>
                <div className="profiles-shell">
                    <div className="profiles-skeleton">
                        <div className="profiles-skel-card" />
                        <div className="profiles-skel-card" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (isError) {
        return (
            <DashboardLayout
                title={null}
                subtitle={null}
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
            hideDesktopHeader
        >
            <div className="profiles-shell">
                <PageHeader
                    title="Profiles"
                    subtitle="Profiles are your public digital business cards. Each profile has its own link you can share after every job."
                    onShareCard={handleShare}
                    visitUrl={selectedProfile ? buildPublicUrl(selectedProfile.slug) : undefined}
                    onVisitPage={() => handleVisit(selectedProfile?.slug)}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                    rightSlot={
                        <div className="profiles-header-badges">
                            <span className="profiles-pill">
                                Plan: <strong>{plan.toUpperCase()}</strong>
                            </span>
                            <span className="profiles-pill">
                                Profiles: <strong>{sortedProfiles.length}</strong> / <strong>{maxProfiles}</strong>
                            </span>
                        </div>
                    }
                />

                {/* Claim panel */}
                {claimOpen && (
                    <section className="profiles-card profiles-claim">
                        <div className="profiles-card-head">
                            <div>
                                <h2 className="profiles-card-title">Claim your link</h2>
                                <p className="profiles-muted">
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

                        <div className="profiles-claim-grid">
                            <div className="profiles-claim-row">
                                <div className="profiles-input-wrap">
                                    <span className="profiles-input-prefix">{window.location.origin}/u/</span>
                                    <input
                                        className="text-input profiles-input"
                                        value={claimSlugInput}
                                        onChange={(e) => {
                                            setClaimSlugInput(e.target.value);
                                            setClaimStatus("idle");
                                            setClaimMessage("");
                                        }}
                                        placeholder="plumbing-north-london"
                                        aria-label="Profile slug"
                                    />
                                </div>

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
                            </div>

                            {claimMessage ? (
                                <div
                                    className={`profiles-alert ${claimStatus === "available"
                                            ? "success"
                                            : claimStatus === "error" || claimStatus === "invalid"
                                                ? "danger"
                                                : "neutral"
                                        }`}
                                >
                                    {claimMessage}
                                </div>
                            ) : null}

                            {claimStatus === "available" && (
                                <div className="profiles-claim-actions">
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
                                        <button
                                            type="button"
                                            className="profiles-btn profiles-btn-primary"
                                            onClick={startTeamsCheckout}
                                            disabled={claimStatus === "subscribing"}
                                        >
                                            {claimStatus === "subscribing" ? "Opening checkout..." : "Subscribe / Update Teams to add it"}
                                        </button>
                                    )}
                                </div>
                            )}

                            {!isTeams && (
                                <div className="profiles-hint">
                                    Your current plan allows <strong>1 profile</strong>. Teams unlocks multiple profiles.
                                </div>
                            )}

                            {isTeams && (
                                <div className="profiles-hint">
                                    Teams cap is controlled by your subscription: <strong>{maxProfiles}</strong>. If you hit the limit,
                                    increase quantity.
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
                        {/* LEFT */}
                        <section className="profiles-card profiles-list-card">
                            <div className="profiles-card-head">
                                <div>
                                    <h2 className="profiles-card-title">Profiles</h2>
                                    <p className="profiles-muted">Select a profile to preview, edit, share or manage it.</p>
                                </div>
                            </div>

                            <div className="profiles-list">
                                {sortedProfiles.map((p) => {
                                    const isActive = selectedProfile?.slug === p.slug;
                                    return (
                                        <button
                                            key={p.slug}
                                            type="button"
                                            className={`profiles-item ${isActive ? "active" : ""}`}
                                            onClick={() => setSelectedSlug(p.slug)}
                                        >
                                            <div className="profiles-item-left">
                                                <div className="profiles-avatar" aria-hidden="true">
                                                    {p.name?.slice(0, 1) || "P"}
                                                </div>

                                                <div className="profiles-item-meta">
                                                    <div className="profiles-item-title">
                                                        <span className="profiles-item-name">{p.name}</span>
                                                        <span className="profiles-trade">• {p.trade}</span>
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
                                    );
                                })}
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

                        {/* RIGHT */}
                        <aside className="profiles-right">
                            <section className="profiles-card profiles-preview-card">
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

                                    <div className="profiles-actions-grid">
                                        <button type="button" className="profiles-btn profiles-btn-ghost" onClick={handleShare}>
                                            Share link
                                        </button>

                                        <button type="button" className="profiles-btn profiles-btn-ghost" onClick={handleCopyLink}>
                                            Copy link
                                        </button>

                                        <button type="button" className="profiles-btn profiles-btn-ghost" onClick={handleDownloadQr}>
                                            Download QR code
                                        </button>

                                        <button type="button" className="profiles-btn profiles-btn-ghost" onClick={handleAddGoogleWallet}>
                                            Add to Google Wallet
                                        </button>

                                        <button type="button" className="profiles-btn profiles-btn-ghost" onClick={handleAddAppleWallet}>
                                            Add to Apple Wallet
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
