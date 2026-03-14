import React, { useMemo } from "react";
import "../../styling/dashboard/templates/template3.css";

import SaveMyNumberIcon from "../../assets/icons/SaveMyNumberIcon.svg";
import ExchangeContactIcon from "../../assets/icons/ExchangeContactIcon.svg";

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

function EmailIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t3-contactIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.4l8 5.3 8-5.3V7H4Zm16 10V9.8l-7.4 4.9a1 1 0 0 1-1.2 0L4 9.8V17h16Z"
            />
        </svg>
    );
}

function PhoneIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t3-contactIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.3 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.9c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.3 1l-2.1 2.3Z"
            />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t3-socialIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.7-1.6h1.5V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H8v3h2.5v8h3Z"
            />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t3-socialIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M7.8 3h8.4A4.8 4.8 0 0 1 21 7.8v8.4a4.8 4.8 0 0 1-4.8 4.8H7.8A4.8 4.8 0 0 1 3 16.2V7.8A4.8 4.8 0 0 1 7.8 3Zm0 1.8A3 3 0 0 0 4.8 7.8v8.4a3 3 0 0 0 3 3h8.4a3 3 0 0 0 3-3V7.8a3 3 0 0 0-3-3H7.8Zm8.9 1.3a1.1 1.1 0 1 1 0 2.2a1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2A3.2 3.2 0 0 0 12 8.8Z"
            />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t3-socialIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M6.5 8.2a1.7 1.7 0 1 1 0-3.4a1.7 1.7 0 0 1 0 3.4ZM5 9.7h3V19H5V9.7Zm4.9 0h2.9V11h.1c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.7 2 3.7 4.6V19h-3v-4.3c0-1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3V19h-3V9.7Z"
            />
        </svg>
    );
}

function TikTokIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t3-socialIconSvg" aria-hidden="true">
            <path
                fill="currentColor"
                d="M14 3c.3 2.2 1.6 3.8 3.7 4v2.3c-1.3 0-2.6-.4-3.7-1.1v5.1c0 3-2.4 5.3-5.3 5.3s-5.4-2.3-5.4-5.3 2.4-5.3 5.4-5.3c.3 0 .5 0 .8.1v2.4a2.9 2.9 0 0 0-.8-.1c-1.7 0-3 1.2-3 2.9 0 1.6 1.3 2.9 3 2.9 1.8 0 3-1.3 3-3.2V3H14Z"
            />
        </svg>
    );
}

