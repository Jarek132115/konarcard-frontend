import React, { useMemo, useRef, useState } from "react";
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

function SlideDots({ count, activeIndex, onSelect }) {
    if (count <= 1) return null;

    return (
        <div className="t2-dots" aria-label="Slider navigation">
            {Array.from({ length: count }).map((_, i) => (
                <button
                    key={i}
                    type="button"
                    className={`t2-dot ${i === activeIndex ? "is-active" : ""}`}
                    onClick={() => onSelect(i)}
                    aria-label={`Go to slide ${i + 1}`}
                />
            ))}
        </div>
    );
}

function useSlider(total) {
    const trackRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const scrollToIndex = (index) => {
        const track = trackRef.current;
        if (!track) return;

        const clamped = Math.max(0, Math.min(total - 1, index));
        const child = track.children?.[clamped];
        if (!child) return;

        child.scrollIntoView({
            behavior: "smooth",
            inline: "start",
            block: "nearest",
        });
        setActiveIndex(clamped);
    };

    const handleScroll = () => {
        const track = trackRef.current;
        if (!track) return;

        const children = Array.from(track.children || []);
        if (!children.length) return;

        const trackLeft = track.getBoundingClientRect().left;

        let bestIndex = 0;
        let bestDistance = Number.POSITIVE_INFINITY;

        children.forEach((child, i) => {
            const rect = child.getBoundingClientRect();
            const distance = Math.abs(rect.left - trackLeft);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestIndex = i;
            }
        });

        setActiveIndex(bestIndex);
    };

    return {
        trackRef,
        activeIndex,
        scrollToIndex,
        handleScroll,
    };
}

