import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  ImageIcon,
  Megaphone,
  Quote,
  BarChart3,
  Shield,
  PhoneCall,
  Tag,
} from "lucide-react";
import {
  getContent,
  saveContent,
  resetContentToDefaults,
  DEFAULT_CONTENT,
} from "@/services/contentService";

/* ─────────────────────────────────────────
   Tiny reusable field components
───────────────────────────────────────── */
function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }) {
  return (
    <input
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
    />
  );
}

function Textarea({ value, onChange, rows = 3, placeholder }) {
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

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export default function FrontendCMS() {
  const [data, setData] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* Load on mount */
  useEffect(() => {
    getContent()
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  /* Helpers */
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
      toast.success("✅ Live content updated on the website!");
    } catch {
      toast.error("Failed to save content. Please try again.");
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

  /* Array helpers */
  const addItem = (key, template) =>
    setData((prev) => ({ ...prev, [key]: [...(prev[key] || []), { ...template, id: Date.now() }] }));

  const removeItem = (key, idx) =>
    setData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));

  const updateItem = (key, idx, field, value) =>
    setData((prev) => {
      const arr = [...(prev[key] || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [key]: arr };
    });

  const updateStat = (idx, field, value) => {
    const stats = [...(data.mission?.stats || [])];
    stats[idx] = { ...stats[idx], [field]: value };
    set("mission.stats", stats);
  };

  const addStat = () => {
    const stats = [...(data.mission?.stats || []), { id: Date.now(), number: "0+", label: "New Metric" }];
    set("mission.stats", stats);
  };

  const removeStat = (idx) => {
    const stats = (data.mission?.stats || []).filter((_, i) => i !== idx);
    set("mission.stats", stats);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Loading current frontend content…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Frontend CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit and publish content that appears live on the Utkarsh Corporation website.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset Defaults
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
            <Save className="h-4 w-4" />
            {saving ? "Publishing…" : "Publish Live"}
          </Button>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="hero" className="gap-1.5 text-xs"><ImageIcon className="h-3.5 w-3.5" />Hero Banner</TabsTrigger>
          <TabsTrigger value="badges" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Trust Badges</TabsTrigger>
          <TabsTrigger value="mission" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Mission & Stats</TabsTrigger>
          <TabsTrigger value="testimonials" className="gap-1.5 text-xs"><Quote className="h-3.5 w-3.5" />Testimonials</TabsTrigger>
          <TabsTrigger value="distributor" className="gap-1.5 text-xs"><Tag className="h-3.5 w-3.5" />Distributor Banner</TabsTrigger>
          <TabsTrigger value="header" className="gap-1.5 text-xs"><Megaphone className="h-3.5 w-3.5" />Header & Footer</TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5 text-xs"><PhoneCall className="h-3.5 w-3.5" />Contact & Social</TabsTrigger>
        </TabsList>

        {/* ─── HERO ─── */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-violet-500" /> Hero Banner</CardTitle>
              <CardDescription>This section is the large banner users see first when visiting the website.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <Field label="Badge / Pill Label">
                <Input value={data.hero?.badge} onChange={(e) => set("hero.badge", e.target.value)} placeholder="Local for Vocal · GMP Certified" />
              </Field>
              <Field label="Background Image URL">
                <Input value={data.hero?.bgImage} onChange={(e) => set("hero.bgImage", e.target.value)} placeholder="https://..." />
              </Field>
              {data.hero?.bgImage && (
                <div className="md:col-span-2 rounded-xl overflow-hidden h-48 border border-border">
                  <img src={data.hero.bgImage} alt="Hero Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <Field label="Headline Line 1">
                <Input value={data.hero?.titleLine1} onChange={(e) => set("hero.titleLine1", e.target.value)} placeholder="Ancient wisdom." />
              </Field>
              <Field label="Headline Line 2 (Gold/Italic)">
                <Input value={data.hero?.titleLine2} onChange={(e) => set("hero.titleLine2", e.target.value)} placeholder="Everyday wellness." />
              </Field>
              <div className="md:col-span-2">
                <Field label="Description Paragraph">
                  <Textarea rows={3} value={data.hero?.description} onChange={(e) => set("hero.description", e.target.value)} />
                </Field>
              </div>
              <Field label="Primary Button Text">
                <Input value={data.hero?.primaryCtaText} onChange={(e) => set("hero.primaryCtaText", e.target.value)} placeholder="Shop the Collection" />
              </Field>
              <Field label="Primary Button Link">
                <Input value={data.hero?.primaryCtaLink} onChange={(e) => set("hero.primaryCtaLink", e.target.value)} placeholder="/shop" />
              </Field>
              <Field label="Secondary Button Text">
                <Input value={data.hero?.secondaryCtaText} onChange={(e) => set("hero.secondaryCtaText", e.target.value)} placeholder="Our Story" />
              </Field>
              <Field label="Secondary Button Link">
                <Input value={data.hero?.secondaryCtaLink} onChange={(e) => set("hero.secondaryCtaLink", e.target.value)} placeholder="/about" />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TRUST BADGES ─── */}
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-violet-500" /> Trust Badges Strip</CardTitle>
              <CardDescription>The 4 trust badges shown at the bottom of the hero banner.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(data.trustBadges || []).map((badge, idx) => (
                <div key={badge.id || idx} className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Badge #{idx + 1}</p>
                  <Field label="Badge Text">
                    <Input value={badge.text} onChange={(e) => updateItem("trustBadges", idx, "text", e.target.value)} />
                  </Field>
                  <Field label="Icon Name">
                    <Input value={badge.icon} onChange={(e) => updateItem("trustBadges", idx, "icon", e.target.value)} placeholder="ShieldCheck / Leaf / Truck / HeartHandshake" />
                  </Field>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── MISSION & STATS ─── */}
        <TabsContent value="mission">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-violet-500" /> Mission Story & Impact Stats</CardTitle>
              <CardDescription>The "Our Mission" two-column section with description and impact counters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Section Badge">
                  <Input value={data.mission?.badge} onChange={(e) => set("mission.badge", e.target.value)} placeholder="Our Mission" />
                </Field>
                <Field label="Section Image URL">
                  <Input value={data.mission?.image} onChange={(e) => set("mission.image", e.target.value)} placeholder="https://..." />
                </Field>
                {data.mission?.image && (
                  <div className="md:col-span-2 rounded-xl overflow-hidden h-48 border border-border">
                    <img src={data.mission.image} alt="Mission Preview" className="w-full h-full object-cover object-center" />
                  </div>
                )}
                <div className="md:col-span-2">
                  <Field label="Section Title">
                    <Input value={data.mission?.title} onChange={(e) => set("mission.title", e.target.value)} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Paragraph 1">
                    <Textarea rows={3} value={data.mission?.paragraph1} onChange={(e) => set("mission.paragraph1", e.target.value)} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Paragraph 2">
                    <Textarea rows={3} value={data.mission?.paragraph2} onChange={(e) => set("mission.paragraph2", e.target.value)} />
                  </Field>
                </div>
              </div>

              {/* Stats */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Impact Counter Stats</h3>
                  <Button size="sm" variant="outline" onClick={addStat} className="gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Add Counter
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {(data.mission?.stats || []).map((stat, idx) => (
                    <div key={stat.id || idx} className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3 relative">
                      <button
                        onClick={() => removeStat(idx)}
                        className="absolute top-3 right-3 p-1 rounded-full text-destructive hover:bg-destructive/10 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <Field label="Number / Value">
                        <Input value={stat.number} onChange={(e) => updateStat(idx, "number", e.target.value)} placeholder="50+" />
                      </Field>
                      <Field label="Label">
                        <Input value={stat.label} onChange={(e) => updateStat(idx, "label", e.target.value)} placeholder="Health Camps" />
                      </Field>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TESTIMONIALS ─── */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Quote className="h-5 w-5 text-violet-500" /> Customer Testimonials</CardTitle>
                  <CardDescription>Reviews displayed on the Home page. Add, edit or remove testimonials.</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs shrink-0"
                  onClick={() => addItem("testimonials", { name: "Customer Name, City", body: "Great product!", stars: 5 })}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Review
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 md:grid-cols-3">
                {(data.testimonials || []).map((t, idx) => (
                  <div key={t.id || idx} className="rounded-2xl border border-border bg-muted/40 p-5 space-y-3 relative">
                    <button
                      onClick={() => removeItem("testimonials", idx)}
                      className="absolute top-3 right-3 p-1 rounded-full text-destructive hover:bg-destructive/10 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Field label="Customer Name & City">
                      <Input value={t.name} onChange={(e) => updateItem("testimonials", idx, "name", e.target.value)} />
                    </Field>
                    <Field label="Review Text">
                      <Textarea rows={3} value={t.body} onChange={(e) => updateItem("testimonials", idx, "body", e.target.value)} />
                    </Field>
                    <Field label="Star Rating (1-5)">
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={t.stars}
                        onChange={(e) => updateItem("testimonials", idx, "stars", Math.min(5, Math.max(1, parseInt(e.target.value) || 5)))}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                      />
                    </Field>
                    <div className="text-[#C5A059] text-lg">
                      {"★".repeat(t.stars || 5)}{"☆".repeat(5 - (t.stars || 5))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── DISTRIBUTOR BANNER ─── */}
        <TabsContent value="distributor">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5 text-violet-500" /> Distributor CTA Banner</CardTitle>
              <CardDescription>The brown call-to-action banner at the bottom of the Home page and Distributor page.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <Field label="Badge / Eyebrow Label">
                <Input value={data.distributorCta?.badge} onChange={(e) => set("distributorCta.badge", e.target.value)} placeholder="Business Opportunity" />
              </Field>
              <Field label="Heading Title">
                <Input value={data.distributorCta?.title} onChange={(e) => set("distributorCta.title", e.target.value)} placeholder="Grow with us. Become a distributor." />
              </Field>
              <div className="md:col-span-2">
                <Field label="Description Text">
                  <Textarea rows={2} value={data.distributorCta?.description} onChange={(e) => set("distributorCta.description", e.target.value)} />
                </Field>
              </div>
              <Field label="CTA Button Text">
                <Input value={data.distributorCta?.ctaText} onChange={(e) => set("distributorCta.ctaText", e.target.value)} placeholder="Apply now" />
              </Field>
              <Field label="CTA Button Link">
                <Input value={data.distributorCta?.ctaLink} onChange={(e) => set("distributorCta.ctaLink", e.target.value)} placeholder="/distributor" />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── HEADER & FOOTER ─── */}
        <TabsContent value="header">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-violet-500" /> Header Announcement Bar</CardTitle>
                <CardDescription>The dark green strip at the very top of every page on the website.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Announcement Text">
                    <Input value={data.header?.announcement} onChange={(e) => set("header.announcement", e.target.value)} placeholder="Free Shipping on Orders Over ₹499 · 100% Natural" />
                  </Field>
                </div>
                <Field label="Search Bar Placeholder">
                  <Input value={data.header?.searchPlaceholder} onChange={(e) => set("header.searchPlaceholder", e.target.value)} placeholder="Search herbs, remedies..." />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Footer Brand Description</CardTitle>
                <CardDescription>The description shown in the footer under the logo.</CardDescription>
              </CardHeader>
              <CardContent>
                <Field label="Brand Description">
                  <Textarea rows={3} value={data.footer?.brandDescription} onChange={(e) => set("footer.brandDescription", e.target.value)} />
                </Field>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── CONTACT & SOCIAL ─── */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PhoneCall className="h-5 w-5 text-violet-500" /> Contact Info & Social Links</CardTitle>
              <CardDescription>Details shown in the website footer and Contact page.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <Field label="Customer Care Phone">
                <Input value={data.footer?.phone} onChange={(e) => set("footer.phone", e.target.value)} placeholder="+91 99999 99999" />
              </Field>
              <Field label="Support Email">
                <Input value={data.footer?.email} onChange={(e) => set("footer.email", e.target.value)} placeholder="care@utkarshcorp.com" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Office / HQ Address">
                  <Input value={data.footer?.address} onChange={(e) => set("footer.address", e.target.value)} placeholder="Nashik, Maharashtra, India" />
                </Field>
              </div>
              <Field label="Instagram URL">
                <Input value={data.footer?.instagramUrl} onChange={(e) => set("footer.instagramUrl", e.target.value)} placeholder="https://instagram.com/..." />
              </Field>
              <Field label="Facebook URL">
                <Input value={data.footer?.facebookUrl} onChange={(e) => set("footer.facebookUrl", e.target.value)} placeholder="https://facebook.com/..." />
              </Field>
              <Field label="YouTube URL">
                <Input value={data.footer?.youtubeUrl} onChange={(e) => set("footer.youtubeUrl", e.target.value)} placeholder="https://youtube.com/..." />
              </Field>
              <Field label="Copyright Notice">
                <Input value={data.footer?.copyrightText} onChange={(e) => set("footer.copyrightText", e.target.value)} placeholder="Utkarsh Corporation. All rights reserved." />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sticky save bar at bottom */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="shadow-lg gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-5 rounded-2xl">
          <Save className="h-5 w-5" />
          {saving ? "Publishing Changes…" : "Publish Live Changes"}
        </Button>
      </div>
    </div>
  );
}
