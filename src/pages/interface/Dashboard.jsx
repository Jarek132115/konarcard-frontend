// src/pages/interface/Dashboard.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../../styling/dashboard/dashboard.css";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import { useAuthUser } from "../../hooks/useAuthUser";

export default function Dashboard() {
    const { data: authUser } = useAuthUser();

    const profileCompletion = useMemo(() => {
        const items = [
            { key: "profilePhoto", label: "Add a profile photo", done: false },
            { key: "bio", label: "Write a short bio", done: false },
            { key: "services", label: "Add your services", done: false },
            { key: "reviews", label: "Add a review", done: false },
            { key: "contact", label: "Confirm contact details", done: true },
        ];

        const doneCount = items.filter((i) => i.done).length;
        const percent = Math.round((doneCount / items.length) * 100);

        return { percent, items };
    }, []);

    const hasProfile = true;
    const isFreePlan = true;

    const displayName = authUser?.name?.split(" ")?.[0] || "there";

    return (
        <DashboardLayout hideDesktopHeader>
            <div className="dash-shell">
                <PageHeader
                    title="Dashboard"
                    subtitle={`Welcome back, ${displayName}. Finish your profile and start using KonarCard.`}
                    rightSlot={
                        <div className="ph-rightStack">
                            <span className="kc-pill">{isFreePlan ? "Plan: FREE" : "Plan: PAID"}</span>

                            <div className="ph-actionsInline">
                                <Link to="/cards" className="kx-btn kx-btn--white">
                                    Order a card
                                </Link>
                                <Link to="/profiles" className="kx-btn kx-btn--black">
                                    Edit profile
                                </Link>
                            </div>
                        </div>
                    }
                />

                {!hasProfile && (
                    <section className="dash-card dash-empty">
                        <div className="dash-empty-left">
                            <h2 className="dash-card-title">Create your first profile</h2>
                            <p className="dash-muted">
                                Your profile is what customers scan, save, and share. Create it once — update anytime.
                            </p>

                            <div className="dash-actions-row">
                                <Link to="/profiles" className="kx-btn kx-btn--black">
                                    Create your profile
                                </Link>
                                <Link to="/helpcentreinterface" className="kx-btn kx-btn--white">
                                    Learn how it works
                                </Link>
                            </div>
                        </div>

                        <div className="dash-empty-preview" aria-hidden="true">
                            <div className="dash-phone">
                                <div className="dash-phone-top" />
                                <div className="dash-phone-line" />
                                <div className="dash-phone-line short" />
                                <div className="dash-phone-box" />
                                <div className="dash-phone-row">
                                    <div className="dash-chip" />
                                    <div className="dash-chip" />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <div className="dash-grid">
                    {/* TOP: Quick actions + Profile completion */}
                    <section className="dash-card dash-span-6 dash-order-1">
                        <div className="dash-card-head">
                            <div>
                                <h2 className="dash-card-title">Quick actions</h2>
                                <p className="dash-muted">Fast ways to start getting value from KonarCard.</p>
                            </div>
                        </div>

                        <div className="dash-quick">
                            <Link to="/profiles" className="dash-quick-tile">
                                <div className="dash-quick-title">Create / edit profile</div>
                                <div className="dash-quick-sub">Update your details anytime</div>
                            </Link>

                            <Link to="/profiles" className="dash-quick-tile">
                                <div className="dash-quick-title">Share your profile link</div>
                                <div className="dash-quick-sub">Copy + send to customers</div>
                            </Link>

                            <Link to="/cards" className="dash-quick-tile">
                                <div className="dash-quick-title">Order a KonarCard</div>
                                <div className="dash-quick-sub">Tap-to-share in seconds</div>
                            </Link>

                            <Link to="/contact-book" className="dash-quick-tile">
                                <div className="dash-quick-title">View contact book</div>
                                <div className="dash-quick-sub">People who saved you</div>
                            </Link>
                        </div>
                    </section>

                    <section className="dash-card dash-span-6 dash-order-2">
                        <div className="dash-card-head">
                            <div>
                                <h2 className="dash-card-title">Profile completion</h2>
                                <p className="dash-muted">
                                    Complete your profile to look more professional and get more leads.
                                </p>
                            </div>

                            <div className="dash-progress-wrap" aria-label="Profile completion">
                                <div className="dash-progress-text">
                                    <span className="dash-progress-percent">{profileCompletion.percent}%</span>
                                    <span className="dash-muted dash-muted-inline">complete</span>
                                </div>
                            </div>
                        </div>

                        <div
                            className="dash-progress-bar"
                            role="progressbar"
                            aria-valuenow={profileCompletion.percent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            <div className="dash-progress-fill" style={{ width: `${profileCompletion.percent}%` }} />
                        </div>

                        <ul className="dash-checklist">
                            {profileCompletion.items.map((item) => (
                                <li key={item.key} className={`dash-check ${item.done ? "done" : ""}`}>
                                    <span className="dash-check-dot" aria-hidden="true" />
                                    <span className="dash-check-label">{item.label}</span>
                                    {!item.done && <span className="dash-check-cta">Recommended</span>}
                                </li>
                            ))}
                        </ul>

                        <div className="dash-actions-row">
                            <Link to="/profiles" className="kx-btn kx-btn--black">
                                Complete your profile
                            </Link>
                            <Link to="/cards" className="kx-btn kx-btn--white">
                                Order a card
                            </Link>
                        </div>
                    </section>

                    {/* Your digital profile */}
                    <section className="dash-card dash-span-7">
                        <div className="dash-card-head">
                            <div>
                                <h2 className="dash-card-title">Your digital profile</h2>
                                <p className="dash-muted">This is what customers see when they scan your card.</p>
                            </div>
                            <Link to="/profiles" className="kx-btn kx-btn--white">
                                Edit profile
                            </Link>
                        </div>

                        <div className="dash-preview">
                            <div className="dash-preview-left">
                                <div className="dash-preview-card">
                                    <div className="dash-preview-hero" />
                                    <div className="dash-preview-line" />
                                    <div className="dash-preview-line short" />
                                    <div className="dash-preview-row">
                                        <div className="dash-preview-pill" />
                                        <div className="dash-preview-pill" />
                                        <div className="dash-preview-pill" />
                                    </div>
                                    <div className="dash-preview-box" />
                                </div>
                            </div>

                            <div className="dash-preview-right">
                                <div className="dash-mini-title">Preview tips</div>
                                <ul className="dash-mini-list">
                                    <li>Add a photo for trust</li>
                                    <li>List your main services</li>
                                    <li>Add 1–2 reviews</li>
                                    <li>Share your link after each job</li>
                                </ul>

                                <div className="dash-actions-row">
                                    <Link to="/profiles" className="kx-btn kx-btn--black">
                                        Improve profile
                                    </Link>
                                    <Link to="/cards" className="kx-btn kx-btn--white">
                                        Order a card
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Usage snapshot */}
                    <section className="dash-card dash-span-5">
                        <div className="dash-card-head">
                            <div>
                                <h2 className="dash-card-title">Usage snapshot</h2>
                                <p className="dash-muted">Last 7 days</p>
                            </div>
                            <Link to="/analytics" className="kx-btn kx-btn--white">
                                View analytics
                            </Link>
                        </div>

                        <div className="dash-metrics">
                            <div className="dash-metric">
                                <div className="dash-metric-num">0</div>
                                <div className="dash-metric-label">Profile views</div>
                            </div>
                            <div className="dash-metric">
                                <div className="dash-metric-num">0</div>
                                <div className="dash-metric-label">Card taps</div>
                            </div>
                            <div className="dash-metric">
                                <div className="dash-metric-num">0</div>
                                <div className="dash-metric-label">Link clicks</div>
                            </div>
                        </div>

                        <div className="dash-note">Analytics will populate as soon as you start sharing your profile.</div>
                    </section>

                    {/* Upgrade */}
                    {isFreePlan && (
                        <section className="dash-card dash-upgrade dash-span-12">
                            <div className="dash-upgrade-inner">
                                <div className="dash-upgrade-left">
                                    <h2 className="dash-upgrade-title">Unlock more with Plus</h2>
                                    <p className="dash-upgrade-sub">
                                        More templates, full customization, and advanced features to win more work.
                                    </p>

                                    <ul className="dash-upgrade-list">
                                        <li>All templates (5 designs)</li>
                                        <li>Full profile customization</li>
                                        <li>Better trust + conversion</li>
                                    </ul>
                                </div>

                                <div className="dash-upgrade-right">
                                    <Link to="/subscription" className="kx-btn kx-btn--white">
                                        Upgrade plan
                                    </Link>
                                    <Link to="/pricing" className="kx-btn kx-btn--black">
                                        Compare plans
                                    </Link>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Help & support */}
                    <section className="dash-card dash-span-12">
                        <div className="dash-help">
                            <div>
                                <h2 className="dash-card-title">Help & support</h2>
                                <p className="dash-muted">Need help setting up? We’ll get you sorted quickly.</p>
                            </div>

                            <div className="dash-actions-row">
                                <Link to="/helpcentreinterface" className="kx-btn kx-btn--white">
                                    View help centre
                                </Link>
                                <Link to="/contact-support" className="kx-btn kx-btn--black">
                                    Contact support
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
