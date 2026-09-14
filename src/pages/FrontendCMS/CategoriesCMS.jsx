import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Grid, Plus, Trash2, Edit2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { categoriesService } from "@/services/categoriesService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, CMSLoader } from "./CMSShared";
import { MediaUploader } from "@/components/media-uploader";
import { Config } from "@/lib/Config";
import { useTranslation } from "react-i18next";
import LocalizedText from "@/components/LocalizedText";

export default function CategoriesCMS() {
  const { t } = useTranslation();
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
        toast.success(t("shop.categories.updated"));
      } else {
        const created = await categoriesService.createCategory(categoryForm);
        setCategories((prev) => [...prev, created]);
        toast.success(t("shop.categories.created"));
      }
      setEditingCategory(null);
      setCategoryForm({ name: "", slug: "", image: "", description: "", order: 0 });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || t("shop.categories.saveFailed"));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm(t("shop.categories.deleteConfirm"))) return;
    try {
      await categoriesService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(t("shop.categories.deleted"));
    } catch {
      toast.error(t("shop.categories.deleteFailed"));
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

  if (loading) return <CMSLoader label={t("shop.categories.loading")} />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={Grid}
        title={t("shop.categories.pageTitle")}
        description={t("shop.categories.pageDesc")}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5 text-violet-500" /> {t("shop.categories.cardTitle")}
          </CardTitle>
          <CardDescription>
            {t("shop.categories.cardDesc")}
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
              {editingCategory
                ? t("shop.categories.editCategory", { name: editingCategory.name })
                : t("shop.categories.addCategory")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label={t("shop.categories.catName")}>
                <CMSInput
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setCategoryForm((f) => ({ ...f, name, slug: editingCategory ? f.slug : slug }));
                  }}
                  placeholder={t("shop.categories.catNamePh")}
                />
              </Field>
              <Field label={t("shop.categories.catSlug")}>
                <CMSInput
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="immunity-boosters"
                />
              </Field>
              <Field label={t("shop.categories.displayOrder")}>
                <CMSInput
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, order: Number(e.target.value) }))}
                />
              </Field>
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label={t("shop.categories.catImage")}>
                  <MediaUploader
                    value={categoryForm.image}
                    onUploaded={(ref) => setCategoryForm((f) => ({ ...f, image: ref }))}
                    onClear={() => setCategoryForm((f) => ({ ...f, image: "" }))}
                    folder="categories"
                    accept="image"
                    helpText={t("shop.categories.imageHelp")}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label={t("shop.categories.description")}>
                  <CMSTextarea
                    rows={2}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder={t("shop.categories.descriptionPh")}
                  />
                </Field>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              {editingCategory && (
                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                  {t("shop.categories.cancel")}
                </Button>
              )}
              <Button type="submit" size="sm" className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5">
                <Check className="h-4 w-4" />
                {editingCategory ? t("shop.categories.updateCategory") : t("shop.categories.addCategoryBtn")}
              </Button>
            </div>
          </form>

          {/* Categories Grid List */}
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("shop.categories.empty")}
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
                        <img
                          src={
                            cat.image && cat.image.startsWith("/uploads/")
                              ? `${Config.API_URL}${cat.image.replace(/^\//, "")}`
                              : cat.image
                          }
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base"><LocalizedText value={cat.name} /></h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-mono">
                        {t("shop.categories.orderLabel", { order: cat.order || 0 })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{t("shop.categories.slugLabel", { slug: cat.slug })}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2"><LocalizedText value={cat.description} /></p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    <Button size="xs" variant="outline" onClick={() => startEditCategory(cat)} className="gap-1">
                      <Edit2 className="h-3 w-3" /> {t("shop.categories.edit")}
                    </Button>
                    <Button size="xs" variant="destructive" onClick={() => handleDeleteCategory(cat.id)} className="gap-1">
                      <Trash2 className="h-3 w-3" /> {t("shop.categories.delete")}
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
