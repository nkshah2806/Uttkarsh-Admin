import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserById, updateUser } from "@/services/userService";
import { memberApprovalService } from "@/services/memberApprovalService";
import { toast } from "sonner";
import {
  User,
  Shield,
  Store,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Building,
} from "lucide-react";

export default function EditUserModal({ open, onOpenChange, user, onSuccess }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("personal");
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    gender: "",
    age: "",
    birthDate: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    role: "FRANCHISE",
    approval_status: "pending",
    isActive: true,
    isVerified: false,
    password: "",
    // Franchise fields
    hasFranchiseProfile: false,
    member_id: "",
    distributor_id: "",
    franchise_code: "",
    franchise_type: "Standard Distributor",
    under_group: "General Group",
    branch_name: "",
    store_name: "",
    contact_person: "",
    district: "",
    area: "",
    account_name: "",
    bank_name: "",
    account_number: "",
    account_type: "Savings",
    ifsc_code: "",
    branch_address: "",
  });

  useEffect(() => {
    if (!open || !user?._id) return;

    setActiveTab("personal");
    setShowPassword(false);

    // Initial populate from row data
    const initialBirthDate = user.birthDate
      ? new Date(user.birthDate).toISOString().slice(0, 10)
      : "";

    setFormData((prev) => ({
      ...prev,
      fullName: user.fullName || user.name || "",
      email: user.email || "",
      mobileNumber: user.mobileNumber || user.phoneNumber || user.phone || "",
      gender: user.gender || "",
      age: user.age ? String(user.age) : "",
      birthDate: initialBirthDate,
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      pinCode: user.pinCode || "",
      role: user.isAdmin ? "ADMIN" : user.role || "FRANCHISE",
      approval_status: user.approval_status || (user.isAdmin ? "approved" : "pending"),
      isActive: user.isActive !== false,
      isVerified: Boolean(user.isVerified),
      password: "",
    }));

    // Fetch deep user & franchise details
    setLoadingInitial(true);
    Promise.all([
      getUserById(user._id).catch(() => null),
      memberApprovalService.getMemberProfileByUser(user._id).then((res) => res?.data || null).catch(() => null),
    ])
      .then(([freshUser, freshProfile]) => {
        if (freshUser) {
          const bd = freshUser.birthDate
            ? new Date(freshUser.birthDate).toISOString().slice(0, 10)
            : "";

          setFormData((prev) => ({
            ...prev,
            fullName: freshUser.fullName || freshUser.name || prev.fullName,
            email: freshUser.email || prev.email,
            mobileNumber: freshUser.mobileNumber || freshUser.phoneNumber || prev.mobileNumber,
            gender: freshUser.gender || prev.gender,
            age: freshUser.age ? String(freshUser.age) : prev.age,
            birthDate: bd || prev.birthDate,
            address: freshUser.address || prev.address,
            city: freshUser.city || prev.city,
            state: freshUser.state || prev.state,
            pinCode: freshUser.pinCode || prev.pinCode,
            role: freshUser.isAdmin ? "ADMIN" : freshUser.role || prev.role,
            approval_status: freshUser.approval_status || prev.approval_status,
            isActive: freshUser.isActive !== false,
            isVerified: Boolean(freshUser.isVerified),
          }));
        }

        if (freshProfile) {
          setFormData((prev) => ({
            ...prev,
            hasFranchiseProfile: true,
            member_id: freshProfile.member_id || "",
            distributor_id: freshProfile.distributor_id || "",
            franchise_code: freshProfile.franchise_code || "",
            franchise_type: freshProfile.franchise_type || "Standard Distributor",
            under_group: freshProfile.under_group || "General Group",
            branch_name: freshProfile.branch_name || "",
            store_name: freshProfile.store_name || "",
            contact_person: freshProfile.contact_person || "",
            district: freshProfile.district || "",
            area: freshProfile.area || "",
            account_name: freshProfile.account_name || "",
            bank_name: freshProfile.bank_name || "",
            account_number: freshProfile.account_number || "",
            account_type: freshProfile.account_type || "Savings",
            ifsc_code: freshProfile.ifsc_code || "",
            branch_address: freshProfile.branch_address || "",
          }));
        }
      })
      .finally(() => setLoadingInitial(false));
  }, [open, user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error(t("common.requiredAll") || "Full name is required");
      setActiveTab("personal");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      setActiveTab("personal");
      return;
    }

    if (formData.password && formData.password.trim().length < 6) {
      toast.error("Password must be at least 6 characters");
      setActiveTab("account");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        fullName: formData.fullName.trim(),
        name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.mobileNumber.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        gender: formData.gender,
        age: formData.age ? Number(formData.age) : null,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pinCode: formData.pinCode.trim(),
        role: formData.role,
        isAdmin: formData.role === "ADMIN",
        approval_status: formData.approval_status,
        isActive: formData.isActive,
        isVerified: formData.isVerified,
      };

      if (formData.password && formData.password.trim().length >= 6) {
        payload.password = formData.password.trim();
      }

      // If user has franchise profile, include franchise updates
      if (formData.hasFranchiseProfile || formData.role !== "ADMIN") {
        payload.franchiseProfile = {
          member_name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.mobileNumber.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pinCode.trim(),
          franchise_type: formData.franchise_type,
          under_group: formData.under_group,
          franchise_code: formData.franchise_code,
          branch_name: formData.branch_name,
          store_name: formData.store_name,
          contact_person: formData.contact_person,
          district: formData.district,
          area: formData.area,
          account_name: formData.account_name,
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          account_type: formData.account_type,
          ifsc_code: formData.ifsc_code ? formData.ifsc_code.toUpperCase() : "",
          branch_address: formData.branch_address,
        };
      }

      const res = await updateUser(user._id, payload);

      toast.success(t("user.userUpdated") || "User details updated successfully");
      if (onSuccess) onSuccess(res?.data || res?.user || payload);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to update user:", err);
      toast.error(err?.response?.data?.message || t("user.updateFailed") || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            {t("user.editUserTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("user.editUserDesc")}
          </DialogDescription>
        </DialogHeader>

        {loadingInitial ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm text-muted-foreground">{t("user.loading")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="px-6 pt-3 pb-2 border-b bg-slate-50/50 dark:bg-slate-900/40">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="personal" className="gap-2 text-xs">
                    <User className="w-3.5 h-3.5" />
                    <span>{t("user.tabPersonal")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="account" className="gap-2 text-xs">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{t("user.tabAccount")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="franchise" className="gap-2 text-xs">
                    <Store className="w-3.5 h-3.5" />
                    <span>{t("user.tabFranchise")}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* ========================================================= */}
                {/* TAB 1: PERSONAL DETAILS */}
                {/* ========================================================= */}
                <TabsContent value="personal" className="space-y-4 m-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-xs font-semibold">
                        {t("user.fullName")} <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold">
                        {t("user.email")} <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="mobileNumber" className="text-xs font-semibold">
                        {t("user.mobileNumber")} <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={(e) => handleChange("mobileNumber", e.target.value)}
                        placeholder="9876543210"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="gender" className="text-xs font-semibold">
                        {t("user.gender")}
                      </Label>
                      <Select
                        value={formData.gender || "none"}
                        onValueChange={(val) => handleChange("gender", val === "none" ? "" : val)}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Select Gender --</SelectItem>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="age" className="text-xs font-semibold">
                        {t("user.age")}
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        min="0"
                        max="120"
                        value={formData.age}
                        onChange={(e) => handleChange("age", e.target.value)}
                        placeholder="30"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="birthDate" className="text-xs font-semibold">
                      {t("user.birthDate")}
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleChange("birthDate", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-semibold">
                      {t("user.address")}
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="123 Main St, Apartment 4B"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-xs font-semibold">
                        {t("user.city")}
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="Ahmedabad"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="state" className="text-xs font-semibold">
                        {t("user.state")}
                      </Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        placeholder="Gujarat"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pinCode" className="text-xs font-semibold">
                        {t("user.pinCode")}
                      </Label>
                      <Input
                        id="pinCode"
                        value={formData.pinCode}
                        onChange={(e) => handleChange("pinCode", e.target.value)}
                        placeholder="380001"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* ========================================================= */}
                {/* TAB 2: ACCOUNT & SECURITY */}
                {/* ========================================================= */}
                <TabsContent value="account" className="space-y-5 m-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="role" className="text-xs font-semibold">
                        {t("user.role")}
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={(val) => {
                          handleChange("role", val);
                          if (val === "ADMIN") {
                            handleChange("approval_status", "approved");
                          }
                        }}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FRANCHISE">{t("user.franchiseMember")}</SelectItem>
                          <SelectItem value="ADMIN">{t("user.admin")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="approval_status" className="text-xs font-semibold">
                        {t("user.approvalStatus")}
                      </Label>
                      <Select
                        value={formData.approval_status}
                        onValueChange={(val) => handleChange("approval_status", val)}
                        disabled={formData.role === "ADMIN"}
                      >
                        <SelectTrigger id="approval_status">
                          <SelectValue placeholder="Approval Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{t("user.pending")}</SelectItem>
                          <SelectItem value="approved">{t("user.approved")}</SelectItem>
                          <SelectItem value="rejected">{t("user.rejected")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border bg-slate-50/60 dark:bg-slate-900/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-semibold">{t("user.status")}</Label>
                        <p className="text-xs text-muted-foreground">
                          {formData.isActive ? t("user.active") : t("user.inactive")}
                        </p>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleChange("isActive", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-semibold">{t("user.verified")}</Label>
                        <p className="text-xs text-muted-foreground">
                          {formData.isVerified ? t("user.yes") : t("user.no")}
                        </p>
                      </div>
                      <Switch
                        checked={formData.isVerified}
                        onCheckedChange={(checked) => handleChange("isVerified", checked)}
                      />
                    </div>
                  </div>

                  {/* Reset Password */}
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                    <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Change / Reset Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        placeholder={t("user.newPasswordHint")}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("user.newPasswordHint")}
                    </p>
                  </div>
                </TabsContent>

                {/* ========================================================= */}
                {/* TAB 3: FRANCHISE DETAILS */}
                {/* ========================================================= */}
                <TabsContent value="franchise" className="space-y-4 m-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">{t("user.franchiseType")}</Label>
                      <Select
                        value={formData.franchise_type}
                        onValueChange={(val) => handleChange("franchise_type", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Franchise Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="District Franchise">District Franchise</SelectItem>
                          <SelectItem value="State Franchise">State Franchise</SelectItem>
                          <SelectItem value="Panchayat Franchise">Panchayat Franchise</SelectItem>
                          <SelectItem value="Store Partner">Store Partner</SelectItem>
                          <SelectItem value="Standard Distributor">Standard Distributor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">{t("user.underGroup")}</Label>
                      <Select
                        value={formData.under_group}
                        onValueChange={(val) => handleChange("under_group", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General Group">General Group</SelectItem>
                          <SelectItem value="Group A">Group A</SelectItem>
                          <SelectItem value="Group B">Group B</SelectItem>
                          <SelectItem value="Group C">Group C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="branchName" className="text-xs font-semibold">{t("user.branchName")}</Label>
                      <Input
                        id="branchName"
                        value={formData.branch_name}
                        onChange={(e) => handleChange("branch_name", e.target.value)}
                        placeholder="West Branch"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="storeName" className="text-xs font-semibold">{t("user.storeName")}</Label>
                      <Input
                        id="storeName"
                        value={formData.store_name}
                        onChange={(e) => handleChange("store_name", e.target.value)}
                        placeholder="Utkarsh Health Store"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="contactPerson" className="text-xs font-semibold">{t("user.contactPerson")}</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contact_person}
                        onChange={(e) => handleChange("contact_person", e.target.value)}
                        placeholder="Contact Person"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="district" className="text-xs font-semibold">{t("user.district")}</Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => handleChange("district", e.target.value)}
                        placeholder="District"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="area" className="text-xs font-semibold">{t("user.area")}</Label>
                      <Input
                        id="area"
                        value={formData.area}
                        onChange={(e) => handleChange("area", e.target.value)}
                        placeholder="Area / Locality"
                      />
                    </div>
                  </div>

                  {/* Bank Details section */}
                  <div className="pt-2 border-t space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      Bank Account Details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="bankName" className="text-xs font-semibold">{t("user.bank")}</Label>
                        <Input
                          id="bankName"
                          value={formData.bank_name}
                          onChange={(e) => handleChange("bank_name", e.target.value)}
                          placeholder="State Bank of India"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="accountName" className="text-xs font-semibold">{t("user.accountHolder")}</Label>
                        <Input
                          id="accountName"
                          value={formData.account_name}
                          onChange={(e) => handleChange("account_name", e.target.value)}
                          placeholder="Account Holder Name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="accountNumber" className="text-xs font-semibold">{t("user.accountNo")}</Label>
                        <Input
                          id="accountNumber"
                          value={formData.account_number}
                          onChange={(e) => handleChange("account_number", e.target.value)}
                          placeholder="123456789012"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">{t("user.accountType")}</Label>
                        <Select
                          value={formData.account_type}
                          onValueChange={(val) => handleChange("account_type", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Account Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Savings">Savings</SelectItem>
                            <SelectItem value="Current">Current</SelectItem>
                            <SelectItem value="Salary">Salary</SelectItem>
                            <SelectItem value="NRE/NRO">NRE/NRO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="ifscCode" className="text-xs font-semibold">{t("user.ifsc")}</Label>
                        <Input
                          id="ifscCode"
                          value={formData.ifsc_code}
                          onChange={(e) => handleChange("ifsc_code", e.target.value.toUpperCase())}
                          placeholder="SBIN0001234"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="branchAddress" className="text-xs font-semibold">{t("user.branchAddress")}</Label>
                      <Input
                        id="branchAddress"
                        value={formData.branch_address}
                        onChange={(e) => handleChange("branch_address", e.target.value)}
                        placeholder="Bank Branch Address"
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>

              <DialogFooter className="px-6 py-3 border-t bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("common.saving")}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {t("user.saveChanges") || "Save Changes"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </Tabs>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
