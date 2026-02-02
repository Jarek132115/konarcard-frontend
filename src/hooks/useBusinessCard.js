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

export const useSaveMyBusinessCard = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: saveMyBusinessCard,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["businessCard", "me"] });
            qc.invalidateQueries({ queryKey: ["businessCard"] });
            qc.invalidateQueries({ queryKey: ["businessCard", "profiles"] });
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
        // ✅ always enabled (so "main" works even if slug not passed)
        enabled: true,
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
        },
    });
};

/**
 * ✅ Multi-profile save helper
 * - posts to same endpoint
 * - adds profile_slug into FormData so backend saves correct profile
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
            const slug = vars?.profile_slug || "main";
            qc.invalidateQueries({ queryKey: ["businessCard", "profiles"] });
            qc.invalidateQueries({ queryKey: ["businessCard", "me"] });
            qc.invalidateQueries({ queryKey: ["businessCard", "profile", slug] });
            qc.invalidateQueries({ queryKey: ["businessCard"] });
        },
    });
};
