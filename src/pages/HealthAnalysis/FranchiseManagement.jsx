import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function FranchiseManagement() {
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    franchise_code: "",
    name: "",
    owner_name: "",
    address: "",
    phone: "",
    email: "",
    royalty_percent: 10,
  });

  useEffect(() => {
    fetchFranchises();
  }, []);

  const fetchFranchises = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("v1/admin/franchises");
      setFranchises(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load franchises");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("v1/admin/franchises", form);
      toast.success("Franchise created successfully");
      setShowModal(false);
      fetchFranchises();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create franchise");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await axiosInstance.patch(`v1/admin/franchises/${id}/status`, {
        status: nextStatus,
      });
      toast.success(`Franchise status updated to ${nextStatus}`);
      fetchFranchises();
    } catch (err) {
      toast.error("Failed to update franchise status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Franchise Branch Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage Head Office and regional franchise branches, plans & commission rates.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> Add Franchise Branch
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Branch Name</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Royalty</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {franchises.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">{f.franchise_code}</td>
                    <td className="px-4 py-3 font-medium">{f.name}</td>
                    <td className="px-4 py-3">{f.owner_name}</td>
                    <td className="px-4 py-3">{f.phone} / {f.email}</td>
                    <td className="px-4 py-3 font-semibold">{f.royalty_percent}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${f.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant={f.status === "ACTIVE" ? "destructive" : "default"}
                        onClick={() => toggleStatus(f._id, f.status)}
                      >
                        {f.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-bold">Register New Franchise Branch</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Franchise Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FR01"
                    value={form.franchise_code}
                    onChange={(e) => setForm({ ...form, franchise_code: e.target.value })}
                    className="w-full rounded border px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Royalty %</label>
                  <input
                    type="number"
                    value={form.royalty_percent}
                    onChange={(e) => setForm({ ...form, royalty_percent: Number(e.target.value) })}
                    className="w-full rounded border px-3 py-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Utkarsh Healthcare Center - Jaipur"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded border px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Owner / Manager Name *</label>
                <input
                  type="text"
                  required
                  value={form.owner_name}
                  onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                  className="w-full rounded border px-3 py-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded border px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded border px-3 py-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Address</label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded border px-3 py-1.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Create Branch</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
