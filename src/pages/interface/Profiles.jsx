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

/* ---------------------------
   Small inline icons
--------------------------- */
function ActionIcon({ children }) {
    return <span className="profiles-btnIcon" aria-hidden="true">{children}</span>;
}

function IconFacebook() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.7-1.6H16.7V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H8v3h2.5v8h3Z"
            />
        </svg>
    );
}

function IconInstagram() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M7.8 3h8.4A4.8 4.8 0 0 1 21 7.8v8.4a4.8 4.8 0 0 1-4.8 4.8H7.8A4.8 4.8 0 0 1 3 16.2V7.8A4.8 4.8 0 0 1 7.8 3Zm0 1.8A3 3 0 0 0 4.8 7.8v8.4a3 3 0 0 0 3 3h8.4a3 3 0 0 0 3-3V7.8a3 3 0 0 0-3-3H7.8Zm8.9 1.3a1.1 1.1 0 1 1 0 2.2a1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2A3.2 3.2 0 0 0 12 8.8Z"
            />
        </svg>
    );
}

function IconMessenger() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M12 3C6.5 3 2.2 7 2.2 12.1c0 2.9 1.4 5.5 3.8 7.2V22l2.6-1.4c1.1.3 2.2.5 3.4.5 5.5 0 9.8-4 9.8-9.1S17.5 3 12 3Zm1 12.2-2.5-2.7-4.8 2.7 5.2-5.5 2.6 2.7 4.7-2.7-5.2 5.5Z"
            />
        </svg>
    );
}

function IconWhatsApp() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3 21l4.8-1.2A8.8 8.8 0 1 0 12 3.2Zm0 16a7.2 7.2 0 0 1-3.7-1l-.3-.2-2.8.7.8-2.7-.2-.3A7.2 7.2 0 1 1 12 19.2Zm4-5.4c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1l-.4.5c-.1.1-.2.2-.4.1-.9-.4-1.7-1-2.4-1.8-.2-.2 0-.4.1-.5l.3-.4c.1-.1.1-.3 0-.4l-.7-1.6c-.1-.2-.2-.2-.4-.2h-.4c-.2 0-.4.1-.5.2-.5.5-.8 1.1-.8 1.8 0 .5.2 1 .5 1.5 1.3 1.9 2.9 3.3 5.1 4.2.6.2 1.3.3 1.9.2.6-.1 1.7-.7 1.9-1.4.1-.3.1-.7 0-.8-.1-.1-.3-.2-.4-.3Z"
            />
        </svg>
    );
}

function IconSms() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M5 4h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8l-5 4v-4H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm1.2 5.1a.9.9 0 0 0 0 1.8h11.6a.9.9 0 1 0 0-1.8H6.2Zm0 4a.9.9 0 0 0 0 1.8H14a.9.9 0 1 0 0-1.8H6.2Z"
            />
        </svg>
    );
}

function IconLink() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M10.6 13.4a1 1 0 0 0 1.4 1.4l4.2-4.2a3 3 0 1 0-4.2-4.2l-1.7 1.7a1 1 0 0 0 1.4 1.4l1.7-1.7a1 1 0 1 1 1.4 1.4l-4.2 4.2Zm2.8-2.8a1 1 0 0 0-1.4-1.4l-4.2 4.2a3 3 0 1 0 4.2 4.2l1.7-1.7a1 1 0 1 0-1.4-1.4l-1.7 1.7a1 1 0 1 1-1.4-1.4l4.2-4.2Z"
            />
        </svg>
    );
}

function IconQr() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M3 3h8v8H3V3Zm2 2v4h4V5H5Zm8-2h8v8h-8V3Zm2 2v4h4V5h-4ZM3 13h8v8H3v-8Zm2 2v4h4v-4H5Zm8-2h2v2h-2v-2Zm2 2h2v2h2v2h-2v2h-2v-2h-2v-2h2v-2Zm4-2h2v2h-2v-2Zm-6 6h2v2h-2v-2Zm6 0h2v2h-2v-2Z"
            />
        </svg>
    );
}

