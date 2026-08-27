import axiosInstance from "@/lib/axios";

export const categoriesService = {
  getCategories: async () => {
    try {
      const res = await axiosInstance.get("/categories");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((c) => ({ ...c, id: c._id || c.id }));
      }
    } catch (err) {
      console.warn("Backend fetch failed for categories:", err.message);
    }
    return [];
  },

  createCategory: async (data) => {
    try {
      const res = await axiosInstance.post("/categories", data);
      return { ...res.data, id: res.data._id || res.data.id };
    } catch (err) {
      console.error("Error creating category:", err);
      throw err;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/categories/${id}`, data);
      return { ...res.data, id: res.data._id || res.data.id };
    } catch (err) {
      console.error("Error updating category:", err);
      throw err;
    }
  },

  deleteCategory: async (id) => {
    try {
      const res = await axiosInstance.delete(`/categories/${id}`);
      return res.data;
    } catch (err) {
      console.error("Error deleting category:", err);
      throw err;
    }
  },
};
