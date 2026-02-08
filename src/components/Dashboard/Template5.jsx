import React, { useMemo } from "react";
import "../../styling/dashboard/templates/template5.css";

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const asArray = (v) => (Array.isArray(v) ? v : []);

function Stars({ rating = 0 }) {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    return (
        <div className="t5-stars" aria-label={`Rating ${r} out of 5`}>
            {Array(5)
                .fill(null)
                .map((_, i) => (
                    <span key={i} className={`t5-star ${i < r ? "on" : "off"}`}>
                        ★
                    </span>
                ))}
        </div>
    );
}

export default function Template5({ vm }) {
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
        <div className="kc-tpl kc-tpl-5">
            {/* HERO */}
            {v.showMainSection && (
                <section className="t5-hero">
                    <div className="t5-hero-card">
                        <div className="t5-hero-top">
                            <div className="t5-brand">
                                {nonEmpty(avatar) ? (
                                    <img className="t5-avatar" src={avatar} alt="Avatar" />
                                ) : (
                                    <div className="t5-avatar t5-avatar--ph" aria-hidden="true" />
                                )}

                                <div className="t5-brand-text">
                                    <h1 className="t5-h1">{v.mainHeading || "Your Main Heading"}</h1>
                                    {nonEmpty(v.subHeading) ? <p className="t5-sub">{v.subHeading}</p> : null}
                                </div>
                            </div>

                            {(nonEmpty(v.fullName) || nonEmpty(v.jobTitle)) && (
                                <div className="t5-meta">
                                    {nonEmpty(v.fullName) ? <div className="t5-name">{v.fullName}</div> : null}
                                    {nonEmpty(v.jobTitle) ? <div className="t5-role">{v.jobTitle}</div> : null}
                                </div>
                            )}
                        </div>

                        {nonEmpty(cover) ? (
                            <div className="t5-cover">
                                <img className="t5-cover-img" src={cover} alt="Cover" />
                            </div>
                        ) : (
                            <div className="t5-cover t5-cover--ph" aria-hidden="true" />
                        )}

                        {hasHeroCtas ? (
                            <div className="t5-cta">
                                <button type="button" className="t5-btn t5-btn-primary" onClick={v.onSaveMyNumber}>
                                    Save My Number
                                </button>
                                <button type="button" className="t5-btn t5-btn-ghost" onClick={v.onOpenExchangeContact}>
                                    Exchange Contact
                                </button>
                            </div>
                        ) : null}
                    </div>
                </section>
            )}

            {/* ABOUT */}
            {v.showAboutMeSection && (nonEmpty(v.bio) || nonEmpty(v.fullName) || nonEmpty(v.jobTitle)) ? (
                <section className="t5-section">
                    <div className="t5-head">
                        <h2 className="t5-h2">About</h2>
                        <div className="t5-line" />
                    </div>

                    <div className="t5-card t5-about">
                        {nonEmpty(v.bio) ? <p className="t5-bio">{v.bio}</p> : null}
                    </div>
                </section>
            ) : null}

            {/* WORK */}
            {v.showWorkSection && works.length > 0 ? (
                <section className="t5-section">
                    <div className="t5-head">
                        <h2 className="t5-h2">Portfolio</h2>
                        <div className="t5-line" />
                    </div>

                    <div className="t5-work">
                        {works.slice(0, 12).map((url, i) => (
                            <div key={i} className="t5-work-tile">
                                <img src={url} alt={`Work ${i + 1}`} className="t5-work-img" />
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* SERVICES */}
            {v.showServicesSection && services.length > 0 ? (
                <section className="t5-section">
                    <div className="t5-head">
                        <h2 className="t5-h2">Services</h2>
                        <div className="t5-line" />
                    </div>

                    <div className="t5-services">
                        {services.slice(0, 14).map((s, i) => (
                            <div key={i} className="t5-service">
                                <div className="t5-service-left">
                                    <div className="t5-service-name">{s?.name || "Service"}</div>
                                    {nonEmpty(s?.price) ? <div className="t5-service-price">{s.price}</div> : null}
                                </div>
                                <div className="t5-chip" aria-hidden="true">
                                    •••
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* REVIEWS */}
            {v.showReviewsSection && reviews.length > 0 ? (
                <section className="t5-section">
                    <div className="t5-head">
                        <h2 className="t5-h2">Reviews</h2>
                        <div className="t5-line" />
                    </div>

                    <div className="t5-reviews">
                        {reviews.slice(0, 10).map((r, i) => (
                            <div key={i} className="t5-card t5-review">
                                <Stars rating={r?.rating} />
                                {nonEmpty(r?.text) ? <p className="t5-review-text">“{r.text}”</p> : null}
                                {nonEmpty(r?.name) ? <div className="t5-review-name">{r.name}</div> : null}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* CONTACT */}
            {v.showContactSection && (nonEmpty(v.email) || nonEmpty(v.phone) || socials.length > 0) ? (
                <section className="t5-section t5-section-last">
                    <div className="t5-head">
                        <h2 className="t5-h2">Contact</h2>
                        <div className="t5-line" />
                    </div>

                    <div className="t5-card t5-contact">
                        <div className="t5-contact-grid">
                            {nonEmpty(v.email) ? (
                                <a className="t5-contact-row" href={`mailto:${v.email}`}>
                                    <span className="t5-k">Email</span>
                                    <span className="t5-v">{v.email}</span>
                                </a>
                            ) : null}

                            {nonEmpty(v.phone) ? (
                                <a className="t5-contact-row" href={`tel:${v.phone}`}>
                                    <span className="t5-k">Phone</span>
                                    <span className="t5-v">{v.phone}</span>
                                </a>
                            ) : null}
                        </div>

                        {socials.length > 0 ? (
                            <div className="t5-socials" aria-label="Social links">
                                {socials.map((s) => (
                                    <a key={s.key} className="t5-social" href={s.url} target="_blank" rel="noreferrer">
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
