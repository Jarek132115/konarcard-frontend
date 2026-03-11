import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/profiles.css";

import { useAuthUser } from "../../hooks/useAuthUser";
import { useMyProfiles, useCreateProfile, useDeleteProfile } from "../../hooks/useBusinessCard";
import api from "../../services/api";

import CopyLinkIcon from "../../assets/icons/CopyLink.svg";

const TEAMS_CHECKOUT_ENDPOINT = "/api/checkout/teams";

const centerTrim = (v) => (v ?? "").toString().trim();
const safeLower = (v) => centerTrim(v).toLowerCase();

const normalizeSlug = (raw) =>
    safeLower(raw)
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

const calcCompletionPct = (c) => {
    const checks = [
        !!centerTrim(c?.business_card_name || c?.business_name),
        !!centerTrim(c?.main_heading || c?.business_name),
        !!centerTrim(c?.sub_heading || c?.trade_title),
        !!centerTrim(c?.job_title),
        !!centerTrim(c?.full_name),
        !!centerTrim(c?.bio),
        !!centerTrim(c?.avatar || c?.logo),
        !!centerTrim(c?.cover_photo),
        Array.isArray(c?.works) && c.works.length > 0,
        Array.isArray(c?.services) && c.services.length > 0,
        Array.isArray(c?.reviews) && c.reviews.length > 0,
        !!centerTrim(c?.contact_email),
        !!centerTrim(c?.phone_number),
    ];

    const total = checks.length;
    const done = checks.filter(Boolean).length;
    return total ? Math.round((done / total) * 100) : 0;
};

const pctTone = (pct) => {
    if (pct >= 80) return "good";
    if (pct >= 40) return "mid";
    return "bad";
};

const toMs = (d) => {
    if (!d) return 0;
    const t = new Date(d).getTime();
    return Number.isFinite(t) ? t : 0;
};

