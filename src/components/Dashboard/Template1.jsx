import React from "react";
import "../../styling/dashboard/templates/template1.css";

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const asArray = (v) => (Array.isArray(v) ? v : []);

function Stars({ rating = 0 }) {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    return (
        <div className="t1-stars" aria-label={`Rating ${r} out of 5`}>
            {Array(r).fill(null).map((_, i) => (
                <span key={`f-${i}`} className="t1-star">★</span>
            ))}
            {Array(5 - r).fill(null).map((_, i) => (
                <span key={`e-${i}`} className="t1-star t1-star--empty">★</span>
            ))}
        </div>
    );
}

export default function Template1({ vm }) {
    const v = vm || {};

    const cover = v.cover || "";
    const avatar = v.avatar || "";

    const works = asArray(v.works)
        .map((x) => x?.preview || x?.url || x)
        .filter(Boolean);

    const services = asArray(v.services).filter((s) => s?.name || s?.price);
    const reviews = asArray(v.reviews).filter((r) => r?.name || r?.text);

    const hasHeroCtas = !!(v.hasExchangeContact || nonEmpty(v.email) || nonEmpty(v.phone));

    return (
        <div className="kc-tpl kc-tpl-1">
            {/* HERO */}
            {v.showMainSection && (
                <section className="t1-hero">
                    <div className="t1-hero-card">
                        {nonEmpty(cover) ? (
                            <div className="t1-cover">
                                <img src={cover} alt="Cover" className="t1-cover-img" />
                            </div>
                        ) : (
                            <div className="t1-cover t1-cover--placeholder" aria-hidden="true" />
                        )}

                        <div className="t1-hero-body">
                            <div className="t1-hero-top">
                                {nonEmpty(avatar) ? (
                                    <img src={avatar} alt="Avatar" className="t1-avatar" />
                                ) : (
                                    <div className="t1-avatar t1-avatar--placeholder" aria-hidden="true" />
                                )}

                                <div className="t1-hero-names">
                                    <h1 className="t1-h1">{v.mainHeading || "Your Main Heading"}</h1>
                                    {nonEmpty(v.subHeading) ? <p className="t1-sub">{v.subHeading}</p> : null}
                                </div>
                            </div>

                            {hasHeroCtas ? (
                                <div className="t1-cta-row">
                                    <button type="button" className="t1-btn t1-btn-primary" onClick={v.onSaveMyNumber}>
                                        Save My Number
                                    </button>
                                    <button type="button" className="t1-btn t1-btn-ghost" onClick={v.onOpenExchangeContact}>
                                        Exchange Contact
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>
            )}

            {/* ABOUT */}
            {v.showAboutMeSection && (nonEmpty(v.fullName) || nonEmpty(v.jobTitle) || nonEmpty(v.bio)) ? (
                <section className="t1-section">
                    <div className="t1-section-head">
                        <h2 className="t1-h2">About</h2>
                        <div className="t1-divider" />
                    </div>

                    <div className="t1-about">
                        <div className="t1-about-card">
                            {nonEmpty(v.fullName) ? <div className="t1-name">{v.fullName}</div> : null}
                            {nonEmpty(v.jobTitle) ? <div className="t1-role">{v.jobTitle}</div> : null}
                            {nonEmpty(v.bio) ? <p className="t1-bio">{v.bio}</p> : null}
                        </div>
                    </div>
                </section>
            ) : null}

            {/* WORK */}
            {v.showWorkSection && works.length > 0 ? (
                <section className="t1-section">
                    <div className="t1-section-head">
                        <h2 className="t1-h2">My work</h2>
                        <div className="t1-divider" />
                    </div>

                    <div className="t1-work-grid">
                        {works.slice(0, 12).map((url, i) => (
                            <div key={i} className="t1-work-tile">
                                <img src={url} alt={`Work ${i + 1}`} className="t1-work-img" />
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* SERVICES */}
            {v.showServicesSection && services.length > 0 ? (
                <section className="t1-section">
                    <div className="t1-section-head">
                        <h2 className="t1-h2">Services</h2>
                        <div className="t1-divider" />
                    </div>

                    <div className="t1-services">
                        {services.slice(0, 12).map((s, i) => (
                            <div key={i} className="t1-service">
                                <div className="t1-service-left">
                                    <div className="t1-service-name">{s?.name}</div>
                                    {nonEmpty(s?.price) ? <div className="t1-service-sub">{s.price}</div> : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* REVIEWS */}
            {v.showReviewsSection && reviews.length > 0 ? (
                <section className="t1-section">
                    <div className="t1-section-head">
                        <h2 className="t1-h2">Reviews</h2>
                        <div className="t1-divider" />
                    </div>

                    <div className="t1-reviews">
                        {reviews.slice(0, 10).map((r, i) => (
                            <div key={i} className="t1-review">
                                <Stars rating={r?.rating} />
                                {nonEmpty(r?.text) ? <p className="t1-review-text">“{r.text}”</p> : null}
                                {nonEmpty(r?.name) ? <div className="t1-review-name">{r.name}</div> : null}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* CONTACT */}
            {v.showContactSection && (nonEmpty(v.email) || nonEmpty(v.phone)) ? (
                <section className="t1-section t1-section-last">
                    <div className="t1-section-head">
                        <h2 className="t1-h2">Contact</h2>
                        <div className="t1-divider" />
                    </div>

                    <div className="t1-contact">
                        {nonEmpty(v.email) ? (
                            <a className="t1-contact-row" href={`mailto:${v.email}`}>
                                <span className="t1-contact-k">Email</span>
                                <span className="t1-contact-v">{v.email}</span>
                            </a>
                        ) : null}

                        {nonEmpty(v.phone) ? (
                            <a className="t1-contact-row" href={`tel:${v.phone}`}>
                                <span className="t1-contact-k">Phone</span>
                                <span className="t1-contact-v">{v.phone}</span>
                            </a>
                        ) : null}

                        <div className="t1-socials">
                            {Object.entries(v.socials || {})
                                .filter(([, url]) => nonEmpty(url))
                                .map(([key, url]) => (
                                    <a key={key} className="t1-social" href={url} target="_blank" rel="noreferrer">
                                        {key.replace("_url", "").toUpperCase()}
                                    </a>
                                ))}
                        </div>
                    </div>
                </section>
            ) : null}
        </div>
    );
}
