import React, { useRef } from "react";
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
import { Eye, CheckCircle2, Clock } from "lucide-react";
import DeleteDialog from "@/components/DeleteDialog";
import user from "../../assets/user.png";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import LocalizedText from "@/components/LocalizedText";

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
        <div className="flex gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/user/${row._id}`)} title={t("user.viewDetails")}
            className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 border-indigo-600/40 hover:bg-indigo-50"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {!row.isAdmin && row.approval_status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 border-indigo-600/40 hover:bg-indigo-50"
              onClick={() => handleApprove(row)}
              title={t("user.approveUser")}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
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

  const handleApprove = (user) => {
    approveUserMutation.mutate(user._id);
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
  );
}
