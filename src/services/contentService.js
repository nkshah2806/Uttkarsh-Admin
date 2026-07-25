import axiosInstance from "@/lib/axios";

const STORAGE_KEY = "uc_site_dynamic_content";

export const DEFAULT_CONTENT = {
  header: {
    announcement: "Free Shipping on Orders Over ₹499 · 100% Natural · GMP Certified",
    searchPlaceholder: "Search herbs, remedies...",
  },
  hero: {
    badge: "Local for Vocal · GMP Certified",
    titleLine1: "Ancient wisdom.",
    titleLine2: "Everyday wellness.",
    description:
      "Trusted Ayurvedic medicines and herbal essentials — crafted by local artisans, made for every Indian family's progress toward better health.",
    primaryCtaText: "Shop the Collection",
    primaryCtaLink: "/shop",
    secondaryCtaText: "Our Story",
    secondaryCtaLink: "/about",
    bgImage:
      "https://images.unsplash.com/photo-1492552085122-36706c238263?crop=entropy&cs=srgb&fm=jpg&q=85&w=1800",
  },
  trustBadges: [
    { id: 1, text: "GMP Certified", icon: "ShieldCheck" },
    { id: 2, text: "100% Natural", icon: "Leaf" },
    { id: 3, text: "Free Shipping ₹499+", icon: "Truck" },
    { id: 4, text: "COD Available", icon: "HeartHandshake" },
  ],
  mission: {
    badge: "Our Mission",
    title: "Progress for every family, through health.",
    paragraph1:
      "Utkarsh Corporation stands with India's small and domestic Ayurvedic manufacturers. Every jar and bottle you receive supports local artisans, farmers and doctors — a true Local for Vocal promise.",
    paragraph2:
      "We host free health camps in cities and villages, mentor budding distributors, and craft classical Ayurvedic products with modern quality controls — so wellness stays accessible, affordable, and authentic.",
    image:
      "https://images.unsplash.com/photo-1615485499958-69973683793c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    stats: [
      { id: 1, number: "50+", label: "Health Camps" },
      { id: 2, number: "40k", label: "Families Served" },
      { id: 3, number: "120+", label: "Local Partners" },
    ],
  },
  testimonials: [
    {
      id: 1,
      name: "Anita R., Mumbai",
      body: "The Chyawanprash has become my daily ritual. My kids love it too — no cold this whole season.",
      stars: 5,
    },
    {
      id: 2,
      name: "Rajesh P., Pune",
      body: "Ashwagandha capsules genuinely helped with stress and sleep. Authentic, effective and reasonably priced.",
      stars: 5,
    },
    {
      id: 3,
      name: "Sonal M., Delhi",
      body: "Attended their free health camp — such warm, knowledgeable doctors. Trustworthy brand.",
      stars: 5,
    },
  ],
  distributorCta: {
    badge: "Business Opportunity",
    title: "Grow with us. Become a distributor.",
    description:
      "Join 120+ partners across India selling trusted Ayurvedic products. Attractive margins, full training, marketing support and a mission that matters.",
    ctaText: "Apply now",
    ctaLink: "/distributor",
  },
  footer: {
    brandDescription:
      "Rooted in ancient Ayurvedic wisdom, we craft trusted herbal products for the progress of every Indian family — from local hands to your home.",
    phone: "+91 99999 99999",
    email: "care@utkarshcorp.com",
    address: "Nashik, Maharashtra, India",
    instagramUrl: "https://instagram.com",
    facebookUrl: "https://facebook.com",
    youtubeUrl: "https://youtube.com",
    copyrightText: "Utkarsh Corporation. All rights reserved.",
  },
};

const mergeContent = (dbData) => {
  if (!dbData || typeof dbData !== "object") return DEFAULT_CONTENT;
  return {
    header: { ...DEFAULT_CONTENT.header, ...(dbData.header || {}) },
    hero: { ...DEFAULT_CONTENT.hero, ...(dbData.hero || {}) },
    trustBadges: Array.isArray(dbData.trustBadges) && dbData.trustBadges.length > 0 ? dbData.trustBadges : DEFAULT_CONTENT.trustBadges,
    mission: { ...DEFAULT_CONTENT.mission, ...(dbData.mission || {}) },
    testimonials: Array.isArray(dbData.testimonials) && dbData.testimonials.length > 0 ? dbData.testimonials : DEFAULT_CONTENT.testimonials,
    distributorCta: { ...DEFAULT_CONTENT.distributorCta, ...(dbData.distributorCta || {}) },
    footer: { ...DEFAULT_CONTENT.footer, ...(dbData.footer || {}) },
  };
};

/**
 * Get the current dynamic content from backend
 */
export const getContent = async () => {
  try {
    const res = await axiosInstance.get("site-settings");
    if (res.data) {
      const merged = mergeContent(res.data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (err) {
    console.error("Backend fetch error for site settings:", err);
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Corrupted storage
  }
  return DEFAULT_CONTENT;
};

/**
 * Save updated content to backend & localStorage
 */
export const saveContent = async (newContent) => {
  try {
    const res = await axiosInstance.post("site-settings", newContent);
    const merged = mergeContent(res.data || newContent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.error("Error saving site settings to backend:", err);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newContent));
    return newContent;
  }
};

/**
 * Reset to factory defaults in backend & localStorage
 */
export const resetContentToDefaults = async () => {
  try {
    const res = await axiosInstance.post("site-settings", DEFAULT_CONTENT);
    const merged = mergeContent(res.data || DEFAULT_CONTENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (err) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTENT));
    return DEFAULT_CONTENT;
  }
};
