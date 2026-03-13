import React, { useMemo } from "react";
import "../../styling/dashboard/templates/template1.css";

import EmailIconSrc from "../../assets/icons/Template1Icon-Email.svg";
import ExchangeContactIconSrc from "../../assets/icons/Template1Icon-Exchange.svg";
import FacebookIconSrc from "../../assets/icons/Template1Icon-Facebook.svg";
import InstagramIconSrc from "../../assets/icons/Template1Icon-Instagram.svg";
import LinkedInIconSrc from "../../assets/icons/Template1Icon-LinkedIn.svg";
import PhoneIconSrc from "../../assets/icons/Template1Icon-Phone.svg";
import TikTokIconSrc from "../../assets/icons/Template1Icon-TikTok.svg";
import XIconSrc from "../../assets/icons/Template1Icon-X.svg";

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
        <svg viewBox="0 0 24 24" className="t1-inlineIcon" aria-hidden="true">
            <path
                fill="currentColor"
                d="M17 3H7a2 2 0 0 0-2 2v14l7-3 7 3V5a2 2 0 0 0-2-2Zm0 12.8-5-2.1-5 2.1V5h10v10.8Z"
            />
        </svg>
    );
}

function ExchangeIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t1-inlineIcon" aria-hidden="true">
            <path
                fill="currentColor"
                d="M7 7h8.2L13 4.8 14.4 3 20 8.6 14.4 14 13 12.2 15.2 10H7V7Zm10 10H8.8l2.2 2.2L9.6 21 4 15.4 9.6 10l1.4 1.8L8.8 14H17v3Z"
            />
        </svg>
    );
}

function TemplateIcon({ src, alt = "", className = "t1-assetIcon" }) {
    return <img src={src} alt={alt} className={className} />;
}

function SectionHead({ kicker, title }) {
    return (
        <div className="t1-section-head">
            <div className="t1-section-kicker">{kicker}</div>
            <h2 className="t1-h2">{title}</h2>
        </div>
    );
}

function getSocialMeta(key) {
    const map = {
        facebook_url: {
            label: "Facebook",
            icon: <TemplateIcon src={FacebookIconSrc} alt="" className="t1-assetIcon t1-assetIcon--social" />,
        },
        instagram_url: {
            label: "Instagram",
            icon: <TemplateIcon src={InstagramIconSrc} alt="" className="t1-assetIcon t1-assetIcon--social" />,
        },
        linkedin_url: {
            label: "LinkedIn",
            icon: <TemplateIcon src={LinkedInIconSrc} alt="" className="t1-assetIcon t1-assetIcon--social" />,
        },
        x_url: {
            label: "X",
            icon: <TemplateIcon src={XIconSrc} alt="" className="t1-assetIcon t1-assetIcon--social" />,
        },
        twitter_url: {
            label: "X",
            icon: <TemplateIcon src={XIconSrc} alt="" className="t1-assetIcon t1-assetIcon--social" />,
        },
        tiktok_url: {
            label: "TikTok",
            icon: <TemplateIcon src={TikTokIconSrc} alt="" className="t1-assetIcon t1-assetIcon--social" />,
        },
    };

    return map[key] || { label: key.replace("_url", ""), icon: null };
}

