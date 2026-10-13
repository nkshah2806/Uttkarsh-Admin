import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, AlertCircle, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Base pulse skeleton with optional shimmer variant.
 */
export function Skeleton({
  className,
  variant = "rounded", // "text" | "circular" | "rounded" | "rect"
  width,
  height,
  style,
  ...props
}) {
  const variantClass =
    variant === "circular"
      ? "rounded-full"
      : variant === "text"
      ? "rounded h-4 my-1"
      : variant === "rect"
      ? "rounded-none"
      : "rounded-md";

  return (
    <div
      data-slot="skeleton"
      role="status"
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-slate-200/80 dark:bg-slate-800/80 select-none pointer-events-none",
        variantClass,
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}

/**
 * Image loader with skeleton placeholder and error fallback
 */
export function ImageWithSkeleton({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  aspectRatio = "aspect-square",
  fallbackIcon: FallbackIcon = ImageIcon,
  fallbackText,
  onClick,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src) {
    return (
      <div
        className={cn(
          "w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/60 text-slate-400",
          aspectRatio,
          containerClassName
        )}
      >
        <FallbackIcon className="w-8 h-8 opacity-50" />
        {fallbackText && <span className="text-xs mt-1 font-medium">{fallbackText}</span>}
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden", aspectRatio, containerClassName)}
      onClick={onClick}
    >
      {!loaded && !hasError && (
        <Skeleton
          className="absolute inset-0 w-full h-full rounded-none bg-slate-200 dark:bg-slate-800"
        />
      )}
      {hasError ? (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/60 text-slate-400 p-2">
          <FallbackIcon className="w-8 h-8 opacity-50" />
          <span className="text-[11px] mt-1 text-center font-medium opacity-80">
            {fallbackText || "Image unavailable"}
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setHasError(true);
            setLoaded(true);
          }}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}

/**
 * Standardized Error State with Retry button
 */
export function ErrorState({
  title = "Unable to load data",
  message = "A temporary connection issue occurred. Please check your network and try again.",
  onRetry,
  className = "",
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-2xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center max-w-lg mx-auto my-6",
        className
      )}
    >
      <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{message}</p>
      {onRetry && (
        <Button
          type="button"
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-2 border-rose-200 dark:border-rose-800 hover:bg-rose-100/50"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </Button>
      )}
    </div>
  );
}

/**
 * Standardized Empty State
 */
export function EmptyState({
  icon: Icon = FileText,
  title = "No data found",
  description = "There are no records to display at this time.",
  action,
  className = "",
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center max-w-md mx-auto my-4",
        className
      )}
    >
      <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      {action}
    </div>
  );
}

/**
 * Table Skeleton Rows for inside TableBody
 */
export function TableSkeletonRows({
  columns = 5,
  rows = 5,
  hasCheckbox = false,
  hasActions = true,
}) {
  const colWidths = ["w-2/5", "w-3/5", "w-1/2", "w-3/4", "w-1/3", "w-2/3"];

  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-800/60 animate-pulse">
          {hasCheckbox && (
            <td className="p-3 w-10">
              <Skeleton className="h-4 w-4 rounded" />
            </td>
          )}
          {Array.from({ length: columns }).map((_, cIdx) => (
            <td key={cIdx} className="p-3">
              <Skeleton
                className={cn(
                  "h-4 rounded",
                  colWidths[(rIdx + cIdx) % colWidths.length]
                )}
              />
            </td>
          ))}
          {hasActions && (
            <td className="p-3 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </td>
          )}
        </tr>
      ))}
    </>
  );
}

/**
 * Standalone Table Skeleton including table header, rows, and pagination
 */
