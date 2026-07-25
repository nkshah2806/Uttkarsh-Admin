import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Plus, Trash2, Edit2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { categoriesService } from "@/services/categoriesService";
import { productsService } from "@/services/productsService";
import { Field, CMSInput, CMSTextarea, CMSPageHeader, CMSLoader } from "./CMSShared";

const EMPTY_PRODUCT = {
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
};

export default function ProductsCMS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);

  useEffect(() => {
    Promise.all([
      productsService.getProducts(),
      categoriesService.getCategories(),
    ]).then(([prods, cats]) => {
      setProducts(prods || []);
      setCategories(cats || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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
      setProductForm(EMPTY_PRODUCT);
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
    } catch {
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

  const cancelEdit = () => {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
  };

  if (loading) return <CMSLoader label="Loading products…" />;

  return (
    <div className="space-y-6">
      <CMSPageHeader
        icon={ShoppingBag}
        title="Shop Products"
        description="Add, edit or delete Ayurvedic products shown on the Shop and Home pages."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-violet-500" /> Dynamic Shop Products
          </CardTitle>
          <CardDescription>
            Manage your product catalogue. All changes are immediately reflected on the frontend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Add/Edit Form */}
          <form
            onSubmit={handleSaveProduct}
            className="rounded-2xl border border-violet-500/30 bg-violet-50/50 dark:bg-violet-950/10 p-5 space-y-4"
          >
            <h3 className="font-semibold text-sm flex items-center gap-2 text-violet-900 dark:text-violet-300">
              {editingProduct ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Product Name">
                <CMSInput
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
                <CMSInput
                  value={productForm.slug}
                  onChange={(e) => setProductForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="special-chyawanprash"
                />
              </Field>
              <Field label="Category">
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
                <CMSInput
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                />
              </Field>
              <Field label="MRP (₹)">
                <CMSInput
                  type="number"
                  value={productForm.mrp}
                  onChange={(e) => setProductForm((f) => ({ ...f, mrp: e.target.value }))}
                />
              </Field>
              <Field label="Stock Quantity">
                <CMSInput
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </Field>

              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="Product Image URL">
                  <CMSInput
                    value={Array.isArray(productForm.images) ? productForm.images[0] : productForm.images}
                    onChange={(e) => setProductForm((f) => ({ ...f, images: [e.target.value] }))}
                    placeholder="https://images.unsplash.com/..."
                  />
                </Field>
              </div>

              {(Array.isArray(productForm.images) ? productForm.images[0] : productForm.images) && (
                <div className="sm:col-span-2 lg:col-span-3 rounded-xl overflow-hidden h-40 border border-border">
                  <img
                    src={Array.isArray(productForm.images) ? productForm.images[0] : productForm.images}
                    alt="Product Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <Field label="Ailment / Concern Tag">
                <CMSInput
                  value={productForm.ailment}
                  onChange={(e) => setProductForm((f) => ({ ...f, ailment: e.target.value }))}
                  placeholder="e.g. Immunity & Cold Protection"
                />
              </Field>

              <div className="flex items-center gap-6 pt-4">
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
                  <CMSInput
                    value={productForm.short_description}
                    onChange={(e) => setProductForm((f) => ({ ...f, short_description: e.target.value }))}
                    placeholder="One line quick benefit summary..."
                  />
                </Field>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="Full Description">
                  <CMSTextarea
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
                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
              <Button type="submit" size="sm" className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5">
                <Check className="h-4 w-4" />
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </form>

          {/* Products List Grid */}
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No products yet. Add your first product above.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-2xl border border-border bg-background p-4 flex flex-col justify-between space-y-3 relative group"
                >
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
                    <Button variant="outline" onClick={() => startEditProduct(prod)} className="gap-1">
                      <Edit2 className="h-3 w-3" /> Edit
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteProduct(prod.id)} className="gap-1">
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
