// frontend/src/pages/website/blog/BlogPostLayout.jsx
// Shared shell for every blog post: navbar, header (pill/h1/meta), JSON-LD,
// SEO meta, body container, end-of-post CTA, related posts and footer.
//
// Each post component supplies its own body content as children, plus a small
// metadata header (slug, title, description, datePublished, readTime, pill).
//
// To add a new post:
//   1. Add an entry to blogPosts.js
//   2. Create a new component that renders <BlogPostLayout {...props}>{body}</BlogPostLayout>
//   3. Add a <Route> for it in App.jsx
//   4. Add the URL to public/sitemap.xml

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Home/Footer";

import "../../../styling/fonts.css";
import "../../../styling/blog.css"; // for the .kc-blog__catPill colour classes shared by post header + related cards
import "../../../styling/blogpost.css";

import { useSeo, SITE_URL, upsertJsonLd } from "../../../utils/seo";
import { getRelatedPosts, findPostBySlug } from "./blogPosts";
import LogoIconWhite from "../../../assets/icons/Logo-Icon-White.svg";

function formatDateLong(isoDate) {
    try {
        const d = new Date(isoDate);
        if (Number.isNaN(d.getTime())) return isoDate;
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return isoDate;
    }
}

/* ── Reading-progress bar ────────────────────────────────── */
function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        function onScroll() {
            const doc = document.documentElement;
            const scrollTop = window.scrollY || doc.scrollTop || 0;
            const max = (doc.scrollHeight || 0) - (window.innerHeight || 0);
            const pct = max > 0 ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0;
            setProgress(pct);
        }

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, []);

    return (
        <div className="kbp-progress" aria-hidden="true">
            <div className="kbp-progress__bar" style={{ width: `${progress}%` }} />
        </div>
    );
}

/* ── Branded image placeholder shared with blog cards ────── */
function HeroPlaceholder() {
    return (
        <div className="kbp-hero" aria-hidden="true">
            <img src={LogoIconWhite} alt="" className="kbp-hero__logo" />
        </div>
    );
}

function RelatedPostCard({ post }) {
    return (
        <article className="kbp-relCard">
            <Link
                to={`/blog/${post.slug}`}
                className="kbp-relCard__link"
                aria-label={`Read: ${post.title}`}
            >
                <div className="kbp-relCard__media" aria-hidden="true">
                    <span className={`kc-blog__catPill ${post.pillClass}`}>
                        {post.categoryLabel}
                    </span>
                    <div className="kbp-relCard__placeholder">
                        <img src={LogoIconWhite} alt="" className="kbp-relCard__placeholderLogo" />
                    </div>
                </div>

                <div className="kbp-relCard__body">
                    <h3 className="kbp-relCard__title">{post.title}</h3>
                    <p className="kbp-relCard__excerpt">{post.excerpt}</p>
                    <p className="kbp-relCard__meta">{post.readTime}</p>
                </div>
            </Link>
        </article>
    );
}

export default function BlogPostLayout({
    slug,
    title,
    description,
    pillLabel = "KonarCard",
    pillClass = "is-digital",
    datePublished,
    dateModified,
    readTime,
    metaTitle,
    children,
}) {
    const path = `/blog/${slug}`;
    const url = `${SITE_URL}${path}`;
    const published = datePublished;
    const modified = dateModified || datePublished;

    useSeo({
        path,
        title: metaTitle || `${title} | KonarCard`,
        description,
        ogType: "article",
    });

    useEffect(() => {
        upsertJsonLd(`article-${slug}`, {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description,
            author: {
                "@type": "Organization",
                name: "KonarCard",
                url: SITE_URL,
            },
            publisher: {
                "@type": "Organization",
                name: "KonarCard",
                url: SITE_URL,
                logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/Favicon.png`,
                },
            },
            datePublished: published,
            dateModified: modified,
            url,
            mainEntityOfPage: {
                "@type": "WebPage",
                "@id": url,
            },
        });

        upsertJsonLd(`article-breadcrumb-${slug}`, {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
                { "@type": "ListItem", position: 3, name: title, item: url },
            ],
        });
    }, [slug, title, description, published, modified, url]);

    const related = getRelatedPosts(slug, 2);

    // Derive pill class from registry if the post is registered, otherwise fall back to prop
    const registered = findPostBySlug(slug);
    const effectivePillClass = registered?.pillClass || pillClass;
    const effectivePillLabel = registered?.categoryLabel || pillLabel;

    return (
        <>
            <Navbar />

            <ReadingProgressBar />

            <main className="kbp-page kc-page">
                <article className="kbp-wrap">
                    <Link to="/blog" className="kbp-crumb">← Back to Blog</Link>

                    <span className={`kc-blog__catPill kbp-pill ${effectivePillClass}`}>{effectivePillLabel}</span>

                    <h1 className="kbp-title">{title}</h1>

                    {description ? <p className="kbp-lede">{description}</p> : null}

                    <div className="kbp-meta">
                        {readTime ? <span>{readTime}</span> : null}
                        {published ? <span>{formatDateLong(published)}</span> : null}
                    </div>

                    <HeroPlaceholder />

                    <div className="kbp-body">
                        {children}
                    </div>

                    {/* End-of-post CTA */}
                    <section className="kbp-cta" aria-label="Get started with KonarCard">
                        <h3>Ready to switch from paper?</h3>
                        <p>Pick a colour, claim your link, and start sharing your profile in minutes.</p>
                        <div className="kbp-ctaRow">
                            <Link to="/products" className="kx-btn kx-btn--orange kbp-ctaBtn">
                                See the Cards
                            </Link>
                            <Link to="/register" className="kx-btn kx-btn--black kbp-ctaBtn">
                                Start Free
                            </Link>
                        </div>
                    </section>

                    {/* Related posts */}
                    {related.length > 0 ? (
                        <section className="kbp-related" aria-label="Related posts">
                            <h2 className="kbp-related__title">You Might Also Like</h2>
                            <div className="kbp-related__grid">
                                {related.map((p) => (
                                    <RelatedPostCard key={p.slug} post={p} />
                                ))}
                            </div>
                        </section>
                    ) : null}
                </article>
            </main>

            <Footer />
        </>
    );
}
