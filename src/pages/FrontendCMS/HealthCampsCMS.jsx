import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    HeartPulse,
    Plus,
    Pencil,
    Trash2,
    AlertTriangle,
    Check,
    X,
    Calendar,
    Clock,
    MapPin,
    Users,
    Sparkles,
    Phone,
    BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import ReusableTable from "@/components/ReusableTable";
import { healthCampService } from "@/services/healthCampService";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function HealthCampsCMS() {
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Local filters (date filter applied to the full client-side list)
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDate, setFilterDate] = useState("");

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCamp, setEditingCamp] = useState(null);
    const [deletingCamp, setDeletingCamp] = useState(null);

    // Form State
    const emptyForm = {
        name: "",
        description: "",
        date: "",
        start_time: "",
        end_time: "",
        venue: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        contact_person: "",
        contact_number: "",
        contact_email: "",
        image: "",
        is_active: true,
        registration_required: false,
        registration_limit: "",
        additional_notes: "",
    };
    const [form, setForm] = useState(emptyForm);

    const fetchData = async () => {
        try {
            setLoading(true);
            const campRes = await healthCampService.getHealthCamps();
            setCamps(campRes || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load health camps");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateModal = () => {
        setEditingCamp(null);
        setForm({ ...emptyForm });
        setShowCreateModal(true);
    };

    const openEditModal = (item) => {
        setEditingCamp(item);
        setForm({
            name: item.name || "",
            description: item.description || "",
            date: item.date ? String(item.date).slice(0, 10) : "",
            start_time: item.start_time || "",
            end_time: item.end_time || "",
            venue: item.venue || "",
            address: item.address || "",
            city: item.city || "",
            state: item.state || "",
            pincode: item.pincode || "",
            contact_person: item.contact_person || "",
            contact_number: item.contact_number || "",
            contact_email: item.contact_email || "",
            image: item.image || "",
            is_active: item.is_active !== false,
            registration_required: Boolean(item.registration_required),
            registration_limit: item.registration_limit ?? "",
            additional_notes: item.additional_notes || "",
        });
        setShowCreateModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error("Please enter the camp name");
            return;
        }
        if (!form.date) {
            toast.error("Please select the camp date");
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: form.name.trim(),
                description: form.description?.trim() || "",
                date: form.date,
                start_time: form.start_time?.trim() || "",
                end_time: form.end_time?.trim() || "",
                venue: form.venue?.trim() || "",
                address: form.address?.trim() || "",
                city: form.city?.trim() || "",
                state: form.state?.trim() || "",
                pincode: form.pincode?.trim() || "",
                contact_person: form.contact_person?.trim() || "",
                contact_number: form.contact_number?.trim() || "",
                contact_email: form.contact_email?.trim() || "",
                image: form.image?.trim() || "",
                is_active: Boolean(form.is_active),
                registration_required: Boolean(form.registration_required),
                registration_limit:
                    form.registration_limit === "" || form.registration_limit === null
                        ? null
                        : Number(form.registration_limit),
                additional_notes: form.additional_notes?.trim() || "",
            };

            if (editingCamp) {
                await healthCampService.updateHealthCamp(editingCamp._id, payload);
                toast.success("Health camp updated successfully");
                setEditingCamp(null);
            } else {
                await healthCampService.createHealthCamp(payload);
                toast.success("Health camp created successfully");
            }

            setShowCreateModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save health camp");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (item) => {
        try {
            await healthCampService.updateHealthCamp(item._id, {
                is_active: item.is_active !== false ? false : true,
            });
            toast.success("Health camp status updated successfully");
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to toggle status");
        }
    };

    const handleDelete = async () => {
        if (!deletingCamp) return;
        try {
            setSubmitting(true);
            await healthCampService.deleteHealthCamp(deletingCamp._id);
            toast.success("Health camp deleted successfully");
            setDeletingCamp(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete health camp");
        } finally {
            setSubmitting(false);
        }
    };

    // Client-side status + date filtering (list is fully loaded from backend)
    const filteredCamps = useMemo(() => {
        let list = [...camps];
        if (filterStatus === "active") list = list.filter((c) => c.is_active !== false);
        if (filterStatus === "inactive") list = list.filter((c) => c.is_active === false);
        if (filterDate) {
            list = list.filter((c) => {
                if (!c.date) return false;
                const d = new Date(c.date);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                return `${y}-${m}-${day}` === filterDate;
            });
        }
        return list;
    }, [camps, filterStatus, filterDate]);

    // Metrics
    const totalCount = camps.length;
    const activeCount = camps.filter((c) => c.is_active !== false).length;
    const upcomingCount = camps.filter((c) => c.date && new Date(c.date) >= new Date(new Date().toDateString())).length;
    const regCount = camps.filter((c) => c.registration_required).length;

    const renderCampStatus = (row) => (
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

    const headers = [
        {
            key: "name",
            label: "Camp Name",
            render: (row) => (
                <div className="flex items-center gap-2.5 max-w-xs">
                    <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
                        <HeartPulse className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <span className="block font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                            {row.name}
                        </span>
                        <span className="block text-[11px] text-slate-400 truncate">
                            {row.description || "—"}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "date",
            label: "Camp Date",
            render: (row) => (
                <div className="flex flex-col text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                        <Calendar className="h-3.5 w-3.5 text-rose-400" />
                        {row.date
                            ? new Date(row.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })
                            : "—"}
                    </span>
                    {(row.start_time || row.end_time) && (
                        <span className="inline-flex items-center gap-1.5 text-slate-500 mt-0.5">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {[row.start_time, row.end_time].filter(Boolean).join(" – ")}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "time",
            label: "Time",
            filterable: false,
            render: (row) => (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/50 text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900">
                    <Clock className="h-3 w-3" />
                    {[row.start_time, row.end_time].filter(Boolean).join(" – ") || "—"}
                </span>
            ),
        },
        {
            key: "location",
            label: "Location",
            render: (row) => (
                <div className="flex items-start gap-1.5 max-w-xs">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                        <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {row.venue || "—"}
                        </span>
                        <span className="block text-[11px] text-slate-400 truncate">
                            {[row.city, row.state].filter(Boolean).join(", ") || ""}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "registration",
            label: "Registration",
            filterable: false,
            render: (row) => (
                <div className="flex flex-col gap-0.5 text-xs">
                    <span className={`inline-flex items-center gap-1 font-semibold w-fit px-2 py-0.5 rounded-md ${row.registration_required
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                        {row.registration_required ? (
                            <>
                                <Users className="h-3 w-3" /> Required
                            </>
                        ) : (
                            <>Not Required</>
                        )}
                    </span>
                    {row.registration_limit && (
                        <span className="text-[11px] text-slate-400">
                            Limit: {row.registration_limit}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "is_active",
            label: "Status",
            filterable: false,
            render: renderCampStatus,
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
                        title="Edit Health Camp"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingCamp(row)}
                        className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50"
                        title="Delete Health Camp"
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
            <div className="rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-rose-100">
                        <Sparkles className="h-4 w-4" />
                        <span>Quantum Health Analysis</span>
                    </div>
                    <h1 className="text-2xl font-bold mt-1 tracking-tight">
                        Health Camps Management
                    </h1>
                    <p className="text-sm text-rose-100 mt-1 max-w-2xl">
                        Create and manage health camps shown on the public website. Only active camps appear on the site.
                    </p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="bg-white text-rose-700 hover:bg-rose-50 font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2 self-start sm:self-auto"
                >
                    <Plus className="h-5 w-5" />
                    <span>Add New Health Camp</span>
                </Button>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Total Health Camps
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {totalCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                All scheduled camps
                            </p>
                        </div>
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/60 rounded-xl text-rose-600 dark:text-rose-400">
                            <HeartPulse className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/10">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                Active Health Camps
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {activeCount}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Shown on the public website
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
                                Upcoming Camps
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {upcomingCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Date today or later
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Calendar className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Registration Camps
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                                {regCount}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                With registration enabled
                            </p>
                        </div>
                        <div className="p-3 bg-fuchsia-50 dark:bg-fuchsia-950/60 rounded-xl text-fuchsia-600 dark:text-fuchsia-400">
                            <Users className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Health Camps Table Card */}
            <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                <HeartPulse className="h-4 w-4 text-rose-600" />
                                Health Camps List
                            </CardTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Manage the health camps that appear on the public website.
                            </p>
                        </div>
                        <Button
                            onClick={openCreateModal}
                            size="sm"
                            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold self-start sm:self-auto"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> Add Health Camp
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                    {/* Status + date filters */}
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
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                            {filterDate && (
                                <button
                                    onClick={() => setFilterDate("")}
                                    className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <ReusableTable
                        headers={headers}
                        data={filteredCamps}
                        loading={loading}
                        Search="Search by camp name, venue, or city..."
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
                                <div className="p-2 bg-rose-50 dark:bg-rose-950/60 rounded-xl text-rose-600 dark:text-rose-400">
                                    <HeartPulse className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        {editingCamp ? "Edit Health Camp" : "Create Health Camp"}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {editingCamp
                                            ? "Update camp details and active status"
                                            : "Add a new health camp for the public website"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingCamp(null);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Camp Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Free Health Checkup Camp"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Brief description of the camp and what it offers..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Camp Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Camp Image / Banner
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="Paste an image URL for the camp banner"
                                        value={form.image}
                                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        value={form.start_time}
                                        onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        value={form.end_time}
                                        onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Venue
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Community Hall, Main Road"
                                        value={form.venue}
                                        onChange={(e) => setForm({ ...form, venue: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Full Address
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Street, area, landmark..."
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Ahmedabad"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Gujarat"
                                        value={form.state}
                                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Pincode
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 380001"
                                        value={form.pincode}
                                        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                        Registration Limit (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="e.g. 100"
                                        value={form.registration_limit}
                                        onChange={(e) => setForm({ ...form, registration_limit: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div className="sm:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                        Contact Information
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                                Contact Person
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Name of contact person"
                                                value={form.contact_person}
                                                onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                                                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                                Contact Number
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. +91 98765 43210"
                                                value={form.contact_number}
                                                onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                                                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                                Contact Email
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="contact@example.com"
                                                value={form.contact_email}
                                                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                                                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="sm:col-span-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                        Additional Notes
                                    </p>
                                    <textarea
                                        rows={2}
                                        placeholder="Any other instructions for attendees..."
                                        value={form.additional_notes}
                                        onChange={(e) => setForm({ ...form, additional_notes: e.target.value })}
                                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                            </div>

                            {/* Image preview (URL text field) */}
                            {form.image && (
                                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <img
                                        src={form.image}
                                        alt="banner-preview"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                        }}
                                        className="w-full max-h-52 object-cover"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            Camp Active
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Active camps are shown on the public website
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
                                            Registration Required
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Visitors can register for this camp online
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.registration_required}
                                            onChange={(e) => setForm({ ...form, registration_required: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingCamp(null);
                                    }}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5"
                                >
                                    {submitting
                                        ? "Saving..."
                                        : editingCamp
                                            ? "Update Health Camp"
                                            : "Create Health Camp"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* DELETE CONFIRMATION MODAL */}
            {/* ========================================================================= */}
            {deletingCamp && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                                    Delete Health Camp?
                                </h3>
                                <p className="text-xs text-slate-500">This action cannot be undone.</p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            {`Are you sure you want to delete health camp "${deletingCamp.name}"?`}
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setDeletingCamp(null)}
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
