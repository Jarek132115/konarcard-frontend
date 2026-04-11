import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import "../../styling/spacing.css";
import "../../styling/dashboard/dashboard.css";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import ShareProfile from "../../components/ShareProfile";

import { useAuthUser } from "../../hooks/useAuthUser";
import { useMyProfiles } from "../../hooks/useBusinessCard";
import api from "../../services/api";

import TotalVisitsIcon from "../../assets/icons/TotalVisits.svg";
import NFCTapsIcon from "../../assets/icons/NFCTaps.svg";
import QRScansIcon from "../../assets/icons/QRScans.svg";
import LinkVisitsIcon from "../../assets/icons/LinkVisits.svg";
import SharePageIcon from "../../assets/icons/SharePage.svg";
import SidebarLinkAnalyticsIcon from "../../assets/icons/SidebarLinkAnalytics.svg";

const centerTrim = (v) => (v ?? "").toString().trim();
const safeLower = (v) => centerTrim(v).toLowerCase();
const asArray = (v) => (Array.isArray(v) ? v : []);
const hasText = (v) => typeof v === "string" && v.trim().length > 0;

const normalizeSlug = (raw) =>
    safeLower(raw)
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

const buildPublicUrl = (profileSlug) => {
    const s = normalizeSlug(profileSlug);
    if (!s) return `${window.location.origin}/u/`;
    return `${window.location.origin}/u/${encodeURIComponent(s)}`;
};

function numberFormat(value) {
    return new Intl.NumberFormat("en-GB").format(Number(value) || 0);
}

function formatActivityTime(dateValue) {
    if (!dateValue) return "";
    const now = Date.now();
    const date = new Date(dateValue).getTime();
    if (Number.isNaN(date)) return "";

    const diffMs = Math.max(0, now - date);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    return `${days} day${days === 1 ? "" : "s"} ago`;
}

function humanizeSocialTarget(target = "") {
    const clean = String(target || "").trim().toLowerCase();

    if (
        clean === "facebook_url" ||
        clean === "facebook" ||
        clean === "fb" ||
        clean.includes("facebook")
    ) {
        return "Facebook";
    }

    if (
        clean === "instagram_url" ||
        clean === "instagram" ||
        clean === "ig" ||
        clean.includes("instagram")
    ) {
        return "Instagram";
    }

    if (
        clean === "linkedin_url" ||
        clean === "linkedin" ||
        clean.includes("linkedin")
    ) {
        return "LinkedIn";
    }

    if (
        clean === "x_url" ||
        clean === "twitter_url" ||
        clean === "x" ||
        clean === "twitter" ||
        clean.includes("twitter") ||
        clean.includes("x.com")
    ) {
        return "X";
    }

    if (
        clean === "tiktok_url" ||
        clean === "tiktok" ||
        clean.includes("tiktok")
    ) {
        return "TikTok";
    }

    return "";
}

function getActivityMessage(item) {
    const type = item?.event_type || item?.eventType || "";
    const name = item?.contact_name || item?.contactName || item?.name || "";
    const target =
        item?.action_target ||
        item?.actionTarget ||
        item?.target ||
        item?.social_target ||
        item?.socialTarget ||
        item?.platform ||
        "";

    switch (type) {
        case "qr_scan":
            return "Someone scanned your QR code";
        case "nfc_tap":
            return "Someone tapped your NFC card";
        case "link_open":
            return "Someone clicked your link";
        case "contact_save":
            return "Someone saved your number";
        case "contact_exchange":
        case "contact_exchange_submitted":
            return name ? `${name} exchanged contacts with you` : "Someone exchanged contacts with you";
        case "contact_exchange_opened":
            return "Someone opened your contact exchange form";
        case "email_clicked":
            return "Someone clicked your email";
        case "phone_clicked":
            return "Someone clicked your phone number";
        case "social_clicked": {
            const socialName = humanizeSocialTarget(target);
            return socialName
                ? `Someone clicked your ${socialName} profile`
                : "Someone clicked one of your social links";
        }
        case "profile_view":
            return "Someone viewed your profile";
        default:
            return item?.message || "New activity on your profile";
    }
}

function getPrimaryProfile(cards) {
    const xs = asArray(cards);
    if (!xs.length) return null;

    return (
        xs.find((c) => c?.is_default === true || c?.isDefault === true) ||
        xs.find((c) => safeLower(c?.profile_slug) === "main") ||
        xs[0]
    );
}

