import axiosInstance from "@/lib/axios";

export const DEFAULT_PRODUCTS = [
  {
    id: "prod_1",
    name: "Premium Special Chyawanprash",
    slug: "premium-special-chyawanprash",
    category_slug: "immunity-boosters",
    price: 499,
    mrp: 650,
    short_description: "Fortified with 40+ authentic herbs & Amla for immunity, vitality & daily energy.",
    description: "Prepared according to traditional Ayurvedic methods using fresh Amla, Pure Desi Ghee, Saffron, and over 40 potent herbs. Recommended for daily consumption for all age groups.",
    images: ["https://images.unsplash.com/photo-1577401239170-897942555fb3?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"],
    is_bestseller: true,
    is_featured: true,
    rating: 4.9,
    review_count: 128,
    stock: 200,
    ailment: "Immunity & Cold Protection",
  },
  {
    id: "prod_2",
    name: "Ashwagandha Gold KSM-66 Capsules",
    slug: "ashwagandha-gold-ksm66-capsules",
    category_slug: "herbal-supplements",
    price: 380,
    mrp: 499,
    short_description: "High potency root extract for stress relief, stamina, and deep restorative sleep.",
    description: "Standardized organic Ashwagandha root extract capsules. Helps lower cortisol, improve energy, enhance focus, and support natural sleep cycles.",
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"],
    is_bestseller: true,
    is_featured: true,
    rating: 4.8,
    review_count: 94,
    stock: 150,
    ailment: "Stress & Sleep",
  },
  {
    id: "prod_3",
    name: "Organic Triphala Churna",
    slug: "organic-triphala-churna",
    category_slug: "digestion-and-gut",
    price: 249,
    mrp: 320,
    short_description: "Pure Haritaki, Bibhitaki & Amalaki powder for gentle daily colon detox.",
    description: "100% pure organic triphala powder. Promotes regular bowel movements, cleanses digestive tract, and supports nutrient absorption.",
    images: ["https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"],
    is_bestseller: true,
    is_featured: false,
    rating: 4.7,
    review_count: 76,
    stock: 180,
    ailment: "Constipation & Digestion",
  },
  {
    id: "prod_4",
    name: "Kumkumadi Glow Facial Oil",
    slug: "kumkumadi-glow-facial-oil",
    category_slug: "hair-and-skin-care",
    price: 599,
    mrp: 799,
    short_description: "Traditional Saffron & Chandan Ayurvedic oil for radiant skin tone.",
    description: "Luxurious blend of Kashmiri Saffron, Sandalwood, Lotus pollen, and 26 precious herbs infused in pure sesame oil. Brightens complexion and fades dark spots.",
    images: ["https://images.unsplash.com/photo-1608248597263-00079e9603f2?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"],
    is_bestseller: false,
    is_featured: true,
    rating: 4.9,
    review_count: 63,
    stock: 90,
    ailment: "Skin Brightening",
  },
  {
    id: "prod_5",
    name: "Mahabhringraj Hair Growth Oil",
    slug: "mahabhringraj-hair-growth-oil",
    category_slug: "hair-and-skin-care",
    price: 349,
    mrp: 450,
    short_description: "Cold-pressed sesame oil base with pure Bhringraj, Amla and Sesame for hair strength.",
    description: "Nourishes scalp roots, prevents premature greying, and reduces hair fall. Formulated per classical Kshirapaka Vidhi.",
    images: ["https://images.unsplash.com/photo-1526947425960-945c6e72858f?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"],
    is_bestseller: true,
    is_featured: true,
    rating: 4.8,
    review_count: 110,
    stock: 140,
    ailment: "Hair Fall",
  },
  {
    id: "prod_6",
    name: "Pure Shilajit Resin Gold",
    slug: "pure-shilajit-resin-gold",
    category_slug: "wellness-essentials",
    price: 899,
    mrp: 1200,
    short_description: "Purified Himalayan Shilajit rich in 80+ minerals & Fulvic Acid.",
    description: "Authentic soft resin Shilajit extracted from high-altitude Himalayan peaks. Enhances stamina, strength, and cellular metabolism.",
    images: ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"],
    is_bestseller: true,
    is_featured: true,
    rating: 4.9,
    review_count: 85,
    stock: 80,
    ailment: "Stamina & Energy",
  },
];

export const productsService = {
  getProducts: async () => {
    try {
      const res = await axiosInstance.get("/products");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data.map((p) => ({ ...p, id: p._id || p.id }));
      }
    } catch (err) {
      console.warn("Backend fetch failed for products, using default products:", err.message);
    }
    return DEFAULT_PRODUCTS;
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
