import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";
import { useLanguage } from "@/context/LanguageContext";

export default function HeaderFooterCMS() {
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
      toast.success(t("cmsHeaderFooterUpdated"));
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

  if (loading) return <CMSLoader label="cmsLoadingHeaderFooter" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={Megaphone}
        title="headerFooter"
        description="cmsHeaderFooterDescription"
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      {/* Announcement Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-violet-500" /> {t("cmsAnnouncementCardTitle")}
          </CardTitle>
          <CardDescription>
            {t("cmsAnnouncementCardDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="cmsAnnouncementText">
              <CMSInput
                value={data.header?.announcement}
                onChange={(e) => set("header.announcement", e.target.value)}
                placeholder="cmsAnnouncementTextPlaceholder"
              />
            </Field>
          </div>
          <Field label="cmsSearchBarPlaceholder">
            <CMSInput
              value={data.header?.searchPlaceholder}
              onChange={(e) => set("header.searchPlaceholder", e.target.value)}
              placeholder="cmsSearchPlaceholderText"
            />
          </Field>
        </CardContent>
      </Card>

      {/* Footer Brand Description */}
      <Card>
        <CardHeader>
          <CardTitle>{t("cmsFooterCardTitle")}</CardTitle>
          <CardDescription>{t("cmsFooterCardDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Field label="cmsBrandDescription">
            <CMSTextarea
              rows={3}
              value={data.footer?.brandDescription}
              onChange={(e) => set("footer.brandDescription", e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <StickyBar onSave={handleSave} saving={saving} />
    </div>
  );
}
