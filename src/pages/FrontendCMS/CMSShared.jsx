import React from "react";
import { Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─────────────────────────────────────────
   Tiny reusable field components
───────────────────────────────────────── */
export function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export function CMSInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
    />
  );
}

export function CMSTextarea({ value, onChange, rows = 3, placeholder }) {
  return (
    <textarea
      rows={rows}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition resize-none"
    />
  );
}

/**
 * Reusable page header for CMS pages with Save & Reset buttons.
 */
export function CMSPageHeader({ icon: Icon, title, description, onSave, onReset, saving }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-6 w-6 text-violet-500 shrink-0" />}
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 shrink-0">
        {onReset && (
          <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset Defaults
          </Button>
        )}
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Save className="h-4 w-4" />
          {saving ? "Publishing…" : "Publish Live"}
        </Button>
      </div>
    </div>
  );
}

/**
 * Sticky save bar pinned to the bottom of the page.
 */
export function StickyBar({ onSave, saving }) {
  return (
    <div className="sticky bottom-4 flex justify-end pt-2">
      <Button
        onClick={onSave}
        disabled={saving}
        className="shadow-lg gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-5 rounded-2xl"
      >
        <Save className="h-5 w-5" />
        {saving ? "Publishing Changes…" : "Publish Live Changes"}
      </Button>
    </div>
  );
}

/**
 * Standard loading screen for all CMS pages.
 */
export function CMSLoader({ label = "Loading content…" }) {
  return (
    <div className="flex h-96 items-center justify-center text-muted-foreground">
      {label}
    </div>
  );
}

/**
 * Hook: load content, provide set/save/reset helpers.
 */
export function useCMSContent(getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT) {
  const [data, setData] = React.useState(DEFAULT_CONTENT);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
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

  const handleSave = async (toast) => {
    setSaving(true);
    try {
      await saveContent(data);
      toast.success("✅ Live site content updated!");
    } catch {
      toast.error("Failed to save content. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (toast) => {
    if (!window.confirm("Reset ALL content to factory defaults? This cannot be undone.")) return;
    const d = await resetContentToDefaults();
    setData(d);
    toast.success("Content reset to defaults.");
  };

  return { data, setData, loading, saving, set, handleSave, handleReset };
}
