import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import api from "../../services/api";
import { AuthContext } from "../../components/AuthContext";

/* Templates */
import Template1 from "../../components/Dashboard/Template1";
import Template2 from "../../components/Dashboard/Template2";
import Template3 from "../../components/Dashboard/Template3";
import Template4 from "../../components/Dashboard/Template4";
import Template5 from "../../components/Dashboard/Template5";

/* Shell CSS only */
import "../../styling/userpage.css";

/* ---------------------------
   Helpers
--------------------------- */
const PLACEHOLDER_HINTS = [
    "placeholder",
    "sample",
    "demo",
    "stock",
    "default",
    "template",
    "card-mock",
];

const looksLikePlaceholderUrl = (url = "") =>
    typeof url === "string" &&
    PLACEHOLDER_HINTS.some((h) => url.toLowerCase().includes(h));

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;
const arr = (v) => (Array.isArray(v) ? v : []);

const read = (o, keys, fb = undefined) => {
    for (const k of keys) {
        const value = o?.[k];
        if (value !== undefined && value !== null) return value;
    }
    return fb;
};

const normalizeSlug = (raw) =>
    String(raw || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

const cleanEmail = (v) => String(v || "").trim().toLowerCase();
const cleanPhone = (v) => String(v || "").replace(/[^\d+]/g, "").slice(0, 20);

const normalizeBool = (value, fallback = false) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        const x = value.trim().toLowerCase();
        if (x === "true") return true;
        if (x === "false") return false;
    }
    return fallback;
};

const normalizeThemeMode = (value) => {
    const x = String(value || "light").trim().toLowerCase();
    return x === "dark" ? "dark" : "light";
};

const normalizeTextAlign = (value) => {
    const x = String(value || "left").trim().toLowerCase();
    if (x === "center" || x === "right") return x;
    return "left";
};

const normalizeButtonTextColor = (value) => {
    const x = String(value || "white").trim().toLowerCase();
    return x === "black" ? "black" : "white";
};

const normalizeWorks = (raw) =>
    arr(raw)
        .map((item) => {
            if (typeof item === "string") {
                return nonEmpty(item) && !looksLikePlaceholderUrl(item)
                    ? { url: item, preview: item }
                    : null;
            }

            const preview = read(item, ["preview", "url", "image", "src"], "");
            if (!nonEmpty(preview) || looksLikePlaceholderUrl(preview)) return null;

            return {
                ...item,
                url: preview,
                preview,
            };
        })
        .filter(Boolean);

const normalizeServices = (raw) =>
    arr(raw)
        .map((item) => {
            if (!item || typeof item !== "object") return null;

            const name = read(item, ["name", "title"], "");
            const description = read(item, ["description", "subtitle", "text"], "");
            const price = read(item, ["price"], "");

            if (!nonEmpty(name) && !nonEmpty(description) && !nonEmpty(price)) return null;

            return {
                ...item,
                name,
                description,
                price,
            };
        })
        .filter(Boolean);

const normalizeReviews = (raw) =>
    arr(raw)
        .map((item) => {
            if (!item || typeof item !== "object") return null;

            const name = read(item, ["name", "author", "customer_name"], "");
            const text = read(item, ["text", "review", "content", "message"], "");
            const rating = Number(read(item, ["rating", "stars"], 0)) || 0;

            if (!nonEmpty(name) && !nonEmpty(text) && rating <= 0) return null;

            return {
                ...item,
                name,
                text,
                rating,
            };
        })
        .filter(Boolean);