function IconApple() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M15.1 3.6c0 1-.4 1.8-1 2.5-.7.8-1.8 1.3-2.8 1.2-.1-1 .3-2 1-2.7.7-.7 1.8-1.2 2.8-1Zm3.4 13.2c-.3.8-.7 1.5-1.2 2.2-.7 1-1.5 2.2-2.7 2.2-1 0-1.2-.6-2.6-.6-1.3 0-1.6.6-2.6.6-1.1 0-1.8-1.1-2.5-2.1-1.9-2.8-2.1-6.1-.9-8 .8-1.3 2-2 3.2-2 1 0 1.9.6 2.8.6.9 0 1.5-.6 2.8-.6 1 0 2 .5 2.8 1.5-2.4 1.3-2 4.7.9 6.2Z"
            />
        </svg>
    );
}

function IconGoogle() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M21.8 12.2c0-.7-.1-1.2-.2-1.8H12v3.4h5.5c-.1.8-.9 2.1-2.5 2.9l-.1 1.1 2.8 2.2.2.1c2.1-1.9 3.3-4.7 3.3-7.9ZM12 22c2.8 0 5.2-.9 6.9-2.5l-3.3-2.6c-.9.6-2 1-3.6 1-2.7 0-5-1.8-5.8-4.2l-1 .1-2.9 2.3v.1C4 19.7 7.7 22 12 22ZM6.2 13.7c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7l-.1-1.1-3-2.3H3c-.7 1.4-1 2.9-1 4.5s.4 3.1 1 4.5l3.2-2.4ZM12 5.9c2 0 3.3.8 4.1 1.6l3-2.9C17.2 2.8 14.8 2 12 2C7.7 2 4 4.3 2.1 7.9l3.1 2.4C7 7.7 9.3 5.9 12 5.9Z"
            />
        </svg>
    );
}

function IconEdit() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M4 17.2V20h2.8l8.3-8.3-2.8-2.8L4 17.2Zm13.7-8.9c.4-.4.4-1 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.3 1.3 2.8 2.8 1.5-1.1Z"
            />
        </svg>
    );
}

function IconTrash() {
    return (
        <svg viewBox="0 0 24 24" className="profiles-btnIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v8h-2V9Zm4 0h2v8h-2V9ZM7 9h2v8H7V9Zm1 12a2 2 0 0 1-2-2V8h12v11a2 2 0 0 1-2 2H8Z"
            />
        </svg>
    );
}

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
        buttonTextColor: safeLower(c?.button_text_color) === "black" ? "#111827" : "#ffffff",
        textAlignment: safeLower(c?.text_alignment || "left"),
    };
};

