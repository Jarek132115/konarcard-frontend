// frontend/src/pages/website/blog/BlogPostLayout.jsx
// Shared shell for every blog post: navbar, header (pill/h1/meta), JSON-LD,
// SEO meta, body container, end-of-post CTA, and footer.
//
// Each post component supplies its own body content as children, plus a small
// metadata header (slug, title, description, datePublished, readTime, pill).
//
// To add a new post:
//   1. Create a new component that renders <BlogPostLayout {...props}>{body}</BlogPostLayout>
//   2. Add a <Route> for it in App.jsx
//   3. Add an entry to the posts array in Blog.jsx (slug, title, excerpt, etc.)
//   4. Add the URL to public/sitemap.xml

import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Home/Footer";

import "../../../styling/fonts.css";
import "../../../styling/blogpost.css";

import { useSeo, SITE_URL, upsertJsonLd } from "../../../utils/seo";

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

export default function BlogPostLayout({
    slug,
    title,
    description,
    pillLabel = "KonarCard",
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

    return (
        <>
            <Navbar />

            <main className="kbp-page kc-page">
                <article className="kbp-wrap">
                    <Link to="/blog" className="kbp-crumb">← Back to blog</Link>

                    <p className="kc-pill kbp-pill">{pillLabel}</p>

                    <h1 className="h2 kbp-title">{title}</h1>

                    <div className="kbp-meta">
                        {published ? <span>{formatDateLong(published)}</span> : null}
                        {readTime ? <span>{readTime}</span> : null}
                    </div>

                    <hr className="kbp-divider" />

                    <div className="kbp-body">
                        {children}

                        <div className="kbp-cta">
                            <h3>Ready to switch from paper?</h3>
                            <p>Pick a colour, claim your link, and start sharing your profile in minutes.</p>
                            <div className="kbp-ctaRow">
                                <Link to="/products" className="kx-btn kx-btn--white">
                                    See the cards
                                </Link>
                                <Link to="/register" className="kx-btn kx-btn--black">
                                    Start free
                                </Link>
                            </div>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </>
    );
}
