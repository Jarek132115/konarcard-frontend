import React, { useMemo } from "react";
import { motion } from "motion/react";
import "../../styling/dashboard/templates/template2.css";

import SaveMyNumberIcon from "../../assets/icons/SaveMyNumberIcon.svg";
import ExchangeContactIcon from "../../assets/icons/ExchangeContactIcon.svg";
import Template2IconEmail from "../../assets/icons/Template2Icon-Email.svg";
import Template2IconFacebook from "../../assets/icons/Template2Icon-Facebook.svg";
import Template2IconInstagram from "../../assets/icons/Template2Icon-Instagram.svg";
import Template2IconLinkedin from "../../assets/icons/Template2Icon-Linkedin.svg";
import Template2IconPhone from "../../assets/icons/Template2Icon-Phone.svg";
import Template2IconTikTok from "../../assets/icons/Template2Icon-TikTok.svg";
import Template2IconX from "../../assets/icons/Template2Icon-X.svg";
import Template2ServiceIcon from "../../assets/icons/Template2ServiceIcon.svg";

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

function SectionHead({ title }) {
    return (
        <div className="t2-section-head">
            <div className="t2-section-headInner">
                <h2 className="t2-section-title">{title}</h2>
                <span className="t2-section-stroke" aria-hidden="true" />
            </div>
        </div>
    );
}

function getSocialMeta(key) {
    const map = {
        facebook_url: {
            label: "Facebook",
            analyticsKey: "facebook_url",
            icon: Template2IconFacebook,
        },
        instagram_url: {
            label: "Instagram",
            analyticsKey: "instagram_url",
            icon: Template2IconInstagram,
        },
        linkedin_url: {
            label: "LinkedIn",
            analyticsKey: "linkedin_url",
            icon: Template2IconLinkedin,
        },
        x_url: {
            label: "X",
            analyticsKey: "x_url",
            icon: Template2IconX,
        },
        twitter_url: {
            label: "X",
            analyticsKey: "twitter_url",
            icon: Template2IconX,
        },
        tiktok_url: {
            label: "TikTok",
            analyticsKey: "tiktok_url",
            icon: Template2IconTikTok,
        },
    };

    return map[key] || {
        label: key.replace("_url", "").replace(/_/g, " "),
        analyticsKey: key,
        icon: Template2IconX,
    };
}

function buildWorkRows(items) {
    const rows = [];
    let i = 0;
    let useSingle = true;

    while (i < items.length) {
        const count = useSingle ? 1 : 2;
        const rowItems = items.slice(i, i + count);

        rows.push({
            type: rowItems.length === 1 ? "single" : "double",
            items: rowItems,
        });

        i += rowItems.length;
        useSingle = !useSingle;
    }

    return rows;
}

