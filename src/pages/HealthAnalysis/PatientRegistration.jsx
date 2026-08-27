import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { Users, Calendar, Eye, CheckCircle2, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReusableTable from "@/components/ReusableTable";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function PatientRegistration() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState("");
  const [memberOptions, setMemberOptions] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, [selectedMember]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      let url = "v1/patients";
      if (selectedMember) {
        url += `?registered_by=${selectedMember}`;
      }
      const res = await axiosInstance.get(url);
      const data = res.data.data || [];
      setPatients(data);

      // Extract unique list of registering members for filter dropdown
      const membersMap = new Map();
      data.forEach((p) => {
        if (p.registered_by && p.registered_by._id) {
          membersMap.set(p.registered_by._id, p.registered_by);
        }
      });
      setMemberOptions(Array.from(membersMap.values()));
    } catch (err) {
      toast.error(err.response?.data?.message || t("failedLoadPatients"));
    } finally {
      setLoading(false);
    }
  };

  // Clean, focused table columns
  const headers = [
    {
      key: "patient_code",
      label: t("patientCode"),
      render: (row) => (
        <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-1 rounded-md border border-indigo-200/60 dark:border-indigo-800">
          {row.patient_code}
        </span>
      ),
    },
    {
      key: "name",
      label: t("patientName"),
      render: (row) => (
        <button
          onClick={() => navigate(`/quantum/patients/${row._id}`)}
          className="text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
        >
          {row.name}
        </button>
      ),
    },
    {
      key: "age",
      label: t("ageGender"),
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {t("ageYrs").replace("{age}", row.age).replace("{gender}", row.gender)}
        </span>
      ),
    },
    {
      key: "mobile",
      label: t("mobile"),
      render: (row) => (
        <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-medium">
          {row.mobile}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("registrationDate"),
      render: (row) => (
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {new Date(row.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "registered_by",
      label: t("consultantMember"),
      render: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row.registered_by?.fullName || row.registered_by?.username || t("franchiseMember")}
          </span>
          <span className="text-slate-400 text-[11px]">
            {row.registered_by?.email || row.registered_by?.role || t("member")}
          </span>
        </div>
      ),
    },
    {
      key: "latest_status",
      label: t("status"),
      render: (row) => {
        const st = row.latest_status;
        if (st === "SHARED") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3 w-3" /> {t("reportShared")}
            </span>
          );
        }
        if (st === "REPORT_READY") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <FileText className="h-3 w-3" /> {t("reportReady")}
            </span>
          );
        }
        if (st === "DATA_ENTRY") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Clock className="h-3 w-3" /> {t("inProgress")}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {t("registered")}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: t("actions"),
      filterable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Eye / View Details Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/quantum/patients/${row._id}`)}
            className="h-8 px-2.5 text-xs font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-950"
            title={t("viewPatientProfile")}
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> {t("viewDetails")}
          </Button>
        </div>
      ),
    },
  ];

  const MemberFilterRender = () => (
    <Select
      value={selectedMember}
      onValueChange={(val) => setSelectedMember(val === "all" ? "" : val)}
    >
      <SelectTrigger className="max-w-max min-w-[200px]">
        <SelectValue placeholder={t("allMembers").replace("{count}", memberOptions.length)} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("allFranchiseMembers").replace("{count}", memberOptions.length)}</SelectItem>
        {memberOptions.map((m) => (
          <SelectItem key={m._id} value={m._id}>
            {m.fullName} ({m.email || m.username || t("member")})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md border border-indigo-900/40">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-indigo-300 font-bold mb-1">
              <Users className="h-4 w-4 text-indigo-400" />
              {t("adminPatientDirectory")}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("patientDirectoryTitle")}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {t("patientDirectorySubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <Card className="shadow-sm border-0">
        <CardContent className="p-6">
          <ReusableTable
            headers={headers}
            data={patients}
            loading={loading}
            Search={t("searchPatientPlaceholder")}
            CreateExportRender={MemberFilterRender}
            pagination={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