export function TableSkeleton({
  columns = 5,
  rows = 5,
  hasCheckbox = false,
  hasActions = true,
  className = "",
}) {
  const colCount = typeof columns === "number" ? columns : columns.length;

  return (
    <div className={cn("w-full border rounded-xl overflow-hidden bg-card shadow-xs", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <tr>
              {hasCheckbox && (
                <th className="p-3 w-10">
                  <Skeleton className="h-4 w-4 rounded" />
                </th>
              )}
              {Array.from({ length: colCount }).map((_, i) => (
                <th key={i} className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
              {hasActions && (
                <th className="p-3 w-24 text-right">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <TableSkeletonRows
              columns={colCount}
              rows={rows}
              hasCheckbox={hasCheckbox}
              hasActions={hasActions}
            />
          </tbody>
        </table>
      </div>
      {/* Pagination Bar Skeleton */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
        <Skeleton className="h-4 w-28" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Card Skeleton for Dashboard
 */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-card p-4 shadow-xs dark:border-slate-800 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 rounded" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-20 rounded" />
      <Skeleton className="h-3 w-28 rounded" />
    </div>
  );
}

/**
 * Chart Skeleton for Dashboard
 */
export function ChartSkeleton({ height = "h-64", type = "area" }) {
  return (
    <div className={cn("w-full rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-4 flex flex-col justify-between animate-pulse", height)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      {type === "pie" ? (
        <div className="flex items-center justify-center py-4">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
      ) : (
        <div className="space-y-3 pt-6">
          <div className="flex items-end gap-3 h-32 px-4 justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={i}
                className="w-8 rounded-t"
                style={{ height: `${25 + (i * 12) % 65}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 px-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-6" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * List Item Skeleton for Dashboard (Recent clients, reports, follow-ups)
 */
export function ListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-2.5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-card"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-3 w-16 ml-auto rounded" />
            <Skeleton className="h-3 w-8 ml-auto rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Skeleton — full view with stat cards, charts, and lists
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="rounded-3xl bg-slate-200 dark:bg-slate-800 p-6 md:p-8 space-y-4">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-8 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-1/2 max-w-xs" />
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      {/* 6 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-44" />
          <ChartSkeleton height="h-64" type="area" />
        </div>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-36" />
          <ChartSkeleton height="h-64" type="pie" />
        </div>
      </div>

      {/* Lists Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-36" />
          <ListSkeleton count={4} />
        </div>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-36" />
          <ListSkeleton count={4} />
        </div>
      </div>
    </div>
  );
}

/**
 * Profile Skeleton — for MemberProfile and UserDetails
 */
export function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 bg-card flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-5">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <Skeleton className="h-16 w-36 rounded-xl shrink-0" />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5 space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5 space-y-5">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Report Document Skeleton — for ReportReviewOverride and PDFReportViewer
 * Matches exact A4 preview container
 */
export function ReportSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Top Action / Header bar */}
      <div className="rounded-2xl bg-card border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-6 w-52" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* A4 Report Simulation Box */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-10 shadow-lg space-y-6">
        {/* Clinic Header */}
        <div className="flex justify-between items-start pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3.5 w-64" />
            <Skeleton className="h-3.5 w-40" />
          </div>
          <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
        </div>

        {/* Client Demographics strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>

        {/* Evaluation Summary Pills */}
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>

        {/* Parameter Rows */}
        <div className="space-y-3 pt-2">
          <Skeleton className="h-5 w-40" />
          <TableSkeleton columns={4} rows={4} hasCheckbox={false} hasActions={false} />
        </div>

        {/* Guidance / Recommendations Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Skeleton className="h-5 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Form Skeleton — input field rows, textareas, and submit buttons
 */
export function FormSkeleton({ fields = 4, columns = 2, hasSubmit = true }) {
  return (
    <div className="space-y-5 animate-pulse">
      <div
        className={cn(
          "grid gap-4",
          columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
        )}
      >
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-32 rounded" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      {hasSubmit && (
        <div className="flex justify-end gap-3 pt-2">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      )}
    </div>
  );
}

/**
 * Dropdown / Select Skeleton
 */
export function DropdownSkeleton({ className = "" }) {
  return (
    <div
      className={cn(
        "h-10 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 flex items-center justify-between animate-pulse",
        className
      )}
    >
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-4 rounded" />
    </div>
  );
}

/**
 * Modal Skeleton
 */
export function ModalSkeleton({ title = "Loading...", fields = 3 }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-pulse">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-3 border-t">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full Page Skeleton
 */
export function PageSkeleton({
  hasHeader = true,
  blocks = 3,
  className = "",
}) {
  return (
    <div className={cn("w-full space-y-6 animate-pulse", className)}>
      {hasHeader && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3.5 w-72" />
          </div>
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: blocks }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card space-y-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-28 w-full rounded-xl mt-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
