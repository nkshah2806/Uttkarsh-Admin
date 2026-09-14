import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { MoveLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
export function ForgetPasswordForm({ className, ...props }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const onSubmit = async (data) => {
    try {
      // debugger
      setLoading(true);
      const response = await axiosInstance.post("auth/forget-password", {
        email: data.email,
        isWebsite: true,
      });
      toast.success(t("auth.emailSentSuccess"));
      navigate("/");
    } catch (error) {
      toast.error(t("auth.emailSentFailed"));
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
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold">{t("auth.forgetPasswordTitle")}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {t("auth.forgetPasswordSubtitle")}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            {...register("email", { required: t("auth.emailRequired") })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="w-full text-center">
        <Button
          type="submit"
          className="w-full mb-3"
          size="lg"
          disabled={loading}
        >
          {t("auth.sendMail")}
        </Button>
        <Link
          to="/"
          className="text-[14px] font-medium flex items-center justify-center gap-2 hover:text-gray-500 duration-300 transition-all"
        >
          <MoveLeft />
          {t("auth.backToLogin")}
        </Link>
      </div>
    </form>
  );
}
