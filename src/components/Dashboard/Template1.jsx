import React from "react";
import "../../styling/dashboard/templates/template1.css";

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const asArray = (v) => (Array.isArray(v) ? v : []);

function Stars({ rating = 0 }) {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));

    return (
        <div className="t1-stars" aria-label={`Rating ${r} out of 5`}>
            {Array(5)
                .fill(null)
                .map((_, i) => (
                    <span key={i} className={`t1-star ${i < r ? "" : "t1-star--empty"}`}>
                        ★
                    </span>
                ))}
        </div>
    );
}

function formatSocialLabel(key) {
    const map = {
        facebook_url: "Facebook",
        instagram_url: "Instagram",
        linkedin_url: "LinkedIn",
        x_url: "X",
        tiktok_url: "TikTok",
    };
    return map[key] || key.replace("_url", "");
}

export default function Template1(props) {
    const v = props?.vm || props?.data || {};

    const cover = v.cover || "";
    const logo = v.logo || v.avatar || "";

    const businessName = v.businessName || v.mainHeading || "Your Business Name";
    const tradeTitle = v.tradeTitle || v.subHeading || "";
    const location = v.location || "";

    const aboutName = v.fullName || "";
    const aboutTrade = v.jobTitle || "";
    const aboutBio = v.bio || "";

    const works = asArray(v.works)
        .map((x) => x?.preview || x?.url || x)
        .filter(Boolean);

    const services = asArray(v.services).filter((s) => s?.name || s?.description || s?.price);
    const reviews = asArray(v.reviews).filter((r) => r?.name || r?.text);

    const socialEntries = Object.entries(v.socials || {}).filter(([, url]) => nonEmpty(url));

    const hasHeroCtas = !!(v.hasExchangeContact || nonEmpty(v.email) || nonEmpty(v.phone));
    const hasAbout = nonEmpty(aboutName) || nonEmpty(aboutTrade) || nonEmpty(aboutBio);
    const hasContact = nonEmpty(v.email) || nonEmpty(v.phone) || socialEntries.length > 0;

    return (
        <div className={`kc-tpl kc-tpl-1 ${v.themeMode === "dark" ? "t1-theme-dark" : "t1-theme-light"}`}>
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
                            <div className="t1-logoWrap">
                                {nonEmpty(logo) ? (
                                    <img src={logo} alt="Logo" className="t1-logo" />
                                ) : (
                                    <div className="t1-logo t1-logo--placeholder" aria-hidden="true" />
                                )}
                            </div>

                            <div className="t1-hero-copy">
                                <h1 className="t1-h1">{businessName}</h1>

                                {nonEmpty(tradeTitle) ? (
                                    <p className="t1-sub">{tradeTitle}</p>
                                ) : null}

                                {nonEmpty(location) ? (
                                    <p className="t1-location">{location}</p>
                                ) : null}
                            </div>

                            {hasHeroCtas ? (
                                <div className="t1-cta-row">
                                    <button
                                        type="button"
                                        className="t1-btn t1-btn-primary"
                                        onClick={v.onSaveMyNumber}
                                    >
                                        Save My Number
                                    </button>

                                    <button
                                        type="button"
                                        className="t1-btn t1-btn-ghost"
                                        onClick={v.onOpenExchangeContact}
                                    >
                                        Exchange Contact
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>
            )}

            {v.showAboutMeSection && hasAbout ? (
                <section className="t1-section">
                    <div className="t1-section-head">
                        <h2 className="t1-h2">About Me</h2>
                    </div>

                    <div className="t1-about-card">
                        {nonEmpty(aboutName) ? <div className="t1-name">{aboutName}</div> : null}
                        {nonEmpty(aboutTrade) ? <div className="t1-role">{aboutTrade}</div> : null}
                        {nonEmpty(aboutBio) ? <p className="t1-bio">{aboutBio}</p> : null}
                    </div>
                </section>
            ) : null}

            {v.showWorkSection && works.length > 0 ? (
                <section className="t1-section">
                    <div className="t1-section-head">
                        <h2 className="t1-h2">My Work</h2>
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

            {v.showServicesSection && services.length > 0 ? (
                <section className="t1-section">
                    <div className="t1-section-head">
                        <h2 className="t1-h2">My Services</h2>
                    </div>

                    <div className="t1-services">
                        {services.slice(0, 12).map((s, i) => (
                            <div key={i} className="t1-service">
                                <div className="t1-service-name">{s?.name}</div>
                                {nonEmpty(s?.description || s?.price) ? (
                                    <div className="t1-service-sub">{s.description || s.price}</div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {v.showReviewsSection && reviews.length > 0 ? (
                <section className="t1-section">
                    <div className="t1-section-head">
                        <h2 className="t1-h2">My Reviews</h2>
                    </div>

                    <div className="t1-reviews">
                        {reviews.slice(0, 12).map((r, i) => (
                            <div key={i} className="t1-review">
                                <Stars rating={r?.rating} />
                                {nonEmpty(r?.text) ? <p className="t1-review-text">“{r.text}”</p> : null}
                                {nonEmpty(r?.name) ? <div className="t1-review-name">{r.name}</div> : null}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            {v.showContactSection && hasContact ? (
                <section className="t1-section t1-section-last">
                    <div className="t1-section-head">
                        <h2 className="t1-h2">Get In Touch</h2>
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

                        {socialEntries.length > 0 ? (
                            <div className="t1-socials">
                                {socialEntries.map(([key, url]) => (
                                    <a
                                        key={key}
                                        className="t1-social"
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {formatSocialLabel(key)}
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