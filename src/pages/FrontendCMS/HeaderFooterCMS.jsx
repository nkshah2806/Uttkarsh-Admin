import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";

export default function HeaderFooterCMS() {
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
      toast.success("✅ Header & Footer updated live!");
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

  if (loading) return <CMSLoader label="Loading Header & Footer content…" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={Megaphone}
        title="Header & Footer"
        description="Manage the announcement bar shown across all pages, and the footer brand description."
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      {/* Announcement Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-violet-500" /> Header Announcement Bar
          </CardTitle>
          <CardDescription>
            The dark green strip at the very top of every page on the website.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Announcement Text">
              <CMSInput
                value={data.header?.announcement}
                onChange={(e) => set("header.announcement", e.target.value)}
                placeholder="Free Shipping on Orders Over ₹499 · 100% Natural"
              />
            </Field>
          </div>
          <Field label="Search Bar Placeholder">
            <CMSInput
              value={data.header?.searchPlaceholder}
              onChange={(e) => set("header.searchPlaceholder", e.target.value)}
              placeholder="Search herbs, remedies..."
            />
          </Field>
        </CardContent>
      </Card>

      {/* Footer Brand Description */}
      <Card>
        <CardHeader>
          <CardTitle>Footer Brand Description</CardTitle>
          <CardDescription>The description shown in the footer under the company logo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Field label="Brand Description">
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
