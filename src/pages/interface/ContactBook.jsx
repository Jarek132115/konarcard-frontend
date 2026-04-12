import React, { useMemo, useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@base-ui/react/input";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import ShareProfile from "../../components/ShareProfile";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useMyProfiles } from "../../hooks/useBusinessCard";

import "../../styling/spacing.css";
import "../../styling/dashboard/contactbook.css";

import DeleteIcon from "../../assets/icons/ShareOnDelete.svg";
import SaveIcon from "../../assets/icons/SaveProfileIcon.svg";
import ContactBookPhoneIcon from "../../assets/icons/ContactBookPhone.svg";
import ContactBookEmailIcon from "../../assets/icons/ContactBookEmail.svg";

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const centerTrim = (v) => (v ?? "").toString().trim();
const safeLower = (v) => centerTrim(v).toLowerCase();

const normalizeSlug = (raw) =>
    safeLower(raw)
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

function safeDate(d) {
    try {
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "";
        return dt.toISOString().slice(0, 10);
    } catch {
        return "";
    }
}

function prettyDate(d) {
    try {
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return "—";
        return dt.toLocaleDateString("en-GB");
    } catch {
        return "—";
    }
}

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="cb-searchIcon">
            <path
                d="M10.5 18a7.5 7.5 0 1 1 5.303-12.803A7.5 7.5 0 0 1 10.5 18Zm0-13a5.5 5.5 0 1 0 3.89 1.61A5.5 5.5 0 0 0 10.5 5Zm8.707 14.293-4.05-4.05 1.414-1.414 4.05 4.05-1.414 1.414Z"
                fill="currentColor"
            />
        </svg>
    );
}

function ClearIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14">
            <path
                d="M18 6 6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function getInitials(name = "") {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function escapeVCardValue(value = "") {
    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
}

function sanitizeFileName(value = "") {
    const clean = String(value || "")
        .trim()
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
        .replace(/\s+/g, "-");
    return clean || "contact";
}

function buildPublicProfileUrl(profileSlug = "") {
    if (!nonEmpty(profileSlug) || typeof window === "undefined") return "";
    return `${window.location.origin}/u/${encodeURIComponent(profileSlug.trim())}`;
}

function buildVCard(contact) {
    const fullName = nonEmpty(contact?.name) ? contact.name.trim() : "Unknown Contact";
    const email = nonEmpty(contact?.email) ? contact.email.trim() : "";
    const phone = nonEmpty(contact?.phone) ? contact.phone.trim() : "";
    const profile = nonEmpty(contact?.profile) ? contact.profile.trim() : "";
    const profileUrl = buildPublicProfileUrl(profile);
    const received = nonEmpty(contact?.received) ? contact.received.trim() : "";
    const message = nonEmpty(contact?.message) ? contact.message.trim() : "";

    const noteParts = [
        profile ? `KonarCard profile: ${profile}` : "",
        profileUrl ? `Profile link: ${profileUrl}` : "",
        received ? `Received: ${received}` : "",
        message ? `Message: ${message}` : "",
    ].filter(Boolean);

    const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${escapeVCardValue(fullName)}`,
        `N:${escapeVCardValue(fullName)};;;;`,
    ];

    if (phone) lines.push(`TEL;TYPE=CELL:${escapeVCardValue(phone)}`);
    if (email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardValue(email)}`);
    if (noteParts.length) lines.push(`NOTE:${escapeVCardValue(noteParts.join("\n"))}`);
    if (profileUrl) lines.push(`URL:${escapeVCardValue(profileUrl)}`);
    lines.push("END:VCARD");

    return lines.join("\r\n");
}

function isLikelyMobileDevice() {
    if (typeof navigator === "undefined") return false;
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
}

function buildPublicUrl(profileSlug) {
    const s = normalizeSlug(profileSlug);
    if (!s) return `${window.location.origin}/u/`;
    return `${window.location.origin}/u/${encodeURIComponent(s)}`;
}

// Avatar color palette — cycles through 5 combos
const AVATAR_COLORS = [
    { bg: "rgba(99,102,241,0.12)", color: "#3730a3" },
    { bg: "rgba(249,115,22,0.12)", color: "#c2410c" },
    { bg: "rgba(20,184,166,0.12)", color: "#0f766e" },
    { bg: "rgba(239,68,68,0.12)", color: "#991b1b" },
    { bg: "rgba(59,130,246,0.12)", color: "#1d4ed8" },
];

