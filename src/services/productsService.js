import axiosInstance from "@/lib/axios";

export const productsService = {
  getProducts: async () => {
    try {
      const res = await axiosInstance.get("/products");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((p) => ({ ...p, id: p._id || p.id }));
      }
    } catch (err) {
      console.warn("Backend fetch failed for products:", err.message);
    }
    return [];
  },

  createProduct: async (data) => {
    try {
      const res = await axiosInstance.post("/products", data);
      return { ...res.data, id: res.data._id || res.data.id };
    } catch (err) {
      console.error("Error creating product:", err);
      throw err;
    }
  },

  updateProduct: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/products/${id}`, data);
      return { ...res.data, id: res.data._id || res.data.id };
    } catch (err) {
      console.error("Error updating product:", err);
      throw err;
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await axiosInstance.delete(`/products/${id}`);
      return res.data;
    } catch (err) {
      console.error("Error deleting product:", err);
      throw err;
    }
  },
};
