// frontend/src/services/businessCard.js
import api from "./api";

/**
 * =========================================================
 * SINGLE PROFILE (legacy / default profile)
 * =========================================================
 */

/**
 * Get the logged-in user's DEFAULT business card.
 *
 * Preferred backend route:
 *  GET /api/business-card/me
 *  Returns: { data: null } OR { data: { ...BusinessCard } }
 *
 * Legacy fallback:
 *  GET /api/business-card/my_card
 *  Returns: card object directly (or 404 if not found)
 */
export const getMyBusinessCard = async () => {
    try {
        const res = await api.get("/api/business-card/me");
        return res?.data?.data ?? null;
    } catch (err) {
        const status = err?.response?.status;

        // backend too old -> fallback
        if (status === 404) {
            try {
                const res2 = await api.get("/api/business-card/my_card");
                return res2?.data ?? null;
            } catch (err2) {
                const s2 = err2?.response?.status;
                if (s2 === 404) return null;
                throw err2;
            }
        }

        throw err;
    }
};

/**
 * Upsert (save) a business card.
 * Backend route:
 *  POST /api/business-card
 *
 * NOTE:
 * - FormData required (images)
 * - include profile_slug in the FormData if saving a non-main profile
 */
export const saveMyBusinessCard = async (formData) => {
    if (!(formData instanceof FormData)) {
        throw new Error("saveMyBusinessCard expects FormData");
    }

    const res = await api.post("/api/business-card", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res?.data?.data ?? null;
};

/**
 * =========================================================
 * MULTI PROFILE (new)
 * =========================================================
 */

export const getMyProfiles = async () => {
    // GET /api/business-card/profiles -> { data: [] }
    const res = await api.get("/api/business-card/profiles");
    return res?.data?.data ?? [];
};

export const getMyProfileBySlug = async (slug) => {
    if (!slug) throw new Error("slug is required");
    const res = await api.get(`/api/business-card/profiles/${encodeURIComponent(slug)}`);
    return res?.data?.data ?? null;
};

export const createMyProfile = async ({ profile_slug, template_id, business_card_name } = {}) => {
    // POST /api/business-card/profiles -> { message, data }
    const res = await api.post("/api/business-card/profiles", {
        profile_slug,
        template_id,
        business_card_name,
    });
    return res?.data?.data ?? null;
};

export const setDefaultProfile = async (slug) => {
    if (!slug) throw new Error("slug is required");
    const res = await api.patch(`/api/business-card/profiles/${encodeURIComponent(slug)}/default`);
    return res?.data?.data ?? null;
};

export const deleteMyProfile = async (slug) => {
    if (!slug) throw new Error("slug is required");
    const res = await api.delete(`/api/business-card/profiles/${encodeURIComponent(slug)}`);
    return res?.data ?? null;
};

/**
 * =========================================================
 * PUBLIC PROFILE FETCH
 * =========================================================
 */

/**
 * Default public profile by username (backend returns default/main/newest)
 * GET /api/business-card/by_username/:username
 */
export const getBusinessCardByUsername = async (username) => {
    if (!username) throw new Error("Username is required");

    const res = await api.get(`/api/business-card/by_username/${encodeURIComponent(username)}`, {
        headers: { "x-no-auth": "1" },
    });

    return res?.data ?? null;
};

/**
 * Specific public profile by username + slug
 * GET /api/business-card/by_username/:username/:slug
 */
export const getBusinessCardByUsernameAndSlug = async (username, slug) => {
    if (!username) throw new Error("Username is required");
    if (!slug) throw new Error("Slug is required");

    const res = await api.get(
        `/api/business-card/by_username/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`,
        { headers: { "x-no-auth": "1" } }
    );

    return res?.data ?? null;
};