const normalizeSocials = (card) => {
    const facebook = read(card, ["facebook_url", "facebookUrl"], "");
    const instagram = read(card, ["instagram_url", "instagramUrl"], "");
    const linkedin = read(card, ["linkedin_url", "linkedinUrl"], "");
    const x = read(card, ["x_url", "xUrl", "twitter_url", "twitterUrl"], "");
    const tiktok = read(card, ["tiktok_url", "tiktokUrl"], "");

    return {
        facebook_url: nonEmpty(facebook) ? facebook : "",
        instagram_url: nonEmpty(instagram) ? instagram : "",
        linkedin_url: nonEmpty(linkedin) ? linkedin : "",
        x_url: nonEmpty(x) ? x : "",
        tiktok_url: nonEmpty(tiktok) ? tiktok : "",
    };
};

const hasMeaningfulProfileContent = (card) => {
    if (!card || typeof card !== "object") return false;

    const textFields = [
        read(card, ["business_name", "businessName"], ""),
        read(card, ["business_card_name", "businessCardName"], ""),
        read(card, ["main_heading", "mainHeading"], ""),
        read(card, ["trade_title", "tradeTitle"], ""),
        read(card, ["sub_heading", "subHeading"], ""),
        read(card, ["location"], ""),
        read(card, ["full_name", "fullName"], ""),
        read(card, ["job_title", "jobTitle"], ""),
        read(card, ["bio"], ""),
        read(card, ["contact_email", "contactEmail", "email"], ""),
        read(card, ["phone_number", "phoneNumber", "phone"], ""),
        read(card, ["facebook_url", "facebookUrl"], ""),
        read(card, ["instagram_url", "instagramUrl"], ""),
        read(card, ["linkedin_url", "linkedinUrl"], ""),
        read(card, ["x_url", "xUrl", "twitter_url", "twitterUrl"], ""),
        read(card, ["tiktok_url", "tiktokUrl"], ""),
    ];

    const hasText = textFields.some(nonEmpty);

    const hasImages = [
        read(card, ["cover_photo", "coverPhoto"], ""),
        read(card, ["logo"], ""),
        read(card, ["avatar"], ""),
    ].some(nonEmpty);

    const works = normalizeWorks(read(card, ["works", "workImages"], []));
    const services = normalizeServices(read(card, ["services"], []));
    const reviews = normalizeReviews(read(card, ["reviews"], []));

    return hasText || hasImages || works.length > 0 || services.length > 0 || reviews.length > 0;
};

function inferAnalyticsSource() {
    try {
        const params = new URLSearchParams(window.location.search);

        const explicitSource = String(params.get("source") || "").trim().toLowerCase();
        if (["qr", "nfc", "link"].includes(explicitSource)) {
            return explicitSource;
        }

        const utmSource = String(params.get("utm_source") || "").trim().toLowerCase();
        if (utmSource === "qr") return "qr";
        if (utmSource === "nfc") return "nfc";
        if (utmSource === "link") return "link";

        const via = String(params.get("via") || "").trim().toLowerCase();
        if (via === "qr") return "qr";
        if (via === "nfc") return "nfc";

        // Product rule:
        // Plain /u/slug should be treated as the normal shared profile link.
        return "link";
    } catch {
        return "link";
    }
}

