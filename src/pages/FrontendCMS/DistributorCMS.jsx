import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";
import { useLanguage } from "@/context/LanguageContext";

export default function DistributorCMS() {
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
      toast.success(t("cmsDistributorUpdated"));
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

  if (loading) return <CMSLoader label="cmsLoadingDistributor" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={Tag}
        title="distributorBanner"
        description="cmsDistributorDescription"
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-violet-500" /> {t("cmsDistributorCardTitle")}
          </CardTitle>
          <CardDescription>
            {t("cmsDistributorCardDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label="cmsBadgeEyebrowLabel">
            <CMSInput
              value={data.distributorCta?.badge}
              onChange={(e) => set("distributorCta.badge", e.target.value)}
              placeholder="cmsBusinessOpportunityPlaceholder"
            />
          </Field>
          <Field label="cmsHeadingTitle">
            <CMSInput
              value={data.distributorCta?.title}
              onChange={(e) => set("distributorCta.title", e.target.value)}
              placeholder="cmsGrowWithUsPlaceholder"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="cmsDescriptionText">
              <CMSTextarea
                rows={2}
                value={data.distributorCta?.description}
                onChange={(e) => set("distributorCta.description", e.target.value)}
              />
            </Field>
          </div>
          <Field label="cmsCtaButtonText">
            <CMSInput
              value={data.distributorCta?.ctaText}
              onChange={(e) => set("distributorCta.ctaText", e.target.value)}
              placeholder="cmsApplyNowPlaceholder"
            />
          </Field>
          <Field label="cmsCtaButtonLink">
            <CMSInput
              value={data.distributorCta?.ctaLink}
              onChange={(e) => set("distributorCta.ctaLink", e.target.value)}
              placeholder="cmsDistributorLinkPlaceholder"
            />
          </Field>
        </CardContent>
      </Card>

      <StickyBar onSave={handleSave} saving={saving} />
    </div>
  );
}
