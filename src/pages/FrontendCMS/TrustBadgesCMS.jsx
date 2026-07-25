import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";

export default function TrustBadgesCMS() {
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
      toast.success("✅ Trust Badges updated live!");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset ALL content to factory defaults? This cannot be undone.")) return;
    const d = await resetContentToDefaults();
    setData(d);
    toast.success("Content reset to defaults.");
  };

  if (loading) return <CMSLoader label="Loading Trust Badges content…" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={Shield}
        title="Trust Badges"
        description="The 4 trust badges shown in the strip at the bottom of the hero banner."
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-violet-500" /> Trust Badges Strip
          </CardTitle>
          <CardDescription>
            Edit badge text and icon names (use Lucide icon names e.g. ShieldCheck, Leaf, Truck).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(data.trustBadges || []).map((badge, idx) => (
            <div key={badge.id || idx} className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase">Badge #{idx + 1}</p>
              <Field label="Badge Text">
                <CMSInput
                  value={badge.text}
                  onChange={(e) => updateBadge(idx, "text", e.target.value)}
                />
              </Field>
              <Field label="Icon Name">
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
