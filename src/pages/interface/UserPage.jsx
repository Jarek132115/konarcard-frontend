// frontend/src/pages/interface/UserPage.jsx
import React, { useContext, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { AuthContext } from "../../components/AuthContext";
import { toast } from "react-hot-toast";

/* ✅ TEMPLATES */
import Template1 from "../../components/Dashboard/Template1";
import Template2 from "../../components/Dashboard/Template2";
import Template3 from "../../components/Dashboard/Template3";
import Template4 from "../../components/Dashboard/Template4";
import Template5 from "../../components/Dashboard/Template5";

/* ✅ UserPage shell CSS (SAFE: does not style templates) */
import "../../styling/userpage.css";

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

const normalizeSlug = (raw) =>
    String(raw || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

/* Small input cleaners for exchange modal */
const cleanEmail = (v) => String(v || "").trim().toLowerCase();
const cleanPhone = (v) => String(v || "").replace(/[^\d+]/g, "").slice(0, 20);

function ExchangeContactModal({ open, onClose, profileSlug, ownerName }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!open) return null;

    const submit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        const payload = {
            profileSlug: String(profileSlug || "").trim().toLowerCase(),
            name: String(name || "").trim(),
            email: cleanEmail(email),
            phone: cleanPhone(phone),
            message: String(message || "").trim(),
        };

        if (!payload.profileSlug) return toast.error("Missing profile slug.");
        if (!payload.name) return toast.error("Please enter your name.");
        if (!payload.email && !payload.phone) return toast.error("Please provide email or phone.");

        setSubmitting(true);
        try {
            // ✅ PUBLIC endpoint
            const res = await api.post("/exchange-contact", payload, { headers: { "x-no-auth": "1" } });

            if (res.data?.error) {
                toast.error(res.data.error);
                return;
            }

            toast.success("Sent! Your details were shared.");
            onClose?.();
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
        } catch (err) {
            toast.error(err?.response?.data?.error || "Could not send details.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                zIndex: 99999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 460,
                    background: "#fff",
                    borderRadius: 16,
                    padding: 18,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 800 }}>Exchange contact</div>
                        <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>
                            Share your details with {ownerName || "this person"}.
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        style={{
                            border: "none",
                            background: "transparent",
                            fontSize: 26,
                            lineHeight: 1,
                            cursor: "pointer",
                            padding: 4,
                        }}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={submit} style={{ marginTop: 14 }}>
                    <div style={{ display: "grid", gap: 10 }}>
                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Your name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} className="kc-input" placeholder="John Smith" required />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Email (optional)</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="kc-input"
                                placeholder="you@email.com"
                                type="email"
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Phone (optional)</label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(cleanPhone(e.target.value))}
                                className="kc-input"
                                placeholder="+44..."
                                inputMode="tel"
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                                Message (optional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="kc-input"
                                placeholder="Hi — great profile!"
                                rows={3}
                                style={{ resize: "vertical" }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        aria-busy={submitting}
                        className="kc-btn kc-btn-primary kc-btn-center"
                        style={{ marginTop: 14 }}
                    >
                        {submitting ? "Sending…" : "Send my details"}
                    </button>
                </form>

                <div style={{ fontSize: 12, opacity: 0.65, marginTop: 10 }}>
                    Your details will be emailed to the profile owner and saved in their KonarCard contacts.
                </div>
            </div>
        </div>
    );
}

