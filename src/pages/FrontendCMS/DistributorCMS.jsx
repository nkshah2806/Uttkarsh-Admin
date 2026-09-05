import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";

export default function DistributorCMS() {
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
      toast.success("✅ Distributor Banner updated live!");
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

  if (loading) return <CMSLoader label="Loading Distributor content…" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={Tag}
        title="Distributor Banner"
        description="The brown call-to-action banner at the bottom of the Home page and Distributor page."
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-violet-500" /> Distributor CTA Banner
          </CardTitle>
          <CardDescription>
            Edit the banner's eyebrow label, headline, description paragraph, and action button.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label="Badge / Eyebrow Label">
            <CMSInput
              value={data.distributorCta?.badge}
              onChange={(e) => set("distributorCta.badge", e.target.value)}
              placeholder="Business Opportunity"
            />
          </Field>
          <Field label="Heading Title">
            <CMSInput
              value={data.distributorCta?.title}
              onChange={(e) => set("distributorCta.title", e.target.value)}
              placeholder="Grow with us. Become a distributor."
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description Text">
              <CMSTextarea
                rows={2}
                value={data.distributorCta?.description}
                onChange={(e) => set("distributorCta.description", e.target.value)}
              />
            </Field>
          </div>
          <Field label="CTA Button Text">
            <CMSInput
              value={data.distributorCta?.ctaText}
              onChange={(e) => set("distributorCta.ctaText", e.target.value)}
              placeholder="Apply now"
            />
          </Field>
          <Field label="CTA Button Link">
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
