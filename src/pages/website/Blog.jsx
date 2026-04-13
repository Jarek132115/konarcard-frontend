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
                id: "d4",
                slug: "best-digital-business-cards-uk-tradespeople",
                category: "digital-business-cards",
                categoryLabel: "Digital business cards",
                pillClass: "is-digital",
                title: "The Best Digital Business Cards for UK Tradespeople in 2026",
                excerpt:
                    "An honest comparison of the digital business cards available to UK tradespeople, with pricing, features and which one actually works for trades.",
                readTime: "10 min read",
                featured: true,
            },
            {
                id: "d5",
                slug: "what-is-an-nfc-business-card",
                category: "digital-business-cards",
                categoryLabel: "Digital business cards",
                pillClass: "is-digital",
                title: "What is an NFC Business Card and How Does It Work?",
                excerpt:
                    "Plain English explanation of NFC business cards, how tapping works, and why UK tradespeople are switching from paper cards to NFC.",
                readTime: "6 min read",
                featured: true,
            },
            {
                id: "d6",
                slug: "digital-business-cards-for-tradespeople",
                category: "digital-business-cards",
                categoryLabel: "Digital business cards",
                pillClass: "is-digital",
                title: "Digital Business Cards for Tradespeople, The Complete Guide",
                excerpt:
                    "How UK tradespeople are using digital business cards to win more jobs, look more professional and never hand out an out-of-date card again.",
                readTime: "9 min read",
                featured: true,
            },
            {
                id: "t4",
                slug: "are-business-cards-still-worth-it",
                category: "tips-guides",
                categoryLabel: "Tips & guides",
                pillClass: "is-tips",
                title: "Are Business Cards Still Worth It in 2026?",
                excerpt:
                    "Honest answer to whether business cards are still worth having in 2026, and what UK tradespeople are using instead to win more work.",
                readTime: "6 min read",
                featured: true,
            },
            {
                id: "g4",
                slug: "how-to-win-more-jobs-as-a-tradesperson",
                category: "getting-more-jobs",
                categoryLabel: "Getting more jobs",
                pillClass: "is-jobs",
                title: "How to Win More Jobs as a Tradesperson Without Spending More on Ads",
                excerpt:
                    "Five practical ways UK tradespeople win more work without paid advertising, and how to make word of mouth work harder for you.",
                readTime: "8 min read",
                featured: true,
            },
            {
                id: "g5",
                slug: "how-to-get-more-reviews-as-a-tradesperson",
                category: "getting-more-jobs",
                categoryLabel: "Getting more jobs",
                pillClass: "is-jobs",
                title: "How to Get More Reviews as a Tradesperson",
                excerpt:
                    "Practical advice for UK tradespeople on getting more genuine customer reviews, and why most tradespeople ask at the wrong time.",
                readTime: "8 min read",
                featured: true,
            },
            {
                id: "t5",
                slug: "how-to-set-up-the-perfect-tradesperson-profile",
                category: "tips-guides",
                categoryLabel: "Tips & guides",
                pillClass: "is-tips",
                title: "How to Set Up the Perfect Tradesperson Profile",
                excerpt:
                    "A practical guide for UK tradespeople on building a digital profile that wins jobs, what to write, what photos to take and how to make every section work for you.",
                readTime: "10 min read",
                featured: true,
            },
            {
                id: "d7",
                slug: "nfc-cards-vs-qr-codes-for-tradespeople",
                category: "digital-business-cards",
                categoryLabel: "Digital business cards",
                pillClass: "is-digital",
                title: "NFC Cards vs QR Codes, Which is Better for Tradespeople?",
                excerpt:
                    "Honest comparison of NFC cards and QR codes for UK tradespeople, how each one works, when to use which, and why having both beats choosing one.",
                readTime: "7 min read",
                featured: true,
            },
            {
                id: "d8",
                slug: "how-much-does-a-digital-business-card-cost-uk",
                category: "digital-business-cards",
                categoryLabel: "Digital business cards",
                pillClass: "is-digital",
                title: "How Much Does a Digital Business Card Cost in the UK?",
                excerpt:
                    "Honest breakdown of digital business card costs in the UK in 2026, what you actually get at each price point and which option makes sense for tradespeople.",
                readTime: "8 min read",
                featured: true,
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
                                                to={p.slug ? `/blog/${p.slug}` : "/blog"}
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
                                            to={p.slug ? `/blog/${p.slug}` : "/blog"}
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
