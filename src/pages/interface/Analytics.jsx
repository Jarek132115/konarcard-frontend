import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { motion } from "motion/react";
import { Tabs } from "@base-ui/react/tabs";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
} from "recharts";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import ShareProfile from "../../components/ShareProfile";
import api from "../../services/api";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useMyProfiles } from "../../hooks/useBusinessCard";

import "../../styling/spacing.css";
import "../../styling/dashboard/analytics.css";

const RANGE_OPTIONS = [
    { value: "1", label: "Today" },
    { value: "7", label: "Last 7 Days" },
    { value: "30", label: "Last 30 Days" },
    { value: "60", label: "Last 60 Days" },
    { value: "90", label: "Last 90 Days" },
    { value: "365", label: "Last 365 Days" },
];

const CHART_OPTIONS = [
    { value: "profileViews", label: "All Engagement" },
    { value: "linkOpens", label: "Link" },
    { value: "cardTaps", label: "NFC" },
    { value: "qrScans", label: "QR" },
];

const centerTrim = (v) => (v ?? "").toString().trim();
const safeLower = (v) => centerTrim(v).toLowerCase();

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

function percentageFormat(value) {
    const num = Number(value) || 0;
    return `${num.toFixed(num % 1 === 0 ? 0 : 1)}%`;
}

function downloadCsv(filename, rows) {
    const csv = rows
        .map((row) =>
            row
                .map((cell) => {
                    const value = String(cell ?? "");
                    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                })
                .join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatDateLabel(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-GB", {
        month: "short",
        day: "numeric",
    });
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
    if (clean === "x_url" || clean === "twitter_url" || clean === "x" || clean === "twitter") {
        return "X";
    }
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

function getPeriodLabel(range) {
    if (String(range) === "1") return "vs previous day";
    return `vs previous ${range} days`;
}

function formatTrendLabel(delta, range, isPercentage = false) {
    const periodLabel = getPeriodLabel(range);

    if (delta > 0) {
        return `↑ ${isPercentage ? percentageFormat(delta) : numberFormat(delta)} ${periodLabel}`;
    }
    if (delta < 0) {
        const absolute = Math.abs(delta);
        return `↓ ${isPercentage ? percentageFormat(absolute) : numberFormat(absolute)} ${periodLabel}`;
    }
    return `No change ${periodLabel}`;
}

function getTrendClass(delta) {
    if (delta > 0) return "up";
    if (delta < 0) return "down";
    return "neutral";
}

function extractProfiles(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.profiles)) return data.profiles;
    if (Array.isArray(data?.businessCards)) return data.businessCards;
    if (Array.isArray(data?.cards)) return data.cards;
    if (Array.isArray(data?.items)) return data.items;
    if (data && typeof data === "object") return [data];
    return [];
}

function createEmptyMetrics() {
    return {
        profileViews: 0,
        linkOpens: 0,
        cardTaps: 0,
        qrScans: 0,
        contactsSaved: 0,
        contactExchangeOpens: 0,
        contactExchangeSubmits: 0,
        emailClicks: 0,
        phoneClicks: 0,
        socialClicks: 0,
        uniqueVisitors: 0,
        contactConversions: 0,
        totalConversions: 0,
        conversionRate: 0,
    };
}

function getMetricDelta(current, previous, key) {
    return (Number(current?.[key]) || 0) - (Number(previous?.[key]) || 0);
}

