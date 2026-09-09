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
            toast.error(err.response?.data?.message || "Failed to load gallery items");
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
            toast.error("Please enter the title");
            return;
        }
        if (!form.media_url.trim()) {
            toast.error(form.type === "video" ? "Please upload the video file" : "Please upload the photo file");
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
                toast.success("Gallery item updated successfully");
                setEditingItem(null);
            } else {
                await galleryService.create(payload);
                toast.success("Gallery item created successfully");
            }

            setShowFormModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save gallery item");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (item) => {
        try {
            await galleryService.update(item._id, {
                is_active: item.is_active !== false ? false : true,
            });
            toast.success("Gallery item status updated successfully");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to toggle status");
        }
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        try {
            setSubmitting(true);
            await galleryService.remove(deletingItem._id);
            toast.success("Gallery item deleted successfully");
            setDeletingItem(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete gallery item");
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
            title="Click to toggle active status"
        >
            {row.is_active !== false ? (
                <>
                    <Check className="h-3 w-3" /> Active
                </>
            ) : (
                <>
                    <X className="h-3 w-3" /> Inactive
                </>
            )}
        </button>
    );

    const renderTypeBadge = (type) =>
        type === "video" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                <Video className="h-3 w-3" /> Video
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900">
                <ImageIcon className="h-3 w-3" /> Photo
            </span>
        );

    const headers = [
        {
            key: "thumbnail",
            label: "Thumbnail",
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
            label: "Title",
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
                            {row.title}
                        </span>
                        <span className="block text-[11px] text-slate-400 truncate">
                            {row.description || "—"}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "type",
            label: "Type",
            filterable: false,
            render: (row) => renderTypeBadge(row.type),
        },
        {
            key: "category",
            label: "Category",
            render: (row) =>
                row.category ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {row.category}
                    </span>
                ) : (
                    <span className="text-xs text-slate-400">—</span>
                ),
        },
        {
            key: "display_order",
            label: "Order",
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
            label: "Status",
            filterable: false,
            render: renderStatus,
        },
        {
            key: "createdAt",
            label: "Created",
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
            label: "Actions",
            filterable: false,
            render: (row) => (
                <div className="flex items-center justify-end gap-1.5">
                    <a
                        href={resolveMedia(row.media_url || row.thumbnail_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:text-violet-600 hover:bg-violet-50/50"
                        title="View Media"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </a>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(row)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
                        title="Edit Gallery Item"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingItem(row)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50"
                        title="Delete Gallery Item"
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
                        <span>Frontend CMS</span>
                    </div>
                    <h1 className="text-2xl font-bold mt-1 tracking-tight">
                        Gallery Management
                    </h1>
                    <p className="text-sm text-violet-100 mt-1 max-w-2xl">
                        Add photos and videos shown on the public Gallery page. Only active items appear on the site.
                    </p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="bg-white text-violet-700 hover:bg-violet-50 font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add New Gallery Item</span>
                </Button>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Total Items
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {totalCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                All gallery items
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
                                Active Items
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {activeCount}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Shown on the public website
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
                                Photos
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {photoCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Image gallery items
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
                                Videos
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {videoCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Uploaded video files
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
                                Gallery Items List
                            </CardTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Manage the photos and videos that appear on the public Gallery page.
                            </p>
                        </div>
                        <Button
                            onClick={openCreateModal}
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold self-start sm:self-auto"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> Add Gallery Item
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                    {/* Status + type filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full sm:w-44">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="photo">Photos</SelectItem>
                                <SelectItem value="video">Videos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <ReusableTable
                        headers={headers}
                        data={filteredItems}
                        loading={loading}
                        Search="Search by title, description, or category..."
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
                                                ? "Edit Video"
                                                : "Edit Photo"
                                            : form.type === "video"
                                                ? "Add Video"
                                                : "Add Photo"}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {editingItem
                                            ? "Update item details and active status"
                                            : "Add a new item to the public gallery"}
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
                                    Photo
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
                                    Video
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Title <span className="text-violet-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder={form.type === "video" ? "e.g. Health Camp Highlights 2026" : "e.g. Community Health Awareness Drive"}
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Short caption shown with the media..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>

                                {form.type === "video" ? (
                                    <>
                                        <div className="sm:col-span-2">
                                            <MediaUploader
                                                label="Upload Video"
                                                value={form.media_url}
                                                onUploaded={(ref) => setForm((f) => ({ ...f, media_url: ref }))}
                                                onClear={() => setForm((f) => ({ ...f, media_url: "" }))}
                                                folder="gallery-video"
                                                accept="video"
                                                required
                                                helpText="MP4, WebM or MOV (max 100MB) — upload from your device"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <MediaUploader
                                                label="Upload Thumbnail / Cover Image"
                                                value={form.thumbnail_url}
                                                onUploaded={(ref) => setForm((f) => ({ ...f, thumbnail_url: ref }))}
                                                onClear={() => setForm((f) => ({ ...f, thumbnail_url: "" }))}
                                                folder="gallery-thumb"
                                                accept="image"
                                                helpText="JPG, JPEG, PNG or WebP (max 5MB) — optional cover shown on the card"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="sm:col-span-2">
                                        <MediaUploader
                                            label="Upload Photo"
                                            value={form.media_url}
                                            onUploaded={(ref) => setForm((f) => ({ ...f, media_url: ref }))}
                                            onClear={() => setForm((f) => ({ ...f, media_url: "" }))}
                                            folder="gallery"
                                            accept="image"
                                            required
                                            helpText="JPG, JPEG, PNG or WebP (max 5MB) — upload from your device"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        list="gallery-categories"
                                        placeholder="e.g. Camps"
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
                                        Display Order
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
                                        Lower numbers appear first on the gallery.
                                    </p>
                                </div>
                            </div>


                            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        Item Active
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Active items are shown on the public Gallery page
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
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5"
                                >
                                    {submitting
                                        ? "Saving..."
                                        : editingItem
                                            ? "Update Gallery Item"
                                            : "Create Gallery Item"}
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
                                    Delete Gallery Item?
                                </h3>
                                <p className="text-xs text-slate-500">This action cannot be undone.</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {`Are you sure you want to delete this gallery item? (${deletingItem.title})`}
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingItem(null)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={submitting}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                            >
                                {submitting ? "Deleting..." : "Yes, Delete"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