function ContactAvatar({ name, index }) {
    const palette = AVATAR_COLORS[index % AVATAR_COLORS.length];
    return (
        <div
            className="cb-avatar"
            style={{ background: palette.bg, color: palette.color }}
            aria-hidden="true"
        >
            {getInitials(name)}
        </div>
    );
}

// Card animation variants
const listItemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.97 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 },
    }),
    exit: { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.18, ease: "easeIn" } },
};

const detailVariants = {
    hidden: { opacity: 0, x: 12 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -8, transition: { duration: 0.18, ease: "easeIn" } },
};

const panelVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
};

export default function ContactBook() {
    const { data: authUser } = useAuthUser();
    const { data: cards } = useMyProfiles();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [visibleCount, setVisibleCount] = useState(10);
    const [isCompact, setIsCompact] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth <= 1240 : false
    );
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [shareOpen, setShareOpen] = useState(false);
    const [selectedSlug, setSelectedSlug] = useState(null);

    const searchRef = useRef(null);

    const profilesForShare = useMemo(() => {
        const xs = Array.isArray(cards) ? cards : [];
        return xs
            .map((c) => {
                const slug = centerTrim(c?.profile_slug);
                if (!slug) return null;
                const name =
                    centerTrim(c?.business_card_name) ||
                    centerTrim(c?.business_name) ||
                    centerTrim(c?.full_name) ||
                    (slug === "main" ? "Main Profile" : "Profile");
                return { slug, name, url: buildPublicUrl(slug) };
            })
            .filter(Boolean);
    }, [cards]);

    useEffect(() => {
        if (!profilesForShare.length) { setSelectedSlug(null); return; }
        setSelectedSlug((prev) => {
            if (prev && profilesForShare.some((p) => p.slug === prev)) return prev;
            return profilesForShare[0].slug;
        });
    }, [profilesForShare]);

    const selectedShareProfile = useMemo(() => {
        if (!profilesForShare.length) return null;
        return profilesForShare.find((p) => p.slug === selectedSlug) || profilesForShare[0];
    }, [profilesForShare, selectedSlug]);

    useEffect(() => {
        const onResize = () => setIsCompact(window.innerWidth <= 1240);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const { data: exchanges, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["contact-exchanges"],
        queryFn: async () => {
            const res = await api.get("/contact-exchanges");
            const status = Number(res?.status || 0);
            if (status >= 400) throw new Error(res?.data?.error || "Failed to load contacts.");
            const payload = res?.data;
            return Array.isArray(payload) ? payload : [];
        },
        enabled: !!authUser,
        staleTime: 60 * 1000,
        retry: 1,
    });

    const contacts = useMemo(() => {
        const xs = Array.isArray(exchanges) ? exchanges : [];
        return xs.map((x) => ({
            id: x._id,
            name: x.visitor_name || "Unknown Visitor",
            email: x.visitor_email || "",
            phone: x.visitor_phone || "",
            message: x.message || "",
            profile: x.profile_slug || "",
            source: "exchange_contact",
            firstSeen: safeDate(x.createdAt),
            received: prettyDate(x.createdAt),
            raw: x,
        }));
    }, [exchanges]);

    useEffect(() => {
        if (!selectedId && contacts.length > 0) { setSelectedId(contacts[0].id); return; }
        if (selectedId && contacts.length > 0) {
            if (!contacts.some((c) => c.id === selectedId)) setSelectedId(contacts[0].id);
        }
        if (!contacts.length) setSelectedId(null);
    }, [contacts, selectedId]);

    useEffect(() => { setVisibleCount(10); }, [search]);

    const selected = useMemo(() => {
        if (!contacts.length) return null;
        return contacts.find((c) => c.id === selectedId) || contacts[0] || null;
    }, [contacts, selectedId]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return contacts;
        return contacts.filter((c) =>
            [c.name, c.email, c.phone, c.message, c.profile]
                .filter(Boolean).join(" ").toLowerCase().includes(q)
        );
    }, [contacts, search]);

    const displayedContacts = useMemo(() => {
        if (!isCompact) return filtered;
        return filtered.slice(0, visibleCount);
    }, [filtered, isCompact, visibleCount]);

    const deleteContact = async (id) => {
        if (!id || isDeleting) return;
        try {
            setIsDeleting(true);
            const res = await api.delete(`/contact-exchanges/${id}`);
            const status = Number(res?.status || 0);
            if (status >= 400) throw new Error(res?.data?.error || "Failed to delete contact");
            toast.success("Contact deleted");
            setConfirmDeleteId(null);
            await queryClient.invalidateQueries({ queryKey: ["contact-exchanges"] });
        } catch (err) {
            toast.error(err?.response?.data?.error || err?.message || "Failed to delete contact");
        } finally {
            setIsDeleting(false);
        }
    };

    const saveSelectedContact = async () => {
        if (!selected) { toast.error("Select a contact first."); return; }
        if (!nonEmpty(selected.name) && !nonEmpty(selected.phone) && !nonEmpty(selected.email)) {
            toast.error("This contact doesn't have enough information to save.");
            return;
        }
        try {
            const vcard = buildVCard(selected);
            const fileName = `${sanitizeFileName(selected.name)}.vcf`;
            const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
            const file = new File([blob], fileName, { type: "text/vcard" });

            if (
                typeof navigator !== "undefined" &&
                navigator.share &&
                typeof navigator.canShare === "function" &&
                navigator.canShare({ files: [file] })
            ) {
                try {
                    await navigator.share({ files: [file], title: selected.name || "Contact", text: "Save contact" });
                    return;
                } catch (shareError) {
                    if (shareError?.name === "AbortError") return;
                }
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            if (isLikelyMobileDevice()) { link.target = "_self"; link.rel = "noopener"; }
            else link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1500);
            if (!isLikelyMobileDevice()) toast.success("Contact file opened/downloaded.");
        } catch (err) {
            toast.error(err?.message || "Couldn't prepare this contact.");
        }
    };

    const handleOpenShareProfile = () => {
        if (!selectedShareProfile) { toast.error("Create a profile first."); return; }
        setShareOpen(true);
    };

    const shareToFacebook = () => {
        if (!selectedShareProfile?.url) { toast.error("No profile link available yet."); return; }
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(selectedShareProfile.url)}`, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToInstagram = async () => {
        if (!selectedShareProfile?.url) { toast.error("No profile link available yet."); return; }
        try { await navigator.clipboard.writeText(selectedShareProfile.url); toast.success("Profile link copied for Instagram sharing."); }
        catch { toast.error("Could not copy the link."); }
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    };

    const shareToMessenger = async () => {
        if (!selectedShareProfile?.url) { toast.error("No profile link available yet."); return; }
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
        if (isMobile) {
            try { await navigator.clipboard.writeText(selectedShareProfile.url); toast.success("Messenger sharing is not supported on mobile browsers. Link copied instead."); }
            catch { toast.error("Could not copy the link."); }
            return;
        }
        window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(selectedShareProfile.url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(selectedShareProfile.url)}`, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToWhatsApp = () => {
        if (!selectedShareProfile?.url) { toast.error("No profile link available yet."); return; }
        window.open(`https://wa.me/?text=${encodeURIComponent(`Check out my profile: ${selectedShareProfile.url}`)}`, "_blank", "noopener,noreferrer");
    };

    const shareByText = () => {
        if (!selectedShareProfile?.url) { toast.error("No profile link available yet."); return; }
        window.location.href = `sms:?&body=${encodeURIComponent(`Check out my profile: ${selectedShareProfile.url}`)}`;
    };

    const showEmpty = !isLoading && !isError && contacts.length === 0;
    const showDeleteConfirm = !!selected && confirmDeleteId === selected.id;

    return (
        <DashboardLayout hideDesktopHeader>
            <div className="cb-shell">
                <PageHeader
                    title="Contact Book"
                    subtitle="People who exchanged their details from your public KonarCard profile."
                    onShareClick={handleOpenShareProfile}
                    shareDisabled={!selectedShareProfile}
                />

                <ShareProfile
                    isOpen={shareOpen}
                    onClose={() => setShareOpen(false)}
                    profiles={profilesForShare}
                    selectedSlug={selectedSlug}
                    onSelectSlug={setSelectedSlug}
                    username={authUser?.name || "konarcard"}
                    profileUrl={selectedShareProfile?.url || ""}
                    onFacebook={shareToFacebook}
                    onInstagram={shareToInstagram}
                    onMessenger={shareToMessenger}
                    onWhatsApp={shareToWhatsApp}
                    onText={shareByText}
                    onAppleWallet={() => toast("Apple Wallet is coming soon.")}
                    onGoogleWallet={() => toast("Google Wallet is coming soon.")}
                />

                <div className="cb-grid">
                    {/* ── LIST PANEL ── */}
                    <section className="cb-card cb-listCard">
                        <motion.div
                            className="cb-card-head cb-card-head--row"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="cb-titleWrap">
                                <h2 className="cb-card-title">My Contacts</h2>
                                <p className="cb-muted">
                                    {isLoading
                                        ? "Loading…"
                                        : `${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`}
                                </p>
                            </div>

                            {/* Base UI search input */}
                            <div className="cb-searchWrap">
                                <SearchIcon />
                                <Input
                                    ref={searchRef}
                                    className="cb-searchInput"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search contacts…"
                                    aria-label="Search contacts"
                                />
                                <AnimatePresence>
                                    {search.length > 0 && (
                                        <motion.button
                                            className="cb-searchClear"
                                            type="button"
                                            aria-label="Clear search"
                                            onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                                            initial={{ opacity: 0, scale: 0.7 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.7 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <ClearIcon />
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {isError ? (
                            <motion.div
                                className="cb-inlineState cb-error"
                                variants={panelVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <div className="cb-inlineTitle">Couldn't load contacts</div>
                                <div className="cb-inlineText">{error?.message || "Something went wrong."}</div>
                                <div className="profiles-actions-row" style={{ marginTop: 12 }}>
                                    <button type="button" className="kx-btn kx-btn--black" onClick={() => refetch()}>
                                        Retry
                                    </button>
                                </div>
                            </motion.div>
                        ) : showEmpty ? (
                            <motion.div
                                className="cb-inlineState cb-emptyState"
                                variants={panelVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <div className="cb-inlineTitle">No contacts yet</div>
                                <div className="cb-inlineText">
                                    This page will populate when someone uses{" "}
                                    <strong>Exchange Contact</strong> on your public profile.
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                <div className="cb-listWrap" aria-busy={isLoading ? "true" : "false"}>
                                    <div className="cb-list">
                                        {isLoading ? (
                                            <>
                                                {[...Array(4)].map((_, i) => (
                                                    <div key={i} className="cb-skelItem" />
                                                ))}
                                            </>
                                        ) : (
                                            <AnimatePresence mode="popLayout">
                                                {displayedContacts.length > 0 ? (
                                                    displayedContacts.map((c, i) => (
                                                        <motion.button
                                                            key={c.id}
                                                            type="button"
                                                            className={`cb-contactCard ${selected?.id === c.id ? "is-active" : ""}`}
                                                            onClick={() => {
                                                                setSelectedId(c.id);
                                                                setConfirmDeleteId(null);
                                                            }}
                                                            custom={i}
                                                            variants={listItemVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            exit="exit"
                                                            whileHover={selected?.id !== c.id ? {
                                                                y: -2,
                                                                boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                                                                transition: { duration: 0.18, ease: "easeOut" },
                                                            } : {}}
                                                            whileTap={{ scale: 0.99 }}
                                                            layout
                                                        >
                                                            <div className="cb-contactCardTop">
                                                                <ContactAvatar name={c.name} index={i} />
                                                                <div className="cb-contactCardInfo">
                                                                    <div className="cb-contactCard-title">{c.name || "Unknown"}</div>
                                                                    <div className="cb-contactDate">
                                                                        {c.received || "—"}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="cb-contactMetaGroup">
                                                                <div className="cb-contactMeta cb-contactMeta--withIcon">
                                                                    <img src={ContactBookPhoneIcon} alt="" aria-hidden="true" className="cb-contactMetaIcon" />
                                                                    <span>{nonEmpty(c.phone) ? c.phone : "No phone"}</span>
                                                                </div>
                                                                <div className="cb-contactMeta cb-contactMeta--withIcon">
                                                                    <img src={ContactBookEmailIcon} alt="" aria-hidden="true" className="cb-contactMetaIcon" />
                                                                    <span>{nonEmpty(c.email) ? c.email : "No email"}</span>
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    ))
                                                ) : (
                                                    <motion.div
                                                        className="cb-empty-inline"
                                                        key="no-results"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                    >
                                                        No contacts match "{search}".
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        )}
                                    </div>
                                </div>

                                {isCompact && visibleCount < filtered.length ? (
                                    <motion.button
                                        type="button"
                                        className="cb-viewMore"
                                        onClick={() => setVisibleCount((v) => v + 10)}
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        View More ({filtered.length - visibleCount} remaining)
                                    </motion.button>
                                ) : null}
                            </>
                        )}
                    </section>

                    {/* ── DETAIL PANEL ── */}
                    <section className="cb-card cb-detailCard">
                        <motion.div
                            className="cb-card-head cb-card-head--stack"
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
                        >
                            <div className="cb-titleWrap">
                                <h2 className="cb-card-title">Details</h2>
                                <p className="cb-muted">Information submitted through Exchange Contact.</p>
                            </div>
                        </motion.div>

                        {isLoading ? (
                            <div className="cb-detailBody">
                                <div className="cb-detailPanel cb-detailPanel--skeleton">
                                    <div className="cb-skelHead" />
                                    <div className="cb-skelRow" />
                                    <div className="cb-skelRow" />
                                    <div className="cb-skelRow" />
                                    <div className="cb-skelRow" />
                                    <div className="cb-skelNote" />
                                </div>
                            </div>
                        ) : isError ? (
                            <motion.div className="cb-inlineState cb-error" variants={panelVariants} initial="hidden" animate="visible">
                                <div className="cb-inlineTitle">Details unavailable</div>
                                <div className="cb-inlineText">Fix the error on the left and try again.</div>
                            </motion.div>
                        ) : showEmpty ? (
                            <motion.div className="cb-inlineState cb-emptyState" variants={panelVariants} initial="hidden" animate="visible">
                                <div className="cb-inlineTitle">Nothing to show</div>
                                <div className="cb-inlineText">When you receive contacts, they'll appear here.</div>
                            </motion.div>
                        ) : !selected ? (
                            <motion.div className="cb-inlineState cb-emptyState" variants={panelVariants} initial="hidden" animate="visible">
                                <div className="cb-inlineTitle">Select a contact</div>
                                <div className="cb-inlineText">Pick someone from the list to view their details.</div>
                            </motion.div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selected.id}
                                    className="cb-detailBody"
                                    variants={detailVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                >
                                    <div className="cb-detailPanel">
                                        {/* Detail header with avatar */}
                                        <div className="cb-detailHeader">
                                            <ContactAvatar name={selected.name} index={contacts.findIndex(c => c.id === selected.id)} />
                                            <div>
                                                <div className="cb-detailName">{selected.name || "Unknown"}</div>
                                                <div className="cb-detailReceived">Received: {selected.received || "—"}</div>
                                            </div>
                                        </div>

                                        <div className="cb-detailRows">
                                            {[
                                                { label: "Email", value: selected.email },
                                                { label: "Phone", value: selected.phone },
                                                { label: "Profile", value: selected.profile },
                                                { label: "Message", value: selected.message, isMessage: true },
                                            ].map(({ label, value, isMessage }) => (
                                                <div key={label} className={`cb-detailRow${isMessage ? " cb-detailRow--message" : ""}`}>
                                                    <div className="cb-detailLabel">{label}</div>
                                                    <div className={`cb-detailValue${isMessage ? " cb-detailValue--message" : ""}`}>
                                                        {nonEmpty(value) ? value : isMessage ? "No message." : "—"}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Delete confirmation */}
                                    <AnimatePresence>
                                        {showDeleteConfirm && (
                                            <motion.div
                                                className="cb-inlineState cb-error cb-inlineState--confirm"
                                                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                                                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                            >
                                                <div className="cb-inlineTitle">Delete this contact?</div>
                                                <div className="cb-inlineText">This cannot be undone.</div>
                                                <div className="profiles-actions-row" style={{ marginTop: 12 }}>
                                                    <button type="button" className="kx-btn kx-btn--white" onClick={() => setConfirmDeleteId(null)} disabled={isDeleting}>
                                                        Cancel
                                                    </button>
                                                    <button type="button" className="kx-btn kx-btn--black" onClick={() => deleteContact(selected.id)} disabled={isDeleting}>
                                                        {isDeleting ? "Deleting…" : "Confirm Delete"}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="cb-detailActions">
                                        <motion.button
                                            type="button"
                                            className="cb-actionBtn cb-actionBtn--delete"
                                            onClick={() => setConfirmDeleteId(selected.id)}
                                            disabled={isDeleting}
                                            whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(255,59,48,0.14)" }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <img src={DeleteIcon} alt="" aria-hidden="true" className="cb-actionIcon cb-actionIcon--delete" />
                                            <span>Delete Contact</span>
                                        </motion.button>

                                        <motion.button
                                            type="button"
                                            className="cb-actionBtn cb-actionBtn--save"
                                            onClick={saveSelectedContact}
                                            whileHover={{ y: -2, boxShadow: "0 14px 32px rgba(11,22,53,0.24)" }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <img src={SaveIcon} alt="" aria-hidden="true" className="cb-actionIcon cb-actionIcon--save" />
                                            <span>Save Contact</span>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}