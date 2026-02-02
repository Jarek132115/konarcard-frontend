// frontend/src/services/businessCard.js
import api from "./api";

/**
 * Small helper to safely unwrap common API shapes:
 * - { data: <thing> }
 * - { data: { data: <thing> } }  (older pattern)
 * - <thing> (public)
 */
const unwrap = (res) => {
    const d = res?.data;
    if (d && typeof d === "object") {
        if ("data" in d) {
            // could be { data: thing } or { data: { data: thing } }
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
        // Your new backend returns 400 NO_DEFAULT_PROFILE; treat as null.
        const res = await api.get("/api/business-card/me");
        return unwrap(res);
    } catch (err) {
        const status = err?.response?.status;

        // New backend stub: no default profile
        if (status === 400) return null;

        // backend too old -> fallback
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
 * SAVE (UPSERT)
 * =========================================================
 *
 * Canonical backend route (your routes file):
 *   POST /api/business-card
 *
 * IMPORTANT:
 * - Do NOT set Content-Type manually.
 * - Do NOT pass headers: {} (can break multipart boundary handling in some Axios setups)
 */
export const saveMyBusinessCard = async (formData) => {
    if (!(formData instanceof FormData)) {
        throw new Error("saveMyBusinessCard expects FormData");
    }

    const res = await api.post("/api/business-card", formData, {
        // keep axios from trying to serialize FormData
        transformRequest: (data) => data,
    });

    // backend returns { data: saved, normalized?: ... }
    return unwrap(res);
};

/**
 * =========================================================
 * MULTI PROFILE (canonical)
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

export const createMyProfile = async ({ profile_slug, template_id, business_card_name } = {}) => {
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

    // backend returns 400 (no default profile) — keep for compatibility
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
 * PUBLIC PROFILE FETCH (deprecated username endpoints)
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
