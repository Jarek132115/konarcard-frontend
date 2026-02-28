import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../../styling/dashboard/dashboard.css";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import PageHeader from "../../components/Dashboard/PageHeader";
import ShareProfile from "../../components/ShareProfile";

import { useAuthUser } from "../../hooks/useAuthUser";
import { useMyProfiles } from "../../hooks/useBusinessCard";

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

    // placeholder completion
    const profileCompletion = useMemo(() => {
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

        const doneCount = items.filter((i) => i.done).length;
        const percent = Math.round((doneCount / items.length) * 100);

        return { percent, items };
    }, []);

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
                    subtitle={`Welcome Back ${displayName}. Finish your Profile and start using konarcard.`}
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
                    {/* Quick Actions */}
                    <section className="db-card db-span-12">
                        <div className="db-cardHead">
                            <div>
                                <h2 className="db-cardTitle">Quick Actions</h2>
                                <p className="db-muted">Fast Ways to start getting value from KonarCard.</p>
                            </div>
                        </div>

                        <div className="db-quickRow">
                            <Link to="/profiles" className="db-quickBtn">
                                <span className="db-quickIco" aria-hidden="true"><PencilIcon /></span>
                                Create / Edit Profile
                            </Link>

                            <button
                                type="button"
                                className="db-quickBtn"
                                onClick={() => setShareOpen(true)}
                                disabled={!selectedProfile}
                            >
                                <span className="db-quickIco" aria-hidden="true"><ShareIcon /></span>
                                Share Your Profile Link
                            </button>

                            <Link to="/cards" className="db-quickBtn">
                                <span className="db-quickIco" aria-hidden="true"><CardIcon /></span>
                                Order A KonarCard
                            </Link>

                            <Link to="/contact-book" className="db-quickBtn">
                                <span className="db-quickIco" aria-hidden="true"><ContactIcon /></span>
                                View Contact Book
                            </Link>
                        </div>
                    </section>

                    {/* Profile Completion (left) */}
                    <section className="db-card db-span-7">
                        <div className="db-cardHead">
                            <div>
                                <h2 className="db-cardTitle">Profile Completion</h2>
                                <p className="db-muted">Complete your profile to look more professional and get more jobs.</p>
                            </div>
                        </div>

                        <div className="db-complete">
                            <div className="db-completeLabel">To Complete:</div>

                            <ul className="db-list">
                                {profileCompletion.items.map((item) => (
                                    <li key={item.key} className="db-listRow">
                                        <span className="db-listText">{item.label}</span>
                                        <span className={`db-box ${item.done ? "done" : ""}`} aria-hidden="true" />
                                    </li>
                                ))}
                            </ul>

                            <div className="db-bottomCta">
                                <Link to="/profiles" className="kx-btn kx-btn--black">
                                    Complete Your Profile
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Usage Snapshot (right) */}
                    <section className="db-card db-span-5">
                        <div className="db-cardHead">
                            <div>
                                <h2 className="db-cardTitle">Usage Snapshot</h2>
                                <p className="db-muted">Fast Ways to start getting value from KonarCard.</p>
                            </div>
                        </div>

                        <div className="db-metrics2x2">
                            <div className="db-metricBox">
                                <div className="db-metricNum">22</div>
                                <div className="db-metricLabel">Profile Views</div>
                            </div>

                            <div className="db-metricBox">
                                <div className="db-metricNum">12</div>
                                <div className="db-metricLabel">Card Taps</div>
                            </div>

                            <div className="db-metricBox">
                                <div className="db-metricNum">10</div>
                                <div className="db-metricLabel">QR Scans</div>
                            </div>

                            <div className="db-metricBox">
                                <div className="db-metricNum">7</div>
                                <div className="db-metricLabel">Numbers Exchanged</div>
                            </div>
                        </div>

                        <div className="db-bottomCta">
                            <Link to="/analytics" className="kx-btn kx-btn--black">
                                View Analytics
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}