function XIcon() {
    return (
        <svg viewBox="0 0 24 24" className="t3-socialIconSvg" aria-hidden="true">
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

function buildWorkRows(items) {
    const rows = [];
    let i = 0;
    let useSingle = true;

    while (i < items.length) {
        const take = useSingle ? 1 : 2;
        const rowItems = items.slice(i, i + take);
        rows.push({
            type: rowItems.length === 1 ? "single" : "double",
            items: rowItems,
        });
        i += take;
        useSingle = !useSingle;
    }

    return rows;
}

export default function Template3({ vm }) {
    const v = vm || {};
    const themeMode = (v.themeMode || "light").toLowerCase();

    const cover = v.cover || "";
    const avatar = v.avatar || v.logo || "";

    const works = useMemo(() => {
        return asArray(v.works)
            .map((x) => x?.preview || x?.url || x)
            .filter(Boolean);
    }, [v.works]);

    const workRows = useMemo(() => buildWorkRows(works.slice(0, 12)), [works]);

    const services = useMemo(() => {
        return asArray(v.services).filter((s) => s?.name || s?.description || s?.price);
    }, [v.services]);

    const reviews = useMemo(() => {
        return asArray(v.reviews).filter((r) => r?.name || r?.text || Number(r?.rating) > 0);
    }, [v.reviews]);

    const socials = useMemo(() => {
        return Object.entries(v.socials || {}).filter(([, url]) => nonEmpty(url));
    }, [v.socials]);

    const businessName = v.mainHeading || "Your Business Name";
    const tradeTitle = v.subHeading || "";
    const location = v.location || "";
    const personName = v.fullName || "";
    const personRole = v.jobTitle || "";
    const bio = v.bio || "";

    const hasHeroCtas = !!(v.hasExchangeContact || nonEmpty(v.email) || nonEmpty(v.phone));
    const hasAbout = nonEmpty(bio) || nonEmpty(personName) || nonEmpty(personRole) || nonEmpty(avatar);
    const hasContact = nonEmpty(v.email) || nonEmpty(v.phone) || v.hasExchangeContact || socials.length > 0;

    return (
        <div className={`kc-tpl kc-tpl-3 ${themeMode === "dark" ? "t3-theme-dark" : "t3-theme-light"}`}>
            <div className="t3-shell">
                {v.showMainSection && (
                    <section className="t3-hero">
                        <div className="t3-heroGrid">
                            <div className="t3-heroMedia">
                                {nonEmpty(cover) ? (
                                    <img src={cover} alt="Cover" className="t3-coverImg" />
                                ) : (
                                    <div className="t3-coverPlaceholder" aria-hidden="true" />
                                )}
                            </div>

                            <div className="t3-heroCopy">
                                <h1 className="t3-h1">{businessName}</h1>

                                {nonEmpty(tradeTitle) ? <p className="t3-sub">{tradeTitle}</p> : null}
                                {nonEmpty(location) ? <p className="t3-location">{location}</p> : null}

                                {hasHeroCtas ? (
                                    <div className="t3-cta">
                                        <button type="button" className="t3-btn t3-btn-primary" onClick={v.onSaveMyNumber}>
                                            <span className="t3-btnIcon">
                                                <img src={SaveMyNumberIcon} alt="" className="t3-btnIconAsset t3-btnIconAsset--primary" />
                                            </span>
                                            <span className="t3-btnLabel t3-btnLabel--primary">Save My Number</span>
                                        </button>

                                        <button type="button" className="t3-btn t3-btn-secondary t3-btn-exchange" onClick={v.onOpenExchangeContact}>
                                            <span className="t3-btnIcon">
                                                <img src={ExchangeContactIcon} alt="" className="t3-btnIconAsset t3-btnIconAsset--exchange" />
                                            </span>
                                            <span className="t3-btnLabel t3-btnLabel--exchange">Exchange Contact</span>
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </section>
                )}

                {v.showAboutMeSection && hasAbout ? (
                    <section className="t3-section">
                        <div className="t3-sectionHead">
                            <div className="t3-sectionKicker">About</div>
                            <h2 className="t3-sectionTitle">About Me</h2>
                        </div>

                        <div className="t3-aboutCard">
                            <div className="t3-aboutTop">
                                <div className="t3-aboutAvatarWrap">
                                    {nonEmpty(avatar) ? (
                                        <img className="t3-aboutAvatar" src={avatar} alt="" />
                                    ) : (
                                        <div className="t3-aboutAvatar t3-aboutAvatar--ph" aria-hidden="true" />
                                    )}
                                </div>

                                <div className="t3-aboutMeta">
                                    {nonEmpty(personName) ? <div className="t3-aboutName">{personName}</div> : null}
                                    {nonEmpty(personRole) ? <div className="t3-aboutRole">{personRole}</div> : null}
                                </div>
                            </div>

                            {nonEmpty(bio) ? <p className="t3-aboutBio">{bio}</p> : null}
                        </div>
                    </section>
                ) : null}

                {v.showWorkSection && works.length > 0 ? (
                    <section className="t3-section">
                        <div className="t3-sectionHead">
                            <div className="t3-sectionKicker">Recent Jobs</div>
                            <h2 className="t3-sectionTitle">My Work</h2>
                        </div>

                        <div className="t3-workRows">
                            {workRows.map((row, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className={`t3-workRow ${row.type === "double" ? "t3-workRow--double" : "t3-workRow--single"}`}
                                >
                                    {row.items.map((url, itemIndex) => (
                                        <div
                                            key={`${rowIndex}-${itemIndex}`}
                                            className={`t3-workTile ${row.items.length === 1 ? "is-full" : ""}`}
                                        >
                                            <img src={url} alt={`Work ${rowIndex + itemIndex + 1}`} className="t3-workImg" />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}

                {v.showServicesSection && services.length > 0 ? (
                    <section className="t3-section">
                        <div className="t3-sectionHead">
                            <div className="t3-sectionKicker">Services</div>
                            <h2 className="t3-sectionTitle">What I Offer</h2>
                        </div>

                        <div className="t3-servicesGrid">
                            {services.slice(0, 12).map((s, i) => (
                                <article key={i} className="t3-serviceCard">
                                    <div className="t3-serviceTopIcon">
                                        {String(i + 1).padStart(2, "0")}
                                    </div>

                                    <div className="t3-serviceCopy">
                                        <h3 className="t3-serviceName">{s?.name || "Service"}</h3>
                                        {nonEmpty(s?.description || s?.price) ? (
                                            <p className="t3-serviceBody">{s.description || s.price}</p>
                                        ) : null}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                ) : null}

                {v.showReviewsSection && reviews.length > 0 ? (
                    <section className="t3-section">
                        <div className="t3-sectionHead">
                            <div className="t3-sectionKicker">Reviews</div>
                            <h2 className="t3-sectionTitle">Client Feedback</h2>
                        </div>

                        <div className="t3-reviewsGrid">
                            {reviews.slice(0, 10).map((r, i) => (
                                <article key={i} className="t3-reviewCard">
                                    <Stars rating={r?.rating} />
                                    {nonEmpty(r?.text) ? <p className="t3-reviewText">“{r.text}”</p> : null}
                                    {nonEmpty(r?.name) ? <div className="t3-reviewName">{r.name}</div> : null}
                                </article>
                            ))}
                        </div>
                    </section>
                ) : null}

                {v.showContactSection && hasContact ? (
                    <section className="t3-section t3-section-last">
                        <div className="t3-sectionHead">
                            <div className="t3-sectionKicker">Contact</div>
                            <h2 className="t3-sectionTitle">Get In Touch</h2>
                        </div>

                        <div className="t3-contactWrap">
                            {(nonEmpty(v.email) || nonEmpty(v.phone) || v.hasExchangeContact) ? (
                                <div className="t3-contactGrid">
                                    {nonEmpty(v.email) ? (
                                        <a className="t3-contactCard" href={`mailto:${v.email}`}>
                                            <span className="t3-contactIcon"><EmailIcon /></span>
                                            <span className="t3-contactText">
                                                <span className="t3-contactLabel">Email</span>
                                                <span className="t3-contactValue">{v.email}</span>
                                            </span>
                                        </a>
                                    ) : null}

                                    {nonEmpty(v.phone) ? (
                                        <a className="t3-contactCard" href={`tel:${v.phone}`}>
                                            <span className="t3-contactIcon"><PhoneIcon /></span>
                                            <span className="t3-contactText">
                                                <span className="t3-contactLabel">Phone</span>
                                                <span className="t3-contactValue">{v.phone}</span>
                                            </span>
                                        </a>
                                    ) : null}

                                    {v.hasExchangeContact ? (
                                        <button type="button" className="t3-contactCard t3-contactCard--button" onClick={v.onOpenExchangeContact}>
                                            <span className="t3-contactIcon">
                                                <img src={ExchangeContactIcon} alt="" className="t3-contactIconAsset" />
                                            </span>
                                            <span className="t3-contactText">
                                                <span className="t3-contactLabel">Exchange Contact</span>
                                                <span className="t3-contactValue">Share contact details with each other</span>
                                            </span>
                                        </button>
                                    ) : null}
                                </div>
                            ) : null}

                            {socials.length > 0 ? (
                                <div className="t3-socials">
                                    {socials.map(([key, url]) => {
                                        const meta = getSocialMeta(key);
                                        return (
                                            <a
                                                key={key}
                                                className="t3-social"
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