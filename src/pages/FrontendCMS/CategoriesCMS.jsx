import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Grid, Plus, Trash2, Edit2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { categoriesService } from "@/services/categoriesService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, CMSLoader } from "./CMSShared";

export default function CategoriesCMS() {
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
        toast.success("Category updated successfully!");
      } else {
        const created = await categoriesService.createCategory(categoryForm);
        setCategories((prev) => [...prev, created]);
        toast.success("Category created successfully!");
      }
      setEditingCategory(null);
      setCategoryForm({ name: "", slug: "", image: "", description: "", order: 0 });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to save category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoriesService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted.");
    } catch {
      toast.error("Failed to delete category.");
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

  if (loading) return <CMSLoader label="Loading categories…" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={Grid}
        title="Shop Categories"
        description="Manage Ayurveda categories shown on the Home Bento grid and Shop page sidebar filter."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5 text-violet-500" /> Dynamic Shop Categories
          </CardTitle>
          <CardDescription>
            Add, edit or remove categories. Changes are saved immediately to the database.
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
              {editingCategory ? `Edit Category: ${editingCategory.name}` : "Add New Category"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Category Name">
                <CMSInput
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                    setCategoryForm((f) => ({ ...f, name, slug: editingCategory ? f.slug : slug }));
                  }}
                  placeholder="e.g. Immunity Boosters"
                />
              </Field>
              <Field label="Category Slug">
                <CMSInput
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="immunity-boosters"
                />
              </Field>
              <Field label="Display Order">
                <CMSInput
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, order: Number(e.target.value) }))}
                />
              </Field>
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="Image URL">
                  <CMSInput
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm((f) => ({ ...f, image: e.target.value }))}
                    placeholder="https://..."
                  />
                </Field>
              </div>
              {categoryForm.image && (
                <div className="sm:col-span-2 lg:col-span-3 rounded-xl overflow-hidden h-40 border border-border">
                  <img src={categoryForm.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="Description">
                  <CMSTextarea
                    rows={2}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of products in this category..."
                  />
                </Field>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              {editingCategory && (
                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
              <Button type="submit" size="sm" className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5">
                <Check className="h-4 w-4" />
                {editingCategory ? "Update Category" : "Add Category"}
              </Button>
            </div>
          </form>

          {/* Categories Grid List */}
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No categories yet. Add your first category above.
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
                        Order: {cat.order || 0}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">slug: {cat.slug}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    <Button size="xs" variant="outline" onClick={() => startEditCategory(cat)} className="gap-1">
                      <Edit2 className="h-3 w-3" /> Edit
                    </Button>
                    <Button size="xs" variant="destructive" onClick={() => handleDeleteCategory(cat.id)} className="gap-1">
                      <Trash2 className="h-3 w-3" /> Delete
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
