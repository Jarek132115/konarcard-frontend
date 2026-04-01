import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import api from "../../services/api";

import "../../styling/dashboard/analytics.css";

const RANGE_OPTIONS = [
    { value: "7", label: "Last 7 Days" },
    { value: "30", label: "Last 30 Days" },
    { value: "90", label: "Last 90 Days" },
];

const CHART_OPTIONS = [
    { value: "profileViews", label: "All Engagement" },
    { value: "linkOpens", label: "Link" },
    { value: "cardTaps", label: "NFC" },
    { value: "qrScans", label: "QR" },
];

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
        day: "numeric",
        month: "short",
    });
}

function getXAxisTickStep(days, pointCount) {
    if (days <= 7) return 1;
    if (days <= 30) return 5;
    if (days <= 90) return 10;
    return Math.max(1, Math.ceil(pointCount / 8));
}

function buildYAxisTicks(maxValue) {
    const safeMax = Math.max(Number(maxValue) || 0, 1);

    if (safeMax <= 3) return [safeMax, Math.max(1, safeMax - 1), 1, 0];
    if (safeMax <= 10) return [safeMax, Math.round((safeMax * 2) / 3), Math.round(safeMax / 3), 0];

    const roughStep = safeMax / 3;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;

    let niceStep = 1;
    if (normalized <= 1) niceStep = 1;
    else if (normalized <= 2) niceStep = 2;
    else if (normalized <= 5) niceStep = 5;
    else niceStep = 10;

    const step = niceStep * magnitude;
    const top = Math.ceil(safeMax / step) * step;

    return [top, top - step, top - step * 2, 0].map((value) => Math.max(0, value));
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

function buildFallbackActivity(metrics) {
    const items = [];

    if ((metrics.qrScans || 0) > 0) {
        items.push({
            id: "fallback-qr",
            message: "Someone scanned your QR code",
            timeLabel: `${numberFormat(metrics.qrScans)} total`,
        });
    }

    if ((metrics.cardTaps || 0) > 0) {
        items.push({
            id: "fallback-nfc",
            message: "Someone tapped your NFC card",
            timeLabel: `${numberFormat(metrics.cardTaps)} total`,
        });
    }

    if ((metrics.linkOpens || 0) > 0) {
        items.push({
            id: "fallback-link",
            message: "Someone clicked your link",
            timeLabel: `${numberFormat(metrics.linkOpens)} total`,
        });
    }

    if ((metrics.contactExchangeSubmits || 0) > 0) {
        items.push({
            id: "fallback-exchange",
            message: "Someone exchanged contacts with you",
            timeLabel: `${numberFormat(metrics.contactExchangeSubmits)} total`,
        });
    }

    if ((metrics.contactsSaved || 0) > 0) {
        items.push({
            id: "fallback-save",
            message: "Someone saved your number",
            timeLabel: `${numberFormat(metrics.contactsSaved)} total`,
        });
    }

    return items.slice(0, 5);
}

function RecentActivityCard({ items = [], metrics }) {
    const finalItems = items.length ? items : buildFallbackActivity(metrics);

    return (
        <div className="an-chartCard">
            <div className="an-chartHead">
                <div>
                    <h3 className="an-chartTitle">Recent Activity</h3>
                    <p className="an-chartMuted">
                        The latest actions people have taken on your profile.
                    </p>
                </div>
            </div>

            {finalItems.length ? (
                <div className="an-activityList">
                    {finalItems.map((item, index) => (
                        <div key={item.id || item._id || `${item.message}-${index}`} className="an-activityRow">
                            <span className="an-activityDot" />
                            <div className="an-activityContent">
                                <strong>{item.message || getActivityMessage(item)}</strong>
                                <p>{item.timeLabel || formatActivityTime(item.createdAt || item.timestamp || item.date)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="an-state an-state--compact">No recent activity yet</div>
            )}
        </div>
    );
}

function MiniLineChart({
    data = [],
    seriesKey = "profileViews",
    title = "Engagement Over Time",
    subtitle = "Tracked profile visits over time.",
    onChangeSeries,
    rangeDays = 7,
}) {
    const values = useMemo(
        () => data.map((item) => Number(item?.[seriesKey]) || 0),
        [data, seriesKey]
    );

    const maxValue = values.length ? Math.max(...values, 0) : 0;
    const yTicks = buildYAxisTicks(maxValue);
    const safeMax = Math.max(yTicks[0] || maxValue, 1);

    const points = useMemo(() => {
        if (!data.length) return "";

        return values
            .map((value, index) => {
                const x = data.length <= 1 ? 0 : (index / (data.length - 1)) * 100;
                const y = 100 - (value / safeMax) * 100;
                return `${x},${y}`;
            })
            .join(" ");
    }, [data, values, safeMax]);

    const tickStep = getXAxisTickStep(Number(rangeDays) || data.length, data.length);
    const xAxisLabels = data
        .map((item, index) => {
            const isLast = index === data.length - 1;
            const shouldShow = index % tickStep === 0 || isLast;

            if (!shouldShow) return null;

            return {
                key: item.date || `${index}`,
                label: item.label || formatDateLabel(item.date),
                left: data.length <= 1 ? 0 : (index / (data.length - 1)) * 100,
            };
        })
        .filter(Boolean);

    if (!data.length) {
        return (
            <div className="an-chartCard">
                <div className="an-chartHead">
                    <div>
                        <h3 className="an-chartTitle">{title}</h3>
                        <p className="an-chartMuted">{subtitle}</p>
                    </div>
                    <div className="an-chartBadge">Peak: 0</div>
                </div>

                <div className="an-miniFilters">
                    {CHART_OPTIONS.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            className={`an-miniFilterBtn ${seriesKey === item.value ? "active" : ""}`}
                            onClick={() => onChangeSeries?.(item.value)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="an-state an-state--chart">No data yet</div>
            </div>
        );
    }

    return (
        <div className="an-chartCard">
            <div className="an-chartHead">
                <div>
                    <h3 className="an-chartTitle">{title}</h3>
                    <p className="an-chartMuted">{subtitle}</p>
                </div>
                <div className="an-chartBadge">Peak: {numberFormat(maxValue)}</div>
            </div>

            <div className="an-miniFilters">
                {CHART_OPTIONS.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        className={`an-miniFilterBtn ${seriesKey === item.value ? "active" : ""}`}
                        onClick={() => onChangeSeries?.(item.value)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="an-lineChartWrap">
                <div className="an-yAxis">
                    {yTicks.map((tick, index) => (
                        <span key={`${tick}-${index}`} className="an-yAxisLabel">
                            {numberFormat(tick)}
                        </span>
                    ))}
                </div>

                <div className="an-lineChartMain">
                    <div className="an-lineChart">
                        <svg
                            viewBox="0 0 100 100"
                            className="an-lineChartSvg"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <polyline className="an-lineChartGrid" points="0,100 100,100" />
                            <polyline className="an-lineChartGrid" points="0,66.66 100,66.66" />
                            <polyline className="an-lineChartGrid" points="0,33.33 100,33.33" />
                            <polyline className="an-lineChartGrid" points="0,0 100,0" />
                            <polyline className="an-lineChartPath" points={points} />
                        </svg>
                    </div>

                    <div className="an-lineLabels">
                        {xAxisLabels.map((item) => (
                            <span
                                key={item.key}
                                className="an-lineLabel an-lineLabel--absolute"
                                style={{ left: `${item.left}%` }}
                            >
                                {item.label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function VerticalBarBreakdown({ title, subtitle, items = [] }) {
    const normalizedItems = items.filter(Boolean);
    const max = Math.max(...normalizedItems.map((item) => Number(item?.value) || 0), 1);

    return (
        <div className="an-chartCard">
            <div className="an-chartHead">
                <div>
                    <h3 className="an-chartTitle">{title}</h3>
                    <p className="an-chartMuted">{subtitle}</p>
                </div>
            </div>

            <div className="an-vBarWrap">
                <div className="an-vBarGrid">
                    <span />
                    <span />
                    <span />
                    <span />
                </div>

                <div className="an-vBarList">
                    {normalizedItems.map((item) => {
                        const value = Number(item?.value) || 0;
                        const height = `${Math.max((value / max) * 100, value > 0 ? 8 : 0)}%`;

                        return (
                            <div key={item.key} className="an-vBarItem">
                                <div className="an-vBarValue">{numberFormat(value)}</div>
                                <div className="an-vBarTrack">
                                    <div className="an-vBarFill" style={{ height }} />
                                </div>
                                <div className="an-vBarLabel">{item.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function ActionDetailsCard({ metrics }) {
    return (
        <div className="an-chartCard">
            <div className="an-chartHead">
                <div>
                    <h3 className="an-chartTitle">Contact Action Details</h3>
                    <p className="an-chartMuted">
                        The actions people took after landing on your profile.
                    </p>
                </div>
            </div>

            <div className="an-infoList">
                <div className="an-infoRow">
                    <span className="an-infoDot" />
                    <div>
                        <strong>Exchange Opens</strong>
                        <p>{numberFormat(metrics.contactExchangeOpens)} people opened the exchange contact form.</p>
                    </div>
                </div>

                <div className="an-infoRow">
                    <span className="an-infoDot" />
                    <div>
                        <strong>Exchange Submits</strong>
                        <p>{numberFormat(metrics.contactExchangeSubmits)} people submitted the exchange form.</p>
                    </div>
                </div>

                <div className="an-infoRow">
                    <span className="an-infoDot" />
                    <div>
                        <strong>Email Clicks</strong>
                        <p>{numberFormat(metrics.emailClicks)} people clicked your email contact action.</p>
                    </div>
                </div>

                <div className="an-infoRow">
                    <span className="an-infoDot" />
                    <div>
                        <strong>Phone Clicks</strong>
                        <p>{numberFormat(metrics.phoneClicks)} people clicked your phone number.</p>
                    </div>
                </div>
            </div>
        </div>
    );
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

export default function Analytics() {
    const [range, setRange] = useState("7");
    const [profile, setProfile] = useState("all");
    const [chartSeries, setChartSeries] = useState("profileViews");

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

    const summaryQuery = useQuery({
        queryKey: ["analytics-summary", range, profile, profilesQuery.data?.length || 0],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("days", range);

            if (profile !== "all") {
                const selectedProfile = (profilesQuery.data || []).find((p) => p.value === profile);
                if (selectedProfile?.slug) {
                    params.set("profileSlug", selectedProfile.slug);
                }
            }

            const res = await api.get(`/api/analytics/summary?${params.toString()}`);
            return res.data;
        },
        enabled: profile === "all" || profilesQuery.isSuccess,
        staleTime: 30 * 1000,
    });

    const metrics = summaryQuery.data?.metrics || {
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

    const timeline = summaryQuery.data?.timeline || [];
    const socialBreakdownRaw = summaryQuery.data?.socialBreakdown || [];
    const recentActivityRaw =
        summaryQuery.data?.recentActivity || summaryQuery.data?.recentEvents || [];

    const socialBreakdown = ["facebook", "instagram", "tiktok", "linkedin", "x"].map((key) => {
        const found = socialBreakdownRaw.find((row) => row.key === key);
        return {
            key,
            label: key === "x" ? "X" : key.charAt(0).toUpperCase() + key.slice(1),
            value: found?.value || 0,
        };
    });

    const recentActivity = recentActivityRaw.slice(0, 5).map((item, index) => ({
        id: item?.id || item?._id || `activity-${index}`,
        message: item?.message || getActivityMessage(item),
        timeLabel: formatActivityTime(item?.createdAt || item?.timestamp || item?.date),
        ...item,
    }));

    const exportData = () => {
        const selectedProfile = (profilesQuery.data || []).find((p) => p.value === profile);

        const selectedProfileLabel =
            profile === "all"
                ? "all-profiles"
                : selectedProfile?.slug || selectedProfile?.name || profile;

        const rows = [
            ["Analytics Export"],
            ["Range", `${range} days`],
            ["Profile", selectedProfileLabel],
            [],
            ["Metric", "Value"],
            ["Total Visits", metrics.profileViews ?? 0],
            ["Link Visits", metrics.linkOpens ?? 0],
            ["NFC Taps", metrics.cardTaps ?? 0],
            ["QR Scans", metrics.qrScans ?? 0],
            ["Saved Contacts", metrics.contactsSaved ?? 0],
            ["Exchange Contacts", metrics.contactExchangeSubmits ?? 0],
            ["Conversion Rate", `${metrics.conversionRate ?? 0}%`],
            [],
            ["Timeline"],
            ["Date", "Total Visits", "Link Visits", "QR Scans", "NFC Taps"],
            ...timeline.map((item) => [
                item.date ?? "",
                item.profileViews ?? 0,
                item.linkOpens ?? 0,
                item.qrScans ?? 0,
                item.cardTaps ?? 0,
            ]),
            [],
            ["Recent Activity"],
            ["Message", "When"],
            ...recentActivity.map((item) => [item.message ?? "", item.timeLabel ?? ""]),
            [],
            ["Social Breakdown"],
            ["Platform", "Count"],
            ...socialBreakdown.map((item) => [item.label ?? "", item.value ?? 0]),
        ];

        downloadCsv(`konarcard-analytics-${selectedProfileLabel}-${range}d.csv`, rows);
    };

    const chartMeta = {
        profileViews: {
            title: "Engagement Over Time",
            subtitle: "All tracked visits over time.",
        },
        linkOpens: {
            title: "Link Engagement Over Time",
            subtitle: "Visits from your normal profile link.",
        },
        cardTaps: {
            title: "NFC Engagement Over Time",
            subtitle: "Visits that came from NFC taps.",
        },
        qrScans: {
            title: "QR Engagement Over Time",
            subtitle: "Visits that came from QR scans.",
        },
    };

    return (
        <DashboardLayout title={null} subtitle={null} hideDesktopHeader>
            <div className="an-shell">
                <PageHeader
                    title="Analytics"
                    subtitle="Track total visits, QR scans, NFC taps, link visits, saved contacts and exchange contact performance."
                />

                <section className="an-toolbar">
                    <div className="an-toolbarTop">
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

                    <div className="an-toolbarBottom">
                        <div className="an-range" role="tablist" aria-label="Analytics range">
                            {RANGE_OPTIONS.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    className={`an-range-btn ${range === item.value ? "active" : ""}`}
                                    onClick={() => setRange(item.value)}
                                    aria-pressed={range === item.value}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="an-overview">
                    {summaryQuery.isLoading ? (
                        <div className="an-state">Loading analytics…</div>
                    ) : summaryQuery.isError ? (
                        <div className="an-state an-state--error">
                            Couldn’t load analytics right now.
                        </div>
                    ) : (
                        <div className="an-metrics7">
                            <div className="an-metric">
                                <div className="an-metric-label">Total Visits</div>
                                <div className="an-metric-num">{numberFormat(metrics.profileViews)}</div>
                            </div>

                            <div className="an-metric">
                                <div className="an-metric-label">NFC Taps</div>
                                <div className="an-metric-num">{numberFormat(metrics.cardTaps)}</div>
                            </div>

                            <div className="an-metric">
                                <div className="an-metric-label">QR Scans</div>
                                <div className="an-metric-num">{numberFormat(metrics.qrScans)}</div>
                            </div>

                            <div className="an-metric">
                                <div className="an-metric-label">Link Visits</div>
                                <div className="an-metric-num">{numberFormat(metrics.linkOpens)}</div>
                            </div>

                            <div className="an-metric">
                                <div className="an-metric-label">Saved Contacts</div>
                                <div className="an-metric-num">{numberFormat(metrics.contactsSaved)}</div>
                            </div>

                            <div className="an-metric">
                                <div className="an-metric-label">Exchange Contacts</div>
                                <div className="an-metric-num">
                                    {numberFormat(metrics.contactExchangeSubmits)}
                                </div>
                            </div>

                            <div className="an-metric">
                                <div className="an-metric-label">Conversion Rate</div>
                                <div className="an-metric-num">
                                    {percentageFormat(metrics.conversionRate)}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section className="an-chartGrid">
                    <RecentActivityCard items={recentActivity} metrics={metrics} />

                    <MiniLineChart
                        data={timeline}
                        seriesKey={chartSeries}
                        title={chartMeta[chartSeries]?.title}
                        subtitle={chartMeta[chartSeries]?.subtitle}
                        onChangeSeries={setChartSeries}
                        rangeDays={Number(range)}
                    />
                </section>

                <section className="an-chartGrid">
                    <ActionDetailsCard metrics={metrics} />

                    <VerticalBarBreakdown
                        title="Social Click Breakdown"
                        subtitle="How many clicks each added social profile received."
                        items={socialBreakdown}
                    />
                </section>
            </div>
        </DashboardLayout>
    );
}