// src/pages/UserPage/UserPage.jsx
import React, { useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";

const PLACEHOLDER_HINTS = [
    "placeholder",
    "sample",
    "demo",
    "stock",
    "default",
    "template",
    "konar",        // your brand stock renders
    "card-mock",    // common mock names
];

const looksLikePlaceholderUrl = (url = "") =>
    typeof url === "string" &&
    PLACEHOLDER_HINTS.some((hint) => url.toLowerCase().includes(hint));

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

const filterRealImages = (arr) =>
    (Array.isArray(arr) ? arr : []).filter(
        (u) => nonEmpty(u) && !looksLikePlaceholderUrl(u)
    );

const filterRealServices = (arr) =>
    (Array.isArray(arr) ? arr : []).filter(
        (s) => s && (nonEmpty(s.name) || nonEmpty(s.price))
    );

const filterRealReviews = (arr) =>
    (Array.isArray(arr) ? arr : []).filter(
        (r) => r && (nonEmpty(r.name) || nonEmpty(r.text) || (r.rating ?? 0) > 0)
    );

const UserPage = () => {
    const { username } = useParams();

    // Refs for carousels
    const workCarouselRef = useRef(null);
    const servicesCarouselRef = useRef(null);
    const reviewsCarouselRef = useRef(null);

    const { data: businessCard, isLoading, isError, error } = useQuery({
        queryKey: ["public-business-card", username],
        queryFn: async () => {
            const response = await api.get(`/api/business-card/by_username/${username}`);
            return response.data;
        },
        enabled: !!username,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: 1,
    });

    // Carousel scrolling
    const scrollCarousel = (ref, direction) => {
        if (ref.current && ref.current.children.length > 0) {
            const carousel = ref.current;
            const itemWidth = carousel.children[0].offsetWidth;
            const currentScroll = carousel.scrollLeft;
            const maxScroll = carousel.scrollWidth - carousel.offsetWidth;
            let next = direction === "left" ? currentScroll - itemWidth : currentScroll + itemWidth;
            if (next < 0) next = maxScroll;
            if (next >= maxScroll) next = 0;
            carousel.scrollTo({ left: next, behavior: "smooth" });
        }
    };

    if (isLoading) {
        return (
            <div className="user-landing-page" style={centerPage}>
                <p>Loading business card...</p>
            </div>
        );
    }

    if (isError) {
        console.error("Error fetching business card:", error);
        return unavailable(username);
    }

    if (!businessCard) {
        return (
            <div className="user-landing-page" style={centerPage}>
                <p>No business card found for username “{username}”.</p>
            </div>
        );
    }

    const hasActiveSubscription = !!businessCard.isSubscribed;
    const isTrialActive =
        businessCard.trialExpires && new Date(businessCard.trialExpires) > new Date();
    const isProfileActive = hasActiveSubscription || isTrialActive;

    if (!isProfileActive) return unavailable(username);

    // ---------- Derive ONLY real, user-filled content ----------
    const realCover = nonEmpty(businessCard.cover_photo) && !looksLikePlaceholderUrl(businessCard.cover_photo);
    const realMainHeading = nonEmpty(businessCard.main_heading);
    const realSubHeading = nonEmpty(businessCard.sub_heading);

    const realAvatar = nonEmpty(businessCard.avatar) && !looksLikePlaceholderUrl(businessCard.avatar);
    const realFullName = nonEmpty(businessCard.full_name);
    const realJobTitle = nonEmpty(businessCard.job_title);
    const realBio = nonEmpty(businessCard.bio);

    const works = filterRealImages(businessCard.works);
    const services = filterRealServices(businessCard.services);
    const reviews = filterRealReviews(businessCard.reviews);

    const hasContact = nonEmpty(businessCard.contact_email) || nonEmpty(businessCard.phone_number);

    const showMainSection = businessCard.show_main_section !== false && (realCover || realMainHeading || realSubHeading || hasContact);
    const showAboutMeSection = businessCard.show_about_me_section !== false && (realAvatar || realFullName || realJobTitle || realBio);
    const showWorkSection = businessCard.show_work_section !== false && works.length > 0;
    const showServicesSection = businessCard.show_services_section !== false && services.length > 0;
    const showReviewsSection = businessCard.show_reviews_section !== false && reviews.length > 0;
    const showContactSection = businessCard.show_contact_section !== false && hasContact;

    const nothingToShow =
        !showMainSection &&
        !showAboutMeSection &&
        !showWorkSection &&
        !showServicesSection &&
        !showReviewsSection &&
        !showContactSection;

    const aboutMeLayout = businessCard.about_me_layout || "side-by-side"; // 'side-by-side' | 'stacked'
    const workDisplayMode = businessCard.work_display_mode || "list";      // 'list' | 'grid' | 'carousel'
    const servicesDisplayMode = businessCard.services_display_mode || "list";
    const reviewsDisplayMode = businessCard.reviews_display_mode || "list";

    const themeStyles = {
        backgroundColor: businessCard.page_theme === "dark" ? "#1F1F1F" : "#FFFFFF",
        color: businessCard.page_theme === "dark" ? "#FFFFFF" : "#000000",
        fontFamily: businessCard.style || "Inter",
    };

    const handleExchangeContact = () => {
        if (!hasContact) return;
        const {
            full_name,
            job_title,
            business_card_name,
            bio,
            contact_email,
            phone_number,
            publicProfileUrl,
        } = businessCard;
        const landingPageUrl = publicProfileUrl || `${window.location.origin}/u/${username}`;

        const nameParts = (full_name || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        const middleNames = nameParts.slice(1, -1).join(" ") || "";

        let vCard = "BEGIN:VCARD\nVERSION:3.0\n";
        vCard += `FN:${full_name || ""}\n`;
        vCard += `N:${lastName};${firstName};${middleNames};;\n`;
        if (business_card_name) vCard += `ORG:${business_card_name}\n`;
        if (job_title) vCard += `TITLE:${job_title}\n`;
        if (phone_number) vCard += `TEL;TYPE=CELL,VOICE:${phone_number}\n`;
        if (contact_email) vCard += `EMAIL;TYPE=PREF,INTERNET:${contact_email}\n`;
        if (landingPageUrl) vCard += `URL:${landingPageUrl}\n`;
        if (bio) vCard += `NOTE:${bio.replace(/\n/g, "\\n")}\n`;
        vCard += "END:VCARD\n";

        const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(full_name || username || "contact").replace(/\s/g, "_")}.vcf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (nothingToShow) {
        return (
            <div className="user-landing-page" style={{ ...themeStyles, ...centerPage, padding: 24 }}>
                <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>This profile isn’t set up yet</h2>
                    <p style={{ marginTop: 10, opacity: 0.8 }}>
                        @{username} hasn’t published any content here yet.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="user-landing-page" style={themeStyles}>
            {/* Main Section */}
            {showMainSection && (
                <>
                    {realCover && <img src={businessCard.cover_photo} alt="Cover" className="landing-cover-photo" />}
                    {realMainHeading && <h2 className="landing-main-heading">{businessCard.main_heading}</h2>}
                    {realSubHeading && <p className="landing-sub-heading">{businessCard.sub_heading}</p>}
                    {hasContact && (
                        <button type="button" onClick={handleExchangeContact} className="landing-action-button">
                            Save My Number
                        </button>
                    )}
                </>
            )}

            {/* About Me Section */}
            {showAboutMeSection && (
                <>
                    <p className="landing-section-title">About Me</p>
                    <div className={`landing-about-section ${aboutMeLayout}`}>
                        {realAvatar && <img src={businessCard.avatar} alt="Avatar" className="landing-avatar" />}
                        <div className="landing-about-header">
                            {realFullName && <p className="landing-profile-name">{businessCard.full_name}</p>}
                            {realJobTitle && <p className="landing-profile-role">{businessCard.job_title}</p>}
                        </div>
                        {realBio && <p className="landing-bio-text">{businessCard.bio}</p>}
                    </div>
                </>
            )}

            {/* My Work Section */}
            {showWorkSection && (
                <>
                    <p className="landing-section-title">My Work</p>
                    {(workDisplayMode === "list" || workDisplayMode === "grid") && (
                        <div className={`landing-work-gallery ${workDisplayMode}`}>
                            {works.map((url, i) => (
                                <img key={i} src={url} alt={`work-${i}`} className="landing-work-image" />
                            ))}
                        </div>
                    )}
                    {workDisplayMode === "carousel" && (
                        <div className="user-carousel-container">
                            <div className="user-carousel-nav-buttons">
                                <button type="button" className="user-carousel-nav-button left-arrow" onClick={() => scrollCarousel(workCarouselRef, "left")}>
                                    &#9664;
                                </button>
                                <button type="button" className="user-carousel-nav-button right-arrow" onClick={() => scrollCarousel(workCarouselRef, "right")}>
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
            )}

            {/* My Services Section */}
            {showServicesSection && (
                <>
                    <p className="landing-section-title">My Services</p>
                    <div className="user-carousel-container">
                        {servicesDisplayMode === "carousel" && (
                            <div className="user-carousel-nav-buttons">
                                <button type="button" className="user-carousel-nav-button left-arrow" onClick={() => scrollCarousel(servicesCarouselRef, "left")}>
                                    &#9664;
                                </button>
                                <button type="button" className="user-carousel-nav-button right-arrow" onClick={() => scrollCarousel(servicesCarouselRef, "right")}>
                                    &#9654;
                                </button>
                            </div>
                        )}
                        <div ref={servicesCarouselRef} className={`user-services-list-carousel ${servicesDisplayMode === "carousel" ? "" : "list"}`}>
                            {services.map((s, i) => (
                                <div key={i} className="landing-service-item">
                                    {nonEmpty(s.name) && <p className="landing-service-name">{s.name}</p>}
                                    {nonEmpty(s.price) && <span className="landing-service-price">{s.price}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Reviews Section */}
            {showReviewsSection && (
                <>
                    <p className="landing-section-title">Reviews</p>
                    <div className="user-carousel-container">
                        {reviewsDisplayMode === "carousel" && (
                            <div className="user-carousel-nav-buttons">
                                <button type="button" className="user-carousel-nav-button left-arrow" onClick={() => scrollCarousel(reviewsCarouselRef, "left")}>
                                    &#9664;
                                </button>
                                <button type="button" className="user-carousel-nav-button right-arrow" onClick={() => scrollCarousel(reviewsCarouselRef, "right")}>
                                    &#9654;
                                </button>
                            </div>
                        )}
                        <div ref={reviewsCarouselRef} className={`user-reviews-list-carousel ${reviewsDisplayMode === "carousel" ? "" : "list"}`}>
                            {reviews.map((r, i) => (
                                <div key={i} className="landing-review-card">
                                    <div className="landing-star-rating">
                                        {Array(r.rating || 0).fill().map((_, j) => <span key={`f-${j}`}>★</span>)}
                                        {Array(Math.max(0, 5 - (r.rating || 0))).fill().map((_, j) => <span key={`e-${j}`} className="empty-star">★</span>)}
                                    </div>
                                    {nonEmpty(r.text) && <p className="landing-review-text">"{r.text}"</p>}
                                    {nonEmpty(r.name) && <p className="landing-reviewer-name">{r.name}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Contact Details Section */}
            {showContactSection && (
                <>
                    <p className="landing-section-title">Contact Details</p>
                    <div className="landing-contact-details">
                        {nonEmpty(businessCard.contact_email) && (
                            <div className="landing-contact-item">
                                <p className="landing-contact-label">Email:</p>
                                <p className="landing-contact-value">{businessCard.contact_email}</p>
                            </div>
                        )}
                        {nonEmpty(businessCard.phone_number) && (
                            <div className="landing-contact-item">
                                <p className="landing-contact-label">Phone:</p>
                                <p className="landing-contact-value">{businessCard.phone_number}</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const centerPage = {
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
};

const unavailable = (username) => (
    <div
        className="user-landing-page"
        style={{
            ...centerPage,
            flexDirection: "column",
            backgroundColor: "#f0f0f0",
            color: "#333",
            padding: 20,
            fontFamily: "Arial, sans-serif",
        }}
    >
        <div
            style={{
                maxWidth: 600,
                margin: "auto",
                padding: 40,
                border: "1px solid #ddd",
                borderRadius: 10,
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                background: "#fff",
            }}
        >
            <h2 style={{ fontSize: "2rem", marginBottom: 20 }}>Profile Unavailable</h2>
            <p style={{ fontSize: "1.2rem", lineHeight: 1.6 }}>
                This public profile is not currently active. The free trial may have expired or a subscription is needed.
            </p>
            <p style={{ fontSize: "1.1rem", marginTop: 20 }}>
                Please contact <strong>@{username}</strong> directly for more information.
            </p>
        </div>
    </div>
);

export default UserPage;
