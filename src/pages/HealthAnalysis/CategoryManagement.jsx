import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import {
    Tags,
    Plus,
    Pencil,
    Trash2,
    AlertTriangle,
    Check,
    X,
    Clock,
    Sparkles,
    Layers,
    Power,
} from "lucide-react";
import { toast } from "sonner";
import ReusableTable from "@/components/ReusableTable";
import { parameterCategoryService } from "@/services/parameterCategoryService";

export default function CategoryManagement() {
    const { t } = useLanguage();

    const [categories, setCategories] = useState([]);
    const [parameters, setParameters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);

    // Form State
    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        order: 0,
        is_active: true,
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [catRes, paramRes] = await Promise.all([
                parameterCategoryService.getCategories(),
                axiosInstance.get("v1/admin/parameters").catch(() => null),
            ]);
            setCategories(catRes || []);
            setParameters(paramRes?.data?.data || []);
        } catch (err) {
            toast.error(err.response?.data?.message || t("failedLoadCategories"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Map category name -> parameter count
    const parameterCountByCategory = useMemo(() => {
        const map = {};
        parameters.forEach((p) => {
            map[p.category] = (map[p.category] || 0) + 1;
        });
        return map;
    }, [parameters]);

    const openCreateModal = () => {
        setEditingCategory(null);
        setForm({
            name: "",
            slug: "",
            description: "",
            order: categories.length,
            is_active: true,
        });
        setShowCreateModal(true);
    };

    const openEditModal = (item) => {
        setEditingCategory(item);
        setForm({
            name: item.name || "",
            slug: item.slug || "",
            description: item.description || "",
            order: item.order ?? 0,
            is_active: Boolean(item.is_active),
        });
        setShowCreateModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error(t("categoryNameRequired"));
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: form.name.trim(),
                slug: form.slug?.trim() || "",
                description: form.description?.trim() || "",
                order: Number(form.order) || 0,
                is_active: Boolean(form.is_active),
            };

            if (editingCategory) {
                await parameterCategoryService.updateCategory(editingCategory._id, payload);
                toast.success(t("categoryUpdated"));
                setEditingCategory(null);
            } else {
                await parameterCategoryService.createCategory(payload);
                toast.success(t("categoryCreated"));
            }

            setShowCreateModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || t("failedSaveCategory"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (item) => {
        try {
            await parameterCategoryService.updateCategory(item._id, {
                is_active: !item.is_active,
            });
            toast.success(t("categoryStatusChanged"));
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || t("failedToggleStatus"));
        }
    };

    const handleDelete = async () => {
        if (!deletingCategory) return;
        try {
            setSubmitting(true);
            await parameterCategoryService.deleteCategory(deletingCategory._id);
            toast.success(t("categoryDeleted"));
            setDeletingCategory(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || t("failedDeleteCategory"));
        } finally {
            setSubmitting(false);
        }
    };

    // Metrics
    const totalCount = categories.length;
    const activeCount = categories.filter((c) => c.is_active !== false).length;
    const inactiveCount = totalCount - activeCount;
    const totalParameters = parameters.length;

    const headers = [
        {
            key: "name",
            label: t("categoryName"),
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <Tags className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                {row.name}
                            </span>
                            {row.slug && (
                                <span className="text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
                                    {row.slug}
                                </span>
                            )}
                        </div>
                        {row.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-md">
                                {row.description}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "parameters",
            label: t("parametersUsed"),
            render: (row) => {
                const count = parameterCountByCategory[row.name] || 0;
                return (
                    <div className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {count}
                        </span>
                        <span className="text-xs text-slate-400">{t("parameters")}</span>
                    </div>
                );
            },
        },
        {
            key: "order",
            label: t("categoryOrder"),
            render: (row) => (
                <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                    {row.order ?? 0}
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
                        title={t("editCategory")}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingCategory(row)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50"
                        title={t("deleteCategory")}
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
                        <Sparkles className="h-4 w-4" />
                        <span>{t("quantumModule")}</span>
                    </div>
                    <h1 className="text-2xl font-bold mt-1 tracking-tight">
                        {t("categoryManagement")}
                    </h1>
                    <p className="text-sm text-indigo-100 mt-1 max-w-2xl">
                        {t("categoryManagementSubtitle")}
                    </p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="h-5 w-5" />
                    <span>{t("addNewCategory")}</span>
                </Button>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t("totalCategories")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {totalCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {t("categoriesUsedInList")}
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Tags className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                {t("activeCategories")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {activeCount}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                {t("shownInDropdown")}
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
                                {t("inactiveCategories")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {inactiveCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {t("hiddenFromList")}
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
                                {t("totalParameters")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {totalParameters}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {t("acrossAllCategories")}
                            </p>
                        </div>
                        <div className="p-3 bg-violet-50 dark:bg-violet-950/60 rounded-xl text-violet-600 dark:text-violet-400">
                            <Layers className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Categories Table Card */}
            <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                <Tags className="h-4 w-4 text-indigo-600" />
                                {t("parameterCategories")}
                            </CardTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {t("onlyAdminAddedHint")}
                            </p>
                        </div>
                        <Button
                            onClick={openCreateModal}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold self-start sm:self-auto"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> {t("addCategory")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <ReusableTable
                        headers={headers}
                        data={categories}
                        loading={loading}
                        Search={t("searchCategoryPlaceholder")}
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
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <Tags className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        {editingCategory ? t("editCategory") : t("createCategory")}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {editingCategory
                                            ? t("editCategorySubtitle")
                                            : t("createCategorySubtitle")}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingCategory(null);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    {t("categoryName")} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder={t("categoryNamePlaceholder")}
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    {t("categorySlug")}
                                </label>
                                <input
                                    type="text"
                                    placeholder={t("categorySlugPlaceholder")}
                                    value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    {t("categoryDescription")}
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder={t("categoryDescriptionPlaceholder")}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    {t("categoryOrder")}
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    step={1}
                                    value={form.order}
                                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {t("categoryActive")}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t("categoryActiveHint")}
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
                                        setEditingCategory(null);
                                    }}
                                    disabled={submitting}
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5"
                                >
                                    {submitting
                                        ? t("saving")
                                        : editingCategory
                                            ? t("updateCategory")
                                            : t("createCategory")}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* DELETE CONFIRMATION MODAL */}
            {/* ========================================================================= */}
            {deletingCategory && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    {t("deleteCategory")}?
                                </h3>
                                <p className="text-xs text-slate-500">{t("actionCannotUndone")}</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {t("confirmDeleteCategory").replace(
                                "{name}",
                                deletingCategory.name
                            )}
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingCategory(null)}
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
