// frontend/src/pages/interface/Analytics.jsx
import React, { useMemo, useState } from "react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import "../../styling/dashboard/analytics.css";

export default function Analytics() {
    const [range, setRange] = useState("7"); // "7" | "30"
    const [profile, setProfile] = useState("all"); // placeholder

    // TEMP: later hook to real analytics API
    const raw = useMemo(() => {
        if (range === "30") {
            return { profileViews: 0, cardTaps: 0, qrScans: 0, linkClicks: 0 };
        }
        return { profileViews: 0, cardTaps: 0, qrScans: 0, linkClicks: 0 };
    }, [range]);

    const exportData = () => {
        // TODO: implement when backend is ready
    };

    const headerRight = (
        <div className="an-headRight">
            <div className="an-range" role="tablist" aria-label="Analytics range">
                <button
                    type="button"
                    className={`an-range-btn ${range === "7" ? "active" : ""}`}
                    onClick={() => setRange("7")}
                    aria-pressed={range === "7"}
                >
                    Last 7 Days
                </button>
                <button
                    type="button"
                    className={`an-range-btn ${range === "30" ? "active" : ""}`}
                    onClick={() => setRange("30")}
                    aria-pressed={range === "30"}
                >
                    Last 30 Days
                </button>
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
                    subtitle="Track profile views, card taps, and link clicks so you can see what’s working — and improve results over time."
                    rightSlot={headerRight}
                />

                {/* Key metrics */}
                <section className="an-card">
                    <div className="an-card-head">
                        <div>
                            <h2 className="an-card-title">Key metrics</h2>
                            <p className="an-muted">A quick summary of how many people engaged with your profile.</p>
                        </div>

                        <div className="an-profilePick">
                            <select
                                className="an-select"
                                value={profile}
                                onChange={(e) => setProfile(e.target.value)}
                                aria-label="Choose profile"
                            >
                                <option value="all">Choose Profile</option>
                                <option value="all">All profiles (soon)</option>
                                <option value="p1">Profile 1 (soon)</option>
                                <option value="p2">Profile 2 (soon)</option>
                            </select>
                        </div>
                    </div>

                    <div className="an-metrics4">
                        <div className="an-metric">
                            <div className="an-metric-num">{raw.profileViews}</div>
                            <div className="an-metric-label">Profile Views</div>
                        </div>

                        <div className="an-metric">
                            <div className="an-metric-num">{raw.cardTaps}</div>
                            <div className="an-metric-label">Card Taps</div>
                        </div>

                        <div className="an-metric">
                            <div className="an-metric-num">{raw.qrScans}</div>
                            <div className="an-metric-label">QR Scans</div>
                        </div>

                        <div className="an-metric">
                            <div className="an-metric-num">{raw.linkClicks}</div>
                            <div className="an-metric-label">Link Clicks</div>
                        </div>
                    </div>
                </section>

                {/* Activity timeline */}
                <section className="an-card">
                    <div className="an-card-head">
                        <div>
                            <h2 className="an-card-title">Activity timeline</h2>
                            <p className="an-muted">Peaks show when people engaged most.</p>
                        </div>
                    </div>

                    <div className="an-graphs">
                        <div className="an-graph">
                            <div className="an-graph-inner">
                                <div className="an-graph-title">Bar Graph / Line Graph</div>
                                <div className="an-graph-sub">Coming soon</div>
                            </div>
                        </div>

                        <div className="an-graph">
                            <div className="an-graph-inner">
                                <div className="an-graph-title">Bar Graph / Line Graph</div>
                                <div className="an-graph-sub">Coming soon</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}