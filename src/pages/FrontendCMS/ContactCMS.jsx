import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { PhoneCall } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";

export default function ContactCMS() {
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
      toast.success("✅ Contact & Social info updated live!");
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

  if (loading) return <CMSLoader label="Loading Contact content…" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={PhoneCall}
        title="Contact & Social Links"
        description="Details shown in the website footer and Contact page. Social URLs power the icons in the footer."
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-violet-500" /> Contact Info & Social Links
          </CardTitle>
          <CardDescription>
            Update the phone number, email address, office address and social media profile URLs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field label="Customer Care Phone">
            <CMSInput
              value={data.footer?.phone}
              onChange={(e) => set("footer.phone", e.target.value)}
              placeholder="+91 99999 99999"
            />
          </Field>
          <Field label="Support Email">
            <CMSInput
              value={data.footer?.email}
              onChange={(e) => set("footer.email", e.target.value)}
              placeholder="care@utkarshcorp.com"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Office / HQ Address">
              <CMSInput
                value={data.footer?.address}
                onChange={(e) => set("footer.address", e.target.value)}
                placeholder="Nashik, Maharashtra, India"
              />
            </Field>
          </div>
          <Field label="Instagram URL">
            <CMSInput
              value={data.footer?.instagramUrl}
              onChange={(e) => set("footer.instagramUrl", e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </Field>
          <Field label="Facebook URL">
            <CMSInput
              value={data.footer?.facebookUrl}
              onChange={(e) => set("footer.facebookUrl", e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </Field>
          <Field label="YouTube URL">
            <CMSInput
              value={data.footer?.youtubeUrl}
              onChange={(e) => set("footer.youtubeUrl", e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </Field>
          <Field label="Copyright Notice">
            <CMSInput
              value={data.footer?.copyrightText}
              onChange={(e) => set("footer.copyrightText", e.target.value)}
              placeholder="Utkarsh Corporation. All rights reserved."
            />
          </Field>
        </CardContent>
      </Card>

      <StickyBar onSave={handleSave} saving={saving} />
    </div>
  );
}
