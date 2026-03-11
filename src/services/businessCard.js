// frontend/src/services/businessCard.js
import api from "./api";

/**
 * Safely unwrap common API response shapes:
 * - { data: thing }
 * - { data: { data: thing } }
 * - thing
 */
const unwrap = (res) => {
    const d = res?.data;
    if (d && typeof d === "object") {
        if ("data" in d) {
            const inner = d.data;
            if (inner && typeof inner === "object" && "data" in inner) return inner.data;
            return inner;
        }
    }
    return d ?? null;
};

/**
 * =========================================================
 * SINGLE PROFILE (legacy / default profile)
 * =========================================================
 */

export const getMyBusinessCard = async () => {
    try {
        const res = await api.get("/api/business-card/me");
        return unwrap(res);
    } catch (err) {
        const status = err?.response?.status;

        // New backend: no default profile
        if (status === 400) return null;

        // Older backend fallback
        if (status === 404) {
            try {
                const res2 = await api.get("/api/business-card/my_card");
                return unwrap(res2);
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
 * =========================================================
 * SAVE / UPSERT PROFILE DATA
 * =========================================================
 *
 * IMPORTANT:
 * - Expects FormData
 * - Do not manually set Content-Type
 * - Parent code must decide which fields/files are appended
 */
export const saveMyBusinessCard = async (formData) => {
    if (!(formData instanceof FormData)) {
        throw new Error("saveMyBusinessCard expects FormData");
    }

    const res = await api.post("/api/business-card", formData);
    return unwrap(res);
};

/**
 * Alias kept for readability if you later want profile-specific save calls.
 * Can point to the same route for now.
 */
export const updateMyBusinessCard = async (formData) => {
    return saveMyBusinessCard(formData);
};

/**
 * =========================================================
 * MULTI PROFILE
 * =========================================================
 */

export const getMyProfiles = async () => {
    const res = await api.get("/api/business-card/profiles");
    const data = unwrap(res);
    return Array.isArray(data) ? data : [];
};

export const getMyProfileBySlug = async (slug) => {
    const s = (slug || "main").toString().trim();
    if (!s) throw new Error("slug is required");

    const res = await api.get(`/api/business-card/profiles/${encodeURIComponent(s)}`);
    return unwrap(res);
};

export const createMyProfile = async ({
    profile_slug,
    template_id,
    business_card_name,
} = {}) => {
    const res = await api.post("/api/business-card/profiles", {
        profile_slug,
        template_id,
        business_card_name,
    });
    return unwrap(res);
};

export const setDefaultProfile = async (slug) => {
    const s = (slug || "").toString().trim();
    if (!s) throw new Error("slug is required");

    const res = await api.patch(`/api/business-card/profiles/${encodeURIComponent(s)}/default`);
    return unwrap(res);
};

export const deleteMyProfile = async (slug) => {
    const s = (slug || "").toString().trim();
    if (!s) throw new Error("slug is required");

    const res = await api.delete(`/api/business-card/profiles/${encodeURIComponent(s)}`);
    return unwrap(res);
};

/**
 * =========================================================
 * PUBLIC PROFILE FETCH (legacy username endpoints)
 * =========================================================
 */

export const getBusinessCardByUsername = async (username) => {
    const u = (username || "").toString().trim();
    if (!u) throw new Error("Username is required");

    const res = await api.get(`/api/business-card/by_username/${encodeURIComponent(u)}`, {
        headers: { "x-no-auth": "1" },
    });

    return unwrap(res);
};

export const getBusinessCardByUsernameAndSlug = async (username, slug) => {
    const u = (username || "").toString().trim();
    const s = (slug || "").toString().trim();

    if (!u) throw new Error("Username is required");
    if (!s) throw new Error("Slug is required");

    const res = await api.get(
        `/api/business-card/by_username/${encodeURIComponent(u)}/${encodeURIComponent(s)}`,
        { headers: { "x-no-auth": "1" } }
    );

    return unwrap(res);
};