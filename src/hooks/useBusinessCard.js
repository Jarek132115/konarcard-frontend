// frontend/src/hooks/useBusinessCard.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getMyBusinessCard,
    saveMyBusinessCard,
    getBusinessCardByUsername,
} from "../services/businessCard";

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
            // ✅ refresh "me" query users
            qc.invalidateQueries({ queryKey: ["businessCard", "me"] });

            // ✅ refresh any userId-based queries (MyProfile currently uses this pattern)
            qc.invalidateQueries({ queryKey: ["businessCard"] });
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
