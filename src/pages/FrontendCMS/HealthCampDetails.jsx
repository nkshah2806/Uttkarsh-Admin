import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    HeartPulse,
    ArrowLeft,
    Eye,
    Calendar,
    Clock,
    MapPin,
    Users,
    Check,
    X,
    Phone,
    Mail,
    User,
    AlertCircle,
    ClipboardList,
    FileText,
    Hash,
    StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import ReusableTable from "@/components/ReusableTable";
import LocalizedText from "@/components/LocalizedText";
import { healthCampService } from "@/services/healthCampService";
import { Config } from "@/lib/Config";

// Formatting helpers (kept local; consistent with HealthCamps list behaviour)
const formatCampDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const formatTimeRange = (row) => [row.start_time, row.end_time].filter(Boolean).join(" – ") || "—";

const formatDateTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return `${d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })}, ${d.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    })}`;
};

const shortId = (id) => (id ? String(id).slice(-8).toUpperCase() : "—");

export default function HealthCampDetails() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { campId } = useParams();

    const [camp, setCamp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCamp = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await healthCampService.getHealthCampById(campId);
            if (!res) {
                setError(t("campDetails.notFound"));
                setCamp(null);
                return;
            }
            setCamp(res);
        } catch (err) {
            setError(err?.response?.data?.message || t("campDetails.loadFailed"));
            setCamp(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (campId) fetchCamp();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [campId]);

    // Registrations are embedded sub-documents on the camp itself, so listing
    // them here naturally shows ONLY the registrations for this specific camp.
    const registrations = useMemo(
        () => (Array.isArray(camp?.registrations) ? camp.registrations : []),
        [camp]
    );

    const locationLine = [camp?.venue, camp?.address, camp?.city, camp?.state, camp?.pincode]
        .filter(Boolean)
        .join(", ");

    const renderStatusBadge = (active) =>
        active ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-xs">
                <Check className="h-3 w-3" /> {t("campDetails.active")}
            </span>
        ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <X className="h-3 w-3" /> {t("campDetails.inactive")}
            </span>
        );

    const renderRegistrationRequired = (required) =>
        required ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-semibold">
                <Users className="h-3 w-3" /> {t("campDetails.required")}
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-xs font-semibold">
                {t("campDetails.notRequired")}
            </span>
        );

    // ------------------------------------------------------------------
    // Registered People table headers (only this camp's registrations)
    // ------------------------------------------------------------------
    const regHeaders = [
        {
            key: "_id",
            label: t("campDetails.colRegId"),
            filterable: false,
            render: (row) => (
                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    #{shortId(row._id)}
                </span>
            ),
        },
        {
            key: "name",
            label: t("campDetails.colPersonName"),
            render: (row) => (
                <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <User className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[220px]">
                            <LocalizedText value={row.name} />
                        </span>
                        {row.age != null && row.age !== "" && (
                            <span className="block text-[11px] text-slate-400">
                                {t("campDetails.age", { age: row.age })}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "phone",
            label: t("campDetails.colMobile"),
            render: (row) =>
                row.phone ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {row.phone}
                    </span>
                ) : (
                    "—"
                ),
        },
        {
            key: "email",
            label: t("campDetails.colEmail"),
            render: (row) =>
                row.email ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="truncate max-w-[200px]">{row.email}</span>
                    </span>
                ) : (
                    <span className="text-xs text-slate-400">—</span>
                ),
        },
        {
            key: "notes",
            label: t("campDetails.colNotes"),
            filterable: false,
            render: (row) =>
                row.notes ? (
                    <span className="inline-flex items-start gap-1.5 text-xs text-slate-500 max-w-[200px] truncate" title={row.notes}>
                        <StickyNote className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                        <LocalizedText value={row.notes} />
                    </span>
                ) : (
                    <span className="text-xs text-slate-400">—</span>
                ),
        },
        {
            key: "createdAt",
            label: t("campDetails.colRegDate"),
            filterable: false,
            render: (row) => (
                <div className="flex flex-col text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                        <Calendar className="h-3 w-3 text-emerald-400" />
                        {formatDateTime(row.createdAt)}
                    </span>
                </div>
            ),
        },
        {
            key: "status",
            label: t("campDetails.colStatus"),
            filterable: false,
            render: () => (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
                    <Check className="h-3 w-3" /> {t("campDetails.registered")}
                </span>
            ),
        },
    ];

    // ------------------------------------------------------------------
    // Loading / error / not-found states
    // ------------------------------------------------------------------
    if (loading) {
        return (
            <PageLoader label={t("campDetails.loading")} minHeight="28rem" />
        );
    }

    if (!camp || error) {
        return (
            <div className="text-center py-16 space-y-4">
                <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t("campDetails.notFoundTitle")}</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">{error || t("campDetails.notFoundDesc")}</p>
                <Button onClick={() => navigate("/frontend-cms/health-camps")} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" /> {t("campDetails.backToCamps")}
                </Button>
            </div>
        );
    }

    const isActive = camp.is_active !== false;

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 p-6 text-white shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/frontend-cms/health-camps")}
                        className="rounded-xl bg-white/10 hover:bg-white/20 text-white shrink-0"
                        title={t("campDetails.backToCampsTitle")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-rose-100">
                            <Eye className="h-4 w-4" />
                            <span>{t("campDetails.eyebrow")}</span>
                        </div>
                        <h1 className="text-2xl font-bold mt-1 tracking-tight truncate">
                            <LocalizedText value={camp.name} />
                        </h1>
                        <p className="text-sm text-rose-100 mt-1 max-w-2xl">
                            {t("campDetails.bannerDesc")}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
                    {renderStatusBadge(isActive)}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm">
                        <Users className="h-3 w-3" />
                        {t("campDetails.registeredCount", { count: registrations.length })}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* ================================================================= */}
                {/* CAMP INFORMATION */}
                {/* ================================================================= */}
                <div className="xl:col-span-2 space-y-6">
                    <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                        {camp.image && (
                            <div className="w-full max-h-64 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <img
                                    src={
                                        camp.image && camp.image.startsWith("/uploads/")
                                            ? `${Config.API_URL}${camp.image.replace(/^\//, "")}`
                                            : camp.image
                                    }
                                    alt="camp-banner"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                                    <HeartPulse className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">
                                        {t("campDetails.campInfoTitle")}
                                    </CardTitle>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {t("campDetails.campInfoDesc")}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 space-y-5">
                            {/* Schedule */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                        {t("campDetails.campDate")}
                                    </p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 inline-flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-rose-500" />
                                        {formatCampDate(camp.date)}
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                        {t("campDetails.campTiming")}
                                    </p>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 inline-flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-rose-500" />
                                        {formatTimeRange(camp)}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            {camp.description && (
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                        {t("campDetails.description")}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                        <LocalizedText value={camp.description} />
                                    </p>
                                </div>
                            )}

                            {/* Location */}
                            {locationLine && (
                                <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30">
                                    <MapPin className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 mb-0.5">
                                            {t("campDetails.venue")}
                                        </p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {locationLine}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Additional notes */}
                            {camp.additional_notes && (
                                <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-amber-100 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                                    <ClipboardList className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-500 mb-0.5">
                                            {t("campDetails.additionalNotes")}
                                        </p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                            {camp.additional_notes}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Meta grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                        {t("campDetails.registration")}
                                    </p>
                                    {renderRegistrationRequired(camp.registration_required)}
                                </div>
                                {camp.registration_limit != null && (
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                            {t("campDetails.registrationLimit")}
                                        </p>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5">
                                            <Hash className="h-3.5 w-3.5 text-slate-400" />
                                            {camp.registration_limit}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                        {t("campDetails.registrations")}
                                    </p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5 text-rose-400" />
                                        {registrations.length}
                                        {camp.registration_limit != null &&
                                            ` / ${camp.registration_limit}`}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact information */}
                    {(camp.contact_person || camp.contact_number || camp.contact_email) && (
                        <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 inline-flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-rose-600" />
                                    {t("campDetails.contactInfo")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {camp.contact_person && (
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                            {t("campDetails.contactPerson")}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {camp.contact_person}
                                        </p>
                                    </div>
                                )}
                                {camp.contact_number && (
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                            {t("campDetails.contactNumber")}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {camp.contact_number}
                                        </p>
                                    </div>
                                )}
                                {camp.contact_email && (
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                            {t("campDetails.contactEmail")}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 break-all">
                                            {camp.contact_email}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* ================================================================= */}
                {/* CREATED / UPDATED SIDEBAR */}
                {/* ================================================================= */}
                <div className="space-y-6">
                    <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 inline-flex items-center gap-2">
                                <FileText className="h-4 w-4 text-rose-600" />
                                {t("campDetails.recordInfo")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4 text-sm">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    {t("campDetails.createdOn")}
                                </p>
                                <p className="text-slate-700 dark:text-slate-300">
                                    {formatDateTime(camp.createdAt)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    {t("campDetails.lastUpdatedOn")}
                                </p>
                                <p className="text-slate-700 dark:text-slate-300">
                                    {formatDateTime(camp.updatedAt)}
                                </p>
                            </div>
                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 flex-wrap">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/frontend-cms/health-camps`)}
                                >
                                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> {t("campDetails.backToList")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ================================================================= */}
            {/* REGISTERED PEOPLE / CAMP REGISTRATIONS */}
            {/* ================================================================= */}
            <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                                <Users className="h-4 w-4 text-emerald-600" />
                                {t("campDetails.registrationsTitle")}
                            </CardTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {t("campDetails.registrationsCount", { count: registrations.length })}
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900 w-fit">
                            <Check className="h-3 w-3" /> {t("campDetails.total", { count: registrations.length })}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <ReusableTable
                        headers={regHeaders}
                        data={registrations}
                        loading={loading}
                        Search={t("campDetails.searchPlaceholder")}
                        pagination={registrations.length > 5}
                    />
                    {!loading && registrations.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                                <Users className="h-8 w-8" />
                            </div>
                            <p className="text-sm font-semibold text-slate-500">
                                {t("campDetails.noRegistrations")}
                            </p>
                            <p className="text-xs text-slate-400 max-w-md">
                                {t("campDetails.noRegistrationsDesc")}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
