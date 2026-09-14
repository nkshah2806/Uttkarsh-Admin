import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
export function ResetPasswordForm({ className, ...props }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const email = searchParams.get("email");
  const otp = searchParams.get("otp");
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("auth/verify-reset-password", {
        email,
        otp,
        password: data.password,
      });
      toast.success(t("auth.passwordUpdateSuccess"));
      navigate("/");
    } catch (error) {
      toast.error(t("auth.passwordUpdateFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center mb-5">
        <h1 className="text-3xl font-bold">{t("auth.resetPasswordTitle")}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t("auth.resetPasswordSubtitle")}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="password">{t("auth.newPassword")}</Label>
          <Input
            id="password"
            type="text"
            placeholder={t("auth.newPasswordPlaceholder")}
            {...register("password", { required: t("auth.newPasswordRequired") })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
      </div>
      <div className="text-center">
        <Button
          type="submit"
          className="w-full mb-2 transition-all duration-500"
          size="lg"
          disabled={loading}
        >
          {t("common.submit")}
        </Button>
      </div>
    </form>
  );
}
