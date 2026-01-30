// frontend/src/pages/website/Blog.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import "../../styling/design-system.css";
import "../../styling/blog.css";

export default function Blog() {
    const tabs = useMemo(
        () => [
            { key: "all", label: "All" },
            { key: "tips-guides", label: "Tips & guides" },
            { key: "digital-business-cards", label: "Digital business cards" },
            { key: "getting-more-jobs", label: "Getting more jobs" },
            { key: "product-updates", label: "Product updates" },
        ],
        []
    );

    const posts = useMemo(
        () => [
            // Tips & guides (3)
            {
                id: "t1",
                category: "tips-guides",
                categoryLabel: "Tips & Guides",
                title: "How to win more jobs with a digital business card",
                excerpt:
                    "Make it easier for customers to save your details, view your work, and contact you again after the job.",
                featured: true,
            },
            {
                id: "t2",
                category: "tips-guides",
                categoryLabel: "Tips & Guides",
                title: "5 ways to make customers call you back",
                excerpt:
                    "Small changes to your profile and follow-ups that increase repeat work and referrals.",
                featured: true,
            },
            {
                id: "t3",
                category: "tips-guides",
                categoryLabel: "Tips & Guides",
                title: "The best profile photo for tradies (with examples)",
                excerpt:
                    "A simple checklist to look professional and trustworthy in under 10 minutes.",
                featured: false,
            },

            // Digital business cards (3)
            {
                id: "d1",
                category: "digital-business-cards",
                categoryLabel: "Digital business cards",
                title: "Do trades really need digital business cards?",
                excerpt:
                    "Paper cards get lost. Digital cards give tradies one link to share details, work, and contact info instantly.",
                featured: true,
            },
            {
                id: "d2",
                category: "digital-business-cards",
                categoryLabel: "Digital business cards",
                title: "NFC vs QR codes: what’s best for you?",
                excerpt:
                    "Both work. Here’s when NFC is faster, when QR is better, and why having both wins.",
                featured: false,
            },
            {
                id: "d3",
                category: "digital-business-cards",
                categoryLabel: "Digital business cards",
                title: "What to put on your digital business card profile",
                excerpt:
                    "The sections that actually get you contacted: services, photos, reviews, and one clear call-to-action.",
                featured: false,
            },

            // Getting more jobs (3)
            {
                id: "g1",
                category: "getting-more-jobs",
                categoryLabel: "Getting more jobs",
                title: "How to set up your KonarCard in under 5 mins",
                excerpt:
                    "Claim your link, add your details, and start sharing your card by tap, QR, or link — in a few minutes.",
                featured: true,
            },
            {
                id: "g2",
                category: "getting-more-jobs",
                categoryLabel: "Getting more jobs",
                title: "Turn every job into a review (without being awkward)",
                excerpt:
                    "A simple message template and the best moment to ask so you get more 5-star ratings.",
                featured: false,
            },
            {
                id: "g3",
                category: "getting-more-jobs",
                categoryLabel: "Getting more jobs",
                title: "How to stand out when quoting jobs",
                excerpt:
                    "Send your link with proof of work and instant contact buttons to win the job faster.",
                featured: false,
            },

            // Product updates (3)
            {
                id: "p1",
                category: "product-updates",
                categoryLabel: "Product updates",
                title: "New profile layouts are here",
                excerpt:
                    "Choose a cleaner layout, move sections around, and make your page easier to skim.",
                featured: false,
            },
            {
                id: "p2",
                category: "product-updates",
                categoryLabel: "Product updates",
                title: "Faster sharing with improved QR codes",
                excerpt:
                    "Better scanning in low light and a cleaner look when customers open your link.",
                featured: false,
            },
            {
                id: "p3",
                category: "product-updates",
                categoryLabel: "Product updates",
                title: "Improved onboarding for claiming your link",
                excerpt:
                    "Less friction, fewer steps, and a smoother flow from claim → profile → share.",
                featured: false,
            },
        ],
        []
    );

    const [activeTab, setActiveTab] = useState("all");

    const featuredPosts = useMemo(() => posts.filter((p) => p.featured), [posts]);

    const allFilteredPosts = useMemo(() => {
        if (activeTab === "all") return posts;
        return posts.filter((p) => p.category === activeTab);
    }, [posts, activeTab]);

    return (
        <>
            <Navbar />

            <main className="kc-blog">
                {/* Hero */}
                <section className="kc-blog__hero">
                    <div className="kc-blog__heroInner">
                        <h1 className="h2 kc-blog__title">
                            Tips, guides, and ideas to <br />
                            help you win more jobs
                        </h1>
                        <p className="body-s kc-blog__subtitle">
                            Practical advice for trades using digital business cards, profiles,
                            and NFC.
                        </p>

                        {/* Tabs */}
                        <div className="kc-blog__tabs" role="tablist" aria-label="Blog filters">
                            {tabs.map((t) => {
                                const isActive = t.key === activeTab;
                                return (
                                    <button
                                        key={t.key}
                                        type="button"
                                        className={`kc-blog__tab ${isActive ? "is-active" : ""}`}
                                        onClick={() => setActiveTab(t.key)}
                                        role="tab"
                                        aria-selected={isActive}
                                    >
                                        {t.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Featured (ONLY on All) */}
                {activeTab === "all" && (
                    <section className="kc-blog__section">
                        <div className="kc-blog__sectionHead">
                            <h2 className="h4 kc-blog__sectionTitle">Featured posts</h2>
                            <p className="body-s kc-blog__sectionSub">
                                Popular guides to help you get the most out of KonarCard.
                            </p>
                        </div>

                        <div className="kc-blog__grid">
                            {featuredPosts.slice(0, 3).map((p) => (
                                <article className="kc-blog__card" key={p.id}>
                                    <div className="kc-blog__image" aria-hidden="true">
                                        Image
                                    </div>

                                    <div className="kc-blog__cardBody">
                                        <p className="kc-blog__cat">{p.categoryLabel}</p>
                                        <h3 className="h5 kc-blog__cardTitle">{p.title}</h3>
                                        <p className="body-s kc-blog__excerpt">{p.excerpt}</p>

                                        <Link to="/blog" className="kc-blog__read">
                                            Read article →
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* All Blogs */}
                <section className="kc-blog__section kc-blog__section--tightTop">
                    <div className="kc-blog__sectionHead">
                        <h2 className="h4 kc-blog__sectionTitle">All blogs</h2>
                        <p className="body-s kc-blog__sectionSub">
                            Everything you need to know about KonarCard, profiles & NFC cards.
                        </p>
                    </div>

                    <div className="kc-blog__grid">
                        {allFilteredPosts.map((p) => (
                            <article className="kc-blog__card" key={p.id}>
                                <div className="kc-blog__image" aria-hidden="true">
                                    Image
                                </div>

                                <div className="kc-blog__cardBody">
                                    <p className="kc-blog__cat">{p.categoryLabel}</p>
                                    <h3 className="h5 kc-blog__cardTitle">{p.title}</h3>
                                    <p className="body-s kc-blog__excerpt">{p.excerpt}</p>

                                    <Link to="/blog" className="kc-blog__read">
                                        Read article →
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
