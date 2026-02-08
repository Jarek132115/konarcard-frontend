import React, { useMemo } from "react";
import "../../styling/dashboard/templates/template3.css";

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const asArray = (v) => (Array.isArray(v) ? v : []);

function Stars({ rating = 0 }) {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    return (
        <div className="t3-stars" aria-label={`Rating ${r} out of 5`}>
            {Array(5)
                .fill(null)
                .map((_, i) => (
                    <span key={i} className={`t3-star ${i < r ? "on" : "off"}`}>
                        ★
                    </span>
                ))}
        </div>
    );
}

export default function Template3({ vm }) {
    const v = vm || {};

    const cover = v.cover || "";
    const avatar = v.avatar || "";

    const works = useMemo(() => {
        return asArray(v.works)
            .map((x) => x?.preview || x?.url || x)
            .filter(Boolean);
    }, [v.works]);

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
        <div className="kc-tpl kc-tpl-3">
            {/* HERO */}
            {v.showMainSection && (
                <section className="t3-hero">
                    <div className="t3-hero-inner">
                        <div className="t3-left">
                            <div className="t3-brand">
                                {nonEmpty(avatar) ? (
                                    <img className="t3-avatar" src={avatar} alt="Avatar" />
                                ) : (
                                    <div className="t3-avatar t3-avatar--ph" aria-hidden="true" />
                                )}

                                <div className="t3-brandtext">
                                    <h1 className="t3-h1">{v.mainHeading || "Your Main Heading"}</h1>
                                    {nonEmpty(v.subHeading) ? <p className="t3-sub">{v.subHeading}</p> : null}
                                </div>
                            </div>

                            {hasHeroCtas ? (
                                <div className="t3-cta">
                                    <button type="button" className="t3-btn t3-btn-primary" onClick={v.onSaveMyNumber}>
                                        Save My Number
                                    </button>
                                    <button type="button" className="t3-btn t3-btn-ghost" onClick={v.onOpenExchangeContact}>
                                        Exchange Contact
                                    </button>
                                </div>
                            ) : null}

                            {(nonEmpty(v.fullName) || nonEmpty(v.jobTitle)) && (
                                <div className="t3-meta">
                                    {nonEmpty(v.fullName) ? <div className="t3-name">{v.fullName}</div> : null}
                                    {nonEmpty(v.jobTitle) ? <div className="t3-role">{v.jobTitle}</div> : null}
                                </div>
                            )}
                        </div>

                        <div className="t3-right" aria-hidden={!nonEmpty(cover)}>
                            {nonEmpty(cover) ? (
                                <div className="t3-cover">
                                    <img src={cover} alt="Cover" className="t3-cover-img" />
                                </div>
                            ) : (
                                <div className="t3-cover t3-cover--ph" aria-hidden="true" />
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* ABOUT */}
            {v.showAboutMeSection && (nonEmpty(v.bio) || nonEmpty(v.fullName) || nonEmpty(v.jobTitle)) ? (
                <section className="t3-section">
                    <div className="t3-head">
                        <h2 className="t3-h2">About</h2>
                        <div className="t3-rule" />
                    </div>

                    <div className="t3-card t3-about">
                        {nonEmpty(v.bio) ? <p className="t3-bio">{v.bio}</p> : null}
                    </div>
                </section>
            ) : null}

            {/* WORK */}
            {v.showWorkSection && works.length > 0 ? (
                <section className="t3-section">
                    <div className="t3-head">
                        <h2 className="t3-h2">Work</h2>
                        <div className="t3-rule" />
                    </div>

                    <div className="t3-work">
                        {works.slice(0, 12).map((url, i) => (
                            <div key={i} className="t3-work-tile">
                                <img src={url} alt={`Work ${i + 1}`} className="t3-work-img" />
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* SERVICES */}
            {v.showServicesSection && services.length > 0 ? (
                <section className="t3-section">
                    <div className="t3-head">
                        <h2 className="t3-h2">Services</h2>
                        <div className="t3-rule" />
                    </div>

                    <div className="t3-services">
                        {services.slice(0, 14).map((s, i) => (
                            <div key={i} className="t3-service">
                                <div className="t3-service-name">{s?.name || "Service"}</div>
                                {nonEmpty(s?.price) ? <div className="t3-service-price">{s.price}</div> : null}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* REVIEWS */}
            {v.showReviewsSection && reviews.length > 0 ? (
                <section className="t3-section">
                    <div className="t3-head">
                        <h2 className="t3-h2">Reviews</h2>
                        <div className="t3-rule" />
                    </div>

                    <div className="t3-reviews">
                        {reviews.slice(0, 10).map((r, i) => (
                            <div key={i} className="t3-card t3-review">
                                <Stars rating={r?.rating} />
                                {nonEmpty(r?.text) ? <p className="t3-review-text">“{r.text}”</p> : null}
                                {nonEmpty(r?.name) ? <div className="t3-review-name">{r.name}</div> : null}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* CONTACT */}
            {v.showContactSection && (nonEmpty(v.email) || nonEmpty(v.phone) || socials.length > 0) ? (
                <section className="t3-section t3-section-last">
                    <div className="t3-head">
                        <h2 className="t3-h2">Contact</h2>
                        <div className="t3-rule" />
                    </div>

                    <div className="t3-card t3-contact">
                        <div className="t3-contact-grid">
                            {nonEmpty(v.email) ? (
                                <a className="t3-contact-row" href={`mailto:${v.email}`}>
                                    <span className="t3-k">Email</span>
                                    <span className="t3-v">{v.email}</span>
                                </a>
                            ) : null}

                            {nonEmpty(v.phone) ? (
                                <a className="t3-contact-row" href={`tel:${v.phone}`}>
                                    <span className="t3-k">Phone</span>
                                    <span className="t3-v">{v.phone}</span>
                                </a>
                            ) : null}
                        </div>

                        {socials.length > 0 ? (
                            <div className="t3-socials" aria-label="Social links">
                                {socials.map((s) => (
                                    <a key={s.key} className="t3-social" href={s.url} target="_blank" rel="noreferrer">
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
