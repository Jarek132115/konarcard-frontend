// src/components/Preview.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { previewPlaceholders } from "../store/businessCardStore";

/**
 * Preview component
 * - Matches Editor card styling/scrolling via CSS and `columnScrollStyle`.
 * - Keeps 4:3 for work images on all sizes.
 */
export default function Preview({
    state,
    isMobile,
    hasSavedData,
    servicesDisplayMode,
    reviewsDisplayMode,
    aboutMeLayout,
    showMainSection,
    showAboutMeSection,
    showWorkSection,
    showServicesSection,
    showReviewsSection,
    showContactSection,
    hasExchangeContact,
    visitUrl,
    /** Pass the same style object you use for Editor (height/overflow sizing). */
    columnScrollStyle,
}) {
    const [previewOpen, setPreviewOpen] = useState(true);

    const previewWorkCarouselRef = useRef(null);
    const previewServicesCarouselRef = useRef(null);
    const previewReviewsCarouselRef = useRef(null);
    const mpWrapRef = useRef(null);

    const shouldShowPlaceholders = !hasSavedData;
    const isDarkMode = state.pageTheme === "dark";

    const previewFullName =
        state.full_name || (shouldShowPlaceholders ? previewPlaceholders.full_name : "");
    const previewJobTitle =
        state.job_title || (shouldShowPlaceholders ? previewPlaceholders.job_title : "");
    const previewBio = state.bio || (shouldShowPlaceholders ? previewPlaceholders.bio : "");
    const previewEmail =
        state.contact_email || (shouldShowPlaceholders ? previewPlaceholders.contact_email : "");
    const previewPhone =
        state.phone_number || (shouldShowPlaceholders ? previewPlaceholders.phone_number : "");
    const previewCoverPhotoSrc =
        state.coverPhoto ?? (shouldShowPlaceholders ? previewPlaceholders.coverPhoto : "");
    const previewAvatarSrc = state.avatar ?? (shouldShowPlaceholders ? previewPlaceholders.avatar : null);

    const previewWorkImages = useMemo(() => {
        if (state.workImages && state.workImages.length > 0) return state.workImages;
        return shouldShowPlaceholders ? previewPlaceholders.workImages : [];
    }, [state.workImages, shouldShowPlaceholders]);

    const servicesForPreview = useMemo(() => {
        if (state.services && state.services.length > 0) return state.services;
        return shouldShowPlaceholders ? previewPlaceholders.services : [];
    }, [state.services, shouldShowPlaceholders]);

    const reviewsForPreview = useMemo(() => {
        if (state.reviews && state.reviews.length > 0) return state.reviews;
        return shouldShowPlaceholders ? previewPlaceholders.reviews : [];
    }, [state.reviews, shouldShowPlaceholders]);

    // Smooth expand/collapse for mobile preview area.
    useEffect(() => {
        if (!isMobile) return;
        const el = mpWrapRef.current;
        if (!el) return;
        if (previewOpen) {
            el.style.maxHeight = el.scrollHeight + "px";
            el.style.opacity = "1";
            el.style.transform = "scale(1)";
        } else {
            el.style.maxHeight = "0px";
            el.style.opacity = "0";
            el.style.transform = "scale(.98)";
        }
    }, [isMobile, previewOpen, state, servicesDisplayMode, reviewsDisplayMode, aboutMeLayout]);

    const scrollCarousel = (ref, direction) => {
        const el = ref?.current;
        if (!el) return;
        const amount = el.clientWidth * 0.9;
        el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    };

    const WorkSection = () =>
        showWorkSection && previewWorkImages.length > 0 ? (
            <>
                <p className="mock-section-title">My Work</p>
                <div className="work-preview-row-container">
                    {state.workDisplayMode === "carousel" && (
                        <div className="carousel-nav-buttons">
                            <button
                                type="button"
                                className="carousel-nav-button left-arrow"
                                onClick={() => scrollCarousel(previewWorkCarouselRef, "left")}
                            >
                                &#9664;
                            </button>
                            <button
                                type="button"
                                className="carousel-nav-button right-arrow"
                                onClick={() => scrollCarousel(previewWorkCarouselRef, "right")}
                            >
                                &#9654;
                            </button>
                        </div>
                    )}
                    <div ref={previewWorkCarouselRef} className={`mock-work-gallery ${state.workDisplayMode}`}>
                        {previewWorkImages.map((item, i) => (
                            <div key={i} className="mock-work-image-item-wrapper">
                                <img src={item.preview || item} alt={`work-${i}`} className="mock-work-image-item" />
                            </div>
                        ))}
                    </div>
                </div>
            </>
        ) : null;

    const ServicesSection = () =>
        showServicesSection && (servicesForPreview.length > 0 || !hasSavedData) ? (
            <>
                <p className="mock-section-title">My Services</p>
                <div className="work-preview-row-container">
                    {servicesDisplayMode === "carousel" && (
                        <div className="carousel-nav-buttons">
                            <button
                                type="button"
                                className="carousel-nav-button left-arrow"
                                onClick={() => scrollCarousel(previewServicesCarouselRef, "left")}
                            >
                                &#9664;
                            </button>
                            <button
                                type="button"
                                className="carousel-nav-button right-arrow"
                                onClick={() => scrollCarousel(previewServicesCarouselRef, "right")}
                            >
                                &#9654;
                            </button>
                        </div>
                    )}
                    <div ref={previewServicesCarouselRef} className={`mock-services-list ${servicesDisplayMode}`}>
                        {servicesForPreview.map((s, i) => (
                            <div key={i} className="mock-service-item">
                                <p className="mock-service-name">{s.name}</p>
                                <span className="mock-service-price">{s.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        ) : null;

    const ReviewsSection = () =>
        showReviewsSection && (reviewsForPreview.length > 0 || !hasSavedData) ? (
            <>
                <p className="mock-section-title">Reviews</p>
                <div className="work-preview-row-container">
                    {reviewsDisplayMode === "carousel" && (
                        <div className="carousel-nav-buttons">
                            <button
                                type="button"
                                className="carousel-nav-button left-arrow"
                                onClick={() => scrollCarousel(previewReviewsCarouselRef, "left")}
                            >
                                &#9664;
                            </button>
                            <button
                                type="button"
                                className="carousel-nav-button right-arrow"
                                onClick={() => scrollCarousel(previewReviewsCarouselRef, "right")}
                            >
                                &#9654;
                            </button>
                        </div>
                    )}
                    <div ref={previewReviewsCarouselRef} className={`mock-reviews-list ${reviewsDisplayMode}`}>
                        {reviewsForPreview.map((r, i) => (
                            <div key={i} className="mock-review-card">
                                <div className="mock-star-rating">
                                    {Array(r.rating || 0)
                                        .fill()
                                        .map((_, idx) => (
                                            <span key={`f-${idx}`}>★</span>
                                        ))}
                                    {Array(Math.max(0, 5 - (r.rating || 0)))
                                        .fill()
                                        .map((_, idx) => (
                                            <span key={`e-${idx}`} className="empty-star">
                                                ★
                                            </span>
                                        ))}
                                </div>
                                <p className="mock-review-text">{`"${r.text}"`}</p>
                                <p className="mock-reviewer-name">{r.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        ) : null;

    const ContactSection = () =>
        showContactSection && (previewEmail || previewPhone) ? (
            <>
                <p className="mock-section-title">Contact Details</p>
                <div className="mock-contact-details">
                    <div className="mock-contact-item">
                        <p className="mock-contact-label">Email:</p>
                        <p className="mock-contact-value">{previewEmail}</p>
                    </div>
                    <div className="mock-contact-item">
                        <p className="mock-contact-label">Phone:</p>
                        <p className="mock-contact-value">{previewPhone}</p>
                    </div>
                </div>
            </>
        ) : null;

    const MainSection = () =>
        showMainSection ? (
            <>
                {(shouldShowPlaceholders || !!state.coverPhoto) && (
                    <img src={previewCoverPhotoSrc} alt="Cover" className="mock-cover" />
                )}
                <h2 className="mock-title">
                    {state.mainHeading || (!hasSavedData ? previewPlaceholders.main_heading : "Your Main Heading Here")}
                </h2>
                <p className="mock-subtitle">
                    {state.subHeading || (!hasSavedData ? previewPlaceholders.sub_heading : "Your Tagline or Slogan Goes Here")}
                </p>
                {(shouldShowPlaceholders || hasExchangeContact) && (
                    <button type="button" className="mock-button">
                        Save My Number
                    </button>
                )}
            </>
        ) : null;

    const AboutSection = () =>
        showAboutMeSection && (previewFullName || previewJobTitle || previewBio || previewAvatarSrc) ? (
            <>
                <p className="mock-section-title">About me</p>
                <div className={`mock-about-container ${aboutMeLayout}`}>
                    <div className="mock-about-content-group">
                        <div className="mock-about-header-group">
                            {previewAvatarSrc && <img src={previewAvatarSrc} alt="Avatar" className="mock-avatar" />}
                            <div>
                                <p className="mock-profile-name">{previewFullName}</p>
                                <p className="mock-profile-role">{previewJobTitle}</p>
                            </div>
                        </div>
                        <p className="mock-bio-text">{previewBio}</p>
                    </div>
                </div>
            </>
        ) : null;

    if (isMobile) {
        return (
            <div
                className="myprofile-content myprofile-mock-phone-mobile-container"
                style={columnScrollStyle}
            >
                <div
                    className={`mp-mobile-controls desktop-h6 ${previewOpen ? "is-open" : "is-collapsed"}`}
                    role="tablist"
                    aria-label="Preview controls"
                >
                    <div
                        className="mp-pill"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                            justifyItems: "stretch",
                            width: "100%",
                        }}
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={previewOpen}
                            className={`mp-tab ${previewOpen ? "active" : ""}`}
                            onClick={() => setPreviewOpen((s) => !s)}
                            style={{ width: "100%" }}
                        >
                            {previewOpen ? "Hide Preview" : "Show Preview"}
                        </button>
                        <a
                            role="tab"
                            aria-selected={!previewOpen}
                            className={`mp-tab visit ${!previewOpen ? "active" : ""}`}
                            href={visitUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setPreviewOpen(false)}
                            style={{ width: "100%", textAlign: "center", justifyContent: "center" }}
                        >
                            Visit Page
                        </a>
                    </div>

                    <div
                        className="mp-preview-wrap"
                        ref={mpWrapRef}
                        style={{
                            maxHeight: previewOpen ? undefined : 0,
                            overflow: "hidden",
                            transition: "max-height .3s ease, opacity .3s ease, transform .3s ease",
                        }}
                    >
                        <div
                            className={`mock-phone mobile-preview ${isDarkMode ? "dark-mode" : ""}`}
                            style={{ fontFamily: state.font || previewPlaceholders.font }}
                        >
                            <div className="mock-phone-scrollable-content">
                                <MainSection />
                                <AboutSection />
                                <WorkSection />
                                <ServicesSection />
                                <ReviewsSection />
                                <ContactSection />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop
    return (
        <div className="myprofile-content" style={columnScrollStyle}>
            <div
                className={`mock-phone ${isDarkMode ? "dark-mode" : ""}`}
                style={{ fontFamily: state.font || previewPlaceholders.font }}
            >
                <div className="mock-phone-scrollable-content desktop-no-inner-scroll">
                    <MainSection />
                    <AboutSection />
                    <WorkSection />
                    <ServicesSection />
                    <ReviewsSection />
                    {showContactSection && (previewEmail || previewPhone) ? (
                        <>
                            <p className="mock-section-title">Contact Details</p>
                            <div style={{ marginBottom: 20 }} className="mock-contact-details">
                                <div className="mock-contact-item">
                                    <p className="mock-contact-label">Email:</p>
                                    <p className="mock-contact-value">{previewEmail}</p>
                                </div>
                                <div className="mock-contact-item">
                                    <p className="mock-contact-label">Phone:</p>
                                    <p className="mock-contact-value">{previewPhone}</p>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
