import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Activity,
  FileCheck,
  FileText,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Pencil,
  Clock,
  Sparkles,
} from "lucide-react";
import LocalizedText from "@/components/LocalizedText";

export default function AnalysisStepper({
  currentStep = 1,
  visitId,
  patient,
  visitStatus = "DATA_ENTRY",
  hasResults = false,
  hasReport = false,
  className = "",
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isShared = visitStatus === "SHARED" || hasReport;
  const isReportReady = visitStatus === "REPORT_READY" || isShared;

  const steps = [
    {
      id: 1,
      title: t("demo.stepper.step1Title", "Quantum Data Entry"),
      subtitle: t("demo.stepper.step1Subtitle", "Scan readings & parameters"),
      icon: Activity,
      path: `/quantum-scan/${visitId}`,
      isCompleted: currentStep > 1 || isReportReady || hasResults,
      isAccessible: true,
    },
    {
      id: 2,
      title: t("demo.stepper.step2Title", "Review & Customize"),
      subtitle: t("demo.stepper.step2Subtitle", "Guidance, medicines & notes"),
      icon: FileCheck,
      path: `/report-review/${visitId}`,
      isCompleted: currentStep > 2 || isShared,
      isAccessible: hasResults || isReportReady,
    },
    {
      id: 3,
      title: t("demo.stepper.step3Title", "Generated PDF Report"),
      subtitle: t("demo.stepper.step3Subtitle", "View, download & share"),
      icon: FileText,
      path: `/report-pdf/${visitId}`,
      isCompleted: isShared,
      isAccessible: isShared,
    },
  ];

  return (
    <div
      className={`rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden ${className}`}
    >
      {/* Top Patient & Session Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {patient?._id && (
            <button
              type="button"
              onClick={() => navigate(`/patients/${patient._id}`)}
              className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer mr-1"
              title={t("demo.stepper.backToPatient", "Back to Patient")}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t("demo.stepper.patient", "Patient")}</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
            <span>
              <LocalizedText value={patient?.name} />
            </span>
            {patient?.patient_code && (
              <span className="text-[11px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900">
                {patient.patient_code}
              </span>
            )}
          </div>

          {(patient?.age || patient?.gender) && (
            <span className="text-slate-400 text-[11px]">
              ({patient?.age ? `${patient.age}y` : ""}
              {patient?.age && patient?.gender ? " · " : ""}
              {patient?.gender ? <LocalizedText value={patient.gender} /> : ""})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {visitId && (
            <span className="font-mono text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold">
              #{visitId.slice(-6).toUpperCase()}
            </span>
          )}

          {isShared ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3 w-3" />
              <span>{t("demo.stepper.statusGenerated", "Report Generated")}</span>
            </span>
          ) : isReportReady ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <FileCheck className="h-3 w-3" />
              <span>{t("demo.stepper.statusReviewPending", "Ready for Review")}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Clock className="h-3 w-3" />
              <span>{t("demo.stepper.statusDataEntry", "Data Entry In Progress")}</span>
            </span>
          )}
        </div>
      </div>

      {/* Stepper Steps Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
        {steps.map((step) => {
          const isCurrent = step.id === currentStep;
          const StepIcon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!step.isAccessible || isCurrent}
              onClick={() => step.isAccessible && navigate(step.path)}
              className={`p-3 text-left transition-all flex items-center gap-3 relative ${
                isCurrent
                  ? "bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 cursor-default"
                  : step.isAccessible
                  ? "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 cursor-pointer"
                  : "opacity-45 cursor-not-allowed text-slate-400"
              }`}
            >
              {/* Active Step Indicator Pill on Bottom */}
              {isCurrent && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
              )}

              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors shadow-xs ${
                  isCurrent
                    ? "bg-emerald-600 text-white"
                    : step.isCompleted
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {step.isCompleted && !isCurrent ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate">{step.title}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                      {t("demo.stepper.active", "Current")}
                    </span>
                  )}
                  {!isCurrent && step.isAccessible && step.id === 2 && isShared && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 px-1.5 py-0.2 rounded border border-teal-200/60">
                      <Pencil className="h-2.5 w-2.5" />
                      {t("demo.stepper.editable", "Edit")}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {step.subtitle}
                </p>
              </div>

              {step.isAccessible && !isCurrent && (
                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

