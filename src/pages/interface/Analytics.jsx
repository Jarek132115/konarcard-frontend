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

function MiniLineChart({ data = [], seriesKey = "profileViews" }) {
    const points = useMemo(() => {
        const values = data.map((item) => Number(item?.[seriesKey]) || 0);
        const max = Math.max(...values, 1);

        return values
            .map((value, index) => {
                const x = data.length <= 1 ? 0 : (index / (data.length - 1)) * 100;
                const y = 100 - (value / max) * 100;
                return `${x},${y}`;
            })
            .join(" ");
    }, [data, seriesKey]);

    const maxValue = Math.max(...data.map((item) => Number(item?.[seriesKey]) || 0), 0);

    return (
        <div className="an-chartCard">
            <div className="an-chartHead">
                <div>
                    <h3 className="an-chartTitle">Engagement Over Time</h3>
                    <p className="an-chartMuted">Profile views, QR scans, NFC taps and contacts saved.</p>
                </div>
                <div className="an-chartBadge">Peak: {numberFormat(maxValue)}</div>
            </div>

            <div className="an-lineChart">
                <svg viewBox="0 0 100 100" className="an-lineChartSvg" preserveAspectRatio="none" aria-hidden="true">
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

export default function Analytics() {
    const [range, setRange] = useState("7");
    const [profile, setProfile] = useState("all");

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
        cardTaps: 0,
        qrScans: 0,
        linkOpens: 0,
        contactsSaved: 0,
        contactExchangeOpens: 0,
        contactExchangeSubmits: 0,
        emailClicks: 0,
        phoneClicks: 0,
        socialClicks: 0,
        totalConversions: 0,
        conversionRate: 0,
    };

    const timeline = summaryQuery.data?.timeline || [];
    const trafficSources = summaryQuery.data?.trafficSources || [];
    const socialBreakdown = summaryQuery.data?.socialBreakdown || [];

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
            ["Profile Views", metrics.profileViews],
            ["Card Taps", metrics.cardTaps],
            ["QR Scans", metrics.qrScans],
            ["Link Opens", metrics.linkOpens],
            ["Contacts Saved", metrics.contactsSaved],
            ["Exchange Contact Opens", metrics.contactExchangeOpens],
            ["Exchange Contact Submits", metrics.contactExchangeSubmits],
            ["Email Clicks", metrics.emailClicks],
            ["Phone Clicks", metrics.phoneClicks],
            ["Social Clicks", metrics.socialClicks],
            ["Total Conversions", metrics.totalConversions],
            ["Conversion Rate", `${metrics.conversionRate}%`],
            [],
            ["Timeline"],
            ["Date", "Profile Views", "QR Scans", "Card Taps", "Contacts Saved"],
            ...timeline.map((item) => [
                item.date,
                item.profileViews,
                item.qrScans,
                item.cardTaps,
                item.contactsSaved,
            ]),
            [],
            ["Traffic Sources"],
            ["Source", "Count"],
            ...trafficSources.map((item) => [item.label, item.value]),
            [],
            ["Social Breakdown"],
            ["Platform", "Count"],
            ...socialBreakdown.map((item) => [item.label, item.value]),
        ];

        downloadCsv(`konarcard-analytics-${selectedProfileLabel}-${range}d.csv`, rows);
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

            <button type="button" className="kx-btn kx-btn--black" onClick={exportData}>
                Export
            </button>
        </div>
    );

    return (
        <DashboardLayout title={null} subtitle={null} hideDesktopHeader>
            <div className="an-shell">
                <PageHeader
                    title="Analytics"
                    subtitle="Track profile views, QR scans, NFC taps, contact saves and click activity so you can see what’s working."
                    rightSlot={headerRight}
                />

                <section className="an-card">
                    <div className="an-card-head">
                        <div>
                            <h2 className="an-card-title">Overview</h2>
                            <p className="an-muted">
                                Live data from your public profile visits and actions.
                            </p>
                        </div>

                        <div className="an-profilePick">
                            <select
                                className="an-select"
                                value={profile}
                                onChange={(e) => setProfile(e.target.value)}
                                aria-label="Choose profile"
                            >
                                <option value="all">All profiles</option>
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
                        <>
                            <div className="an-metrics5">
                                <div className="an-metric an-metric--featured">
                                    <div className="an-metric-label">Profile Views</div>
                                    <div className="an-metric-num">{numberFormat(metrics.profileViews)}</div>
                                </div>

                                <div className="an-metric">
                                    <div className="an-metric-label">Contacts Saved</div>
                                    <div className="an-metric-num">{numberFormat(metrics.contactsSaved)}</div>
                                </div>

                                <div className="an-metric">
                                    <div className="an-metric-label">QR Scans</div>
                                    <div className="an-metric-num">{numberFormat(metrics.qrScans)}</div>
                                </div>

                                <div className="an-metric">
                                    <div className="an-metric-label">Card Taps</div>
                                    <div className="an-metric-num">{numberFormat(metrics.cardTaps)}</div>
                                </div>

                                <div className="an-metric">
                                    <div className="an-metric-label">Conversion Rate</div>
                                    <div className="an-metric-num">{percentageFormat(metrics.conversionRate)}</div>
                                </div>
                            </div>

                            <div className="an-miniGrid">
                                <div className="an-miniStat">
                                    <span className="an-miniStat-k">Link Opens</span>
                                    <span className="an-miniStat-v">{numberFormat(metrics.linkOpens)}</span>
                                </div>
                                <div className="an-miniStat">
                                    <span className="an-miniStat-k">Exchange Opens</span>
                                    <span className="an-miniStat-v">
                                        {numberFormat(metrics.contactExchangeOpens)}
                                    </span>
                                </div>
                                <div className="an-miniStat">
                                    <span className="an-miniStat-k">Exchange Submits</span>
                                    <span className="an-miniStat-v">
                                        {numberFormat(metrics.contactExchangeSubmits)}
                                    </span>
                                </div>
                                <div className="an-miniStat">
                                    <span className="an-miniStat-k">Email Clicks</span>
                                    <span className="an-miniStat-v">{numberFormat(metrics.emailClicks)}</span>
                                </div>
                                <div className="an-miniStat">
                                    <span className="an-miniStat-k">Phone Clicks</span>
                                    <span className="an-miniStat-v">{numberFormat(metrics.phoneClicks)}</span>
                                </div>
                                <div className="an-miniStat">
                                    <span className="an-miniStat-k">Social Clicks</span>
                                    <span className="an-miniStat-v">{numberFormat(metrics.socialClicks)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </section>

                <section className="an-chartGrid">
                    <MiniLineChart data={timeline} seriesKey="profileViews" />

                    <BarBreakdown
                        title="Traffic Source Breakdown"
                        subtitle="Where your profile views came from in this selected period."
                        items={trafficSources}
                    />
                </section>

                <section className="an-chartGrid">
                    <BarBreakdown
                        title="Social Click Breakdown"
                        subtitle="Which social platforms got the most outbound clicks."
                        items={socialBreakdown}
                    />

                    <div className="an-chartCard">
                        <div className="an-chartHead">
                            <div>
                                <h3 className="an-chartTitle">What counts as a view?</h3>
                                <p className="an-chartMuted">
                                    A profile view is recorded whenever someone opens the live profile.
                                    QR scans, NFC taps and link opens also count as profile visits, but
                                    they’re broken out separately so you can see the source clearly.
                                </p>
                            </div>
                        </div>

                        <div className="an-infoList">
                            <div className="an-infoRow">
                                <span className="an-infoDot" />
                                <div>
                                    <strong>Profile Views</strong>
                                    <p>Every live profile open.</p>
                                </div>
                            </div>

                            <div className="an-infoRow">
                                <span className="an-infoDot" />
                                <div>
                                    <strong>QR Scans</strong>
                                    <p>Views where the source was detected as QR.</p>
                                </div>
                            </div>

                            <div className="an-infoRow">
                                <span className="an-infoDot" />
                                <div>
                                    <strong>Card Taps</strong>
                                    <p>Views where the source was detected as NFC.</p>
                                </div>
                            </div>

                            <div className="an-infoRow">
                                <span className="an-infoDot" />
                                <div>
                                    <strong>Conversion Rate</strong>
                                    <p>
                                        Total conversions divided by profile views. Conversions currently
                                        include contact saves, exchange submits, email clicks and phone clicks.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}