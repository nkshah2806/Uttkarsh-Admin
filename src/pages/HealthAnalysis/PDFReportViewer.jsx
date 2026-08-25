import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Printer, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function PDFReportViewer() {
  const { visitId } = useParams();
  const { lang } = useLanguage();

  const [reportLang, setReportLang] = useState(lang);
  const [reportHtml, setReportHtml] = useState("");
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateReport(reportLang);
  }, [visitId, reportLang]);

  const generateReport = async (selectedLang) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post(`v1/visits/${visitId}/generate-pdf`, {
        lang: selectedLang,
      });
      setReportHtml(res.data.html);
      setReportId(res.data.report_id);
    } catch (err) {
      toast.error("Failed to compile PDF report");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const handleWhatsAppShare = async () => {
    if (!reportId) return;
    try {
      const res = await axiosInstance.post(
        `v1/visits/reports/${reportId}/share/whatsapp`
      );
      const link = res.data.whatsappUrl;
      window.open(link, "_blank");
    } catch (err) {
      toast.error("Failed to generate WhatsApp share link");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800 dark:text-white">PDF Report Document</span>
          <div className="flex items-center rounded-lg border p-1 bg-slate-100 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setReportLang("en")}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                reportLang === "en" ? "bg-white text-indigo-600 shadow dark:bg-indigo-600 dark:text-white" : "text-slate-500"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setReportLang("hi")}
              className={`px-3 py-1 rounded font-semibold transition-colors ${
                reportLang === "hi" ? "bg-white text-indigo-600 shadow dark:bg-indigo-600 dark:text-white" : "text-slate-500"
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Report
          </Button>
          <Button onClick={handleWhatsAppShare} className="bg-emerald-600 hover:bg-emerald-700">
            <Share2 className="mr-2 h-4 w-4" /> WhatsApp Share
          </Button>
        </div>
      </div>

      {/* HTML Report Document Viewer Container */}
      {loading ? (
        <div className="p-12 text-center text-muted-foreground bg-white rounded-xl shadow">
          Compiling multi-language PDF layout...
        </div>
      ) : (
        <div className="bg-white p-4 rounded-xl shadow-lg border max-w-4xl mx-auto overflow-hidden">
          <iframe
            title="PDF Preview"
            srcDoc={reportHtml}
            className="w-full h-[850px] border-0 rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
