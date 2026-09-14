import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";
import { MediaUploader } from "@/components/media-uploader";
import LocalizedText from "@/components/LocalizedText";
import { useTranslatedText } from "@/hooks/useTranslatedText";

export default function HeroCMS() {
  const { t } = useTranslation();
  const [data, setData] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const phBadge = useTranslatedText("Local for Vocal · GMP Certified");
  const phTitle1 = useTranslatedText("Ancient wisdom.");
  const phTitle2 = useTranslatedText("Everyday wellness.");
  const phPrimaryText = useTranslatedText("Shop the Collection");
  const phSecondaryText = useTranslatedText("Our Story");
  const phBgLabel = useTranslatedText("Background Image");
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
        icon={ImageIcon}
        title={t("cms.secHeroBanner")}
        description={t("cms.secHeroBannerDesc")}
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-violet-500" />{" "}
            <LocalizedText value="Hero Banner Content" />
          </CardTitle>
          <CardDescription>
            <LocalizedText value="Edit the headlines, description, background image and call-to-action buttons." />
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label={<LocalizedText value="Badge / Pill Label" />}>
            <CMSInput
              value={data.hero?.badge}
              onChange={(e) => set("hero.badge", e.target.value)}
              placeholder={phBadge}
            />
          </Field>
          <div className="md:col-span-2">
            <MediaUploader
              label={phBgLabel}
              value={data.hero?.bgImage || ""}
              onUploaded={(ref) => set("hero.bgImage", ref)}
              onClear={() => set("hero.bgImage", "")}
              folder="hero"
              accept="image"
              required
              helpText={phUploadHelp}
            />
          </div>
          <Field label={<LocalizedText value="Headline Line 1" />}>
            <CMSInput
              value={data.hero?.titleLine1}
              onChange={(e) => set("hero.titleLine1", e.target.value)}
              placeholder={phTitle1}
            />
          </Field>
          <Field label={<LocalizedText value="Headline Line 2 (Gold / Italic)" />}>
            <CMSInput
              value={data.hero?.titleLine2}
              onChange={(e) => set("hero.titleLine2", e.target.value)}
              placeholder={phTitle2}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label={<LocalizedText value="Description Paragraph" />}>
              <CMSTextarea
                rows={3}
                value={data.hero?.description}
                onChange={(e) => set("hero.description", e.target.value)}
              />
            </Field>
          </div>
          <Field label={<LocalizedText value="Primary Button Text" />}>
            <CMSInput
              value={data.hero?.primaryCtaText}
              onChange={(e) => set("hero.primaryCtaText", e.target.value)}
              placeholder={phPrimaryText}
            />
          </Field>
          <Field label={<LocalizedText value="Primary Button Link" />}>
            <CMSInput
              value={data.hero?.primaryCtaLink}
              onChange={(e) => set("hero.primaryCtaLink", e.target.value)}
              placeholder="/shop"
            />
          </Field>
          <Field label={<LocalizedText value="Secondary Button Text" />}>
            <CMSInput
              value={data.hero?.secondaryCtaText}
              onChange={(e) => set("hero.secondaryCtaText", e.target.value)}
              placeholder={phSecondaryText}
            />
          </Field>
          <Field label={<LocalizedText value="Secondary Button Link" />}>
            <CMSInput
              value={data.hero?.secondaryCtaLink}
              onChange={(e) => set("hero.secondaryCtaLink", e.target.value)}
              placeholder="/about"
            />
          </Field>
        </CardContent>
      </Card>

      <StickyBar onSave={handleSave} saving={saving} />
    </div>
  );
}
