import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ReusableTable from "@/components/ReusableTable";
import LocalizedText from "@/components/LocalizedText";
import { useTranslation } from "react-i18next";

export default function FranchiseManagement() {
  const { t } = useTranslation();
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
      toast.error(t("healthAnalysis.franchise.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("v1/admin/franchises", form);
      toast.success(t("healthAnalysis.franchise.createSuccess"));
      setShowModal(false);
      fetchFranchises();
    } catch (err) {
      toast.error(err.response?.data?.message || t("healthAnalysis.franchise.createFailed"));
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await axiosInstance.patch(`v1/admin/franchises/${id}/status`, {
        status: nextStatus,
      });
      toast.success(
        t("healthAnalysis.franchise.statusUpdated", { status: nextStatus }),
      );
      fetchFranchises();
    } catch (err) {
      toast.error(t("healthAnalysis.franchise.statusUpdateFailed"));
    }
  };

  const headers = [
    {
      key: "franchise_code",
      label: t("healthAnalysis.franchise.colCode"),
      render: (row) => (
        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
          {row.franchise_code}
        </span>
      ),
    },
    {
      key: "name",
      label: t("healthAnalysis.franchise.colBranchName"),
      render: (row) => (
        <span className="font-medium">
          <LocalizedText value={row.name} />
        </span>
      ),
    },
    { key: "owner_name", label: t("healthAnalysis.franchise.colOwner") },
    {
      key: "phone",
      label: t("healthAnalysis.franchise.colContact"),
      filterable: false,
      render: (row) => (
        <span>
          {row.phone}
          {row.email ? ` / ${row.email}` : ""}
        </span>
      ),
    },
    {
      key: "royalty_percent",
      label: t("healthAnalysis.franchise.colRoyalty"),
      render: (row) => <span className="font-semibold">{row.royalty_percent}%</span>,
    },
    {
      key: "status",
      label: t("healthAnalysis.franchise.colStatus"),
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${row.status === "ACTIVE"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
            }`}
        >
          <LocalizedText value={row.status} />
        </span>
      ),
    },
    {
      key: "actions",
      label: t("healthAnalysis.franchise.colAction"),
      filterable: false,
      render: (row) => (
        <Button
          size="sm"
          variant={row.status === "ACTIVE" ? "destructive" : "default"}
          onClick={() => toggleStatus(row._id, row.status)}
        >
          {row.status === "ACTIVE"
            ? t("healthAnalysis.franchise.suspend")
            : t("healthAnalysis.franchise.activate")}
        </Button>
      ),
    },
  ];

  const AddFranchiseButton = () => (
    <Button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-700">
      <Plus className="mr-2 h-4 w-4" /> {t("healthAnalysis.franchise.addButton")}
    </Button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("healthAnalysis.franchise.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("healthAnalysis.franchise.desc")}
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <ReusableTable
            headers={headers}
            data={franchises}
            loading={loading}
            Search={t("healthAnalysis.franchise.searchPlaceholder")}
            CreateExportRender={AddFranchiseButton}
            pagination={true}
          />
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-lg space-y-4">
            <h3 className="text-lg font-bold">
              {t("healthAnalysis.franchise.modalTitle")}
            </h3>
            <form onSubmit={handleCreate} className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {t("healthAnalysis.franchise.codeLabel")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("healthAnalysis.franchise.codePlaceholder")}
                    value={form.franchise_code}
                    onChange={(e) => setForm({ ...form, franchise_code: e.target.value })}
                    className="w-full rounded border px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {t("healthAnalysis.franchise.royaltyLabel")}
                  </label>
                  <input
                    type="number"
                    value={form.royalty_percent}
                    onChange={(e) => setForm({ ...form, royalty_percent: Number(e.target.value) })}
                    className="w-full rounded border px-3 py-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("healthAnalysis.franchise.branchNameLabel")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("healthAnalysis.franchise.branchNamePlaceholder")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded border px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("healthAnalysis.franchise.ownerLabel")}
                </label>
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
                  <label className="block text-xs font-semibold mb-1">
                    {t("healthAnalysis.franchise.phoneLabel")}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded border px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {t("healthAnalysis.franchise.emailLabel")}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded border px-3 py-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {t("healthAnalysis.franchise.addressLabel")}
                </label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded border px-3 py-1.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  {t("healthAnalysis.franchise.cancel")}
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  {t("healthAnalysis.franchise.createBranch")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
