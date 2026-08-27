import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactCMS() {
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
      toast.success(t("cmsContactUpdated"));
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

  if (loading) return <CMSLoader label="cmsLoadingContact" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={PhoneCall}
        title="cmsContactTitle"
        description="cmsContactDescription"
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-violet-500" /> {t("cmsContactCardTitle")}
          </CardTitle>
          <CardDescription>
            {t("cmsContactCardDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label="cmsCustomerCarePhone">
            <CMSInput
              value={data.footer?.phone}
              onChange={(e) => set("footer.phone", e.target.value)}
              placeholder=""
            />
          </Field>
          <Field label="cmsSupportEmail">
            <CMSInput
              value={data.footer?.email}
              onChange={(e) => set("footer.email", e.target.value)}
              placeholder=""
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="cmsOfficeAddress">
              <CMSInput
                value={data.footer?.address}
                onChange={(e) => set("footer.address", e.target.value)}
                placeholder=""
              />
            </Field>
          </div>
          <Field label="cmsInstagramUrl">
            <CMSInput
              value={data.footer?.instagramUrl}
              onChange={(e) => set("footer.instagramUrl", e.target.value)}
              placeholder="cmsInstagramPlaceholder"
            />
          </Field>
          <Field label="cmsFacebookUrl">
            <CMSInput
              value={data.footer?.facebookUrl}
              onChange={(e) => set("footer.facebookUrl", e.target.value)}
              placeholder="cmsFacebookPlaceholder"
            />
          </Field>
          <Field label="cmsYoutubeUrl">
            <CMSInput
              value={data.footer?.youtubeUrl}
              onChange={(e) => set("footer.youtubeUrl", e.target.value)}
              placeholder="cmsYoutubePlaceholder"
            />
          </Field>
          <Field label="cmsCopyrightNotice">
            <CMSInput
              value={data.footer?.copyrightText}
              onChange={(e) => set("footer.copyrightText", e.target.value)}
              placeholder="cmsCopyrightPlaceholder"
            />
          </Field>
        </CardContent>
      </Card>

      <StickyBar onSave={handleSave} saving={saving} />
    </div>
  );
}
