import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { Search, Users, ShieldAlert, Filter, Calendar, MapPin, Scale, Ruler } from "lucide-react";
import { toast } from "sonner";

export default function PatientRegistration() {
  const { lang } = useLanguage();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
      toast.error(err.response?.data?.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(query);
    const codeMatch = p.patient_code?.toLowerCase().includes(query);
    const mobileMatch = p.mobile?.includes(query);
    const addressMatch = p.address?.toLowerCase().includes(query);
    const registeredByMatch = p.registered_by?.fullName?.toLowerCase().includes(query);
    return nameMatch || codeMatch || mobileMatch || addressMatch || registeredByMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-md border border-indigo-900/40">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-indigo-300 font-bold mb-1">
              <Users className="h-4 w-4 text-indigo-400" />
              Admin Patient Directory
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {lang === "hi" ? "पंजीकृत रोगी डायरेक्टरी" : "Patient Directory"}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {lang === "hi"
                ? "सभी पंजीकृत रोगियों की संपूर्ण जानकारी (वजन, ऊंचाई, पता और पंजीकृत सदस्य) देखें।"
                : "View full patient records registered across all franchise members."}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <Card className="shadow-sm border-0">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, code, mobile, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-slate-500 shrink-0" />
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full sm:w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Franchise Members ({memberOptions.length})</option>
              {memberOptions.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.fullName} ({m.email || m.username || "Member"})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table Card */}
      <Card className="shadow-sm border-0">
        <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>Registered Patients List ({filteredPatients.length})</span>
            {loading && <span className="text-xs text-indigo-600 animate-pulse">Loading directory...</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Patient Code</th>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Age / Gender</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Weight & Height</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Registered By</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">
                      {loading ? "Loading patient records..." : "No patients found matching your search."}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                        {p.patient_code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {p.age} Yrs / {p.gender}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {p.mobile}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            <Scale className="h-3 w-3 text-indigo-500" />
                            {p.weight ? `${p.weight} ${p.weight_unit || "kg"}` : "N/A"}
                          </span>
                          <span className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            <Ruler className="h-3 w-3 text-violet-500" />
                            {p.height ? `${p.height} ${p.height_unit || "cm"}` : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs" title={p.address}>
                        {p.address ? (
                          <span className="flex items-center gap-1 whitespace-pre-line">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            {p.address}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {p.registered_by ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-indigo-900 dark:text-indigo-300">
                              {p.registered_by.fullName || p.registered_by.username}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              {p.registered_by.email || p.registered_by.role || "Member"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {new Date(p.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
