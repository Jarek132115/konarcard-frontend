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

function SaveIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t1-icon" aria-hidden="true">
            <path
                fill="currentColor"
                d="M17 3H7a2 2 0 0 0-2 2v14l7-3 7 3V5a2 2 0 0 0-2-2Zm0 12.8-5-2.1-5 2.1V5h10v10.8Z"
            />
        </svg>
    );
}

function ExchangeIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t1-icon" aria-hidden="true">
            <path
                fill="currentColor"
                d="M7 7h8.2L13 4.8 14.4 3 20 8.6 14.4 14 13 12.2 15.2 10H7V7Zm10 10H8.8l2.2 2.2L9.6 21 4 15.4 9.6 10l1.4 1.8L8.8 14H17v3Z"
            />
        </svg>
    );
}

function EmailIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t1-contactIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.4l8 5.3 8-5.3V7H4Zm16 10V9.8l-7.4 4.9a1 1 0 0 1-1.2 0L4 9.8V17h16Z"
            />
        </svg>
    );
}

function PhoneIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t1-contactIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.3 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.9c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.3 1l-2.1 2.3Z"
            />
        </svg>
    );
}

function ContactExchangeIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t1-contactIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M7 7h8.2L13 4.8 14.4 3 20 8.6 14.4 14 13 12.2 15.2 10H7V7Zm10 10H8.8l2.2 2.2L9.6 21 4 15.4 9.6 10l1.4 1.8L8.8 14H17v3Z"
            />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t1-socialIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.7-1.6h1.5V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H8v3h2.5v8h3Z"
            />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t1-socialIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M7.8 3h8.4A4.8 4.8 0 0 1 21 7.8v8.4a4.8 4.8 0 0 1-4.8 4.8H7.8A4.8 4.8 0 0 1 3 16.2V7.8A4.8 4.8 0 0 1 7.8 3Zm0 1.8A3 3 0 0 0 4.8 7.8v8.4a3 3 0 0 0 3 3h8.4a3 3 0 0 0 3-3V7.8a3 3 0 0 0-3-3H7.8Zm8.9 1.3a1.1 1.1 0 1 1 0 2.2a1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2A3.2 3.2 0 0 0 12 8.8Z"
            />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t1-socialIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M6.5 8.2a1.7 1.7 0 1 1 0-3.4a1.7 1.7 0 0 1 0 3.4ZM5 9.7h3V19H5V9.7Zm4.9 0h2.9V11h.1c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.7 2 3.7 4.6V19h-3v-4.3c0-1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3V19h-3V9.7Z"
            />
        </svg>
    );
}

function TikTokIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t1-socialIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M14 3c.3 2.2 1.6 3.8 3.7 4v2.3c-1.3 0-2.6-.4-3.7-1.1v5.1c0 3-2.4 5.3-5.3 5.3s-5.4-2.3-5.4-5.3 2.4-5.3 5.4-5.3c.3 0 .5 0 .8.1v2.4a2.9 2.9 0 0 0-.8-.1c-1.7 0-3 1.2-3 2.9 0 1.6 1.3 2.9 3 2.9 1.8 0 3-1.3 3-3.2V3H14Z"
            />
        </svg>
    );
}

function XIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t1-socialIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M18.9 3H21l-4.6 5.2L22 21h-4.7l-3.7-4.8L9.4 21H7.3l4.9-5.6L2 3h4.8l3.4 4.4L18.9 3Zm-1.6 16h1.3L6 4.9H4.7L17.3 19Z"
            />
        </svg>
    );
}

