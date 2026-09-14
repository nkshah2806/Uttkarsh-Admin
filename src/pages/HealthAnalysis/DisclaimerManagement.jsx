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
import { useTranslation } from "react-i18next";
import ReusableTable from "@/components/ReusableTable";
import LocalizedText from "@/components/LocalizedText";

export default function DisclaimerManagement() {
  const { t } = useTranslation();
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
      toast.error(err.response?.data?.message || t("healthAnalysis.disclaimer.loadFailed"));
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
      toast.error(t("healthAnalysis.disclaimer.requiredFields"));
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
        toast.success(res.data.message || t("healthAnalysis.disclaimer.updatedSuccess"));
        setEditingDisclaimer(null);
      } else {
        // Create
        const res = await axiosInstance.post("v1/disclaimers", form);
        toast.success(res.data.message || t("healthAnalysis.disclaimer.createdSuccess"));
        setShowCreateModal(false);
      }

      fetchDisclaimers();
    } catch (err) {
      toast.error(err.response?.data?.message || t("healthAnalysis.disclaimer.saveFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const res = await axiosInstance.patch(
        `v1/disclaimers/${item._id}/toggle-status`
      );
      toast.success(res.data.message || t("healthAnalysis.disclaimer.statusSuccess"));
      fetchDisclaimers();
    } catch (err) {
      toast.error(err.response?.data?.message || t("healthAnalysis.disclaimer.statusFailed"));
    }
  };

  const handleDelete = async () => {
    if (!deletingDisclaimer) return;
    try {
      setSubmitting(true);
      await axiosInstance.delete(`v1/disclaimers/${deletingDisclaimer._id}`);
      toast.success(t("healthAnalysis.disclaimer.deletedSuccess"));
      setDeletingDisclaimer(null);
      fetchDisclaimers();
    } catch (err) {
      toast.error(err.response?.data?.message || t("healthAnalysis.disclaimer.deleteFailed"));
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
      label: t("healthAnalysis.disclaimer.colTitle"),
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              <LocalizedText value={row.title} />
            </span>
            {row.is_active && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {t("healthAnalysis.disclaimer.activeInReports")}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 max-w-md">
            <LocalizedText value={row.content} />
          </p>
        </div>
      ),
    },
    {
      key: "is_active",
      label: t("healthAnalysis.disclaimer.colStatus"),
      render: (row) => (
        <div>
          <button
            onClick={() => handleToggleStatus(row)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${row.is_active
              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            title={t("healthAnalysis.disclaimer.toggleTitle")}
          >
            {row.is_active ? (
              <>
                <Check className="h-3 w-3" /> {t("healthAnalysis.disclaimer.active")}
              </>
            ) : (
              <>
                <X className="h-3 w-3" /> {t("healthAnalysis.disclaimer.inactive")}
              </>
            )}
          </button>
        </div>
      ),
    },
    {
      key: "updatedAt",
      label: t("healthAnalysis.disclaimer.colLastUpdated"),
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
            <p className="text-[11px] text-slate-400 mt-0.5 inline-flex items-baseline gap-x-1">
              <span>{t("healthAnalysis.disclaimer.by")}</span>
              <span>{row.updated_by.fullName || row.updated_by.username}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: t("healthAnalysis.disclaimer.colActions"),
      filterable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Preview */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPreviewDisclaimer(row)}
            className="h-8 px-2.5 text-xs font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-950"
            title={t("healthAnalysis.disclaimer.previewTitle")}
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> {t("healthAnalysis.disclaimer.preview")}
          </Button>

          {/* Edit */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditModal(row)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
            title={t("healthAnalysis.disclaimer.editTitle")}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          {/* Delete */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeletingDisclaimer(row)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50"
            title={t("healthAnalysis.disclaimer.deleteTitle")}
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
            <span>{t("healthAnalysis.disclaimer.bannerEyebrow")}</span>
          </div>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">
            {t("healthAnalysis.disclaimer.bannerTitle")}
          </h1>
          <p className="text-sm text-indigo-100 mt-1 max-w-2xl">
            {t("healthAnalysis.disclaimer.bannerDesc")}
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          <span>{t("healthAnalysis.disclaimer.addNew")}</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("healthAnalysis.disclaimer.cardTotal")}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {totalCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t("healthAnalysis.disclaimer.cardTotalHint")}</p>
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
                {t("healthAnalysis.disclaimer.cardActive")}
              </p>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 truncate max-w-[200px]" title={activeDisclaimer?.title}>
                {activeDisclaimer ? activeDisclaimer.title : t("healthAnalysis.disclaimer.noneActive")}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{t("healthAnalysis.disclaimer.cardActiveHint")}</p>
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
                {t("healthAnalysis.disclaimer.cardInactive")}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {inactiveCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t("healthAnalysis.disclaimer.cardInactiveHint")}</p>
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
                {t("healthAnalysis.disclaimer.tableTitle")}
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t("healthAnalysis.disclaimer.tableDesc")}
              </p>
            </div>
            <Button
              onClick={openCreateModal}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold self-start sm:self-auto"
            >
              <Plus className="h-4 w-4 mr-1.5" /> {t("healthAnalysis.disclaimer.addDisclaimer")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <ReusableTable
            headers={headers}
            data={disclaimers}
            loading={loading}
            Search={t("healthAnalysis.disclaimer.searchPlaceholder")}
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
                    {editingDisclaimer ? t("healthAnalysis.disclaimer.modalEditTitle") : t("healthAnalysis.disclaimer.modalCreateTitle")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingDisclaimer
                      ? t("healthAnalysis.disclaimer.modalEditSubtitle")
                      : t("healthAnalysis.disclaimer.modalCreateSubtitle")}
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
                  {t("healthAnalysis.disclaimer.titleLabel")} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("healthAnalysis.disclaimer.titlePlaceholder")}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  {t("healthAnalysis.disclaimer.contentLabel")} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder={t("healthAnalysis.disclaimer.contentPlaceholder")}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {t("healthAnalysis.disclaimer.contentTip")}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {t("healthAnalysis.disclaimer.activeLabel")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t("healthAnalysis.disclaimer.activeHint")}
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
                  {t("healthAnalysis.disclaimer.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5"
                >
                  {submitting ? t("healthAnalysis.disclaimer.saving") : editingDisclaimer ? t("healthAnalysis.disclaimer.updateBtn") : t("healthAnalysis.disclaimer.createBtn")}
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
                  {t("healthAnalysis.disclaimer.previewModalTitle")}
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
                      {t("healthAnalysis.disclaimer.previewCompany")}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {t("healthAnalysis.disclaimer.previewTagline")}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                    {t("healthAnalysis.disclaimer.previewFinalPage")}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider mb-2">
                    {t("healthAnalysis.disclaimer.previewDisclaimerBadge")}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    <LocalizedText value={previewDisclaimer.title} />
                  </h3>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed text-justify whitespace-pre-line border-t pt-3">
                  <LocalizedText value={previewDisclaimer.content} />
                </div>

                <div className="pt-6 border-t border-dashed flex items-end justify-between text-[11px] text-slate-400">
                  <div>
                    <p className="font-semibold text-slate-600 dark:text-slate-300">{t("healthAnalysis.disclaimer.previewCenter")}</p>
                    <p>{t("healthAnalysis.disclaimer.previewSystem")}</p>
                  </div>
                  <div className="text-center border-t border-slate-400 pt-1 w-40">
                    {t("healthAnalysis.disclaimer.previewSignatory")}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setPreviewDisclaimer(null)} variant="outline">
                {t("healthAnalysis.disclaimer.closePreview")}
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
                  {t("healthAnalysis.disclaimer.deleteConfirmTitle")}
                </h3>
                <p className="text-xs text-slate-500">{t("healthAnalysis.disclaimer.deleteCannotUndo")}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t("healthAnalysis.disclaimer.deleteConfirmPrefix")}{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                "<LocalizedText value={deletingDisclaimer.title} />"
              </strong>
              ?
              {deletingDisclaimer.is_active && (
                <span className="block mt-2 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/50 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                  {t("healthAnalysis.disclaimer.deleteActiveNote")}
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingDisclaimer(null)}
                disabled={submitting}
              >
                {t("healthAnalysis.disclaimer.cancel")}
              </Button>
              <Button
                onClick={handleDelete}
                disabled={submitting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                {submitting ? t("healthAnalysis.disclaimer.deleting") : t("healthAnalysis.disclaimer.confirmDelete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
