import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, AlertTriangle, CheckCircle2, CircleDollarSign } from "lucide-react";

const parameters = [
  { nameKey: "demo.reportEntry.paramBodyTemperature", value: "98.6°F", status: "Normal" },
  { nameKey: "demo.reportEntry.paramBloodPressure", value: "124/82", status: "High" },
  { nameKey: "demo.reportEntry.paramHemoglobin", value: "12.8 g/dL", status: "Low" },
  { nameKey: "demo.reportEntry.paramBloodSugar", value: "94 mg/dL", status: "Normal" },
];

export default function ReportEntry() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("demo.reportEntry.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("demo.reportEntry.subtitle")}</p>
        </div>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" /> {t("demo.reportEntry.generateReport")}
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("demo.reportEntry.clientDetailsTitle")}</CardTitle>
          <CardDescription>{t("demo.reportEntry.clientDetailsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input placeholder={t("demo.reportEntry.placeholderClientName")} />
          <Input placeholder={t("demo.reportEntry.placeholderReportId")} />
          <Input placeholder={t("demo.reportEntry.placeholderConsultant")} />
          <Input placeholder={t("demo.reportEntry.placeholderDate")} />
          <Textarea className="md:col-span-2" placeholder={t("demo.reportEntry.placeholderNotes")} />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t("demo.reportEntry.parameterEntryTitle")}</CardTitle>
          <CardDescription>{t("demo.reportEntry.parameterEntryDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {parameters.map((parameter) => (
              <div key={parameter.nameKey} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{t(parameter.nameKey)}</p>
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${parameter.status === "High" ? "bg-rose-100 text-rose-700" : parameter.status === "Low" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {t(`demo.reportEntry.status${parameter.status}`)}
                  </span>
                </div>
                <Input className="mt-3" value={parameter.value} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-semibold">{t("demo.reportEntry.autoStatusTitle")}</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t("demo.reportEntry.autoStatusDesc")}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-semibold">{t("demo.reportEntry.colorCodingTitle")}</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t("demo.reportEntry.colorCodingDesc")}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-violet-600">
              <CircleDollarSign className="h-5 w-5" />
              <p className="font-semibold">{t("demo.reportEntry.reportNotesTitle")}</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t("demo.reportEntry.reportNotesDesc")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
