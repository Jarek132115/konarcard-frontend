// frontend/src/pages/interface/UserPage.jsx
import React, { useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { AuthContext } from "../../components/AuthContext";

/* ✅ TEMPLATES */
import Template1 from "../../components/Dashboard/Template1";
import Template2 from "../../components/Dashboard/Template2";
import Template3 from "../../components/Dashboard/Template3";
import Template4 from "../../components/Dashboard/Template4";
import Template5 from "../../components/Dashboard/Template5";

/* Social icons */
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
const filterRealReviews = (xs) =>
    arr(xs).filter((r) => r && (nonEmpty(r.name) || nonEmpty(r.text) || (r.rating ?? 0) > 0));

const centerPage = {
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
};

export default function UserPage() {
    // ✅ supports /u/:username and /u/:username/:slug
    const { username, slug } = useParams();
    const { user: authUser } = useContext(AuthContext);

    // Normalize slug
    const profileSlug = useMemo(() => {
        const s = (slug || "").toString().trim().toLowerCase();
        return s || null; // null => default profile
    }, [slug]);

    const { data: businessCard, isLoading, isError, error } = useQuery({
        queryKey: ["public-business-card", username, profileSlug || "default"],
        queryFn: async () => {
            if (!username) return null;

            // ✅ public endpoint must be NO AUTH
            const headers = { "x-no-auth": "1" };

            // ✅ If slug exists fetch specific profile
            if (profileSlug) {
                const res = await api.get(
                    `/api/business-card/by_username/${encodeURIComponent(username)}/${encodeURIComponent(profileSlug)}`,
                    { headers }
                );
                return res.data;
            }

            // ✅ else fetch default/main/newest
            const res = await api.get(`/api/business-card/by_username/${encodeURIComponent(username)}`, { headers });
            return res.data;
        },
        enabled: !!username,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
    });

    const goEditProfile = () => {
        try {
            localStorage.setItem("scrollToEditorOnLoad", "1");
        } catch { }

        // ✅ editor supports ?slug=
        const s = profileSlug || "main";
        window.location.href = `/profiles/edit?slug=${encodeURIComponent(s)}`;
    };

    const goContactSupportSmart = () => {
        try {
            localStorage.setItem("openChatOnLoad", "1");
        } catch { }
        window.location.href = authUser ? "/contact-support" : "/contactus";
    };

    if (isLoading) {
        return (
            <div className="user-landing-page" style={centerPage}>
                <p>Loading business card...</p>
            </div>
        );
    }

    if (isError) {
        console.error(error);
        return unavailable(username, goEditProfile, goContactSupportSmart);
    }

    if (!businessCard) {
        return (
            <div className="user-landing-page" style={centerPage}>
                <p>No business card found for “{username}”.</p>
            </div>
        );
    }

    /* ---------------------------
       Robust field fallbacks
    --------------------------- */

    // ✅ template id (persisted)
    const templateId = read(businessCard, ["template_id", "templateId"], "template-1");

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
    const sectionOrder =
        Array.isArray(savedOrderRaw) && savedOrderRaw.length
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

    /**
     * Public endpoint returns BusinessCard only (no plan fields normally),
     * so don’t block the public page unless those fields exist.
     */
    const subscriptionFieldPresent =
        typeof businessCard?.isSubscribed !== "undefined" || typeof businessCard?.trialExpires !== "undefined";

    if (subscriptionFieldPresent) {
        const isSubscribed = !!businessCard.isSubscribed;
        const isTrialActive = businessCard.trialExpires && new Date(businessCard.trialExpires) > new Date();
        if (!(isSubscribed || isTrialActive)) return unavailable(username, goEditProfile, goContactSupportSmart);
    }

    // Decide what to render
    const showMainSection =
        showMain && (nonEmpty(cover) || nonEmpty(mainHeading) || nonEmpty(subHeading) || hasContact);

    const showAboutMeSection =
        showAbout && (nonEmpty(avatar) || nonEmpty(fullName) || nonEmpty(jobTitle) || nonEmpty(bio));

    const showWorkSection = showWork && works.length > 0;
    const showServicesSection = showServices && services.length > 0;
    const showReviewsSection = showReviews && reviews.length > 0;
    const showContactSection = showContact && hasContact;

    const nothingToShow =
        !showMainSection &&
        !showAboutMeSection &&
        !showWorkSection &&
        !showServicesSection &&
        !showReviewsSection &&
        !showContactSection;

    const themeStyles = {
        backgroundColor: pageTheme === "dark" ? "#1F1F1F" : "#FFFFFF",
        color: pageTheme === "dark" ? "#FFFFFF" : "#000000",
        fontFamily: font,
    };

    const contentAlign = { textAlign: textAlign || "left" };
    const ctaStyle = {
        backgroundColor: buttonBg,
        color: buttonTxt === "black" ? "#000000" : "#FFFFFF",
    };

    const flexJustify = textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start";

    const socialLinks = [
        { key: "facebook_url", url: read(businessCard, ["facebook_url", "facebookUrl"]), icon: FacebookIcon, label: "Facebook" },
        { key: "instagram_url", url: read(businessCard, ["instagram_url", "instagramUrl"]), icon: InstagramIcon, label: "Instagram" },
        { key: "linkedin_url", url: read(businessCard, ["linkedin_url", "linkedinUrl"]), icon: LinkedInIcon, label: "LinkedIn" },
        { key: "x_url", url: read(businessCard, ["x_url", "xUrl", "twitter_url", "twitterUrl"]), icon: XIcon, label: "X" },
        { key: "tiktok_url", url: read(businessCard, ["tiktok_url", "tiktokUrl"]), icon: TikTokIcon, label: "TikTok" },
    ].filter((x) => nonEmpty(x.url));

    const handleExchangeContact = () => {
        if (!hasContact) return;

        // ✅ Use exact URL of current view
        const derivedPublicUrl =
            profileSlug && profileSlug !== "main"
                ? `${window.location.origin}/u/${username}/${profileSlug}`
                : `${window.location.origin}/u/${username}`;

        const publicUrl = read(businessCard, ["publicProfileUrl"], derivedPublicUrl);

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

    /* =========================================================
       ✅ Build a single ViewModel for all templates
    ========================================================= */
    const vm = {
        // styles
        themeStyles,
        contentAlign,
        ctaStyle,
        flexJustify,

        // identity
        username,
        profileSlug,

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

        // display modes
        aboutLayout,
        workMode,
        servicesMode,
        reviewsMode,

        // sections
        sectionOrder,
        showMainSection,
        showAboutMeSection,
        showWorkSection,
        showServicesSection,
        showReviewsSection,
        showContactSection,

        // actions
        onExchangeContact: handleExchangeContact,
    };

    /* =========================================================
       ✅ Template switch
    ========================================================= */
    const tid = (templateId || "template-1").toString();

    if (tid === "template-2") return <Template2 vm={vm} />;
    if (tid === "template-3") return <Template3 vm={vm} />;
    if (tid === "template-4") return <Template4 vm={vm} />;
    if (tid === "template-5") return <Template5 vm={vm} />;
    return <Template1 vm={vm} />;

    /* ---------------------------
       Unavailable page
    --------------------------- */
    function unavailable(usernameValue, onEdit, onContact) {
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
                                <div className="desktop-body-s">
                                    <strong>No content published yet.</strong>
                                </div>
                                <div className="desktop-body-xs">The owner might not have created their page.</div>
                            </div>
                        </li>
                        <li className="unavailable-item">
                            <span className="dot" />
                            <div className="reason">
                                <div className="desktop-body-s">
                                    <strong>Access expired.</strong>
                                </div>
                                <div className="desktop-body-xs">The free trial may have ended or a subscription is required.</div>
                            </div>
                        </li>
                    </ul>
                    <div className="unavailable-actions">
                        <button className="desktop-button cta-blue-button" onClick={onEdit}>
                            Create / Edit My Profile
                        </button>
                        <button className="desktop-button cta-black-button" onClick={onContact}>
                            Contact us
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
