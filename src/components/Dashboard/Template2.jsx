import React, { useEffect, useMemo, useRef, useState } from "react";
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

function getSocialIcon(key) {
    const map = {
        facebook_url: Template2IconFacebook,
        instagram_url: Template2IconInstagram,
        linkedin_url: Template2IconLinkedin,
        x_url: Template2IconX,
        twitter_url: Template2IconX,
        tiktok_url: Template2IconTikTok,
    };
    return map[key] || Template2IconX;
}

function SliderSection({
    title,
    items,
    renderItem,
    trackClassName = "",
}) {
    const trackRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const dragStateRef = useRef({
        isDown: false,
        startX: 0,
        startScrollLeft: 0,
        draggingX: false,
        pointerId: null,
    });

    const scrollToIndex = (index) => {
        const track = trackRef.current;
        if (!track) return;

        const slides = Array.from(track.children || []);
        const next = slides[index];
        if (!next) return;

        track.scrollTo({
            left: next.offsetLeft,
            behavior: "smooth",
        });
        setActiveIndex(index);
    };

    const updateActiveIndex = () => {
        const track = trackRef.current;
        if (!track) return;

        const slides = Array.from(track.children || []);
        if (!slides.length) return;

        const center = track.scrollLeft + track.clientWidth / 2;

        let bestIndex = 0;
        let bestDistance = Infinity;

        slides.forEach((slide, i) => {
            const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
            const distance = Math.abs(center - slideCenter);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIndex = i;
            }
        });

        setActiveIndex(bestIndex);
    };

    useEffect(() => {
        updateActiveIndex();
    }, [items.length]);

    const handlePointerDown = (e) => {
        const track = trackRef.current;
        if (!track) return;

        dragStateRef.current = {
            isDown: true,
            startX: e.clientX,
            startScrollLeft: track.scrollLeft,
            draggingX: false,
            pointerId: e.pointerId,
        };

        try {
            track.setPointerCapture(e.pointerId);
        } catch { }
    };

    const handlePointerMove = (e) => {
        const track = trackRef.current;
        const state = dragStateRef.current;
        if (!track || !state.isDown) return;

        const dx = e.clientX - state.startX;

        if (!state.draggingX && Math.abs(dx) > 8) {
            state.draggingX = true;
            track.classList.add("is-dragging");
        }

        if (state.draggingX) {
            e.preventDefault();
            track.scrollLeft = state.startScrollLeft - dx;
        }
    };

    const handlePointerUp = (e) => {
        const track = trackRef.current;
        if (!track) return;

        dragStateRef.current.isDown = false;
        dragStateRef.current.draggingX = false;
        track.classList.remove("is-dragging");

        try {
            track.releasePointerCapture(e.pointerId);
        } catch { }

        updateActiveIndex();
    };

    const handlePointerLeave = () => {
        const track = trackRef.current;
        if (!track) return;

        dragStateRef.current.isDown = false;
        dragStateRef.current.draggingX = false;
        track.classList.remove("is-dragging");
        updateActiveIndex();
    };

    if (!items.length) return null;

    return (
        <section className="t2-section">
            <div className="t2-section-head">
                <h2 className="t2-section-title">{title}</h2>
            </div>

            <div
                ref={trackRef}
                className={`t2-sliderTrack ${trackClassName}`.trim()}
                onScroll={updateActiveIndex}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                role="region"
                aria-label={title}
            >
                {items.map((item, index) => (
                    <div key={index} className="t2-slide">
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>

            {items.length > 1 ? (
                <div className="t2-dots" aria-label={`${title} navigation`}>
                    {items.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            className={`t2-dot ${activeIndex === i ? "is-active" : ""}`}
                            aria-label={`Go to ${title} slide ${i + 1}`}
                            onClick={() => scrollToIndex(i)}
                        />
                    ))}
                </div>
            ) : null}
        </section>
    );
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
            .map(([key, url]) => ({
                key,
                url,
                label: key.replace("_url", "").replace(/_/g, " "),
                icon: getSocialIcon(key),
            }));
    }, [v.socials]);

    const hasAbout = nonEmpty(v.bio) || nonEmpty(v.fullName) || nonEmpty(v.jobTitle) || nonEmpty(avatar);
    const hasContact = nonEmpty(v.email) || nonEmpty(v.phone) || socials.length > 0;

    return (
        <div className={`kc-tpl kc-tpl-2 ${v.themeMode === "dark" ? "t2-theme-dark" : "t2-theme-light"}`}>
            <div className="t2-shell">
                {v.showMainSection && (
                    <section className="t2-hero">
                        <div className="t2-hero-media">
                            {nonEmpty(cover) ? (
                                <img src={cover} alt="" className="t2-hero-cover" />
                            ) : (
                                <div className="t2-hero-cover t2-hero-cover--placeholder" aria-hidden="true" />
                            )}
                        </div>

                        <div className="t2-hero-copy">
                            <div className="t2-hero-avatarRow">
                                {nonEmpty(avatar) ? (
                                    <img src={avatar} alt="Avatar" className="t2-hero-avatar" />
                                ) : null}
                            </div>

                            <h1 className="t2-h1">{v.mainHeading || "YOUR MAIN HEADING"}</h1>

                            {nonEmpty(v.subHeading) ? <p className="t2-sub">{v.subHeading}</p> : null}
                            {nonEmpty(v.location) ? <p className="t2-location">{v.location}</p> : null}

                            {hasHeroCtas ? (
                                <div className="t2-ctaRow">
                                    <button type="button" className="t2-btn t2-btn-primary" onClick={v.onSaveMyNumber}>
                                        <img src={SaveMyNumberIcon} alt="" className="t2-btnIcon" />
                                        <span>Save My Number</span>
                                    </button>
                                    <button type="button" className="t2-btn t2-btn-secondary" onClick={v.onOpenExchangeContact}>
                                        <img src={ExchangeContactIcon} alt="" className="t2-btnIcon" />
                                        <span>Exchange Contact</span>
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </section>
                )}

                {v.showAboutMeSection && hasAbout ? (
                    <section className="t2-section">
                        <div className="t2-section-head">
                            <h2 className="t2-section-title">ABOUT ME</h2>
                        </div>

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
                    </section>
                ) : null}

                {v.showWorkSection && works.length > 0 ? (
                    <SliderSection
                        title="MY WORK"
                        items={works.slice(0, 14)}
                        trackClassName="t2-sliderTrack--media"
                        renderItem={(url, i) => (
                            <article className="t2-mediaCard">
                                <img src={url} alt={`Work ${i + 1}`} className="t2-mediaImg" draggable="false" />
                            </article>
                        )}
                    />
                ) : null}

                {v.showServicesSection && services.length > 0 ? (
                    <SliderSection
                        title="MY SERVICES"
                        items={services.slice(0, 12)}
                        trackClassName="t2-sliderTrack--content"
                        renderItem={(s) => (
                            <article className="t2-infoCard">
                                <h3 className="t2-cardTitle">{s?.name || "Service"}</h3>
                                {nonEmpty(s?.description) ? (
                                    <p className="t2-cardBody">{s.description}</p>
                                ) : nonEmpty(s?.price) ? (
                                    <p className="t2-cardBody">{s.price}</p>
                                ) : null}
                            </article>
                        )}
                    />
                ) : null}

                {v.showReviewsSection && reviews.length > 0 ? (
                    <SliderSection
                        title="MY REVIEWS"
                        items={reviews.slice(0, 10)}
                        trackClassName="t2-sliderTrack--content"
                        renderItem={(r) => (
                            <article className="t2-infoCard t2-infoCard--review">
                                {nonEmpty(r?.text) ? <p className="t2-cardBody t2-cardBody--review">“{r.text}”</p> : null}
                                {nonEmpty(r?.name) ? <div className="t2-reviewName">{r.name}</div> : null}
                                <Stars rating={r?.rating} />
                            </article>
                        )}
                    />
                ) : null}

                {v.showContactSection && hasContact ? (
                    <section className="t2-section t2-section-last">
                        <div className="t2-section-head">
                            <h2 className="t2-section-title">GET IN TOUCH</h2>
                        </div>

                        <div className="t2-contactStack">
                            {nonEmpty(v.email) ? (
                                <a className="t2-contactCard" href={`mailto:${v.email}`}>
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
                                <a className="t2-contactCard" href={`tel:${v.phone}`}>
                                    <div className="t2-contactCardInner">
                                        <img src={Template2IconPhone} alt="" className="t2-contactIcon" />
                                        <div className="t2-contactText">
                                            <span className="t2-contactLabel">Phone Number</span>
                                            <span className="t2-contactValue">{v.phone}</span>
                                        </div>
                                    </div>
                                </a>
                            ) : null}

                            {socials.length > 0 ? (
                                <div className="t2-socialsCard">
                                    <div className="t2-socials">
                                        {socials.map((s) => (
                                            <a key={s.key} className="t2-social" href={s.url} target="_blank" rel="noreferrer" aria-label={s.label}>
                                                <img src={s.icon} alt="" className="t2-socialIcon" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </section>
                ) : null}
            </div>
        </div>
    );
}