import axiosInstance from "@/lib/axios";

const BASE = "gallery";

export const galleryService = {
    // Admin listing — includes inactive items (uses /all endpoint)
    getAll: async () => {
        try {
            const res = await axiosInstance.get(`${BASE}/all`);
            return res.data?.data || [];
        } catch (err) {
            console.warn("Backend fetch failed for gallery items:", err.message);
            return [];
        }
    },

    getById: async (id) => {
        const res = await axiosInstance.get(`${BASE}/${id}`);
        return res.data?.data;
    },

    create: async (data) => {
        const res = await axiosInstance.post(BASE, data);
        return res.data?.data;
    },

    update: async (id, data) => {
        const res = await axiosInstance.put(`${BASE}/${id}`, data);
        return res.data?.data;
    },

    remove: async (id) => {
        const res = await axiosInstance.delete(`${BASE}/${id}`);
        return res.data;
    },
};
