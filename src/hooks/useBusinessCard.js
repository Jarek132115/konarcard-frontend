// frontend/src/hooks/useBusinessCard.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getMyBusinessCard,
    saveMyBusinessCard,
    getBusinessCardByUsername,
    getMyProfiles,
    getMyProfileBySlug,
    createMyProfile,
    setDefaultProfile,
    deleteMyProfile,
} from "../services/businessCard";

/**
 * =========================================================
 * QUERY KEY HELPERS (SINGLE SOURCE OF TRUTH)
 * =========================================================
 */
export const qk = {
    myDefault: ["businessCard", "me"],
    profiles: ["businessCard", "profiles"],
    profileBySlug: (slug) => ["businessCard", "profile", slug || "main"],
    publicByUsername: (username) => ["businessCard", "public", username],
};

/**
 * =========================================================
 * LEGACY / DEFAULT PROFILE
 * =========================================================
 *
 * Contains plan + entitlement info used by UI.
 * Must refresh immediately after Stripe redirect.
 */
export const useMyBusinessCard = () => {
    return useQuery({
        queryKey: qk.myDefault,
        queryFn: getMyBusinessCard,
        retry: false,

        // Always consider stale (so remount/focus triggers network)
        staleTime: 0,

        // Force refetch when page remounts (Stripe return -> /profiles)
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

        // Reduce cache retention so it can't show old plan for long
        gcTime: 5_000,
    });
};

/**
 * =========================================================
 * MULTI-PROFILE (NEW, CANONICAL)
 * =========================================================
 *
 * Must refresh immediately after webhook-created profile exists.
 */
export const useMyProfiles = () => {
    return useQuery({
        queryKey: qk.profiles,
        queryFn: getMyProfiles,
        retry: false,

        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,

        // Reduce cache retention so the list can't be "stuck" after checkout
        gcTime: 5_000,
    });
};

export const useMyProfileBySlug = (slug) => {
    const resolved = (slug || "main").toString();

    return useQuery({
        queryKey: qk.profileBySlug(resolved),
        queryFn: () => getMyProfileBySlug(resolved),
        enabled: true,
        retry: false,

        // It's fine to cache a single profile briefly
        staleTime: 30_000,
    });
};

/**
 * =========================================================
 * SAVE (UPSERT) — WORKS FOR ALL PROFILES
 * =========================================================
 */
export const useSaveMyBusinessCard = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: saveMyBusinessCard,

        onSuccess: (_data, formData) => {
            // Refresh core caches
            qc.invalidateQueries({ queryKey: qk.myDefault, exact: true });
            qc.invalidateQueries({ queryKey: qk.profiles, exact: true });

            // If save is for a specific profile, refresh it too
            try {
                if (formData instanceof FormData) {
                    const slug = (formData.get("profile_slug") || "main").toString();
                    qc.invalidateQueries({ queryKey: qk.profileBySlug(slug), exact: true });
                }
            } catch {
                // ignore
            }
        },
    });
};

/**
 * =========================================================
 * PROFILE MANAGEMENT
 * =========================================================
 */
export const useCreateProfile = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ profile_slug, template_id, business_card_name }) =>
            createMyProfile({ profile_slug, template_id, business_card_name }),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qk.profiles, exact: true });
            qc.invalidateQueries({ queryKey: qk.myDefault, exact: true });
        },
    });
};

export const useSetDefaultProfile = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (slug) => setDefaultProfile((slug || "main").toString()),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qk.profiles, exact: true });
            qc.invalidateQueries({ queryKey: qk.myDefault, exact: true });
        },
    });
};

export const useDeleteProfile = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (slug) => deleteMyProfile((slug || "main").toString()),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qk.profiles, exact: true });
            qc.invalidateQueries({ queryKey: qk.myDefault, exact: true });
        },
    });
};

/**
 * =========================================================
 * PUBLIC PROFILE
 * =========================================================
 */
export const useBusinessCardByUsername = (username) => {
    return useQuery({
        queryKey: qk.publicByUsername(username),
        queryFn: () => getBusinessCardByUsername(username),
        enabled: !!username,
        retry: false,
        staleTime: 60_000,
    });
};
