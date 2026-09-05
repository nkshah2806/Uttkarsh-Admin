import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ChevronDown, FileSpreadsheet, ListFilter, Search, X } from "lucide-react";
import { toast } from "sonner";

export default function QuantumDataEntry() {
  const { visitId } = useParams();
  const navigate = useNavigate();

  const [visit, setVisit] = useState(null);
  const [patient, setPatient] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [resultsMap, setResultsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvRawText, setCsvRawText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Multi-select category filter — empty array = "All Categories"
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryFilterRef = useRef(null);

  // Close the category filter dropdown on outside click or Escape key
  useEffect(() => {
    if (!categoryDropdownOpen) return;
    const handlePointerDown = (e) => {
      if (categoryFilterRef.current && !categoryFilterRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setCategoryDropdownOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [categoryDropdownOpen]);

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

  // Unique categories present in the parameter list (drives the filter options)
  const filterCategories = [...new Set(parameters.map((p) => p.category).filter(Boolean))];

  const filteredParams = parameters.filter((p) => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    return (
      matchesCategory &&
      ((p.code || "").toLowerCase().includes(q) ||
        (p.name_en || "").toLowerCase().includes(q) ||
        (p.name_hi || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold">
            Quantum Test Scan # {visitId?.slice(-6)}
          </span>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white mt-1">
            Client: {patient?.name} ({patient?.patient_code})
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Age: {patient?.age} Yrs | Gender: {patient?.gender} | Mobile: {patient?.mobile}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowCsvModal(true)}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" /> Bulk CSV Upload
          </Button>
          <Button onClick={handleSaveAndAnalyze} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            <Activity className="mr-2 h-4 w-4" /> Run Auto-Analysis
          </Button>
        </div>
      </div>

      {/* Parameter Grid Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" /> Quantum Machine Parameter Data Entry ({parameters.length} Parameters)
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Multi-Select Filter Dropdown */}
            <div className="relative" ref={categoryFilterRef}>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen((open) => !open)}
                className={`inline-flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg font-semibold transition-all border cursor-pointer ${selectedCategories.length > 0
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 border hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-300"
                  }`}
              >
                <ListFilter className="h-3.5 w-3.5" />
                <span>
                  {selectedCategories.length === 0
                    ? "All Categories"
                    : `Filtering ${selectedCategories.length} Categor${selectedCategories.length === 1 ? "y" : "ies"}`}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${categoryDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {categoryDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 z-30 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-2">
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Filter by Category
                    </span>
                    {selectedCategories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedCategories([])}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                      >
                        Clear ({selectedCategories.length})
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto py-1.5 space-y-0.5">
                    <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={selectedCategories.length === 0}
                        onChange={() => setSelectedCategories([])}
                        className="h-3.5 w-3.5 rounded accent-indigo-600"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex-1">
                        All Categories
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">{parameters.length}</span>
                    </label>

                    {filterCategories.map((cat) => {
                      const count = parameters.filter((p) => p.category === cat).length;
                      const checked = selectedCategories.includes(cat);
                      const disabled = count === 0 && !checked;
                      return (
                        <label
                          key={cat}
                          className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${disabled ? "opacity-45 cursor-not-allowed" : ""
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() =>
                              setSelectedCategories((prev) =>
                                checked ? prev.filter((c) => c !== cat) : [...prev, cat]
                              )
                            }
                            className="h-3.5 w-3.5 rounded accent-indigo-600"
                          />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-200 flex-1 truncate">
                            {cat}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">{count}</span>
                        </label>
                      );
                    })}

                    {filterCategories.length === 0 && (
                      <p className="px-2 py-3 text-xs text-slate-400 text-center">No categories available</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 rounded-full pl-2.5 pr-1.5 py-1"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== cat))}
                      className="p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 cursor-pointer"
                      aria-label={`Remove ${cat} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            <div className="relative w-full sm:w-72 shrink-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by code, name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <span className="text-[11px] text-slate-400">
              Showing {filteredParams.length} of {parameters.length} parameters
            </span>
          </div>
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-600 dark:text-slate-300 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Parameter Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Normal Range</th>
                  <th className="px-4 py-3 w-40">Raw Value</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredParams.map((p) => {
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