function ProfileMiniMainPreview({ card }) {
    const p = getMainPreviewData(card);
    const isDark = p.themeMode === "dark";

    return (
        <div className={`profiles-mini ${isDark ? "is-dark" : "is-light"} align-${p.textAlignment}`}>
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

    const { data: cards, isLoading, isError, refetch: refetchProfiles } = useMyProfiles();
    const createProfile = useCreateProfile();
    const deleteProfile = useDeleteProfile();

    const railRef = useRef(null);
    const dragActiveRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragStartScrollLeftRef = useRef(0);

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

    const lockedCount = useMemo(
        () => Math.max(0, cappedProfiles.length - maxProfiles),
        [cappedProfiles.length, maxProfiles]
    );

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
        setTimeout(() => claimRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" }), 50);
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

            const status = Number(res?.status || 0);
            const data = res?.data || {};

            if (status >= 400) {
                setClaimStatus("error");
                setClaimMessage(data?.error || "Could not start checkout.");
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
                setTimeout(() => closeClaimPanel(), 450);
                return;
            }

            setClaimStatus("error");
            setClaimMessage(data?.error || "Checkout was created but no redirect URL was returned.");
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

    const handleRailPointerDown = (e) => {
        const rail = railRef.current;
        if (!rail) return;

        dragActiveRef.current = true;
        dragStartXRef.current = e.clientX;
        dragStartScrollLeftRef.current = rail.scrollLeft;

        rail.classList.add("is-dragging");
        try {
            rail.setPointerCapture?.(e.pointerId);
        } catch { }
    };

    const handleRailPointerMove = (e) => {
        const rail = railRef.current;
        if (!rail || !dragActiveRef.current) return;

        const dx = e.clientX - dragStartXRef.current;
        rail.scrollLeft = dragStartScrollLeftRef.current - dx;
    };

    const handleRailPointerUp = (e) => {
        const rail = railRef.current;
        dragActiveRef.current = false;
        if (!rail) return;

        rail.classList.remove("is-dragging");
        try {
            rail.releasePointerCapture?.(e.pointerId);
        } catch { }
    };

    const handleRailPointerLeave = () => {
        const rail = railRef.current;
        dragActiveRef.current = false;
        if (!rail) return;
        rail.classList.remove("is-dragging");
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
                                    <p className="profiles-listSub">Drag sideways to browse your cards.</p>
                                </div>

                                <span className="profiles-countPill">
                                    {sortedProfiles.length} Profile{sortedProfiles.length === 1 ? "" : "s"}
                                </span>
                            </div>

                            <div className="profiles-listDivider" />

                            <div
                                ref={railRef}
                                className="profiles-listRail"
                                onPointerDown={handleRailPointerDown}
                                onPointerMove={handleRailPointerMove}
                                onPointerUp={handleRailPointerUp}
                                onPointerCancel={handleRailPointerUp}
                                onPointerLeave={handleRailPointerLeave}
                            >
                                {cappedProfiles.map((p) => {
                                    const active = selectedProfile?.slug === p.slug;
                                    const locked = p.isLockedByPlan;

                                    return (
                                        <article
                                            key={p.slug}
                                            className={`profiles-profileCard profiles-profileCard--rail ${active ? "is-active" : ""} ${locked ? "is-locked" : ""}`}
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
                                            <div className="profiles-profileTopCentered">
                                                <div className="profiles-pillRow profiles-pillRow--centered">
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

                                                <div className="profiles-slug profiles-slug--centered">{p.slug}</div>
                                                <div className="profiles-updated profiles-updated--centered">{p.updatedAt}</div>
                                            </div>

                                            <div className="profiles-staticFrame profiles-staticFrame--square">
                                                <div className="profiles-staticViewport">
                                                    <ProfileMiniMainPreview card={p.raw} />
                                                </div>
                                            </div>

                                            <div className="profiles-profileBottom">
                                                <div className="profiles-metrics profiles-metrics--card">
                                                    <div className="profiles-metric">
                                                        <div className="profiles-metricVal">{p.views}</div>
                                                        <div className="profiles-metricLab">Views</div>
                                                    </div>

                                                    <div className="profiles-metric">
                                                        <div className="profiles-metricVal">{p.linkTaps}</div>
                                                        <div className="profiles-metricLab">Link Taps</div>
                                                    </div>
                                                </div>

                                                <div className="profiles-cardBtns profiles-cardBtns--stack">
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
                                            </div>
                                        </article>
                                    );
                                })}

                                {!claimOpen ? (
                                    <button
                                        type="button"
                                        className="profiles-addCard profiles-addCard--rail profiles-addCard--pretty"
                                        onClick={openClaimPanel}
                                    >
                                        <div className="profiles-addCardInner">
                                            <div className="profiles-addBadge">New</div>
                                            <div className="profiles-addHero">
                                                <div className="profiles-addHeroIcon">＋</div>
                                            </div>
                                            <div className="profiles-addHeadline">Add Profile</div>
                                            <div className="profiles-addSubcopy">
                                                Claim a new public link for another service, team, or location.
                                            </div>
                                            <div className="profiles-addFeatureList">
                                                <div className="profiles-addFeature">Unique link</div>
                                                <div className="profiles-addFeature">Own QR code</div>
                                                <div className="profiles-addFeature">Separate analytics</div>
                                            </div>
                                            <div className="profiles-addPrimaryCta">Claim your link</div>
                                        </div>
                                    </button>
                                ) : (
                                    <div ref={claimRef} className="profiles-addInline profiles-addInline--rail profiles-addInline--pretty">
                                        <div className="profiles-addInlineHead">
                                            <div>
                                                <div className="profiles-addInlineEyebrow">Create new profile</div>
                                                <div className="profiles-addInlineTitle">Claim your link</div>
                                            </div>

                                            <button
                                                type="button"
                                                className="profiles-addInlineClose"
                                                onClick={closeClaimPanel}
                                                aria-label="Close"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="profiles-addInlineIntro">
                                            Pick a clean public URL for this profile. This will be the link customers visit.
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
                                                    claimStatus === "checking" ||
                                                    claimStatus === "subscribing" ||
                                                    claimStatus === "creating"
                                                }
                                            >
                                                {claimStatus === "checking" ? "Checking..." : "Check availability"}
                                            </button>
                                        </div>

                                        {claimSlugNormalized ? (
                                            <div className="profiles-claimPreviewRow">
                                                <span className="profiles-claimPreviewLabel">Preview</span>
                                                <span className="profiles-claimPreviewUrl">
                                                    {window.location.origin}/u/{claimSlugNormalized || "your-link"}
                                                </span>
                                            </div>
                                        ) : null}

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
                                                <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={shareToFacebook}>
                                                    <ActionIcon><IconFacebook /></ActionIcon>
                                                    <span>Share on Facebook</span>
                                                </button>

                                                <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={shareToInstagram}>
                                                    <ActionIcon><IconInstagram /></ActionIcon>
                                                    <span>Share on Instagram</span>
                                                </button>

                                                <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={shareToMessenger}>
                                                    <ActionIcon><IconMessenger /></ActionIcon>
                                                    <span>Share on Messenger</span>
                                                </button>

                                                <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={shareToWhatsApp}>
                                                    <ActionIcon><IconWhatsApp /></ActionIcon>
                                                    <span>Share on WhatsApp</span>
                                                </button>

                                                <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={shareByText}>
                                                    <ActionIcon><IconSms /></ActionIcon>
                                                    <span>Share by text</span>
                                                </button>

                                                <button type="button" className="kx-btn kx-btn--black profiles-actionBtn" onClick={() => copyLink(selectedPublicUrl)}>
                                                    <ActionIcon><IconLink /></ActionIcon>
                                                    <span>Copy link</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="profiles-actionsDivider" />

                                        <div className="profiles-actionGroup">
                                            <h3 className="profiles-groupTitle">QR code</h3>

                                            <div className="profiles-qrWrap profiles-qrWrap--wide">
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

                                            <div className="profiles-singleAction profiles-singleAction--wide">
                                                <button
                                                    type="button"
                                                    className="kx-btn kx-btn--white profiles-actionBtn profiles-actionBtn--wide"
                                                    onClick={handleDownloadQr}
                                                >
                                                    <ActionIcon><IconQr /></ActionIcon>
                                                    <span>Download QR code</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="profiles-actionsDivider" />

                                        <div className="profiles-actionGroup">
                                            <h3 className="profiles-groupTitle">Save to wallet</h3>

                                            <div className="profiles-actionGrid profiles-actionGrid--two">
                                                <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={handleAppleWallet}>
                                                    <ActionIcon><IconApple /></ActionIcon>
                                                    <span>Add to Apple Wallet</span>
                                                </button>

                                                <button type="button" className="kx-btn kx-btn--white profiles-actionBtn" onClick={handleGoogleWallet}>
                                                    <ActionIcon><IconGoogle /></ActionIcon>
                                                    <span>Add to Google Wallet</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="profiles-actionsDivider" />

                                        <div className="profiles-actionGroup">
                                            <h3 className="profiles-groupTitle">Manage profile</h3>

                                            <div className="profiles-actionGrid profiles-actionGrid--two">
                                                <button
                                                    type="button"
                                                    className="kx-btn kx-btn--white profiles-actionBtn"
                                                    onClick={() => handleEdit(selectedProfile.slug)}
                                                >
                                                    <ActionIcon><IconEdit /></ActionIcon>
                                                    <span>Edit profile</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    className="kx-btn kx-btn--white profiles-deleteBtn profiles-actionBtn"
                                                    onClick={() => handleDelete(selectedProfile.slug)}
                                                >
                                                    <ActionIcon><IconTrash /></ActionIcon>
                                                    <span>Delete</span>
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