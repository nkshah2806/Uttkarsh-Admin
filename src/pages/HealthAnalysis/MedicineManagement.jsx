import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            toast.error(err.response?.data?.message || "Failed to load medicines");
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
            toast.error("Medicine name is required");
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
                toast.success("Medicine updated successfully");
                setEditingMedicine(null);
            } else {
                await medicineService.createMedicine(payload);
                toast.success("Medicine created successfully");
            }

            setShowCreateModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save medicine");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (item) => {
        try {
            await medicineService.updateMedicine(item._id, {
                is_active: !item.is_active,
            });
            toast.success("Medicine status updated successfully");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to toggle status");
        }
    };

    const handleDelete = async () => {
        if (!deletingMedicine) return;
        try {
            setSubmitting(true);
            await medicineService.deleteMedicine(deletingMedicine._id);
            toast.success("Medicine deleted successfully");
            setDeletingMedicine(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete medicine");
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
            label: "Medicine Name",
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
            label: "Details",
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
            label: "Dosage / Usage",
            render: (row) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-violet-50 dark:bg-violet-950/50 text-xs font-semibold text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-900">
                    {row.dosage || "—"}
                </span>
            ),
        },
        {
            key: "is_active",
            label: "Status",
            render: (row) => (
                <button
                    onClick={() => handleToggleStatus(row)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${row.is_active !== false
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                    title="Click to toggle active status"
                >
                    {row.is_active !== false ? (
                        <>
                            <Power className="h-3 w-3" /> Active
                        </>
                    ) : (
                        <>
                            <X className="h-3 w-3" /> Inactive
                        </>
                    )}
                </button>
            ),
        },
        {
            key: "updatedAt",
            label: "Last Updated",
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
            label: "Actions",
            filterable: false,
            render: (row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(row)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
                        title="Edit Medicine"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingMedicine(row)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50"
                        title="Delete Medicine"
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
                        <span>Quantum Health Analysis</span>
                    </div>
                    <h1 className="text-2xl font-bold mt-1 tracking-tight">
                        Medicine Management
                    </h1>
                    <p className="text-sm text-violet-100 mt-1 max-w-2xl">
                        Manage the medicines shown in the report medicine selection. Only the active medicines added here appear in the report point selection.
                    </p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="bg-white text-violet-700 hover:bg-violet-50 font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add New Medicine</span>
                </Button>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Total Medicines
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {totalCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Medicines in the library
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
                                Active Medicines
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {activeCount}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Shown in selection
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
                                Inactive Medicines
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {inactiveCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Hidden from selection
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
                                With Dosage
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {withDosageCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Dosage info provided
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
                                Medicine Management
                            </CardTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Only medicines added by admins are shown in the report medicine selection.
                            </p>
                        </div>
                        <Button
                            onClick={openCreateModal}
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold self-start sm:self-auto"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> Add Medicine
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <ReusableTable
                        headers={headers}
                        data={medicines}
                        loading={loading}
                        Search="Search medicines by name, details or dosage..."
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
                                        {editingMedicine ? "Edit Medicine" : "Create Medicine"}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {editingMedicine
                                            ? "Update medicine details and active status"
                                            : "Add a new medicine to the library"}
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
                                    Medicine Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Triphala Churna"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Details
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Short description of this medicine"
                                    value={form.details}
                                    onChange={(e) => setForm({ ...form, details: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Dosage / Usage
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. 1 teaspoon twice daily after meals"
                                    value={form.dosage}
                                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            </div>

                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        Active Medicine
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Inactive medicines are hidden from the report medicine selection dropdown.
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
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5"
                                >
                                    {submitting
                                        ? "Saving..."
                                        : editingMedicine
                                            ? "Update Medicine"
                                            : "Create Medicine"}
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
                                    Delete Medicine?
                                </h3>
                                <p className="text-xs text-slate-500">This action cannot be undone.</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {`Are you sure you want to delete medicine "${deletingMedicine.name}"?`}
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingMedicine(null)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={submitting}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                            >
                                {submitting ? "Deleting..." : "Are you sure you want to delete this item? This action cannot be undone."}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
