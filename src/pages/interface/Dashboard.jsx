import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import "../../styling/dashboard/dashboard.css";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import ShareProfile from "../../components/ShareProfile";

import { useAuthUser } from "../../hooks/useAuthUser";
import { useMyProfiles } from "../../hooks/useBusinessCard";
import api from "../../services/api";

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

function ShareIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M16 5a3 3 0 1 0 2.83 4H19a1 1 0 0 0-1-1h-.17A3 3 0 0 0 16 5zM6 14a3 3 0 1 0 2.83 4H9a1 1 0 0 0-1-1h-.17A3 3 0 0 0 6 14zM16 14a3 3 0 1 0 2.83 4H19a1 1 0 0 0-1-1h-.17A3 3 0 0 0 16 14z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path
                d="M8.6 15.3l6.8-3.6M8.6 8.7l6.8 3.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function PencilIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M14.1 4.9l5 5L8 21H3v-5L14.1 4.9z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path d="M13 6l5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
    );
}

function CardIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M4 7h16v10H4V7z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <path d="M4 10h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
    );
}

function ContactIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M7 7a4 4 0 1 1 8 0 4 4 0 0 1-8 0z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                d="M4 21a8 8 0 0 1 16 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
        </svg>
    );
}

function RocketIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M14 4c3 0 5 2 5 5 0 5-5 9-10 10l-2 2-1-3-3-1 2-2c1-5 5-10 10-10Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
            <circle cx="14.5" cy="9.5" r="1.2" fill="currentColor" />
            <path
                d="M7 17l-2 2M9 19l-1 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

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

    if (clean === "facebook_url" || clean === "facebook") return "Facebook";
    if (clean === "instagram_url" || clean === "instagram") return "Instagram";
    if (clean === "linkedin_url" || clean === "linkedin") return "LinkedIn";
    if (clean === "x_url" || clean === "twitter_url" || clean === "x" || clean === "twitter") return "X";
    if (clean === "tiktok_url" || clean === "tiktok") return "TikTok";

    return "";
}

function getActivityMessage(item) {
    const type = item?.event_type || item?.eventType || "";
    const name = item?.contact_name || item?.contactName || item?.name || "";
    const target = item?.action_target || item?.actionTarget || "";

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
    if (!card) {
        const items = [
            { key: "profilePhoto", label: "Add a profile picture", done: false },
            { key: "bio", label: "Write a short bio", done: false },
            { key: "services", label: "Add your services", done: false },
            { key: "gallery", label: "Add gallery photos", done: false },
            { key: "reviews", label: "Add reviews", done: false },
            { key: "contact", label: "Confirm contact details", done: false },
            { key: "socials", label: "Add social links", done: false },
            { key: "cta", label: "Add a call-to-action button", done: false },
        ];

        return { items, doneCount: 0, total: items.length, percent: 0 };
    }

    const works = asArray(card?.works || card?.workImages);
    const services = asArray(card?.services);
    const reviews = asArray(card?.reviews);

    const hasProfilePhoto =
        hasText(card?.avatar) || hasText(card?.logo) || hasText(card?.cover_photo) || hasText(card?.coverPhoto);

    const hasBio = hasText(card?.bio);
    const hasServices = services.length > 0;
    const hasGallery = works.length > 0;
    const hasReviews = reviews.length > 0;
    const hasContact =
        hasText(card?.contact_email) ||
        hasText(card?.contactEmail) ||
        hasText(card?.email) ||
        hasText(card?.phone_number) ||
        hasText(card?.phoneNumber) ||
        hasText(card?.phone);

    const hasSocials =
        hasText(card?.facebook_url) ||
        hasText(card?.instagram_url) ||
        hasText(card?.linkedin_url) ||
        hasText(card?.x_url) ||
        hasText(card?.twitter_url) ||
        hasText(card?.tiktok_url);

    const hasCta =
        hasText(card?.button_text) ||
        hasText(card?.buttonText) ||
        hasText(card?.cta_text) ||
        hasText(card?.ctaText) ||
        hasText(card?.button_link) ||
        hasText(card?.buttonLink) ||
        hasText(card?.cta_link) ||
        hasText(card?.ctaLink);

    const items = [
        { key: "profilePhoto", label: "Add a profile picture", done: hasProfilePhoto },
        { key: "bio", label: "Write a short bio", done: hasBio },
        { key: "services", label: "Add your services", done: hasServices },
        { key: "gallery", label: "Add gallery photos", done: hasGallery },
        { key: "reviews", label: "Add reviews", done: hasReviews },
        { key: "contact", label: "Confirm contact details", done: hasContact },
        { key: "socials", label: "Add social links", done: hasSocials },
        { key: "cta", label: "Add a call-to-action button", done: hasCta },
    ];

    const doneCount = items.filter((i) => i.done).length;
    const total = items.length;
    const percent = Math.round((doneCount / total) * 100);

    return { items, doneCount, total, percent };
}

