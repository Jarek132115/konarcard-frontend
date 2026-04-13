// frontend/src/pages/website/Blog.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";

import "../../styling/fonts.css";
import "../../styling/blog.css";

import { useSeo } from "../../utils/seo";

/* ── Animation presets ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
});

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.48, delay, ease: EASE },
});

export default function Blog() {
    useSeo({
        path: "/blog",
        title: "KonarCard Blog | Tips for UK Tradespeople",
        description:
            "Practical advice for UK tradespeople on how to win more jobs, get more reviews, and use a digital business card to look professional fast.",
    });

    const tabs = useMemo(
        () => [
            { key: "all", label: "All" },
            { key: "tips-guides", label: "Tips & guides" },
            { key: "digital-business-cards", label: "Digital business cards" },
            { key: "getting-more-jobs", label: "Getting more jobs" },
        ],
        []
    );

    const posts = useMemo(
        () => [
            {
                id: "t1",
                category: "tips-guides",
                categoryLabel: "Tips & guides",
                pillClass: "is-tips",
                title: "How to win more jobs with a digital business card",
                excerpt:
                    "Make it easier for customers to save your details, view your work, and contact you again after the job.",
                readTime: "3 min read",
                featured: true,
            },
            {
                id: "t2",
                category: "tips-guides",
                categoryLabel: "Tips & guides",
                pillClass: "is-tips",
                title: "5 ways to make customers call you back",
                excerpt:
                    "Small changes to your profile and follow-ups that increase repeat work and referrals.",
                readTime: "3 min read",
                featured: false,
            },
            {
                id: "t3",
                category: "tips-guides",
                categoryLabel: "Tips & guides",
                pillClass: "is-tips",
                title: "The best profile photo for tradies (with examples)",
                excerpt:
                    "A simple checklist to look professional and trustworthy in under 10 minutes.",
                readTime: "3 min read",
                featured: false,
            },
            {
                id: "d1",
                category: "digital-business-cards",
                categoryLabel: "Digital business cards",
                pillClass: "is-digital",
                title: "Do trades really need digital business cards?",
                excerpt:
                    "Paper cards get lost. Digital cards give tradies one link to share details, work, and contact info instantly.",
                readTime: "3 min read",
                featured: true,
            },
            {
                id: "d2",
                category: "digital-business-cards",
                categoryLabel: "Digital business cards",
                pillClass: "is-digital",
                title: "NFC vs QR codes: what's best for you?",
                excerpt:
                    "Both work. Here's when NFC is faster, when QR is better, and why having both wins.",
                readTime: "3 min read",
                featured: false,
            },
            {
                id: "d3",
                category: "digital-business-cards",
                categoryLabel: "Digital business cards",
                pillClass: "is-digital",
                title: "What to put on your digital business card profile",
                excerpt:
                    "The sections that actually get you contacted: services, photos, reviews, and one clear call-to-action.",
                readTime: "3 min read",
                featured: false,
            },
            {
                id: "g1",
                category: "getting-more-jobs",
                categoryLabel: "Getting more jobs",
                pillClass: "is-jobs",
                title: "How to set up your KonarCard in under 5 mins",
                excerpt:
                    "Claim your link, add your details, and start sharing your card by tap, QR, or link in minutes.",
                readTime: "3 min read",
                featured: true,
            },
            {
                id: "g2",
                category: "getting-more-jobs",
                categoryLabel: "Getting more jobs",
                pillClass: "is-jobs",
                title: "Turn every job into a review (without being awkward)",
                excerpt:
                    "A simple message template and the best moment to ask so you get more 5-star ratings.",
                readTime: "3 min read",
                featured: false,
            },
            {
                id: "g3",
                category: "getting-more-jobs",
                categoryLabel: "Getting more jobs",
                pillClass: "is-jobs",
                title: "How to stand out when quoting jobs",
                excerpt:
                    "Send your link with proof of work and instant contact buttons to win the job faster.",
                readTime: "3 min read",
                featured: false,
            },
        ],
        []
    );

    const [activeTab, setActiveTab] = useState("all");

    const featuredPosts = useMemo(() => posts.filter((p) => p.featured), [posts]);

    const filtered = useMemo(() => {
        if (activeTab === "all") return posts;
        return posts.filter((p) => p.category === activeTab);
    }, [posts, activeTab]);

    return (
        <>
            <Navbar />

            <main className="kc-blog kc-page">

                {/* ── HERO ─────────────────────────────────────── */}
                <section className="kc-blog__hero" aria-label="Blog hero">
                    <div className="kc-blog__container">
                        <div className="kc-blog__head">

                            {/* Grid bg, circular radial fade, consistent with all hero sections */}
                            <div className="kc-blog__gridBg" aria-hidden="true" />

                            <motion.div className="kc-blog__headContent" {...fadeUp(0)}>
                                <p className="kc-pill kc-blog__kicker">Blog</p>

                                <h1 className="h2 kc-blog__title">
                                    Tips and Guides for <span className="kc-blog__accent">UK Tradespeople</span>
                                </h1>

                                <p className="kc-subheading kc-blog__sub">
                                    Practical advice on getting more work, looking professional, and making the most of your KonarCard. Written for trades, not for tech people.
                                </p>

                                <div className="kc-blog__tabs" role="tablist" aria-label="Blog filters">
                                    {tabs.map((t) => {
                                        const isActive = t.key === activeTab;
                                        return (
                                            <button
                                                key={t.key}
                                                type="button"
                                                role="tab"
                                                aria-selected={isActive}
                                                className={`kc-tabPill${isActive ? " is-active" : ""}`}
                                                onClick={() => setActiveTab(t.key)}
                                            >
                                                {t.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── FEATURED (All tab only) ───────────────────── */}
                {activeTab === "all" && (
                    <section className="kc-blog__section kc-blog__section--featured" aria-label="Featured posts">
                        <div className="kc-blog__container">
                            <motion.div className="kc-blog__sectionHead" {...fadeUpInView(0)}>
                                <h2 className="h4 kc-blog__sectionTitle">Featured posts</h2>
                                <p className="kc-subheading kc-blog__sectionSub">
                                    Popular guides from each category to help you get the most out of KonarCard.
                                </p>
                            </motion.div>

                            <div className="kc-blog__grid">
                                {featuredPosts.slice(0, 3).map((p, i) => (
                                    <motion.article
                                        className="kc-blog__card"
                                        key={p.id}
                                        {...fadeUpInView(i * 0.08)}
                                    >
                                        <div className="kc-blog__media" aria-hidden="true">
                                            <span className={`kc-blog__catPill ${p.pillClass}`}>{p.categoryLabel}</span>
                                            <div className="kc-blog__image">Image</div>
                                        </div>

                                        <div className="kc-blog__cardBody">
                                            <h3 className="h5 kc-blog__cardTitle">{p.title}</h3>
                                            <p className="body-s kc-blog__excerpt">{p.excerpt}</p>
                                            <p className="kc-blog__meta">{p.readTime}</p>
                                            <Link
                                                to="/blog"
                                                className="kx-btn kx-btn--white kc-blog__btn"
                                                aria-label={`Read now: ${p.title}`}
                                            >
                                                Read now
                                            </Link>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── ALL BLOGS ─────────────────────────────────── */}
                <section className="kc-blog__section kc-blog__section--all" aria-label="All blogs">
                    <div className="kc-blog__container">
                        <motion.div className="kc-blog__sectionHead" {...fadeUpInView(0)}>
                            <h2 className="h4 kc-blog__sectionTitle">All blogs</h2>
                            <p className="kc-subheading kc-blog__sectionSub">
                                Everything you need to know about KonarCard, profiles &amp; NFC cards.
                            </p>
                        </motion.div>

                        <div className="kc-blog__grid">
                            {filtered.map((p, i) => (
                                <motion.article
                                    className="kc-blog__card"
                                    key={p.id}
                                    {...fadeUpInView(i * 0.05)}
                                >
                                    <div className="kc-blog__media" aria-hidden="true">
                                        <span className={`kc-blog__catPill ${p.pillClass}`}>{p.categoryLabel}</span>
                                        <div className="kc-blog__image">Image</div>
                                    </div>

                                    <div className="kc-blog__cardBody">
                                        <h3 className="h5 kc-blog__cardTitle">{p.title}</h3>
                                        <p className="body-s kc-blog__excerpt">{p.excerpt}</p>
                                        <p className="kc-blog__meta">{p.readTime}</p>
                                        <Link
                                            to="/blog"
                                            className="kx-btn kx-btn--white kc-blog__btn"
                                            aria-label={`Read now: ${p.title}`}
                                        >
                                            Read now
                                        </Link>
                                    </div>
                                </motion.article>
                            ))}
                        </div>

                        {/* Subscribe CTA */}
                        <motion.div className="kc-blog__subscribe" {...fadeUpInView(0)}>
                            <p className="body-s kc-blog__subscribeLine">
                                Subscribe to our blog to be the first to be informed.
                            </p>
                            <button type="button" className="kx-btn kx-btn--black kc-blog__subscribeBtn">
                                Subscribe to updates
                            </button>
                        </motion.div>
                    </div>
                </section>

            </main>

            <Footer />
        </>
    );
}
