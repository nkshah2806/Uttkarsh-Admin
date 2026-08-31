import axiosInstance from "@/lib/axios";

const BASE = "v1/admin/parameter-categories";

export const parameterCategoryService = {
    // Returns array of categories [{ _id, name, slug, description, order, is_active }]
    getCategories: async () => {
        try {
            const res = await axiosInstance.get(BASE);
            return res.data?.data || [];
        } catch (err) {
            console.warn("Backend fetch failed for parameter categories:", err.message);
            return [];
        }
    },

    createCategory: async (data) => {
        const res = await axiosInstance.post(BASE, data);
        return res.data?.data;
    },

    updateCategory: async (id, data) => {
        const res = await axiosInstance.put(`${BASE}/${id}`, data);
        return res.data?.data;
    },

    deleteCategory: async (id) => {
        const res = await axiosInstance.delete(`${BASE}/${id}`);
        return res.data;
    },
};
