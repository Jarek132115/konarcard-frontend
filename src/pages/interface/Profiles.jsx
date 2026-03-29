import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/profiles.css";
import "../../styling/dashboard-profiles/profileslist.css";
import "../../styling/dashboard-profiles/profilesinfo.css";

import ProfilesList from "../../components/Dashboard-Profiles/ProfilesList";
import ProfilesInfo from "../../components/Dashboard-Profiles/ProfilesInfo";

import { useAuthUser } from "../../hooks/useAuthUser";
import {
    useMyProfiles,
    useCreateProfile,
    useDeleteProfile,
} from "../../hooks/useBusinessCard";
import api from "../../services/api";
import {
    norm,
    normalizeSlug,
    calcCompletionPct,
    getCompletionTone,
    hasMeaningfulContent,
    getProfileStatus,
} from "../../utils/profileHelpers";

const TEAMS_CHECKOUT_ENDPOINT = "/api/checkout/teams";
const DRAG_THRESHOLD = 8;

const centerTrim = (v) => (v ?? "").toString().trim();
const safeLower = (v) => centerTrim(v).toLowerCase();

const toMs = (d) => {
    if (!d) return 0;
    const t = new Date(d).getTime();
    return Number.isFinite(t) ? t : 0;
};

const getThemeMode = (c) => {
    const raw = safeLower(c?.theme_mode || c?.page_theme || "light");
    return raw === "dark" ? "dark" : "light";
};

const getMainPreviewData = (c) => {
    return {
        themeMode: getThemeMode(c),
        coverPhoto: centerTrim(c?.cover_photo),
        logo: centerTrim(c?.logo || c?.avatar),
        businessName:
            centerTrim(c?.main_heading) ||
            centerTrim(c?.business_name) ||
            centerTrim(c?.business_card_name) ||
            "Your business name",
        tradeTitle:
            centerTrim(c?.sub_heading) ||
            centerTrim(c?.trade_title) ||
            centerTrim(c?.job_title) ||
            "Your trade title",
        fullName: centerTrim(c?.full_name),
        location: centerTrim(c?.location),
        accentColor: centerTrim(c?.button_bg_color) || "#F47629",
        buttonTextColor:
            safeLower(c?.button_text_color) === "black" ? "#111827" : "#ffffff",
        textAlignment: safeLower(c?.text_alignment || "left"),
    };
};

