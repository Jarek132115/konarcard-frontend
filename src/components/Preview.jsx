import React, { useEffect, useMemo, useRef, useState } from "react";
import { previewPlaceholders } from "../store/businessCardStore";

// use the same svg assets as in the editor
import FacebookIcon from "../assets/icons/icons8-facebook.svg";
import InstagramIcon from "../assets/icons/icons8-instagram.svg";
import LinkedInIcon from "../assets/icons/icons8-linkedin.svg";
import XIcon from "../assets/icons/icons8-x.svg";
import TikTokIcon from "../assets/icons/icons8-tiktok.svg";

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
    columnScrollStyle,
}) {
    const [previewOpen, setPreviewOpen] = useState(true);

    const previewWorkCarouselRef = useRef(null);
    const previewServicesCarouselRef = useRef(null);
    const previewReviewsCarouselRef = useRef(null);
    const mpWrapRef = useRef(null);

    const shouldShowPlaceholders = !hasSavedData;
    const isDarkMode = state.pageTheme === "dark";

    const ctaStyle = {
        backgroundColor: state.buttonBgColor || "#F47629",
        color: state.buttonTextColor === "black" ? "#000000" : "#FFFFFF",
    };
    const contentAlign = { textAlign: state.textAlignment || "left" };

    const defaultOrder = ["main", "about", "work", "services", "reviews", "contact"];
    const sectionOrder =
        (Array.isArray(state.sectionOrder) && state.sectionOrder.length && state.sectionOrder) ||
        defaultOrder;

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
    const previewAvatarSrc =
        state.avatar ?? (shouldShowPlaceholders ? previewPlaceholders.avatar : null);

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

    // Smooth open/close of mobile preview — WITHOUT capping height after open
    useEffect(() => {
        if (!isMobile) return;
        const el = mpWrapRef.current;
        if (!el) return;

        let ro; // ResizeObserver
        const onEnd = (e) => {
            if (e.propertyName !== "max-height") return;
            if (previewOpen) {
                // unlock after the open transition so content can grow naturally
                el.style.maxHeight = "none";
            }
            el.removeEventListener("transitionend", onEnd);
        };

        // ensure predictable base styles
        el.style.willChange = "max-height, opacity, transform";
        el.style.overflow = "hidden";

        if (previewOpen) {
            // measure natural height
            el.style.maxHeight = "none";
            const target = el.scrollHeight;

            // set to 0 to start the animation
            el.style.opacity = "0";
            el.style.transform = "scale(.98)";
            el.style.maxHeight = "0px";

            requestAnimationFrame(() => {
                el.style.opacity = "1";
                el.style.transform = "scale(1)";
                el.style.maxHeight = `${target}px`;
            });

            el.addEventListener("transitionend", onEnd);

            // while opening, keep adjusting to late content (images/fonts)
            if ("ResizeObserver" in window) {
                ro = new ResizeObserver(() => {
                    if (el.style.maxHeight !== "none") {
                        el.style.maxHeight = `${el.scrollHeight}px`;
                    }
                });
                ro.observe(el);
            }
        } else {
            // closing: animate from current natural height to 0
            const current = el.scrollHeight; // if unlocked (none), this still returns the pixels
            el.style.maxHeight = `${current}px`;
            requestAnimationFrame(() => {
                el.style.opacity = "0";
                el.style.transform = "scale(.98)";
                el.style.maxHeight = "0px";
            });
        }

        return () => {
            if (ro) ro.disconnect();
            el.removeEventListener("transitionend", onEnd);
        };
    }, [
        isMobile,
        previewOpen,

        // re-run the effect if content structure changes while collapsed/opening
        state,
        servicesDisplayMode,
        reviewsDisplayMode,
        aboutMeLayout,
    ]);

    const scrollCarousel = (ref, direction) => {
        const el = ref?.current;
        if (!el) return;
        const amount = el.clientWidth * 0.9;
        el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    };

    // icons inside the Contact card
    const ContactSocials = () => {
        const links = [
            { key: "facebook_url", label: "Facebook", href: state.facebook_url, icon: FacebookIcon },
            { key: "instagram_url", label: "Instagram", href: state.instagram_url, icon: InstagramIcon },
            { key: "linkedin_url", label: "LinkedIn", href: state.linkedin_url, icon: LinkedInIcon },
            { key: "x_url", label: "X", href: state.x_url, icon: XIcon },
            { key: "tiktok_url", label: "TikTok", href: state.tiktok_url, icon: TikTokIcon },
        ].filter((x) => typeof x.href === "string" && x.href.trim());

        if (!links.length) return null;

        return (
            <div className="mock-contact-socials">
                {links.map((l) => (
                    <a
                        key={l.key}
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={l.label}
                        className="contact-social-chip"
                    >
                        <img src={l.icon} alt="" className="contact-social-glyph" />
                    </a>
                ))}
            </div>
        );
    };

    const WorkSection = () =>
        showWorkSection && previewWorkImages.length > 0 ? (
            <>
                <p className="mock-section-title">My Work</p>
                <div className="work-preview-row-container" style={contentAlign}>
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
                    <div
                        ref={previewWorkCarouselRef}
                        className={`mock-work-gallery ${state.workDisplayMode}`}
                        style={contentAlign}
                    >
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
                <div className="work-preview-row-container" style={contentAlign}>
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
                    <div
                        ref={previewServicesCarouselRef}
                        className={`mock-services-list ${servicesDisplayMode}`}
                        style={contentAlign}
                    >
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
                <div className="work-preview-row-container" style={contentAlign}>
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
                    <div
                        ref={previewReviewsCarouselRef}
                        className={`mock-reviews-list ${reviewsDisplayMode}`}
                        style={contentAlign}
                    >
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
                {/* keep layout fixed; no contentAlign here */}
                <div className="mock-contact-details">
                    <div className="mock-contact-item">
                        <p className="mock-contact-label">Email:</p>
                        <p className="mock-contact-value">{previewEmail}</p>
                    </div>
                    <div className="mock-contact-item">
                        <p className="mock-contact-label">Phone:</p>
                        <p className="mock-contact-value">{previewPhone}</p>
                    </div>

                    {/* social icons inside the same white card */}
                    <ContactSocials />
                </div>
            </>
        ) : null;

    const MainSection = () =>
        showMainSection ? (
            <>
                {(shouldShowPlaceholders || !!state.coverPhoto) && (
                    <img src={previewCoverPhotoSrc} alt="Cover" className="mock-cover" />
                )}
                {/* headings honor the chosen alignment */}
                <h2 className="mock-title" style={contentAlign}>
                    {state.mainHeading ||
                        (!hasSavedData ? previewPlaceholders.main_heading : "Your Main Heading Here")}
                </h2>
                <p className="mock-subtitle" style={contentAlign}>
                    {state.subHeading ||
                        (!hasSavedData ? previewPlaceholders.sub_heading : "Your Tagline or Slogan Goes Here")}
                </p>
                {(shouldShowPlaceholders || hasExchangeContact) && (
                    <button type="button" className="mock-button" style={ctaStyle}>
                        Save My Number
                    </button>
                )}
            </>
        ) : null;

    const AboutSection = () =>
        showAboutMeSection &&
            (previewFullName || previewJobTitle || previewBio || previewAvatarSrc) ? (
            <>
                <p className="mock-section-title">About me</p>
                {/* name/title unaffected by alignment; bio follows it */}
                <div className={`mock-about-container ${aboutMeLayout}`}>
                    <div className="mock-about-content-group">
                        <div className="mock-about-header-group">
                            {previewAvatarSrc && <img src={previewAvatarSrc} alt="Avatar" className="mock-avatar" />}
                            <div>
                                <p className="mock-profile-name">{previewFullName}</p>
                                <p className="mock-profile-role">{previewJobTitle}</p>
                            </div>
                        </div>
                        <p className="mock-bio-text" style={contentAlign}>
                            {previewBio}
                        </p>
                    </div>
                </div>
            </>
        ) : null;

    const sectionMap = {
        main: <MainSection key="main" />,
        about: <AboutSection key="about" />,
        work: <WorkSection key="work" />,
        services: <ServicesSection key="services" />,
        reviews: <ReviewsSection key="reviews" />,
        contact: <ContactSection key="contact" />,
    };

    if (isMobile) {
        return (
            <div className="preview-scope myprofile-preview-wrapper" style={columnScrollStyle}>
                <div
                    className={`myprofile-preview ${isDarkMode ? "dark" : ""}`}
                    style={{ fontFamily: state.font || previewPlaceholders.font }}
                >
                    <div
                        className={`mp-toolbar ${previewOpen ? "is-open" : "is-collapsed"}`}
                        role="tablist"
                        aria-label="Preview controls"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={previewOpen}
                            className={`mp-tab ${previewOpen ? "active" : ""}`}
                            onClick={() => setPreviewOpen((s) => !s)}
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
                        >
                            Visit Page
                        </a>
                    </div>

                    <div
                        className={`mp-preview-wrap ${previewOpen ? "open" : "closed"}`}
                        ref={mpWrapRef}
                    >
                        <div className="mock-phone mobile-preview">
                            <div className="mock-phone-scrollable-content">
                                {sectionOrder.map((k) => sectionMap[k]).filter(Boolean)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="preview-scope myprofile-preview-wrapper" style={columnScrollStyle}>
            <div
                className={`myprofile-preview ${isDarkMode ? "dark" : ""}`}
                style={{ fontFamily: state.font || previewPlaceholders.font }}
            >
                <div className="mock-phone">
                    <div className="mock-phone-scrollable-content desktop-no-inner-scroll">
                        {sectionOrder.map((k) => sectionMap[k]).filter(Boolean)}
                    </div>
                </div>
            </div>
        </div>
    );
}
