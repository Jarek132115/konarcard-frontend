// src/pages/interface/Profiles.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/profiles.css";

import { useAuthUser } from "../../hooks/useAuthUser";
import { useMyProfiles, useCreateProfile, useDeleteProfile } from "../../hooks/useBusinessCard";
import api from "../../services/api";

// ✅ real preview component (same as MyProfile page)
import Preview from "../../components/Dashboard/Preview";

const TEAMS_CHECKOUT_ENDPOINT = "/api/checkout/teams";

const centerTrim = (v) => (v ?? "").toString().trim();
const safeLower = (v) => centerTrim(v).toLowerCase();

const normalizeSlug = (raw) =>
    safeLower(raw)
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

// Completion based on common fields we expect to exist on the card record
const calcCompletionPct = (c) => {
    const checks = [
        !!centerTrim(c?.business_card_name),
        !!centerTrim(c?.main_heading),
        !!centerTrim(c?.sub_heading),
        !!centerTrim(c?.job_title),
        !!centerTrim(c?.full_name),
        !!centerTrim(c?.bio),
        !!centerTrim(c?.avatar),
        !!centerTrim(c?.cover_photo),
        Array.isArray(c?.works) && c.works.length > 0,
        Array.isArray(c?.services) && c.services.length > 0,
        Array.isArray(c?.reviews) && c.reviews.length > 0,
        !!centerTrim(c?.contact_email),
        !!centerTrim(c?.phone_number),
    ];

    const total = checks.length;
    const done = checks.filter(Boolean).length;

    if (!total) return 0;
    return Math.round((done / total) * 100);
};

const pctTone = (pct) => {
    if (pct >= 80) return "good";
    if (pct >= 40) return "mid";
    return "bad";
};