function computeProfileCompletion(card) {
    const works = asArray(card?.works || card?.workImages);
    const services = asArray(card?.services);
    const reviews = asArray(card?.reviews);

    const items = [
        {
            key: "coverPhoto",
            label: "Add a cover photo",
            done: hasText(card?.cover_photo) || hasText(card?.coverPhoto),
        },
        {
            key: "logo",
            label: "Add logo",
            done: hasText(card?.logo) || hasText(card?.avatar),
        },
        {
            key: "businessName",
            label: "Add business name",
            done:
                hasText(card?.business_card_name) ||
                hasText(card?.businessCardName) ||
                hasText(card?.business_name) ||
                hasText(card?.businessName) ||
                hasText(card?.main_heading) ||
                hasText(card?.mainHeading),
        },
        {
            key: "tradeTitle",
            label: "Add trade title",
            done:
                hasText(card?.trade_title) ||
                hasText(card?.tradeTitle) ||
                hasText(card?.sub_heading) ||
                hasText(card?.subHeading) ||
                hasText(card?.job_title) ||
                hasText(card?.jobTitle),
        },
        {
            key: "bio",
            label: "Add a bio",
            done: hasText(card?.bio),
        },
        {
            key: "location",
            label: "Add your location",
            done: hasText(card?.location),
        },
        {
            key: "workImages",
            label: "Add your work images",
            done: works.length > 0,
        },
        {
            key: "services",
            label: "Add your services",
            done: services.length > 0,
        },
        {
            key: "reviews",
            label: "Add your reviews",
            done: reviews.length > 0,
        },
        {
            key: "email",
            label: "Add your email",
            done:
                hasText(card?.contact_email) ||
                hasText(card?.contactEmail) ||
                hasText(card?.email),
        },
        {
            key: "phone",
            label: "Add your phone number",
            done:
                hasText(card?.phone_number) ||
                hasText(card?.phoneNumber) ||
                hasText(card?.phone),
        },
        {
            key: "socials",
            label: "Add your social medias",
            done:
                hasText(card?.facebook_url) ||
                hasText(card?.instagram_url) ||
                hasText(card?.linkedin_url) ||
                hasText(card?.x_url) ||
                hasText(card?.twitter_url) ||
                hasText(card?.tiktok_url),
        },
    ];

    const sortedItems = [...items].sort((a, b) => {
        if (a.done === b.done) return 0;
        return a.done ? 1 : -1;
    });

    const doneCount = items.filter((i) => i.done).length;
    const total = items.length;
    const percent = Math.round((doneCount / total) * 100);

    return { items: sortedItems, doneCount, total, percent };
}

function extractOrders(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.orders)) return data.orders;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function dataOrEmpty(v) {
    return v ?? [];
}

function ownsPhysicalProduct(orders) {
    const xs = extractOrders(dataOrEmpty(orders));

    return xs.some((order) => {
        const status = safeLower(order?.status);
        const quantity = Number(order?.quantity || order?.qty || 0);
        return (
            quantity > 0 ||
            status === "paid" ||
            status === "processing" ||
            status === "shipped" ||
            status === "delivered"
        );
    });
}

function ActivityPanelIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="db-panelIconSvg">
            <path
                d="M3 12h4l2-5 4 10 2-5h6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CompletionPanelIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="db-panelIconSvg">
            <path
                d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4M8.5 12.5l2.2 2.2 4.8-5.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function getInitials(name = "") {
    const parts = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!parts.length) return "KC";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

