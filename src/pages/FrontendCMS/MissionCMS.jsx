import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";
import { useLanguage } from "@/context/LanguageContext";

export default function MissionCMS() {
  const { t } = useLanguage();
  const [data, setData] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    const stats = [...(data.mission?.stats || []), { id: Date.now(), number: t("cmsNumberPlaceholder"), label: t("cmsNewMetric") }];
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
      toast.success(t("cmsMissionUpdated"));
    } catch {
      toast.error(t("cmsSaveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(t("cmsResetConfirm"))) return;
    const d = await resetContentToDefaults();
    setData(d);
    toast.success(t("cmsResetDone"));
  };

  if (loading) return <CMSLoader label="cmsLoadingMission" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={BarChart3}
        title="missionStats"
        description="cmsMissionDescription"
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-violet-500" /> {t("cmsMissionCardTitle")}
          </CardTitle>
          <CardDescription>
            {t("cmsMissionCardDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="cmsSectionBadge">
              <CMSInput
                value={data.mission?.badge}
                onChange={(e) => set("mission.badge", e.target.value)}
                placeholder="cmsOurMissionPlaceholder"
              />
            </Field>
            <Field label="cmsSectionImageUrl">
              <CMSInput
                value={data.mission?.image}
                onChange={(e) => set("mission.image", e.target.value)}
                placeholder="cmsImageUrlPlaceholder"
              />
            </Field>
            {data.mission?.image && (
              <div className="md:col-span-2 rounded-xl overflow-hidden h-48 border border-border">
                <img src={data.mission.image} alt={t("cmsMissionPreviewAlt")} className="w-full h-full object-cover object-center" />
              </div>
            )}
            <div className="md:col-span-2">
              <Field label="cmsSectionTitle">
                <CMSInput
                  value={data.mission?.title}
                  onChange={(e) => set("mission.title", e.target.value)}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="cmsParagraph1">
                <CMSTextarea
                  rows={3}
                  value={data.mission?.paragraph1}
                  onChange={(e) => set("mission.paragraph1", e.target.value)}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="cmsParagraph2">
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
              <h3 className="font-semibold text-sm">{t("cmsImpactCounterStats")}</h3>
              <Button size="sm" variant="outline" onClick={addStat} className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> {t("cmsAddCounter")}
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
                  <Field label="cmsNumberValue">
                    <CMSInput
                      value={stat.number}
                      onChange={(e) => updateStat(idx, "number", e.target.value)}
                      placeholder="cmsNumberPlaceholder"
                    />
                  </Field>
                  <Field label="cmsLabel">
                    <CMSInput
                      value={stat.label}
                      onChange={(e) => updateStat(idx, "label", e.target.value)}
                      placeholder="cmsLabelPlaceholder"
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
