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
import { useLanguage } from "@/context/LanguageContext";

const ApprovalBadge = ({ status, t }) => {
  if (status === "approved") {
    return (
      <Badge variant="completed" className="capitalize">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {t("approved")}
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge variant="destructive" className="capitalize">
        {t("rejected")}
      </Badge>
    );
  }
  return (
    <Badge variant="confirmed" className="capitalize">
      <Clock className="w-3.5 h-3.5" />
      {t("statusPending")}
    </Badge>
  );
};

export default function User() {
  const navigate = useNavigate();
  const tableRef = useRef();
  const { t } = useLanguage();

  const headers = [
    {
      key: "sNo",
      label: t("sNo"),
      filterable: false,
    },
    {
      key: "profileUrl",
      label: t("profile"),
      filterable: false,
      render: (row) => (
        <img
          className="w-10 h-10 rounded-full object-cover flex-none"
          src={row.profileUrl}
          alt={`${row.fullName} ${t("profile")}`}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = user;
          }}
        />
      ),
    },
    {
      key: "name",
      label: t("fullName"),
      filterable: true,
    },
    { key: "email", label: t("email"), filterable: true },
    { key: "phoneNumber", label: t("phoneNumber"), filterable: true },
    {
      key: "role",
      label: t("adminOrUser"),
      filterable: true,
      render: (row) => (
        <Badge variant={row.isAdmin ? "destructive" : "default"} className="capitalize min-w-auto">
          {row.isAdmin ? t("admin") : t("member")}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: t("registrationDate"),
      filterable: true,
    },
    {
      key: "approvalStatus",
      label: t("approvalStatus"),
      filterable: false,
      render: (row) => <ApprovalBadge status={row.approval_status} t={t} />,
    },
    {
      key: "isActive",
      label: t("isActive"),
      filterable: true,
      render: (row) => (
        <DeleteDialog
          title={row.isActive ? t("inactiveUserConfirm") : t("activeUserConfirm")}
          des={(row.isActive ? t("deactivateUserConfirm") : t("activateUserConfirm")).replace(
            "{name}",
            row.fullName
          )}
          row={row}
          handleToggleChange={HandleDelete}
          disabled={row?.isAdmin}
        />
      ),
    },
    {
      key: "actions",
      label: t("actions"),
      render: (row) => (
        <div className="flex gap-3">
          <Button onClick={() => navigate(`/user/${row._id}`)} title={t("viewDetails")}>
            <Eye />
          </Button>
          {!row.isAdmin && row.approval_status === "pending" && (
            <Button
              variant="outline"
              className="text-emerald-600 border-emerald-600/40 hover:bg-emerald-50"
              onClick={() => handleApprove(row)}
              title={t("approveUser")}
            >
              <CheckCircle2 className="size-5" strokeWidth={1.5} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const approveUserMutation = useApiMutation(
    (id) => approveUser(id),
    {
      successMessage: t("userApproved"),
      onSuccess: () => {
        if (tableRef.current) {
          tableRef.current.refetchTable();
        }
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || t("failedApproveUser"));
      },
    }
  );

  const handleApprove = (user) => {
    approveUserMutation.mutate(user._id);
  };

  const deleteUserMutation = useApiMutation(
    ({ id, data }) => toggleUserStatus(id, data),
    {
      successMessage: t("statusUpdated"),
      onSuccess: () => {
        if (tableRef.current) {
          tableRef.current.refetchTable();
        }
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || t("failedDeleteUser"));
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
        <CardTitle>{t("listOfUsers")}</CardTitle>
        <CardDescription>{t("allUserInfo")}</CardDescription>
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
