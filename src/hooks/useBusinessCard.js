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
 * -----------------------------
 * Single-profile (legacy) hooks
 * -----------------------------
 */
export const useMyBusinessCard = () => {
    return useQuery({
        queryKey: ["businessCard", "me"],
        queryFn: getMyBusinessCard,
        retry: false,
        staleTime: 30_000,
    });
};

/**
 * Save business card (multipart FormData)
 * - Works for BOTH legacy + multi-profile
 * - If formData contains profile_slug, we invalidate that specific profile cache too.
 */
export const useSaveMyBusinessCard = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: saveMyBusinessCard,
        onSuccess: (_data, formData) => {
            // Always refresh these (covers dashboards, lists, and editor views)
            qc.invalidateQueries({ queryKey: ["businessCard", "me"] });
            qc.invalidateQueries({ queryKey: ["businessCard", "profiles"] });
            qc.invalidateQueries({ queryKey: ["businessCard"] });

            // ✅ If saving a specific profile, refresh that specific cache key
            try {
                if (formData instanceof FormData) {
                    const slug = (formData.get("profile_slug") || "main").toString();
                    qc.invalidateQueries({ queryKey: ["businessCard", "profile", slug] });
                }
            } catch {
                // ignore
            }
        },
    });
};

export const useBusinessCardByUsername = (username) => {
    return useQuery({
        queryKey: ["businessCard", "username", username],
        queryFn: () => getBusinessCardByUsername(username),
        enabled: !!username,
        retry: false,
        staleTime: 60_000,
    });
};

/**
 * -----------------------------
 * Multi-profile (NEW) hooks
 * -----------------------------
 */
export const useMyProfiles = () => {
    return useQuery({
        queryKey: ["businessCard", "profiles"],
        queryFn: getMyProfiles,
        retry: false,
        staleTime: 30_000,
    });
};

export const useMyProfileBySlug = (slug) => {
    const resolved = (slug || "main").toString();

    return useQuery({
        queryKey: ["businessCard", "profile", resolved],
        queryFn: () => getMyProfileBySlug(resolved),
        enabled: true, // allow "main" even if slug not passed
        retry: false,
        staleTime: 30_000,
    });
};

export const useCreateProfile = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ profile_slug, template_id, business_card_name }) =>
            createMyProfile({ profile_slug, template_id, business_card_name }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["businessCard", "profiles"] });
            qc.invalidateQueries({ queryKey: ["businessCard", "me"] });
            qc.invalidateQueries({ queryKey: ["businessCard"] });
        },
    });
};

export const useSetDefaultProfile = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (slug) => setDefaultProfile((slug || "main").toString()),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["businessCard", "profiles"] });
            qc.invalidateQueries({ queryKey: ["businessCard", "me"] });
            qc.invalidateQueries({ queryKey: ["businessCard"] });
        },
    });
};

export const useDeleteProfile = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (slug) => deleteMyProfile((slug || "main").toString()),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["businessCard", "profiles"] });
            qc.invalidateQueries({ queryKey: ["businessCard", "me"] });
            qc.invalidateQueries({ queryKey: ["businessCard"] });
        },
    });
};

/**
 * ✅ Multi-profile save helper (optional)
 * - posts to same endpoint
 * - ensures profile_slug is set in FormData
 * - invalidates the specific profile cache key
 *
 * NOTE: If your editor already sets profile_slug in FormData,
 * you can use useSaveMyBusinessCard() directly and remove this helper.
 */
export const useSaveMyBusinessCardForSlug = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ profile_slug, formData }) => {
            if (!profile_slug) throw new Error("profile_slug is required");
            if (!(formData instanceof FormData)) throw new Error("formData must be FormData");

            formData.set("profile_slug", profile_slug);
            const updated = await saveMyBusinessCard(formData);
            return updated;
        },
        onSuccess: (_data, vars) => {
            const slug = (vars?.profile_slug || "main").toString();

            qc.invalidateQueries({ queryKey: ["businessCard", "profiles"] });
            qc.invalidateQueries({ queryKey: ["businessCard", "me"] });
            qc.invalidateQueries({ queryKey: ["businessCard", "profile", slug] });
            qc.invalidateQueries({ queryKey: ["businessCard"] });
        },
    });
};
