import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";
import LocalizedText from "@/components/LocalizedText";
import { useTranslatedText } from "@/hooks/useTranslatedText";

export default function ContactCMS() {
  const { t } = useTranslation();
  const [data, setData] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const phInstagram = useTranslatedText("https://instagram.com/...");
  const phFacebook = useTranslatedText("https://facebook.com/...");
  const phYoutube = useTranslatedText("https://youtube.com/...");
  const phCopyright = useTranslatedText("Utkarsh Corporation. All rights reserved.");

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
        icon={PhoneCall}
        title={t("cms.secContactSocial")}
        description={t("cms.secContactSocialDesc")}
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-violet-500" />{" "}
            <LocalizedText value="Contact Info & Social Links" />
          </CardTitle>
          <CardDescription>
            <LocalizedText value="Update the phone number, email address, office address and social media profile URLs." />
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label={<LocalizedText value="Customer Care Phone" />}>
            <CMSInput
              value={data.footer?.phone}
              onChange={(e) => set("footer.phone", e.target.value)}
              placeholder=""
            />
          </Field>
          <Field label={<LocalizedText value="Support Email" />}>
            <CMSInput
              value={data.footer?.email}
              onChange={(e) => set("footer.email", e.target.value)}
              placeholder=""
            />
          </Field>
          <div className="md:col-span-2">
            <Field label={<LocalizedText value="Office / HQ Address" />}>
              <CMSInput
                value={data.footer?.address}
                onChange={(e) => set("footer.address", e.target.value)}
                placeholder=""
              />
            </Field>
          </div>
          <Field label={<LocalizedText value="Instagram URL" />}>
            <CMSInput
              value={data.footer?.instagramUrl}
              onChange={(e) => set("footer.instagramUrl", e.target.value)}
              placeholder={phInstagram}
            />
          </Field>
          <Field label={<LocalizedText value="Facebook URL" />}>
            <CMSInput
              value={data.footer?.facebookUrl}
              onChange={(e) => set("footer.facebookUrl", e.target.value)}
              placeholder={phFacebook}
            />
          </Field>
          <Field label={<LocalizedText value="YouTube URL" />}>
            <CMSInput
              value={data.footer?.youtubeUrl}
              onChange={(e) => set("footer.youtubeUrl", e.target.value)}
              placeholder={phYoutube}
            />
          </Field>
          <Field label={<LocalizedText value="Copyright Notice" />}>
            <CMSInput
              value={data.footer?.copyrightText}
              onChange={(e) => set("footer.copyrightText", e.target.value)}
              placeholder={phCopyright}
            />
          </Field>
        </CardContent>
      </Card>

      <StickyBar onSave={handleSave} saving={saving} />
    </div>
  );
}
