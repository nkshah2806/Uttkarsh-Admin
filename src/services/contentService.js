import axiosInstance from "@/lib/axios";

const STORAGE_KEY = "uc_site_dynamic_content";

export const DEFAULT_CONTENT = {
  header: {
    announcement: "",
    searchPlaceholder: "",
  },
  hero: {
    badge: "",
    titleLine1: "",
    titleLine2: "",
    description: "",
    primaryCtaText: "",
    primaryCtaLink: "",
    secondaryCtaText: "",
    secondaryCtaLink: "",
    bgImage: "",
  },
  trustBadges: [],
  mission: {
    badge: "",
    title: "",
    paragraph1: "",
    paragraph2: "",
    image: "",
    stats: []
  },
  testimonials: [],
  distributorCta: {
    badge: "",
    title: "",
    description: "",
    ctaText: "",
    ctaLink: "",
  },
  footer: {
    brandDescription: "",
    phone: "",
    email: "",
    address: "",
    instagramUrl: "",
    facebookUrl: "",
    youtubeUrl: "",
    copyrightText: ""
  },
  about: {
    heroTitleLine1: "",
    heroTitleLine2: "",
    heroDescription: "",
    heroImage: "",
    storyTitle: "",
    values: [],
    certifications: []
  },
  healthCamps: {
    badge: "",
    title: "",
    description: "",
    camps: []
  },
  distributorPage: {
    heroTitle: "",
    heroSubtitle: "",
    benefits: [],
    steps: []
  },
  policies: {
    privacyPolicy: "",
    termsOfService: "",
    shippingPolicy: "",
    returnPolicy: ""
  }
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
    about: { ...DEFAULT_CONTENT.about, ...(dbData.about || {}) },
    healthCamps: { ...DEFAULT_CONTENT.healthCamps, ...(dbData.healthCamps || {}) },
    distributorPage: { ...DEFAULT_CONTENT.distributorPage, ...(dbData.distributorPage || {}) },
    policies: { ...DEFAULT_CONTENT.policies, ...(dbData.policies || {}) },
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
