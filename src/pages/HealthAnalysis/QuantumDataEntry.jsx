import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { Activity, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export default function QuantumDataEntry() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [visit, setVisit] = useState(null);
  const [patient, setPatient] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [resultsMap, setResultsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRawText, setCsvRawText] = useState("");

  useEffect(() => {
    fetchVisitAndParameters();
  }, [visitId]);

  const fetchVisitAndParameters = async () => {
    try {
      setLoading(true);
      const [vRes, pRes] = await Promise.all([
        axiosInstance.get(`v1/visits/${visitId}`),
        axiosInstance.get("v1/admin/parameters"),
      ]);

      const vData = vRes.data.data;
      setVisit(vData.visit);
      setPatient(vData.visit.patient_id);
      setParameters(pRes.data.data || []);

      // Fill existing results if any
      const map = {};
      if (vData.results) {
        vData.results.forEach((r) => {
          map[r.parameter_id._id || r.parameter_id] = r.raw_value;
        });
      }
      setResultsMap(map);
    } catch (err) {
      toast.error("Failed to load visit scan details");
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (paramId, val) => {
    setResultsMap((prev) => ({ ...prev, [paramId]: val }));
  };

  const computeStatus = (param, rawVal) => {
    if (rawVal === "" || rawVal === undefined || rawVal === null) return null;
    const num = Number(rawVal);
    if (isNaN(num)) return null;
    if (num < param.normal_min) return "LOW";
    if (num > param.normal_max) return "HIGH";
    return "NORMAL";
  };

  const handleSaveAndAnalyze = async () => {
    try {
      setSaving(true);
      const resultsPayload = Object.entries(resultsMap)
        .filter(([_, val]) => val !== "" && val !== null && !isNaN(Number(val)))
        .map(([paramId, val]) => ({
          parameter_id: paramId,
          raw_value: Number(val),
        }));

      if (resultsPayload.length === 0) {
        toast.error("Please enter at least one parameter value before running analysis.");
        setSaving(false);
        return;
      }

      await axiosInstance.post(`v1/visits/${visitId}/results`, {
        results: resultsPayload,
      });

      toast.success("Quantum data saved! Running auto-analysis...");
      navigate(`/report-review/${visitId}`);
    } catch (err) {
      toast.error("Error saving quantum test results");
    } finally {
      setSaving(false);
    }
  };

  const handleCSVProcess = async () => {
    try {
      const lines = csvRawText.trim().split("\n");
      const rows = [];
      lines.forEach((line) => {
        const parts = line.split(/[,;\t]/);
        if (parts.length >= 2) {
          const code = parts[0].trim();
          const val = parseFloat(parts[1].trim());
          if (code && !isNaN(val)) {
            rows.push({ code, raw_value: val });
          }
        }
      });

      if (rows.length === 0) {
        toast.error("No valid parameter rows found in CSV data.");
        return;
      }

      await axiosInstance.post(`v1/visits/${visitId}/results/import`, { rows });

      toast.success(`Imported ${rows.length} parameter values from CSV!`);
      setShowCsvModal(false);
      fetchVisitAndParameters();
    } catch (err) {
      toast.error("CSV Import failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold">
            Quantum Test Scan # {visitId?.slice(-6)}
          </span>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white mt-1">
            Patient: {patient?.name} ({patient?.patient_code})
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Age: {patient?.age} Yrs | Gender: {patient?.gender} | Mobile: {patient?.mobile}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowCsvModal(true)}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" /> {t("bulkCSV")}
          </Button>
          <Button onClick={handleSaveAndAnalyze} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            <Activity className="mr-2 h-4 w-4" /> {t("runAutoAnalysis")}
          </Button>
        </div>
      </div>

      {/* Parameter Grid Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" /> {t("quantumScanTitle")} ({parameters.length} Parameters)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-600 dark:text-slate-300 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Parameter Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">{t("normalRange")}</th>
                  <th className="px-4 py-3 w-40">{t("rawInput")}</th>
                  <th className="px-4 py-3 text-center">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {parameters.map((p) => {
                  const val = resultsMap[p._id] ?? "";
                  const status = computeStatus(p, val);
                  return (
                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-2.5 font-mono font-bold text-indigo-600">{p.code}</td>
                      <td className="px-4 py-2.5 font-medium">
                        {p.name_en}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{p.category}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-600">
                        {p.normal_min} - {p.normal_max} {p.unit}
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          step="any"
                          placeholder="Value..."
                          value={val}
                          onChange={(e) => handleValueChange(p._id, e.target.value)}
                          className="w-full rounded border px-3 py-1 text-sm font-semibold bg-white dark:bg-slate-900 focus:outline-indigo-600"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {status === "NORMAL" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            NORMAL
                          </span>
                        )}
                        {status === "HIGH" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                            HIGH
                          </span>
                        )}
                        {status === "LOW" && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                            LOW
                          </span>
                        )}
                        {!status && <span className="text-xs text-slate-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-bold">Bulk CSV Data Import</h3>
            <p className="text-xs text-muted-foreground">
              Paste CSV text formatted as <code>PARAMETER_CODE, RAW_VALUE</code> (e.g. <code>P001, 5.8</code>).
            </p>
            <textarea
              rows={6}
              placeholder="P001, 5.8&#10;P002, 2.9&#10;P003, 0.6"
              value={csvRawText}
              onChange={(e) => setCsvRawText(e.target.value)}
              className="w-full rounded border p-3 font-mono text-xs"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCsvModal(false)}>Cancel</Button>
              <Button onClick={handleCSVProcess} className="bg-emerald-600 hover:bg-emerald-700">
                Import CSV Values
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
