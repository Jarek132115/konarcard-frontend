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
 */
export const useMyBusinessCard = () => {
    return useQuery({
        queryKey: qk.myDefault,
        queryFn: getMyBusinessCard,
        retry: false,
        staleTime: 30_000,
    });
};

/**
 * =========================================================
 * MULTI-PROFILE (NEW, CANONICAL)
 * =========================================================
 */
export const useMyProfiles = () => {
    return useQuery({
        queryKey: qk.profiles,
        queryFn: getMyProfiles,
        retry: false,
        staleTime: 30_000,
    });
};

export const useMyProfileBySlug = (slug) => {
    const resolved = (slug || "main").toString();

    return useQuery({
        queryKey: qk.profileBySlug(resolved),
        queryFn: () => getMyProfileBySlug(resolved),
        enabled: true,
        retry: false,
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
            // Always refresh core caches
            qc.invalidateQueries({ queryKey: qk.myDefault });
            qc.invalidateQueries({ queryKey: qk.profiles });

            // If this save was for a specific profile, refresh it
            try {
                if (formData instanceof FormData) {
                    const slug = (formData.get("profile_slug") || "main").toString();
                    qc.invalidateQueries({ queryKey: qk.profileBySlug(slug) });
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
            qc.invalidateQueries({ queryKey: qk.profiles });
            qc.invalidateQueries({ queryKey: qk.myDefault });
        },
    });
};

export const useSetDefaultProfile = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (slug) => setDefaultProfile((slug || "main").toString()),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qk.profiles });
            qc.invalidateQueries({ queryKey: qk.myDefault });
        },
    });
};

export const useDeleteProfile = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (slug) => deleteMyProfile((slug || "main").toString()),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qk.profiles });
            qc.invalidateQueries({ queryKey: qk.myDefault });
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
