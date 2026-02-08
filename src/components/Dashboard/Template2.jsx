import React, { useMemo } from "react";
import "../../styling/dashboard/templates/template2.css";

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const asArray = (v) => (Array.isArray(v) ? v : []);

function Stars({ rating = 0 }) {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    return (
        <div className="t2-stars" aria-label={`Rating ${r} out of 5`}>
            {Array(5)
                .fill(null)
                .map((_, i) => (
                    <span key={i} className={`t2-star ${i < r ? "on" : "off"}`}>
                        ★
                    </span>
                ))}
        </div>
    );
}

export default function Template2({ vm }) {
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

    const hasHeroCtas = !!(v.hasExchangeContact || nonEmpty(v.email) || nonEmpty(v.phone));

    const socials = useMemo(() => {
        return Object.entries(v.socials || {})
            .filter(([, url]) => nonEmpty(url))
            .map(([key, url]) => ({
                key,
                url,
                label: key.replace("_url", "").toUpperCase(),
            }));
    }, [v.socials]);

    return (
        <div className="kc-tpl kc-tpl-2">
            {/* HERO */}
            {v.showMainSection && (
                <section className="t2-hero">
                    <div className="t2-hero-bg" aria-hidden="true">
                        {nonEmpty(cover) ? <img src={cover} alt="" className="t2-hero-bgimg" /> : null}
                        <div className="t2-hero-overlay" />
                    </div>

                    <div className="t2-hero-card">
                        <div className="t2-hero-top">
                            {nonEmpty(avatar) ? (
                                <img src={avatar} alt="Avatar" className="t2-avatar" />
                            ) : (
                                <div className="t2-avatar t2-avatar--ph" aria-hidden="true" />
                            )}

                            <div className="t2-hero-text">
                                <h1 className="t2-h1">{v.mainHeading || "Your Main Heading"}</h1>
                                {nonEmpty(v.subHeading) ? <p className="t2-sub">{v.subHeading}</p> : null}
                            </div>
                        </div>

                        {hasHeroCtas ? (
                            <div className="t2-cta-row">
                                <button type="button" className="t2-btn t2-btn-primary" onClick={v.onSaveMyNumber}>
                                    Save My Number
                                </button>
                                <button type="button" className="t2-btn t2-btn-ghost" onClick={v.onOpenExchangeContact}>
                                    Exchange Contact
                                </button>
                            </div>
                        ) : null}

                        {(nonEmpty(v.fullName) || nonEmpty(v.jobTitle)) && (
                            <div className="t2-mini">
                                {nonEmpty(v.fullName) ? <div className="t2-name">{v.fullName}</div> : null}
                                {nonEmpty(v.jobTitle) ? <div className="t2-role">{v.jobTitle}</div> : null}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ABOUT */}
            {v.showAboutMeSection && (nonEmpty(v.bio) || nonEmpty(v.fullName) || nonEmpty(v.jobTitle)) ? (
                <section className="t2-section">
                    <div className="t2-section-head">
                        <div className="t2-kicker">ABOUT</div>
                        <div className="t2-line" />
                    </div>

                    <div className="t2-glass t2-about">
                        {nonEmpty(v.bio) ? <p className="t2-bio">{v.bio}</p> : null}
                    </div>
                </section>
            ) : null}

            {/* WORK */}
            {v.showWorkSection && works.length > 0 ? (
                <section className="t2-section">
                    <div className="t2-section-head">
                        <div className="t2-kicker">WORK</div>
                        <div className="t2-line" />
                    </div>

                    <div className="t2-work-scroll" role="region" aria-label="Work gallery">
                        {works.slice(0, 14).map((url, i) => (
                            <div key={i} className="t2-work-tile">
                                <img src={url} alt={`Work ${i + 1}`} className="t2-work-img" />
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* SERVICES */}
            {v.showServicesSection && services.length > 0 ? (
                <section className="t2-section">
                    <div className="t2-section-head">
                        <div className="t2-kicker">SERVICES</div>
                        <div className="t2-line" />
                    </div>

                    <div className="t2-services">
                        {services.slice(0, 12).map((s, i) => (
                            <div key={i} className="t2-service">
                                <div className="t2-service-name">{s?.name || "Service"}</div>
                                {nonEmpty(s?.price) ? <div className="t2-service-price">{s.price}</div> : null}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* REVIEWS */}
            {v.showReviewsSection && reviews.length > 0 ? (
                <section className="t2-section">
                    <div className="t2-section-head">
                        <div className="t2-kicker">REVIEWS</div>
                        <div className="t2-line" />
                    </div>

                    <div className="t2-reviews">
                        {reviews.slice(0, 10).map((r, i) => (
                            <div key={i} className="t2-review t2-glass">
                                <Stars rating={r?.rating} />
                                {nonEmpty(r?.text) ? <div className="t2-review-text">“{r.text}”</div> : null}
                                {nonEmpty(r?.name) ? <div className="t2-review-name">{r.name}</div> : null}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {/* CONTACT */}
            {v.showContactSection && (nonEmpty(v.email) || nonEmpty(v.phone) || socials.length > 0) ? (
                <section className="t2-section t2-section-last">
                    <div className="t2-section-head">
                        <div className="t2-kicker">CONTACT</div>
                        <div className="t2-line" />
                    </div>

                    <div className="t2-contact t2-glass">
                        <div className="t2-contact-actions">
                            {nonEmpty(v.email) ? (
                                <a className="t2-pill" href={`mailto:${v.email}`}>
                                    <span className="t2-pill-k">Email</span>
                                    <span className="t2-pill-v">{v.email}</span>
                                </a>
                            ) : null}

                            {nonEmpty(v.phone) ? (
                                <a className="t2-pill" href={`tel:${v.phone}`}>
                                    <span className="t2-pill-k">Phone</span>
                                    <span className="t2-pill-v">{v.phone}</span>
                                </a>
                            ) : null}
                        </div>

                        {socials.length > 0 ? (
                            <div className="t2-socials" aria-label="Social links">
                                {socials.map((s) => (
                                    <a key={s.key} className="t2-social" href={s.url} target="_blank" rel="noreferrer">
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
