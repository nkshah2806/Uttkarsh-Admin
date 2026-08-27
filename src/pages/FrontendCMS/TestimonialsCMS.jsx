import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Quote, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getContent, saveContent, resetContentToDefaults, DEFAULT_CONTENT } from "@/services/contentService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, StickyBar, CMSLoader } from "./CMSShared";
import { useLanguage } from "@/context/LanguageContext";

export default function TestimonialsCMS() {
  const { t } = useLanguage();
  const [data, setData] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getContent().then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const updateItem = (idx, field, value) => {
    setData((prev) => {
      const arr = [...(prev.testimonials || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, testimonials: arr };
    });
  };

  const addReview = () => {
    setData((prev) => ({
      ...prev,
      testimonials: [
        ...(prev.testimonials || []),
        { id: Date.now(), name: t("cmsCustomerNameCityDefault"), body: t("cmsGreatProductDefault"), stars: 5 },
      ],
    }));
  };

  const removeReview = (idx) => {
    setData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveContent(data);
      toast.success(t("cmsTestimonialsUpdated"));
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

  if (loading) return <CMSLoader label="cmsLoadingTestimonials" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={Quote}
        title="cmsTestimonialsTitle"
        description="cmsTestimonialsDescription"
        onSave={handleSave}
        onReset={handleReset}
        saving={saving}
      />

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5 text-violet-500" /> {t("cmsTestimonialsCardTitle")}
              </CardTitle>
              <CardDescription>{t("cmsTestimonialsCardDescription")}</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={addReview}>
              <Plus className="h-3.5 w-3.5" /> {t("cmsAddReview")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(data.testimonials || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t("cmsNoTestimonials")}</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {(data.testimonials || []).map((review, idx) => (
                <div key={review.id || idx} className="rounded-2xl border border-border bg-muted/40 p-5 space-y-3 relative">
                  <button
                    onClick={() => removeReview(idx)}
                    className="absolute top-3 right-3 p-1 rounded-full text-destructive hover:bg-destructive/10 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Field label="cmsCustomerNameCity">
                    <CMSInput
                      value={review.name}
                      onChange={(e) => updateItem(idx, "name", e.target.value)}
                    />
                  </Field>
                  <Field label="cmsReviewText">
                    <CMSTextarea
                      rows={3}
                      value={review.body}
                      onChange={(e) => updateItem(idx, "body", e.target.value)}
                    />
                  </Field>
                  <Field label="cmsStarRating">
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={review.stars}
                      onChange={(e) =>
                        updateItem(idx, "stars", Math.min(5, Math.max(1, parseInt(e.target.value) || 5)))
                      }
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                    />
                  </Field>
                  <div className="text-[#C5A059] text-lg">
                    {"★".repeat(review.stars || 5)}{"☆".repeat(5 - (review.stars || 5))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <StickyBar onSave={handleSave} saving={saving} />
    </div>
  );
}
