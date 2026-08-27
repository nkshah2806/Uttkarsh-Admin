import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroCMS() {
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveContent(data);
      toast.success(t("cmsHeroUpdated"));
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

  if (loading) return <CMSLoader label="cmsLoadingHero" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={ImageIcon}
        title="heroBanner"
        description="cmsHeroDescription"
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-violet-500" /> {t("cmsHeroCardTitle")}
          </CardTitle>
          <CardDescription>
            {t("cmsHeroCardDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label="cmsBadgePillLabel">
            <CMSInput
              value={data.hero?.badge}
              onChange={(e) => set("hero.badge", e.target.value)}
              placeholder="cmsLocalForVocalPlaceholder"
            />
          </Field>
          <Field label="cmsBackgroundImageUrl">
            <CMSInput
              value={data.hero?.bgImage}
              onChange={(e) => set("hero.bgImage", e.target.value)}
              placeholder="cmsImageUrlPlaceholder"
            />
          </Field>
          {data.hero?.bgImage && (
            <div className="md:col-span-2 rounded-xl overflow-hidden h-48 border border-border">
              <img src={data.hero.bgImage} alt={t("cmsHeroPreviewAlt")} className="w-full h-full object-cover" />
            </div>
          )}
          <Field label="cmsHeadlineLine1">
            <CMSInput
              value={data.hero?.titleLine1}
              onChange={(e) => set("hero.titleLine1", e.target.value)}
              placeholder="cmsAncientWisdomPlaceholder"
            />
          </Field>
          <Field label="cmsHeadlineLine2">
            <CMSInput
              value={data.hero?.titleLine2}
              onChange={(e) => set("hero.titleLine2", e.target.value)}
              placeholder="cmsEverydayWellnessPlaceholder"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="cmsDescriptionParagraph">
              <CMSTextarea
                rows={3}
                value={data.hero?.description}
                onChange={(e) => set("hero.description", e.target.value)}
              />
            </Field>
          </div>
          <Field label="cmsPrimaryButtonText">
            <CMSInput
              value={data.hero?.primaryCtaText}
              onChange={(e) => set("hero.primaryCtaText", e.target.value)}
              placeholder="cmsShopCollectionPlaceholder"
            />
          </Field>
          <Field label="cmsPrimaryButtonLink">
            <CMSInput
              value={data.hero?.primaryCtaLink}
              onChange={(e) => set("hero.primaryCtaLink", e.target.value)}
              placeholder="cmsShopLinkPlaceholder"
            />
          </Field>
          <Field label="cmsSecondaryButtonText">
            <CMSInput
              value={data.hero?.secondaryCtaText}
              onChange={(e) => set("hero.secondaryCtaText", e.target.value)}
              placeholder="cmsOurStoryPlaceholder"
            />
          </Field>
          <Field label="cmsSecondaryButtonLink">
            <CMSInput
              value={data.hero?.secondaryCtaLink}
              onChange={(e) => set("hero.secondaryCtaLink", e.target.value)}
              placeholder="cmsAboutLinkPlaceholder"
            />
          </Field>
        </CardContent>
      </Card>

      <StickyBar onSave={handleSave} saving={saving} />
    </div>
  );
}
