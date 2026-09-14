import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";
import { MediaUploader } from "@/components/media-uploader";
import LocalizedText from "@/components/LocalizedText";
import { useTranslatedText } from "@/hooks/useTranslatedText";

export default function MissionCMS() {
  const { t } = useTranslation();
  const [data, setData] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const phBadge = useTranslatedText("Our Mission");
  const phStatNumber = useTranslatedText("Number / Value");
  const phStatLabel = useTranslatedText("Label");
  const phStatLabelPlaceholder = useTranslatedText("Health Camps");
  const phUploadHelp = useTranslatedText(
    "JPG, JPEG, PNG or WebP (max 5MB) — upload from your device",
  );

  useEffect(() => {
    getContent().then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const set = (path, value) => {
    setData((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let cursor = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cursor[keys[i]] = { ...cursor[keys[i]] };
        cursor = cursor[keys[i]];
      }
      cursor[keys[keys.length - 1]] = value;
      return { ...next };
    });
  };

  const updateStat = (idx, field, value) => {
    const stats = [...(data.mission?.stats || [])];
    stats[idx] = { ...stats[idx], [field]: value };
    set("mission.stats", stats);
  };

  const addStat = () => {
    const stats = [...(data.mission?.stats || []), { id: Date.now(), number: "50+", label: "New Metric" }];
    set("mission.stats", stats);
  };

  const removeStat = (idx) => {
    const stats = (data.mission?.stats || []).filter((_, i) => i !== idx);
    set("mission.stats", stats);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveContent(data);
      toast.success(`✅ ${t("cms.liveSiteUpdated")}`);
    } catch {
      toast.error(t("cms.saveContentFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(t("cms.resetConfirm"))) return;
    const d = await resetContentToDefaults();
    setData(d);
    toast.success(t("cms.contentReset"));
  };

  if (loading) return <CMSLoader />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={BarChart3}
        title={t("cms.secMissionStats")}
        description={t("cms.secMissionStatsDesc")}
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-500" />{" "}
            <LocalizedText value="Mission Story & Impact Stats" />
          </CardTitle>
          <CardDescription>
            <LocalizedText value="Edit the mission narrative, section image, and all impact counter metrics." />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={<LocalizedText value="Section Badge" />}>
              <CMSInput
                value={data.mission?.badge}
                onChange={(e) => set("mission.badge", e.target.value)}
                placeholder={phBadge}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label={<LocalizedText value="Section Image" />}>
                <MediaUploader
                  value={data.mission?.image || ""}
                  onUploaded={(ref) => set("mission.image", ref)}
                  onClear={() => set("mission.image", "")}
                  folder="mission"
                  accept="image"
                  helpText={phUploadHelp}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label={<LocalizedText value="Section Title" />}>
                <CMSInput
                  value={data.mission?.title}
                  onChange={(e) => set("mission.title", e.target.value)}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label={<LocalizedText value="Paragraph 1" />}>
                <CMSTextarea
                  rows={3}
                  value={data.mission?.paragraph1}
                  onChange={(e) => set("mission.paragraph1", e.target.value)}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label={<LocalizedText value="Paragraph 2" />}>
                <CMSTextarea
                  rows={3}
                  value={data.mission?.paragraph2}
                  onChange={(e) => set("mission.paragraph2", e.target.value)}
                />
              </Field>
            </div>
          </div>

          {/* Stats */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">
                <LocalizedText value="Impact Counter Stats" />
              </h3>
              <Button size="sm" variant="outline" onClick={addStat} className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />{" "}
                <LocalizedText value="Add Counter" />
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {(data.mission?.stats || []).map((stat, idx) => (
                <div key={stat.id || idx} className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3 relative">
                  <button
                    onClick={() => removeStat(idx)}
                    className="absolute top-3 right-3 p-1 rounded-full text-destructive hover:bg-destructive/10 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Field label={phStatNumber}>
                    <CMSInput
                      value={stat.number}
                      onChange={(e) => updateStat(idx, "number", e.target.value)}
                      placeholder="50+"
                    />
                  </Field>
                  <Field label={phStatLabel}>
                    <CMSInput
                      value={stat.label}
                      onChange={(e) => updateStat(idx, "label", e.target.value)}
                      placeholder={phStatLabelPlaceholder}
                    />
                  </Field>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <StickyBar onSave={handleSave} saving={saving} />
    </div>
  );
}
