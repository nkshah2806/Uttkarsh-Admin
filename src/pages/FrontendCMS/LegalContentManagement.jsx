import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FileText,
    Plus,
    Pencil,
    Trash2,
    Eye,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Sparkles,
    ShieldCheck,
    Globe,
    Check,
    X,
    FileCheck2,
    Scale,
    Lock,
    ScrollText,
} from "lucide-react";
import { toast } from "sonner";
import ReusableTable from "@/components/ReusableTable";
import { legalContentService, LEGAL_TYPES } from "@/services/legalContentService";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import LocalizedText from "@/components/LocalizedText";

const TYPE_META = {
    [LEGAL_TYPES.PRIVACY_POLICY]: {
        labelKey: "legal.privacyPolicy",
        icon: Lock,
        color: "from-indigo-600 via-indigo-700 to-violet-800",
        chip: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
    },
    [LEGAL_TYPES.TERMS_CONDITIONS]: {
        labelKey: "legal.termsConditions",
        icon: ScrollText,
        color: "from-emerald-600 via-teal-600 to-cyan-700",
        chip: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
    },
};

const emptyForm = {
    type: LEGAL_TYPES.PRIVACY_POLICY,
    title: "",
    content: "",
    is_active: true,
};

// Build a localized value from an item's English field plus optional `_hi`/`_gu`
// database siblings so dynamic legal content is translated via the API/database.
const localized = (item, field = "title") =>
    item
        ? {
            en: item[field] || item[`${field}_en`] || "",
            hi: item[`${field}_hi`] || item[field] || "",
            gu: item[`${field}_gu`] || item[field] || "",
        }
        : "";

