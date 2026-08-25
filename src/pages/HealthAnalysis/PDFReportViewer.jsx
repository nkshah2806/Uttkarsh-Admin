import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Printer, Download, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  openReportForPdfSave,
  prepareWhatsAppPdfShare,
} from "./reportPdfUtils";

export default function PDFReportViewer() {
  const { visitId } = useParams();
  const { lang } = useLanguage();

  const [reportLang, setReportLang] = useState(lang);
  const [reportHtml, setReportHtml] = useState("");
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfBusy, setPdfBusy] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const generateReport = useCallback(
    async (selectedLang) => {
      try {
        setLoading(true);
        const res = await axiosInstance.post(
          `v1/visits/${visitId}/generate-pdf`,
          {
            lang: selectedLang,
          }
        );
        if (!isMountedRef.current) return;
        setReportHtml(res.data.html);
        setReportId(res.data.report_id);
      } catch (err) {
        if (isMountedRef.current) {
          toast.error("Failed to compile PDF report");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [visitId]
  );

  useEffect(() => {
    generateReport(reportLang);
  }, [generateReport, reportLang]);

  const handlePrint = () => {
    if (!reportHtml) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const reportTitle = visitId
    ? `Quantum-Health-Report-${visitId.slice(-6).toUpperCase()}`
    : "Quantum-Health-Report";

  // Single source of truth: the compiled report HTML (same as the preview).
  const handleDownloadPdf = async () => {
    if (pdfBusy) return; // prevent duplicate clicks while generating
    if (loading || !reportHtml) {
      toast.error("Report is not ready yet. Please wait for it to compile.");
      return;
    }
    setPdfBusy(true);
    try {
      const win = openReportForPdfSave(reportHtml, reportTitle);
      if (!win) {
        toast.error(
          "Could not open the print window. Please allow pop-ups for this site and try again."
        );
      } else {
        toast.success(
          "Choose \u201CSave as PDF\u201D as the destination to download the report."
        );
      }
    } catch (err) {
      toast.error("Failed to open PDF download. Please try again.");
    } finally {
      setPdfBusy(false);
    }
  };

  // Same complete PDF + predefined WhatsApp message (preserved from backend).
  const handleWhatsAppShare = async () => {
    if (pdfBusy) return; // prevent duplicate clicks while generating
    if (loading || !reportId || !reportHtml) {
      toast.error("Report is not ready yet. Please wait for it to compile.");
      return;
    }
    setPdfBusy(true);
    try {
      const started = await prepareWhatsAppPdfShare({
        reportHtml,
        docTitle: reportTitle,
        getWhatsAppUrl: async () => {
          const res = await axiosInstance.post(
            `v1/visits/reports/${reportId}/share/whatsapp`
          );
          return res.data.whatsappUrl;
        },
      });
      if (started) {
        toast.success(
          "PDF generated. Save it, attach it to the WhatsApp chat, and send it with the message."
        );
      } else {
        toast.error(
          "Could not open WhatsApp. Please allow pop-ups for this site and try again."
        );
      }
    } catch (err) {
      toast.error("Failed to generate WhatsApp share link");
    } finally {
      setPdfBusy(false);
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
              className={`px-3 py-1 rounded font-semibold transition-colors ${reportLang === "en" ? "bg-white text-indigo-600 shadow dark:bg-indigo-600 dark:text-white" : "text-slate-500"
                }`}
            >
              English
            </button>
            <button
              onClick={() => setReportLang("hi")}
              className={`px-3 py-1 rounded font-semibold transition-colors ${reportLang === "hi" ? "bg-white text-indigo-600 shadow dark:bg-indigo-600 dark:text-white" : "text-slate-500"
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
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={pdfBusy || loading || !reportHtml}
          >
            {pdfBusy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download PDF
          </Button>
          <Button
            onClick={handleWhatsAppShare}
            disabled={pdfBusy || loading || !reportId || !reportHtml}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {pdfBusy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            Share on WhatsApp
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
