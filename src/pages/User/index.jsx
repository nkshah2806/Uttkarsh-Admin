import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReusableTable from "@/components/ReusableTable";
import {
  getAllUsers,
  toggleUserStatus,
  approveUser,
} from "@/services/userService";
import { useApiMutation } from "@/hooks/useApiMutation";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, CheckCircle2, Clock } from "lucide-react";
import DeleteDialog from "@/components/DeleteDialog";
import user from "../../assets/user.png";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import LocalizedText from "@/components/LocalizedText";
import EditUserModal from "./EditUserModal";
import DeleteUserDialog from "./DeleteUserDialog";

const ApprovalBadge = ({ status }) => {
  const { t } = useTranslation();
  if (status === "approved") {
    return (
      <Badge variant="completed" className="capitalize">
        <CheckCircle2 className="w-4 h-4" />
        {t("user.approved")}
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge variant="destructive" className="capitalize">
        {t("user.rejected")}
      </Badge>
    );
  }
  return (
    <Badge variant="confirmed" className="capitalize">
      <Clock className="w-4 h-4" />
      {t("user.pending")}
    </Badge>
  );
};

export default function User() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableRef = useRef();

  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const currentAdmin = (() => {
    try {
      return JSON.parse(localStorage.getItem("UserDetails") || "{}");
    } catch {
      return {};
    }
  })();

  const isCurrentAdmin = (row) =>
    String(row?._id || row?.id) === String(currentAdmin?._id || currentAdmin?.id);

  const headers = [
    {
      key: "sNo",
      label: t("user.sNo"),
      filterable: false,
    },
    {
      key: "profileUrl",
      label: t("user.profile"),
      filterable: false,
      render: (row) => (
        <img
          className="w-10 h-10 rounded-full object-cover flex-none"
          src={row.profileUrl}
          alt={t("user.profileAlt", { name: row.fullName })}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = user;
          }}
        />
      ),
    },
    {
      key: "name",
      label: t("user.fullName"),
      filterable: true,
      render: (row) => <LocalizedText value={row.fullName} />,
    },
    {
      key: "role",
      label: t("user.adminOrUser"),
      filterable: true,
      render: (row) => (
        <Badge variant={row.isAdmin ? "destructive" : "default"} className="capitalize min-w-auto">
          {row.isAdmin ? t("user.admin") : t("user.member")}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: t("user.registrationDate"),
      filterable: true,
    },
    {
      key: "profileCompletion",
      label: t("user.profileCompletion"),
      filterable: false,
      render: (row) => (
        <Badge variant={row.profile_completed ? "completed" : "destructive"} className="capitalize">
          {row.profile_completed ? t("user.completed") : t("user.incomplete")}
        </Badge>
      ),
    },
    {
      key: "approvalStatus",
      label: t("user.approvalStatus"),
      filterable: false,
      render: (row) => <ApprovalBadge status={row.approval_status} />,
    },
    {
      key: "isActive",
      label: t("user.status"),
      filterable: true,
      render: (row) => (
        <DeleteDialog
          title={row.isActive ? t("user.inactiveUser") : t("user.activeUser")}
          des={
            row.isActive
              ? t("user.deactivateConfirm", { name: row.fullName })
              : t("user.activateConfirm", { name: row.fullName })
          }
          row={row}
          handleToggleChange={HandleDelete}
          disabled={row?.isAdmin}
        />
      ),
    },
    {
      key: "actions",
      label: t("user.actions"),
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {/* View Details */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/user/${row._id}`)}
            title={t("user.viewDetails")}
            className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 border-slate-200 hover:border-indigo-600/40 hover:bg-indigo-50"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>

          {/* Edit User Details */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingUser(row)}
            title={t("user.editUser")}
            className="h-8 w-8 p-0 text-slate-600 hover:text-amber-600 border-slate-200 hover:border-amber-600/40 hover:bg-amber-50"
          >
            <Pencil className="h-3.5 w-3.5 text-amber-600" />
          </Button>

          {/* Approve pending member */}
          {!row.isAdmin && row.approval_status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              className={
                row.profile_completed
                  ? "h-8 w-8 p-0 text-slate-600 hover:text-emerald-600 border-slate-200 hover:border-emerald-600/40 hover:bg-emerald-50"
                  : "h-8 w-8 p-0 text-slate-300 border-slate-200 cursor-not-allowed"
              }
              onClick={() => handleApprove(row)}
              disabled={!row.profile_completed}
              title={
                row.profile_completed
                  ? t("user.approveUser")
                  : `${t("user.profileIncomplete")} — ${t("user.approveDisabledHint")}`
              }
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </Button>
          )}

          {/* Delete User Permanently */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDeletingUser(row)}
            disabled={isCurrentAdmin(row)}
            title={
              isCurrentAdmin(row)
                ? t("user.cannotDeleteSelf")
                : t("user.deletePermanently")
            }
            className="h-8 w-8 p-0 text-slate-600 hover:text-rose-600 border-slate-200 hover:border-rose-600/40 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  const approveUserMutation = useApiMutation(
    (id) => approveUser(id),
    {
      successMessage: t("user.userApproved"),
      onSuccess: () => {
        if (tableRef.current) {
          tableRef.current.refetchTable();
        }
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || t("user.approveFailed"));
      },
    }
  );

  const handleApprove = (u) => {
    if (!u?.profile_completed) {
      toast.error(t("user.approveDisabledHint"));
      return;
    }
    approveUserMutation.mutate(u._id);
  };

  const deleteUserMutation = useApiMutation(
    ({ id, data }) => toggleUserStatus(id, data),
    {
      successMessage: t("user.statusUpdated"),
      onSuccess: () => {
        if (tableRef.current) {
          tableRef.current.refetchTable();
        }
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || t("user.deleteFailed"));
      },
    }
  );

  const HandleDelete = (data, status) => {
    deleteUserMutation.mutate({
      id: data.id,
      data: {
        isActive: status,
      },
    });
  };

  const handleSelectionChange = (selectedRows) => {
    console.log("Selected users:", selectedRows);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("user.title")}</CardTitle>
          <CardDescription>{t("user.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ReusableTable
            routeType={`table-User`}
            ref={tableRef}
            headers={headers}
            apiPagination
            fetchData={getAllUsers}
            selectable={false}
            onSelectionChange={handleSelectionChange}
            DateRange={true}
            Search={true}
            statusFilter={true}
          />
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <EditUserModal
        open={Boolean(editingUser)}
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
        onSuccess={() => {
          if (tableRef.current) {
            tableRef.current.refetchTable();
          }
        }}
      />

      {/* Delete User Permanently Dialog */}
      <DeleteUserDialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        user={deletingUser}
        onSuccess={() => {
          if (tableRef.current) {
            tableRef.current.refetchTable();
          }
        }}
      />
    </>
  );
}
