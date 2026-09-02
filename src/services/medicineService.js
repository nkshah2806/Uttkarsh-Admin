import axiosInstance from "@/lib/axios";

const BASE = "v1/admin/medicines";

export const medicineService = {
    // Returns array of medicines [{ _id, name, details, dosage, is_active }]
    getMedicines: async () => {
        try {
            const res = await axiosInstance.get(BASE);
            return res.data?.data || [];
        } catch (err) {
            console.warn("Backend fetch failed for medicines:", err.message);
            return [];
        }
    },

    createMedicine: async (data) => {
        const res = await axiosInstance.post(BASE, data);
        return res.data?.data;
    },

    updateMedicine: async (id, data) => {
        const res = await axiosInstance.put(`${BASE}/${id}`, data);
        return res.data?.data;
    },

    deleteMedicine: async (id) => {
        const res = await axiosInstance.delete(`${BASE}/${id}`);
        return res.data;
    },
};
