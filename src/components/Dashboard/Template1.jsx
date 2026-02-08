import React from "react";

/**
 * Template 1 (Default)
 * - Clean, modern, “trustworthy trades” look
 * - Fixed typography/colors/layout (no user customization)
 * - Uses same data object as every template
 * - Only respects visibility toggles
 */
import "../../styling/dashboard/templates/template1.css";


const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const asArray = (v) => (Array.isArray(v) ? v : []);

function Stars({ rating = 0 }) {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    return (
        <div className="t1-stars" aria-label={`Rating ${r} out of 5`}>
            {Array(r)
                .fill(null)
                .map((_, i) => (
                    <span key={`f-${i}`} className="t1-star">
                        ★
                    </span>
                ))}
            {Array(5 - r)
                .fill(null)
                .map((_, i) => (
                    <span key={`e-${i}`} className="t1-star t1-star--empty">
                        ★
                    </span>
                ))}
        </div>
    );
}

export default function Template1({ data }) {
    const v = data?.visibility || {};

    const cover = data?.cover_photo || "";
    const avatar = data?.avatar || "";

    const works = asArray(data?.works)
        .map((x) => x?.preview || x?.url || x)
        .filter(Boolean);

    const services = asArray(data?.services).filter((s) => s?.name || s?.price);
    const reviews = asArray(data?.reviews).filter((r) => r?.name || r?.text);

    const hasHeroCtas =
        data?.hasExchangeContact || nonEmpty(data?.contact_email) || nonEmpty(data?.phone_number);

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
                                    <h1 className="t1-h1">{data?.main_heading || "Your Main Heading"}</h1>
                                    {nonEmpty(data?.sub_heading) ? (
                                        <p className="t1-sub">{data.sub_heading}</p>
                                    ) : null}
                                </div>
                            </div>

                            {/* CTA buttons (placeholder wiring for now) */}
                            {hasHeroCtas ? (
                                <div className="t1-cta-row">
                                    <a className="t1-btn t1-btn-primary" href={`${data?.visitUrl || "#"}?action=save`}>
                                        Save My Number
                                    </a>
                                    <a className="t1-btn t1-btn-ghost" href={`${data?.visitUrl || "#"}?action=exchange`}>
                                        Exchange Contact
                                    </a>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>
            )}

            {/* ABOUT */}
            {v.showAboutMeSection && (nonEmpty(data?.full_name) || nonEmpty(data?.job_title) || nonEmpty(data?.bio)) ? (
                <section className="t1-section">
                    <div className="t1-section-head">
                        <h2 className="t1-h2">About</h2>
                        <div className="t1-divider" />
                    </div>

                    <div className="t1-about">
                        <div className="t1-about-card">
                            {nonEmpty(data?.full_name) ? <div className="t1-name">{data.full_name}</div> : null}
                            {nonEmpty(data?.job_title) ? <div className="t1-role">{data.job_title}</div> : null}
                            {nonEmpty(data?.bio) ? <p className="t1-bio">{data.bio}</p> : null}
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
            {v.showContactSection && (nonEmpty(data?.contact_email) || nonEmpty(data?.phone_number)) ? (
                <section className="t1-section t1-section-last">
                    <div className="t1-section-head">
                        <h2 className="t1-h2">Contact</h2>
                        <div className="t1-divider" />
                    </div>

                    <div className="t1-contact">
                        {nonEmpty(data?.contact_email) ? (
                            <a className="t1-contact-row" href={`mailto:${data.contact_email}`}>
                                <span className="t1-contact-k">Email</span>
                                <span className="t1-contact-v">{data.contact_email}</span>
                            </a>
                        ) : null}

                        {nonEmpty(data?.phone_number) ? (
                            <a className="t1-contact-row" href={`tel:${data.phone_number}`}>
                                <span className="t1-contact-k">Phone</span>
                                <span className="t1-contact-v">{data.phone_number}</span>
                            </a>
                        ) : null}

                        {/* socials (simple pills, templates control styling) */}
                        <div className="t1-socials">
                            {Object.entries(data?.socials || {})
                                .filter(([, url]) => nonEmpty(url))
                                .map(([key, url]) => (
                                    <a key={key} className="t1-social" href={url} target="_blank" rel="noreferrer">
                                        {key.replace("_url", "").replace("x", "x").toUpperCase()}
                                    </a>
                                ))}
                        </div>
                    </div>
                </section>
            ) : null}
        </div>
    );
}
