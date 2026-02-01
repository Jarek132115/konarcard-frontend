// frontend/src/services/businessCard.js
import api from "./api";

/**
 * Get the logged-in user's business card.
 *
 * Preferred backend route:
 *  GET /api/business-card/me
 *  Returns: { data: null } OR { data: { ...BusinessCard } }
 *
 * Legacy fallback (older backend):
 *  GET /api/business-card/my_card
 *  Returns: card object directly (or 404 if not found)
 *
 * Returns:
 * - null if no profile exists yet
 * - BusinessCard object if it exists
 */
export const getMyBusinessCard = async () => {
    // 1) Prefer the new /me endpoint
    try {
        const res = await api.get("/api/business-card/me");
        return res?.data?.data ?? null;
    } catch (err) {
        const status = err?.response?.status;

        // If /me doesn't exist on this backend (older deploy), fallback
        if (status === 404) {
            try {
                const res2 = await api.get("/api/business-card/my_card");
                return res2?.data ?? null;
            } catch (err2) {
                const s2 = err2?.response?.status;
                if (s2 === 404) return null; // no card yet
                throw err2;
            }
        }

        // If unauthorized or other error, bubble up
        throw err;
    }
};

/**
 * Create or update (UPSERT) the logged-in user's business card.
 *
 * Backend route:
 *  POST /api/business-card
 *
 * IMPORTANT:
 * - Uses JWT on backend to determine user
 * - Must be FormData (supports images)
 * - Do NOT require `user` in body
 *
 * Backend returns:
 *  { message, data: updatedCard }
 */
export const saveMyBusinessCard = async (formData) => {
    if (!(formData instanceof FormData)) {
        throw new Error("saveMyBusinessCard expects FormData");
    }

    const res = await api.post("/api/business-card", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res?.data?.data ?? null;
};

/**
 * Fetch a public business card by username.
 * Used for /u/:username
 *
 * Backend route:
 *  GET /api/business-card/by_username/:username
 *
 * No auth required (use x-no-auth so api.js does not attach Bearer token)
 *
 * Backend returns:
 *  card object directly (NOT wrapped)
 */
export const getBusinessCardByUsername = async (username) => {
    if (!username) throw new Error("Username is required");

    const res = await api.get(`/api/business-card/by_username/${username}`, {
        headers: {
            "x-no-auth": "1",
        },
    });

    return res?.data ?? null;
};
