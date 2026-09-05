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

const ApprovalBadge = ({ status }) => {
  if (status === "approved") {
    return (
      <Badge variant="completed" className="capitalize">
        <CheckCircle2 className="w-4 h-4" />
        Approved
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge variant="destructive" className="capitalize">
        Rejected
      </Badge>
    );
  }
  return (
    <Badge variant="confirmed" className="capitalize">
      <Clock className="w-4 h-4" />
      Pending
    </Badge>
  );
};

export default function User() {
  const navigate = useNavigate();
  const tableRef = useRef();

  const headers = [
    {
      key: "sNo",
      label: "S. No.",
      filterable: false,
    },
    {
      key: "profileUrl",
      label: "Profile",
      filterable: false,
      render: (row) => (
        <img
          className="w-10 h-10 rounded-full object-cover flex-none"
          src={row.profileUrl}
          alt={`${row.fullName} Profile`}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = user;
          }}
        />
      ),
    },
    {
      key: "name",
      label: "Full Name",
      filterable: true,
    },
    {
      key: "role",
      label: "Admin/User",
      filterable: true,
      render: (row) => (
        <Badge variant={row.isAdmin ? "destructive" : "default"} className="capitalize min-w-auto">
          {row.isAdmin ? "Admin" : "Member"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Registration Date",
      filterable: true,
    },
    {
      key: "profileCompletion",
      label: "Profile Completion",
      filterable: false,
      render: (row) => (
        <Badge variant={row.profile_completed ? "completed" : "destructive"} className="capitalize">
          {row.profile_completed ? "Completed" : "Incomplete"}
        </Badge>
      ),
    },
    {
      key: "approvalStatus",
      label: "Approval Status",
      filterable: false,
      render: (row) => <ApprovalBadge status={row.approval_status} />,
    },
    {
      key: "isActive",
      label: "Status",
      filterable: true,
      render: (row) => (
        <DeleteDialog
          title={row.isActive ? "Inactive User?" : "Active User?"}
          des={(row.isActive ? "Are you sure you want to deactivate {name}?" : "Are you sure you want to activate {name}?").replace(
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
      label: "Actions",
      render: (row) => (
        <div className="flex gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/user/${row._id}`)} title="View Details"
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
              title="Approve User"
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
      successMessage: "User approved successfully",
      onSuccess: () => {
        if (tableRef.current) {
          tableRef.current.refetchTable();
        }
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to approve user");
      },
    }
  );

  const handleApprove = (user) => {
    approveUserMutation.mutate(user._id);
  };

  const deleteUserMutation = useApiMutation(
    ({ id, data }) => toggleUserStatus(id, data),
    {
      successMessage: "Status updated successfully",
      onSuccess: () => {
        if (tableRef.current) {
          tableRef.current.refetchTable();
        }
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Failed to delete user");
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
        <CardTitle>List of Users</CardTitle>
        <CardDescription>All user information below.</CardDescription>
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
