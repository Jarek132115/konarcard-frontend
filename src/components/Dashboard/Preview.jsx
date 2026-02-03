// src/components/Preview.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { previewPlaceholders } from "../../store/businessCardStore";

// social icons
import FacebookIcon from "../assets/icons/icons8-facebook.svg";
import InstagramIcon from "../assets/icons/icons8-instagram.svg";
import LinkedInIcon from "../assets/icons/icons8-linkedin.svg";
import XIcon from "../assets/icons/icons8-x.svg";
import TikTokIcon from "../assets/icons/icons8-tiktok.svg";

const asArray = (v) => (Array.isArray(v) ? v : []);
const asString = (v) => (typeof v === "string" ? v : "");

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

    // ✅ Guard state so Preview can never crash during loading
    const s = state || {};

    const shouldShowPlaceholders = !hasSavedData;
    const isDarkMode = (s.pageTheme || s.page_theme || "light") === "dark";

    // ---------------------------
    // ✅ Templates (background colour demo)
    // Supports both snake_case and camelCase
    // ---------------------------
    const templateIdRaw = (s.template_id || s.templateId || "template-1").toString();
    const templateId = ["template-1", "template-2", "template-3", "template-4", "template-5"].includes(templateIdRaw)
        ? templateIdRaw
        : "template-1";

    const templateBgMap = {
        "template-1": "#ffdddd",
        "template-2": "#dde9ff",
        "template-3": "#fff6cc",
        "template-4": "#ddffdd",
        "template-5": "#f0ddff",
    };

    const templateBg = templateBgMap[templateId] || templateBgMap["template-1"];
    const phoneBgStyle = isDarkMode
        ? { backgroundColor: "rgba(20,20,20,0.95)" }
        : { backgroundColor: templateBg };

    const ctaStyle = {
        backgroundColor: s.buttonBgColor || s.button_bg_color || "#F47629",
        color: (s.buttonTextColor || s.button_text_color) === "black" ? "#000000" : "#FFFFFF",
    };
    const contentAlign = { textAlign: s.textAlignment || s.text_alignment || "left" };

    // ---------------------------
    // Section order (sanitized)
    // ---------------------------
    const defaultOrder = ["main", "about", "work", "services", "reviews", "contact"];

    const sanitizeOrder = (order) => {
        const KNOWN = new Set(defaultOrder);
        const seen = new Set();
        const cleaned = (Array.isArray(order) ? order : defaultOrder)
            .filter((k) => KNOWN.has(k))
            .filter((k) => (seen.has(k) ? false : seen.add(k)));
        const missing = defaultOrder.filter((k) => !cleaned.includes(k));
        return [...cleaned, ...missing];
    };

    // ✅ Supports both state.sectionOrder and state.section_order
    const sectionOrder = sanitizeOrder(s.sectionOrder || s.section_order);

    // ---------------------------
    // Preview values
    // ---------------------------
    const ph = previewPlaceholders || {};

    const previewFullName = asString(s.full_name) || (shouldShowPlaceholders ? asString(ph.full_name) : "");
    const previewJobTitle = asString(s.job_title) || (shouldShowPlaceholders ? asString(ph.job_title) : "");
    const previewBio = asString(s.bio) || (shouldShowPlaceholders ? asString(ph.bio) : "");
    const previewEmail = asString(s.contact_email) || (shouldShowPlaceholders ? asString(ph.contact_email) : "");
    const previewPhone = asString(s.phone_number) || (shouldShowPlaceholders ? asString(ph.phone_number) : "");

    const previewCoverPhotoSrc =
        s.coverPhoto ?? s.cover_photo ?? (shouldShowPlaceholders ? ph.coverPhoto : "");

    const previewAvatarSrc =
        s.avatar ?? (shouldShowPlaceholders ? ph.avatar : null);

    // ✅ ALWAYS return arrays (never undefined)
    const previewWorkImages = useMemo(() => {
        const fromState = asArray(s.workImages || s.works);
        if (fromState.length > 0) return fromState;

        const fromPlaceholders = asArray(ph.workImages || ph.works);
        return shouldShowPlaceholders ? fromPlaceholders : [];
    }, [s.workImages, s.works, shouldShowPlaceholders, ph.workImages, ph.works]);

    const servicesForPreview = useMemo(() => {
        const fromState = asArray(s.services);
        if (fromState.length > 0) return fromState;

        const fromPlaceholders = asArray(ph.services);
        return shouldShowPlaceholders ? fromPlaceholders : [];
    }, [s.services, shouldShowPlaceholders, ph.services]);

    const reviewsForPreview = useMemo(() => {
        const fromState = asArray(s.reviews);
        if (fromState.length > 0) return fromState;

        const fromPlaceholders = asArray(ph.reviews);
        return shouldShowPlaceholders ? fromPlaceholders : [];
    }, [s.reviews, shouldShowPlaceholders, ph.reviews]);

    /** Smooth open/close on mobile without re-running for every content change */
    useEffect(() => {
        if (!isMobile) return;
        const el = mpWrapRef.current;
        if (!el) return;

        el.style.overflow = "hidden";
        el.style.willChange = "max-height, opacity, transform";

        const handleEnd = (e) => {
            if (e.propertyName !== "max-height") return;
            if (previewOpen) el.style.maxHeight = "none";
            el.removeEventListener("transitionend", handleEnd);
        };

        if (previewOpen) {
            el.style.maxHeight = "0px";
            el.style.opacity = "0";
            el.style.transform = "scale(.98)";

            const target = el.scrollHeight;

            requestAnimationFrame(() => {
                el.style.maxHeight = `${target}px`;
                el.style.opacity = "1";
                el.style.transform = "scale(1)";
            });

            el.addEventListener("transitionend", handleEnd);
        } else {
            const current = el.scrollHeight;
            el.style.maxHeight = `${current}px`;
            void el.offsetHeight;
            el.style.maxHeight = "0px";
            el.style.opacity = "0";
            el.style.transform = "scale(.98)";
        }

        return () => el.removeEventListener("transitionend", handleEnd);
    }, [isMobile, previewOpen]);

    const scrollCarousel = (ref, direction) => {
        const el = ref?.current;
        if (!el) return;
        const amount = el.clientWidth * 0.9;
        el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    };

    // Normalize display modes
    const workMode = (s.workDisplayMode || "list").toLowerCase(); // list | grid
    const servicesMode = (servicesDisplayMode || "list").toLowerCase(); // list | cards
    const reviewsMode = (reviewsDisplayMode || "list").toLowerCase(); // list | cards

    const ContactSocials = () => {
        const links = [
            { key: "facebook_url", label: "Facebook", href: s.facebook_url, icon: FacebookIcon },
            { key: "instagram_url", label: "Instagram", href: s.instagram_url, icon: InstagramIcon },
            { key: "linkedin_url", label: "LinkedIn", href: s.linkedin_url, icon: LinkedInIcon },
            { key: "x_url", label: "X", href: s.x_url, icon: XIcon },
            { key: "tiktok_url", label: "TikTok", href: s.tiktok_url, icon: TikTokIcon },
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
                    <div
                        ref={previewWorkCarouselRef}
                        className={`mock-work-gallery ${workMode}`}
                        style={contentAlign}
                    >
                        {previewWorkImages.map((item, i) => (
                            <div key={i} className="mock-work-image-item-wrapper">
                                <img
                                    src={item?.preview || item}
                                    alt={`work-${i}`}
                                    className="mock-work-image-item"
                                />
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
                    <div
                        ref={previewServicesCarouselRef}
                        className={`mock-services-list ${servicesMode}`}
                        style={contentAlign}
                    >
                        {servicesForPreview.map((sv, i) => (
                            <div key={i} className="mock-service-item">
                                <p className="mock-service-name">{sv?.name}</p>
                                <span className="mock-service-price">{sv?.price}</span>
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
                    <div
                        ref={previewReviewsCarouselRef}
                        className={`mock-reviews-list ${reviewsMode}`}
                        style={contentAlign}
                    >
                        {reviewsForPreview.map((r, i) => (
                            <div key={i} className="mock-review-card">
                                <div className="mock-star-rating">
                                    {Array(r?.rating || 0)
                                        .fill(null)
                                        .map((_, idx) => (
                                            <span key={`f-${idx}`}>★</span>
                                        ))}
                                    {Array(Math.max(0, 5 - (r?.rating || 0)))
                                        .fill(null)
                                        .map((_, idx) => (
                                            <span key={`e-${idx}`} className="empty-star">
                                                ★
                                            </span>
                                        ))}
                                </div>
                                <p className="mock-review-text">{`"${r?.text || ""}"`}</p>
                                <p className="mock-reviewer-name">{r?.name}</p>
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
                    {previewEmail ? (
                        <div className="mock-contact-item">
                            <p className="mock-contact-label">Email:</p>
                            <p className="mock-contact-value">{previewEmail}</p>
                        </div>
                    ) : null}

                    {previewPhone ? (
                        <div className="mock-contact-item">
                            <p className="mock-contact-label">Phone:</p>
                            <p className="mock-contact-value">{previewPhone}</p>
                        </div>
                    ) : null}

                    <ContactSocials />
                </div>
            </>
        ) : null;

    const MainSection = () =>
        showMainSection ? (
            <>
                {(shouldShowPlaceholders || !!s.coverPhoto || !!s.cover_photo) && (
                    <img src={previewCoverPhotoSrc} alt="Cover" className="mock-cover" />
                )}

                <h2 className="mock-title" style={contentAlign}>
                    {s.mainHeading ||
                        s.main_heading ||
                        (!hasSavedData ? ph.main_heading : "Your Main Heading Here")}
                </h2>

                <p className="mock-subtitle" style={contentAlign}>
                    {s.subHeading ||
                        s.sub_heading ||
                        (!hasSavedData ? ph.sub_heading : "Your Tagline or Slogan Goes Here")}
                </p>

                {(shouldShowPlaceholders || hasExchangeContact) && (
                    <button type="button" className="mock-button" style={ctaStyle}>
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
                            {previewAvatarSrc ? (
                                <img src={previewAvatarSrc} alt="Avatar" className="mock-avatar" />
                            ) : null}

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

    const rootClasses = `myprofile-preview ${isDarkMode ? "dark" : ""} template-${templateId}`;
    const fontFamily = s.font || s.style || ph.font;

    if (isMobile) {
        return (
            <div className="preview-scope myprofile-preview-wrapper" style={columnScrollStyle}>
                <div className={rootClasses} style={{ fontFamily }}>
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
                            onClick={() => setPreviewOpen((x) => !x)}
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

                    <div className={`mp-preview-wrap ${previewOpen ? "open" : "closed"}`} ref={mpWrapRef}>
                        <div className="mock-phone mobile-preview" style={phoneBgStyle}>
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
            <div className={rootClasses} style={{ fontFamily }}>
                <div className="mock-phone" style={phoneBgStyle}>
                    <div className="mock-phone-scrollable-content desktop-no-inner-scroll">
                        {sectionOrder.map((k) => sectionMap[k]).filter(Boolean)}
                    </div>
                </div>
            </div>
        </div>
    );
}
