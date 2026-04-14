import React, { useMemo } from "react";
import { motion } from "motion/react";
import "../../styling/dashboard/templates/template5.css";

import SaveMyNumberIcon from "../../assets/icons/SaveMyNumberIcon.svg";
import ExchangeContactIcon from "../../assets/icons/ExchangeContactIcon.svg";

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

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: EASE },
});

const fadeUpInView = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-40px" },
    transition: { duration: 0.55, delay, ease: EASE },
});

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

function TemplateIcon({ src, alt = "", className = "" }) {
    return <img src={src} alt={alt} className={className} />;
}

function SectionHead({ title }) {
    return (
        <div className="t5-sectionHead">
            <h2 className="t5-sectionTitle">{title}</h2>
            <span className="t5-sectionUnderline" aria-hidden="true" />
        </div>
    );
}

function getSocialMeta(key) {
    const map = {
        facebook_url: {
            label: "Facebook",
            analyticsKey: "facebook_url",
            icon: <TemplateIcon src={FacebookIconSrc} alt="" className="t5-socialIconAsset" />,
        },
        instagram_url: {
            label: "Instagram",
            analyticsKey: "instagram_url",
            icon: <TemplateIcon src={InstagramIconSrc} alt="" className="t5-socialIconAsset" />,
        },
        linkedin_url: {
            label: "LinkedIn",
            analyticsKey: "linkedin_url",
            icon: <TemplateIcon src={LinkedInIconSrc} alt="" className="t5-socialIconAsset" />,
        },
        x_url: {
            label: "X",
            analyticsKey: "x_url",
            icon: <TemplateIcon src={XIconSrc} alt="" className="t5-socialIconAsset" />,
        },
        twitter_url: {
            label: "X",
            analyticsKey: "twitter_url",
            icon: <TemplateIcon src={XIconSrc} alt="" className="t5-socialIconAsset" />,
        },
        tiktok_url: {
            label: "TikTok",
            analyticsKey: "tiktok_url",
            icon: <TemplateIcon src={TikTokIconSrc} alt="" className="t5-socialIconAsset" />,
        },
    };

    return map[key] || {
        label: key.replace("_url", ""),
        analyticsKey: key,
        icon: null,
    };
}

function buildWorkRows(items) {
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
        const rowItems = items.slice(i, i + 2);
        rows.push(rowItems);
    }
    return rows;
}

