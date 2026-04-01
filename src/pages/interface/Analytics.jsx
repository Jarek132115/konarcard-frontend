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

function MiniLineChart({
    data = [],
    seriesKey = "profileViews",
    title = "Engagement Over Time",
    subtitle = "Tracked profile visits over time.",
    onChangeSeries,
}) {
    const values = useMemo(
        () => data.map((item) => Number(item?.[seriesKey]) || 0),
        [data, seriesKey]
    );

    const points = useMemo(() => {
        if (!data.length) return "";

        const max = values.length ? Math.max(...values, 1) : 1;

        return values
            .map((value, index) => {
                const x = data.length <= 1 ? 0 : (index / (data.length - 1)) * 100;
                const y = 100 - (value / max) * 100;
                return `${x},${y}`;
            })
            .join(" ");
    }, [data, values]);

    const maxValue = values.length ? Math.max(...values, 0) : 0;

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

            <div className="an-lineChart">
                <svg
                    viewBox="0 0 100 100"
                    className="an-lineChartSvg"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <polyline className="an-lineChartGrid" points="0,100 100,100" />
                    <polyline className="an-lineChartGrid" points="0,66 100,66" />
                    <polyline className="an-lineChartGrid" points="0,33 100,33" />
                    <polyline className="an-lineChartGrid" points="0,0 100,0" />
                    <polyline className="an-lineChartPath" points={points} />
                </svg>

                <div className="an-lineLabels">
                    {data.map((item) => (
                        <span key={item.date} className="an-lineLabel">
                            {item.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function BarBreakdown({ title, subtitle, items = [] }) {
    const max = Math.max(...items.map((item) => Number(item?.value) || 0), 1);

    return (
        <div className="an-chartCard">
            <div className="an-chartHead">
                <div>
                    <h3 className="an-chartTitle">{title}</h3>
                    <p className="an-chartMuted">{subtitle}</p>
                </div>
            </div>

            <div className="an-barList">
                {items.map((item) => {
                    const value = Number(item?.value) || 0;
                    const width = `${Math.max((value / max) * 100, value > 0 ? 8 : 0)}%`;

                    return (
                        <div key={item.key} className="an-barRow">
                            <div className="an-barMeta">
                                <span className="an-barLabel">{item.label}</span>
                                <span className="an-barValue">{numberFormat(value)}</span>
                            </div>
                            <div className="an-barTrack">
                                <div className="an-barFill" style={{ width }} />
                            </div>
                        </div>
                    );
                })}
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

export default function Analytics() {
    const [range, setRange] = useState("7");
    const [profile, setProfile] = useState("all");
    const [chartSeries, setChartSeries] = useState("profileViews");

    const profilesQuery = useQuery({
        queryKey: ["business-card-profiles-for-analytics"],
        queryFn: async () => {
            const res = await api.get("/api/business-card/profiles");
            const raw = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data?.profiles)
                    ? res.data.profiles
                    : [];

            return raw.map((item) => ({
                id: item?._id || item?.id || "",
                slug: item?.profile_slug || item?.profileSlug || "",
                name:
                    item?.business_card_name ||
                    item?.businessCardName ||
                    item?.main_heading ||
                    item?.mainHeading ||
                    item?.business_name ||
                    item?.businessName ||
                    item?.profile_slug ||
                    "Untitled profile",
            }));
        },
        staleTime: 5 * 60 * 1000,
    });

    const summaryQuery = useQuery({
        queryKey: ["analytics-summary", range, profile],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set("days", range);
            if (profile !== "all") params.set("profileSlug", profile);

            const res = await api.get(`/api/analytics/summary?${params.toString()}`);
            return res.data;
        },
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
    const trafficSources = summaryQuery.data?.trafficSources || [];
    const socialBreakdownRaw = summaryQuery.data?.socialBreakdown || [];

    const socialBreakdown = ["facebook", "instagram", "tiktok", "linkedin", "x"].map((key) => {
        const found = socialBreakdownRaw.find((row) => row.key === key);
        return {
            key,
            label:
                key === "x"
                    ? "X"
                    : key.charAt(0).toUpperCase() + key.slice(1),
            value: found?.value || 0,
        };
    });

    const exportData = () => {
        const selectedProfileLabel =
            profile === "all"
                ? "all-profiles"
                : profilesQuery.data?.find((p) => p.slug === profile)?.slug || profile;

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
            ["Traffic Sources"],
            ["Source", "Count"],
            ...trafficSources.map((item) => [item.label ?? "", item.value ?? 0]),
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

    const headerRight = (
        <div className="an-headRight">
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

            <button
                type="button"
                className="kx-btn kx-btn--black"
                onClick={exportData}
                disabled={summaryQuery.isLoading}
            >
                Export
            </button>
        </div>
    );

    return (
        <DashboardLayout title={null} subtitle={null} hideDesktopHeader>
            <div className="an-shell">
                <PageHeader
                    title="Analytics"
                    subtitle="Track total visits, QR scans, NFC taps, link visits, saved contacts and exchange contact performance."
                    rightSlot={headerRight}
                />

                <section className="an-card">
                    <div className="an-card-head">
                        <div>
                            <h2 className="an-card-title">Overview</h2>
                            <p className="an-muted">
                                Live data from your tracked profile visits and contact actions.
                            </p>
                        </div>

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
                                    <option key={item.slug || item.id} value={item.slug}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {summaryQuery.isLoading ? (
                        <div className="an-state">Loading analytics…</div>
                    ) : summaryQuery.isError ? (
                        <div className="an-state an-state--error">
                            Couldn’t load analytics right now.
                        </div>
                    ) : (
                        <div className="an-metrics6">
                            <div className="an-metric an-metric--featured">
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
                                <div className="an-metric-label">Conversion Rate</div>
                                <div className="an-metric-num">
                                    {percentageFormat(metrics.conversionRate)}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section className="an-chartGrid">
                    <MiniLineChart
                        data={timeline}
                        seriesKey={chartSeries}
                        title={chartMeta[chartSeries]?.title}
                        subtitle={chartMeta[chartSeries]?.subtitle}
                        onChangeSeries={setChartSeries}
                    />

                    <BarBreakdown
                        title="Engagement Breakdown"
                        subtitle="How your total visits are split across link, QR and NFC traffic."
                        items={[
                            { key: "link", label: "Link Visits", value: metrics.linkOpens || 0 },
                            { key: "qr", label: "QR Scans", value: metrics.qrScans || 0 },
                            { key: "nfc", label: "NFC Taps", value: metrics.cardTaps || 0 },
                        ]}
                    />
                </section>

                <section className="an-chartGrid">
                    <ActionDetailsCard metrics={metrics} />

                    <BarBreakdown
                        title="Social Click Breakdown"
                        subtitle="How many clicks each added social profile received."
                        items={socialBreakdown}
                    />
                </section>
            </div>
        </DashboardLayout>
    );
}