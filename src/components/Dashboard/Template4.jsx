import React, { useMemo } from "react";
import "../../styling/dashboard/templates/template4.css";

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const asArray = (v) => (Array.isArray(v) ? v : []);

function Stars({ rating = 0 }) {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    return (
        <div className="t4-stars" aria-label={`Rating ${r} out of 5`}>
            {Array(5)
                .fill(null)
                .map((_, i) => (
                    <span key={i} className={`t4-star ${i < r ? "on" : "off"}`}>
                        ★
                    </span>
                ))}
        </div>
    );
}

export default function Template4({ vm }) {
    const v = vm || {};

    const cover = v.cover || "";
    const avatar = v.avatar || "";

    const works = useMemo(
        () =>
            asArray(v.works)
                .map((x) => x?.preview || x?.url || x)
                .filter(Boolean),
        [v.works]
    );

    const services = useMemo(() => asArray(v.services).filter((s) => s?.name || s?.price), [v.services]);
    const reviews = useMemo(() => asArray(v.reviews).filter((r) => r?.name || r?.text), [v.reviews]);

    const socials = useMemo(() => {
        return Object.entries(v.socials || {})
            .filter(([, url]) => nonEmpty(url))
            .map(([key, url]) => ({
                key,
                url,
                label: key.replace("_url", "").toUpperCase(),
            }));
    }, [v.socials]);

    const hasHeroCtas = !!(v.hasExchangeContact || nonEmpty(v.email) || nonEmpty(v.phone));

    return (
        <div className="kc-tpl kc-tpl-4">
            {/* HERO */}
            {v.showMainSection && (
                <section className="t4-hero">
                    <div className="t4-hero-bg" aria-hidden="true" />
                    <div className="t4-hero-card">
                        <div className="t4-hero-top">
                            <div className="t4-avatar-wrap">
                                {nonEmpty(avatar) ? (
                                    <img className="t4-avatar" src={avatar} alt="Avatar" />
                                ) : (
                                    <div className="t4-avatar t4-avatar--ph" aria-hidden="true" />
                                )}
                            </div>

                            <div className="t4-hero-text">
                                <h1 className="t4-h1">{v.mainHeading || "Your Main Heading"}</h1>
                                {nonEmpty(v.subHeading) ? <p className="t4-sub">{v.subHeading}</p> : null}

                                {(nonEmpty(v.fullName) || nonEmpty(v.jobTitle)) && (
                                    <div className="t4-meta">
                                        {nonEmpty(v.fullName) ? <span className="t4-meta-pill">{v.fullName}</span> : null}
                                        {nonEmpty(v.jobTitle) ? <span className="t4-meta-pill t4-meta-pill--ghost">{v.jobTitle}</span> : null}
                                    </div>
                                )}
                            </div>
                        </div>

                        {nonEmpty(cover) ? (
                            <div className="t4-cover">
                                <img className="t4-cover-img" src={cover} alt="Cover" />
                            </div>
                        ) : (
                            <div className="t4-cover t4-cover--ph" aria-hidden="true" />
                        )}

                        {hasHeroCtas ? (
                            <div className="t4-cta">
                                <button type="button" className="t4-btn t4-btn-primary" onClick={v.onSaveMyNumber}>
                                    Save My Number
                                </button>
                                <button type="button" className="t4-btn t4-btn-ghost" onClick={v.onOpenExchangeContact}>
                                    Exchange Contact
                                </button>
                            </div>
                        ) : null}
                    </div>
                </section>
            )}

            {/* ABOUT */}
            {v.showAboutMeSection && (nonEmpty(v.bio) || nonEmpty(v.fullName) || nonEmpty(v.jobTitle)) ? (
                <section className="t4-section">
                    <div className="t4-head">
                        <h2 className="t4-h2">About</h2>
                    </div>
                    <div className="t4-card t4-about">
                        {nonEmpty(v.bio) ? <p className="t4-bio">{v.bio}</p> : null}
                    </div>
                </section>
            ) : null}

            {/* WORK */}
            {v.showWorkSection && works.length > 0 ? (
                <section className="t4-section">
                    <div className="t4-head">
                        <h2 className="t4-h2">My work</h2>
                    </div>
                    <div className="t4-work">
                        {works.slice(0, 12).map((url, i) => (
                            <div key={i} className="t4-work-tile">
                                <img src={url} alt={`Work ${i + 1}`} className="t4-work-img" />
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* SERVICES */}
            {v.showServicesSection && services.length > 0 ? (
                <section className="t4-section">
                    <div className="t4-head">
                        <h2 className="t4-h2">Services</h2>
                    </div>
                    <div className="t4-services">
                        {services.slice(0, 14).map((s, i) => (
                            <div key={i} className="t4-service">
                                <div className="t4-service-name">{s?.name || "Service"}</div>
                                {nonEmpty(s?.price) ? <div className="t4-service-price">{s.price}</div> : null}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* REVIEWS */}
            {v.showReviewsSection && reviews.length > 0 ? (
                <section className="t4-section">
                    <div className="t4-head">
                        <h2 className="t4-h2">Reviews</h2>
                    </div>

                    <div className="t4-reviews">
                        {reviews.slice(0, 10).map((r, i) => (
                            <div key={i} className="t4-card t4-review">
                                <Stars rating={r?.rating} />
                                {nonEmpty(r?.text) ? <p className="t4-review-text">“{r.text}”</p> : null}
                                {nonEmpty(r?.name) ? <div className="t4-review-name">{r.name}</div> : null}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* CONTACT */}
            {v.showContactSection && (nonEmpty(v.email) || nonEmpty(v.phone) || socials.length > 0) ? (
                <section className="t4-section t4-section-last">
                    <div className="t4-head">
                        <h2 className="t4-h2">Contact</h2>
                    </div>

                    <div className="t4-card t4-contact">
                        <div className="t4-contact-grid">
                            {nonEmpty(v.email) ? (
                                <a className="t4-contact-row" href={`mailto:${v.email}`}>
                                    <span className="t4-k">Email</span>
                                    <span className="t4-v">{v.email}</span>
                                </a>
                            ) : null}

                            {nonEmpty(v.phone) ? (
                                <a className="t4-contact-row" href={`tel:${v.phone}`}>
                                    <span className="t4-k">Phone</span>
                                    <span className="t4-v">{v.phone}</span>
                                </a>
                            ) : null}
                        </div>

                        {socials.length > 0 ? (
                            <div className="t4-socials" aria-label="Social links">
                                {socials.map((s) => (
                                    <a key={s.key} className="t4-social" href={s.url} target="_blank" rel="noreferrer">
                                        {s.label}
                                    </a>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </section>
            ) : null}
        </div>
    );
}
