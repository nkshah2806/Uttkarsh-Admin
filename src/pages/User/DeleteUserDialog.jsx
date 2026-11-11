import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { deleteUserPermanently } from "@/services/userService";
import { toast } from "sonner";

export default function DeleteUserDialog({ open, onOpenChange, user, onSuccess }) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const currentAdmin = (() => {
    try {
      return JSON.parse(localStorage.getItem("UserDetails") || "{}");
    } catch {
      return {};
    }
  })();

  const isSelf = String(user._id || user.id) === String(currentAdmin._id || currentAdmin.id);
  const fullName = user.fullName || user.name || user.email || "this user";

  const handleDelete = async () => {
    if (isSelf) {
      toast.error(t("user.cannotDeleteSelf"));
      return;
    }

    try {
      setDeleting(true);
      await deleteUserPermanently(user._id || user.id);
      toast.success(t("user.deleteSuccess") || "User permanently deleted successfully");
      if (onSuccess) onSuccess(user);
      onOpenChange(false);
    } catch (err) {
      console.error("Permanent delete error:", err);
      toast.error(err?.response?.data?.message || t("user.deleteFailed") || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-100 dark:bg-rose-950/60 rounded-xl text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t("user.deletePermanentTitle")}
              </DialogTitle>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                {t("user.deletePermanentWarning")}
              </p>
            </div>
          </div>

          <DialogDescription className="text-sm text-slate-600 dark:text-slate-300 pt-2 space-y-2">
            <span>
              {t("user.deletePermanentDesc", {
                name: fullName,
                email: user.email || "",
              })}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* User Card Snapshot */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">{t("user.fullName")}:</span>
            <span className="font-semibold">{fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">{t("user.email")}:</span>
            <span>{user.email || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">{t("user.mobileNumber")}:</span>
            <span>{user.mobileNumber || user.phoneNumber || "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-medium">{t("user.role")}:</span>
            <span className="uppercase font-semibold">{user.isAdmin ? t("user.admin") : t("user.member")}</span>
          </div>
        </div>

        {isSelf && (
          <p className="text-xs text-rose-600 font-semibold p-2 bg-rose-50 rounded border border-rose-200">
            ⚠️ {t("user.cannotDeleteSelf")}
          </p>
        )}

        <DialogFooter className="mt-4 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting || isSelf}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {t("user.deletePermanently")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
