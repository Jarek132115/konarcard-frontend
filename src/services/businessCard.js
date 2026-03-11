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

const getStatus = (resOrErr) =>
    Number(resOrErr?.status || resOrErr?.response?.status || 0);

const getErrorMessage = (resOrErr, fallback) =>
    resOrErr?.data?.error ||
    resOrErr?.response?.data?.error ||
    resOrErr?.message ||
    fallback;

/**
 * =========================================================
 * SINGLE PROFILE (legacy / default profile)
 * =========================================================
 */

export const getMyBusinessCard = async () => {
    const res = await api.get("/api/business-card/me");
    const status = getStatus(res);

    // New backend: no default profile
    if (status === 400) return null;

    // Older backend fallback
    if (status === 404) {
        const res2 = await api.get("/api/business-card/my_card");
        const s2 = getStatus(res2);
        if (s2 === 404) return null;
        if (s2 >= 400) throw new Error(getErrorMessage(res2, "Failed to load business card"));
        return unwrap(res2);
    }

    if (status >= 400) {
        throw new Error(getErrorMessage(res, "Failed to load business card"));
    }

    return unwrap(res);
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
    const status = getStatus(res);

    if (status >= 400) {
        throw new Error(getErrorMessage(res, "Failed to save business card"));
    }

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
    const status = getStatus(res);

    if (status >= 400) {
        throw new Error(getErrorMessage(res, "Failed to load profiles"));
    }

    const data = unwrap(res);
    return Array.isArray(data) ? data : [];
};

export const getMyProfileBySlug = async (slug) => {
    const s = (slug || "main").toString().trim();
    if (!s) throw new Error("slug is required");

    const res = await api.get(`/api/business-card/profiles/${encodeURIComponent(s)}`);
    const status = getStatus(res);

    if (status >= 400) {
        throw new Error(getErrorMessage(res, "Failed to load profile"));
    }

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

    const status = getStatus(res);

    if (status >= 400) {
        throw new Error(getErrorMessage(res, "Failed to create profile"));
    }

    return unwrap(res);
};

export const setDefaultProfile = async (slug) => {
    const s = (slug || "").toString().trim();
    if (!s) throw new Error("slug is required");

    const res = await api.patch(`/api/business-card/profiles/${encodeURIComponent(s)}/default`);
    const status = getStatus(res);

    if (status >= 400) {
        throw new Error(getErrorMessage(res, "Failed to set default profile"));
    }

    return unwrap(res);
};

export const deleteMyProfile = async (slug) => {
    const s = (slug || "").toString().trim();
    if (!s) throw new Error("slug is required");

    const res = await api.delete(`/api/business-card/profiles/${encodeURIComponent(s)}`);
    const status = getStatus(res);

    if (status >= 400) {
        throw new Error(getErrorMessage(res, "Failed to delete profile"));
    }

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

    const status = getStatus(res);

    if (status >= 400) {
        throw new Error(getErrorMessage(res, "Failed to load public business card"));
    }

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

    const status = getStatus(res);

    if (status >= 400) {
        throw new Error(getErrorMessage(res, "Failed to load public business card"));
    }

    return unwrap(res);
};