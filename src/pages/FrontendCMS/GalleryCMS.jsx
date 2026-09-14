import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Images,
    Plus,
    Pencil,
    Trash2,
    AlertTriangle,
    Check,
    X,
    Video,
    Image as ImageIcon,
    Sparkles,
    Film,
    ListOrdered,
    BadgeCheck,
    Eye,
} from "lucide-react";
import { toast } from "sonner";
import ReusableTable from "@/components/ReusableTable";
import { galleryService } from "@/services/galleryService";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { MediaUploader } from "@/components/media-uploader";
import { Config } from "@/lib/Config";
import { useTranslation } from "react-i18next";
import LocalizedText from "@/components/LocalizedText";

const SUGGESTED_CATEGORIES = [
    "Camps",
    "Events",
    "Activities",
    "Awareness Programs",
    "Workshops",
    "Other",
];

const resolveMedia = (value) =>
    value && value.startsWith("/uploads/")
        ? `${Config.API_URL}${value.replace(/^\//, "")}`
        : value;

const emptyForm = {
    type: "photo",
    title: "",
    description: "",
    media_url: "",
    thumbnail_url: "",
    category: "",
    display_order: 0,
    is_active: true,
};

export default function GalleryCMS() {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Local filters (applied to the fully loaded client-side list)
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");

    // Modals
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);

    // Form State
    const [form, setForm] = useState(emptyForm);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await galleryService.getAll();
            setItems(res || []);
        } catch (err) {
            toast.error(err.response?.data?.message || t("gallery.loadFailed"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateModal = () => {
        setEditingItem(null);
        setForm({ ...emptyForm });
        setShowFormModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setForm({
            type: item.type || "photo",
            title: item.title || "",
            description: item.description || "",
            media_url: item.media_url || "",
            thumbnail_url: item.thumbnail_url || "",
            category: item.category || "",
            display_order: item.display_order ?? 0,
            is_active: item.is_active !== false,
        });
        setShowFormModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            toast.error(t("gallery.titleRequired"));
            return;
        }
        if (!form.media_url.trim()) {
            toast.error(form.type === "video" ? t("gallery.videoRequired") : t("gallery.photoRequired"));
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                type: form.type,
                title: form.title.trim(),
                description: form.description?.trim() || "",
                media_url: form.media_url.trim(),
                thumbnail_url: form.thumbnail_url?.trim() || "",
                category: form.category?.trim() || "",
                display_order:
                    form.display_order === "" || form.display_order === null
                        ? 0
                        : Number(form.display_order),
                is_active: Boolean(form.is_active),
            };

            if (editingItem) {
                await galleryService.update(editingItem._id, payload);
                toast.success(t("gallery.updated"));
                setEditingItem(null);
            } else {
                await galleryService.create(payload);
                toast.success(t("gallery.created"));
            }

            setShowFormModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || t("gallery.saveFailed"));
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (item) => {
        try {
            await galleryService.update(item._id, {
                is_active: item.is_active !== false ? false : true,
            });
            toast.success(t("gallery.statusUpdated"));
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || t("gallery.toggleFailed"));
        }
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        try {
            setSubmitting(true);
            await galleryService.remove(deletingItem._id);
            toast.success(t("gallery.deleted"));
            setDeletingItem(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || t("gallery.deleteFailed"));
        } finally {
            setSubmitting(false);
        }
    };

    // Client-side status + type filtering
    const filteredItems = useMemo(() => {
        let list = [...items];
        if (filterStatus === "active") list = list.filter((i) => i.is_active !== false);
        if (filterStatus === "inactive") list = list.filter((i) => i.is_active === false);
        if (filterType !== "all") list = list.filter((i) => i.type === filterType);
        return list;
    }, [items, filterStatus, filterType]);

    // Metrics
    const totalCount = items.length;
    const activeCount = items.filter((i) => i.is_active !== false).length;
    const photoCount = items.filter((i) => i.type === "photo").length;
    const videoCount = items.filter((i) => i.type === "video").length;

    const renderStatus = (row) => (
        <button
            onClick={() => handleToggleStatus(row)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${row.is_active !== false
                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
            title={t("gallery.toggleTitle")}
        >
            {row.is_active !== false ? (
                <>
                    <Check className="h-3 w-3" /> {t("gallery.active")}
                </>
            ) : (
                <>
                    <X className="h-3 w-3" /> {t("gallery.inactive")}
                </>
            )}
        </button>
    );

    const renderTypeBadge = (type) =>
        type === "video" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                <Video className="h-3 w-3" /> {t("gallery.typeVideo")}
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900">
                <ImageIcon className="h-3 w-3" /> {t("gallery.typePhoto")}
            </span>
        );

    const headers = [
        {
            key: "thumbnail",
            label: t("gallery.colThumbnail"),
            filterable: false,
            render: (row) => {
                const thumbSrc =
                    row.type === "video"
                        ? row.thumbnail_url || row.media_url
                        : row.media_url;
                const resolvedThumbSrc = resolveMedia(thumbSrc);
                return (
                    <div className="h-14 w-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 relative">
                        {row.type === "video" && !row.thumbnail_url && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                                <Video className="h-4 w-4 text-white" />
                            </div>
                        )}
                        {thumbSrc ? (
                            <img
                                src={resolvedThumbSrc}
                                alt={row.title}
                                loading="lazy"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                }}
                                className="h-full w-full object-cover"
                            />
                        ) : null}
                    </div>
                );
            },
        },
        {
            key: "title",
            label: t("gallery.colTitle"),
            render: (row) => (
                <div className="flex items-center gap-2.5 max-w-xs">
                    <div className="p-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 shrink-0">
                        {row.type === "video" ? (
                            <Video className="h-4 w-4" />
                        ) : (
                            <ImageIcon className="h-4 w-4" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <span className="block font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                            <LocalizedText value={row.title} />
                        </span>
                        <span className="block text-[11px] text-slate-400 truncate">
                            {row.description ? <LocalizedText value={row.description} /> : "—"}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "type",
            label: t("gallery.colType"),
            filterable: false,
            render: (row) => renderTypeBadge(row.type),
        },
        {
            key: "category",
            label: t("gallery.colCategory"),
            render: (row) =>
                row.category ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <LocalizedText value={row.category} />
                    </span>
                ) : (
                    <span className="text-xs text-slate-400">—</span>
                ),
        },
        {
            key: "display_order",
            label: t("gallery.colOrder"),
            filterable: false,
            render: (row) => (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <ListOrdered className="h-3 w-3 text-slate-400" />
                    {row.display_order ?? 0}
                </span>
            ),
        },
        {
            key: "is_active",
            label: t("gallery.colStatus"),
            filterable: false,
            render: renderStatus,
        },
        {
            key: "createdAt",
            label: t("gallery.colCreated"),
            render: (row) => (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                    {row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })
                        : "—"}
                </span>
            ),
        },
        {
            key: "actions",
            label: t("gallery.colActions"),
            filterable: false,
            render: (row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <a
                        href={resolveMedia(row.media_url || row.thumbnail_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:text-violet-600 hover:bg-violet-50/50"
                        title={t("gallery.viewTitle")}
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </a>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(row)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
                        title={t("gallery.editTitle")}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingItem(row)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50"
                        title={t("gallery.deleteTitle")}
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
            <div className="rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-violet-100">
                        <Sparkles className="h-4 w-4" />
                        <span>{t("gallery.eyebrow")}</span>
                    </div>
                    <h1 className="text-2xl font-bold mt-1 tracking-tight">
                        {t("gallery.title")}
                    </h1>
                    <p className="text-sm text-violet-100 mt-1 max-w-2xl">
                        {t("gallery.subtitle")}
                    </p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="bg-white text-violet-700 hover:bg-violet-50 font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="h-5 w-5" />
                    <span>{t("gallery.addNew")}</span>
                </Button>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t("gallery.totalItems")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {totalCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {t("gallery.allItems")}
                            </p>
                        </div>
                        <div className="p-3 bg-violet-50 dark:bg-violet-950/60 rounded-xl text-violet-600 dark:text-violet-400">
                            <Images className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                {t("gallery.activeItems")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {activeCount}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                {t("gallery.shownOnSite")}
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <BadgeCheck className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t("gallery.photos")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {photoCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {t("gallery.photoItems")}
                            </p>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
                            <ImageIcon className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {t("gallery.videos")}
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {videoCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {t("gallery.videoFiles")}
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Film className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gallery Table Card */}
            <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                <Images className="h-4 w-4 text-violet-600" />
                                {t("gallery.setTitle")}
                            </CardTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {t("gallery.listSubtitle")}
                            </p>
                        </div>
                        <Button
                            onClick={openCreateModal}
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold self-start sm:self-auto"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> {t("gallery.addItem")}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                    {/* Status + type filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder={t("gallery.filterByStatus")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("gallery.allStatuses")}</SelectItem>
                                <SelectItem value="active">{t("gallery.active")}</SelectItem>
                                <SelectItem value="inactive">{t("gallery.inactive")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder={t("gallery.filterByType")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("gallery.allTypes")}</SelectItem>
                                <SelectItem value="photo">{t("gallery.photos")}</SelectItem>
                                <SelectItem value="video">{t("gallery.videos")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <ReusableTable
                        headers={headers}
                        data={filteredItems}
                        loading={loading}
                        Search={t("gallery.searchPlaceholder")}
                    />
                </CardContent>
            </Card>

            {/* ========================================================================= */}
            {/* CREATE / EDIT MODAL */}
            {/* ========================================================================= */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-violet-50 dark:bg-violet-950/60 rounded-xl text-violet-600 dark:text-violet-400">
                                    {form.type === "video" ? (
                                        <Video className="h-5 w-5" />
                                    ) : (
                                        <ImageIcon className="h-5 w-5" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        {editingItem
                                            ? form.type === "video"
                                                ? t("gallery.modalEditVideo")
                                                : t("gallery.modalEditPhoto")
                                            : form.type === "video"
                                                ? t("gallery.modalAddVideo")
                                                : t("gallery.modalAddPhoto")}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {editingItem
                                            ? t("gallery.modalEditSubtitle")
                                            : t("gallery.modalAddSubtitle")}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowFormModal(false);
                                    setEditingItem(null);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-5">
                            {/* Media Type toggle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForm((f) => ({
                                            ...f,
                                            type: "photo",
                                            media_url: editingItem ? f.media_url : "",
                                        }));
                                    }}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${form.type === "photo"
                                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-amber-300"
                                        }`}
                                >
                                    <ImageIcon className="h-4 w-4" />
                                    {t("gallery.typePhoto")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForm((f) => ({
                                            ...f,
                                            type: "video",
                                            media_url: editingItem ? f.media_url : "",
                                        }));
                                    }}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${form.type === "video"
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300"
                                        }`}
                                >
                                    <Video className="h-4 w-4" />
                                    {t("gallery.typeVideo")}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        {t("gallery.titleLabel")} <span className="text-violet-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder={form.type === "video" ? t("gallery.phTitleVideo") : t("gallery.phTitlePhoto")}
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        {t("gallery.description")}
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder={t("gallery.phDescription")}
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>

                                {form.type === "video" ? (
                                    <>
                                        <div className="sm:col-span-2">
                                            <MediaUploader
                                                label={t("gallery.uploadVideo")}
                                                value={form.media_url}
                                                onUploaded={(ref) => setForm((f) => ({ ...f, media_url: ref }))}
                                                onClear={() => setForm((f) => ({ ...f, media_url: "" }))}
                                                folder="gallery-video"
                                                accept="video"
                                                required
                                                helpText={t("gallery.videoHelp")}
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <MediaUploader
                                                label={t("gallery.uploadThumbnail")}
                                                value={form.thumbnail_url}
                                                onUploaded={(ref) => setForm((f) => ({ ...f, thumbnail_url: ref }))}
                                                onClear={() => setForm((f) => ({ ...f, thumbnail_url: "" }))}
                                                folder="gallery-thumb"
                                                accept="image"
                                                helpText={t("gallery.thumbnailHelp")}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="sm:col-span-2">
                                        <MediaUploader
                                            label={t("gallery.uploadPhoto")}
                                            value={form.media_url}
                                            onUploaded={(ref) => setForm((f) => ({ ...f, media_url: ref }))}
                                            onClear={() => setForm((f) => ({ ...f, media_url: "" }))}
                                            folder="gallery"
                                            accept="image"
                                            required
                                            helpText={t("gallery.photoHelp")}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        {t("gallery.category")}
                                    </label>
                                    <input
                                        type="text"
                                        list="gallery-categories"
                                        placeholder={t("gallery.phCategory")}
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                    <datalist id="gallery-categories">
                                        {SUGGESTED_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        {t("gallery.displayOrder")}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={form.display_order}
                                        onChange={(e) => setForm({ ...form, display_order: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        {t("gallery.displayOrderHelp")}
                                    </p>
                                </div>
                            </div>


                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {t("gallery.itemActive")}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t("gallery.itemActiveHelp")}
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
                                        setShowFormModal(false);
                                        setEditingItem(null);
                                    }}
                                    disabled={submitting}
                                >
                                    {t("gallery.cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5"
                                >
                                    {submitting
                                        ? t("gallery.saving")
                                        : editingItem
                                            ? t("gallery.updateItem")
                                            : t("gallery.createItem")}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* DELETE CONFIRMATION MODAL */}
            {/* ========================================================================= */}
            {deletingItem && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    {t("gallery.deleteQuestion")}
                                </h3>
                                <p className="text-xs text-slate-500">{t("gallery.deleteWarning")}</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {t("gallery.deleteConfirmText", { title: deletingItem.title })}
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingItem(null)}
                                disabled={submitting}
                            >
                                {t("gallery.cancel")}
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={submitting}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                            >
                                {submitting ? t("gallery.deleting") : t("gallery.deleteBtn")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
