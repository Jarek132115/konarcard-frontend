// profileHelpers.js

/* -------------------------- */
/* Basic helpers              */
/* -------------------------- */

export const norm = (v) => (v ?? "").toString().trim();

export const hasValue = (v) =>
    typeof v === "string" && v.trim().length > 0;

export const asArray = (v) => (Array.isArray(v) ? v : []);

/* -------------------------- */
/* Slug helper                */
/* -------------------------- */

export const normalizeSlug = (raw) =>
    (raw ?? "")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

/* -------------------------- */
/* Completion %               */
/* -------------------------- */

export const calcCompletionPct = (st = {}) => {
    const checks = [
        !!norm(st.business_name || st.businessName || st.mainHeading),
        !!norm(st.trade_title || st.subHeading),
        !!norm(st.location),
        !!norm(st.full_name),
        !!norm(st.job_title),
        !!norm(st.bio),

        !!norm(st.logo) ||
        !!norm(st.logoPreview) ||
        !!norm(st.avatar) ||
        !!norm(st.avatarPreview),

        !!norm(st.coverPhoto) || !!norm(st.coverPhotoPreview),

        asArray(st.workImages).length > 0,
        asArray(st.services).length > 0,
        asArray(st.reviews).length > 0,

        !!norm(st.contact_email),
        !!norm(st.phone_number),
    ];

    const total = checks.length;
    const done = checks.filter(Boolean).length;

    return total ? Math.round((done / total) * 100) : 0;
};

/* -------------------------- */
/* Completion tone            */
/* -------------------------- */

export const getCompletionTone = (pct) => {
    if (pct >= 80) return "good";
    if (pct >= 40) return "mid";
    return "bad";
};

/* -------------------------- */
/* Meaningful content check   */
/* -------------------------- */

export const hasMeaningfulContent = (card = {}) => {
    if (!card || typeof card !== "object") return false;

    const textFields = [
        card.business_name,
        card.business_card_name,
        card.main_heading,
        card.trade_title,
        card.sub_heading,
        card.location,
        card.full_name,
        card.job_title,
        card.bio,
        card.contact_email,
        card.phone_number,
        card.facebook_url,
        card.instagram_url,
        card.linkedin_url,
        card.x_url,
        card.tiktok_url,
    ];

    const hasText = textFields.some((v) => norm(v).length > 0);

    const hasImages = [card.cover_photo, card.logo, card.avatar].some(
        (v) => norm(v).length > 0
    );

    const hasWorks =
        asArray(card.works).some((v) => norm(v).length > 0);

    const hasServices =
        asArray(card.services).some(
            (s) => norm(s?.name) || norm(s?.description) || norm(s?.price)
        );

    const hasReviews =
        asArray(card.reviews).some(
            (r) => norm(r?.name) || norm(r?.text) || Number(r?.rating) > 0
        );

    return hasText || hasImages || hasWorks || hasServices || hasReviews;
};

/* -------------------------- */
/* Live / Draft logic         */
/* -------------------------- */

export const getProfileStatus = ({
    card,
    completionPct,
}) => {
    if (!card) return "draft";

    if (card.is_live === true) return "live";
    if (card.published === true) return "live";
    if (String(card.status || "").toLowerCase() === "live") return "live";

    if (hasMeaningfulContent(card) && completionPct >= 60) {
        return "live";
    }

    return "draft";
};

/* -------------------------- */
/* Work image preview helper  */
/* -------------------------- */

export const getWorkPreview = (item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") return item.preview || "";
    return "";
};