function SectionSlider({
    title,
    items,
    renderItem,
    sectionClassName = "",
    trackClassName = "",
    cardClassName = "",
}) {
    const { trackRef, activeIndex, scrollToIndex, handleScroll } = useSlider(items.length);

    if (!items.length) return null;

    return (
        <section className={`t2-section ${sectionClassName}`.trim()}>
            <div className="t2-section-head">
                <h2 className="t2-title">{title}</h2>
            </div>

            <div
                ref={trackRef}
                className={`t2-sliderTrack ${trackClassName}`.trim()}
                onScroll={handleScroll}
                role="region"
                aria-label={title}
            >
                {items.map((item, i) => (
                    <div key={i} className={`t2-slide ${cardClassName}`.trim()}>
                        {renderItem(item, i)}
                    </div>
                ))}
            </div>

            <SlideDots count={items.length} activeIndex={activeIndex} onSelect={scrollToIndex} />
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
            }));
    }, [v.socials]);

    return (
        <div className="kc-tpl kc-tpl-2">
            <div className="t2-shell">
                {v.showMainSection && (
                    <section className="t2-hero">
                        <div className="t2-heroMedia">
                            {nonEmpty(cover) ? (
                                <img src={cover} alt="" className="t2-heroImage" />
                            ) : (
                                <div className="t2-heroImage t2-heroImage--placeholder" aria-hidden="true" />
                            )}
                            <div className="t2-heroOverlay" />
                        </div>

                        <div className="t2-heroCard">
                            <div className="t2-heroTop">
                                {nonEmpty(avatar) ? (
                                    <img src={avatar} alt="Avatar" className="t2-avatar" />
                                ) : (
                                    <div className="t2-avatar t2-avatar--ph" aria-hidden="true" />
                                )}

                                <div className="t2-heroText">
                                    <h1 className="t2-h1">{v.mainHeading || "Your Main Heading"}</h1>
                                    {nonEmpty(v.subHeading) ? <p className="t2-sub">{v.subHeading}</p> : null}
                                    {nonEmpty(v.location) ? <p className="t2-location">{v.location}</p> : null}
                                </div>
                            </div>

                            {hasHeroCtas ? (
                                <div className="t2-ctaRow">
                                    <button
                                        type="button"
                                        className="t2-btn t2-btn-primary"
                                        onClick={v.onSaveMyNumber}
                                    >
                                        Save My Number
                                    </button>
                                    <button
                                        type="button"
                                        className="t2-btn t2-btn-ghost"
                                        onClick={v.onOpenExchangeContact}
                                    >
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

                {v.showAboutMeSection && (nonEmpty(v.bio) || nonEmpty(v.fullName) || nonEmpty(v.jobTitle)) ? (
                    <section className="t2-section">
                        <div className="t2-section-head">
                            <h2 className="t2-title">About</h2>
                        </div>

                        <div className="t2-card t2-aboutCard">
                            {nonEmpty(v.bio) ? <p className="t2-bio">{v.bio}</p> : null}
                        </div>
                    </section>
                ) : null}

                {v.showWorkSection && works.length > 0 ? (
                    <SectionSlider
                        title="My Work"
                        items={works.slice(0, 14)}
                        sectionClassName="t2-workSection"
                        trackClassName="t2-mediaTrack"
                        cardClassName="t2-mediaSlide"
                        renderItem={(url, i) => (
                            <div className="t2-workCard">
                                <img src={url} alt={`Work ${i + 1}`} className="t2-workImg" />
                            </div>
                        )}
                    />
                ) : null}

                {v.showServicesSection && services.length > 0 ? (
                    <SectionSlider
                        title="Services"
                        items={services.slice(0, 12)}
                        sectionClassName="t2-servicesSection"
                        trackClassName="t2-contentTrack"
                        cardClassName="t2-contentSlide"
                        renderItem={(s) => (
                            <div className="t2-card t2-serviceCard">
                                <div className="t2-serviceName">{s?.name || "Service"}</div>
                                {nonEmpty(s?.description) ? (
                                    <div className="t2-serviceDesc">{s.description}</div>
                                ) : null}
                                {nonEmpty(s?.price) ? (
                                    <div className="t2-servicePrice">{s.price}</div>
                                ) : null}
                            </div>
                        )}
                    />
                ) : null}

                {v.showReviewsSection && reviews.length > 0 ? (
                    <SectionSlider
                        title="Reviews"
                        items={reviews.slice(0, 10)}
                        sectionClassName="t2-reviewsSection"
                        trackClassName="t2-contentTrack"
                        cardClassName="t2-contentSlide"
                        renderItem={(r) => (
                            <div className="t2-card t2-reviewCard">
                                <Stars rating={r?.rating} />
                                {nonEmpty(r?.text) ? <div className="t2-reviewText">“{r.text}”</div> : null}
                                {nonEmpty(r?.name) ? <div className="t2-reviewName">{r.name}</div> : null}
                            </div>
                        )}
                    />
                ) : null}

                {v.showContactSection && (nonEmpty(v.email) || nonEmpty(v.phone) || socials.length > 0) ? (
                    <section className="t2-section t2-section-last">
                        <div className="t2-section-head">
                            <h2 className="t2-title">Contact</h2>
                        </div>

                        <div className="t2-card t2-contactCard">
                            <div className="t2-contactActions">
                                {nonEmpty(v.email) ? (
                                    <a className="t2-pill" href={`mailto:${v.email}`}>
                                        <span className="t2-pillK">Email</span>
                                        <span className="t2-pillV">{v.email}</span>
                                    </a>
                                ) : null}

                                {nonEmpty(v.phone) ? (
                                    <a className="t2-pill" href={`tel:${v.phone}`}>
                                        <span className="t2-pillK">Phone</span>
                                        <span className="t2-pillV">{v.phone}</span>
                                    </a>
                                ) : null}
                            </div>

                            {socials.length > 0 ? (
                                <div className="t2-socials" aria-label="Social links">
                                    {socials.map((s) => (
                                        <a
                                            key={s.key}
                                            className="t2-social"
                                            href={s.url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {s.label}
                                        </a>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </section>
                ) : null}
            </div>
        </div>
    );
}