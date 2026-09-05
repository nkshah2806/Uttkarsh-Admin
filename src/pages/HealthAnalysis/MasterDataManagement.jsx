import React, { useState, useEffect, useMemo, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  FileText,
  Pencil,
  Trash2,
  AlertTriangle,
  Copy,
  Eye,
  CheckCircle2,
  Layers,
  Sparkles,
  Search,
  BookOpen,
  History,
  Check,
  X,
  ListFilter,
  Activity,
  ChevronRight,
  ChevronDown,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import ReusableTable from "@/components/ReusableTable";
import { parseContent, validateContent, NODE_TYPES } from "@/lib/contentParser";

export default function MasterDataManagement() {
  const [parameters, setParameters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Multi-select category filter state — empty array = "All Categories"
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

  // Modals
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingParam, setEditingParam] = useState(null); // null = create, obj = edit
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewParam, setPreviewParam] = useState(null);
  const [deletingParam, setDeletingParam] = useState(null);
  const [editorTab, setEditorTab] = useState("details"); // "details" | "content" | "preview"

  // Editor Form State
  const [form, setForm] = useState({
    code: "",
    name_en: "",
    unit: "",
    normal_min: "",
    normal_max: "",
    category: "General",
    description: "",
    raw_content_en: "",
    status: "PUBLISHED",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchParameters();
    fetchCategories();
  }, []);

  const fetchParameters = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("v1/admin/parameters");
      setParameters(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load parameters");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("v1/admin/parameter-categories");
      setCategories(res.data.data || []);
    } catch (err) {
      // Non-blocking — the dropdown/table can fall back to in-use categories
      console.error("Failed to load parameter categories", err);
    }
  };

  // Categories shown in the "Create Quantum Parameter" dropdown:
  // only admin-added categories appear in the list (active first, fallback to in-use ones)
  const dropdownCategories = useMemo(() => {
    const active = categories.filter((c) => c.is_active !== false).map((c) => c.name);
    const inUse = Array.from(new Set(parameters.map((p) => p.category))).filter(Boolean);
    return active.length > 0 ? active : inUse.length > 0 ? inUse : ["General"];
  }, [categories, parameters]);

  // Filter dropdown options: admin-added categories + any categories still in use by parameters
  const filterCategories = useMemo(() => {
    const adminNames = categories.map((c) => c.name);
    const inUse = Array.from(new Set(parameters.map((p) => p.category))).filter(Boolean);
    return Array.from(new Set([...adminNames, ...inUse]));
  }, [categories, parameters]);

  // Real-time client AST parse diagnostics
  const currentContentText = form.raw_content_en;
  const parseDiagnostics = useMemo(() => {
    return validateContent(currentContentText);
  }, [currentContentText]);

  // Derive a code slug from an English name string
  const deriveCodeFromName = (name) =>
    name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const openAddModal = () => {
    setEditingParam(null);
    setForm({
      code: "",
      name_en: "",
      unit: "",
      normal_min: "",
      normal_max: "",
      category: dropdownCategories[0] || "General",
      description: "",
      raw_content_en: "",
      status: "PUBLISHED",
    });
    setEditorTab("details");
    setShowEditorModal(true);
  };

  const openEditModal = (param) => {
    setEditingParam(param);
    setForm({
      code: param.code || "",
      name_en: param.name_en || "",
      unit: param.unit || "",
      normal_min: param.normal_min !== undefined ? param.normal_min : "",
      normal_max: param.normal_max !== undefined ? param.normal_max : "",
      category: param.category || "General",
      description: param.description || "",
      raw_content_en: param.raw_content_en || "",
      status: param.status || "PUBLISHED",
    });
    setEditorTab("content");
    setShowEditorModal(true);
  };

  const handleSaveParameter = async (statusOverride) => {
    if (!form.name_en || form.normal_min === "" || form.normal_max === "") {
      toast.error("Please fill all required parameter fields in the Details tab.");
      setEditorTab("details");
      return;
    }

    try {
      setSaving(true);

      // When creating, auto-derive the code from the English name
      const derivedCode = editingParam ? form.code : deriveCodeFromName(form.name_en);

      const payload = {
        ...form,
        code: derivedCode,
        status: statusOverride || form.status,
      };

      if (editingParam) {
        await axiosInstance.put(`v1/admin/parameters/${editingParam._id}`, payload);
        toast.success(`Parameter ${form.code} updated to v${String((editingParam.version || 1) + (editingParam.status === "PUBLISHED" ? 1 : 0))}`);
      } else {
        await axiosInstance.post("v1/admin/parameters", payload);
        toast.success(`Parameter ${derivedCode} created successfully.`);
      }

      setShowEditorModal(false);
      fetchParameters();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save parameter.");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (param) => {
    try {
      const res = await axiosInstance.post(`v1/admin/parameters/${param._id}/duplicate`);
      toast.success(`Duplicated parameter created: ${res.data.data.code}`);
      fetchParameters();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to duplicate parameter.");
    }
  };

  const confirmDeleteParameter = async () => {
    if (!deletingParam) return;
    try {
      await axiosInstance.delete(`v1/admin/parameters/${deletingParam._id}`);
      toast.success(`Parameter ${deletingParam.code} deleted.`);
      setDeletingParam(null);
      fetchParameters();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete parameter.");
    }
  };

  const toggleParamStatus = async (param) => {
    try {
      const newActive = !param.is_active;
      await axiosInstance.put(`v1/admin/parameters/${param._id}`, { is_active: newActive });
      toast.success(`Parameter ${param.code} is now ${newActive ? "Active" : "Inactive"}`);
      fetchParameters();
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  // Filtered list — supports multi-select category filtering (empty selection = all)
  const filteredParameters = useMemo(() => {
    if (selectedCategories.length === 0) return parameters;
    return parameters.filter((p) => selectedCategories.includes(p.category));
  }, [parameters, selectedCategories]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = parameters.length;
    const active = parameters.filter((p) => p.is_active !== false).length;
    const categories = new Set(parameters.map((p) => p.category)).size;
    const totalNodes = parameters.reduce((acc, p) => acc + (p.selectable_nodes_count || 0), 0);
    return { total, active, categories, totalNodes };
  }, [parameters]);

  const insertFormatting = (prefix) => {
    const field = "raw_content_en";
    setForm((prev) => ({
      ...prev,
      [field]: prev[field] ? `${prev[field]}\n${prefix} ` : `${prefix} `,
    }));
  };

  const tableHeaders = [
    {
      key: "code",
      label: "Code",
      render: (row) => (
        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded text-xs">
          {row.code}
        </span>
      ),
    },
    {
      key: "name_en",
      label: "Parameter Name",
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            {row.name_en}
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
          {row.category}
        </span>
      ),
    },
    {
      key: "normal_min",
      label: "Normal Range",
      filterable: false,
      render: (row) => (
        <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
          {row.normal_min} – {row.normal_max} {row.unit}
        </span>
      ),
    },
    {
      key: "selectable_nodes_count",
      label: "Content Items",
      render: (row) => {
        const count = row.selectable_nodes_count || (row.parsed_nodes_en?.length || 0);
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
            <Sparkles className="h-3 w-3" />
            {count > 0 ? `${count} Selectable Points` : "Legacy Bullets"}
          </span>
        );
      },
    },
    {
      key: "version",
      label: "Version",
      render: (row) => (
        <span className="font-mono text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 px-2 py-0.5 rounded">
          v{row.version || 1}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleParamStatus(row);
          }}
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${row.is_active !== false
            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
        >
          {row.is_active !== false ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      filterable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            title="View & Preview Parsed Tree"
            onClick={() => {
              setPreviewParam(row);
              setShowPreviewModal(true);
            }}
            className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title="Edit Parameter & Content"
            onClick={() => openEditModal(row)}
            className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title="Duplicate Parameter"
            onClick={() => handleDuplicate(row)}
            className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title="Delete Parameter"
            onClick={() => setDeletingParam(row)}
            className="h-8 w-8 p-0 text-slate-600 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-violet-800 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-xs uppercase font-bold tracking-widest">
            <Layers className="h-4 w-4" />
            <span>Master Data Management System</span>
          </div>
          <h1 className="text-2xl font-bold mt-1">
            Quantum Parameter Master Data
          </h1>
          <p className="text-xs text-indigo-100 mt-1 max-w-2xl">
            Manage the master data used by quantum analysis: parameters, content and their versions.
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl shadow-lg shrink-0 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Parameter</span>
        </Button>
      </div>

      {/* Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Parameters</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 shadow-xs">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Active Status</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{stats.active}</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-xl p-4 shadow-xs">
          <p className="text-xs text-indigo-600 dark:text-indigo-400 uppercase font-semibold">Parsed Content Nodes</p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">{stats.totalNodes}</p>
        </div>
        <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900 rounded-xl p-4 shadow-xs">
          <p className="text-xs text-violet-600 dark:text-violet-400 uppercase font-semibold">Categories</p>
          <p className="text-2xl font-bold text-violet-700 dark:text-violet-300 mt-1">{stats.categories}</p>
        </div>
      </div>

      {/* Category Multi-Select Filter Dropdown */}
      <div className="flex flex-wrap items-center gap-3">
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

        <p className="ml-auto text-xs text-slate-400 dark:text-slate-500">
          Showing {filteredParameters.length} of {parameters.length} parameters
        </p>
      </div>

      {/* Main Parameters Table */}
      <Card className="shadow-sm border-0">
        <CardContent className="p-6">
          <ReusableTable
            headers={tableHeaders}
            data={filteredParameters}
            loading={loading}
            Search="Search parameter code, name, or category..."
            CreateExportRender={() => (
              <Button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-xs">
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Parameter
              </Button>
            )}
            pagination={true}
            onRowClick={(row) => {
              setPreviewParam(row);
              setShowPreviewModal(true);
            }}
          />
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* FULL-FEATURED PARAMETER & CONTENT EDITOR MODAL */}
      {/* ========================================================================= */}
      {showEditorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    {editingParam ? `Edit Parameter: ${editingParam.code}` : "Create Quantum Parameter"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingParam ? `Current Version: v${editingParam.version || 1}` : "Version 1 (Initial Release)"}
                  </p>
                </div>
              </div>

              {/* Editor Tabs Navigation */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setEditorTab("details")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${editorTab === "details" ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs" : "text-slate-600"
                    }`}
                >
                  1. Parameter Details
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("content")}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${editorTab === "content" ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs" : "text-slate-600"
                    }`}
                >
                  <span>2. Smart Content Editor</span>
                  {parseDiagnostics.sectionsCount > 0 && (
                    <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 text-[10px] px-1.5 py-0.2 rounded-full">
                      {parseDiagnostics.bulletsCount + parseDiagnostics.subBulletsCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("preview")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${editorTab === "preview" ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs" : "text-slate-600"
                    }`}
                >
                  3. Report Preview
                </button>
              </div>

              <button
                onClick={() => setShowEditorModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
              {/* TAB 1: PARAMETER DETAILS */}
              {editorTab === "details" && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        Category *
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {dropdownCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Parameter Code — read-only in edit mode, auto-derived in create mode */}
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        Parameter Code
                        {!editingParam && (
                          <span className="ml-1.5 text-[10px] font-normal text-indigo-500 italic">(auto-generated from English name)</span>
                        )}
                      </label>
                      <div className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-mono uppercase bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 min-h-[38px] flex items-center">
                        {editingParam
                          ? form.code || "—"
                          : form.name_en
                            ? deriveCodeFromName(form.name_en)
                            : <span className="text-slate-300 dark:text-slate-600 text-xs italic">Type the English name above…</span>
                        }
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      English Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Blood Viscosity"
                      value={form.name_en}
                      onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        Normal Range Min *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="4.1"
                        value={form.normal_min}
                        onChange={(e) => setForm({ ...form, normal_min: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        Normal Range Max *
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        placeholder="5.2"
                        value={form.normal_max}
                        onChange={(e) => setForm({ ...form, normal_max: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>


                </div>
              )}

              {/* TAB 2: SMART CONTENT EDITOR (SPLIT VIEW) */}
              {editorTab === "content" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  {/* Left Column: Raw Multi-Line Input with Template helpers */}
                  <div className="space-y-3 flex flex-col">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-slate-500">Content (English)</span>
                      </div>
                    </div>

                    {/* Formatting Helper Buttons */}
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border text-xs">
                      <button
                        type="button"
                        onClick={() => insertFormatting("1. Section Heading")}
                        className="px-2 py-1 rounded bg-white dark:bg-slate-700 border hover:bg-slate-100 text-[11px] font-semibold"
                      >
                        + Section
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("* Bullet Point")}
                        className="px-2 py-1 rounded bg-white dark:bg-slate-700 border hover:bg-slate-100 text-[11px] font-semibold"
                      >
                        + Bullet
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("  * Sub-bullet")}
                        className="px-2 py-1 rounded bg-white dark:bg-slate-700 border hover:bg-slate-100 text-[11px] font-semibold"
                      >
                        + Sub-bullet
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("3. Recommendations (Pathya / Parhej)")}
                        className="px-2 py-1 rounded bg-white dark:bg-slate-700 border hover:bg-slate-100 text-[11px] font-semibold"
                      >
                        + Recommendations
                      </button>
                    </div>

                    {/* Raw Multi-Line Textarea */}
                    <textarea
                      rows={14}
                      value={form.raw_content_en}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          raw_content_en: val,
                        }));
                      }}
                      placeholder="Paste or type multi-line content. Lines starting with bullets (• or -) are parsed automatically."
                      className="w-full flex-1 rounded-xl border border-slate-200 dark:border-slate-700 p-3 font-mono text-xs leading-relaxed bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Right Column: Real-Time Parsed Hierarchy Tree & Validation Diagnostics */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-600" />
                        <span className="font-bold text-xs uppercase text-slate-700 dark:text-slate-200">
                          Automatic Parse Preview
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                          {`${parseDiagnostics.sectionsCount} Sections`}
                        </span>
                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                          {`${parseDiagnostics.bulletsCount + parseDiagnostics.subBulletsCount} Bullets`}
                        </span>
                      </div>
                    </div>

                    {/* Diagnostics Alert Banner */}
                    {parseDiagnostics.warnings.length > 0 && (
                      <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 rounded-lg text-xs text-amber-800 dark:text-amber-200 space-y-1">
                        {parseDiagnostics.warnings.map((w, idx) => (
                          <p key={idx} className="flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            {w}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Parsed Nodes Tree */}
                    <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2 pr-1 text-xs">
                      {parseDiagnostics?.nodes?.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                          No parsed content yet. Paste multi-line content to see the preview.
                        </div>
                      ) : (
                        parseDiagnostics?.nodes?.map((node) => {
                          if (node.nodeType === NODE_TYPES.SECTION || node.level === 0) {
                            return (
                              <div
                                key={node.id}
                                className="mt-3 first:mt-0 font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 p-2 rounded-lg border border-indigo-100 flex items-center justify-between"
                              >
                                <span className="flex items-center gap-1.5">
                                  <ChevronRight className="h-3.5 w-3.5 text-indigo-500" />
                                  {node.content}
                                </span>
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-white dark:bg-indigo-900 rounded text-indigo-600">
                                  {node.categoryType}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={node.id}
                              className={`p-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-start gap-2 ${node.level > 1 ? "ml-5 border-l-2 border-l-violet-400 bg-slate-50/50" : ""
                                }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="leading-snug">{node.content}</p>
                              </div>
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 shrink-0">
                                {node.nodeType}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: REPORT PREVIEW */}
              {editorTab === "preview" && (
                <div className="max-w-2xl mx-auto border rounded-xl p-6 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mr-2">
                        {form.code || "P001"}
                      </span>
                      <strong className="text-base text-slate-900 dark:text-white">
                        {form.name_en || "Parameter Name"}
                      </strong>
                    </div>
                    <span className="text-xs text-slate-400">
                      Normal: {form.normal_min || 0} – {form.normal_max || 0} {form.unit}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {parseDiagnostics?.nodes?.map((node) => {
                      if (node.nodeType === NODE_TYPES.SECTION || node.level === 0) {
                        return (
                          <h4 key={node.id} className="text-xs font-bold uppercase text-indigo-600 tracking-wider pt-2">
                            ▸ {node.content}
                          </h4>
                        );
                      }
                      return (
                        <div key={node.id} className={`flex items-start gap-2 text-xs ${node.level > 1 ? "ml-4 text-slate-500" : "text-slate-800"}`}>
                          <span>•</span>
                          <span>{node.content}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div>
                {editorTab !== "details" && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEditorTab(editorTab === "preview" ? "content" : "details")}
                    className="text-xs"
                  >
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setShowEditorModal(false)}>
                  Cancel
                </Button>

                {editorTab !== "preview" && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditorTab(editorTab === "details" ? "content" : "preview")}
                  >
                    {editorTab === "details" ? "Next: Content Editor" : "Next: Preview"}
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => handleSaveParameter("DRAFT")}
                  className="border-slate-300"
                >
                  Save as Draft
                </Button>

                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveParameter("PUBLISHED")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  {saving ? "Publishing..." : editingParam ? `Publish Update (v${String((editingParam.version || 1) + 1)})` : "Publish Parameter"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK VIEW & PREVIEW MODAL */}
      {/* ========================================================================= */}
      {showPreviewModal && previewParam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-600 text-xs bg-indigo-50 px-2 py-0.5 rounded">
                    {previewParam.code}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{previewParam.name_en}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {`Category: ${previewParam.category} • Range: ${previewParam.normal_min}–${previewParam.normal_max} ${previewParam.unit} • Version: v${previewParam.version || 1}`}
                </p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {(previewParam.parsed_nodes_en || []).length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  No parsed nodes found. Click Edit to paste multi-line content.
                </div>
              ) : (
                previewParam.parsed_nodes_en.map((node) => {
                  if (node.nodeType === "section" || node.level === 0) {
                    return (
                      <div key={node.id} className="font-bold text-indigo-700 bg-indigo-50 p-2 rounded-md mt-3 first:mt-0">
                        {node.content}
                      </div>
                    );
                  }
                  return (
                    <div key={node.id} className={`p-2 border rounded-md ${node.level > 1 ? "ml-4 bg-slate-50" : "bg-white"}`}>
                      {node.content}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowPreviewModal(false);
                  openEditModal(previewParam);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Pencil className="mr-1.5 h-4 w-4" /> Edit Content
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {deletingParam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-rose-200">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold">Delete Quantum Parameter</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {`Are you sure you want to delete parameter ${deletingParam.code} - ${deletingParam.name_en}? This will remove all associated parsed content versions.`}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeletingParam(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteParameter}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
