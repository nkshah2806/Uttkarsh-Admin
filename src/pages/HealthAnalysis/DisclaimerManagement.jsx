import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  Globe,
  RotateCcw,
  Check,
  X,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";
import ReusableTable from "@/components/ReusableTable";

export default function DisclaimerManagement() {
  const [disclaimers, setDisclaimers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDisclaimer, setEditingDisclaimer] = useState(null);
  const [previewDisclaimer, setPreviewDisclaimer] = useState(null);
  const [deletingDisclaimer, setDeletingDisclaimer] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: "",
    content: "",
    is_active: true,
  });

  useEffect(() => {
    fetchDisclaimers();
  }, []);

  const fetchDisclaimers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("v1/disclaimers");
      setDisclaimers(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load disclaimers");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingDisclaimer(null);
    setForm({
      title: "",
      content: "",
      is_active: disclaimers.length === 0, // default active if first one
    });
    setShowCreateModal(true);
  };

  const openEditModal = (item) => {
    setEditingDisclaimer(item);
    setForm({
      title: item.title || "",
      content: item.content || "",
      is_active: Boolean(item.is_active),
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Please provide both disclaimer title and content");
      return;
    }

    try {
      setSubmitting(true);

      if (editingDisclaimer) {
        // Update
        const res = await axiosInstance.put(
          `v1/disclaimers/${editingDisclaimer._id}`,
          form
        );
        toast.success(res.data.message || "Disclaimer updated successfully");
        setEditingDisclaimer(null);
      } else {
        // Create
        const res = await axiosInstance.post("v1/disclaimers", form);
        toast.success(res.data.message || "New disclaimer created successfully");
        setShowCreateModal(false);
      }

      fetchDisclaimers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save disclaimer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const res = await axiosInstance.patch(
        `v1/disclaimers/${item._id}/toggle-status`
      );
      toast.success(res.data.message || "Status updated successfully");
      fetchDisclaimers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deletingDisclaimer) return;
    try {
      setSubmitting(true);
      await axiosInstance.delete(`v1/disclaimers/${deletingDisclaimer._id}`);
      toast.success("Disclaimer deleted successfully");
      setDeletingDisclaimer(null);
      fetchDisclaimers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete disclaimer");
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const totalCount = disclaimers.length;
  const activeDisclaimer = disclaimers.find((d) => d.is_active);
  const inactiveCount = disclaimers.filter((d) => !d.is_active).length;

  const headers = [
    {
      key: "title",
      label: "Disclaimer Title",
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {row.title}
            </span>
            {row.is_active && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active in Reports
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 max-w-md">
            {row.content}
          </p>
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <div>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${row.is_active
              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            title="Click to toggle active status"
          >
            {row.is_active ? (
              <>
                <Check className="h-3 w-3" /> Active
              </>
            ) : (
              <>
                <X className="h-3 w-3" /> Inactive
              </>
            )}
          </button>
        </div>
      ),
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      render: (row) => (
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {new Date(row.updatedAt || row.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          {row.updated_by && (
            <p className="text-[11px] text-slate-400 mt-0.5">
              by {row.updated_by.fullName || row.updated_by.username}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      filterable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Preview */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPreviewDisclaimer(row)}
            className="h-8 px-2.5 text-xs font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-950"
            title="Preview PDF Final Page Simulation"
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> Preview
          </Button>

          {/* Edit */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditModal(row)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
            title="Edit Disclaimer"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          {/* Delete */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeletingDisclaimer(row)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50"
            title="Delete Disclaimer"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-violet-800 p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-200">
            <ShieldCheck className="h-4 w-4" />
            <span>Report Management Module</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">
            Disclaimer Content Management
          </h1>
          <p className="text-sm text-indigo-100 mt-1 max-w-2xl">
            Configure the legal & clinical disclaimer that automatically attaches as the dedicated final page of all newly generated Quantum Health Analysis PDF reports.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Add New Disclaimer</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Disclaimers
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {totalCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Versions in database</p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/10">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Active Report Disclaimer
              </p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 truncate max-w-[200px]" title={activeDisclaimer?.title}>
                {activeDisclaimer ? activeDisclaimer.title : "None Active"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Used for new PDF generations</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Inactive Archives
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {inactiveCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Archived revisions</p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimers Table Card */}
      <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <FileCheck2 className="h-4 w-4 text-indigo-600" />
                Configured Disclaimers
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Only one disclaimer can be active at any given time. Activating another will automatically set previous versions to inactive.
              </p>
            </div>
            <Button
              onClick={openCreateModal}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold self-start sm:self-auto"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Disclaimer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <ReusableTable
            headers={headers}
            data={disclaimers}
            loading={loading}
            Search="Search disclaimers by title or content..."
          />
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* CREATE / EDIT MODAL */}
      {/* ========================================================================= */}
      {(showCreateModal || editingDisclaimer) && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {editingDisclaimer ? "Edit Disclaimer Content" : "Create New Disclaimer"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingDisclaimer
                      ? "Update disclaimer title, paragraphs, and active status"
                      : "Add a new disclaimer to be attached to PDF reports"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingDisclaimer(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Disclaimer Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Wellness Assessment Disclaimer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Disclaimer Content (English) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Enter formatted disclaimer paragraphs. Use blank lines between paragraphs or numbered points (e.g. 1. Informational Purpose, 2. Non-Diagnostic...)"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Tip: Separate distinct clauses with empty lines. They will be rendered as clean justified paragraphs on the final PDF page.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Set as Active Disclaimer
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Activating this will automatically deactivate any other currently active disclaimer.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingDisclaimer(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5"
                >
                  {submitting ? "Saving..." : editingDisclaimer ? "Update Disclaimer" : "Create Disclaimer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PREVIEW SIMULATION MODAL */}
      {/* ========================================================================= */}
      {previewDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  PDF Final Page Disclaimer Simulation
                </h3>
              </div>
              <button
                onClick={() => setPreviewDisclaimer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Paper simulation */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
              <div className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">
                      UTKARSH QUANTUM HEALTHCARE & WELLNESS
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Cellular Resonance & Ayurvedic Wellness Evaluation · AYUSH Compliant
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                    FINAL PAGE
                  </span>
                </div>

                <div className="pt-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider mb-2">
                    ⚠ Disclaimer
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {previewDisclaimer.title}
                  </h3>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed text-justify whitespace-pre-line border-t pt-3">
                  {previewDisclaimer.content}
                </div>

                <div className="pt-6 border-t border-dashed flex items-end justify-between text-[11px] text-slate-400">
                  <div>
                    <p className="font-semibold text-slate-600 dark:text-slate-300">Wellness Assessment Center</p>
                    <p>Utkarsh Quantum Wellness Assessment System</p>
                  </div>
                  <div className="text-center border-t border-slate-400 pt-1 w-40">
                    Authorized Signatory / Seal
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setPreviewDisclaimer(null)} variant="outline">
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Delete Disclaimer?
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                "{deletingDisclaimer.title}"
              </strong>
              ?
              {deletingDisclaimer.is_active && (
                <span className="block mt-2 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                  ⚠ Note: This is currently the Active disclaimer. After deletion, no disclaimer will be active until you select or create one.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingDisclaimer(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={submitting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                {submitting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