function getSocialMeta(key) {
    const map = {
        facebook_url: { label: "Facebook", icon: <FacebookIcon /> },
        instagram_url: { label: "Instagram", icon: <InstagramIcon /> },
        linkedin_url: { label: "LinkedIn", icon: <LinkedInIcon /> },
        x_url: { label: "X", icon: <XIcon /> },
        tiktok_url: { label: "TikTok", icon: <TikTokIcon /> },
    };

    return map[key] || { label: key.replace("_url", ""), icon: null };
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
    const hasAbout = nonEmpty(aboutName) || nonEmpty(aboutTrade) || nonEmpty(aboutBio) || nonEmpty(logo);
    const hasContact = nonEmpty(v.email) || nonEmpty(v.phone) || v.hasExchangeContact || socialEntries.length > 0;

    return (
        <div className={`kc-tpl kc-tpl-1 ${v.themeMode === "dark" ? "t1-theme-dark" : "t1-theme-light"}`}>
            <div className="t1-shell">
                {v.showMainSection && (
                    <section className="t1-hero">
                        <div className="t1-coverShell">
                            {nonEmpty(cover) ? (
                                <div className="t1-cover">
                                    <img src={cover} alt="Cover" className="t1-cover-img" />
                                </div>
                            ) : (
                                <div className="t1-cover t1-cover--placeholder" aria-hidden="true" />
                            )}

                            <div className="t1-logoWrap">
                                {nonEmpty(logo) ? (
                                    <img src={logo} alt="Logo" className="t1-logo" />
                                ) : (
                                    <div className="t1-logo t1-logo--placeholder" aria-hidden="true" />
                                )}
                            </div>
                        </div>

                        <div className="t1-heroCard">
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
                                        className="t1-btn t1-btn-ghost"
                                        onClick={v.onSaveMyNumber}
                                    >
                                        <SaveIcon />
                                        <span>Save My Number</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="t1-btn t1-btn-primary"
                                        onClick={v.onOpenExchangeContact}
                                    >
                                        <ExchangeIcon />
                                        <span>Exchange Contact</span>
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </section>
                )}

                {v.showAboutMeSection && hasAbout ? (
                    <section className="t1-section">
                        <div className="t1-section-head">
                            <h2 className="t1-h2">About Me</h2>
                        </div>

                        <div className="t1-aboutCard">
                            <div className="t1-aboutLeft">
                                <div className="t1-aboutAvatarWrap">
                                    {nonEmpty(logo) ? (
                                        <img src={logo} alt="" className="t1-aboutAvatar" />
                                    ) : (
                                        <div className="t1-aboutAvatar t1-aboutAvatar--placeholder" />
                                    )}
                                </div>

                                <div className="t1-aboutMeta">
                                    {nonEmpty(aboutName) ? <div className="t1-name">{aboutName}</div> : null}
                                    {nonEmpty(aboutTrade) ? <div className="t1-role">{aboutTrade}</div> : null}
                                </div>
                            </div>

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
                                    {nonEmpty(r?.text) ? <p className="t1-review-text">“{r.text}”</p> : null}
                                    {nonEmpty(r?.name) ? <div className="t1-review-name">{r.name}</div> : null}
                                    <Stars rating={r?.rating} />
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
                                    <span className="t1-contactIcon"><EmailIcon /></span>
                                    <span className="t1-contactCopy">
                                        <span className="t1-contact-k">Email</span>
                                        <span className="t1-contact-v">{v.email}</span>
                                    </span>
                                </a>
                            ) : null}

                            {nonEmpty(v.phone) ? (
                                <a className="t1-contact-row" href={`tel:${v.phone}`}>
                                    <span className="t1-contactIcon"><PhoneIcon /></span>
                                    <span className="t1-contactCopy">
                                        <span className="t1-contact-k">Phone Number</span>
                                        <span className="t1-contact-v">{v.phone}</span>
                                    </span>
                                </a>
                            ) : null}

                            {v.hasExchangeContact ? (
                                <button className="t1-contact-row t1-contact-row--button" type="button" onClick={v.onOpenExchangeContact}>
                                    <span className="t1-contactIcon"><ContactExchangeIcon /></span>
                                    <span className="t1-contactCopy">
                                        <span className="t1-contact-k">Exchange Contacts</span>
                                        <span className="t1-contact-v">Lets exchange contact with each other</span>
                                    </span>
                                </button>
                            ) : null}

                            {socialEntries.length > 0 ? (
                                <div className="t1-socials">
                                    {socialEntries.map(([key, url]) => {
                                        const meta = getSocialMeta(key);
                                        return (
                                            <a
                                                key={key}
                                                className="t1-social"
                                                href={url}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={meta.label}
                                                title={meta.label}
                                            >
                                                {meta.icon}
                                            </a>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    </section>
                ) : null}
            </div>
        </div>
    );
}