export default function Template2({ vm }) {
    const v = vm || {};

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
        return asArray(v.reviews).filter((r) => r?.name || r?.text || r?.rating);
    }, [v.reviews]);

    const hasHeroCtas = !!(v.hasExchangeContact || nonEmpty(v.email) || nonEmpty(v.phone));

    const socials = useMemo(() => {
        return Object.entries(v.socials || {})
            .filter(([, url]) => nonEmpty(url))
            .map(([key, url]) => {
                const meta = getSocialMeta(key);
                return {
                    key,
                    url,
                    label: meta.label,
                    analyticsKey: meta.analyticsKey,
                    icon: meta.icon,
                };
            });
    }, [v.socials]);

    const hasAbout =
        nonEmpty(v.bio) || nonEmpty(v.fullName) || nonEmpty(v.jobTitle) || nonEmpty(avatar);
    const hasContact =
        nonEmpty(v.email) || nonEmpty(v.phone) || v.hasExchangeContact || socials.length > 0;

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
        <div className={`kc-tpl kc-tpl-2 ${v.themeMode === "dark" ? "t2-theme-dark" : "t2-theme-light"}`}>
            <div className="t2-shell">
                {v.showMainSection && (
                    <motion.section className="t2-hero" {...fadeUp(0)}>
                        <div className="t2-hero-media">
                            {nonEmpty(cover) ? (
                                <img src={cover} alt="" className="t2-hero-cover" />
                            ) : (
                                <div className="t2-hero-cover t2-hero-cover--placeholder" aria-hidden="true" />
                            )}
                        </div>

                        <div className="t2-hero-copy">
                            <h1 className="t2-h1">{v.mainHeading || "YOUR MAIN HEADING"}</h1>

                            {nonEmpty(v.subHeading) ? <p className="t2-sub">{v.subHeading}</p> : null}
                            {nonEmpty(v.location) ? <p className="t2-location">{v.location}</p> : null}

                            {hasHeroCtas ? (
                                <div className="t2-ctaRow">
                                    {nonEmpty(v.email) || nonEmpty(v.phone) ? (
                                        <button
                                            type="button"
                                            className="t2-btn t2-btn-primary"
                                            onClick={handleSaveMyNumber}
                                        >
                                            <img src={SaveMyNumberIcon} alt="" className="t2-btnIcon" />
                                            <span>Save My Number</span>
                                        </button>
                                    ) : null}

                                    {v.hasExchangeContact ? (
                                        <button
                                            type="button"
                                            className="t2-btn t2-btn-secondary"
                                            onClick={handleExchangeClick}
                                        >
                                            <img src={ExchangeContactIcon} alt="" className="t2-btnIcon" />
                                            <span>Exchange Contact</span>
                                        </button>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>
                    </motion.section>
                )}

                {v.showAboutMeSection && hasAbout ? (
                    <motion.section className="t2-section" {...fadeUpInView(0)}>
                        <SectionHead title="ABOUT ME" />

                        <div className="t2-aboutCard">
                            <div className="t2-aboutTop">
                                {nonEmpty(avatar) ? (
                                    <img src={avatar} alt="" className="t2-aboutAvatar" />
                                ) : (
                                    <div className="t2-aboutAvatar t2-aboutAvatar--placeholder" />
                                )}

                                <div className="t2-aboutMeta">
                                    {nonEmpty(v.fullName) ? <div className="t2-aboutName">{v.fullName}</div> : null}
                                    {nonEmpty(v.jobTitle) ? <div className="t2-aboutRole">{v.jobTitle}</div> : null}
                                </div>
                            </div>

                            {nonEmpty(v.bio) ? <p className="t2-aboutBio">{v.bio}</p> : null}
                        </div>
                    </motion.section>
                ) : null}

                {v.showWorkSection && works.length > 0 ? (
                    <motion.section className="t2-section" {...fadeUpInView(0)}>
                        <SectionHead title="MY WORK" />

                        <div className="t2-workRows">
                            {workRows.map((row, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className={`t2-workRow ${row.type === "double" ? "t2-workRow--double" : "t2-workRow--single"}`}
                                >
                                    {row.items.map((url, itemIndex) => (
                                        <article
                                            key={`${rowIndex}-${itemIndex}`}
                                            className={`t2-mediaCard ${row.items.length === 1 ? "t2-mediaCard--full" : ""}`}
                                        >
                                            <img src={url} alt={`Work ${rowIndex + itemIndex + 1}`} className="t2-mediaImg" />
                                        </article>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </motion.section>
                ) : null}

                {v.showServicesSection && services.length > 0 ? (
                    <motion.section className="t2-section" {...fadeUpInView(0)}>
                        <SectionHead title="MY SERVICES" />

                        <div className="t2-servicesList">
                            {services.slice(0, 12).map((s, i) => (
                                <article key={i} className="t2-serviceItem">
                                    <div className="t2-serviceInner">
                                        <img src={Template2ServiceIcon} alt="" className="t2-serviceIcon" />
                                        <h3 className="t2-cardTitle">{s?.name || "Service"}</h3>
                                        {nonEmpty(s?.description) ? (
                                            <p className="t2-cardBody">{s.description}</p>
                                        ) : nonEmpty(s?.price) ? (
                                            <p className="t2-cardBody">{s.price}</p>
                                        ) : null}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </motion.section>
                ) : null}

                {v.showReviewsSection && reviews.length > 0 ? (
                    <motion.section className="t2-section" {...fadeUpInView(0)}>
                        <SectionHead title="MY REVIEWS" />

                        <div className="t2-reviewsList">
                            {reviews.slice(0, 10).map((r, i) => (
                                <article key={i} className="t2-reviewItem">
                                    <div className="t2-reviewInner">
                                        {nonEmpty(r?.text) ? <p className="t2-cardBody t2-cardBody--review">“{r.text}”</p> : null}
                                        {nonEmpty(r?.name) ? <div className="t2-reviewName">{r.name}</div> : null}
                                        <Stars rating={r?.rating} />
                                    </div>
                                </article>
                            ))}
                        </div>
                    </motion.section>
                ) : null}

                {v.showContactSection && hasContact ? (
                    <motion.section className="t2-section t2-section-last" {...fadeUpInView(0)}>
                        <SectionHead title="GET IN TOUCH" />

                        <div className="t2-contactStack">
                            {nonEmpty(v.email) ? (
                                <a
                                    className="t2-contactCard"
                                    href={`mailto:${v.email}`}
                                    onClick={handleEmailClick}
                                >
                                    <div className="t2-contactCardInner">
                                        <img src={Template2IconEmail} alt="" className="t2-contactIcon" />
                                        <div className="t2-contactText">
                                            <span className="t2-contactLabel">Email</span>
                                            <span className="t2-contactValue">{v.email}</span>
                                        </div>
                                    </div>
                                </a>
                            ) : null}

                            {nonEmpty(v.phone) ? (
                                <a
                                    className="t2-contactCard"
                                    href={`tel:${v.phone}`}
                                    onClick={handlePhoneClick}
                                >
                                    <div className="t2-contactCardInner">
                                        <img src={Template2IconPhone} alt="" className="t2-contactIcon" />
                                        <div className="t2-contactText">
                                            <span className="t2-contactLabel">Phone Number</span>
                                            <span className="t2-contactValue">{v.phone}</span>
                                        </div>
                                    </div>
                                </a>
                            ) : null}

                            {v.hasExchangeContact ? (
                                <button
                                    type="button"
                                    className="t2-contactCard"
                                    onClick={handleExchangeClick}
                                >
                                    <div className="t2-contactCardInner">
                                        <img src={ExchangeContactIcon} alt="" className="t2-contactIcon" />
                                        <div className="t2-contactText">
                                            <span className="t2-contactLabel">Exchange Contact</span>
                                            <span className="t2-contactValue">Share contact details with each other</span>
                                        </div>
                                    </div>
                                </button>
                            ) : null}

                            {socials.length > 0 ? (
                                <div className="t2-socialsCard">
                                    <div className="t2-socials">
                                        {socials.map((s) => (
                                            <a
                                                key={s.key}
                                                className="t2-social"
                                                href={s.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={s.label}
                                                onClick={(e) => handleSocialLinkOpen(e, s.analyticsKey, s.url)}
                                            >
                                                <img src={s.icon} alt="" className="t2-socialIcon" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </motion.section>
                ) : null}
            </div>
        </div>
    );
}