import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";
import LocalizedText from "@/components/LocalizedText";
import { useTranslatedText } from "@/hooks/useTranslatedText";

export default function DistributorCMS() {
  const { t } = useTranslation();
  const [data, setData] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const phBadge = useTranslatedText("Business Opportunity");
  const phTitle = useTranslatedText("Grow with us. Become a distributor.");
  const phCtaText = useTranslatedText("Apply now");

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
        icon={Tag}
        title={t("cms.secDistributorBanner")}
        description={t("cms.secDistributorBannerDesc")}
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-violet-500" />{" "}
            <LocalizedText value="Distributor CTA Banner" />
          </CardTitle>
          <CardDescription>
            <LocalizedText value="Edit the banner's eyebrow label, headline, description paragraph, and action button." />
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label={<LocalizedText value="Badge / Eyebrow Label" />}>
            <CMSInput
              value={data.distributorCta?.badge}
              onChange={(e) => set("distributorCta.badge", e.target.value)}
              placeholder={phBadge}
            />
          </Field>
          <Field label={<LocalizedText value="Heading Title" />}>
            <CMSInput
              value={data.distributorCta?.title}
              onChange={(e) => set("distributorCta.title", e.target.value)}
              placeholder={phTitle}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label={<LocalizedText value="Description Text" />}>
              <CMSTextarea
                rows={2}
                value={data.distributorCta?.description}
                onChange={(e) => set("distributorCta.description", e.target.value)}
              />
            </Field>
          </div>
          <Field label={<LocalizedText value="CTA Button Text" />}>
            <CMSInput
              value={data.distributorCta?.ctaText}
              onChange={(e) => set("distributorCta.ctaText", e.target.value)}
              placeholder={phCtaText}
            />
          </Field>
          <Field label={<LocalizedText value="CTA Button Link" />}>
            <CMSInput
              value={data.distributorCta?.ctaLink}
              onChange={(e) => set("distributorCta.ctaLink", e.target.value)}
              placeholder="/distributor"
            />
          </Field>
        </CardContent>
      </Card>

      <StickyBar onSave={handleSave} saving={saving} />
    </div>
  );
}