export default function Template1(props) {
    const v = props?.vm || props?.data || {};
    const themeMode = (v.themeMode || "light").toLowerCase();

    const cover = v.cover || "";
    const logo = v.logo || v.avatar || "";

    const businessName = v.businessName || v.mainHeading || "Your Business Name";
    const tradeTitle = v.tradeTitle || v.subHeading || "";
    const location = v.location || "";

    const aboutName = v.fullName || "";
    const aboutTrade = v.jobTitle || "";
    const aboutBio = v.bio || "";

    const works = useMemo(() => {
        return asArray(v.works)
            .map((x) => x?.preview || x?.url || x)
            .filter(Boolean);
    }, [v.works]);

    const services = useMemo(() => {
        return asArray(v.services).filter((s) => s?.name || s?.description || s?.price);
    }, [v.services]);

    const reviews = useMemo(() => {
        return asArray(v.reviews).filter((r) => r?.name || r?.text || Number(r?.rating) > 0);
    }, [v.reviews]);

    const socialEntries = useMemo(() => {
        return Object.entries(v.socials || {}).filter(([, url]) => nonEmpty(url));
    }, [v.socials]);

    const showSaveButton = !!(nonEmpty(v.email) || nonEmpty(v.phone));
    const showExchangeButton = !!v.hasExchangeContact;

    const hasAbout = nonEmpty(aboutName) || nonEmpty(aboutTrade) || nonEmpty(aboutBio) || nonEmpty(logo);
    const hasContact = nonEmpty(v.email) || nonEmpty(v.phone) || v.hasExchangeContact || socialEntries.length > 0;

    return (
        <div className={`kc-tpl kc-tpl-1 ${themeMode === "dark" ? "t1-theme-dark" : "t1-theme-light"}`}>
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

                                {nonEmpty(tradeTitle) ? <p className="t1-sub">{tradeTitle}</p> : null}
                                {nonEmpty(location) ? <p className="t1-location">{location}</p> : null}
                            </div>

                            {showSaveButton || showExchangeButton ? (
                                <div className={`t1-cta-row ${showSaveButton && showExchangeButton ? "is-two" : "is-one"}`}>
                                    {showSaveButton ? (
                                        <button
                                            type="button"
                                            className="t1-btn t1-btn-ghost"
                                            onClick={v.onSaveMyNumber}
                                        >
                                            <SaveIcon />
                                            <span>Save My Number</span>
                                        </button>
                                    ) : null}

                                    {showExchangeButton ? (
                                        <button
                                            type="button"
                                            className="t1-btn t1-btn-primary"
                                            onClick={v.onOpenExchangeContact}
                                        >
                                            <ExchangeIcon />
                                            <span>Exchange Contact</span>
                                        </button>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    </section>
                )}

                {v.showAboutMeSection && hasAbout ? (
                    <section className="t1-section">
                        <SectionHead kicker="About" title="About Me" />

                        <div className="t1-aboutCard">
                            <div className="t1-aboutTop">
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
                        <SectionHead kicker="Recent Work" title="My Work" />

                        <div className="t1-work-grid">
                            {works.slice(0, 12).map((url, i) => {
                                const isLastOdd = works.length % 2 === 1 && i === works.length - 1;

                                return (
                                    <div
                                        key={i}
                                        className={`t1-work-tile ${isLastOdd ? "t1-work-tile--full" : ""}`}
                                    >
                                        <img src={url} alt={`Work ${i + 1}`} className="t1-work-img" />
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ) : null}

                {v.showServicesSection && services.length > 0 ? (
                    <section className="t1-section">
                        <SectionHead kicker="Services" title="What I Offer" />

                        <div className="t1-services">
                            {services.slice(0, 12).map((s, i) => (
                                <article key={i} className="t1-service">
                                    <div className="t1-serviceIndex">{String(i + 1).padStart(2, "0")}</div>

                                    <div className="t1-serviceCopy">
                                        <div className="t1-service-name">{s?.name || "Service"}</div>
                                        {nonEmpty(s?.description || s?.price) ? (
                                            <div className="t1-service-sub">{s.description || s.price}</div>
                                        ) : null}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                ) : null}

                {v.showReviewsSection && reviews.length > 0 ? (
                    <section className="t1-section">
                        <SectionHead kicker="Reviews" title="Client Feedback" />

                        <div className="t1-reviews">
                            {reviews.slice(0, 12).map((r, i) => (
                                <article key={i} className="t1-review">
                                    <Stars rating={r?.rating} />
                                    {nonEmpty(r?.text) ? <p className="t1-review-text">“{r.text}”</p> : null}
                                    {nonEmpty(r?.name) ? <div className="t1-review-name">{r.name}</div> : null}
                                </article>
                            ))}
                        </div>
                    </section>
                ) : null}

                {v.showContactSection && hasContact ? (
                    <section className="t1-section t1-section-last">
                        <SectionHead kicker="Contact" title="Get In Touch" />

                        <div className="t1-contact">
                            {nonEmpty(v.email) ? (
                                <a className="t1-contact-row" href={`mailto:${v.email}`}>
                                    <span className="t1-contactIcon">
                                        <TemplateIcon src={EmailIconSrc} alt="" className="t1-assetIcon t1-assetIcon--contact" />
                                    </span>
                                    <span className="t1-contactCopy">
                                        <span className="t1-contact-k">Email</span>
                                        <span className="t1-contact-v">{v.email}</span>
                                    </span>
                                </a>
                            ) : null}

                            {nonEmpty(v.phone) ? (
                                <a className="t1-contact-row" href={`tel:${v.phone}`}>
                                    <span className="t1-contactIcon">
                                        <TemplateIcon src={PhoneIconSrc} alt="" className="t1-assetIcon t1-assetIcon--contact" />
                                    </span>
                                    <span className="t1-contactCopy">
                                        <span className="t1-contact-k">Phone Number</span>
                                        <span className="t1-contact-v">{v.phone}</span>
                                    </span>
                                </a>
                            ) : null}

                            {v.hasExchangeContact ? (
                                <button
                                    className="t1-contact-row t1-contact-row--button"
                                    type="button"
                                    onClick={v.onOpenExchangeContact}
                                >
                                    <span className="t1-contactIcon">
                                        <TemplateIcon
                                            src={ExchangeContactIconSrc}
                                            alt=""
                                            className="t1-assetIcon t1-assetIcon--contact"
                                        />
                                    </span>
                                    <span className="t1-contactCopy">
                                        <span className="t1-contact-k">Exchange Contact</span>
                                        <span className="t1-contact-v">Share contact details with each other</span>
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