function MetricCard({
    label,
    value,
    delta,
    range,
    isPercentage = false,
    featured = false,
    locked = false,
    helper = "",
}) {
    return (
        <motion.div
            className={`an-metric ${featured ? "an-metric--featured" : ""} ${locked ? "an-metric--locked" : ""}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
        >
            <div className="an-metricTop">
                <div className="an-metric-label">{label}</div>
            </div>

            <div className="an-metric-num">
                {locked ? "•••" : isPercentage ? percentageFormat(value) : numberFormat(value)}
            </div>

            <div className={`an-metric-change ${locked ? "neutral" : getTrendClass(delta)}`}>
                {locked ? "Upgrade to unlock" : formatTrendLabel(delta, range, isPercentage)}
            </div>

            {helper ? <div className="an-metric-helper">{helper}</div> : null}

            {locked ? (
                <div className="an-lockOverlay">
                    <span className="an-lockBadge">Plus</span>
                </div>
            ) : null}
        </motion.div>
    );
}

function LockedAnalyticsCard({
    title,
    subtitle,
    body = "Upgrade to Plus to unlock this analytics section.",
}) {
    return (
        <div className="an-panel an-panel--locked">
            <div className="an-panelHead">
                <div>
                    <h3 className="an-panelTitle">{title}</h3>
                    <p className="an-panelMuted">{subtitle}</p>
                </div>
            </div>

            <div className="an-lockedInner">
                <div className="an-lockedBlur" />
                <div className="an-lockedContent">
                    <div className="an-lockedBadge">Plus</div>
                    <div className="an-lockedTitle">Locked analytics</div>
                    <p className="an-lockedText">{body}</p>
                </div>
            </div>
        </div>
    );
}

function RecentActivityCard({ items = [] }) {
    return (
        <div className="an-panel">
            <div className="an-panelHead">
                <div>
                    <h3 className="an-panelTitle">Recent Activity</h3>
                    <p className="an-panelMuted">
                        The latest actions people have taken on your profile.
                    </p>
                </div>
            </div>

            <div className="an-activityList">
                {items.length ? (
                    items.map((item, index) => (
                        <div
                            key={item.id || item._id || `${item.message}-${index}`}
                            className="an-activityRow"
                        >
                            <span className="an-activityDot" />
                            <div className="an-activityMain">
                                <span className="an-activityText">
                                    {item.message || getActivityMessage(item)}
                                </span>
                                <span className="an-activityMeta">
                                    {item.timeLabel ||
                                        formatActivityTime(item.createdAt || item.timestamp || item.date)}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="an-emptyState">No recent activity yet</div>
                )}
            </div>
        </div>
    );
}

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="an-chartTooltip">
            <div className="an-chartTooltipLabel">{label}</div>
            <div className="an-chartTooltipValue">{numberFormat(payload[0]?.value)}</div>
        </div>
    );
}

function EngagementChart({
    data = [],
    seriesKey = "profileViews",
    title = "Engagement Over Time",
    subtitle = "Tracked activity over time.",
    onChangeSeries,
}) {
    const normalizedData = useMemo(
        () =>
            (data || []).map((item) => ({
                ...item,
                label: formatDateLabel(item?.date),
                profileViews: Number(item?.profileViews) || 0,
                linkOpens: Number(item?.linkOpens) || 0,
                cardTaps: Number(item?.cardTaps) || 0,
                qrScans: Number(item?.qrScans) || 0,
            })),
        [data]
    );

    const peak = useMemo(
        () => Math.max(...normalizedData.map((item) => Number(item?.[seriesKey]) || 0), 0),
        [normalizedData, seriesKey]
    );

    return (
        <div className="an-panel an-panel--chart">
            <div className="an-panelHead">
                <div>
                    <h3 className="an-panelTitle">{title}</h3>
                    <p className="an-panelMuted">{subtitle}</p>
                </div>
                <div className="an-panelBadge">Peak: {numberFormat(peak)}</div>
            </div>

            <Tabs.Root
                value={seriesKey}
                onValueChange={(value) => onChangeSeries?.(value)}
                className="an-tabsRoot"
            >
                <Tabs.List className="an-miniFilters" aria-label="Analytics series">
                    {CHART_OPTIONS.map((item) => (
                        <Tabs.Tab
                            key={item.value}
                            value={item.value}
                            className={`an-miniFilterBtn ${seriesKey === item.value ? "active" : ""}`}
                        >
                            {item.label}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs.Root>

            <div className="an-chartCanvas">
                {normalizedData.length ? (
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={normalizedData} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                            <defs>
                                <linearGradient id="anAreaFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.28} />
                                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.03} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                            />
                            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(249,115,22,0.18)" }} />
                            <Area
                                type="monotone"
                                dataKey={seriesKey}
                                stroke="#f97316"
                                strokeWidth={2.4}
                                fill="url(#anAreaFill)"
                                dot={{ r: 3.2, strokeWidth: 2, fill: "#f97316", stroke: "#ffffff" }}
                                activeDot={{ r: 5 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="an-emptyState an-emptyState--chart">No data yet</div>
                )}
            </div>
        </div>
    );
}

function SocialBarChartCard({ items = [] }) {
    const chartData = items.map((item) => ({
        ...item,
        value: Number(item?.value) || 0,
    }));

    return (
        <div className="an-panel">
            <div className="an-panelHead">
                <div>
                    <h3 className="an-panelTitle">Social Click Breakdown</h3>
                    <p className="an-panelMuted">
                        See which social links get the most attention from your profile.
                    </p>
                </div>
            </div>

            <div className="an-chartCanvas an-chartCanvas--bar">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="rgba(15,23,42,0.08)" vertical={false} />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                            tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(15,23,42,0.03)" }} />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#f97316" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="an-inlineStats">
                {chartData.map((item) => (
                    <div key={item.key} className="an-inlineStat">
                        <span className="an-inlineStatLabel">{item.label}</span>
                        <span className="an-inlineStatValue">{numberFormat(item.value)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ContactActionDetailsCard({ metrics }) {
    const rows = [
        {
            key: "exchange-opens",
            title: "Exchange Opens",
            value: Number(metrics.contactExchangeOpens) || 0,
            meta: "People opened your exchange contact form",
        },
        {
            key: "exchange-submits",
            title: "Exchange Submits",
            value: Number(metrics.contactExchangeSubmits) || 0,
            meta: "People completed the exchange form",
        },
        {
            key: "email-clicks",
            title: "Email Clicks",
            value: Number(metrics.emailClicks) || 0,
            meta: "People clicked your email contact action",
        },
        {
            key: "phone-clicks",
            title: "Phone Clicks",
            value: Number(metrics.phoneClicks) || 0,
            meta: "People clicked your phone number",
        },
    ];

    return (
        <div className="an-panel">
            <div className="an-panelHead">
                <div>
                    <h3 className="an-panelTitle">Contact Action Details</h3>
                    <p className="an-panelMuted">
                        A clearer view of what people did after landing on your profile.
                    </p>
                </div>
            </div>

            <div className="an-breakdownList">
                {rows.map((row) => (
                    <div key={row.key} className="an-breakdownRow">
                        <div className="an-breakdownRowMain">
                            <div className="an-breakdownRowTitle">{row.title}</div>
                            <div className="an-breakdownRowMeta">{row.meta}</div>
                        </div>
                        <div className="an-breakdownRowValue">{numberFormat(row.value)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function FunnelCard({ metrics, locked }) {
    if (locked) {
        return (
            <LockedAnalyticsCard
                title="Visitor Funnel"
                subtitle="See how visits turn into contact actions."
                body="Upgrade to Plus to understand how attention turns into action."
            />
        );
    }

    const visits = Number(metrics.profileViews) || 0;
    const interactions =
        (Number(metrics.linkOpens) || 0) +
        (Number(metrics.qrScans) || 0) +
        (Number(metrics.cardTaps) || 0);
    const contactIntent =
        (Number(metrics.contactExchangeOpens) || 0) +
        (Number(metrics.emailClicks) || 0) +
        (Number(metrics.phoneClicks) || 0);
    const conversions =
        (Number(metrics.contactExchangeSubmits) || 0) +
        (Number(metrics.contactsSaved) || 0);

    const rows = [
        { key: "visits", label: "Visits", value: visits },
        { key: "interactions", label: "Engaged actions", value: interactions },
        { key: "intent", label: "Contact intent", value: contactIntent },
        { key: "conversions", label: "Conversions", value: conversions },
    ];

    const max = Math.max(...rows.map((r) => r.value), 1);

    return (
        <div className="an-panel">
            <div className="an-panelHead">
                <div>
                    <h3 className="an-panelTitle">Visitor Funnel</h3>
                    <p className="an-panelMuted">
                        Follow the path from visits to contact actions and conversions.
                    </p>
                </div>
            </div>

            <div className="an-funnelList">
                {rows.map((row, index) => (
                    <div key={row.key} className="an-funnelRow">
                        <div className="an-funnelTop">
                            <span className="an-funnelIndex">0{index + 1}</span>
                            <span className="an-funnelLabel">{row.label}</span>
                            <span className="an-funnelValue">{numberFormat(row.value)}</span>
                        </div>
                        <div className="an-funnelTrack">
                            <div
                                className="an-funnelFill"
                                style={{ width: `${Math.max((row.value / max) * 100, row.value > 0 ? 10 : 0)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HeroInsightCard({ metrics, previousMetrics, range, locked }) {
    const visitsDelta = getMetricDelta(metrics, previousMetrics, "profileViews");
    const exchangesDelta = getMetricDelta(metrics, previousMetrics, "contactExchangeSubmits");
    const bestStatement =
        Number(metrics.contactExchangeSubmits) > 0
            ? `${numberFormat(metrics.contactExchangeSubmits)} contact exchanges were completed in this period.`
            : Number(metrics.linkOpens) > 0
                ? `${numberFormat(metrics.linkOpens)} people clicked through from your card or profile link.`
                : "Your analytics are ready to show what actions your card is driving.";

    return (
        <motion.section
            className="an-heroInsight"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
        >
            <div className="an-heroInsightMain">
                <div className="an-heroInsightEyebrow">Performance snapshot</div>
                <h2 className="an-heroInsightTitle">
                    See how your KonarCard is turning profile attention into real contact action.
                </h2>
                <p className="an-heroInsightText">{bestStatement}</p>

                <div className="an-heroInsightPills">
                    <span className={`an-heroPill ${getTrendClass(visitsDelta)}`}>
                        {formatTrendLabel(visitsDelta, range)}
                    </span>
                    <span className={`an-heroPill ${getTrendClass(exchangesDelta)}`}>
                        {formatTrendLabel(exchangesDelta, range)}
                    </span>
                    {locked ? <span className="an-heroPill an-heroPill--locked">Plus unlocks deeper conversion insight</span> : null}
                </div>
            </div>

            <div className="an-heroInsightSide">
                <div className="an-heroMiniStat">
                    <div className="an-heroMiniLabel">Total visits</div>
                    <div className="an-heroMiniValue">{numberFormat(metrics.profileViews)}</div>
                </div>
                <div className="an-heroMiniStat">
                    <div className="an-heroMiniLabel">Conversion rate</div>
                    <div className="an-heroMiniValue">
                        {locked ? "Locked" : percentageFormat(metrics.conversionRate)}
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

export default function Analytics() {
    const { data: authUser } = useAuthUser();
    const { data: cards } = useMyProfiles();

    const [range, setRange] = useState("7");
    const [profile, setProfile] = useState("all");
    const [chartSeries, setChartSeries] = useState("profileViews");

    const [shareOpen, setShareOpen] = useState(false);
    const [selectedSlug, setSelectedSlug] = useState(null);

    const currentPlan = String(authUser?.plan || "free").toLowerCase();
    const isPaidPlan = currentPlan === "plus" || currentPlan === "teams" || !!authUser?.isSubscribed;

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

                return {
                    slug,
                    name,
                    url: buildPublicUrl(slug),
                };
            })
            .filter(Boolean);
    }, [cards]);

    useEffect(() => {
        if (!profilesForShare.length) {
            setSelectedSlug(null);
            return;
        }

        setSelectedSlug((prev) => prev || profilesForShare[0].slug);
    }, [profilesForShare]);

    const selectedShareProfile = useMemo(() => {
        if (!profilesForShare.length) return null;
        return profilesForShare.find((p) => p.slug === selectedSlug) || profilesForShare[0];
    }, [profilesForShare, selectedSlug]);

    const profilesQuery = useQuery({
        queryKey: ["business-card-profiles-for-analytics"],
        queryFn: async () => {
            const res = await api.get("/api/business-card/profiles");
            const raw = extractProfiles(res.data);

            return raw
                .map((item, index) => {
                    const slug =
                        item?.profile_slug ||
                        item?.profileSlug ||
                        item?.slug ||
                        item?.username ||
                        item?.public_slug ||
                        "";

                    const id = item?._id || item?.id || `profile-${index}`;
                    const value = slug || id;

                    const name =
                        item?.business_card_name ||
                        item?.businessCardName ||
                        item?.main_heading ||
                        item?.mainHeading ||
                        item?.business_name ||
                        item?.businessName ||
                        item?.title ||
                        slug ||
                        `Profile ${index + 1}`;

                    return {
                        id,
                        slug,
                        value,
                        name,
                    };
                })
                .filter((item) => item.value);
        },
        staleTime: 5 * 60 * 1000,
    });

    const selectedProfile = useMemo(
        () => (profilesQuery.data || []).find((p) => p.value === profile),
        [profilesQuery.data, profile]
    );

    const summaryQuery = useQuery({
        queryKey: ["analytics-summary", range, profile, profilesQuery.data?.length || 0],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("days", range);

            if (profile !== "all" && selectedProfile?.slug) {
                params.set("profileSlug", selectedProfile.slug);
            }

            const res = await api.get(`/api/analytics/summary?${params.toString()}`);
            return res.data;
        },
        enabled: profile === "all" || profilesQuery.isSuccess,
        staleTime: 30 * 1000,
    });

    const previousSummaryQuery = useQuery({
        queryKey: ["analytics-summary-previous", range, profile, selectedProfile?.slug || "all"],
        queryFn: async () => {
            const days = Number(range) || 7;
            const params = new URLSearchParams();
            params.set("days", String(days * 2));

            if (profile !== "all" && selectedProfile?.slug) {
                params.set("profileSlug", selectedProfile.slug);
            }

            const res = await api.get(`/api/analytics/summary?${params.toString()}`);
            return res.data;
        },
        enabled: (profile === "all" || profilesQuery.isSuccess) && !summaryQuery.isLoading,
        staleTime: 30 * 1000,
    });

    const chartDays = Math.max(Number(range) || 7, 7);

    const chartSummaryQuery = useQuery({
        queryKey: ["analytics-summary-chart", chartDays, profile, selectedProfile?.slug || "all"],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("days", String(chartDays));

            if (profile !== "all" && selectedProfile?.slug) {
                params.set("profileSlug", selectedProfile.slug);
            }

            const res = await api.get(`/api/analytics/summary?${params.toString()}`);
            return res.data;
        },
        enabled: profile === "all" || profilesQuery.isSuccess,
        staleTime: 30 * 1000,
    });

    const metrics = summaryQuery.data?.metrics || createEmptyMetrics();
    const chartTimeline = chartSummaryQuery.data?.timeline || [];
    const socialBreakdownRaw = summaryQuery.data?.socialBreakdown || [];
    const recentActivityRaw =
        summaryQuery.data?.recentActivity || summaryQuery.data?.recentEvents || [];

    const previousMetrics = useMemo(() => {
        const fallback = createEmptyMetrics();
        const fullTimeline = previousSummaryQuery.data?.timeline || [];
        const currentDays = Number(range) || 7;

        if (!fullTimeline.length || fullTimeline.length <= currentDays) {
            return fallback;
        }

        const previousSlice = fullTimeline.slice(0, fullTimeline.length - currentDays);

        if (!previousSlice.length) return fallback;

        return previousSlice.reduce(
            (acc, item) => {
                acc.profileViews += Number(item?.profileViews) || 0;
                acc.linkOpens += Number(item?.linkOpens) || 0;
                acc.cardTaps += Number(item?.cardTaps) || 0;
                acc.qrScans += Number(item?.qrScans) || 0;
                acc.contactsSaved += Number(item?.contactsSaved) || 0;
                acc.contactExchangeSubmits += Number(item?.contactExchangeSubmits) || 0;
                acc.contactExchangeOpens += Number(item?.contactExchangeOpens) || 0;
                acc.emailClicks += Number(item?.emailClicks) || 0;
                acc.phoneClicks += Number(item?.phoneClicks) || 0;
                acc.socialClicks += Number(item?.socialClicks) || 0;
                acc.contactConversions += Number(item?.contactConversions) || 0;
                return acc;
            },
            createEmptyMetrics()
        );
    }, [previousSummaryQuery.data, range]);

    const conversionRateDelta =
        (Number(metrics?.conversionRate) || 0) - (Number(previousMetrics?.conversionRate) || 0);

    const socialBreakdown = ["facebook", "instagram", "tiktok", "linkedin", "x"].map((key) => {
        const found = socialBreakdownRaw.find((row) => row.key === key);
        return {
            key,
            label: key === "x" ? "X" : key.charAt(0).toUpperCase() + key.slice(1),
            value: found?.value || 0,
        };
    });

    const recentActivity = recentActivityRaw.slice(0, 12).map((item, index) => ({
        id: item?.id || item?._id || `activity-${index}`,
        message: item?.message || getActivityMessage(item),
        timeLabel: formatActivityTime(item?.createdAt || item?.timestamp || item?.date),
        ...item,
    }));

    const exportData = () => {
        const selectedProfileLabel =
            profile === "all"
                ? "all-profiles"
                : selectedProfile?.slug || selectedProfile?.name || profile;

        const rows = [
            ["Analytics Export"],
            ["Range", RANGE_OPTIONS.find((r) => r.value === range)?.label || `${range} days`],
            ["Profile", selectedProfileLabel],
            [],
            ["Metric", "Value"],
            ["Total Visits", metrics.profileViews ?? 0],
            ["Link Visits", metrics.linkOpens ?? 0],
            ["NFC Taps", metrics.cardTaps ?? 0],
            ["QR Scans", metrics.qrScans ?? 0],
            ["Saved Contacts", metrics.contactsSaved ?? 0],
            ["Exchange Contacts", metrics.contactExchangeSubmits ?? 0],
            ["Conversion Rate", isPaidPlan ? `${metrics.conversionRate ?? 0}%` : "Locked"],
            [],
            ["Timeline"],
            ["Date", "Total Visits", "Link Visits", "QR Scans", "NFC Taps"],
            ...chartTimeline.map((item) => [
                item.date ?? "",
                item.profileViews ?? 0,
                item.linkOpens ?? 0,
                item.qrScans ?? 0,
                item.cardTaps ?? 0,
            ]),
        ];

        if (isPaidPlan) {
            rows.push(
                [],
                ["Recent Activity"],
                ["Message", "When"],
                ...recentActivity.map((item) => [item.message ?? "", item.timeLabel ?? ""]),
                [],
                ["Social Breakdown"],
                ["Platform", "Count"],
                ...socialBreakdown.map((item) => [item.label ?? "", item.value ?? 0])
            );
        }

        downloadCsv(`konarcard-analytics-${selectedProfileLabel}-${range}d.csv`, rows);
    };

    const chartMeta = {
        profileViews: {
            title: "Engagement Over Time",
            subtitle: "All tracked visits and interactions across this period.",
        },
        linkOpens: {
            title: "Link Engagement Over Time",
            subtitle: "How often people clicked through from your profile link.",
        },
        cardTaps: {
            title: "NFC Engagement Over Time",
            subtitle: "How many visits came from NFC card taps.",
        },
        qrScans: {
            title: "QR Engagement Over Time",
            subtitle: "How many visits came from QR scans.",
        },
    };

    const handleOpenShareProfile = () => {
        if (!selectedShareProfile) {
            toast.error("Create a profile first.");
            return;
        }
        setShareOpen(true);
    };

    const handleCloseShareProfile = () => {
        setShareOpen(false);
    };

    const shareToFacebook = () => {
        if (!selectedShareProfile?.url) {
            toast.error("No profile link available yet.");
            return;
        }

        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            selectedShareProfile.url
        )}`;

        window.open(url, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToInstagram = async () => {
        if (!selectedShareProfile?.url) {
            toast.error("No profile link available yet.");
            return;
        }

        try {
            await navigator.clipboard.writeText(selectedShareProfile.url);
            toast.success("Profile link copied for Instagram sharing.");
        } catch {
            toast.error("Could not copy the link.");
        }

        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    };

    const shareToMessenger = async () => {
        if (!selectedShareProfile?.url) {
            toast.error("No profile link available yet.");
            return;
        }

        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");

        if (isMobile) {
            try {
                await navigator.clipboard.writeText(selectedShareProfile.url);
                toast.success(
                    "Messenger sharing is not supported on mobile browsers. Link copied instead."
                );
            } catch {
                toast.error("Could not copy the link.");
            }
            return;
        }

        const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
            selectedShareProfile.url
        )}&app_id=291494419107518&redirect_uri=${encodeURIComponent(selectedShareProfile.url)}`;

        window.open(url, "_blank", "noopener,noreferrer,width=680,height=720");
    };

    const shareToWhatsApp = () => {
        if (!selectedShareProfile?.url) {
            toast.error("No profile link available yet.");
            return;
        }

        const text = `Check out my profile: ${selectedShareProfile.url}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const shareByText = () => {
        if (!selectedShareProfile?.url) {
            toast.error("No profile link available yet.");
            return;
        }

        const body = `Check out my profile: ${selectedShareProfile.url}`;
        window.location.href = `sms:?&body=${encodeURIComponent(body)}`;
    };

    const handleAppleWallet = () => {
        toast("Apple Wallet is coming soon.");
    };

    const handleGoogleWallet = () => {
        toast("Google Wallet is coming soon.");
    };

    return (
        <DashboardLayout hideDesktopHeader>
            <div className="an-shell">
                <PageHeader
                    title="Analytics"
                    subtitle="Track profile visits, QR scans, NFC taps, link visits, saved contacts and exchange contact performance."
                    onShareClick={handleOpenShareProfile}
                    shareDisabled={!selectedShareProfile}
                />

                <ShareProfile
                    isOpen={shareOpen}
                    onClose={handleCloseShareProfile}
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
                    onAppleWallet={handleAppleWallet}
                    onGoogleWallet={handleGoogleWallet}
                />

                <HeroInsightCard
                    metrics={metrics}
                    previousMetrics={previousMetrics}
                    range={range}
                    locked={!isPaidPlan}
                />

                <section className="an-toolbar">
                    <div className="an-toolbarTop an-toolbarTop--split">
                        <div className="an-rangePicker">
                            <select
                                className="an-select an-select--range"
                                value={range}
                                onChange={(e) => setRange(e.target.value)}
                                aria-label="Choose date range"
                            >
                                {RANGE_OPTIONS.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="an-toolbarActions">
                            <div className="an-profilePick">
                                <select
                                    className="an-select"
                                    value={profile}
                                    onChange={(e) => setProfile(e.target.value)}
                                    aria-label="Choose profile"
                                >
                                    <option value="all">
                                        {profilesQuery.isLoading ? "Loading profiles..." : "All profiles"}
                                    </option>

                                    {(profilesQuery.data || []).map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                className="kx-btn kx-btn--black an-exportBtn"
                                onClick={exportData}
                                disabled={summaryQuery.isLoading}
                            >
                                Export
                            </button>
                        </div>
                    </div>
                </section>

                <section className="an-overview">
                    {summaryQuery.isLoading ? (
                        <div className="an-emptyState an-emptyState--full">Loading analytics…</div>
                    ) : summaryQuery.isError ? (
                        <div className="an-emptyState an-emptyState--error">
                            Couldn’t load analytics right now.
                        </div>
                    ) : (
                        <div className="an-metricsGrid">
                            <MetricCard
                                label="Total Visits"
                                value={metrics.profileViews}
                                delta={getMetricDelta(metrics, previousMetrics, "profileViews")}
                                range={range}
                                featured
                                helper="The total number of times people landed on your profile."
                            />

                            <MetricCard
                                label="NFC Taps"
                                value={metrics.cardTaps}
                                delta={getMetricDelta(metrics, previousMetrics, "cardTaps")}
                                range={range}
                            />

                            <MetricCard
                                label="QR Scans"
                                value={metrics.qrScans}
                                delta={getMetricDelta(metrics, previousMetrics, "qrScans")}
                                range={range}
                            />

                            <MetricCard
                                label="Link Visits"
                                value={metrics.linkOpens}
                                delta={getMetricDelta(metrics, previousMetrics, "linkOpens")}
                                range={range}
                            />

                            <MetricCard
                                label="Saved Contacts"
                                value={metrics.contactsSaved}
                                delta={getMetricDelta(metrics, previousMetrics, "contactsSaved")}
                                range={range}
                            />

                            <MetricCard
                                label="Exchange Contacts"
                                value={metrics.contactExchangeSubmits}
                                delta={getMetricDelta(metrics, previousMetrics, "contactExchangeSubmits")}
                                range={range}
                            />

                            <MetricCard
                                label="Conversion Rate"
                                value={metrics.conversionRate}
                                delta={conversionRateDelta}
                                range={range}
                                isPercentage
                                locked={!isPaidPlan}
                                helper="How efficiently visits turned into meaningful contact action."
                            />
                        </div>
                    )}
                </section>

                <section className="an-grid an-grid--primary">
                    {isPaidPlan ? (
                        <EngagementChart
                            data={chartTimeline}
                            seriesKey={chartSeries}
                            title={chartMeta[chartSeries]?.title}
                            subtitle={chartMeta[chartSeries]?.subtitle}
                            onChangeSeries={setChartSeries}
                        />
                    ) : (
                        <LockedAnalyticsCard
                            title="Engagement Over Time"
                            subtitle="See how profile visits, link visits, QR scans and NFC taps trend over time."
                            body="Upgrade to Plus to unlock the full engagement trend view."
                        />
                    )}

                    {isPaidPlan ? (
                        <RecentActivityCard items={recentActivity} />
                    ) : (
                        <LockedAnalyticsCard
                            title="Recent Activity"
                            subtitle="The latest actions people have taken on your profile."
                            body="Upgrade to Plus to see recent activity and deeper engagement insights."
                        />
                    )}
                </section>

                <section className="an-grid an-grid--secondary">
                    <FunnelCard metrics={metrics} locked={!isPaidPlan} />

                    {isPaidPlan ? (
                        <SocialBarChartCard items={socialBreakdown} />
                    ) : (
                        <LockedAnalyticsCard
                            title="Social Click Breakdown"
                            subtitle="See how each social profile performs."
                            body="Upgrade to Plus to unlock social click tracking across your profile."
                        />
                    )}

                    {isPaidPlan ? (
                        <ContactActionDetailsCard metrics={metrics} />
                    ) : (
                        <LockedAnalyticsCard
                            title="Contact Action Details"
                            subtitle="See which contact actions people take after landing on your profile."
                            body="Upgrade to Plus to unlock deeper contact action analytics."
                        />
                    )}
                </section>
            </div>
        </DashboardLayout>
    );
}