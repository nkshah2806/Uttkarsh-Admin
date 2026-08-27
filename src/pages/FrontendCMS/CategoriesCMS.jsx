import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Grid, Plus, Trash2, Edit2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { categoriesService } from "@/services/categoriesService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, CMSLoader } from "./CMSShared";
import { useLanguage } from "@/context/LanguageContext";

export default function CategoriesCMS() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    image: "",
    description: "",
    order: 0,
  });

  useEffect(() => {
    categoriesService.getCategories()
      .then((data) => { setCategories(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const updated = await categoriesService.updateCategory(editingCategory.id, categoryForm);
        setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? updated : c)));
        toast.success(t("cmsCategoryUpdated"));
      } else {
        const created = await categoriesService.createCategory(categoryForm);
        setCategories((prev) => [...prev, created]);
        toast.success(t("cmsCategoryCreated"));
      }
      setEditingCategory(null);
      setCategoryForm({ name: "", slug: "", image: "", description: "", order: 0 });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || t("cmsCategorySaveFailed"));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm(t("cmsDeleteCategoryConfirm"))) return;
    try {
      await categoriesService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(t("cmsCategoryDeleted"));
    } catch {
      toast.error(t("cmsCategoryDeleteFailed"));
    }
  };

  const startEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      image: cat.image || "",
      description: cat.description || "",
      order: cat.order || 0,
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", slug: "", image: "", description: "", order: 0 });
  };

  if (loading) return <CMSLoader label="cmsLoadingCategories" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={Grid}
        title="shopCategories"
        description="cmsCategoriesDescription"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5 text-violet-500" /> {t("cmsCategoriesCardTitle")}
          </CardTitle>
          <CardDescription>
            {t("cmsCategoriesCardDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Add/Edit Form */}
          <form
            onSubmit={handleSaveCategory}
            className="rounded-2xl border border-violet-500/30 bg-violet-50/50 dark:bg-violet-950/10 p-5 space-y-4"
          >
            <h3 className="font-semibold text-sm flex items-center gap-2 text-violet-900 dark:text-violet-300">
              {editingCategory ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingCategory ? t("cmsEditCategory").replace("{name}", editingCategory.name) : t("cmsAddNewCategory")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="cmsCategoryName">
                <CMSInput
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setCategoryForm((f) => ({ ...f, name, slug: editingCategory ? f.slug : slug }));
                  }}
                  placeholder="cmsCategoryNamePlaceholder"
                />
              </Field>
              <Field label="cmsCategorySlug">
                <CMSInput
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="cmsCategorySlugPlaceholder"
                />
              </Field>
              <Field label="cmsDisplayOrder">
                <CMSInput
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, order: Number(e.target.value) }))}
                />
              </Field>
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="cmsImageUrl">
                  <CMSInput
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm((f) => ({ ...f, image: e.target.value }))}
                    placeholder="cmsImageUrlPlaceholder"
                  />
                </Field>
              </div>
              {categoryForm.image && (
                <div className="sm:col-span-2 lg:col-span-3 rounded-xl overflow-hidden h-40 border border-border">
                  <img src={categoryForm.image} alt={t("cmsPreviewAlt")} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="cmsCategoryDescription">
                  <CMSTextarea
                    rows={2}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="cmsCategoryDescriptionPlaceholder"
                  />
                </Field>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              {editingCategory && (
                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                  {t("cancel")}
                </Button>
              )}
              <Button type="submit" size="sm" className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5">
                <Check className="h-4 w-4" />
                {editingCategory ? t("cmsUpdateCategory") : t("cmsAddCategory")}
              </Button>
            </div>
          </form>

          {/* Categories Grid List */}
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("cmsNoCategories")}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-border bg-background p-4 flex flex-col justify-between space-y-3 relative group"
                >
                  <div className="space-y-2">
                    {cat.image && (
                      <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base">{cat.name}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-mono">
                        {t("cmsOrder").replace("{order}", cat.order || 0)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{t("cmsSlugLabel").replace("{slug}", cat.slug)}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    <Button size="xs" variant="outline" onClick={() => startEditCategory(cat)} className="gap-1">
                      <Edit2 className="h-3 w-3" /> {t("edit")}
                    </Button>
                    <Button size="xs" variant="destructive" onClick={() => handleDeleteCategory(cat.id)} className="gap-1">
                      <Trash2 className="h-3 w-3" /> {t("delete")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
