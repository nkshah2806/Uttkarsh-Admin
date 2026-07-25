import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";

export default function HeroCMS() {
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
      toast.success("✅ Hero Banner updated live!");
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

  if (loading) return <CMSLoader label="Loading Hero Banner content…" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={ImageIcon}
        title="Hero Banner"
        description="The large full-screen banner visitors see first when they land on the website."
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-violet-500" /> Hero Banner Content
          </CardTitle>
          <CardDescription>
            Edit the headlines, description, background image and call-to-action buttons.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label="Badge / Pill Label">
            <CMSInput
              value={data.hero?.badge}
              onChange={(e) => set("hero.badge", e.target.value)}
              placeholder="Local for Vocal · GMP Certified"
            />
          </Field>
          <Field label="Background Image URL">
            <CMSInput
              value={data.hero?.bgImage}
              onChange={(e) => set("hero.bgImage", e.target.value)}
              placeholder="https://..."
            />
          </Field>
          {data.hero?.bgImage && (
            <div className="md:col-span-2 rounded-xl overflow-hidden h-48 border border-border">
              <img src={data.hero.bgImage} alt="Hero Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <Field label="Headline Line 1">
            <CMSInput
              value={data.hero?.titleLine1}
              onChange={(e) => set("hero.titleLine1", e.target.value)}
              placeholder="Ancient wisdom."
            />
          </Field>
          <Field label="Headline Line 2 (Gold / Italic)">
            <CMSInput
              value={data.hero?.titleLine2}
              onChange={(e) => set("hero.titleLine2", e.target.value)}
              placeholder="Everyday wellness."
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Description Paragraph">
              <CMSTextarea
                rows={3}
                value={data.hero?.description}
                onChange={(e) => set("hero.description", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Primary Button Text">
            <CMSInput
              value={data.hero?.primaryCtaText}
              onChange={(e) => set("hero.primaryCtaText", e.target.value)}
              placeholder="Shop the Collection"
            />
          </Field>
          <Field label="Primary Button Link">
            <CMSInput
              value={data.hero?.primaryCtaLink}
              onChange={(e) => set("hero.primaryCtaLink", e.target.value)}
              placeholder="/shop"
            />
          </Field>
          <Field label="Secondary Button Text">
            <CMSInput
              value={data.hero?.secondaryCtaText}
              onChange={(e) => set("hero.secondaryCtaText", e.target.value)}
              placeholder="Our Story"
            />
          </Field>
          <Field label="Secondary Button Link">
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
