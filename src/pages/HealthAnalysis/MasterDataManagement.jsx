import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { Plus, Search, FileText, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function MasterDataManagement() {
  const { lang } = useLanguage();
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedParam, setSelectedParam] = useState(null);
  const [contentList, setContentList] = useState([]);
  
  // Modal states
  const [showParamModal, setShowParamModal] = useState(false);
  const [editingParam, setEditingParam] = useState(null); // null if creating, object if editing
  const [deletingParam, setDeletingParam] = useState(null); // object if prompt open

  const [showContentModal, setShowContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null); // null if creating, object if editing
  const [deletingContent, setDeletingContent] = useState(null); // object if prompt open

  const [paramForm, setParamForm] = useState({
    code: "",
    name_en: "",
    name_hi: "",
    unit: "",
    normal_min: "",
    normal_max: "",
    category: "General",
  });

  const [contentForm, setContentForm] = useState({
    result_type: "HIGH",
    content_type: "PROBLEM",
    text_en: "",
    text_hi: "",
    priority: 1,
  });

  useEffect(() => {
    fetchParameters();
  }, [search]);

  const fetchParameters = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`v1/admin/parameters?search=${search}`);
      setParameters(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load parameters");
    } finally {
      setLoading(false);
    }
  };

  const openAddParamModal = () => {
    setEditingParam(null);
    setParamForm({
      code: "",
      name_en: "",
      name_hi: "",
      unit: "",
      normal_min: "",
      normal_max: "",
      category: "General",
    });
    setShowParamModal(true);
  };

  const openEditParamModal = (param, e) => {
    e.stopPropagation();
    setEditingParam(param);
    setParamForm({
      code: param.code || "",
      name_en: param.name_en || "",
      name_hi: param.name_hi || "",
      unit: param.unit || "",
      normal_min: param.normal_min !== undefined ? param.normal_min : "",
      normal_max: param.normal_max !== undefined ? param.normal_max : "",
      category: param.category || "General",
    });
    setShowParamModal(true);
  };

  const handleSaveParameter = async (e) => {
    e.preventDefault();
    try {
      if (editingParam) {
        await axiosInstance.put(`v1/admin/parameters/${editingParam._id}`, paramForm);
        toast.success("Parameter updated successfully");
      } else {
        await axiosInstance.post("v1/admin/parameters", paramForm);
        toast.success("Parameter created successfully");
      }
      setShowParamModal(false);
      fetchParameters();
      if (selectedParam && editingParam && selectedParam._id === editingParam._id) {
        setSelectedParam({ ...selectedParam, ...paramForm });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving parameter");
    }
  };

  const confirmDeleteParameter = async () => {
    if (!deletingParam) return;
    try {
      await axiosInstance.delete(`v1/admin/parameters/${deletingParam._id}`);
      toast.success("Parameter and associated content deleted");
      setDeletingParam(null);
      if (selectedParam?._id === deletingParam._id) {
        setSelectedParam(null);
        setContentList([]);
      }
      fetchParameters();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete parameter");
    }
  };

  const fetchParamContent = async (param) => {
    setSelectedParam(param);
    try {
      const res = await axiosInstance.get(`v1/admin/parameters/${param._id}/content`);
      setContentList(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load content for parameter");
    }
  };

  const openAddContentModal = () => {
    setEditingContent(null);
    setContentForm({
      result_type: "HIGH",
      content_type: "PROBLEM",
      text_en: "",
      text_hi: "",
      priority: 1,
    });
    setShowContentModal(true);
  };

  const openEditContentModal = (item) => {
    setEditingContent(item);
    setContentForm({
      result_type: item.result_type || "HIGH",
      content_type: item.content_type || "PROBLEM",
      text_en: item.text_en || "",
      text_hi: item.text_hi || "",
      priority: item.priority || 1,
    });
    setShowContentModal(true);
  };

  const handleSaveContent = async (e) => {
    e.preventDefault();
    if (!selectedParam) return;
    try {
      if (editingContent) {
        await axiosInstance.put(
          `v1/admin/parameters/content/${editingContent._id}`,
          contentForm
        );
        toast.success("Master content updated");
      } else {
        await axiosInstance.post(
          `v1/admin/parameters/${selectedParam._id}/content`,
          contentForm
        );
        toast.success("Master content added");
      }
      setShowContentModal(false);
      fetchParamContent(selectedParam);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving content");
    }
  };

  const confirmDeleteContent = async () => {
    if (!deletingContent) return;
    try {
      await axiosInstance.delete(`v1/admin/parameters/content/${deletingContent._id}`);
      toast.success("Master content bullet deleted");
      setDeletingContent(null);
      fetchParamContent(selectedParam);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete content");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {lang === "hi" ? "क्वांटम पैरामीटर मास्टर डेटा" : "Quantum Parameter Master Data"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "hi"
              ? "सभी पैरामीटर, सामान्य सीमा और द्विभाषी आयुर्वेदिक रिपोर्ट सामग्री को संपादित एवं प्रबंधित करें।"
              : "Manage quantum machine parameters, normal ranges & dual-language report content with full Edit/Delete controls."}
          </p>
        </div>
        <Button onClick={openAddParamModal} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> Add New Parameter
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search parameter code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Parameter Library ({parameters.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Name ({lang.toUpperCase()})</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Normal Range</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {parameters.map((p) => (
                    <tr
                      key={p._id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${
                        selectedParam?._id === p._id ? "bg-indigo-50 dark:bg-indigo-950/40" : ""
                      }`}
                      onClick={() => fetchParamContent(p)}
                    >
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {p.code}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {lang === "hi" ? p.name_hi : p.name_en}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{p.category}</td>
                      <td className="px-4 py-3">
                        {p.normal_min} - {p.normal_max} {p.unit}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Edit Parameter"
                            onClick={(e) => openEditParamModal(p, e)}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Delete Parameter"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingParam(p);
                            }}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Master Content Side Drawer */}
        <Card className="shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                {selectedParam ? `${selectedParam.code} Content` : "Select a Parameter"}
              </CardTitle>
              {selectedParam && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedParam.name_en} ({selectedParam.normal_min}-{selectedParam.normal_max} {selectedParam.unit})
                </p>
              )}
            </div>
            {selectedParam && (
              <Button size="sm" onClick={openAddContentModal} className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Content
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!selectedParam ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Click any parameter on the left to view, add, edit, or delete its Ayurvedic report text items.
              </div>
            ) : contentList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No content items defined yet. Click <strong>Add Content</strong> to add bullets.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {contentList.map((item) => (
                  <div key={item._id} className="rounded-lg border p-3 bg-slate-50 dark:bg-slate-900 text-xs space-y-1.5 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase ${item.result_type === "HIGH" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                          {item.result_type}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {item.content_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground mr-2">Priority: {item.priority}</span>
                        <button
                          onClick={() => openEditContentModal(item)}
                          className="p-1 text-slate-500 hover:text-indigo-600 rounded"
                          title="Edit Bullet"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingContent(item)}
                          className="p-1 text-slate-500 hover:text-rose-600 rounded"
                          title="Delete Bullet"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200"><strong>EN:</strong> {item.text_en}</p>
                    <p className="text-slate-600 dark:text-slate-400"><strong>HI:</strong> {item.text_hi}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal for Creating / Editing Parameter */}
      {showParamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-lg space-y-4 shadow-xl">
            <h3 className="text-lg font-bold">
              {editingParam ? `Edit Parameter (${editingParam.code})` : "Add Quantum Parameter"}
            </h3>
            <form onSubmit={handleSaveParameter} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. P006"
                    value={paramForm.code}
                    onChange={(e) => setParamForm({ ...paramForm, code: e.target.value })}
                    className="w-full rounded border px-3 py-1.5 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={paramForm.category}
                    onChange={(e) => setParamForm({ ...paramForm, category: e.target.value })}
                    className="w-full rounded border px-3 py-1.5 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">English Name *</label>
                <input
                  type="text"
                  required
                  value={paramForm.name_en}
                  onChange={(e) => setParamForm({ ...paramForm, name_en: e.target.value })}
                  className="w-full rounded border px-3 py-1.5 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Hindi Name *</label>
                <input
                  type="text"
                  required
                  value={paramForm.name_hi}
                  onChange={(e) => setParamForm({ ...paramForm, name_hi: e.target.value })}
                  className="w-full rounded border px-3 py-1.5 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    value={paramForm.unit}
                    onChange={(e) => setParamForm({ ...paramForm, unit: e.target.value })}
                    className="w-full rounded border px-3 py-1.5 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Min Range *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={paramForm.normal_min}
                    onChange={(e) => setParamForm({ ...paramForm, normal_min: e.target.value })}
                    className="w-full rounded border px-3 py-1.5 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Max Range *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={paramForm.normal_max}
                    onChange={(e) => setParamForm({ ...paramForm, normal_max: e.target.value })}
                    className="w-full rounded border px-3 py-1.5 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowParamModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  {editingParam ? "Update Parameter" : "Save Parameter"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Parameter Delete */}
      {deletingParam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-rose-200 dark:border-rose-900">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Delete Parameter</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete parameter <strong className="text-slate-900 dark:text-slate-100">{deletingParam.code} - {deletingParam.name_en}</strong>?
              This action cannot be undone and will delete all associated master content entries.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeletingParam(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteParameter}>Confirm Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Creating / Editing Master Content Bullet */}
      {showContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-lg space-y-4 shadow-xl">
            <h3 className="text-lg font-bold">
              {editingContent ? "Edit Master Content Bullet" : `Add Bullet (${selectedParam?.code})`}
            </h3>
            <form onSubmit={handleSaveContent} className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Result Type</label>
                  <select
                    value={contentForm.result_type}
                    onChange={(e) => setContentForm({ ...contentForm, result_type: e.target.value })}
                    className="w-full rounded border px-2 py-1.5 bg-white dark:bg-slate-800"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Content Type</label>
                  <select
                    value={contentForm.content_type}
                    onChange={(e) => setContentForm({ ...contentForm, content_type: e.target.value })}
                    className="w-full rounded border px-2 py-1.5 bg-white dark:bg-slate-800"
                  >
                    <option value="REPORT">REPORT</option>
                    <option value="PROBLEM">PROBLEM</option>
                    <option value="CAUSE">CAUSE</option>
                    <option value="PRECAUTION">PRECAUTION</option>
                    <option value="PATHYA">PATHYA</option>
                    <option value="PARHEJ">PARHEJ</option>
                    <option value="MEDICINE">MEDICINE</option>
                    <option value="DIET">DIET</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Priority</label>
                  <input
                    type="number"
                    value={contentForm.priority}
                    onChange={(e) => setContentForm({ ...contentForm, priority: Number(e.target.value) })}
                    className="w-full rounded border px-2 py-1.5 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">English Text *</label>
                <textarea
                  required
                  rows={2}
                  value={contentForm.text_en}
                  onChange={(e) => setContentForm({ ...contentForm, text_en: e.target.value })}
                  className="w-full rounded border px-3 py-1.5 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Hindi Text *</label>
                <textarea
                  required
                  rows={2}
                  value={contentForm.text_hi}
                  onChange={(e) => setContentForm({ ...contentForm, text_hi: e.target.value })}
                  className="w-full rounded border px-3 py-1.5 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowContentModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  {editingContent ? "Update Bullet" : "Save Bullet"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Content Bullet Delete */}
      {deletingContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-rose-200 dark:border-rose-900">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Delete Master Content Item</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this master content bullet?
            </p>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs">
              <p><strong>Type:</strong> {deletingContent.result_type} / {deletingContent.content_type}</p>
              <p className="truncate"><strong>EN:</strong> {deletingContent.text_en}</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeletingContent(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteContent}>Confirm Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
