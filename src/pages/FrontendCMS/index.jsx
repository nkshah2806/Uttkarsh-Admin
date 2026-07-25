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
  Grid,
  ShoppingBag,
  Edit2,
  Check,
  X,
} from "lucide-react";
import {
  getContent,
  saveContent,
  resetContentToDefaults,
  DEFAULT_CONTENT,
} from "@/services/contentService";
import { categoriesService } from "@/services/categoriesService";
import { productsService } from "@/services/productsService";

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

function Input({ value, onChange, placeholder, type = "text" }) {
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

  // Dynamic Categories and Products States
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", image: "", description: "", order: 0 });

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    category_slug: "",
    price: 0,
    mrp: 0,
    short_description: "",
    description: "",
    images: [""],
    is_bestseller: false,
    is_featured: false,
    stock: 100,
    ailment: "",
  });

  /* Load on mount */
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [contentData, catsData, prodsData] = await Promise.all([
          getContent(),
          categoriesService.getCategories(),
          productsService.getProducts(),
        ]);
        setData(contentData);
        setCategories(catsData || []);
        setProducts(prodsData || []);
      } catch (err) {
        console.error("Error loading CMS data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
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
      toast.success("✅ Live site content updated!");
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

  // Category Actions
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
    } catch (err) {
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

  // Product Actions
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        mrp: Number(productForm.mrp),
        stock: Number(productForm.stock),
        images: Array.isArray(productForm.images) ? productForm.images : [productForm.images],
      };
      if (editingProduct) {
        const updated = await productsService.updateProduct(editingProduct.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
        toast.success("Product updated successfully!");
      } else {
        const created = await productsService.createProduct(payload);
        setProducts((prev) => [...prev, created]);
        toast.success("Product created successfully!");
      }
      setEditingProduct(null);
      setProductForm({
        name: "",
        slug: "",
        category_slug: "",
        price: 0,
        mrp: 0,
        short_description: "",
        description: "",
        images: [""],
        is_bestseller: false,
        is_featured: false,
        stock: 100,
        ailment: "",
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to save product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await productsService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted.");
    } catch (err) {
      toast.error("Failed to delete product.");
    }
  };

  const startEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      slug: prod.slug,
      category_slug: prod.category_slug || "",
      price: prod.price || 0,
      mrp: prod.mrp || 0,
      short_description: prod.short_description || "",
      description: prod.description || "",
      images: prod.images || [""],
      is_bestseller: prod.is_bestseller || false,
      is_featured: prod.is_featured || false,
      stock: prod.stock || 100,
      ailment: prod.ailment || "",
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Loading current frontend CMS & dynamic store content…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Frontend CMS & Shop Manager</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage live website banners, categories, products, and dynamic shop collection.
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
          <TabsTrigger value="categories" className="gap-1.5 text-xs"><Grid className="h-3.5 w-3.5" />Categories</TabsTrigger>
          <TabsTrigger value="products" className="gap-1.5 text-xs"><ShoppingBag className="h-3.5 w-3.5" />Shop Products</TabsTrigger>
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

        {/* ─── DYNAMIC CATEGORIES ─── */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Grid className="h-5 w-5 text-violet-500" /> Dynamic Shop Categories</CardTitle>
                  <CardDescription>Manage Ayurveda categories displayed on the Home Bento grid and Shop page sidebar filter.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Add/Edit Form */}
              <form onSubmit={handleSaveCategory} className="rounded-2xl border border-violet-500/30 bg-violet-50/50 p-5 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-violet-900">
                  {editingCategory ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : "Add New Category"}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Category Name">
                    <Input
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
                    <Input
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm((f) => ({ ...f, slug: e.target.value }))}
                      placeholder="immunity-boosters"
                    />
                  </Field>
                  <Field label="Display Order">
                    <Input
                      type="number"
                      value={categoryForm.order}
                      onChange={(e) => setCategoryForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    />
                  </Field>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Field label="Image URL">
                      <Input
                        value={categoryForm.image}
                        onChange={(e) => setCategoryForm((f) => ({ ...f, image: e.target.value }))}
                        placeholder="https://..."
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Field label="Description">
                      <Textarea
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({ name: "", slug: "", image: "", description: "", order: 0 });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" size="sm" className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5">
                    <Check className="h-4 w-4" /> {editingCategory ? "Update Category" : "Add Category"}
                  </Button>
                </div>
              </form>

              {/* Categories Grid List */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="rounded-2xl border border-border bg-background p-4 flex flex-col justify-between space-y-3 relative group">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── DYNAMIC SHOP PRODUCTS ─── */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-violet-500" /> Dynamic Shop Products</CardTitle>
                  <CardDescription>Add, edit or delete Ayurvedic products shown on the Shop and Home pages.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Add/Edit Form */}
              <form onSubmit={handleSaveProduct} className="rounded-2xl border border-violet-500/30 bg-violet-50/50 p-5 space-y-4">
                <h3 className="font-semibold text-sm flex items-center gap-2 text-violet-900">
                  {editingProduct ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Product Name">
                    <Input
                      value={productForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                        setProductForm((f) => ({ ...f, name, slug: editingProduct ? f.slug : slug }));
                      }}
                      placeholder="e.g. Special Chyawanprash"
                    />
                  </Field>
                  <Field label="Product Slug">
                    <Input
                      value={productForm.slug}
                      onChange={(e) => setProductForm((f) => ({ ...f, slug: e.target.value }))}
                      placeholder="special-chyawanprash"
                    />
                  </Field>
                  <Field label="Category Slug">
                    <select
                      value={productForm.category_slug}
                      onChange={(e) => setProductForm((f) => ({ ...f, category_slug: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id || c.slug} value={c.slug}>
                          {c.name} ({c.slug})
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Selling Price (₹)">
                    <Input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </Field>
                  <Field label="MRP (₹)">
                    <Input
                      type="number"
                      value={productForm.mrp}
                      onChange={(e) => setProductForm((f) => ({ ...f, mrp: e.target.value }))}
                    />
                  </Field>
                  <Field label="Stock Quantity">
                    <Input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm((f) => ({ ...f, stock: e.target.value }))}
                    />
                  </Field>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <Field label="Image URL">
                      <Input
                        value={Array.isArray(productForm.images) ? productForm.images[0] : productForm.images}
                        onChange={(e) => setProductForm((f) => ({ ...f, images: [e.target.value] }))}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </Field>
                  </div>

                  <Field label="Ailment / Concern Tag">
                    <Input
                      value={productForm.ailment}
                      onChange={(e) => setProductForm((f) => ({ ...f, ailment: e.target.value }))}
                      placeholder="e.g. Immunity & Cold Protection"
                    />
                  </Field>

                  <div className="flex items-center gap-6 pt-6">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.is_bestseller}
                        onChange={(e) => setProductForm((f) => ({ ...f, is_bestseller: e.target.checked }))}
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      Bestseller Product
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.is_featured}
                        onChange={(e) => setProductForm((f) => ({ ...f, is_featured: e.target.checked }))}
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                      />
                      Featured Seasonal
                    </label>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <Field label="Short Description">
                      <Input
                        value={productForm.short_description}
                        onChange={(e) => setProductForm((f) => ({ ...f, short_description: e.target.value }))}
                        placeholder="One line quick benefit summary..."
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <Field label="Full Description">
                      <Textarea
                        rows={3}
                        value={productForm.description}
                        onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Detailed formulation, ingredients and usage instructions..."
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  {editingProduct && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: "",
                          slug: "",
                          category_slug: "",
                          price: 0,
                          mrp: 0,
                          short_description: "",
                          description: "",
                          images: [""],
                          is_bestseller: false,
                          is_featured: false,
                          stock: 100,
                          ailment: "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" size="sm" className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5">
                    <Check className="h-4 w-4" /> {editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                </div>
              </form>

              {/* Products List Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((prod) => (
                  <div key={prod.id} className="rounded-2xl border border-border bg-background p-4 flex flex-col justify-between space-y-3 relative group">
                    <div className="space-y-2">
                      {prod.images?.[0] && (
                        <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                          <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {prod.is_bestseller && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                            Bestseller
                          </span>
                        )}
                        {prod.is_featured && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-base">{prod.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">Category: {prod.category_slug}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{prod.short_description}</p>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base font-bold text-violet-900">₹{prod.price}</span>
                        {prod.mrp > prod.price && (
                          <span className="text-xs text-muted-foreground line-through">₹{prod.mrp}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                      <Button size="xs" variant="outline" onClick={() => startEditProduct(prod)} className="gap-1">
                        <Edit2 className="h-3 w-3" /> Edit
                      </Button>
                      <Button size="xs" variant="destructive" onClick={() => handleDeleteProduct(prod.id)} className="gap-1">
                        <Trash2 className="h-3 w-3" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