function extractOrders(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.orders)) return data.orders;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function ownsPhysicalProduct(orders) {
    const xs = extractOrders(orders);

    return xs.some((order) => {
        const status = safeLower(order?.status);
        const quantity = Number(order?.quantity || order?.qty || 0);
        return quantity > 0 || status === "paid" || status === "processing" || status === "shipped" || status === "delivered";
    });
}

function MetricCard({ label, value, helper, featured = false }) {
    return (
        <div className={`db-statCard ${featured ? "db-statCard--featured" : ""}`}>
            <div className="db-statLabel">{label}</div>
            <div className="db-statValue">{numberFormat(value)}</div>
            <div className="db-statHelper">{helper}</div>
        </div>
    );
}

export default function Dashboard() {
    const { data: authUser } = useAuthUser();
    const { data: cards } = useMyProfiles();

    const plan = safeLower(authUser?.plan || "free");
    const displayPlan = `Plan: ${plan.charAt(0).toUpperCase()}${plan.slice(1)}`;
    const displayName = authUser?.name?.split(" ")?.[0] || "there";

    const profilesForShare = useMemo(() => {
        const xs = Array.isArray(cards) ? cards : [];
        return xs
            .map((c) => {
                const slug = centerTrim(c.profile_slug);
                if (!slug) return null;

                const name =
                    centerTrim(c.business_card_name) ||
                    centerTrim(c.full_name) ||
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

    const recentActivity = recentActivityRaw.slice(0, 6).map((item, index) => ({
        id: item?.id || item?._id || `activity-${index}`,
        message: item?.message || getActivityMessage(item),
        timeLabel: formatActivityTime(item?.createdAt || item?.timestamp || item?.date),
    }));

    const hasPhysicalCard = useMemo(() => ownsPhysicalProduct(ordersQuery.data), [ordersQuery.data]);

    const headerRight = (
        <div className="db-headRight">
            <span className="db-pill">{displayPlan}</span>

            <button
                type="button"
                className="kx-btn kx-btn--black"
                onClick={() => setShareOpen(true)}
                disabled={!selectedProfile}
                title={!selectedProfile ? "Create a profile first" : "Share your profile"}
            >
                <span className="db-btnIco" aria-hidden="true">
                    <ShareIcon />
                </span>
                Share Your Profile
            </button>
        </div>
    );

    return (
        <DashboardLayout hideDesktopHeader>
            <div className="db-shell">
                <PageHeader
                    title="Dashboard"
                    subtitle={`Welcome back ${displayName}. Here’s how your profile is performing.`}
                    rightSlot={headerRight}
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

                <div className="db-grid">
                    <section className="db-statsRow db-span-12">
                        <MetricCard
                            label="Total Views"
                            value={metrics.profileViews}
                            helper={
                                Number(metrics.profileViews) > 0
                                    ? "Your profile is getting attention."
                                    : "Share more to start getting views."
                            }
                            featured
                        />

                        <MetricCard
                            label="NFC Taps"
                            value={metrics.cardTaps}
                            helper={
                                Number(metrics.cardTaps) > 0
                                    ? "People are tapping your card."
                                    : "Share more to start getting taps."
                            }
                        />

                        <MetricCard
                            label="QR Scans"
                            value={metrics.qrScans}
                            helper={
                                Number(metrics.qrScans) > 0
                                    ? "Your QR code is being scanned."
                                    : "Share more to start getting scans."
                            }
                        />

                        <MetricCard
                            label="Link Clicks"
                            value={metrics.linkOpens}
                            helper={
                                Number(metrics.linkOpens) > 0
                                    ? "Your link is driving visits."
                                    : "Share more to start getting clicks."
                            }
                        />
                    </section>

                    <section className="db-card db-card--share db-span-12">
                        <div className="db-shareLeft">
                            <span className="db-shareIcon" aria-hidden="true">
                                <RocketIcon />
                            </span>

                            <div>
                                <h2 className="db-cardTitle">Share More</h2>
                                <p className="db-muted">
                                    Share your profile to get more views, taps, scans and saved contacts.
                                </p>
                            </div>
                        </div>

                        <div className="db-shareActions">
                            <button
                                type="button"
                                className="kx-btn kx-btn--orange"
                                onClick={() => setShareOpen(true)}
                                disabled={!selectedProfile}
                            >
                                Share Profile
                            </button>

                            <Link to="/analytics" className="kx-btn kx-btn--white">
                                View Analytics
                            </Link>
                        </div>
                    </section>

                    <section className="db-card db-span-6">
                        <div className="db-cardHead">
                            <div>
                                <h2 className="db-cardTitle">Recent Activity</h2>
                                <p className="db-muted">See what’s been happening on your profile recently.</p>
                            </div>
                        </div>

                        <div className="db-activityList">
                            {recentActivity.length ? (
                                recentActivity.map((item) => (
                                    <div key={item.id} className="db-activityRow">
                                        <span className="db-activityDot" />
                                        <div className="db-activityMain">
                                            <span className="db-activityText">{item.message}</span>
                                            <span className="db-activityMeta">{item.timeLabel}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="db-emptyState">
                                    No recent activity yet. Share your profile to start seeing engagement.
                                </div>
                            )}
                        </div>

                        <div className="db-bottomCta">
                            <Link to="/analytics" className="kx-btn kx-btn--black">
                                View Recent Activity
                            </Link>
                        </div>
                    </section>

                    <section className="db-card db-span-6">
                        <div className="db-cardHead">
                            <div>
                                <h2 className="db-cardTitle">Profile Completion</h2>
                                <p className="db-muted">
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

                        <ul className="db-list">
                            {completion.items.map((item) => (
                                <li key={item.key} className="db-listRow">
                                    <span className={`db-listText ${item.done ? "done" : ""}`}>{item.label}</span>
                                    <span className={`db-box ${item.done ? "done" : ""}`} aria-hidden="true" />
                                </li>
                            ))}
                        </ul>

                        {!hasPhysicalCard ? (
                            <div className="db-physicalCallout">
                                <div className="db-physicalTitle">Get your KonarCard today</div>
                                <div className="db-physicalText">
                                    Get ready to share anytime with a physical KonarCard.
                                </div>
                                <div className="db-physicalActions">
                                    <Link to="/cards" className="kx-btn kx-btn--orange">
                                        Order Your KonarCard
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="db-physicalCallout db-physicalCallout--owned">
                                <div className="db-physicalTitle">Your KonarCard is ready to share</div>
                                <div className="db-physicalText">
                                    Keep sharing in person and drive more taps to your profile.
                                </div>
                            </div>
                        )}

                        <div className="db-bottomCta">
                            <Link to="/profiles" className="kx-btn kx-btn--black">
                                Complete Your Profile
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}