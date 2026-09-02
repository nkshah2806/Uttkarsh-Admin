import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import {
    Pill,
    Plus,
    Pencil,
    Trash2,
    AlertTriangle,
    Check,
    X,
    Clock,
    Sparkles,
    FileText,
    Power,
} from "lucide-react";
import { toast } from "sonner";
import ReusableTable from "@/components/ReusableTable";
import { medicineService } from "@/services/medicineService";

export default function MedicineManagement() {
    const { t } = useLanguage();

    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [deletingMedicine, setDeletingMedicine] = useState(null);

    // Form State
    const [form, setForm] = useState({
        name: "",
        details: "",
        dosage: "",
        is_active: true,
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const medRes = await medicineService.getMedicines();
            setMedicines(medRes || []);
        } catch (err) {
            toast.error(err.response?.data?.message || t("failedLoadMedicines"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateModal = () => {
        setEditingMedicine(null);
        setForm({
            name: "",
            details: "",
            dosage: "",
            is_active: true,
        });
        setShowCreateModal(true);
    };

    const openEditModal = (item) => {
        setEditingMedicine(item);
        setForm({
            name: item.name || "",
            details: item.details || "",
            dosage: item.dosage || "",
            is_active: Boolean(item.is_active),
        });
        setShowCreateModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error(t("medicineNameRequired"));
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: form.name.trim(),
                details: form.details?.trim() || "",
                dosage: form.dosage?.trim() || "",
                is_active: Boolean(form.is_active),
            };

            if (editingMedicine) {
                await medicineService.updateMedicine(editingMedicine._id, payload);
                toast.success(t("medicineUpdated"));
                setEditingMedicine(null);
            } else {
                await medicineService.createMedicine(payload);
                toast.success(t("medicineCreated"));
            }

            setShowCreateModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || t("failedSaveMedicine"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (item) => {
        try {
            await medicineService.updateMedicine(item._id, {
                is_active: !item.is_active,
            });
            toast.success(t("medicineStatusChanged"));
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || t("failedToggleStatus"));
        }
    };

    const handleDelete = async () => {
        if (!deletingMedicine) return;
        try {
            setSubmitting(true);
            await medicineService.deleteMedicine(deletingMedicine._id);
            toast.success(t("medicineDeleted"));
            setDeletingMedicine(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || t("failedDeleteMedicine"));
        } finally {
            setSubmitting(false);
        }
    };

    // Metrics
    const totalCount = medicines.length;
    const activeCount = medicines.filter((m) => m.is_active !== false).length;
    const inactiveCount = totalCount - activeCount;
    const withDosageCount = medicines.filter((m) => (m.dosage || "").trim()).length;

    const headers = [
        {
            key: "name",
            label: t("medicineName"),
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                        <Pill className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {row.name}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "details",
            label: t("medicineDetails"),
            render: (row) => (
                <div className="flex items-start gap-1.5 max-w-md">
                    <FileText className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {row.details || "—"}
                    </span>
                </div>
            ),
        },
        {
            key: "dosage",
            label: t("medicineDosage"),
            render: (row) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-violet-50 dark:bg-violet-950/50 text-xs font-semibold text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900">
                    {row.dosage || "—"}
                </span>
            ),
        },
        {
            key: "is_active",
            label: t("status"),
            render: (row) => (
                <button
                    onClick={() => handleToggleStatus(row)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${row.is_active !== false
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                    title={t("toggleStatusHint")}
                >
                    {row.is_active !== false ? (
                        <>
                            <Power className="h-3 w-3" /> {t("active")}
                        </>
                    ) : (
                        <>
                            <X className="h-3 w-3" /> {t("inactive")}
                        </>
                    )}
                </button>
            ),
        },
        {
            key: "updatedAt",
            label: t("lastUpdated"),
            render: (row) => (
                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                        {new Date(row.updatedAt || row.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}
                    </span>
                </div>
            ),
        },
        {
            key: "actions",
            label: t("actions"),
            filterable: false,
            render: (row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(row)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
                        title={t("editMedicine")}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingMedicine(row)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50"
                        title={t("deleteMedicine")}
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
            <div className="rounded-2xl bg-gradient-to-r from-violet-700 via-purple-800 to-fuchsia-800 p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-200">
                        <Sparkles className="h-4 w-4" />
                        <span>{t("quantumModule")}</span>
                    </div>
                    <h1 className="text-2xl font-bold mt-1 tracking-tight">
                        {t("medicineManagement")}
                    </h1>
                    <p className="text-sm text-violet-100 mt-1 max-w-2xl">
                        {t("medicineManagementSubtitle")}
                    </p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="bg-white text-violet-700 hover:bg-violet-50 font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="h-5 w-5" />
                    <span>{t("addNewMedicine")}</span>
                </Button>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t("totalMedicines")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {totalCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {t("medicinesAvailable")}
                            </p>
                        </div>
                        <div className="p-3 bg-violet-50 dark:bg-violet-950/60 rounded-xl text-violet-600 dark:text-violet-400">
                            <Pill className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                {t("activeMedicines")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {activeCount}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                {t("shownInSelection")}
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <Check className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t("inactiveMedicines")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {inactiveCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {t("hiddenFromSelection")}
                            </p>
                        </div>
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                            <X className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t("medicinesWithDosage")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {withDosageCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {t("dosageInfoProvided")}
                            </p>
                        </div>
                        <div className="p-3 bg-fuchsia-50 dark:bg-fuchsia-950/60 rounded-xl text-fuchsia-600 dark:text-fuchsia-400">
                            <FileText className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Medicines Table Card */}
            <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                <Pill className="h-4 w-4 text-violet-600" />
                                {t("medicineManagement")}
                            </CardTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {t("onlyAdminAddedMedicines")}
                            </p>
                        </div>
                        <Button
                            onClick={openCreateModal}
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold self-start sm:self-auto"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> {t("addMedicine")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <ReusableTable
                        headers={headers}
                        data={medicines}
                        loading={loading}
                        Search={t("searchMedicinePlaceholder")}
                    />
                </CardContent>
            </Card>

            {/* ========================================================================= */}
            {/* CREATE / EDIT MODAL */}
            {/* ========================================================================= */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-violet-50 dark:bg-violet-950/60 rounded-xl text-violet-600 dark:text-violet-400">
                                    <Pill className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        {editingMedicine ? t("editMedicine") : t("createMedicine")}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {editingMedicine
                                            ? t("editMedicineSubtitle")
                                            : t("createMedicineSubtitle")}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingMedicine(null);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    {t("medicineName")} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder={t("medicineNamePlaceholder")}
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    {t("medicineDetails")}
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder={t("medicineDetailsPlaceholder")}
                                    value={form.details}
                                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    {t("medicineDosage")}
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder={t("medicineDosagePlaceholder")}
                                    value={form.dosage}
                                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>

                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {t("medicineActive")}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t("medicineActiveHint")}
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
                                        setEditingMedicine(null);
                                    }}
                                    disabled={submitting}
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5"
                                >
                                    {submitting
                                        ? t("saving")
                                        : editingMedicine
                                            ? t("updateMedicine")
                                            : t("createMedicine")}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* DELETE CONFIRMATION MODAL */}
            {/* ========================================================================= */}
            {deletingMedicine && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    {t("deleteMedicine")}?
                                </h3>
                                <p className="text-xs text-slate-500">{t("actionCannotUndone")}</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {t("confirmDeleteMedicine").replace(
                                "{name}",
                                deletingMedicine.name
                            )}
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingMedicine(null)}
                                disabled={submitting}
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={submitting}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                            >
                                {submitting ? t("deleting") : t("confirmDelete")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
