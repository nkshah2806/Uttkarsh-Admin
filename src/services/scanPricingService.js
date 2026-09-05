import axiosInstance from "@/lib/axios";

const BASE = "v1/scan-pricing";

export const scanPricingService = {
    // Returns array of scan pricings [{ _id, name, description, amount,
    // is_active, is_default }]
    getScanPricings: async () => {
        try {
            const res = await axiosInstance.get(BASE);
            return res.data?.data || [];
        } catch (err) {
            console.warn("Backend fetch failed for scan pricings:", err.message);
            return [];
        }
    },

    getActiveScanPricings: async () => {
        try {
            const res = await axiosInstance.get(`${BASE}/active`);
            return res.data?.data || [];
        } catch (err) {
            console.warn("Backend fetch failed for active scan pricings:", err.message);
            return [];
        }
    },

    createScanPricing: async (data) => {
        const res = await axiosInstance.post(BASE, data);
        return res.data?.data;
    },

    updateScanPricing: async (id, data) => {
        const res = await axiosInstance.put(`${BASE}/${id}`, data);
        return res.data?.data;
    },

    deleteScanPricing: async (id) => {
        const res = await axiosInstance.delete(`${BASE}/${id}`);
        return res.data;
    },
};