export default function LegalContentManagement() {
    const { t } = useTranslation();
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Type filter ("all" shows both types)
    const [filterType, setFilterType] = useState("all");

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingContent, setEditingContent] = useState(null);
    const [previewContent, setPreviewContent] = useState(null);
    const [deletingContent, setDeletingContent] = useState(null);

    // Form State
    const [form, setForm] = useState(emptyForm);

    const fetchContents = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterType !== "all") params.type = filterType;
            const res = await legalContentService.getLegalContent(params);
            setContents(res || []);
        } catch (err) {
            toast.error(err.response?.data?.message || t("legal.loadFailed"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterType]);

    const activePrivacy = contents.find(
        (c) => c.type === LEGAL_TYPES.PRIVACY_POLICY && c.is_active
    );
    const activeTerms = contents.find(
        (c) => c.type === LEGAL_TYPES.TERMS_CONDITIONS && c.is_active
    );

    const totalCount = contents.length;
    const activeCount = contents.filter((c) => c.is_active).length;
    const inactiveCount = contents.filter((c) => !c.is_active).length;

    const openCreateModal = (preType) => {
        setEditingContent(null);
        setForm({
            ...emptyForm,
            type: preType || filterType !== "all" ? preType || filterType : LEGAL_TYPES.PRIVACY_POLICY,
            is_active: contents.length === 0,
        });
        setShowCreateModal(true);
    };

    const openEditModal = (item) => {
        setEditingContent(item);
        setForm({
            type: item.type || LEGAL_TYPES.PRIVACY_POLICY,
            title: item.title || "",
            content: item.content || "",
            is_active: Boolean(item.is_active),
        });
        setShowCreateModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.content.trim()) {
            toast.error(t("legal.provideTitleContent"));
            return;
        }

        try {
            setSubmitting(true);

            if (editingContent) {
                const res = await legalContentService.updateLegalContent(editingContent._id, form);
                toast.success(res?.message || t("legal.updated"));
                setEditingContent(null);
            } else {
                const res = await legalContentService.createLegalContent(form);
                toast.success(res?.message || t("legal.created"));
            }

            setShowCreateModal(false);
            fetchContents();
        } catch (err) {
            toast.error(err.response?.data?.message || t("legal.saveFailed"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (item) => {
        try {
            const res = await legalContentService.toggleStatus(item._id);
            toast.success(res?.message || t("legal.statusUpdated"));
            fetchContents();
        } catch (err) {
            toast.error(err.response?.data?.message || t("legal.statusFailed"));
        }
    };

    const handleDelete = async () => {
        if (!deletingContent) return;
        try {
            setSubmitting(true);
            await legalContentService.deleteLegalContent(deletingContent._id);
            toast.success(t("legal.deleted"));
            setDeletingContent(null);
            fetchContents();
        } catch (err) {
            toast.error(err.response?.data?.message || t("legal.deleteFailed"));
        } finally {
            setSubmitting(false);
        }
    };

    const renderTypeChip = (type) => {
        const meta = TYPE_META[type] || TYPE_META[LEGAL_TYPES.PRIVACY_POLICY];
        const Icon = meta.icon;
        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${meta.chip}`}
            >
                <Icon className="h-3 w-3" />
                <span>{t(meta.labelKey)}</span>
            </span>
        );
    };

    const headers = useMemo(
        () => [
            {
                key: "title",
                label: t("legal.colTitle"),
                render: (row) => (
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                <LocalizedText value={localized(row, "title")} />
                            </span>
                            {row.is_active && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {t("legal.active")}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 max-w-md">
                            <LocalizedText value={localized(row, "content")} />
                        </p>
                    </div>
                ),
            },
            {
                key: "type",
                label: t("legal.colType"),
                filterable: false,
                render: (row) => renderTypeChip(row.type),
            },
            {
                key: "is_active",
                label: t("legal.colStatus"),
                filterable: false,
                render: (row) => (
                    <button
                        onClick={() => handleToggleStatus(row)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${row.is_active
                            ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                        title={t("legal.toggleTitle")}
                    >
                        {row.is_active ? (
                            <>
                                <Check className="h-3 w-3" /> {t("legal.active")}
                            </>
                        ) : (
                            <>
                                <X className="h-3 w-3" /> {t("legal.inactive")}
                            </>
                        )}
                    </button>
                ),
            },
            {
                key: "updatedAt",
                label: t("legal.colLastUpdated"),
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
                                <span>{t("legal.by")}</span>
                                <span>{row.updated_by.fullName || row.updated_by.username}</span>
                            </p>
                        )}
                    </div>
                ),
            },
            {
                key: "actions",
                label: t("legal.colActions"),
                filterable: false,
                render: (row) => (
                    <div className="flex items-center justify-end gap-1.5">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewContent(row)}
                            className="h-8 px-2.5 text-xs font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-950"
                            title={t("legal.viewTitle")}
                        >
                            <Eye className="h-3.5 w-3.5 mr-1" /> {t("legal.view")}
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(row)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
                            title={t("legal.editTitle")}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingContent(row)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50"
                            title={t("legal.deleteTitle")}
                        >
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        </Button>
                    </div>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [contents]
    );

    const bannerMeta =
        filterType !== "all"
            ? TYPE_META[filterType] || TYPE_META[LEGAL_TYPES.PRIVACY_POLICY]
            : { labelKey: "legal.allContentLabel", icon: Scale, color: "from-indigo-600 via-violet-600 to-purple-700" };

    const BannerIcon = bannerMeta.icon;

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header Banner */}
            <div
                className={`rounded-2xl bg-gradient-to-r ${bannerMeta.color} p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4`}
            >
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/80">
                        <ShieldCheck className="h-4 w-4" />
                        <span>{t("legal.bannerEyebrow")}</span>
                    </div>
                    <h1 className="text-2xl font-bold mt-1 tracking-tight">{t("legal.bannerTitle")}</h1>
                    <p className="text-sm text-white/85 mt-1 max-w-2xl">
                        {t("legal.bannerDesc")}
                    </p>
                </div>
                <Button
                    onClick={() => openCreateModal(filterType === "all" ? LEGAL_TYPES.PRIVACY_POLICY : filterType)}
                    className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="h-5 w-5" />
                    <span>{t("legal.addNew")}</span>
                </Button>
            </div>

            {/* Type Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-56">
                        <SelectValue placeholder={t("legal.filterByType")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("legal.allTypes")}</SelectItem>
                        <SelectItem value={LEGAL_TYPES.PRIVACY_POLICY}>{t("legal.privacyPolicy")}</SelectItem>
                        <SelectItem value={LEGAL_TYPES.TERMS_CONDITIONS}>{t("legal.termsConditions")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t("legal.totalDocuments")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {totalCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{t("legal.allVersionsStored")}</p>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <FileText className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                {t("legal.activePrivacy")}
                            </p>
                            <p
                                className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 truncate max-w-[180px]"
                                title={activePrivacy?.title}
                            >
                                {activePrivacy ? activePrivacy.title : t("legal.noneActive")}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{t("legal.shownOnWebsite")}</p>
                        </div>
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Lock className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                                {t("legal.activeTerms")}
                            </p>
                            <p
                                className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 truncate max-w-[180px]"
                                title={activeTerms?.title}
                            >
                                {activeTerms ? activeTerms.title : t("legal.noneActive")}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{t("legal.shownOnWebsite")}</p>
                        </div>
                        <div className="p-3 bg-teal-100 dark:bg-teal-950/60 rounded-xl text-teal-600 dark:text-teal-400">
                            <ScrollText className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t("legal.inactiveArchives")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {inactiveCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{t("legal.archivedRevisions")}</p>
                        </div>
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                            <Clock className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Legal Content Table Card */}
            <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                <FileCheck2 className="h-4 w-4 text-indigo-600" />
                                {t("legal.cardTitle")}
                            </CardTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {t("legal.cardDesc")}
                            </p>
                        </div>
                        <Button
                            onClick={() => openCreateModal(filterType === "all" ? LEGAL_TYPES.PRIVACY_POLICY : filterType)}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold self-start sm:self-auto"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> {t("legal.addContent")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <ReusableTable
                        headers={headers}
                        data={contents}
                        loading={loading}
                        Search={t("legal.searchPlaceholder")}
                    />
                </CardContent>
            </Card>

            {/* ========================================================================= */}
            {/* CREATE / EDIT MODAL */}
            {/* ========================================================================= */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        {editingContent ? t("legal.editModalTitle") : t("legal.createModalTitle")}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {editingContent
                                            ? t("legal.editModalDesc")
                                            : t("legal.createModalDesc")}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingContent(null);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    {t("legal.contentTypeLabel")} <span className="text-rose-500">*</span>
                                </label>
                                <Select
                                    value={form.type}
                                    onValueChange={(val) => setForm({ ...form, type: val })}
                                >
                                    <SelectTrigger className="w-full sm:w-72">
                                        <SelectValue placeholder={t("legal.selectContentType")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={LEGAL_TYPES.PRIVACY_POLICY}>
                                            {t("legal.privacyPolicy")}
                                        </SelectItem>
                                        <SelectItem value={LEGAL_TYPES.TERMS_CONDITIONS}>
                                            {t("legal.termsConditions")}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    {t("legal.titleLabel")} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder={t("legal.titlePh")}
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                    {t("legal.contentLabel")} <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={12}
                                    required
                                    placeholder={t("legal.contentPh")}
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {t("legal.activeLabel")}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t("legal.activeHelp", { type: t(TYPE_META[form.type]?.labelKey) })}
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
                                        setEditingContent(null);
                                    }}
                                    disabled={submitting}
                                >
                                    {t("legal.cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5"
                                >
                                    {submitting
                                        ? t("legal.saving")
                                        : editingContent
                                            ? t("legal.update")
                                            : t("legal.create")}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* PREVIEW / VIEW MODAL */}
            {/* ========================================================================= */}
            {previewContent && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
                        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-4 border-b bg-white dark:bg-slate-900 rounded-t-2xl">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <Eye className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                                        <LocalizedText value={previewContent.title} />
                                    </h3>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        {renderTypeChip(previewContent.type)}
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${previewContent.is_active
                                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                                                }`}
                                        >
                                            {previewContent.is_active ? (
                                                <>
                                                    <Check className="h-3 w-3" /> {t("legal.active")}
                                                </>
                                            ) : (
                                                <>
                                                    <X className="h-3 w-3" /> {t("legal.inactive")}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setPreviewContent(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {previewContent.content.split("\n\n").map((para, i) => {
                                const boldMatch = para.match(/^\*\*(.+)\*\*$/);
                                if (boldMatch) {
                                    return (
                                        <h4
                                            key={i}
                                            className="font-bold text-slate-900 dark:text-slate-100 text-base pt-1"
                                        >
                                            {boldMatch[1]}
                                        </h4>
                                    );
                                }
                                return (
                                    <p key={i} className="whitespace-pre-line">
                                        {para}
                                    </p>
                                );
                            })}
                        </div>
                        <div className="px-6 py-3 border-t bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 flex items-center justify-between gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5">
                                <Globe className="h-3.5 w-3.5" />
                                {previewContent.is_active
                                    ? t("legal.liveOnWebsite")
                                    : t("legal.notPublished")}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {t("legal.updatedOn")}{" "}
                                {new Date(previewContent.updatedAt || previewContent.createdAt).toLocaleDateString(
                                    "en-IN",
                                    { day: "numeric", month: "short", year: "numeric" }
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* DELETE CONFIRMATION MODAL */}
            {/* ========================================================================= */}
            {deletingContent && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    {t("legal.deleteQuestion")}
                                </h3>
                                <p className="text-xs text-slate-500">{t("legal.deleteWarning")}</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {t("legal.deleteConfirmText", { title: deletingContent.title })}
                        </p>

                        {deletingContent.is_active && (
                            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>
                                    {t("legal.activeDeleteWarning", { type: t(TYPE_META[deletingContent.type]?.labelKey) })}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setDeletingContent(null)} disabled={submitting}>
                                {t("legal.cancel")}
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={submitting}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                            >
                                {submitting ? t("legal.deleting") : t("legal.delete")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