export default function UserPage() {
    const { slug } = useParams();
    const { user: authUser } = useContext(AuthContext);

    const [exchangeOpen, setExchangeOpen] = useState(false);

    const publicSlug = useMemo(() => normalizeSlug(slug), [slug]);
    const isValidSlug = publicSlug && publicSlug.length >= 3;

    const { data: businessCard, isLoading, isError, error } = useQuery({
        queryKey: ["public-business-card", publicSlug || "missing-slug"],
        queryFn: async () => {
            if (!isValidSlug) return null;
            const headers = { "x-no-auth": "1" };
            const res = await api.get(`/api/business-card/public/${encodeURIComponent(publicSlug)}`, { headers });
            return res.data;
        },
        enabled: isValidSlug,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
    });

    const goEditProfile = () => {
        try {
            localStorage.setItem("scrollToEditorOnLoad", "1");
        } catch { }
        if (!isValidSlug) return (window.location.href = "/login");
        window.location.href = `/profiles/edit?slug=${encodeURIComponent(publicSlug)}`;
    };

    const goContactSupportSmart = () => {
        try {
            localStorage.setItem("openChatOnLoad", "1");
        } catch { }
        window.location.href = authUser ? "/contact-support" : "/contactus";
    };

    if (!isValidSlug) {
        return (
            <div className="user-landing-page" style={{ ...centerPage, padding: 24 }}>
                <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>Invalid link</h2>
                    <p style={{ marginTop: 10, opacity: 0.8 }}>This profile link is not valid. Please check the URL and try again.</p>
                </div>
            </div>
        );
    }

    if (isLoading) return <div className="user-landing-page" style={centerPage}><p>Loading business card...</p></div>;

    if (isError) {
        console.error(error);
        return unavailable(publicSlug, goEditProfile, goContactSupportSmart);
    }

    if (!businessCard) return <div className="user-landing-page" style={centerPage}><p>No business card found for “{publicSlug}”.</p></div>;

    const templateId = read(businessCard, ["template_id", "templateId"], "template-1");

    const pageTheme = read(businessCard, ["page_theme", "pageTheme"], "light");
    const font = read(businessCard, ["style", "font"], "Inter");
    const textAlign = read(businessCard, ["text_alignment", "textAlignment"], "left");

    const buttonBg = read(businessCard, ["button_bg_color", "buttonBgColor"], "#F47629");
    const buttonTxt = read(businessCard, ["button_text_color", "buttonTextColor"], "white");

    const aboutLayout = read(businessCard, ["about_me_layout", "aboutMeLayout"], "side-by-side");
    const workMode = read(businessCard, ["work_display_mode", "workDisplayMode"], "list");
    const servicesMode = read(businessCard, ["services_display_mode", "servicesDisplayMode"], "list");
    const reviewsMode = read(businessCard, ["reviews_display_mode", "reviewsDisplayMode"], "list");

    const showMain = read(businessCard, ["show_main_section", "showMainSection"], true);
    const showAbout = read(businessCard, ["show_about_me_section", "showAboutMeSection"], true);
    const showWork = read(businessCard, ["show_work_section", "showWorkSection"], true);
    const showServices = read(businessCard, ["show_services_section", "showServicesSection"], true);
    const showReviews = read(businessCard, ["show_reviews_section", "showReviewsSection"], true);
    const showContact = read(businessCard, ["show_contact_section", "showContactSection"], true);

    const defaultOrder = ["main", "about", "work", "services", "reviews", "contact"];
    const savedOrderRaw = read(businessCard, ["section_order", "sectionOrder"], []);
    const sectionOrder =
        Array.isArray(savedOrderRaw) && savedOrderRaw.length
            ? savedOrderRaw.filter((k) => defaultOrder.includes(k))
            : defaultOrder;

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

    const subscriptionFieldPresent =
        typeof businessCard?.isSubscribed !== "undefined" || typeof businessCard?.trialExpires !== "undefined";

    if (subscriptionFieldPresent) {
        const isSubscribed = !!businessCard.isSubscribed;
        const isTrialActive = businessCard.trialExpires && new Date(businessCard.trialExpires) > new Date();
        if (!(isSubscribed || isTrialActive)) return unavailable(publicSlug, goEditProfile, goContactSupportSmart);
    }

    const showMainSection = showMain && (nonEmpty(cover) || nonEmpty(mainHeading) || nonEmpty(subHeading) || hasContact);
    const showAboutMeSection = showAbout && (nonEmpty(avatar) || nonEmpty(fullName) || nonEmpty(jobTitle) || nonEmpty(bio));
    const showWorkSection = showWork && works.length > 0;
    const showServicesSection = showServices && services.length > 0;
    const showReviewsSection = showReviews && reviews.length > 0;
    const showContactSection = showContact && hasContact;

    const nothingToShow =
        !showMainSection && !showAboutMeSection && !showWorkSection && !showServicesSection && !showReviewsSection && !showContactSection;

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

    const handleSaveMyNumber = () => {
        if (!hasContact) return;

        const derivedPublicUrl = `${window.location.origin}/u/${encodeURIComponent(publicSlug)}`;
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
        a.download = `${(fullName || publicSlug || "contact").replace(/\s/g, "_")}.vcf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const openExchangeModal = () => setExchangeOpen(true);

    if (nothingToShow) {
        return (
            <div className="user-landing-page" style={{ ...themeStyles, ...centerPage, padding: 24 }}>
                <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>This profile isn’t set up yet</h2>
                    <p style={{ marginTop: 10, opacity: 0.8 }}>This profile hasn’t published any content here yet.</p>
                </div>
            </div>
        );
    }

    const vm = {
        themeStyles,
        contentAlign,
        ctaStyle,
        flexJustify,

        username: publicSlug,
        profileSlug: publicSlug,

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

        aboutLayout,
        workMode,
        servicesMode,
        reviewsMode,

        sectionOrder,
        showMainSection,
        showAboutMeSection,
        showWorkSection,
        showServicesSection,
        showReviewsSection,
        showContactSection,

        // ✅ new actions
        onSaveMyNumber: handleSaveMyNumber,
        onOpenExchangeContact: openExchangeModal,

        // ✅ backwards compatibility for Templates 1–4 (they call onExchangeContact today)
        onExchangeContact: handleSaveMyNumber,
    };

    const tid = (templateId || "template-1").toString();

    // ✅ shell background: keeps page looking premium, templates remain untouched
    const isDarkTemplate = tid === "template-2" || tid === "template-5";
    const shellClass = `userpage-shell ${isDarkTemplate ? "userpage-shell--dark" : "userpage-shell--light"}`;

    return (
        <>
            <ExchangeContactModal
                open={exchangeOpen}
                onClose={() => setExchangeOpen(false)}
                profileSlug={publicSlug}
                ownerName={fullName || publicSlug}
            />

            <div className={shellClass}>
                <div className="userpage-inner">
                    {tid === "template-2" ? <Template2 vm={vm} /> : null}
                    {tid === "template-3" ? <Template3 vm={vm} /> : null}
                    {tid === "template-4" ? <Template4 vm={vm} /> : null}
                    {tid === "template-5" ? <Template5 vm={vm} /> : null}
                    {tid === "template-1" || !["template-2", "template-3", "template-4", "template-5"].includes(tid) ? (
                        <Template1 vm={vm} />
                    ) : null}
                </div>
            </div>
        </>
    );

    function unavailable(slugValue, onEdit, onContact) {
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
                                <div className="desktop-body-xs">A subscription may be required to keep this profile live.</div>
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
                    {slugValue ? (
                        <div style={{ marginTop: 12, opacity: 0.7, fontSize: 12 }}>
                            Requested link: <strong>/u/{slugValue}</strong>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}
