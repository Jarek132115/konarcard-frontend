// frontend/src/pages/interface/Analytics.jsx
import React, { useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
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

    const rangeSlot = (
        <div className="an-range" role="tablist" aria-label="Analytics range">
            <button
                type="button"
                className={`an-range-btn ${range === "7" ? "active" : ""}`}
                onClick={() => setRange("7")}
                aria-pressed={range === "7"}
            >
                Last 7 days
            </button>

            <button
                type="button"
                className={`an-range-btn ${range === "30" ? "active" : ""}`}
                onClick={() => setRange("30")}
                aria-pressed={range === "30"}
            >
                Last 30 days
            </button>
        </div>
    );

    return (
        <DashboardLayout title="Analytics" subtitle="See proof your KonarCard is working." hideDesktopHeader>
            <div className="an-shell">
                <PageHeader
                    title="Analytics"
                    subtitle="Track profile views, card taps, and link clicks so you can see what’s working — and improve results over time."
                    rightSlot={rangeSlot}
                />

                {/* Key metrics */}
                <section className="an-card">
                    <div className="an-card-head">
                        <div>
                            <h2 className="an-card-title">Key metrics</h2>
                            <p className="an-muted">A quick summary of how many people engaged with your profile.</p>
                        </div>

                        <span className="an-pill">
                            Time range: <strong>{range === "7" ? "7 days" : "30 days"}</strong>
                        </span>
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
                            No activity yet. Share your profile link or tap your card to start seeing data here.
                        </div>
                    )}
                </section>

                <div className="an-grid">
                    {/* Timeline */}
                    <section className="an-card an-span-7">
                        <div className="an-card-head">
                            <div>
                                <h2 className="an-card-title">Activity timeline</h2>
                                <p className="an-muted">Peaks show when people engaged most.</p>
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
                                Tip: After each job, share your profile link. Most tradies see the first activity within 24 hours.
                            </div>
                        )}
                    </section>

                    {/* Sources */}
                    <section className="an-card an-span-5">
                        <div className="an-card-head">
                            <div>
                                <h2 className="an-card-title">Traffic sources</h2>
                                <p className="an-muted">Where attention comes from: taps, shared links, and QR scans.</p>
                            </div>
                        </div>

                        <div className="an-sources">
                            <div className="an-source">
                                <div className="an-source-row">
                                    <div className="an-source-name">Card taps</div>
                                    <div className="an-source-num">{raw.sources.taps}</div>
                                </div>
                                <div className="an-source-bar">
                                    <div className="an-source-fill" style={{ width: `${sourcePct(raw.sources.taps)}%` }} />
                                </div>
                                <div className="an-source-foot">{sourcePct(raw.sources.taps)}%</div>
                            </div>

                            <div className="an-source">
                                <div className="an-source-row">
                                    <div className="an-source-name">Shared links</div>
                                    <div className="an-source-num">{raw.sources.shared}</div>
                                </div>
                                <div className="an-source-bar">
                                    <div className="an-source-fill" style={{ width: `${sourcePct(raw.sources.shared)}%` }} />
                                </div>
                                <div className="an-source-foot">{sourcePct(raw.sources.shared)}%</div>
                            </div>

                            <div className="an-source">
                                <div className="an-source-row">
                                    <div className="an-source-name">QR scans</div>
                                    <div className="an-source-num">{raw.sources.qr}</div>
                                </div>
                                <div className="an-source-bar">
                                    <div className="an-source-fill" style={{ width: `${sourcePct(raw.sources.qr)}%` }} />
                                </div>
                                <div className="an-source-foot">{sourcePct(raw.sources.qr)}%</div>
                            </div>
                        </div>

                        {trafficTotal === 0 && (
                            <div className="an-empty-note">No source data yet. Add your QR to invoices or signage to get scans.</div>
                        )}

                        <div className="an-cta">
                            <a className="kx-btn kx-btn--black" href="/cards">
                                Manage cards
                            </a>
                            <a className="kx-btn kx-btn--white" href="/profiles">
                                Share profile link
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
