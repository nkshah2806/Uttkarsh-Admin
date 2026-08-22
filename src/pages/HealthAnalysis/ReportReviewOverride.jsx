import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { FileCheck, CheckSquare, Square, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function ReportReviewOverride() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selections, setSelections] = useState({});

  useEffect(() => {
    fetchAutoReport();
  }, [visitId]);

  const fetchAutoReport = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`v1/visits/${visitId}/auto-report`);
      const data = res.data.data;
      setAnalysisData(data);

      // Initialize selections map
      const initialMap = {};
      data.analyzed_items.forEach((item) => {
        Object.values(item.content).forEach((contentArr) => {
          contentArr.forEach((c) => {
            initialMap[c.id] = c.is_selected;
          });
        });
      });
      setSelections(initialMap);
    } catch (err) {
      toast.error("Failed to fetch auto analysis data");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (contentId) => {
    setSelections((prev) => ({ ...prev, [contentId]: !prev[contentId] }));
  };

  const handleFinalizeAndPDF = async () => {
    try {
      setSaving(true);
      const payload = Object.entries(selections).map(([id, isSelected]) => ({
        parameter_master_content_id: id,
        is_selected: isSelected,
      }));

      await axiosInstance.patch(`v1/visits/${visitId}/selected-content`, {
        selections: payload,
      });

      toast.success("Selections saved! Opening PDF preview...");
      navigate(`/report-pdf/${visitId}`);
    } catch (err) {
      toast.error("Failed to update report selections");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading analysis engine recommendations...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-5 rounded-2xl shadow-md">
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-100 font-bold">Auto Analysis Engine</p>
          <h1 className="text-2xl font-bold mt-1">{t("autoReportTitle")}</h1>
          <p className="text-xs text-indigo-100 mt-1 max-w-2xl">{t("prioritySelectNotice")}</p>
        </div>
        <Button
          onClick={handleFinalizeAndPDF}
          disabled={saving}
          className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-6 py-2.5"
        >
          <FileCheck className="mr-2 h-4 w-4" /> {t("generatePDF")} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
          <p className="text-xs text-muted-foreground">Total Scanned</p>
          <p className="text-2xl font-bold">{analysisData?.total_parameters}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 shadow-sm">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Normal Count</p>
          <p className="text-2xl font-bold text-emerald-700">{analysisData?.normal_count}</p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-xl border border-rose-200 shadow-sm">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Abnormal Flagged</p>
          <p className="text-2xl font-bold text-rose-700">{analysisData?.abnormal_count}</p>
        </div>
      </div>

      {/* Flagged Parameters List with Checkbox Content */}
      <div className="space-y-6">
        {analysisData?.analyzed_items.map((item) => {
          const param = item.parameter;
          return (
            <Card key={param.id} className="border-0 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-100 dark:bg-slate-800 py-3.5 px-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-indigo-600 text-sm">{param.code}</span>
                  <h3 className="font-bold text-slate-800 dark:text-white">
                    {lang === "hi" ? param.name_hi : param.name_en}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${item.result_type === "HIGH" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                    {item.result_type} ({item.raw_value} {param.unit})
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Normal Range: {param.normal_min} - {param.normal_max} {param.unit}
                </span>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {Object.entries(item.content).map(([contentType, contentArr]) => {
                  if (contentArr.length === 0) return null;
                  return (
                    <div key={contentType} className="space-y-2">
                      <h4 className="text-xs uppercase font-bold text-indigo-600 tracking-wider">
                        {t(contentType.toLowerCase()) || contentType}
                      </h4>
                      <div className="grid gap-2">
                        {contentArr.map((c) => {
                          const isChecked = selections[c.id];
                          return (
                            <div
                              key={c.id}
                              onClick={() => toggleSelection(c.id)}
                              className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? "bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800"
                                  : "bg-slate-50 border-slate-200 opacity-60 dark:bg-slate-900"
                              }`}
                            >
                              {isChecked ? (
                                <CheckSquare className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {lang === "hi" ? c.text_hi : c.text_en}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  Alt ({lang === "hi" ? "EN" : "HI"}): {lang === "hi" ? c.text_en : c.text_hi}
                                </p>
                              </div>
                              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600">
                                Priority {c.priority}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
