import axiosInstance from "@/lib/axios";

const BASE = "v1/legal-content";

export const LEGAL_TYPES = {
    PRIVACY_POLICY: "privacy_policy",
    TERMS_CONDITIONS: "terms_conditions",
};

export const legalContentService = {
    // Returns array of legal content docs [{ _id, type, title, content, is_active, ... }]
    getLegalContent: async (params = {}) => {
        try {
            const res = await axiosInstance.get(BASE, { params });
            return res.data?.data || [];
        } catch (err) {
            console.warn("Backend fetch failed for legal content:", err.message);
            return [];
        }
    },

    getLegalContentById: async (id) => {
        const res = await axiosInstance.get(`${BASE}/${id}`);
        return res.data?.data;
    },

    createLegalContent: async (data) => {
        const res = await axiosInstance.post(BASE, data);
        return res.data;
    },

    updateLegalContent: async (id, data) => {
        const res = await axiosInstance.put(`${BASE}/${id}`, data);
        return res.data;
    },

    toggleStatus: async (id) => {
        const res = await axiosInstance.patch(`${BASE}/${id}/toggle-status`);
        return res.data;
    },

    deleteLegalContent: async (id) => {
        const res = await axiosInstance.delete(`${BASE}/${id}`);
        return res.data;
    },
};