function makeRandomId(prefix = "") {
    try {
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        const raw = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
        return `${prefix}${raw}`;
    } catch {
        return `${prefix}${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    }
}

function getVisitorId() {
    const key = "konarcard_visitor_id";

    try {
        const existing = localStorage.getItem(key);
        if (existing) return existing;

        const created = makeRandomId("v_");
        localStorage.setItem(key, created);
        return created;
    } catch {
        return makeRandomId("v_");
    }
}

function getSessionId() {
    const key = "konarcard_session_id";

    try {
        const existing = sessionStorage.getItem(key);
        if (existing) return existing;

        const created = makeRandomId("s_");
        sessionStorage.setItem(key, created);
        return created;
    } catch {
        return makeRandomId("s_");
    }
}

function getNavigationTypeSafe() {
    try {
        const entries = window.performance?.getEntriesByType?.("navigation");
        if (Array.isArray(entries) && entries.length > 0) {
            return String(entries[0]?.type || "").toLowerCase();
        }

        const legacyType = window.performance?.navigation?.type;
        if (legacyType === 1) return "reload";
        if (legacyType === 2) return "back_forward";
        if (legacyType === 0) return "navigate";
    } catch {
        // ignore
    }

    return "";
}

function buildVisitStorageKey(profileSlug, source) {
    return `konarcard_visit_id:${profileSlug}:${source}`;
}

function getVisitId(profileSlug, source) {
    const safeSlug = normalizeSlug(profileSlug);
    const safeSource = String(source || "unknown").trim().toLowerCase() || "unknown";
    const storageKey = buildVisitStorageKey(safeSlug, safeSource);

    try {
        const navType = getNavigationTypeSafe();
        const existing = sessionStorage.getItem(storageKey);

        if (existing && (navType === "reload" || navType === "back_forward")) {
            return existing;
        }

        if (existing && navType === "") {
            return existing;
        }

        const created = makeRandomId("visit_");
        sessionStorage.setItem(storageKey, created);
        return created;
    } catch {
        return makeRandomId("visit_");
    }
}

async function trackProfileEvent({
    profileSlug,
    eventType,
    source = "unknown",
    platform = "",
    meta = {},
}) {
    try {
        if (!profileSlug || !eventType) return;

        const finalSource = String(source || "unknown").trim().toLowerCase() || "unknown";

        await api.post(
            "/api/analytics/track",
            {
                profileSlug,
                eventType,
                source: finalSource,
                platform,
                meta: {
                    ...meta,
                    visitorId: getVisitorId(),
                    sessionId: getSessionId(),
                    visitId: getVisitId(profileSlug, finalSource),
                },
            },
            {
                headers: { "x-no-auth": "1" },
            }
        );
    } catch {
        // silent on purpose
    }
}

function ExchangeContactModal({
    open,
    onClose,
    profileSlug,
    ownerName,
    templateId = "template-1",
    themeMode = "light",
    fontFamily = "Inter, sans-serif",
}) {
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
        if (!payload.email && !payload.phone) {
            return toast.error("Please provide email or phone.");
        }

        setSubmitting(true);
        try {
            const res = await api.post("/exchange-contact", payload, {
                headers: { "x-no-auth": "1" },
            });

            if (res.data?.error) {
                toast.error(res.data.error);
                return;
            }

            await trackProfileEvent({
                profileSlug: payload.profileSlug,
                eventType: "contact_exchange",
                source: inferAnalyticsSource(),
                meta: {
                    pageUrl: window.location.href,
                    referrer: document.referrer || "",
                },
            });

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
            className={`exchange-modal-overlay exchange-modal-overlay--${themeMode}`}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div
                className={`exchange-modal exchange-modal--${templateId} exchange-modal--${themeMode}`}
                style={{ fontFamily }}
                role="dialog"
                aria-modal="true"
                aria-label="Exchange contact"
            >
                <div className="exchange-modal__header">
                    <div className="exchange-modal__headerCopy">
                        <div className="exchange-modal__title">Exchange contact</div>
                        <div className="exchange-modal__subtitle">
                            Share your details with {ownerName || "this person"}.
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="exchange-modal__close"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={submit} className="exchange-modal__form">
                    <div className="exchange-modal__fields">
                        <div className="exchange-modal__field">
                            <label className="exchange-modal__label">Your name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="exchange-modal__input"
                                placeholder="John Smith"
                                required
                            />
                        </div>

                        <div className="exchange-modal__field">
                            <label className="exchange-modal__label">Email (optional)</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="exchange-modal__input"
                                placeholder="you@email.com"
                                type="email"
                            />
                        </div>

                        <div className="exchange-modal__field">
                            <label className="exchange-modal__label">Phone (optional)</label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(cleanPhone(e.target.value))}
                                className="exchange-modal__input"
                                placeholder="+44..."
                                inputMode="tel"
                            />
                        </div>

                        <div className="exchange-modal__field">
                            <label className="exchange-modal__label">Message (optional)</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="exchange-modal__input exchange-modal__textarea"
                                placeholder="Hi — great profile!"
                                rows={4}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        aria-busy={submitting}
                        className="exchange-modal__submit"
                    >
                        {submitting ? "Sending…" : "Send my details"}
                    </button>
                </form>

                <div className="exchange-modal__footnote">
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
    const profileViewTrackedRef = useRef(false);

    const publicSlug = useMemo(() => normalizeSlug(slug), [slug]);
    const isValidSlug = publicSlug && publicSlug.length >= 3;

    const { data: businessCard, isLoading, isError, error } = useQuery({
        queryKey: ["public-business-card", publicSlug || "missing-slug"],
        queryFn: async () => {
            if (!isValidSlug) return null;
            const res = await api.get(
                `/api/business-card/public/${encodeURIComponent(publicSlug)}`,
                {
                    headers: { "x-no-auth": "1" },
                }
            );
            return res.data;
        },
        enabled: isValidSlug,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
    });

    useEffect(() => {
        if (!isValidSlug) return;
        if (!businessCard) return;
        if (profileViewTrackedRef.current) return;

        profileViewTrackedRef.current = true;

        const source = inferAnalyticsSource();
        const viewEvent =
            source === "qr"
                ? "qr_scan"
                : source === "nfc"
                    ? "nfc_tap"
                    : "link_open";

        void trackProfileEvent({
            profileSlug: publicSlug,
            eventType: viewEvent,
            source,
            meta: {
                pageUrl: window.location.href,
                referrer: document.referrer || "",
                querySource: new URLSearchParams(window.location.search).get("utm_source") || "",
            },
        });
    }, [businessCard, isValidSlug, publicSlug]);

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
            <div
                className="user-landing-page"
                style={{
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    padding: 24,
                }}
            >
                <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>
                        Invalid link
                    </h2>
                    <p style={{ marginTop: 10, opacity: 0.8 }}>
                        This profile link is not valid. Please check the URL and try again.
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div
                className="user-landing-page"
                style={{
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
            >
                <p>Loading business card...</p>
            </div>
        );
    }

    if (isError) {
        console.error(error);
        return unavailable(publicSlug, goEditProfile, goContactSupportSmart);
    }

    if (!businessCard) {
        return (
            <div
                className="user-landing-page"
                style={{
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
            >
                <p>No business card found for “{publicSlug}”.</p>
            </div>
        );
    }

    const templateId = read(businessCard, ["template_id", "templateId"], "template-1");
    const tid = String(templateId || "template-1");

    const themeMode = normalizeThemeMode(
        read(businessCard, ["theme_mode", "page_theme", "pageTheme"], "light")
    );
    const textAlign = normalizeTextAlign(
        read(businessCard, ["text_alignment", "textAlignment"], "left")
    );
    const font = read(businessCard, ["style", "font"], "Inter, sans-serif");

    const buttonBgColor = read(
        businessCard,
        ["button_bg_color", "buttonBgColor"],
        "#F47629"
    );
    const buttonTextColor = normalizeButtonTextColor(
        read(businessCard, ["button_text_color", "buttonTextColor"], "white")
    );

    const aboutLayout = read(
        businessCard,
        ["about_me_layout", "aboutMeLayout"],
        "side-by-side"
    );
    const workMode = read(
        businessCard,
        ["work_display_mode", "workDisplayMode"],
        "grid"
    );
    const servicesMode = read(
        businessCard,
        ["services_display_mode", "servicesDisplayMode"],
        "list"
    );
    const reviewsMode = read(
        businessCard,
        ["reviews_display_mode", "reviewsDisplayMode"],
        "list"
    );

    const showMain = normalizeBool(
        read(businessCard, ["show_main_section", "showMainSection"], true),
        true
    );
    const showAbout = normalizeBool(
        read(businessCard, ["show_about_me_section", "showAboutMeSection"], true),
        true
    );
    const showWork = normalizeBool(
        read(businessCard, ["show_work_section", "showWorkSection"], true),
        true
    );
    const showServices = normalizeBool(
        read(businessCard, ["show_services_section", "showServicesSection"], true),
        true
    );
    const showReviews = normalizeBool(
        read(businessCard, ["show_reviews_section", "showReviewsSection"], true),
        true
    );
    const showContact = normalizeBool(
        read(businessCard, ["show_contact_section", "showContactSection"], true),
        true
    );

    const defaultOrder = ["main", "about", "work", "services", "reviews", "contact"];
    const savedOrderRaw = read(businessCard, ["section_order", "sectionOrder"], []);
    const sectionOrder =
        Array.isArray(savedOrderRaw) && savedOrderRaw.length
            ? savedOrderRaw.filter((k) => defaultOrder.includes(k))
            : defaultOrder;

    const cover = read(businessCard, ["cover_photo", "coverPhoto"], "");
    const avatar = read(businessCard, ["avatar", "logo"], "");
    const logo = read(businessCard, ["logo", "avatar"], "");

    const businessName =
        read(businessCard, ["business_card_name", "businessCardName"], "") ||
        read(businessCard, ["main_heading", "mainHeading"], "") ||
        read(businessCard, ["business_name", "businessName"], "") ||
        "";

    const mainHeading =
        read(businessCard, ["main_heading", "mainHeading"], "") || businessName;

    const subHeading = read(businessCard, ["sub_heading", "subHeading"], "");
    const tradeTitle =
        subHeading ||
        read(businessCard, ["trade_title", "tradeTitle", "job_title", "jobTitle"], "");

    const fullName = read(businessCard, ["full_name", "fullName"], "");
    const jobTitle = read(businessCard, ["job_title", "jobTitle"], "");
    const location = read(businessCard, ["location"], "");
    const bio = read(businessCard, ["bio"], "");

    const works = normalizeWorks(read(businessCard, ["works", "workImages"], []));
    const services = normalizeServices(read(businessCard, ["services"], []));
    const reviews = normalizeReviews(read(businessCard, ["reviews"], []));

    const email = read(businessCard, ["contact_email", "contactEmail", "email"], "");
    const phone = read(businessCard, ["phone_number", "phoneNumber", "phone"], "");

    const socials = normalizeSocials(businessCard);
    const socialLinks = Object.entries(socials)
        .filter(([, url]) => nonEmpty(url))
        .map(([key, url]) => ({ key, url }));

    const hasContact = nonEmpty(email) || nonEmpty(phone);
    const hasExchangeContact = true;

    const subscriptionFieldPresent =
        typeof businessCard?.isSubscribed !== "undefined" ||
        typeof businessCard?.trialExpires !== "undefined";

    if (subscriptionFieldPresent) {
        const isSubscribed = !!businessCard.isSubscribed;
        const isTrialActive =
            businessCard.trialExpires && new Date(businessCard.trialExpires) > new Date();
        if (!(isSubscribed || isTrialActive)) {
            return unavailable(publicSlug, goEditProfile, goContactSupportSmart);
        }
    }

    const profileHasMeaningfulContent = hasMeaningfulProfileContent(businessCard);

    const themeStyles = {
        backgroundColor: themeMode === "dark" ? "#131416" : "#f5f5f5",
        color: themeMode === "dark" ? "#ffffff" : "#171717",
        fontFamily: font,
    };

    const contentAlign = { textAlign };
    const ctaStyle = {
        backgroundColor: buttonBgColor,
        color: buttonTextColor === "black" ? "#000000" : "#FFFFFF",
    };
    const flexJustify =
        textAlign === "center"
            ? "center"
            : textAlign === "right"
                ? "flex-end"
                : "flex-start";

    const handleSaveMyNumber = async () => {
        if (!hasContact && !nonEmpty(fullName)) return;

        const derivedPublicUrl = `${window.location.origin}/u/${encodeURIComponent(publicSlug)}`;
        const publicUrl = read(businessCard, ["publicProfileUrl"], derivedPublicUrl);

        const nameParts = String(fullName || "").trim().split(" ").filter(Boolean);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
        const middle = nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

        let vCard = "BEGIN:VCARD\nVERSION:3.0\n";
        vCard += `FN:${fullName || businessName || publicSlug}\n`;
        vCard += `N:${lastName};${firstName};${middle};;\n`;

        if (businessName) vCard += `ORG:${businessName}\n`;
        if (jobTitle || tradeTitle) vCard += `TITLE:${jobTitle || tradeTitle}\n`;
        if (phone) vCard += `TEL;TYPE=CELL,VOICE:${phone}\n`;
        if (email) vCard += `EMAIL;TYPE=PREF,INTERNET:${email}\n`;
        if (publicUrl) vCard += `URL:${publicUrl}\n`;
        if (bio) vCard += `NOTE:${bio.replace(/\n/g, "\\n")}\n`;
        vCard += "END:VCARD\n";

        const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(fullName || businessName || publicSlug || "contact").replace(/\s/g, "_")}.vcf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        await trackProfileEvent({
            profileSlug: publicSlug,
            eventType: "contact_save",
            source: inferAnalyticsSource(),
            meta: {
                pageUrl: window.location.href,
                referrer: document.referrer || "",
            },
        });
    };

    const openExchangeModal = async () => {
        setExchangeOpen(true);

        await trackProfileEvent({
            profileSlug: publicSlug,
            eventType: "contact_exchange_opened",
            source: inferAnalyticsSource(),
            meta: {
                pageUrl: window.location.href,
                referrer: document.referrer || "",
            },
        });
    };

    const handleEmailClick = async () => {
        await trackProfileEvent({
            profileSlug: publicSlug,
            eventType: "email_clicked",
            source: inferAnalyticsSource(),
            meta: {
                pageUrl: window.location.href,
                referrer: document.referrer || "",
                actionTarget: email,
            },
        });
    };

    const handlePhoneClick = async () => {
        await trackProfileEvent({
            profileSlug: publicSlug,
            eventType: "phone_clicked",
            source: inferAnalyticsSource(),
            meta: {
                pageUrl: window.location.href,
                referrer: document.referrer || "",
                actionTarget: phone,
            },
        });
    };

    const handleSocialClick = async (platformKey, url) => {
        const platformMap = {
            facebook_url: "facebook",
            instagram_url: "instagram",
            linkedin_url: "linkedin",
            x_url: "x",
            twitter_url: "x",
            tiktok_url: "tiktok",
        };

        await trackProfileEvent({
            profileSlug: publicSlug,
            eventType: "social_clicked",
            source: inferAnalyticsSource(),
            platform: platformMap[platformKey] || "other",
            meta: {
                pageUrl: window.location.href,
                referrer: document.referrer || "",
                targetUrl: url || "",
                actionTarget: platformKey,
            },
        });
    };

    if (!profileHasMeaningfulContent) {
        return (
            <div
                className="user-landing-page"
                style={{
                    ...themeStyles,
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    padding: 24,
                }}
            >
                <div style={{ maxWidth: 620, width: "100%", textAlign: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>
                        {publicSlug} profile has not been set up yet
                    </h2>
                    <p style={{ marginTop: 10, opacity: 0.8 }}>
                        Please save your business details to view your live profile.
                    </p>
                </div>
            </div>
        );
    }

    const showMainSection =
        showMain &&
        (nonEmpty(cover) ||
            nonEmpty(mainHeading) ||
            nonEmpty(subHeading) ||
            hasContact ||
            nonEmpty(location));

    const showAboutMeSection =
        showAbout &&
        (nonEmpty(avatar) ||
            nonEmpty(fullName) ||
            nonEmpty(jobTitle) ||
            nonEmpty(bio) ||
            nonEmpty(logo));

    const showWorkSection = showWork && works.length > 0;
    const showServicesSection = showServices && services.length > 0;
    const showReviewsSection = showReviews && reviews.length > 0;
    const showContactSection =
        showContact && (hasContact || socialLinks.length > 0 || hasExchangeContact);

    const nothingToShow =
        !showMainSection &&
        !showAboutMeSection &&
        !showWorkSection &&
        !showServicesSection &&
        !showReviewsSection &&
        !showContactSection;

    if (nothingToShow) {
        return (
            <div
                className="user-landing-page"
                style={{
                    ...themeStyles,
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    padding: 24,
                }}
            >
                <div style={{ maxWidth: 620, width: "100%", textAlign: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800 }}>
                        {publicSlug} profile has not been set up yet
                    </h2>
                    <p style={{ marginTop: 10, opacity: 0.8 }}>
                        Please save your business details to view your live profile.
                    </p>
                </div>
            </div>
        );
    }

    const vm = {
        themeMode,
        pageTheme: themeMode,
        themeStyles,
        contentAlign,
        ctaStyle,
        flexJustify,
        textAlignment: textAlign,
        buttonBgColor,
        buttonTextColor,
        font,

        username: publicSlug,
        profileSlug: publicSlug,

        cover,
        coverPhoto: cover,
        avatar,
        logo,
        businessName,
        business_card_name: businessName,
        businessCardName: businessName,
        mainHeading,
        main_heading: mainHeading,
        subHeading,
        sub_heading: subHeading,
        tradeTitle,
        trade_title: tradeTitle,
        location,

        fullName,
        full_name: fullName,
        jobTitle,
        job_title: jobTitle,
        bio,

        works,
        services,
        reviews,

        email,
        contact_email: email,
        phone,
        phone_number: phone,
        hasContact,
        hasExchangeContact,

        socials,
        socialLinks,
        facebook_url: socials.facebook_url,
        instagram_url: socials.instagram_url,
        linkedin_url: socials.linkedin_url,
        x_url: socials.x_url,
        tiktok_url: socials.tiktok_url,

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

        onSaveMyNumber: handleSaveMyNumber,
        onOpenExchangeContact: openExchangeModal,
        onEmailClick: handleEmailClick,
        onPhoneClick: handlePhoneClick,
        onSocialClick: handleSocialClick,

        onExchangeContact: handleSaveMyNumber,
    };

    const shellClass = `userpage-shell ${themeMode === "dark" ? "userpage-shell--dark" : "userpage-shell--light"}`;

    return (
        <>
            <ExchangeContactModal
                open={exchangeOpen}
                onClose={() => setExchangeOpen(false)}
                profileSlug={publicSlug}
                ownerName={fullName || businessName || publicSlug}
                templateId={tid}
                themeMode={themeMode}
                fontFamily={font}
            />

            <div className={shellClass}>
                <div className="userpage-inner">
                    {tid === "template-2" ? <Template2 vm={vm} /> : null}
                    {tid === "template-3" ? <Template3 vm={vm} /> : null}
                    {tid === "template-4" ? <Template4 vm={vm} /> : null}
                    {tid === "template-5" ? <Template5 vm={vm} /> : null}
                    {tid === "template-1" ||
                        !["template-2", "template-3", "template-4", "template-5"].includes(tid) ? (
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
                                <div className="desktop-body-xs">
                                    The owner might not have created their page.
                                </div>
                            </div>
                        </li>

                        <li className="unavailable-item">
                            <span className="dot" />
                            <div className="reason">
                                <div className="desktop-body-s">
                                    <strong>Access expired.</strong>
                                </div>
                                <div className="desktop-body-xs">
                                    A subscription may be required to keep this profile live.
                                </div>
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