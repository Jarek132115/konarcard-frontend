import React, { useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import "../../styling/dashboard/analytics.css";

export default function Analytics() {
    // TEMP: later hook to real analytics API
    const [range, setRange] = useState("7"); // "7" | "30"

    // Placeholder numbers (set these from backend later)
    const raw = useMemo(() => {
        if (range === "30") {
            return {
                profileViews: 0,
                cardTaps: 0,
                linkClicks: 0,
                sources: { taps: 0, shared: 0, qr: 0 },
                timeline: Array.from({ length: 10 }, (_, i) => ({
                    label: `Day ${i + 1}`,
                    value: 0,
                })),
            };
        }

        return {
            profileViews: 0,
            cardTaps: 0,
            linkClicks: 0,
            sources: { taps: 0, shared: 0, qr: 0 },
            timeline: Array.from({ length: 7 }, (_, i) => ({
                label: `Day ${i + 1}`,
                value: 0,
            })),
        };
    }, [range]);

    const total = raw.profileViews + raw.cardTaps + raw.linkClicks;

    const trafficTotal = raw.sources.taps + raw.sources.shared + raw.sources.qr;

    const sourcePct = (n) => {
        if (!trafficTotal) return 0;
        return Math.round((n / trafficTotal) * 100);
    };

    const maxTimeline = Math.max(...raw.timeline.map((t) => t.value), 1);

    return (
        <DashboardLayout
            title="Analytics"
            subtitle="See proof that your KonarCard is working and helping you get seen."
            rightSlot={
                <div className="an-range">
                    <button
                        type="button"
                        className={`an-range-btn ${range === "7" ? "active" : ""}`}
                        onClick={() => setRange("7")}
                    >
                        Last 7 days
                    </button>
                    <button
                        type="button"
                        className={`an-range-btn ${range === "30" ? "active" : ""}`}
                        onClick={() => setRange("30")}
                    >
                        Last 30 days
                    </button>
                </div>
            }
        >
            <div className="an-shell">
                {/* 2. Page Header */}
                <div className="an-header">
                    <div>
                        <h1 className="an-title">Analytics</h1>
                        <p className="an-subtitle">
                            Track profile views, card taps, and link clicks so you can see what’s
                            working — and improve results over time.
                        </p>
                    </div>

                    <div className="an-meta">
                        <span className="an-pill">
                            Time range: <strong>{range === "7" ? "7 days" : "30 days"}</strong>
                        </span>
                    </div>
                </div>

                {/* 3. Key Metrics Overview */}
                <section className="an-card">
                    <div className="an-card-head">
                        <div>
                            <h2 className="an-card-title">Key metrics overview</h2>
                            <p className="an-muted">
                                Instant proof your profile is being seen. This updates automatically as
                                you share your link and use your card.
                            </p>
                        </div>
                    </div>

                    <div className="an-metrics">
                        <div className="an-metric">
                            <div className="an-metric-num">{raw.profileViews}</div>
                            <div className="an-metric-label">Profile views</div>
                            <div className="an-metric-sub">People who opened your profile</div>
                        </div>

                        <div className="an-metric">
                            <div className="an-metric-num">{raw.cardTaps}</div>
                            <div className="an-metric-label">Card taps</div>
                            <div className="an-metric-sub">NFC taps on your KonarCard</div>
                        </div>

                        <div className="an-metric">
                            <div className="an-metric-num">{raw.linkClicks}</div>
                            <div className="an-metric-label">Link clicks</div>
                            <div className="an-metric-sub">Clicks from shared links</div>
                        </div>
                    </div>

                    {total === 0 && (
                        <div className="an-empty-note">
                            No activity yet. Share your profile link or tap your card to start seeing
                            data here.
                        </div>
                    )}
                </section>

                <div className="an-grid">
                    {/* 4. Activity Timeline */}
                    <section className="an-card an-span-7">
                        <div className="an-card-head">
                            <div>
                                <h2 className="an-card-title">Activity timeline</h2>
                                <p className="an-muted">
                                    A simple view of your recent activity. Peaks show when people engaged
                                    most.
                                </p>
                            </div>
                        </div>

                        <div className="an-timeline">
                            {raw.timeline.map((t) => {
                                const h = Math.round((t.value / maxTimeline) * 100);
                                return (
                                    <div key={t.label} className="an-bar">
                                        <div className="an-bar-top">
                                            <span className="an-bar-num">{t.value}</span>
                                        </div>
                                        <div className="an-bar-track">
                                            <div className="an-bar-fill" style={{ height: `${h}%` }} />
                                        </div>
                                        <div className="an-bar-label">{t.label}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {total === 0 && (
                            <div className="an-hint">
                                Tip: After each job, share your profile link. Most tradies see the first
                                activity within 24 hours.
                            </div>
                        )}
                    </section>

                    {/* 5. Traffic Sources */}
                    <section className="an-card an-span-5">
                        <div className="an-card-head">
                            <div>
                                <h2 className="an-card-title">Traffic sources</h2>
                                <p className="an-muted">
                                    See where attention comes from: taps, shared links, and QR scans.
                                </p>
                            </div>
                        </div>

                        <div className="an-sources">
                            <div className="an-source">
                                <div className="an-source-row">
                                    <div className="an-source-name">Card taps</div>
                                    <div className="an-source-num">{raw.sources.taps}</div>
                                </div>
                                <div className="an-source-bar">
                                    <div
                                        className="an-source-fill"
                                        style={{ width: `${sourcePct(raw.sources.taps)}%` }}
                                    />
                                </div>
                                <div className="an-source-foot">{sourcePct(raw.sources.taps)}%</div>
                            </div>

                            <div className="an-source">
                                <div className="an-source-row">
                                    <div className="an-source-name">Shared links</div>
                                    <div className="an-source-num">{raw.sources.shared}</div>
                                </div>
                                <div className="an-source-bar">
                                    <div
                                        className="an-source-fill"
                                        style={{ width: `${sourcePct(raw.sources.shared)}%` }}
                                    />
                                </div>
                                <div className="an-source-foot">{sourcePct(raw.sources.shared)}%</div>
                            </div>

                            <div className="an-source">
                                <div className="an-source-row">
                                    <div className="an-source-name">QR scans</div>
                                    <div className="an-source-num">{raw.sources.qr}</div>
                                </div>
                                <div className="an-source-bar">
                                    <div
                                        className="an-source-fill"
                                        style={{ width: `${sourcePct(raw.sources.qr)}%` }}
                                    />
                                </div>
                                <div className="an-source-foot">{sourcePct(raw.sources.qr)}%</div>
                            </div>
                        </div>

                        {trafficTotal === 0 && (
                            <div className="an-empty-note">
                                No source data yet. Add your QR to invoices or signage to get scans.
                            </div>
                        )}

                        <div className="an-cta">
                            <a className="an-btn an-btn-primary" href="/cards">
                                Manage cards
                            </a>
                            <a className="an-btn an-btn-ghost" href="/profiles">
                                Share profile link
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
