import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BadgeCheck,
    Plus,
    Pencil,
    Trash2,
    AlertTriangle,
    Check,
    X,
    Clock,
    Sparkles,
    IndianRupee,
    Tag,
    Star,
    Power,
} from "lucide-react";
import { toast } from "sonner";
import ReusableTable from "@/components/ReusableTable";
import { scanPricingService } from "@/services/scanPricingService";

export default function ScanPricingManagement() {

    const [pricings, setPricings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPricing, setEditingPricing] = useState(null);
    const [deletingPricing, setDeletingPricing] = useState(null);

    // Form State
    const emptyForm = {
        name: "",
        description: "",
        amount: "",
        is_active: true,
        is_default: false,
    };
    const [form, setForm] = useState(emptyForm);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await scanPricingService.getScanPricings();
            setPricings(res || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load scan pricings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateModal = () => {
        setEditingPricing(null);
        setForm({ ...emptyForm });
        setShowCreateModal(true);
    };

    const openEditModal = (item) => {
        setEditingPricing(item);
        setForm({
            name: item.name || "",
            description: item.description || "",
            amount: item.amount ?? "",
            is_active: item.is_active !== false,
            is_default: Boolean(item.is_default),
        });
        setShowCreateModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error("Please enter the scan price name");
            return;
        }
        if (form.amount === "" || isNaN(Number(form.amount)) || Number(form.amount) < 0) {
            toast.error("Please enter a valid scan price amount");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: form.name.trim(),
                description: form.description?.trim() || "",
                amount: Number(form.amount),
                is_active: Boolean(form.is_active),
                is_default: Boolean(form.is_default),
            };

            if (editingPricing) {
                await scanPricingService.updateScanPricing(editingPricing._id, payload);
                toast.success("Scan pricing updated successfully");
                setEditingPricing(null);
            } else {
                await scanPricingService.createScanPricing(payload);
                toast.success("Scan pricing created successfully");
            }

            setShowCreateModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save scan pricing");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (item) => {
        try {
            await scanPricingService.updateScanPricing(item._id, {
                is_active: item.is_active !== false ? false : true,
            });
            toast.success("Scan pricing status updated successfully");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to toggle status");
        }
    };

    const handleSetDefault = async (item) => {
        try {
            await scanPricingService.updateScanPricing(item._id, { is_default: true });
            toast.success("Default scan pricing set successfully");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to set default scan pricing");
        }
    };

    const handleDelete = async () => {
        if (!deletingPricing) return;
        try {
            setSubmitting(true);
            const res = await scanPricingService.deleteScanPricing(deletingPricing._id);
            if (res?.data?.deactivated) {
                toast.success("Scan pricing cannot be deleted as it is used in scans. It has been deactivated instead.");
            } else {
                toast.success("Scan pricing deleted successfully");
            }
            setDeletingPricing(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete scan pricing");
        } finally {
            setSubmitting(false);
        }
    };

    // Metrics
    const totalCount = pricings.length;
    const activeCount = pricings.filter((p) => p.is_active !== false).length;
    const inactiveCount = totalCount - activeCount;
    const defaultPricing = pricings.find((p) => p.is_active !== false && p.is_default);

    const headers = [
        {
            key: "name",
            label: "Scan Price Name",
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                        <Tag className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <span className="block font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                            {row.name}
                        </span>
                        <span className="block text-[11px] text-slate-400 truncate max-w-xs">
                            {row.description || "—"}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "amount",
            label: "Scan Price (₹)",
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-4 w-4 text-emerald-500" />
                    <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {Number(row.amount).toLocaleString("en-IN")}
                    </span>
                </div>
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
            key: "is_default",
            label: "Default Price",
            render: (row) =>
                row.is_active !== false && row.is_default ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/50 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        Default
                    </span>
                ) : row.is_active !== false ? (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSetDefault(row)}
                        className="h-7 px-2 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                    >
                        <Star className="h-3 w-3 mr-1" />
                        Set as Default
                    </Button>
                ) : (
                    <span className="text-xs text-slate-400">—</span>
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
                        title="Edit Scan Pricing"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingPricing(row)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50"
                        title="Delete Scan Pricing"
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
            <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-orange-700 p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-100">
                        <Sparkles className="h-4 w-4" />
                        <span>Quantum Health Analysis</span>
                    </div>
                    <h1 className="text-2xl font-bold mt-1 tracking-tight">
                        Scan Pricing Management
                    </h1>
                    <p className="text-sm text-amber-100 mt-1 max-w-2xl">
                        Configure the scan prices available when a new scan is created. The default price is applied automatically.
                    </p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="bg-white text-orange-700 hover:bg-orange-50 font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add New Scan Pricing</span>
                </Button>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Total Scan Pricings
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {totalCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Pricing configurations
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
                            <Tag className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                Active Scan Pricings
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {activeCount}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Shown when creating a new scan
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
                                Inactive Scan Pricings
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {inactiveCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Hidden from new scan creation
                            </p>
                        </div>
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                            <X className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800 bg-amber-50/40 dark:bg-amber-950/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                Default Scan Price
                            </p>
                            {defaultPricing ? (
                                <>
                                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                        ₹{Number(defaultPricing.amount).toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {defaultPricing.name}
                                    </p>
                                </>
                            ) : (
                                <p className="text-xl font-bold text-slate-400 mt-0.5">—</p>
                            )}
                        </div>
                        <div className="p-3 bg-amber-100 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
                            <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Scan Pricing Table Card */}
            <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                <IndianRupee className="h-4 w-4 text-amber-600" />
                                Scan Pricing Management
                            </CardTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                These prices are shown when creating a new client scan.
                            </p>
                        </div>
                        <Button
                            onClick={openCreateModal}
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold self-start sm:self-auto"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> Add Scan Pricing
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <ReusableTable
                        headers={headers}
                        data={pricings}
                        loading={loading}
                        Search="Search by scan price name..."
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
                                <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
                                    <BadgeCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        {editingPricing ? "Edit Scan Pricing" : "Create Scan Pricing"}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {editingPricing
                                            ? "Update pricing details and active status"
                                            : "Add a new scan price configuration"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingPricing(null);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Scan Price Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. New Scan Price"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Scan Price (₹) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        placeholder="e.g. 500"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                        className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Optional description for this pricing..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            Pricing Active
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Active pricing is shown when creating a new scan
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

                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            Default Pricing
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            The default pricing is auto-selected when creating a new scan
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.is_default}
                                            onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingPricing(null);
                                    }}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5"
                                >
                                    {submitting
                                        ? "Saving..."
                                        : editingPricing
                                            ? "Update Scan Pricing"
                                            : "Create Scan Pricing"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* DELETE CONFIRMATION MODAL */}
            {/* ========================================================================= */}
            {deletingPricing && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    Delete Scan Pricing?
                                </h3>
                                <p className="text-xs text-slate-500">This action cannot be undone.</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {`Are you sure you want to delete scan pricing "${deletingPricing.name}"?`}
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingPricing(null)}
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