export default function Profiles() {
    const navigate = useNavigate();
    const location = useLocation();

    const { data: authUser, refetch: refetchAuthUser } = useAuthUser();
    const plan = safeLower(authUser?.plan || "free");
    const isTeams = plan === "teams";
    const isPlus = plan === "plus";
    const isFree = !isTeams && !isPlus;

    const teamsCap = Math.max(1, Number(authUser?.teamsProfilesQty || 1));
    const maxProfiles = isTeams ? teamsCap : 1;

    const { data: cards, isLoading, isError, refetch: refetchProfiles } = useMyProfiles();
    const createProfile = useCreateProfile();
    const deleteProfile = useDeleteProfile();

    useEffect(() => {
        if (!authUser) return;
        refetchProfiles?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plan, teamsCap]);

    const profiles = useMemo(() => {
        const xs = Array.isArray(cards) ? cards : [];
        return xs.map((c) => {
            const displayName =
                centerTrim(c.business_card_name) ||
                centerTrim(c.business_name) ||
                centerTrim(c.full_name) ||
                (c.profile_slug === "main" ? "Main Profile" : "Profile");

            const slug = c.profile_slug || "";
            const updatedMs = toMs(c.updatedAt || c.updated_at || c.lastUpdated || c.last_updated);

            const updatedAtText = updatedMs
                ? `Updated ${new Date(updatedMs).toLocaleDateString()}`
                : "Updated recently";

            const pct = calcCompletionPct(c);
            const tone = pctTone(pct);
            const isLive = pct > 0;

            const views = Number(c?.views ?? c?.profile_views ?? c?.total_views ?? c?.profileViews ?? 0) || 0;
            const linkTaps = Number(c?.link_taps ?? c?.card_taps ?? c?.linkTaps ?? c?.cardTaps ?? 0) || 0;

            return {
                id: c._id,
                raw: c,
                slug,
                name: displayName,
                updatedAt: updatedAtText,
                updatedMs,
                pct,
                tone,
                isLive,
                views,
                linkTaps,
                qrCodeUrl: c?.qr_code_url || "",
            };
        });
    }, [cards]);

    const sortedProfiles = useMemo(() => {
        const xs = [...profiles].filter((p) => !!p.slug);
        xs.sort((a, b) => {
            const d = (b.updatedMs || 0) - (a.updatedMs || 0);
            if (d !== 0) return d;
            return a.slug.localeCompare(b.slug);
        });
        return xs;
    }, [profiles]);

    const cappedProfiles = useMemo(() => {
        return sortedProfiles.map((p, idx) => ({
            ...p,
            isLockedByPlan: idx >= maxProfiles,
        }));
    }, [sortedProfiles, maxProfiles]);

    const lockedCount = useMemo(() => Math.max(0, cappedProfiles.length - maxProfiles), [cappedProfiles.length, maxProfiles]);

    const [selectedSlug, setSelectedSlug] = useState(null);

    useEffect(() => {
        if (!sortedProfiles.length) {
            setSelectedSlug(null);
            return;
        }

        setSelectedSlug((prev) => {
            const firstAllowed = sortedProfiles[0]?.slug || null;
            if (!prev) return firstAllowed;

            const idx = sortedProfiles.findIndex((p) => p.slug === prev);
            if (idx === -1) return firstAllowed;
            if (idx >= maxProfiles) return firstAllowed;

            return prev;
        });
    }, [sortedProfiles, maxProfiles]);

    const selectedProfile = useMemo(() => {
        if (!sortedProfiles.length) return null;

        const found = sortedProfiles.find((p) => p.slug === selectedSlug) || sortedProfiles[0];
        const idx = sortedProfiles.findIndex((p) => p.slug === found.slug);

        if (idx >= maxProfiles) return sortedProfiles[0] || null;
        return found;
    }, [sortedProfiles, selectedSlug, maxProfiles]);

    const buildPublicUrl = (profileSlug) => {
        const s = normalizeSlug(profileSlug);
        if (!s) return `${window.location.origin}/u/`;
        return `${window.location.origin}/u/${encodeURIComponent(s)}`;
    };

    const selectedPublicUrl = useMemo(() => {
        return selectedProfile?.slug ? buildPublicUrl(selectedProfile.slug) : "";
    }, [selectedProfile?.slug]);

    const [lockedOverlayOpen, setLockedOverlayOpen] = useState(false);
    const [lockedClickedSlug, setLockedClickedSlug] = useState("");

    const openLockedOverlay = (slug) => {
        setLockedClickedSlug(slug || "");
        setLockedOverlayOpen(true);
    };

    const closeLockedOverlay = () => {
        setLockedOverlayOpen(false);
        setLockedClickedSlug("");
    };

    const overlayPlanName = isFree ? "Free" : isPlus ? "Plus" : "your current";
    const overlayLimitText = `This plan is limited to ${maxProfiles} profile${maxProfiles === 1 ? "" : "s"}.`;

    const handleEdit = (slug) => {
        navigate(`/profiles/edit?slug=${encodeURIComponent(slug || "")}`);
    };

    const handleVisitProfile = (slug) => {
        const link = buildPublicUrl(slug);
        window.open(link, "_blank", "noopener,noreferrer");
    };

    const copyLink = async (link) => {
        if (!link) return;
        try {
            await navigator.clipboard.writeText(link);
            alert("Link copied ✅");
        } catch {
            alert("Copy failed — please copy manually: " + link);
        }
    };

    const handleDownloadQr = async () => {
        if (!selectedProfile?.slug) return;
        if (!selectedProfile?.qrCodeUrl) {
            alert("QR code not available yet for this profile.");
            return;
        }

        try {
            const a = document.createElement("a");
            a.href = selectedProfile.qrCodeUrl;
            a.download = `${selectedProfile.slug}-qr.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch {
            window.open(selectedProfile.qrCodeUrl, "_blank", "noopener,noreferrer");
        }
    };

    const handleDelete = async (slug) => {
        const ok = window.confirm("Delete this profile? This cannot be undone.");
        if (!ok) return;

        try {
            await deleteProfile.mutateAsync(slug);
            await refetchProfiles();

            setSelectedSlug((prev) => {
                if (prev !== slug) return prev;
                const remaining = sortedProfiles.filter((p) => p.slug !== slug);
                return remaining[0]?.slug || null;
            });
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || "Delete failed.";
            alert(msg);
        }
    };

    const shareToFacebook = () => {
        if (!selectedPublicUrl) return;
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedPublicUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToInstagram = () => {
        alert("Instagram does not support direct web share links. Usually users copy the link and paste it into Instagram bio, DM, or story tools.");
    };

    const shareToMessenger = () => {
        if (!selectedPublicUrl) return;
        const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
            selectedPublicUrl
        )}&app_id=291494419107518&redirect_uri=${encodeURIComponent(selectedPublicUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToWhatsApp = () => {
        if (!selectedPublicUrl) return;
        const text = `Check out my profile: ${selectedPublicUrl}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const shareByText = () => {
        if (!selectedPublicUrl) return;
        const body = `Check out my profile: ${selectedPublicUrl}`;
        window.location.href = `sms:?&body=${encodeURIComponent(body)}`;
    };

    const handleAppleWallet = () => {
        alert("Apple Wallet not wired yet. Send me the backend endpoint and I’ll connect it.");
    };

    const handleGoogleWallet = () => {
        alert("Google Wallet not wired yet. Send me the backend endpoint and I’ll connect it.");
    };

    const goUpgradeTeams = () => navigate("/pricing");

    const [claimOpen, setClaimOpen] = useState(false);
    const [claimSlugInput, setClaimSlugInput] = useState("");
    const [claimSlugNormalized, setClaimSlugNormalized] = useState("");
    const [claimStatus, setClaimStatus] = useState("idle");
    const [claimMessage, setClaimMessage] = useState("");

    const claimRef = useRef(null);

    const resetClaim = () => {
        setClaimSlugInput("");
        setClaimSlugNormalized("");
        setClaimStatus("idle");
        setClaimMessage("");
    };

    const openClaimPanel = () => {
        setClaimOpen(true);
        resetClaim();
        setTimeout(() => claimRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    };

    const closeClaimPanel = () => {
        setClaimOpen(false);
        resetClaim();
    };

    const validateClaimSlug = (raw) => {
        const s = normalizeSlug(raw);
        if (!s || s.length < 3) {
            return { ok: false, slug: s, msg: "Slug must be at least 3 characters (a-z, 0-9, hyphen)." };
        }
        if (s === "main") return { ok: false, slug: s, msg: "Please choose a real slug (not “main”)." };
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
        const v = validateClaimSlug(claimSlugInput);
        setClaimSlugNormalized(v.slug);

        if (!v.ok) {
            setClaimStatus("invalid");
            setClaimMessage(v.msg);
            return;
        }

        if (!isTeams) {
            setClaimStatus("error");
            setClaimMessage("Only Teams can add extra profiles.");
            return;
        }

        if (claimStatus !== "available") return;

        setClaimStatus("creating");
        setClaimMessage("");

        try {
            const createdResp = await createProfile.mutateAsync({
                profile_slug: v.slug,
                template_id: "template-1",
                business_card_name: "",
                business_name: "",
                trade_title: "",
            });

            await refetchProfiles();

            const createdSlug = createdResp?.profile_slug || createdResp?.data?.profile_slug || v.slug;

            setClaimStatus("created");
            setClaimMessage("Profile created ✅");
            setSelectedSlug(createdSlug);
            setTimeout(() => closeClaimPanel(), 450);
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || "Could not create profile.";
            setClaimStatus("error");
            setClaimMessage(msg);
        }
    };

    const startTeamsCheckout = async () => {
        const v = validateClaimSlug(claimSlugInput);
        setClaimSlugNormalized(v.slug);

        if (!v.ok) {
            setClaimStatus("invalid");
            setClaimMessage(v.msg);
            return;
        }

        if (claimStatus !== "available") return;

        setClaimStatus("subscribing");
        setClaimMessage("");

        try {
            const res = await api.post(TEAMS_CHECKOUT_ENDPOINT, {
                claimedSlug: v.slug,
                desiredQuantity: Math.max(2, sortedProfiles.length + 1),
            });

            const url =
                res?.data?.url || res?.data?.checkoutUrl || res?.data?.sessionUrl || res?.data?.redirectUrl;

            if (url) {
                window.location.href = url;
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
                    setSelectedSlug(returnedSlug);
                    break;
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
            <DashboardLayout hideDesktopHeader>
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
            <DashboardLayout hideDesktopHeader>
                <div className="profiles-shell">
                    <section className="profiles-card profiles-empty">
                        <h2 className="profiles-card-title">We couldn’t load your profiles</h2>
                        <p className="profiles-muted">Please try again. If this keeps happening, contact support.</p>

                        <div className="profiles-actions-row">
                            <button type="button" className="kx-btn kx-btn--black" onClick={() => refetchProfiles()}>
                                Retry
                            </button>
                        </div>
                    </section>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout hideDesktopHeader>
            <div className="profiles-shell">
                <PageHeader
                    title="Profiles"
                    subtitle="Profiles are your public digital business cards. Each profile has its own link you can share after every job."
                />

                {sortedProfiles.length === 0 ? (
                    <section className="profiles-card profiles-empty">
                        <h2 className="profiles-card-title">Create your first profile</h2>
                        <p className="profiles-muted">
                            Your profile is what customers see when they scan your KonarCard. Create it once — update it any time.
                        </p>

                        <div className="profiles-actions-row">
                            <button type="button" className="kx-btn kx-btn--orange" onClick={openClaimPanel}>
                                + Add profile
                            </button>
                            <button type="button" className="kx-btn kx-btn--white" onClick={() => handleEdit("")}>
                                Open editor
                            </button>
                        </div>
                    </section>
                ) : (
                    <div className="profiles-grid">
                        <section className="profiles-card profiles-list-card">
                            <div className="profiles-listHeader">
                                <div className="profiles-listHeader-left">
                                    <h2 className="profiles-listTitle">Your Profiles</h2>
                                    <p className="profiles-listSub">Choose one to edit or open.</p>
                                </div>

                                <span className="profiles-countPill">
                                    {sortedProfiles.length} Profile{sortedProfiles.length === 1 ? "" : "s"}
                                </span>
                            </div>

                            <div className="profiles-listDivider" />

                            <div className="profiles-listScroll">
                                {cappedProfiles.map((p) => {
                                    const active = selectedProfile?.slug === p.slug;
                                    const locked = p.isLockedByPlan;

                                    return (
                                        <article
                                            key={p.slug}
                                            className={`profiles-profileCard ${active ? "is-active" : ""} ${locked ? "is-locked" : ""}`}
                                            onClick={() => {
                                                if (locked) return openLockedOverlay(p.slug);
                                                setSelectedSlug(p.slug);
                                            }}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    if (locked) return openLockedOverlay(p.slug);
                                                    setSelectedSlug(p.slug);
                                                }
                                            }}
                                            aria-disabled={locked ? "true" : "false"}
                                            style={locked ? { opacity: 0.62, cursor: "pointer" } : undefined}
                                        >
                                            <div className="profiles-profileMain">
                                                <div className="profiles-profileLeft">
                                                    <div className="profiles-pillRow">
                                                        <span className={`profiles-pill ${p.isLive ? "live" : "draft"}`}>
                                                            {p.isLive ? "Live" : "Draft"}
                                                        </span>

                                                        <span className={`profiles-pill completion ${p.tone}`}>
                                                            {p.pct >= 95 ? "Profile Complete" : `${p.pct}% Complete`}
                                                        </span>

                                                        {locked ? (
                                                            <span className="profiles-pill profiles-pill--locked">Locked</span>
                                                        ) : null}
                                                    </div>

                                                    <div className="profiles-slug">{p.slug}</div>
                                                    <div className="profiles-updated">{p.updatedAt}</div>
                                                </div>

                                                <div className="profiles-profileRight">
                                                    <div className="profiles-profileRightInner">
                                                        <div className="profiles-cardBtns">
                                                            <button
                                                                type="button"
                                                                className="kx-btn kx-btn--white profiles-cardBtn"
                                                                disabled={locked}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (locked) return openLockedOverlay(p.slug);
                                                                    handleEdit(p.slug);
                                                                }}
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="kx-btn kx-btn--black profiles-cardBtn"
                                                                disabled={locked}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (locked) return openLockedOverlay(p.slug);
                                                                    handleVisitProfile(p.slug);
                                                                }}
                                                            >
                                                                Visit profile
                                                            </button>
                                                        </div>

                                                        <div className="profiles-metrics">
                                                            <div className="profiles-metric">
                                                                <div className="profiles-metricVal">{p.views}</div>
                                                                <div className="profiles-metricLab">Views</div>
                                                            </div>

                                                            <div className="profiles-metric">
                                                                <div className="profiles-metricVal">{p.linkTaps}</div>
                                                                <div className="profiles-metricLab">Link Taps</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}

                                {!claimOpen ? (
                                    <button type="button" className="profiles-addCard" onClick={openClaimPanel}>
                                        <span className="profiles-addPlus">＋</span>
                                        <span className="profiles-addText">Add Profile</span>
                                    </button>
                                ) : (
                                    <div ref={claimRef} className="profiles-addInline">
                                        <div className="profiles-addInlineHead">
                                            <div className="profiles-addInlineTitle">Claim your link</div>
                                            <button
                                                type="button"
                                                className="profiles-addInlineClose"
                                                onClick={closeClaimPanel}
                                                aria-label="Close"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="profiles-addInlineRow">
                                            <div className="profiles-input-wrap" aria-label="Claim link input">
                                                <span className="profiles-input-prefix">{window.location.origin}/u/</span>
                                                <input
                                                    className="profiles-input"
                                                    value={claimSlugInput}
                                                    onChange={(e) => {
                                                        setClaimSlugInput(e.target.value);
                                                        setClaimStatus("idle");
                                                        setClaimMessage("");
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") checkSlugAvailability();
                                                    }}
                                                    placeholder="plumbing-north-london"
                                                    aria-label="Profile slug"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                className="kx-btn kx-btn--black"
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
                                                        : claimStatus === "error" || claimStatus === "invalid" || claimStatus === "taken"
                                                            ? "danger"
                                                            : "neutral"
                                                    }`}
                                            >
                                                {claimMessage}
                                            </div>
                                        ) : null}

                                        {claimStatus === "available" ? (
                                            <div className="profiles-addInlineActions">
                                                <button
                                                    type="button"
                                                    className="kx-btn kx-btn--white"
                                                    onClick={closeClaimPanel}
                                                >
                                                    Cancel
                                                </button>

                                                {isTeams ? (
                                                    sortedProfiles.length < maxProfiles ? (
                                                        <button
                                                            type="button"
                                                            className="kx-btn kx-btn--orange"
                                                            onClick={createTeamsProfileNow}
                                                            disabled={claimStatus === "creating"}
                                                        >
                                                            {claimStatus === "creating" ? "Adding..." : "Add Profile"}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="kx-btn kx-btn--orange"
                                                            onClick={startTeamsCheckout}
                                                            disabled={claimStatus === "subscribing"}
                                                        >
                                                            {claimStatus === "subscribing" ? "Opening checkout..." : "Add profile (+£1.95)"}
                                                        </button>
                                                    )
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="kx-btn kx-btn--orange"
                                                        onClick={startTeamsCheckout}
                                                        disabled={claimStatus === "subscribing"}
                                                    >
                                                        {claimStatus === "subscribing" ? "Opening checkout..." : "Upgrade Plan"}
                                                    </button>
                                                )}
                                            </div>
                                        ) : null}

                                        {(isFree || isPlus) && claimOpen ? (
                                            <div className="profiles-hint">
                                                Free and Plus allow <strong>1 profile</strong>. Upgrade to <strong>Teams</strong> to add more.
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </section>

                        <aside className="profiles-right">
                            <section className="profiles-card profiles-actionsCard">
                                {selectedProfile ? (
                                    <>
                                        <div className="profiles-actionsTop">
                                            <div className="profiles-pillRow profiles-previewPills">
                                                <span className={`profiles-pill ${selectedProfile.isLive ? "live" : "draft"}`}>
                                                    {selectedProfile.isLive ? "Live" : "Draft"}
                                                </span>
                                                <span className={`profiles-pill completion ${selectedProfile.tone}`}>
                                                    {selectedProfile.pct >= 95 ? "Profile Complete" : `${selectedProfile.pct}% Complete`}
                                                </span>
                                            </div>

                                            <div className="profiles-previewLinkLabel">Profile link</div>

                                            <div className="profiles-previewLinkRow">
                                                <div className="profiles-previewLinkUrl" title={selectedPublicUrl}>
                                                    {selectedPublicUrl}
                                                </div>

                                                <button
                                                    type="button"
                                                    className="profiles-copyIconBtn"
                                                    onClick={() => copyLink(selectedPublicUrl)}
                                                    aria-label="Copy profile link"
                                                >
                                                    <img src={CopyLinkIcon} alt="" className="profiles-copyIcon24" />
                                                </button>
                                            </div>

                                            <div className="profiles-previewHint">
                                                This is your profile link — share it after every job, quote, or enquiry.
                                            </div>

                                            <div className="profiles-previewMetricsRow">
                                                <div className="profiles-metrics profiles-metrics--preview">
                                                    <div className="profiles-metric">
                                                        <div className="profiles-metricVal">{selectedProfile.views}</div>
                                                        <div className="profiles-metricLab">Views</div>
                                                    </div>

                                                    <div className="profiles-metric">
                                                        <div className="profiles-metricVal">{selectedProfile.linkTaps}</div>
                                                        <div className="profiles-metricLab">Link Taps</div>
                                                    </div>

                                                    <div className="profiles-metric">
                                                        <div className="profiles-metricVal">{selectedProfile.pct}%</div>
                                                        <div className="profiles-metricLab">Completion</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="profiles-actionsDivider" />

                                        <div className="profiles-actionGroup">
                                            <h3 className="profiles-groupTitle">Share your card</h3>

                                            <div className="profiles-actionGrid">
                                                <button type="button" className="kx-btn kx-btn--white" onClick={shareToFacebook}>
                                                    Share on Facebook
                                                </button>

                                                <button type="button" className="kx-btn kx-btn--white" onClick={shareToInstagram}>
                                                    Share on Instagram
                                                </button>

                                                <button type="button" className="kx-btn kx-btn--white" onClick={shareToMessenger}>
                                                    Share on Messenger
                                                </button>

                                                <button type="button" className="kx-btn kx-btn--white" onClick={shareToWhatsApp}>
                                                    Share on WhatsApp
                                                </button>

                                                <button type="button" className="kx-btn kx-btn--white" onClick={shareByText}>
                                                    Share by text
                                                </button>

                                                <button type="button" className="kx-btn kx-btn--black" onClick={() => copyLink(selectedPublicUrl)}>
                                                    Copy link
                                                </button>
                                            </div>
                                        </div>

                                        <div className="profiles-actionsDivider" />

                                        <div className="profiles-actionGroup">
                                            <h3 className="profiles-groupTitle">QR code</h3>

                                            <div className="profiles-qrWrap">
                                                {selectedProfile.qrCodeUrl ? (
                                                    <img
                                                        src={selectedProfile.qrCodeUrl}
                                                        alt={`${selectedProfile.slug} QR code`}
                                                        className="profiles-qrImage"
                                                    />
                                                ) : (
                                                    <div className="profiles-qrPlaceholder">QR not available yet</div>
                                                )}
                                            </div>

                                            <div className="profiles-singleAction">
                                                <button
                                                    type="button"
                                                    className="kx-btn kx-btn--white"
                                                    onClick={handleDownloadQr}
                                                >
                                                    Download QR code
                                                </button>
                                            </div>
                                        </div>

                                        <div className="profiles-actionsDivider" />

                                        <div className="profiles-actionGroup">
                                            <h3 className="profiles-groupTitle">Save to wallet</h3>

                                            <div className="profiles-actionGrid profiles-actionGrid--two">
                                                <button type="button" className="kx-btn kx-btn--white" onClick={handleAppleWallet}>
                                                    Add to Apple Wallet
                                                </button>

                                                <button type="button" className="kx-btn kx-btn--white" onClick={handleGoogleWallet}>
                                                    Add to Google Wallet
                                                </button>
                                            </div>
                                        </div>

                                        <div className="profiles-actionsDivider" />

                                        <div className="profiles-actionGroup">
                                            <h3 className="profiles-groupTitle">Manage profile</h3>

                                            <div className="profiles-actionGrid profiles-actionGrid--two">
                                                <button
                                                    type="button"
                                                    className="kx-btn kx-btn--white"
                                                    onClick={() => handleEdit(selectedProfile.slug)}
                                                >
                                                    Edit profile
                                                </button>

                                                <button
                                                    type="button"
                                                    className="kx-btn kx-btn--white profiles-deleteBtn"
                                                    onClick={() => handleDelete(selectedProfile.slug)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="profiles-previewLoading">Select a profile to see actions.</div>
                                )}
                            </section>
                        </aside>
                    </div>
                )}

                {lockedOverlayOpen ? (
                    <div
                        role="dialog"
                        aria-modal="true"
                        onMouseDown={(e) => {
                            if (e.target === e.currentTarget) closeLockedOverlay();
                        }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 9999,
                            background: "rgba(15, 23, 42, 0.55)",
                            display: "grid",
                            placeItems: "center",
                            padding: 16,
                        }}
                    >
                        <div
                            style={{
                                width: "min(520px, 100%)",
                                background: "#fff",
                                borderRadius: 18,
                                border: "1px solid rgba(15,23,42,0.12)",
                                boxShadow: "0 30px 80px rgba(15,23,42,0.28)",
                                padding: 18,
                                fontFamily: "Inter, sans-serif",
                                color: "var(--kc-text-primary, #0f172a)",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>This profile is locked</div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(15,23,42,0.75)" }}>
                                        You downgraded to the <strong>{overlayPlanName}</strong> plan.
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeLockedOverlay}
                                    aria-label="Close"
                                    style={{
                                        border: "1px solid rgba(15,23,42,0.12)",
                                        background: "#fff",
                                        borderRadius: 12,
                                        width: 38,
                                        height: 38,
                                        cursor: "pointer",
                                        fontWeight: 900,
                                        lineHeight: 1,
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{ marginTop: 12, fontSize: 13, color: "rgba(15,23,42,0.85)", lineHeight: 1.5 }}>
                                {overlayLimitText}{" "}
                                {lockedCount > 0 ? (
                                    <>
                                        You currently have <strong>{lockedCount}</strong> profile{lockedCount === 1 ? "" : "s"} locked.
                                    </>
                                ) : null}
                            </div>

                            <div style={{ marginTop: 10, fontSize: 13, color: "rgba(15,23,42,0.85)", lineHeight: 1.5 }}>
                                To unlock your old profiles, upgrade back to <strong>Teams</strong>. If you don’t upgrade, your locked profiles
                                will be permanently removed in <strong>30 days</strong>.
                            </div>

                            {lockedClickedSlug ? (
                                <div style={{ marginTop: 10, fontSize: 12, color: "rgba(15,23,42,0.6)" }}>
                                    Locked profile: <strong>{lockedClickedSlug}</strong>
                                </div>
                            ) : null}

                            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end", flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    className="kx-btn kx-btn--white"
                                    onClick={closeLockedOverlay}
                                >
                                    Not now
                                </button>

                                <button
                                    type="button"
                                    className="kx-btn kx-btn--orange"
                                    onClick={() => {
                                        closeLockedOverlay();
                                        goUpgradeTeams();
                                    }}
                                >
                                    Upgrade to Teams
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </DashboardLayout>
    );
}