function ProfileMiniMainPreview({ card }) {
    const p = getMainPreviewData(card);
    const isDark = p.themeMode === "dark";

    return (
        <div
            className={`profiles-mini ${isDark ? "is-dark" : "is-light"} align-${p.textAlignment}`}
        >
            <div className="profiles-mini-cover">
                {p.coverPhoto ? (
                    <img src={p.coverPhoto} alt="" className="profiles-mini-coverImg" />
                ) : (
                    <div className="profiles-mini-coverFallback" />
                )}
            </div>

            <div className="profiles-mini-body">
                <div className="profiles-mini-avatarWrap">
                    {p.logo ? (
                        <img src={p.logo} alt="" className="profiles-mini-avatar" />
                    ) : (
                        <div className="profiles-mini-avatar profiles-mini-avatar--placeholder">
                            {p.businessName?.charAt(0)?.toUpperCase() || "K"}
                        </div>
                    )}
                </div>

                <div className="profiles-mini-copy">
                    <h4 className="profiles-mini-title">{p.businessName}</h4>
                    <div className="profiles-mini-subtitle">{p.tradeTitle}</div>
                    {p.fullName ? <div className="profiles-mini-meta">{p.fullName}</div> : null}
                    {p.location ? <div className="profiles-mini-meta">{p.location}</div> : null}
                </div>

                <div className="profiles-mini-ctaRow">
                    <div
                        className="profiles-mini-btn"
                        style={{
                            background: p.accentColor,
                            color: p.buttonTextColor,
                        }}
                    >
                        Get in touch
                    </div>
                    <div className="profiles-mini-btn profiles-mini-btn--ghost">View work</div>
                </div>
            </div>
        </div>
    );
}

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

    const {
        data: cards,
        isLoading,
        isError,
        refetch: refetchProfiles,
    } = useMyProfiles();

    const createProfile = useCreateProfile();
    const deleteProfile = useDeleteProfile();

    const railRef = useRef(null);
    const pointerDownRef = useRef(false);
    const dragActiveRef = useRef(false);
    const suppressClickRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragStartScrollLeftRef = useRef(0);

    const [claimOpen, setClaimOpen] = useState(false);
    const [claimSlugInput, setClaimSlugInput] = useState("");
    const [claimSlugNormalized, setClaimSlugNormalized] = useState("");
    const [claimStatus, setClaimStatus] = useState("idle");
    const [claimMessage, setClaimMessage] = useState("");

    const [selectedSlug, setSelectedSlug] = useState(null);
    const [lockedOverlayOpen, setLockedOverlayOpen] = useState(false);
    const [lockedClickedSlug, setLockedClickedSlug] = useState("");

    const claimRef = useRef(null);

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

            const pct = calcCompletionPct({
                business_name: c?.business_name,
                businessName: c?.business_card_name,
                mainHeading: c?.main_heading,
                trade_title: c?.trade_title,
                subHeading: c?.sub_heading,
                location: c?.location,
                full_name: c?.full_name,
                job_title: c?.job_title,
                bio: c?.bio,
                logo: c?.logo,
                avatar: c?.avatar,
                coverPhoto: c?.cover_photo,
                workImages: Array.isArray(c?.works) ? c.works : [],
                services: Array.isArray(c?.services) ? c.services : [],
                reviews: Array.isArray(c?.reviews) ? c.reviews : [],
                contact_email: c?.contact_email,
                phone_number: c?.phone_number,
            });

            const tone = getCompletionTone(pct);

            const isLive =
                getProfileStatus({
                    card: c,
                    completionPct: pct,
                }) === "live";

            const views =
                Number(c?.views ?? c?.profile_views ?? c?.total_views ?? c?.profileViews ?? 0) || 0;

            const linkTaps =
                Number(c?.link_taps ?? c?.card_taps ?? c?.linkTaps ?? c?.cardTaps ?? 0) || 0;

            const qrScans =
                Number(c?.qr_scans ?? c?.qrScans ?? c?.total_qr_scans ?? 0) || 0;

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
                qrScans,
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

    const lockedCount = useMemo(
        () => Math.max(0, cappedProfiles.length - maxProfiles),
        [cappedProfiles.length, maxProfiles]
    );

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

    const openLockedOverlay = (slug) => {
        setLockedClickedSlug(slug || "");
        setLockedOverlayOpen(true);
    };

    const closeLockedOverlay = () => {
        setLockedOverlayOpen(false);
        setLockedClickedSlug("");
    };

    const overlayPlanName = isFree ? "Free" : isPlus ? "Plus" : "your current";
    const overlayLimitText = `This plan is limited to ${maxProfiles} profile${maxProfiles === 1 ? "" : "s"
        }.`;

    const handleEdit = (slug) => {
        navigate(`/profiles/edit?slug=${encodeURIComponent(slug || "")}`);
    };

    const handleVisitProfile = (slug) => {
        const link = buildPublicUrl(slug);
        window.open(link, "_blank", "noopener,noreferrer");
    };

    const copyLink = async (link) => {
        if (!link) {
            toast.error("No profile link available yet.");
            return;
        }

        try {
            await navigator.clipboard.writeText(link);
            toast.success("Link copied ✅");
        } catch {
            toast.error("Copy failed. Please copy the link manually.");
        }
    };

    const handleDownloadQr = async () => {
        if (!selectedProfile?.slug) {
            toast.error("No profile selected.");
            return;
        }

        if (!selectedProfile?.qrCodeUrl) {
            toast.error("QR code not available yet for this profile.");
            return;
        }

        try {
            const a = document.createElement("a");
            a.href = selectedProfile.qrCodeUrl;
            a.download = `${selectedProfile.slug}-qr.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast.success("QR code download started.");
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

            toast.success("Profile deleted.");
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || "Delete failed.";
            toast.error(msg);
        }
    };

    const shareToFacebook = () => {
        if (!selectedPublicUrl) {
            toast.error("No profile link available yet.");
            return;
        }

        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            selectedPublicUrl
        )}`;
        window.open(url, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToInstagram = () => {
        toast("Instagram does not support direct web sharing. Copy the link and paste it into your bio, DM, or story tools.");
    };

    const shareToMessenger = () => {
        if (!selectedPublicUrl) {
            toast.error("No profile link available yet.");
            return;
        }

        const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
            selectedPublicUrl
        )}&app_id=291494419107518&redirect_uri=${encodeURIComponent(selectedPublicUrl)}`;

        window.open(url, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToWhatsApp = () => {
        if (!selectedPublicUrl) {
            toast.error("No profile link available yet.");
            return;
        }

        const text = `Check out my profile: ${selectedPublicUrl}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const shareByText = () => {
        if (!selectedPublicUrl) {
            toast.error("No profile link available yet.");
            return;
        }

        const body = `Check out my profile: ${selectedPublicUrl}`;
        window.location.href = `sms:?&body=${encodeURIComponent(body)}`;
    };

    const handleAppleWallet = () => {
        toast("Apple Wallet is not wired yet.");
    };

    const handleGoogleWallet = () => {
        toast("Google Wallet is not wired yet.");
    };

    const goUpgradeTeams = () => navigate("/pricing");

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
            claimRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
            });
        }, 50);
    };

    const closeClaimPanel = () => {
        setClaimOpen(false);
        resetClaim();
    };

    const validateClaimSlug = (raw) => {
        const s = normalizeSlug(raw);

        if (!s || s.length < 3) {
            return {
                ok: false,
                slug: s,
                msg: "Slug must be at least 3 characters (a-z, 0-9, hyphen).",
            };
        }

        if (s === "main") {
            return {
                ok: false,
                slug: s,
                msg: "Please choose a real slug (not “main”).",
            };
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
            const r = await api.get(
                `/api/business-card/slug-available/${encodeURIComponent(v.slug)}`,
                { headers }
            );

            if ((r?.status || 0) >= 400) {
                setClaimStatus("error");
                setClaimMessage(r?.data?.error || "Could not check availability. Try again.");
                return;
            }

            const available = !!r?.data?.available;

            if (available) {
                setClaimStatus("available");
                setClaimMessage(`Nice! /u/${v.slug} is available ✅`);
            } else {
                setClaimStatus("taken");
                setClaimMessage("Sorry — that link is already taken. Try a different one.");
            }
        } catch (err) {
            setClaimStatus("error");
            setClaimMessage(
                err?.response?.data?.error || "Could not check availability. Try again."
            );
        }
    };

    const createClaimedProfileNow = async () => {
        const v = validateClaimSlug(claimSlugInput);
        setClaimSlugNormalized(v.slug);

        if (!v.ok) {
            setClaimStatus("invalid");
            setClaimMessage(v.msg);
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

            await refetchAuthUser?.();
            await refetchProfiles?.();

            const createdSlug =
                createdResp?.profile_slug ||
                createdResp?.data?.profile_slug ||
                createdResp?.raw?.profile_slug ||
                v.slug;

            setClaimStatus("created");
            setClaimMessage("Profile created ✅");
            setSelectedSlug(createdSlug);

            toast.success("Profile created.");

            setTimeout(() => {
                closeClaimPanel();
                navigate(`/profiles/edit?slug=${encodeURIComponent(createdSlug)}`);
            }, 250);
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || "Could not create profile.";
            setClaimStatus("error");
            setClaimMessage(msg);
            toast.error(msg);
        }
    };

    const createTeamsProfileNow = async () => {
        const isFirstProfile = sortedProfiles.length === 0;

        if (isFirstProfile) {
            return createClaimedProfileNow();
        }

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

            await refetchAuthUser?.();
            await refetchProfiles?.();

            const createdSlug =
                createdResp?.profile_slug ||
                createdResp?.data?.profile_slug ||
                createdResp?.raw?.profile_slug ||
                v.slug;

            setClaimStatus("created");
            setClaimMessage("Profile created ✅");
            setSelectedSlug(createdSlug);

            toast.success("Profile created.");

            setTimeout(() => closeClaimPanel(), 450);
        } catch (e) {
            const msg = e?.response?.data?.error || e?.message || "Could not create profile.";
            setClaimStatus("error");
            setClaimMessage(msg);
            toast.error(msg);
        }
    };

    const startTeamsCheckout = async () => {
        const isFirstProfile = sortedProfiles.length === 0;

        if (isFirstProfile) {
            return createClaimedProfileNow();
        }

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

            const status = Number(res?.status || 0);
            const data = res?.data || {};

            if (status >= 400) {
                setClaimStatus("error");
                setClaimMessage(data?.error || "Could not start checkout.");
                toast.error(data?.error || "Could not start checkout.");
                return;
            }

            const url = data?.url || data?.checkoutUrl || data?.sessionUrl || data?.redirectUrl;

            if (url) {
                window.location.href = url;
                return;
            }

            if (data?.updated || data?.created || data?.mode === "subscription_update") {
                await refetchAuthUser?.();
                await refetchProfiles?.();

                const createdSlug =
                    data?.profile?.profile_slug ||
                    data?.profile?.data?.profile_slug ||
                    v.slug;

                setSelectedSlug(createdSlug);
                setClaimStatus("created");
                setClaimMessage("Profile created ✅");

                toast.success("Profile created.");

                setTimeout(() => closeClaimPanel(), 450);
                return;
            }

            setClaimStatus("error");
            setClaimMessage(data?.error || "Checkout was created but no redirect URL was returned.");
            toast.error(data?.error || "Checkout redirect URL missing.");
        } catch (e) {
            const msg =
                e?.response?.data?.error || e?.message || "Could not start checkout.";
            setClaimStatus("error");
            setClaimMessage(msg);
            toast.error(msg);
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

            toast.success("Plan updated.");

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

    const isInteractiveTarget = (target) => {
        if (!(target instanceof Element)) return false;
        return !!target.closest(
            "button, a, input, textarea, select, label, [data-no-rail-drag='true']"
        );
    };

    const handleRailPointerDown = (e) => {
        const rail = railRef.current;
        if (!rail) return;

        if (isInteractiveTarget(e.target)) {
            pointerDownRef.current = false;
            dragActiveRef.current = false;
            return;
        }

        pointerDownRef.current = true;
        dragActiveRef.current = false;
        suppressClickRef.current = false;
        dragStartXRef.current = e.clientX;
        dragStartScrollLeftRef.current = rail.scrollLeft;
    };

    const handleRailPointerMove = (e) => {
        const rail = railRef.current;
        if (!rail || !pointerDownRef.current) return;

        const dx = e.clientX - dragStartXRef.current;

        if (!dragActiveRef.current && Math.abs(dx) > DRAG_THRESHOLD) {
            dragActiveRef.current = true;
            suppressClickRef.current = true;
            rail.classList.add("is-dragging");
        }

        if (!dragActiveRef.current) return;

        e.preventDefault();
        rail.scrollLeft = dragStartScrollLeftRef.current - dx;
    };

    const handleRailPointerUp = () => {
        const rail = railRef.current;

        pointerDownRef.current = false;
        dragActiveRef.current = false;

        if (rail) rail.classList.remove("is-dragging");

        window.setTimeout(() => {
            suppressClickRef.current = false;
        }, 0);
    };

    const handleRailPointerLeave = () => {
        const rail = railRef.current;
        pointerDownRef.current = false;
        dragActiveRef.current = false;

        if (rail) rail.classList.remove("is-dragging");

        window.setTimeout(() => {
            suppressClickRef.current = false;
        }, 0);
    };

    const handleCardSelect = (slug, locked) => {
        if (suppressClickRef.current) return;
        if (locked) return openLockedOverlay(slug);
        setSelectedSlug(slug);
    };

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
                        <p className="profiles-muted">
                            Please try again. If this keeps happening, contact support.
                        </p>

                        <div className="profiles-actions-row">
                            <button
                                type="button"
                                className="kx-btn kx-btn--black"
                                onClick={() => refetchProfiles()}
                            >
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
                    subtitle="Profiles are your public digital business cards."
                />

                <div className="profiles-grid">
                    <ProfilesList
                        railRef={railRef}
                        claimRef={claimRef}
                        suppressClickRef={suppressClickRef}
                        sortedProfiles={sortedProfiles}
                        cappedProfiles={cappedProfiles}
                        selectedProfile={selectedProfile}
                        maxProfiles={maxProfiles}
                        claimOpen={claimOpen}
                        claimSlugInput={claimSlugInput}
                        claimSlugNormalized={claimSlugNormalized}
                        claimStatus={claimStatus}
                        claimMessage={claimMessage}
                        isTeams={isTeams}
                        isPlus={isPlus}
                        isFree={isFree}
                        ProfileMiniMainPreview={ProfileMiniMainPreview}
                        onRailPointerDown={handleRailPointerDown}
                        onRailPointerMove={handleRailPointerMove}
                        onRailPointerUp={handleRailPointerUp}
                        onRailPointerLeave={handleRailPointerLeave}
                        onCardSelect={handleCardSelect}
                        onOpenLockedOverlay={openLockedOverlay}
                        onEdit={handleEdit}
                        onVisitProfile={handleVisitProfile}
                        onOpenClaim={openClaimPanel}
                        onCloseClaim={closeClaimPanel}
                        onCheckAvailability={checkSlugAvailability}
                        onCreateTeamsProfile={createTeamsProfileNow}
                        onStartTeamsCheckout={startTeamsCheckout}
                        onClaimInputChange={(value) => {
                            setClaimSlugInput(value);
                            setClaimStatus("idle");
                            setClaimMessage("");
                        }}
                    />

                    {selectedProfile ? (
                        <ProfilesInfo
                            selectedProfile={selectedProfile}
                            selectedPublicUrl={selectedPublicUrl}
                            onCopyLink={copyLink}
                            onDownloadQr={handleDownloadQr}
                            onFacebook={shareToFacebook}
                            onInstagram={shareToInstagram}
                            onMessenger={shareToMessenger}
                            onWhatsApp={shareToWhatsApp}
                            onText={shareByText}
                            onAppleWallet={handleAppleWallet}
                            onGoogleWallet={handleGoogleWallet}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <section className="profiles-card profiles-emptyInfoCard">
                            <div className="profiles-emptyInfoHead">
                                <h2 className="profiles-card-title">Profile details</h2>
                                <p className="profiles-muted">
                                    Once you create a profile, your public link, QR code, sharing tools
                                    and actions will show here.
                                </p>
                            </div>

                            <div className="profiles-emptyInfoPanel">
                                <div className="profiles-emptyInfoBlock">
                                    <div className="profiles-emptyInfoLabel">Public link</div>
                                    <div className="profiles-emptyInfoValue">
                                        Create a profile to generate your link.
                                    </div>
                                </div>

                                <div className="profiles-emptyInfoBlock">
                                    <div className="profiles-emptyInfoLabel">QR code</div>
                                    <div className="profiles-emptyInfoValue">
                                        Your QR code will appear here once your first profile is created.
                                    </div>
                                </div>

                                <div className="profiles-emptyInfoBlock">
                                    <div className="profiles-emptyInfoLabel">Share tools</div>
                                    <div className="profiles-emptyInfoValue">
                                        Copy link, social share, wallet tools and profile actions will
                                        appear here.
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

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
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    gap: 12,
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
                                        This profile is locked
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 500,
                                            color: "rgba(15,23,42,0.75)",
                                        }}
                                    >
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

                            <div
                                style={{
                                    marginTop: 12,
                                    fontSize: 13,
                                    color: "rgba(15,23,42,0.85)",
                                    lineHeight: 1.5,
                                }}
                            >
                                {overlayLimitText}{" "}
                                {lockedCount > 0 ? (
                                    <>
                                        You currently have <strong>{lockedCount}</strong> profile
                                        {lockedCount === 1 ? "" : "s"} locked.
                                    </>
                                ) : null}
                            </div>

                            <div
                                style={{
                                    marginTop: 10,
                                    fontSize: 13,
                                    color: "rgba(15,23,42,0.85)",
                                    lineHeight: 1.5,
                                }}
                            >
                                To unlock your old profiles, upgrade back to <strong>Teams</strong>. If
                                you don’t upgrade, your locked profiles will be permanently removed in{" "}
                                <strong>30 days</strong>.
                            </div>

                            {lockedClickedSlug ? (
                                <div
                                    style={{
                                        marginTop: 10,
                                        fontSize: 12,
                                        color: "rgba(15,23,42,0.6)",
                                    }}
                                >
                                    Locked profile: <strong>{lockedClickedSlug}</strong>
                                </div>
                            ) : null}

                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    marginTop: 16,
                                    justifyContent: "flex-end",
                                    flexWrap: "wrap",
                                }}
                            >
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