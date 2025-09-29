import React, { useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { AuthContext } from "../../components/AuthContext";

import FacebookIcon from "../../assets/icons/icons8-facebook.svg";
import InstagramIcon from "../../assets/icons/icons8-instagram.svg";
import LinkedInIcon from "../../assets/icons/icons8-linkedin.svg";
import XIcon from "../../assets/icons/icons8-x.svg";
import TikTokIcon from "../../assets/icons/icons8-tiktok.svg";

/* ---------------------------
   Helpers
--------------------------- */
const PLACEHOLDER_HINTS = ["placeholder", "sample", "demo", "stock", "default", "template", "card-mock"];
const looksLikePlaceholderUrl = (url = "") =>
    typeof url === "string" && PLACEHOLDER_HINTS.some((h) => url.toLowerCase().includes(h));
const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const arr = (v) => (Array.isArray(v) ? v : []);

/** read(obj, ["keyA","key_b"], fallback) -> first present value */
const read = (o, keys, fb = undefined) => {
    for (const k of keys) {
        if (o?.[k] !== undefined && o?.[k] !== null) return o[k];
    }
    return fb;
};

const filterRealImages = (xs) => arr(xs).filter((u) => nonEmpty(u) && !looksLikePlaceholderUrl(u));
const filterRealServices = (xs) => arr(xs).filter((s) => s && (nonEmpty(s.name) || nonEmpty(s.price)));
const filterRealReviews = (xs) => arr(xs).filter((r) => r && (nonEmpty(r.name) || nonEmpty(r.text) || (r.rating ?? 0) > 0));

const centerPage = {
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
};

export default function UserPage() {
    const { username } = useParams();
    const { user: authUser } = useContext(AuthContext);

    const workCarouselRef = useRef(null);
    const servicesCarouselRef = useRef(null);
    const reviewsCarouselRef = useRef(null);

    const { data: businessCard, isLoading, isError, error } = useQuery({
        queryKey: ["public-business-card", username],
        queryFn: async () => (await api.get(`/api/business-card/by_username/${username}`)).data,
        enabled: !!username,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: 1,
    });

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

    const goEditProfile = () => {
        try { localStorage.setItem("scrollToEditorOnLoad", "1"); } catch { }
        window.location.href = "/myprofile";
    };
    const goContactSupportSmart = () => {
        try { localStorage.setItem("openChatOnLoad", "1"); } catch { }
        window.location.href = authUser ? "/contact-support" : "/contactus";
    };

    if (isLoading) return <div className="user-landing-page" style={centerPage}><p>Loading business card...</p></div>;
    if (isError) { console.error(error); return unavailable(username, goEditProfile, goContactSupportSmart); }
    if (!businessCard) return <div className="user-landing-page" style={centerPage}><p>No business card found for “{username}”.</p></div>;

    /* ---------------------------
       Robust field fallbacks
    --------------------------- */

    // Theme, font, alignment, CTA colors
    const pageTheme = read(businessCard, ["page_theme", "pageTheme"], "light");
    const font = read(businessCard, ["style", "font"], "Inter");
    const textAlign = read(businessCard, ["text_alignment", "textAlignment"], "left");

    const buttonBg = read(businessCard, ["button_bg_color", "buttonBgColor"], "#F47629");
    const buttonTxt = read(businessCard, ["button_text_color", "buttonTextColor"], "white");

    const aboutLayout = read(businessCard, ["about_me_layout", "aboutMeLayout"], "side-by-side");
    const workMode = read(businessCard, ["work_display_mode", "workDisplayMode"], "list");
    const servicesMode = read(businessCard, ["services_display_mode", "servicesDisplayMode"], "list");
    const reviewsMode = read(businessCard, ["reviews_display_mode", "reviewsDisplayMode"], "list");

    // Section toggles (default true)
    const showMain = read(businessCard, ["show_main_section", "showMainSection"], true);
    const showAbout = read(businessCard, ["show_about_me_section", "showAboutMeSection"], true);
    const showWork = read(businessCard, ["show_work_section", "showWorkSection"], true);
    const showServices = read(businessCard, ["show_services_section", "showServicesSection"], true);
    const showReviews = read(businessCard, ["show_reviews_section", "showReviewsSection"], true);
    const showContact = read(businessCard, ["show_contact_section", "showContactSection"], true);

    // Section order
    const defaultOrder = ["main", "about", "work", "services", "reviews", "contact"];
    const savedOrderRaw = read(businessCard, ["section_order", "sectionOrder"], []);
    const sectionOrder = Array.isArray(savedOrderRaw) && savedOrderRaw.length
        ? savedOrderRaw.filter((k) => defaultOrder.includes(k))
        : defaultOrder;

    // Core data
    const cover = read(businessCard, ["cover_photo", "coverPhoto"], "");
    const avatar = read(businessCard, ["avatar"], "");
    const mainHeading = read(businessCard, ["main_heading", "mainHeading"], "");
    const subHeading = read(businessCard, ["sub_heading", "subHeading"], "");
    const fullName = read(businessCard, ["full_name", "fullName"], "");
    const jobTitle = read(businessCard, ["job_title", "jobTitle"], "");
    const bio = read(businessCard, ["bio"], "");
    const works = filterRealImages(read(businessCard, ["works", "workImages"], []));
    const services = filterRealServices(read(businessCard, ["services"], []));
    const reviews = filterRealReviews(read(businessCard, ["reviews"], []));
    const email = read(businessCard, ["contact_email", "contactEmail"], "");
    const phone = read(businessCard, ["phone_number", "phoneNumber"], "");

    const hasContact = nonEmpty(email) || nonEmpty(phone);

    const isSubscribed = !!businessCard.isSubscribed;
    const isTrialActive = businessCard.trialExpires && new Date(businessCard.trialExpires) > new Date();
    if (!(isSubscribed || isTrialActive)) return unavailable(username, goEditProfile, goContactSupportSmart);

    // Decide what to render
    const showMainSection = showMain && (nonEmpty(cover) || nonEmpty(mainHeading) || nonEmpty(subHeading) || hasContact);
    const showAboutMeSection = showAbout && (nonEmpty(avatar) || nonEmpty(fullName) || nonEmpty(jobTitle) || nonEmpty(bio));
    const showWorkSection = showWork && works.length > 0;
    const showServicesSection = showServices && services.length > 0;
    const showReviewsSection = showReviews && reviews.length > 0;
    const showContactSection = showContact && hasContact;

    const nothingToShow = !showMainSection && !showAboutMeSection && !showWorkSection &&
        !showServicesSection && !showReviewsSection && !showContactSection;

    const themeStyles = {
        backgroundColor: pageTheme === "dark" ? "#1F1F1F" : "#FFFFFF",
        color: pageTheme === "dark" ? "#FFFFFF" : "#000000",
        fontFamily: font,
    };
    const contentAlign = { textAlign: textAlign || "left" };
    const ctaStyle = { backgroundColor: buttonBg, color: buttonTxt === "black" ? "#000000" : "#FFFFFF" };

    const socialLinks = [
        { key: "facebook_url", url: read(businessCard, ["facebook_url", "facebookUrl"]), icon: FacebookIcon, label: "Facebook" },
        { key: "instagram_url", url: read(businessCard, ["instagram_url", "instagramUrl"]), icon: InstagramIcon, label: "Instagram" },
        { key: "linkedin_url", url: read(businessCard, ["linkedin_url", "linkedinUrl"]), icon: LinkedInIcon, label: "LinkedIn" },
        { key: "x_url", url: read(businessCard, ["x_url", "xUrl", "twitter_url", "twitterUrl"]), icon: XIcon, label: "X" },
        { key: "tiktok_url", url: read(businessCard, ["tiktok_url", "tiktokUrl"]), icon: TikTokIcon, label: "TikTok" },
    ].filter((x) => nonEmpty(x.url));

    const handleExchangeContact = () => {
        if (!hasContact) return;
        const publicUrl = read(businessCard, ["publicProfileUrl"], `${window.location.origin}/u/${username}`);
        const nameParts = (fullName || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        const middle = nameParts.slice(1, -1).join(" ") || "";

        let vCard = "BEGIN:VCARD\nVERSION:3.0\n";
        vCard += `FN:${fullName || ""}\n`;
        vCard += `N:${lastName};${firstName};${middle};;\n`;
        const org = read(businessCard, ["business_card_name", "businessCardName"], "");
        if (org) vCard += `ORG:${org}\n`;
        if (jobTitle) vCard += `TITLE:${jobTitle}\n`;
        if (phone) vCard += `TEL;TYPE=CELL,VOICE:${phone}\n`;
        if (email) vCard += `EMAIL;TYPE=PREF,INTERNET:${email}\n`;
        if (publicUrl) vCard += `URL:${publicUrl}\n`;
        if (bio) vCard += `NOTE:${bio.replace(/\n/g, "\\n")}\n`;
        vCard += "END:VCARD\n";

        const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(fullName || username || "contact").replace(/\s/g, "_")}.vcf`;
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
                    <p style={{ marginTop: 10, opacity: 0.8 }}>@{username} hasn’t published any content here yet.</p>
                </div>
            </div>
        );
    }

    /* ---------------------------
       Section components
    --------------------------- */
    const MainSection = () =>
        showMainSection ? (
            <>
                {nonEmpty(cover) && <img src={cover} alt="Cover" className="landing-cover-photo" />}
                {nonEmpty(mainHeading) && <h2 className="landing-main-heading" style={contentAlign}>{mainHeading}</h2>}
                {nonEmpty(subHeading) && <p className="landing-sub-heading" style={contentAlign}>{subHeading}</p>}
                {hasContact && (
                    <button type="button" onClick={handleExchangeContact} className="landing-action-button" style={ctaStyle}>
                        Save My Number
                    </button>
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
                    {nonEmpty(bio) && <p className="landing-bio-text" style={contentAlign}>{bio}</p>}
                </div>
            </>
        ) : null;

    const WorkSection = () =>
        showWorkSection ? (
            <>
                <p className="landing-section-title">My Work</p>
                {(workMode === "list" || workMode === "grid") && (
                    <div className={`landing-work-gallery ${workMode}`}>
                        {works.map((url, i) => <img key={i} src={url} alt={`work-${i}`} className="landing-work-image" />)}
                    </div>
                )}
                {workMode === "carousel" && (
                    <div className="user-carousel-container">
                        <div className="user-carousel-nav-buttons">
                            <button type="button" className="user-carousel-nav-button left-arrow" onClick={() => scrollCarousel(workCarouselRef, "left")}>&#9664;</button>
                            <button type="button" className="user-carousel-nav-button right-arrow" onClick={() => scrollCarousel(workCarouselRef, "right")}>&#9654;</button>
                        </div>
                        <div ref={workCarouselRef} className="user-work-gallery-carousel">
                            {works.map((url, i) => <img key={i} src={url} alt={`work-${i}`} className="landing-work-image" />)}
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
                            <button type="button" className="user-carousel-nav-button left-arrow" onClick={() => scrollCarousel(servicesCarouselRef, "left")}>&#9664;</button>
                            <button type="button" className="user-carousel-nav-button right-arrow" onClick={() => scrollCarousel(servicesCarouselRef, "right")}>&#9654;</button>
                        </div>
                    )}
                    <div ref={servicesCarouselRef} className={`user-services-list-carousel ${servicesMode === "carousel" ? "" : "list"}`}>
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
                            <button type="button" className="user-carousel-nav-button left-arrow" onClick={() => scrollCarousel(reviewsCarouselRef, "left")}>&#9664;</button>
                            <button type="button" className="user-carousel-nav-button right-arrow" onClick={() => scrollCarousel(reviewsCarouselRef, "right")}>&#9654;</button>
                        </div>
                    )}
                    <div ref={reviewsCarouselRef} className={`user-reviews-list-carousel ${reviewsMode === "carousel" ? "" : "list"}`}>
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
                    {socialLinks.length > 0 && (
                        <div className="landing-contact-socials" aria-label="Social links">
                            {socialLinks.map((s) => (
                                <a key={s.key} href={s.url} target="_blank" rel="noreferrer" className="landing-contact-social-chip" aria-label={s.label}>
                                    <img src={s.icon} alt="" className="landing-contact-social-glyph" />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </>
        ) : null;

    /* Render in the SAVED order */
    const sectionMap = {
        main: <MainSection key="main" />,
        about: <AboutSection key="about" />,
        work: <WorkSection key="work" />,
        services: <ServicesSection key="services" />,
        reviews: <ReviewsSection key="reviews" />,
        contact: <ContactSection key="contact" />,
    };

    return (
        <div className="user-landing-page" style={themeStyles}>
            {sectionOrder.map((k) => sectionMap[k]).filter(Boolean)}
        </div>
    );

    /* Unavailable */
    function unavailable(username, onEdit, onContact) {
        return (
            <div className="user-landing-page unavailable-wrap">
                <div className="unavailable-card">
                    <div className="unavailable-badge">Profile status</div>
                    <h1 className="unavailable-title">This profile isn’t live yet</h1>
                    <p className="unavailable-sub">There are a couple of common reasons:</p>
                    <ul className="unavailable-list">
                        <li className="unavailable-item">
                            <span className="dot" />
                            <div className="reason">
                                <div className="desktop-body-s"><strong>No content published yet.</strong></div>
                                <div className="desktop-body-xs">The owner might not have created their page.</div>
                            </div>
                        </li>
                        <li className="unavailable-item">
                            <span className="dot" />
                            <div className="reason">
                                <div className="desktop-body-s"><strong>Access expired.</strong></div>
                                <div className="desktop-body-xs">The free trial may have ended or a subscription is required.</div>
                            </div>
                        </li>
                    </ul>
                    <div className="unavailable-actions">
                        <button className="desktop-button cta-blue-button" onClick={onEdit}>Create / Edit My Profile</button>
                        <button className="desktop-button cta-black-button" onClick={onContact}>Contact us</button>
                    </div>
                </div>
            </div>
        );
    }
}
