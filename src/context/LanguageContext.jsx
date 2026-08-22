import React, { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    // Navigation & Dashboard
    dashboard: "Dashboard",
    quantumModule: "Quantum Health Analysis",
    masterData: "Master Data",
    franchiseMgmt: "Franchise Management",
    patientReg: "Patient Registration",
    quantumEntry: "Quantum Machine Scan",
    reportHistory: "Report History",
    financeBilling: "Finance & Billing",
    settings: "Settings",
    language: "Language",
    
    // Patient Registration
    registerPatient: "Register Patient",
    patientName: "Patient Name",
    age: "Age",
    gender: "Gender",
    mobile: "Mobile Number",
    patientCode: "Patient ID",
    consultant: "Assigned Consultant",
    saveProceed: "Save & Proceed to Scan",
    
    // Quantum Entry
    quantumScanTitle: "Quantum Machine Parameter Data Entry",
    rawInput: "Raw Value",
    normalRange: "Normal Range",
    status: "Status",
    normal: "Normal",
    low: "Low",
    high: "High",
    bulkCSV: "Bulk CSV Upload",
    runAutoAnalysis: "Run Auto-Analysis",

    // Report & Overrides
    autoReportTitle: "Ayurvedic Report Content Overrides",
    prioritySelectNotice: "Top priority bullet items are auto-selected. Check/uncheck items before finalizing report.",
    problem: "Health Problems Identified",
    cause: "Possible Causes",
    precaution: "Precautions",
    pathya: "Pathya (Do's)",
    parhej: "Parhej (Don'ts)",
    medicine: "Ayurvedic Medicine Suggestions",
    diet: "Diet Chart & Lifestyle",
    generatePDF: "Generate Final PDF Report",
    shareWhatsApp: "Share via WhatsApp",
    downloadPDF: "Download PDF",
    printView: "Print View",
  },
  hi: {
    // Navigation & Dashboard
    dashboard: "डैशबोर्ड",
    quantumModule: "क्वांटम स्वास्थ्य विश्लेषण",
    masterData: "मास्टर डेटा प्रबंधन",
    franchiseMgmt: "फ्रेंचाइजी प्रबंधन",
    patientReg: "रोगी पंजीकरण",
    quantumEntry: "क्वांटम मशीन स्कैन",
    reportHistory: "रिपोर्ट इतिहास",
    financeBilling: "वित्त और बिलिंग",
    settings: "सेटिंग्स",
    language: "भाषा (Language)",
    
    // Patient Registration
    registerPatient: "नया रोगी पंजीकृत करें",
    patientName: "रोगी का नाम",
    age: "आयु",
    gender: "लिंग",
    mobile: "मोबाइल नंबर",
    patientCode: "पेशेंट आईडी",
    consultant: "परामर्शदाता डॉ.",
    saveProceed: "सहेजें और स्कैन शुरू करें",
    
    // Quantum Entry
    quantumScanTitle: "क्वांटम मशीन पैरामीटर डेटा प्रविष्टि",
    rawInput: "मापे गए अंक",
    normalRange: "सामान्य सीमा",
    status: "स्थिति",
    normal: "सामान्य",
    low: "कम (Low)",
    high: "अधिक (High)",
    bulkCSV: "बल्क सीएसवी अपलोड",
    runAutoAnalysis: "स्वचालित विश्लेषण शुरू करें",

    // Report & Overrides
    autoReportTitle: "आयुर्वेदिक रिपोर्ट समीक्षा एवं बदलाव",
    prioritySelectNotice: "उच्च प्राथमिकता वाले बिंदु स्वचालित रूप से चुने गए हैं। फाइनल पीडीएफ से पहले जांचें।",
    problem: "पहचानी गई स्वास्थ्य समस्याएं",
    cause: "संभावित कारण",
    precaution: "सावधानियां",
    pathya: "पथ्य (क्या खाएं)",
    parhej: "परहेज (क्या न खाएं)",
    medicine: "आयुर्वेदिक औषधि सुझाव",
    diet: "आहार सारणी और दिनचर्या",
    generatePDF: "अंतिम पीडीएफ रिपोर्ट तैयार करें",
    shareWhatsApp: "व्हाट्सएप पर शेयर करें",
    downloadPDF: "पीडीएफ डाउनलोड करें",
    printView: "प्रिंट व्यू",
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("app_lang") || "en";
  });

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "hi" : "en";
    setLang(nextLang);
    localStorage.setItem("app_lang", nextLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations["en"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