export default function Template5({ vm }) {
    const v = vm || {};
    const themeMode = (v.themeMode || "light").toLowerCase();

    const cover = v.cover || "";
    const avatar = v.avatar || v.logo || "";

    const works = useMemo(
        () =>
            asArray(v.works)
                .map((x) => x?.preview || x?.url || x)
                .filter(Boolean),
        [v.works]
    );

    const workRows = useMemo(() => buildWorkRows(works.slice(0, 12)), [works]);

    const services = useMemo(
        () => asArray(v.services).filter((s) => s?.name || s?.description || s?.price),
        [v.services]
    );

    const reviews = useMemo(
        () => asArray(v.reviews).filter((r) => r?.name || r?.text || Number(r?.rating) > 0),
        [v.reviews]
    );

    const socials = useMemo(() => {
        return Object.entries(v.socials || {}).filter(([, url]) => nonEmpty(url));
    }, [v.socials]);

    const hasHeroCtas = !!(v.hasExchangeContact || nonEmpty(v.email) || nonEmpty(v.phone));
    const hasAbout = nonEmpty(v.bio) || nonEmpty(v.fullName) || nonEmpty(v.jobTitle) || nonEmpty(avatar);
    const hasContact = nonEmpty(v.email) || nonEmpty(v.phone) || v.hasExchangeContact || socials.length > 0;

    const handleSaveMyNumber = () => {
        if (typeof v.onSaveMyNumber === "function") {
            v.onSaveMyNumber();
        }
    };

    const handleExchangeClick = () => {
        if (typeof v.onOpenExchangeContact === "function") {
            v.onOpenExchangeContact();
        }
    };

    const handleEmailClick = () => {
        if (typeof v.onEmailClick === "function") {
            v.onEmailClick();
        }
    };

    const handlePhoneClick = () => {
        if (typeof v.onPhoneClick === "function") {
            v.onPhoneClick();
        }
    };

    const handleSocialClick = async (platformKey, url) => {
        if (typeof v.onSocialClick === "function") {
            await v.onSocialClick(platformKey, url);
        }
    };

    const handleSocialLinkOpen = async (e, platformKey, url) => {
        e.preventDefault();

        try {
            await handleSocialClick(platformKey, url);
        } catch {
            // ignore tracking errors so link still opens
        }

        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <div className={`kc-tpl kc-tpl-5 ${themeMode === "dark" ? "t5-theme-dark" : "t5-theme-light"}`}>
            <div className="t5-shell">
                {v.showMainSection && (
                    <motion.section className="t5-hero" {...fadeUp(0)}>
                        <div className="t5-heroMedia">
                            {nonEmpty(cover) ? (
                                <img className="t5-coverImg" src={cover} alt="Cover" />
                            ) : (
                                <div className="t5-coverPlaceholder" aria-hidden="true" />
                            )}
                        </div>

                        <div className="t5-heroCard">
                            <div className="t5-brandRow">
                                <div className="t5-brandText">
                                    <h1 className="t5-h1">{v.mainHeading || "Your Main Heading"}</h1>
                                    {nonEmpty(v.subHeading) ? <p className="t5-sub">{v.subHeading}</p> : null}
                                    {nonEmpty(v.location) ? <p className="t5-location">{v.location}</p> : null}
                                </div>
                            </div>

                            {hasHeroCtas ? (
                                <div className="t5-cta">
                                    {nonEmpty(v.email) || nonEmpty(v.phone) ? (
                                        <button type="button" className="t5-btn t5-btn-primary" onClick={handleSaveMyNumber}>
                                            <span className="t5-btnIcon">
                                                <img src={SaveMyNumberIcon} alt="" className="t5-btnIconAsset t5-btnIconAsset--primary" />
                                            </span>
                                            <span className="t5-btnLabel">Save My Number</span>
                                        </button>
                                    ) : null}

                                    {v.hasExchangeContact ? (
                                        <button type="button" className="t5-btn t5-btn-secondary" onClick={handleExchangeClick}>
                                            <span className="t5-btnIcon">
                                                <img src={ExchangeContactIcon} alt="" className="t5-btnIconAsset t5-btnIconAsset--secondary" />
                                            </span>
                                            <span className="t5-btnLabel">Exchange Contact</span>
                                        </button>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    </motion.section>
                )}

                {v.showAboutMeSection && hasAbout ? (
                    <motion.section className="t5-section" {...fadeUpInView(0)}>
                        <SectionHead title="About Me" />

                        <div className="t5-aboutCard">
                            <div className="t5-aboutTop">
                                <div className="t5-aboutAvatarWrap">
                                    {nonEmpty(avatar) ? (
                                        <img className="t5-aboutAvatar" src={avatar} alt="" />
                                    ) : (
                                        <div className="t5-aboutAvatar t5-aboutAvatar--ph" aria-hidden="true" />
                                    )}
                                </div>

                                <div className="t5-aboutMeta">
                                    {nonEmpty(v.fullName) ? <div className="t5-aboutName">{v.fullName}</div> : null}
                                    {nonEmpty(v.jobTitle) ? <div className="t5-aboutRole">{v.jobTitle}</div> : null}
                                </div>
                            </div>

                            {nonEmpty(v.bio) ? <p className="t5-bio">{v.bio}</p> : null}
                        </div>
                    </motion.section>
                ) : null}

                {v.showWorkSection && works.length > 0 ? (
                    <motion.section className="t5-section" {...fadeUpInView(0)}>
                        <SectionHead title="Recent Work" />

                        <div className="t5-workRows">
                            {workRows.map((row, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className={`t5-workRow ${row.length === 1 ? "t5-workRow--single" : "t5-workRow--pair"}`}
                                >
                                    {row.map((url, itemIndex) => (
                                        <div
                                            key={`${rowIndex}-${itemIndex}`}
                                            className={`t5-workTile ${row.length === 1 ? "is-full" : ""}`}
                                        >
                                            <img src={url} alt={`Work ${rowIndex * 2 + itemIndex + 1}`} className="t5-workImg" />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </motion.section>
                ) : null}

                {v.showServicesSection && services.length > 0 ? (
                    <motion.section className="t5-section" {...fadeUpInView(0)}>
                        <SectionHead title="What I Offer" />

                        <div className="t5-servicesList">
                            {services.slice(0, 12).map((s, i) => (
                                <article key={i} className="t5-serviceRow">
                                    <div className="t5-serviceIndex">{String(i + 1).padStart(2, "0")}</div>

                                    <div className="t5-serviceMain">
                                        <h3 className="t5-serviceName">{s?.name || "Service"}</h3>
                                        {nonEmpty(s?.description || s?.price) ? (
                                            <p className="t5-serviceBody">{s.description || s.price}</p>
                                        ) : null}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </motion.section>
                ) : null}

                {v.showReviewsSection && reviews.length > 0 ? (
                    <motion.section className="t5-section" {...fadeUpInView(0)}>
                        <SectionHead title="Client Reviews" />

                        <div className="t5-reviewsGrid">
                            {reviews.slice(0, 10).map((r, i) => (
                                <article key={i} className="t5-reviewCard">
                                    <Stars rating={r?.rating} />
                                    {nonEmpty(r?.text) ? <p className="t5-reviewText">“{r.text}”</p> : null}
                                    {nonEmpty(r?.name) ? <div className="t5-reviewName">{r.name}</div> : null}
                                </article>
                            ))}
                        </div>
                    </motion.section>
                ) : null}

                {v.showContactSection && hasContact ? (
                    <motion.section className="t5-section t5-section-last" {...fadeUpInView(0)}>
                        <SectionHead title="Get In Touch" />

                        <div className="t5-contactWrap">
                            {nonEmpty(v.email) || nonEmpty(v.phone) || v.hasExchangeContact ? (
                                <div className="t5-contactGrid">
                                    {nonEmpty(v.email) ? (
                                        <a
                                            className="t5-contactCard"
                                            href={`mailto:${v.email}`}
                                            onClick={handleEmailClick}
                                        >
                                            <span className="t5-contactIcon">
                                                <TemplateIcon src={EmailIconSrc} alt="" className="t5-contactIconAssetRaw" />
                                            </span>
                                            <span className="t5-contactText">
                                                <span className="t5-contactLabel">Email</span>
                                                <span className="t5-contactValue">{v.email}</span>
                                            </span>
                                        </a>
                                    ) : null}

                                    {nonEmpty(v.phone) ? (
                                        <a
                                            className="t5-contactCard"
                                            href={`tel:${v.phone}`}
                                            onClick={handlePhoneClick}
                                        >
                                            <span className="t5-contactIcon">
                                                <TemplateIcon src={PhoneIconSrc} alt="" className="t5-contactIconAssetRaw" />
                                            </span>
                                            <span className="t5-contactText">
                                                <span className="t5-contactLabel">Phone</span>
                                                <span className="t5-contactValue">{v.phone}</span>
                                            </span>
                                        </a>
                                    ) : null}

                                    {v.hasExchangeContact ? (
                                        <button
                                            type="button"
                                            className="t5-contactCard t5-contactCard--button"
                                            onClick={handleExchangeClick}
                                        >
                                            <span className="t5-contactIcon">
                                                <TemplateIcon src={ExchangeContactIconSrc} alt="" className="t5-contactIconAssetRaw" />
                                            </span>
                                            <span className="t5-contactText">
                                                <span className="t5-contactLabel">Exchange Contact</span>
                                                <span className="t5-contactValue">Share contact details with each other</span>
                                            </span>
                                        </button>
                                    ) : null}
                                </div>
                            ) : null}

                            {socials.length > 0 ? (
                                <div className="t5-socials">
                                    {socials.map(([key, url]) => {
                                        const meta = getSocialMeta(key);
                                        return (
                                            <a
                                                key={key}
                                                className="t5-social"
                                                href={url}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={meta.label}
                                                title={meta.label}
                                                onClick={(e) => handleSocialLinkOpen(e, meta.analyticsKey, url)}
                                            >
                                                {meta.icon}
                                            </a>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    </motion.section>
                ) : null}
            </div>
        </div>
    );
}