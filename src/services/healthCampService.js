import axiosInstance from "@/lib/axios";

const BASE = "health-camps";

export const healthCampService = {
    // Returns array of health camps [{ _id, name, description, date, ... }]
    getHealthCamps: async () => {
        try {
            const res = await axiosInstance.get(BASE);
            return res.data?.data || [];
        } catch (err) {
            console.warn("Backend fetch failed for health camps:", err.message);
            return [];
        }
    },

    getHealthCampById: async (id) => {
        const res = await axiosInstance.get(`${BASE}/${id}`);
        return res.data?.data;
    },

    createHealthCamp: async (data) => {
        const res = await axiosInstance.post(BASE, data);
        return res.data?.data;
    },

    updateHealthCamp: async (id, data) => {
        const res = await axiosInstance.put(`${BASE}/${id}`, data);
        return res.data?.data;
    },

    deleteHealthCamp: async (id) => {
        const res = await axiosInstance.delete(`${BASE}/${id}`);
        return res.data;
    },
};