export default function Profiles() {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ Responsive (for Preview props)
    const mqDesktopToMobile = "(max-width: 1000px)";
    const mqSmallMobile = "(max-width: 520px)";
    const [isMobile, setIsMobile] = useState(() => window.matchMedia(mqDesktopToMobile).matches);
    const [isSmallMobile, setIsSmallMobile] = useState(() => window.matchMedia(mqSmallMobile).matches);

    useEffect(() => {
        const mm1 = window.matchMedia(mqDesktopToMobile);
        const mm2 = window.matchMedia(mqSmallMobile);

        const onChange = () => {
            setIsMobile(mm1.matches);
            setIsSmallMobile(mm2.matches);
        };

        mm1.addEventListener("change", onChange);
        mm2.addEventListener("change", onChange);

        return () => {
            mm1.removeEventListener("change", onChange);
            mm2.removeEventListener("change", onChange);
        };
    }, []);

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

    const profiles = useMemo(() => {
        const xs = Array.isArray(cards) ? cards : [];
        return xs.map((c) => {
            const displayName =
                centerTrim(c.business_card_name) ||
                centerTrim(c.full_name) ||
                (c.profile_slug === "main" ? "Main Profile" : "Profile");

            const slug = c.profile_slug || "";
            const updatedAtText = c.updatedAt ? `Updated ${new Date(c.updatedAt).toLocaleDateString()}` : "Updated recently";

            const pct = calcCompletionPct(c);
            const tone = pctTone(pct);

            const isLive = pct > 0; // "anything saved" → live

            // Optional metrics (safe fallbacks)
            const views =
                Number(c?.views ?? c?.profile_views ?? c?.total_views ?? c?.profileViews ?? 0) || 0;

            const linkTaps =
                Number(c?.link_taps ?? c?.card_taps ?? c?.linkTaps ?? c?.cardTaps ?? 0) || 0;

            return {
                id: c._id,
                slug,
                name: displayName,
                updatedAt: updatedAtText,
                pct,
                tone,
                isLive,
                views,
                linkTaps,
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

    // =========================================================
    // ✅ REAL PREVIEW DATA (fetch selected profile full record)
    // =========================================================
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState("");
    const [previewCard, setPreviewCard] = useState(null);

    useEffect(() => {
        const slug = selectedProfile?.slug;
        if (!slug) {
            setPreviewCard(null);
            setPreviewError("");
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                setPreviewLoading(true);
                setPreviewError("");

                const res = await api.get(`/api/business-card/profiles/${encodeURIComponent(slug)}`);
                const data = res?.data?.data ?? null;

                if (cancelled) return;
                setPreviewCard(data);
            } catch (e) {
                if (cancelled) return;
                setPreviewCard(null);
                setPreviewError(e?.response?.data?.error || e?.message || "Could not load preview.");
            } finally {
                if (cancelled) return;
                setPreviewLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedProfile?.slug]);

    const previewState = useMemo(() => {
        const bc = previewCard || {};

        return {
            templateId: bc.template_id || "template-1",

            businessName: bc.business_card_name || "",
            mainHeading: bc.main_heading || "",
            subHeading: bc.sub_heading || "",
            job_title: bc.job_title || "",
            full_name: bc.full_name || "",
            bio: bc.bio || "",

            avatar: bc.avatar || null,
            coverPhoto: bc.cover_photo || null,

            avatarPreview: "",
            coverPhotoPreview: "",
            avatarFile: null,
            coverPhotoFile: null,

            workImages: Array.isArray(bc.works) ? bc.works.map((url) => ({ file: null, preview: url })) : [],

            services: Array.isArray(bc.services) ? bc.services : [],
            reviews: Array.isArray(bc.reviews) ? bc.reviews : [],

            contact_email: bc.contact_email || "",
            phone_number: bc.phone_number || "",

            facebook_url: bc.facebook_url || "",
            instagram_url: bc.instagram_url || "",
            linkedin_url: bc.linkedin_url || "",
            x_url: bc.x_url || "",
            tiktok_url: bc.tiktok_url || "",
        };
    }, [previewCard]);

    const previewToggles = useMemo(() => {
        const bc = previewCard || {};
        return {
            showMainSection: bc.show_main_section !== false,
            showAboutMeSection: bc.show_about_me_section !== false,
            showWorkSection: bc.show_work_section !== false,
            showServicesSection: bc.show_services_section !== false,
            showReviewsSection: bc.show_reviews_section !== false,
            showContactSection: bc.show_contact_section !== false,
        };
    }, [previewCard]);

    const hasExchangeContact =
        (previewState.contact_email && previewState.contact_email.trim()) ||
        (previewState.phone_number && previewState.phone_number.trim());

    // =========================================================
    // Actions
    // =========================================================
    const shareSlug = async (slug) => {
        const link = buildPublicUrl(slug);

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
            try {
                await navigator.clipboard.writeText(link);
                alert("Link copied ✅");
            } catch {
                alert("Copy failed — please copy manually: " + link);
            }
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

    // =========================================================
    // Bottom 4 buttons (keep)
    // =========================================================
    const handleDownloadQr = async () => {
        if (!selectedProfile?.slug) return;
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

    const claimRef = useRef(null);

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
        setTimeout(() => {
            claimRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 80);
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
            setClaimMessage(`You’re at your Teams limit (${sortedProfiles.length}/${maxProfiles}). Increase your Teams quantity to add more profiles.`);
            setTimeout(() => {
                claimRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 80);
            return;
        }
        openClaimPanel();
    };

    const validateClaimSlug = (raw) => {
        const s = normalizeSlug(raw);
        if (!s || s.length < 3) return { ok: false, slug: s, msg: "Slug must be at least 3 characters (a-z, 0-9, hyphen)." };
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

    // Handle return from Teams checkout
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

    // =========================================================
    // Loading / Error states
    // =========================================================
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

    // =========================================================
    // Main render
    // =========================================================
    return (
        <DashboardLayout hideDesktopHeader>
            <div className="profiles-shell">
                <PageHeader title="Profiles" subtitle="Profiles are your public digital business cards. Each profile has its own link you can share after every job." />

                {sortedProfiles.length === 0 ? (
                    <section className="profiles-card profiles-empty">
                        <h2 className="profiles-card-title">Create your first profile</h2>
                        <p className="profiles-muted">Your profile is what customers see when they scan your KonarCard. Create it once — update it any time.</p>

                        <div className="profiles-actions-row">
                            <button type="button" className="kx-btn kx-btn--orange" onClick={openClaimPanel}>
                                + Add profile
                            </button>
                            <button type="button" className="kx-btn kx-btn--white" onClick={() => handleEdit("")}>
                                Skip slug (open editor)
                            </button>
                        </div>

                        {claimOpen && (
                            <div ref={claimRef} className="profiles-claim-inline">
                                <div className="profiles-claim-inline-head">
                                    <div>
                                        <div className="profiles-claim-inline-title">Claim your link</div>
                                        <div className="profiles-claim-inline-sub">
                                            Example: <strong>{window.location.origin}/u/your-link</strong>
                                        </div>
                                    </div>

                                    <button type="button" className="kx-btn kx-btn--white" onClick={closeClaimPanel}>
                                        Close
                                    </button>
                                </div>

                                <div className="profiles-claim-grid">
                                    <div className="profiles-claim-row">
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
                                                placeholder="plumbing-north-london"
                                                aria-label="Profile slug"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            className="kx-btn kx-btn--black"
                                            onClick={checkSlugAvailability}
                                            disabled={claimStatus === "checking" || claimStatus === "subscribing" || claimStatus === "creating"}
                                        >
                                            {claimStatus === "checking" ? "Checking..." : "Check availability"}
                                        </button>
                                    </div>

                                    {claimMessage ? (
                                        <div className={`profiles-alert ${claimStatus === "available" ? "success" : claimStatus === "error" || claimStatus === "invalid" ? "danger" : "neutral"}`}>
                                            {claimMessage}
                                        </div>
                                    ) : null}

                                    {claimStatus === "available" && (
                                        <div className="profiles-claim-actions">
                                            {isTeams ? (
                                                <button type="button" className="kx-btn kx-btn--orange" onClick={createTeamsProfileNow} disabled={claimStatus === "creating"}>
                                                    {claimStatus === "creating" ? "Creating..." : "Create profile"}
                                                </button>
                                            ) : (
                                                <button type="button" className="kx-btn kx-btn--orange" onClick={() => handleEdit(claimSlugNormalized || normalizeSlug(claimSlugInput))}>
                                                    Continue to editor
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
                                            Teams cap is controlled by your subscription: <strong>{maxProfiles}</strong>. If you hit the limit, increase quantity.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>
                ) : (
                    <div className="profiles-grid">
                        {/* LEFT */}
                        <section className="profiles-card profiles-list-card">
                            <div className="profiles-listHeader">
                                <div className="profiles-listHeader-left">
                                    <h2 className="profiles-listTitle">Your Profiles</h2>
                                    <p className="profiles-listSub">Choose one to edit or share.</p>
                                </div>

                                <span className="profiles-countPill">{sortedProfiles.length} Profile{sortedProfiles.length === 1 ? "" : "s"}</span>
                            </div>

                            <div className="profiles-listDivider" />

                            <div className="profiles-listScroll">
                                {sortedProfiles.map((p) => {
                                    const active = selectedProfile?.slug === p.slug;

                                    return (
                                        <article
                                            key={p.slug}
                                            className={`profiles-profileCard ${active ? "is-active" : ""}`}
                                            onClick={() => setSelectedSlug(p.slug)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") setSelectedSlug(p.slug);
                                            }}
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
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEdit(p.slug);
                                                                }}
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="kx-btn kx-btn--black profiles-cardBtn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    shareSlug(p.slug);
                                                                }}
                                                            >
                                                                Share
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

                                {/* Add profile (dashed) */}
                                <button type="button" className="profiles-addCard" onClick={handleCreateButtonClick}>
                                    <span className="profiles-addPlus">＋</span>
                                    <span className="profiles-addText">Add Profile</span>
                                </button>

                                {/* Inline claim panel sits UNDER the add card (this is where it expands) */}
                                {claimOpen && (
                                    <div ref={claimRef} className="profiles-claim-inline">
                                        <div className="profiles-claim-inline-head">
                                            <div>
                                                <div className="profiles-claim-inline-title">Claim your link</div>
                                                <div className="profiles-claim-inline-sub">
                                                    Example: <strong>{window.location.origin}/u/your-link</strong>
                                                </div>
                                            </div>

                                            <button type="button" className="kx-btn kx-btn--white" onClick={closeClaimPanel}>
                                                Close
                                            </button>
                                        </div>

                                        <div className="profiles-claim-grid">
                                            <div className="profiles-claim-row">
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
                                                        placeholder="plumbing-north-london"
                                                        aria-label="Profile slug"
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    className="kx-btn kx-btn--black"
                                                    onClick={checkSlugAvailability}
                                                    disabled={claimStatus === "checking" || claimStatus === "subscribing" || claimStatus === "creating"}
                                                >
                                                    {claimStatus === "checking" ? "Checking..." : "Check availability"}
                                                </button>
                                            </div>

                                            {claimMessage ? (
                                                <div className={`profiles-alert ${claimStatus === "available" ? "success" : claimStatus === "error" || claimStatus === "invalid" ? "danger" : "neutral"}`}>
                                                    {claimMessage}
                                                </div>
                                            ) : null}

                                            {claimStatus === "available" && (
                                                <div className="profiles-claim-actions">
                                                    {canCreateMoreProfilesWithoutCheckout ? (
                                                        <button type="button" className="kx-btn kx-btn--orange" onClick={createTeamsProfileNow} disabled={claimStatus === "creating"}>
                                                            {claimStatus === "creating" ? "Creating..." : "Create profile"}
                                                        </button>
                                                    ) : (
                                                        <button type="button" className="kx-btn kx-btn--orange" onClick={startTeamsCheckout} disabled={claimStatus === "subscribing"}>
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
                                                    Teams cap is controlled by your subscription: <strong>{maxProfiles}</strong>. If you hit the limit, increase quantity.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* RIGHT (Preview stays as-is for now) */}
                        <aside className="profiles-right">
                            <section className="profiles-card profiles-preview-card">
                                <div className="profiles-card-head">
                                    <div>
                                        <h2 className="profiles-card-title">Profile preview</h2>
                                        <p className="profiles-muted">This is what customers see when they open your link.</p>
                                    </div>
                                </div>

                                <div className="profiles-previewWrap">
                                    {previewLoading ? (
                                        <div className="profiles-previewLoading">Loading preview…</div>
                                    ) : previewError ? (
                                        <div className="profiles-previewError">{previewError}</div>
                                    ) : (
                                        <Preview
                                            state={previewState}
                                            isMobile={isMobile}
                                            hasSavedData={!!previewCard}
                                            showMainSection={previewToggles.showMainSection}
                                            showAboutMeSection={previewToggles.showAboutMeSection}
                                            showWorkSection={previewToggles.showWorkSection}
                                            showServicesSection={previewToggles.showServicesSection}
                                            showReviewsSection={previewToggles.showReviewsSection}
                                            showContactSection={previewToggles.showContactSection}
                                            hasExchangeContact={hasExchangeContact}
                                            visitUrl={selectedProfile?.slug ? buildPublicUrl(selectedProfile.slug) : ""}
                                        />
                                    )}
                                </div>

                                <div className="profiles-previewActions">
                                    <button type="button" className="kx-btn kx-btn--black" onClick={() => shareSlug(selectedProfile?.slug)} disabled={!selectedProfile}>
                                        Share page
                                    </button>

                                    <button type="button" className="kx-btn kx-btn--white" onClick={handleDownloadQr} disabled={!selectedProfile}>
                                        Download QR
                                    </button>

                                    <button type="button" className="kx-btn kx-btn--white" onClick={handleAddAppleWallet} disabled={!selectedProfile}>
                                        Apple Wallet
                                    </button>

                                    <button type="button" className="kx-btn kx-btn--white" onClick={handleAddGoogleWallet} disabled={!selectedProfile}>
                                        Google Wallet
                                    </button>
                                </div>
                            </section>
                        </aside>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}