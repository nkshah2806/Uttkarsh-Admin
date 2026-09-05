import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  FileText,
  Activity,
  CalendarClock,
  UserCheck,
  UserX,
  ArrowRight,
  RefreshCw,
  UserPlus,
  ClipboardList,
  SlidersHorizontal,
  FileCog,
  Eye,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HeartPulse,
  History,
  ScanLine,
  Stethoscope,
  Database,
} from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getDashboardOverview } from "@/services/dashboardApi";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    : "—";

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  })}, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
};

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(iso);
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("UserDetails");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.fullName || u?.name || u?.username || null;
  } catch {
    return null;
  }
};

/* ------------------------------------------------------------------ */
/* Reusable presentational components                                  */
/* ------------------------------------------------------------------ */

function StatCard({ title, value, icon: Icon, accent, hint, loading }) {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-8 w-16" />
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="border-0 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-2 p-5">
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
          {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-10 text-center dark:border-slate-700">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && <p className="max-w-xs text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
      {label && <p className="font-medium">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="mt-0.5" style={{ color: entry.color || entry.stroke || entry.fill }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

const STATUS_STYLES = {
  DATA_ENTRY: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  REPORT_READY: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  SHARED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const STATUS_LABELS = {
  DATA_ENTRY: "Data Entry",
  REPORT_READY: "Report Ready",
  SHARED: "Report Shared",
  REGISTERED: "Registered",
};

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function DashboardOverview() {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useApiQuery({
    queryKey: ["dashboard-overview"],
    queryFn: getDashboardOverview,
    refetchInterval: 60_000,
    retry: 1,
  });

  const overview = useMemo(() => data?.data || null, [data]);
  const summary = overview?.summary || {};
  const charts = overview?.charts || {};
  const lists = overview?.lists || {};
  const admin = overview?.admin || null;

  // Merge patient & report daily trends into one dataset for the combined area chart
  const combinedTrend = useMemo(() => {
    const patients = charts.patientTrend || [];
    const reports = charts.reportTrend || [];
    const byDate = new Map();
    patients.forEach((d) => byDate.set(d.date, { ...d, patients: d.count, reports: 0 }));
    reports.forEach((d) => {
      const existing = byDate.get(d.date);
      if (existing) {
        existing.reports = d.count;
      } else {
        byDate.set(d.date, { ...d, patients: 0, reports: d.count });
      }
    });
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [charts.patientTrend, charts.reportTrend]);

  const currentUser = getCurrentUser();

  /* ---------------- Quick actions ---------------- */
  const quickActions = [
    { label: "Add Member", icon: UserPlus, to: "/user/create", accent: "from-violet-500 to-fuchsia-500" },
    { label: "Register Client", icon: ClipboardList, to: "/quantum/patients", accent: "from-emerald-500 to-green-500" },
    { label: "Manage Parameters", icon: SlidersHorizontal, to: "/quantum/master-data", accent: "from-sky-500 to-cyan-500" },
    { label: "Manage Disclaimers", icon: FileCog, to: "/quantum/disclaimers", accent: "from-amber-500 to-orange-500" },
    { label: "View Clients & Reports", icon: Eye, to: "/quantum/patients", accent: "from-rose-500 to-pink-500" },
  ];

  /* ---------------- Workflow strip ---------------- */
  const workflow = [
    { label: "Client", desc: "Register", icon: UserPlus },
    { label: "Machine Data", desc: "Scan entry", icon: ScanLine },
    { label: "Parameter Review", desc: "Verify values", icon: SlidersHorizontal },
    { label: "Report Generation", desc: "PDF output", icon: FileText },
    { label: "Previous Reports", desc: "History", icon: History },
    { label: "Follow-up", desc: "Next visit", icon: CalendarClock },
  ];

  /* ---------------- Pending records deep links ---------------- */
  const openPendingRecord = (record) => {
    if (record?.status === "DATA_ENTRY" && record?._id) {
      navigate(`/quantum-scan/${record._id}`);
    } else if (record?.status === "REPORT_READY" && record?._id) {
      navigate(`/report-review/${record._id}`);
    } else if (record?.patient?._id) {
      navigate(`/quantum/patients/${record.patient._id}`);
    }
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Unable to load dashboard</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {error?.response?.data?.message || error?.message || "Something went wrong while fetching dashboard data."}
              </p>
            </div>
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ============ Hero ============ */}
      <div className="overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-sky-600 p-6 text-white shadow-lg dark:border-violet-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-violet-100">
              Quantum Health Analysis · Admin Control Panel
            </p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
              {greeting()}{currentUser ? `, ${currentUser}` : ""} 👋
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-violet-50">
              Here's what's happening across your health analysis platform — what needs attention,
              what happened recently, and what to do next.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="bg-white/15 text-white backdrop-blur hover:bg-white/25"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              className="bg-white text-violet-700 hover:bg-violet-50"
              onClick={() => navigate("/quantum/patients")}
            >
              Open Client Directory <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Workflow visibility */}
        <div className="mt-6 grid gap-2 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur sm:grid-cols-3 lg:grid-cols-6">
          {workflow.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/10">
                <Icon className="h-4 w-4 shrink-0 text-violet-100" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{step.label}</p>
                  <p className="truncate text-[10px] text-violet-100">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============ Quick actions ============ */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md dark:border-slate-700 dark:hover:border-violet-700"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.accent} text-white`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">{action.label}</p>
                <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400">
                  Open <ArrowRight className="h-3 w-3" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============ Stat cards ============ */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard loading={isLoading} title="Total Clients" value={summary.totalPatients ?? "—"} icon={Users} accent="from-emerald-500 to-green-500" hint={`${summary.patientsToday ?? 0} today`} />
        <StatCard loading={isLoading} title="Total Reports" value={summary.totalReports ?? "—"} icon={FileText} accent="from-sky-500 to-cyan-500" hint={`${summary.reportsToday ?? 0} today`} />
        <StatCard loading={isLoading} title="Pending Records" value={(summary.pendingVisits ?? 0) + (summary.reportReadyVisits ?? 0)} icon={Clock} accent="from-amber-500 to-orange-500" hint={`${summary.pendingVisits ?? 0} data entry · ${summary.reportReadyVisits ?? 0} review`} />
        <StatCard loading={isLoading} title="Upcoming Follow-ups" value={summary.upcomingFollowUps ?? "—"} icon={CalendarClock} accent="from-violet-500 to-fuchsia-500" hint={`${summary.overdueFollowUps ?? 0} overdue`} />
        <StatCard loading={isLoading} title="Active Members" value={admin ? admin.activeMembers : "—"} icon={UserCheck} accent="from-teal-500 to-emerald-500" hint={admin ? `${admin.inactiveMembers} inactive` : undefined} />
        <StatCard loading={isLoading} title="Parameters" value={admin ? admin.totalParameters : "—"} icon={Database} accent="from-rose-500 to-pink-500" hint={admin ? `${admin.publishedParameters} published` : undefined} />
      </div>

      {/* ============ Charts row 1 ============ */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Registrations & Report Generation</CardTitle>
            <CardDescription>Last 7 days activity</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : combinedTrend?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={combinedTrend} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradReports" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="patients" name="Clients" stroke="#8b5cf6" fill="url(#gradPatients)" strokeWidth={2} />
                  <Area type="monotone" dataKey="reports" name="Reports" stroke="#0ea5e9" fill="url(#gradReports)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={TrendingUp} title="No activity yet" description="Registrations and report generation trends will appear here." />
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Parameter Results</CardTitle>
            <CardDescription>Distribution across all scans</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (charts.resultDistribution?.reduce((a, r) => a + r.value, 0) || 0) > 0 ? (
              <div className="flex flex-col items-center gap-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={charts.resultDistribution}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {charts.resultDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid w-full grid-cols-3 gap-2">
                  {charts.resultDistribution.map((r) => (
                    <div key={r.name} className="rounded-xl border border-slate-200 p-2 text-center dark:border-slate-700">
                      <div className="mx-auto mb-1 h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
                      <p className="text-xs text-muted-foreground">{r.name}</p>
                      <p className="text-sm font-semibold">{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState icon={HeartPulse} title="No scan results yet" description="Parameter results across scans will appear here." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============ Charts row 2 ============ */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trends</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : charts.patientMonthlyTrend?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={charts.patientMonthlyTrend} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Clients" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={TrendingUp} title="No monthly data yet" description="Monthly registration trends will appear here." />
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[300px] space-y-0 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : lists.recentActivities?.length ? (
              <ul className="space-y-1">
                {lists.recentActivities.map((act) => (
                  <li key={act._id}>
                    <button
                      className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      onClick={() => act.visit_id && navigate(`/report-pdf/${act.visit_id}`)}
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${act.type === "report_generated"
                          ? "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400"
                          : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                          }`}
                      >
                        {act.type === "report_generated" ? <FileText className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">{act.title}</p>
                          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(act.timestamp)}</span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{act.description}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Activity} title="No recent activity" description="New actions will appear here in real time." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============ Lists row 1 ============ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent patients */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Recent Client Registrations</CardTitle>
              <CardDescription>Latest clients added to the system</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/quantum/patients")}>
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : lists.recentPatients?.length ? (
              <div className="space-y-2">
                {lists.recentPatients.map((p) => (
                  <button
                    key={p._id}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:border-violet-300 hover:bg-violet-50/50 dark:border-slate-700 dark:hover:border-violet-700 dark:hover:bg-violet-900/10"
                    onClick={() => navigate(`/quantum/patients/${p._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.patient_code} · {p.mobile || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</p>
                      <ArrowRight className="ml-auto mt-1 h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState icon={Users} title="No clients registered yet" description="Register your first client to see them here." />
            )}
          </CardContent>
        </Card>

        {/* Recent reports */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Recent Report Generations</CardTitle>
              <CardDescription>Latest PDF reports generated</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/quantum/patients")}>
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : lists.recentReports?.length ? (
              <div className="space-y-2">
                {lists.recentReports.map((r) => (
                  <button
                    key={r._id}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:border-sky-300 hover:bg-sky-50/50 dark:border-slate-700 dark:hover:border-sky-700 dark:hover:bg-sky-900/10"
                    onClick={() => r.visit_id && navigate(`/report-pdf/${r.visit_id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{r.patient?.name || "Unknown client"}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.patient?.patient_code || "—"} · {r.language === "hi" ? "Hindi" : "English"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{fmtDateTime(r.generated_at)}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState icon={FileText} title="No reports generated yet" description="Generated reports will appear here." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============ Lists row 2 ============ */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending / Incomplete records */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Pending / Incomplete Records</CardTitle>
              <CardDescription>Visits that need machine data or report review</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              {(summary.pendingVisits ?? 0) + (summary.reportReadyVisits ?? 0)} pending
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : lists.pendingVisits?.length ? (
              <div className="space-y-2">
                {lists.pendingVisits.map((v) => (
                  <button
                    key={v._id}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:border-amber-300 hover:bg-amber-50/50 dark:border-slate-700 dark:hover:border-amber-700 dark:hover:bg-amber-900/10"
                    onClick={() => openPendingRecord(v)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        {v.status === "DATA_ENTRY" ? <ScanLine className="h-4 w-4" /> : <Stethoscope className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{v.patient?.name || "Unknown client"}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.patient?.patient_code || "—"} · {fmtDate(v.visit_date || v.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[v.status] || "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABELS[v.status] || v.status}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState icon={CheckCircle2} title="No pending records" description="All visits are complete. New data entry or report reviews will appear here." />
            )}
          </CardContent>
        </Card>

        {/* Upcoming follow-ups */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Upcoming Follow-ups</CardTitle>
              <CardDescription>Clients with next visit dates from today</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              {summary.upcomingFollowUps ?? 0} scheduled
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : lists.upcomingFollowUps?.length ? (
              <div className="space-y-2">
                {lists.upcomingFollowUps.map((v) => (
                  <button
                    key={v._id}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:border-violet-300 hover:bg-violet-50/50 dark:border-slate-700 dark:hover:border-violet-700 dark:hover:bg-violet-900/10"
                    onClick={() => v.patient?._id && navigate(`/quantum/patients/${v.patient._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                        <CalendarClock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{v.patient?.name || "Unknown client"}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.patient?.patient_code || "—"} · {v.patient?.mobile || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                        {fmtDate(v.next_visit_date)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState icon={CalendarClock} title="No upcoming follow-ups" description="Visits with next visit dates will appear here." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============ Admin system overview ============ */}
      {admin && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">System Overview</CardTitle>
            <CardDescription>Platform-wide statistics</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-3">
            {/* Member & franchise stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserCheck className="h-4 w-4 text-emerald-500" /> Active Members
                </span>
                <span className="text-lg font-semibold">{admin.activeMembers}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserX className="h-4 w-4 text-rose-500" /> Inactive Members
                </span>
                <span className="text-lg font-semibold">{admin.inactiveMembers}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-violet-500" /> Active Franchises
                </span>
                <span className="text-lg font-semibold">
                  {admin.activeFranchises} <span className="text-xs font-normal text-muted-foreground">/ {admin.totalFranchises}</span>
                </span>
              </div>
            </div>

            {/* Role distribution */}
            <div>
              <p className="mb-2 text-sm font-medium">User Roles</p>
              {admin.roleDistribution?.length ? (
                <div className="space-y-2">
                  {admin.roleDistribution.slice(0, 6).map((r) => {
                    const max = Math.max(...admin.roleDistribution.map((x) => x.count), 1);
                    return (
                      <div key={r.role} className="flex items-center gap-2">
                        <span className="w-28 shrink-0 truncate text-xs text-muted-foreground">{r.role}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                            style={{ width: `${(r.count / max) * 100}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs font-semibold">{r.count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No user data available.</p>
              )}
            </div>

            {/* Parameter categories */}
            <div>
              <p className="mb-2 text-sm font-medium">Parameters by Category</p>
              <div className="flex flex-wrap gap-2">
                {admin.parameterCategories?.length ? (
                  admin.parameterCategories.slice(0, 8).map((c) => (
                    <Badge key={c.category} variant="outline" className="gap-1 px-2.5 py-1">
                      {c.category}
                      <span className="font-semibold text-violet-600 dark:text-violet-400">{c.count}</span>
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No parameter data available.</p>
                )}
                {admin.totalContentNodes > 0 && (
                  <p className="mt-3 w-full text-xs text-muted-foreground">
                    {admin.totalContentNodes.toLocaleString()} content nodes across {admin.totalParameters} parameters.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
