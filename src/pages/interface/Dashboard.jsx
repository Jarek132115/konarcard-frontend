import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../../styling/dashboard/dashboard.css";

// If you already use this hook elsewhere, keep it.
// If this import path differs in your project, update it to your actual file location.
import useAuthUser from "../../hooks/useAuthUser";

export default function Dashboard() {
    const { authUser } = useAuthUser?.() || { authUser: null };

    // Placeholder: later we compute this from real card/profile data
    const profileCompletion = useMemo(() => {
        // Example rule-set (replace later with real checks):
        // photo, bio, services, reviews, contact details
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

    // Placeholder: later we detect actual cards/profiles
    const hasProfile = true; // set false to see Empty State UI
    const isFreePlan = true; // replace with real plan state later

    const displayName = authUser?.name?.split(" ")?.[0] || "there";

    return (
        <div className="dash-shell">
            {/* Page header */}
            <div className="dash-header">
                <div className="dash-header-left">
                    <h1 className="dash-title">Dashboard</h1>
                    <p className="dash-subtitle">
                        Welcome back, <span className="dash-name">{displayName}</span>. Let’s
                        finish your profile and start using KonarCard.
                    </p>
                </div>

                <div className="dash-header-right">
                    <span className={`dash-badge ${isFreePlan ? "free" : "paid"}`}>
                        {isFreePlan ? "FREE PLAN" : "PAID PLAN"}
                    </span>
                    <Link to="/profiles" className="dash-btn dash-btn-primary">
                        Edit profile
                    </Link>
                </div>
            </div>

            {/* If no profile/card exists yet */}
            {!hasProfile && (
                <section className="dash-card dash-empty">
                    <div className="dash-empty-left">
                        <h2 className="dash-card-title">Create your first profile</h2>
                        <p className="dash-muted">
                            Your KonarCard profile is what customers scan, save, and share.
                            Create it once — update anytime.
                        </p>
                        <div className="dash-actions-row">
                            <Link to="/profiles" className="dash-btn dash-btn-primary">
                                Create your profile
                            </Link>
                            <Link to="/helpcentreinterface" className="dash-btn dash-btn-ghost">
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

            {/* Main grid */}
            <div className="dash-grid">
                {/* 3. Profile Completion */}
                <section className="dash-card dash-span-6">
                    <div className="dash-card-head">
                        <div>
                            <h2 className="dash-card-title">Profile completion</h2>
                            <p className="dash-muted">
                                Complete your profile to look more professional and get more leads.
                            </p>
                        </div>

                        <div className="dash-progress-wrap">
                            <div className="dash-progress-text">
                                <span className="dash-progress-percent">
                                    {profileCompletion.percent}%
                                </span>
                                <span className="dash-muted">complete</span>
                            </div>
                        </div>
                    </div>

                    <div className="dash-progress-bar">
                        <div
                            className="dash-progress-fill"
                            style={{ width: `${profileCompletion.percent}%` }}
                        />
                    </div>

                    <ul className="dash-checklist">
                        {profileCompletion.items.map((item) => (
                            <li key={item.key} className={`dash-check ${item.done ? "done" : ""}`}>
                                <span className="dash-check-dot" />
                                <span className="dash-check-label">{item.label}</span>
                                {!item.done && (
                                    <span className="dash-check-cta">Recommended</span>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="dash-actions-row">
                        <Link to="/profiles" className="dash-btn dash-btn-primary">
                            Complete your profile
                        </Link>
                        <Link to="/cards" className="dash-btn dash-btn-ghost">
                            Order a card
                        </Link>
                    </div>
                </section>

                {/* 4. Quick Actions */}
                <section className="dash-card dash-span-6">
                    <h2 className="dash-card-title">Quick actions</h2>
                    <p className="dash-muted">
                        The fastest way to start getting value from KonarCard.
                    </p>

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

                {/* 5. Digital Profile Preview */}
                <section className="dash-card dash-span-7">
                    <div className="dash-card-head">
                        <div>
                            <h2 className="dash-card-title">Your digital profile</h2>
                            <p className="dash-muted">
                                This is what customers see when they scan your card.
                            </p>
                        </div>
                        <Link to="/profiles" className="dash-btn dash-btn-ghost">
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
                                <Link to="/profiles" className="dash-btn dash-btn-primary">
                                    Improve profile
                                </Link>
                                <Link to="/cards" className="dash-btn dash-btn-ghost">
                                    Order a card
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. Usage Snapshot */}
                <section className="dash-card dash-span-5">
                    <div className="dash-card-head">
                        <div>
                            <h2 className="dash-card-title">Usage snapshot</h2>
                            <p className="dash-muted">Last 7 days</p>
                        </div>
                        <Link to="/analytics" className="dash-btn dash-btn-ghost">
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

                    <div className="dash-note">
                        Analytics will populate as soon as you start sharing your profile.
                    </div>
                </section>

                {/* 7. Upgrade Prompt */}
                {isFreePlan && (
                    <section className="dash-card dash-upgrade dash-span-12">
                        <div className="dash-upgrade-left">
                            <h2 className="dash-card-title">Unlock more with Plus</h2>
                            <p className="dash-muted">
                                Get all templates, full customization, and advanced features to look
                                more professional and win more work.
                            </p>
                            <ul className="dash-upgrade-list">
                                <li>All templates (5 designs)</li>
                                <li>Full profile customization</li>
                                <li>Better trust + conversion</li>
                            </ul>
                        </div>
                        <div className="dash-upgrade-right">
                            <Link to="/subscription" className="dash-btn dash-btn-primary">
                                Upgrade plan
                            </Link>
                            <Link to="/pricing" className="dash-btn dash-btn-ghost">
                                Compare plans
                            </Link>
                        </div>
                    </section>
                )}

                {/* 8. Help & Support */}
                <section className="dash-card dash-span-12">
                    <div className="dash-help">
                        <div>
                            <h2 className="dash-card-title">Help & support</h2>
                            <p className="dash-muted">
                                Need help setting up? We’ll get you sorted quickly.
                            </p>
                        </div>
                        <div className="dash-actions-row">
                            <Link to="/helpcentreinterface" className="dash-btn dash-btn-ghost">
                                View FAQs
                            </Link>
                            <Link to="/contact-support" className="dash-btn dash-btn-primary">
                                Contact support
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
