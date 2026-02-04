import React, { useRef } from "react";

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

export default function Template1({ vm }) {
    const workCarouselRef = useRef(null);
    const servicesCarouselRef = useRef(null);
    const reviewsCarouselRef = useRef(null);

    const scrollCarousel = (ref, dir) => {
        if (!ref.current || !ref.current.children.length) return;
        const el = ref.current;
        const w = el.children[0].offsetWidth;
        const max = el.scrollWidth - el.offsetWidth;
        let next = dir === "left" ? el.scrollLeft - w : el.scrollLeft + w;
        if (next < 0) next = max;
        if (next >= max) next = 0;
        el.scrollTo({ left: next, behavior: "smooth" });
    };

    const {
        themeStyles,
        sectionOrder,

        // toggles decided already
        showMainSection,
        showAboutMeSection,
        showWorkSection,
        showServicesSection,
        showReviewsSection,
        showContactSection,

        // content
        cover,
        avatar,
        mainHeading,
        subHeading,
        fullName,
        jobTitle,
        bio,
        works,
        services,
        reviews,
        email,
        phone,
        hasContact,
        socialLinks,

        // display
        contentAlign,
        ctaStyle,
        flexJustify,
        aboutLayout,
        workMode,
        servicesMode,
        reviewsMode,

        // ✅ actions (new names)
        onSaveMyNumber,
        onOpenExchangeContact,
    } = vm;

    const MainSection = () =>
        showMainSection ? (
            <>
                {nonEmpty(cover) && <img src={cover} alt="Cover" className="landing-cover-photo" />}
                {nonEmpty(mainHeading) && (
                    <h2 className="landing-main-heading" style={contentAlign}>
                        {mainHeading}
                    </h2>
                )}
                {nonEmpty(subHeading) && (
                    <p className="landing-sub-heading" style={contentAlign}>
                        {subHeading}
                    </p>
                )}

                {hasContact && (
                    <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                        {/* ✅ Existing button = Save vCard */}
                        <button
                            type="button"
                            onClick={onSaveMyNumber}
                            className="landing-action-button"
                            style={ctaStyle}
                        >
                            Save My Number
                        </button>

                        {/* ✅ NEW button under it = Exchange contact modal */}
                        <button
                            type="button"
                            onClick={onOpenExchangeContact}
                            className="landing-action-button"
                            style={ctaStyle}
                        >
                            Exchange Contact
                        </button>
                    </div>
                )}
            </>
        ) : null;

    const AboutSection = () =>
        showAboutMeSection ? (
            <>
                <p className="landing-section-title">About Me</p>
                <div className={`landing-about-section ${aboutLayout}`}>
                    {nonEmpty(avatar) && <img src={avatar} alt="Avatar" className="landing-avatar" />}
                    <div className="landing-about-header">
                        {nonEmpty(fullName) && <p className="landing-profile-name">{fullName}</p>}
                        {nonEmpty(jobTitle) && <p className="landing-profile-role">{jobTitle}</p>}
                    </div>
                    {nonEmpty(bio) && (
                        <p className="landing-bio-text" style={contentAlign}>
                            {bio}
                        </p>
                    )}
                </div>
            </>
        ) : null;

    const WorkSection = () =>
        showWorkSection ? (
            <>
                <p className="landing-section-title">My Work</p>

                {(workMode === "list" || workMode === "grid") && (
                    <div className={`landing-work-gallery ${workMode}`}>
                        {works.map((url, i) => (
                            <img key={i} src={url} alt={`work-${i}`} className="landing-work-image" />
                        ))}
                    </div>
                )}

                {workMode === "carousel" && (
                    <div className="user-carousel-container">
                        <div className="user-carousel-nav-buttons">
                            <button
                                type="button"
                                className="user-carousel-nav-button left-arrow"
                                onClick={() => scrollCarousel(workCarouselRef, "left")}
                            >
                                &#9664;
                            </button>
                            <button
                                type="button"
                                className="user-carousel-nav-button right-arrow"
                                onClick={() => scrollCarousel(workCarouselRef, "right")}
                            >
                                &#9654;
                            </button>
                        </div>
                        <div ref={workCarouselRef} className="user-work-gallery-carousel">
                            {works.map((url, i) => (
                                <img key={i} src={url} alt={`work-${i}`} className="landing-work-image" />
                            ))}
                        </div>
                    </div>
                )}
            </>
        ) : null;

    const ServicesSection = () =>
        showServicesSection ? (
            <>
                <p className="landing-section-title">My Services</p>
                <div className="user-carousel-container">
                    {servicesMode === "carousel" && (
                        <div className="user-carousel-nav-buttons">
                            <button
                                type="button"
                                className="user-carousel-nav-button left-arrow"
                                onClick={() => scrollCarousel(servicesCarouselRef, "left")}
                            >
                                &#9664;
                            </button>
                            <button
                                type="button"
                                className="user-carousel-nav-button right-arrow"
                                onClick={() => scrollCarousel(servicesCarouselRef, "right")}
                            >
                                &#9654;
                            </button>
                        </div>
                    )}
                    <div
                        ref={servicesCarouselRef}
                        className={`user-services-list-carousel ${servicesMode === "carousel" ? "" : "list"}`}
                        style={contentAlign}
                    >
                        {services.map((s, i) => (
                            <div key={i} className="landing-service-item">
                                {nonEmpty(s.name) && <p className="landing-service-name">{s.name}</p>}
                                {nonEmpty(s.price) && <span className="landing-service-price">{s.price}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </>
        ) : null;

    const ReviewsSection = () =>
        showReviewsSection ? (
            <>
                <p className="landing-section-title">Reviews</p>
                <div className="user-carousel-container">
                    {reviewsMode === "carousel" && (
                        <div className="user-carousel-nav-buttons">
                            <button
                                type="button"
                                className="user-carousel-nav-button left-arrow"
                                onClick={() => scrollCarousel(reviewsCarouselRef, "left")}
                            >
                                &#9664;
                            </button>
                            <button
                                type="button"
                                className="user-carousel-nav-button right-arrow"
                                onClick={() => scrollCarousel(reviewsCarouselRef, "right")}
                            >
                                &#9654;
                            </button>
                        </div>
                    )}
                    <div
                        ref={reviewsCarouselRef}
                        className={`user-reviews-list-carousel ${reviewsMode === "carousel" ? "" : "list"}`}
                        style={contentAlign}
                    >
                        {reviews.map((r, i) => (
                            <div key={i} className="landing-review-card" style={contentAlign}>
                                <div className="landing-star-rating" style={{ justifyContent: flexJustify }}>
                                    {Array(r.rating || 0)
                                        .fill()
                                        .map((_, j) => (
                                            <span key={`f-${j}`}>★</span>
                                        ))}
                                    {Array(Math.max(0, 5 - (r.rating || 0)))
                                        .fill()
                                        .map((_, j) => (
                                            <span key={`e-${j}`} className="empty-star">
                                                ★
                                            </span>
                                        ))}
                                </div>
                                {nonEmpty(r.text) && <p className="landing-review-text">{`"${r.text}"`}</p>}
                                {nonEmpty(r.name) && <p className="landing-reviewer-name">{r.name}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </>
        ) : null;

    const ContactSection = () =>
        showContactSection ? (
            <>
                <p className="landing-section-title">Contact Details</p>
                <div className="landing-contact-details">
                    {nonEmpty(email) && (
                        <div className="landing-contact-item">
                            <p className="landing-contact-label">Email:</p>
                            <p className="landing-contact-value">{email}</p>
                        </div>
                    )}
                    {nonEmpty(phone) && (
                        <div className="landing-contact-item">
                            <p className="landing-contact-label">Phone:</p>
                            <p className="landing-contact-value">{phone}</p>
                        </div>
                    )}
                    {(socialLinks?.length || 0) > 0 && (
                        <div className="landing-contact-socials" aria-label="Social links">
                            {socialLinks.map((s) => (
                                <a
                                    key={s.key}
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="landing-contact-social-chip"
                                    aria-label={s.label}
                                >
                                    <img src={s.icon} alt="" className="landing-contact-social-glyph" />
                                </a>
                            ))}
                        </div>
                    )}
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

    return (
        <div className="user-landing-page template-1" style={themeStyles}>
            {sectionOrder.map((k) => sectionMap[k]).filter(Boolean)}
        </div>
    );
}
