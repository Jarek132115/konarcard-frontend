// frontend/src/pages/website/Blog.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Home/Footer";

import "../../styling/fonts.css";
import "../../styling/blog.css";

import { useSeo } from "../../utils/seo";
import { BLOG_POSTS, BLOG_CATEGORIES } from "./blog/blogPosts";
import LogoIconWhite from "../../assets/icons/Logo-Icon-White.svg";

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

    const tabs = BLOG_CATEGORIES;
    const [activeTab, setActiveTab] = useState("all");

    const filtered = useMemo(() => {
        if (activeTab === "all") return BLOG_POSTS;
        return BLOG_POSTS.filter((p) => p.category === activeTab);
    }, [activeTab]);

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
                                    Practical advice on getting more work, looking professional, and making the most of your KonarCard.
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

                {/* ── ALL POSTS — single unified grid ───────────── */}
                <section className="kc-blog__section kc-blog__section--all" aria-label="All blogs">
                    <div className="kc-blog__container">
                        <div className="kc-blog__grid">
                            {filtered.map((p, i) => (
                                <motion.article
                                    className="kc-blog__card"
                                    key={p.id}
                                    {...fadeUpInView(Math.min(i, 5) * 0.05)}
                                >
                                    <Link
                                        to={`/blog/${p.slug}`}
                                        className="kc-blog__cardLink"
                                        aria-label={`Read: ${p.title}`}
                                    >
                                        <div className="kc-blog__media" aria-hidden="true">
                                            <span className={`kc-blog__catPill ${p.pillClass}`}>
                                                {p.categoryLabel}
                                            </span>
                                            <div className="kc-blog__placeholder">
                                                <img
                                                    src={LogoIconWhite}
                                                    alt=""
                                                    className="kc-blog__placeholderLogo"
                                                />
                                            </div>
                                        </div>

                                        <div className="kc-blog__cardBody">
                                            <h3 className="kc-blog__cardTitle">{p.title}</h3>
                                            <p className="kc-blog__excerpt">{p.excerpt}</p>
                                            <p className="kc-blog__meta">{p.readTime}</p>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </>
    );
}