function MetricCard({ label, value, helper, featured = false, icon = null, delay = 0 }) {
    return (
        <motion.div
            className={`db-metric ${featured ? "db-metric--featured" : ""}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay, ease: "easeOut" }}
        >
            <div className="db-metric-top">
                <div className="db-metric-label">{label}</div>
                {icon ? (
                    <img
                        src={icon}
                        alt=""
                        aria-hidden="true"
                        className={`db-metric-icon ${featured ? "db-metric-icon--featured" : ""}`}
                    />
                ) : null}
            </div>

            <div className="db-metric-value">{numberFormat(value)}</div>
            <div className={`db-metric-helper ${featured ? "db-metric-helper--featured" : ""}`}>
                {helper}
            </div>
        </motion.div>
    );
}

function RecentActivityCard({ items = [] }) {
    return (
        <div className="db-panel db-panel--equal">
            <div className="db-panelHead">
                <div>
                    <div className="db-panelKickerRow">
                        <span className="db-panelIconWrap">
                            <ActivityPanelIcon />
                        </span>
                        <span className="db-panelKicker">Live activity</span>
                    </div>

                    <h3 className="db-panelTitle">Recent Activity</h3>
                    <p className="db-panelMuted">See what’s been happening on your profile recently.</p>
                </div>
            </div>

            <div className="db-activityFeedList db-activityFeedList--light">
                {items.length ? (
                    items.map((item, index) => {
                        const name =
                            item?.contact_name ||
                            item?.contactName ||
                            item?.name ||
                            "Someone";

                        return (
                            <div key={item.id || item._id || `${item.message}-${index}`} className="db-activityFeedItem">
                                <div className={`db-activityAvatar db-activityAvatar--light db-activityAvatar--${index % 5}`}>
                                    {getInitials(name)}
                                </div>

                                <div className="db-activityFeedContent">
                                    <div className="db-activityFeedText db-activityFeedText--light">
                                        {item.message}
                                    </div>
                                    <div className="db-activityFeedTime db-activityFeedTime--light">
                                        {item.timeLabel}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="db-emptyState">No recent activity yet. Share your profile to start seeing engagement.</div>
                )}
            </div>

            <div className="db-panelFooter">
                <Link to="/analytics" className="kx-btn kx-btn--black">
                    View Recent Activity
                </Link>
            </div>
        </div>
    );
}

function ProfileCompletionCard({ completion }) {
    return (
        <div className="db-panel db-panel--equal">
            <div className="db-panelHead">
                <div>
                    <div className="db-panelKickerRow">
                        <span className="db-panelIconWrap">
                            <CompletionPanelIcon />
                        </span>
                        <span className="db-panelKicker">Profile quality</span>
                    </div>

                    <h3 className="db-panelTitle">Profile Completion</h3>
                    <p className="db-panelMuted">
                        Finish your profile to look more professional and get more jobs.
                    </p>
                </div>
            </div>

            <div className="db-progressMeta">
                <span>{completion.percent}% complete</span>
                <span>
                    {completion.doneCount} of {completion.total} steps finished
                </span>
            </div>

            <div className="db-progressBar">
                <span className="db-progressFill" style={{ width: `${completion.percent}%` }} />
            </div>

            <div className="db-completeLabel">Still to do:</div>

            <div className="db-breakdownList db-breakdownList--completion">
                {completion.items.length ? (
                    completion.items.map((item) => (
                        <div key={item.key} className="db-breakdownRow">
                            <div className="db-breakdownRowMain">
                                <div className={`db-breakdownRowTitle ${item.done ? "is-done" : ""}`}>{item.label}</div>
                                <div className="db-breakdownRowMeta">
                                    {item.done ? "Completed on your profile" : "Still missing from your profile"}
                                </div>
                            </div>

                            <div className={`db-completionStatus ${item.done ? "done" : ""}`}>
                                {item.done ? "Done" : "Pending"}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="db-emptyState">
                        Start building your profile to unlock more value from KonarCard.
                    </div>
                )}
            </div>

            <div className="db-panelFooter">
                <Link to="/profiles" className="kx-btn kx-btn--black">
                    Complete Your Profile
                </Link>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { data: authUser } = useAuthUser();
    const { data: cards } = useMyProfiles();

    const displayName = authUser?.name?.split(" ")?.[0] || "there";

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

    const [shareOpen, setShareOpen] = useState(false);
    const [selectedSlug, setSelectedSlug] = useState(null);

    useEffect(() => {
        if (!profilesForShare.length) {
            setSelectedSlug(null);
            return;
        }

        setSelectedSlug((prev) => prev || profilesForShare[0].slug);
    }, [profilesForShare]);

    const selectedProfile = useMemo(() => {
        if (!profilesForShare.length) return null;
        return profilesForShare.find((p) => p.slug === selectedSlug) || profilesForShare[0];
    }, [profilesForShare, selectedSlug]);

    const primaryProfile = useMemo(() => getPrimaryProfile(cards), [cards]);
    const completion = useMemo(() => computeProfileCompletion(primaryProfile), [primaryProfile]);

    const analyticsQuery = useQuery({
        queryKey: ["dashboard-analytics-summary"],
        queryFn: async () => {
            const res = await api.get("/api/analytics/summary?days=7");
            return res.data;
        },
        staleTime: 30 * 1000,
    });

    const ordersQuery = useQuery({
        queryKey: ["dashboard-physical-orders"],
        queryFn: async () => {
            try {
                const res = await api.get("/api/nfc-orders/my-orders");
                return res.data;
            } catch {
                try {
                    const res = await api.get("/api/nfc-orders");
                    return res.data;
                } catch {
                    return [];
                }
            }
        },
        staleTime: 2 * 60 * 1000,
    });

    const metrics = analyticsQuery.data?.metrics || {
        profileViews: 0,
        cardTaps: 0,
        qrScans: 0,
        linkOpens: 0,
    };

    const recentActivityRaw =
        analyticsQuery.data?.recentActivity || analyticsQuery.data?.recentEvents || [];

    const recentActivity = recentActivityRaw.slice(0, 10).map((item, index) => ({
        id: item?.id || item?._id || `activity-${index}`,
        message: item?.message || getActivityMessage(item),
        timeLabel: formatActivityTime(item?.createdAt || item?.timestamp || item?.date),
        ...item,
    }));

    const hasPhysicalCard = useMemo(
        () => ownsPhysicalProduct(ordersQuery.data),
        [ordersQuery.data]
    );

    return (
        <DashboardLayout hideDesktopHeader>
            <div className="db-shell">
                <PageHeader
                    title="Dashboard"
                    subtitle={`Welcome back ${displayName}. Here’s how your profile is performing.`}
                    onShareClick={() => setShareOpen(true)}
                    shareDisabled={!selectedProfile}
                />

                <ShareProfile
                    isOpen={shareOpen}
                    onClose={() => setShareOpen(false)}
                    profiles={profilesForShare}
                    selectedSlug={selectedSlug}
                    onSelectSlug={setSelectedSlug}
                    username={authUser?.name || "konarcard"}
                    profileUrl={selectedProfile?.url || ""}
                />

                <motion.section
                    className="db-hero"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                >
                    <div className="db-heroCard">
                        <div className="db-heroMain">
                            <div className="db-heroBadge">Performance snapshot</div>

                            <h2 className="db-heroTitle">
                                Turn profile attention into stronger trust and more real contact action.
                            </h2>

                            <p className="db-heroText">
                                Share your profile more, finish the missing sections, and keep an eye on
                                how people interact with your KonarCard across taps, scans and links.
                            </p>

                            <div className="db-heroActions">
                                <button
                                    type="button"
                                    className="kx-btn kx-btn--orange"
                                    onClick={() => setShareOpen(true)}
                                    disabled={!selectedProfile}
                                >
                                    <span className="db-ctaIcon db-ctaIcon--white" aria-hidden="true">
                                        <img src={SharePageIcon} alt="" />
                                    </span>
                                    Share Profile
                                </button>

                                <Link to="/analytics" className="kx-btn kx-btn--white">
                                    <span className="db-ctaIcon db-ctaIcon--dark" aria-hidden="true">
                                        <img src={SidebarLinkAnalyticsIcon} alt="" />
                                    </span>
                                    View Analytics
                                </Link>
                            </div>
                        </div>

                        <div className="db-heroSide">
                            <div className="db-heroMiniCard">
                                <span className="db-heroMiniLabel">Profile Completion</span>
                                <span className="db-heroMiniValue">{completion.percent}%</span>
                            </div>

                            <div className="db-heroMiniCard">
                                <span className="db-heroMiniLabel">Last 7 Days Views</span>
                                <span className="db-heroMiniValue">{numberFormat(metrics.profileViews)}</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <section className="db-overview">
                    {analyticsQuery.isLoading ? (
                        <div className="db-emptyState db-emptyState--full">Loading dashboard…</div>
                    ) : analyticsQuery.isError ? (
                        <div className="db-emptyState db-emptyState--error">
                            Couldn’t load dashboard data right now.
                        </div>
                    ) : (
                        <div className="db-metricsGrid">
                            <MetricCard
                                label="Total Views"
                                value={metrics.profileViews}
                                helper={
                                    Number(metrics.profileViews) > 0
                                        ? "Your profile is getting attention."
                                        : "Share more to start getting views."
                                }
                                featured
                                icon={TotalVisitsIcon}
                                delay={0.02}
                            />

                            <MetricCard
                                label="NFC Taps"
                                value={metrics.cardTaps}
                                helper={
                                    hasPhysicalCard
                                        ? Number(metrics.cardTaps) > 0
                                            ? "People are tapping your card."
                                            : "Start tapping your card to drive traffic."
                                        : "Order a physical card to unlock taps."
                                }
                                icon={NFCTapsIcon}
                                delay={0.06}
                            />

                            <MetricCard
                                label="QR Scans"
                                value={metrics.qrScans}
                                helper={
                                    Number(metrics.qrScans) > 0
                                        ? "Your QR code is being scanned."
                                        : "Share more to start getting scans."
                                }
                                icon={QRScansIcon}
                                delay={0.1}
                            />

                            <MetricCard
                                label="Link Clicks"
                                value={metrics.linkOpens}
                                helper={
                                    Number(metrics.linkOpens) > 0
                                        ? "Your link is driving visits."
                                        : "Share more to start getting clicks."
                                }
                                icon={LinkVisitsIcon}
                                delay={0.14}
                            />
                        </div>
                    )}
                </section>

                <section className="db-grid db-grid--panels">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.32, delay: 0.12, ease: "easeOut" }}
                    >
                        <RecentActivityCard items={recentActivity} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.32, delay: 0.16, ease: "easeOut" }}
                    >
                        <ProfileCompletionCard completion={completion} />
                    </motion.div>
                </section>
            </div>
        </DashboardLayout>
    );
}