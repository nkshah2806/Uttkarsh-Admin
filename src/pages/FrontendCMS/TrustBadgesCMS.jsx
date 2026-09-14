import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";
import LocalizedText from "@/components/LocalizedText";

export default function TrustBadgesCMS() {
  const { t } = useTranslation();
  const [data, setData] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getContent().then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const updateBadge = (idx, field, value) => {
    setData((prev) => {
      const arr = [...(prev.trustBadges || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, trustBadges: arr };
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
        icon={Shield}
        title={t("cms.secTrustBadges")}
        description={t("cms.secTrustBadgesDesc")}
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-violet-500" />{" "}
            <LocalizedText value="Trust Badges Strip" />
          </CardTitle>
          <CardDescription>
            <LocalizedText value="Edit badge text and icon names (use Lucide icon names e.g. ShieldCheck, Leaf, Truck)." />
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(data.trustBadges || []).map((badge, idx) => (
            <div key={badge.id || idx} className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase">
                <LocalizedText value={`Badge #${idx + 1}`} />
              </p>
              <Field label={<LocalizedText value="Badge Text" />}>
                <CMSInput
                  value={badge.text}
                  onChange={(e) => updateBadge(idx, "text", e.target.value)}
                />
              </Field>
              <Field label={<LocalizedText value="Icon Name" />}>
                <CMSInput
                  value={badge.icon}
                  onChange={(e) => updateBadge(idx, "icon", e.target.value)}
                  placeholder="ShieldCheck / Leaf / Truck / HeartHandshake"
                />
              </Field>
            </div>
          ))}
        </CardContent>
      </Card>

      <StickyBar onSave={handleSave} saving={saving} />
    </div>
  );
}
