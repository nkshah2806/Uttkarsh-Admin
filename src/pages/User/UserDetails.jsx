import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById, getMemberPortalPassword } from "@/services/userService";
import { memberApprovalService } from "@/services/memberApprovalService";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import user from "../../assets/user.png";
import { Config } from "@/lib/Config";
import {
    CheckCircle2,
    Clock,
    XCircle,
    ArrowLeft,
    Eye,
    EyeOff,
    Copy,
    Check,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { LANGUAGE_NAMES } from "@/i18n";

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
                <XCircle className="w-3.5 h-3.5" />
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

const DetailRow = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 items-center py-1.5 border-b border-dashed last:border-0">
        <p className="text-muted-foreground font-medium text-sm">{label}</p>
        <p className="col-span-2 text-sm break-words">{value || "-"}</p>
    </div>
);

const SectionCard = ({ title, icon: Icon, children }) => (
    <Card className="shadow-md">
        <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
    </Card>
);

const formatDateTime = (value) => {
    if (!value) return null;
    try {
        return format(new Date(value), "dd MMM yyyy, hh:mm a");
    } catch {
        return value;
    }
};

export default function UserDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { t } = useLanguage();
    const [userDetails, setUserDetails] = useState(null);
    const [franchiseProfile, setFranchiseProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [portalPassword, setPortalPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordCopied, setPasswordCopied] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setLoadError("");
        Promise.all([
            getUserById(id).catch((err) => {
                throw new Error(err?.response?.data?.message || t("failedFetchUser"));
            }),
            // Franchise profile may not exist yet — that's expected, don't treat as fatal.
            memberApprovalService
                .getMemberProfileByUser(id)
                .then((res) => res?.data || null)
                .catch(() => null),
            // Member portal password — only meaningful for franchise members.
            // Failing here is non-fatal (older records have no recoverable password).
            getMemberPortalPassword(id)
                .then((res) => res?.password || "")
                .catch(() => ""),
        ])
            .then(([userData, franchiseData, password]) => {
                setUserDetails(userData);
                setFranchiseProfile(franchiseData);
                setPortalPassword(password);
            })
            .catch((err) => {
                setLoadError(err?.message || t("failedFetchUser"));
            })
            .finally(() => setLoading(false));
    }, [id, t]);

    const handleCopyPassword = async () => {
        if (!portalPassword) return;
        try {
            await navigator.clipboard.writeText(portalPassword);
            setPasswordCopied(true);
            setTimeout(() => setPasswordCopied(false), 2000);
        } catch {
            // Clipboard unavailable — ignore silently.
        }
    };

    if (loading) return <div className="text-center py-10">{t("loading")}</div>;

    if (loadError) {
        return (
            <div className="text-center py-10 space-y-4">
                <p className="text-muted-foreground">{loadError}</p>
                <Button onClick={() => navigate(-1)} variant="outline">
                    {t("back")}
                </Button>
            </div>
        );
    }

    if (!userDetails) {
        return (
            <div className="text-center py-10 space-y-4">
                <p className="text-muted-foreground">{t("failedFetchUser")}</p>
                <Button onClick={() => navigate(-1)} variant="outline">
                    {t("back")}
                </Button>
            </div>
        );
    }

    const fullName =
        userDetails.fullName ||
        [userDetails.firstname, userDetails.lastname].filter(Boolean).join(" ") ||
        userDetails.email;
    const approvalStatus =
        userDetails.approval_status ||
        (userDetails.isAdmin ? "approved" : "pending");
    const languagePref =
        userDetails.language_pref &&
            LANGUAGE_NAMES[userDetails.language_pref]
            ? LANGUAGE_NAMES[userDetails.language_pref]
            : userDetails.language_pref || "-";

    // Normalize franchise fields (model uses snake_case).
    const fp = franchiseProfile || {};

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t("userDetails")}</h1>
                <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("back")}
                </Button>
            </div>

            <div className="grid grid-cols-12 gap-4">
                {/* Left Sidebar */}
                <div className="col-span-12 md:col-span-4 space-y-4">
                    <Card className="shadow-xl">
                        <CardHeader className="flex flex-col items-center text-center gap-4">
                            <img
                                className="w-24 h-24 rounded-full object-cover flex-none"
                                src={
                                    userDetails.image
                                        ? `${Config.API_URL}${userDetails.image}`
                                        : user
                                }
                                alt={`${fullName} ${t("profile")}`}
                                onError={({ currentTarget }) => {
                                    currentTarget.onerror = null;
                                    currentTarget.src = user;
                                }}
                            />

                            <div>
                                <CardTitle className="text-2xl font-bold">{fullName}</CardTitle>
                                <div className="flex flex-wrap gap-2 justify-center mt-4">
                                    {userDetails.isAdmin && <Badge variant="destructive">{t("admin")}</Badge>}
                                    {!userDetails.isAdmin && <Badge variant="outline">{t("franchiseMember")}</Badge>}
                                    <ApprovalBadge status={approvalStatus} t={t} />
                                    {userDetails.isVerified ? (
                                        <Badge variant="completed">{t("verified")}</Badge>
                                    ) : (
                                        <Badge variant="secondary">{t("notVerified")}</Badge>
                                    )}
                                    {userDetails.isActive ? (
                                        <Badge variant="completed">{t("active")}</Badge>
                                    ) : (
                                        <Badge variant="secondary">{t("inactive")}</Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Right Content */}
                <div className="col-span-12 md:col-span-8 space-y-4">
                    {/* Personal Information */}
                    <SectionCard title={t("personalInfo")} icon={() => <span>👤</span>}>
                        <DetailRow label={t("fullName")} value={fullName} />
                        <DetailRow label={t("email")} value={userDetails.email} />
                        <DetailRow
                            label={t("mobileNumber")}
                            value={userDetails.mobileNumber || userDetails.phoneNumber}
                        />
                        <DetailRow label={t("gender")} value={userDetails.gender} />
                        <DetailRow label={t("age")} value={userDetails.age} />
                        <DetailRow label={t("birthDate")} value={formatDateTime(userDetails.birthDate)} />
                        <DetailRow label={t("address")} value={userDetails.address} />
                        <DetailRow label={t("city")} value={userDetails.city} />
                        <DetailRow label={t("state")} value={userDetails.state} />
                        <DetailRow label={t("pinCode")} value={userDetails.pinCode} />
                    </SectionCard>

                    {/* Account Information */}
                    <SectionCard title={t("accountInfo")} icon={() => <span>⚙️</span>}>
                        <DetailRow
                            label={t("adminOrUser")}
                            value={
                                userDetails.isAdmin
                                    ? t("admin")
                                    : t("franchiseMember")
                            }
                        />
                        <DetailRow
                            label={t("approvalStatus")}
                            value={
                                <ApprovalBadge status={approvalStatus} t={t} />
                            }
                        />
                        <DetailRow
                            label={t("accountStatus")}
                            value={
                                userDetails.isActive ? (
                                    <Badge variant="completed">{t("active")}</Badge>
                                ) : (
                                    <Badge variant="secondary">{t("inactive")}</Badge>
                                )
                            }
                        />
                        <DetailRow
                            label={t("verified")}
                            value={
                                userDetails.isVerified ? (
                                    <Badge variant="completed">{t("yes")}</Badge>
                                ) : (
                                    <Badge variant="secondary">{t("no")}</Badge>
                                )
                            }
                        />
                        <DetailRow label={t("username")} value={userDetails.username} />
                        <DetailRow label={t("languagePreference")} value={languagePref} />
                        <DetailRow label={t("registrationDate")} value={formatDateTime(userDetails.createdAt)} />
                        <DetailRow label={t("updatedAt")} value={formatDateTime(userDetails.updatedAt)} />

                        {/* Member Portal Password — admin can view the plaintext
                            (only recoverable for passwords set after this feature
                            was deployed). */}
                        {!userDetails.isAdmin && (
                            <div className="grid grid-cols-3 gap-4 items-center py-1.5 border-b border-dashed last:border-0">
                                <p className="text-muted-foreground font-medium text-sm">
                                    {t("memberPortalPassword")}
                                </p>
                                <div className="col-span-2 flex items-center gap-2">
                                    {portalPassword ? (
                                        <>
                                            <span className="font-mono text-sm break-all">
                                                {passwordVisible ? portalPassword : "••••••••"}
                                            </span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 flex-none"
                                                onClick={() => setPasswordVisible((v) => !v)}
                                                title={passwordVisible ? t("hidePassword") : t("showPassword")}
                                            >
                                                {passwordVisible ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 flex-none"
                                                onClick={handleCopyPassword}
                                                title={t("copyPassword")}
                                            >
                                                {passwordCopied ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">
                                            {t("passwordNotAvailable")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </SectionCard>

                    {/* Franchise Information */}
                    <SectionCard title={t("franchiseInfo")} icon={() => <span>🏪</span>}>
                        {franchiseProfile ? (
                            <>
                                <DetailRow label={t("memberId")} value={fp.member_id} />
                                <DetailRow label={t("distributorId")} value={fp.distributor_id} />
                                <DetailRow label={t("franchiseCode")} value={fp.franchise_code} />
                                <DetailRow label={t("franchiseType")} value={fp.franchise_type} />
                                <DetailRow label={t("underGroup")} value={fp.under_group} />
                                <DetailRow label={t("memberName")} value={fp.member_name} />
                                <DetailRow label={t("branchName")} value={fp.branch_name} />
                                <DetailRow label={t("storeName")} value={fp.store_name} />
                                <DetailRow label={t("contactPerson")} value={fp.contact_person} />
                                <DetailRow label={t("phone")} value={fp.phone} />
                                <DetailRow label={t("email")} value={fp.email} />
                                <DetailRow label={t("address")} value={fp.address} />
                                <DetailRow label={t("state")} value={fp.state} />
                                <DetailRow label={t("city")} value={fp.city} />
                                <DetailRow label={t("district")} value={fp.district} />
                                <DetailRow label={t("area")} value={fp.area} />
                                <DetailRow label={t("pinCode")} value={fp.pincode} />
                                <DetailRow label={t("accountHolder")} value={fp.account_name} />
                                <DetailRow label={t("bank")} value={fp.bank_name} />
                                <DetailRow label={t("accountNo")} value={fp.account_number} />
                                <DetailRow label={t("accountType")} value={fp.account_type} />
                                <DetailRow label={t("ifsc")} value={fp.ifsc_code} />
                                <DetailRow label={t("branchAddress")} value={fp.branch_address} />
                                <DetailRow
                                    label={t("profileCompletion")}
                                    value={`${fp.completion_percentage ?? 0}%`}
                                />
                                <DetailRow
                                    label={t("submittedForApproval")}
                                    value={
                                        fp.submitted_for_approval ? (
                                            <Badge variant="completed">{t("yes")}</Badge>
                                        ) : (
                                            <Badge variant="secondary">{t("no")}</Badge>
                                        )
                                    }
                                />
                                <DetailRow label={t("submissionDate")} value={formatDateTime(fp.submitted_at)} />
                                <DetailRow label={t("reviewedBy")} value={fp.reviewed_by} />
                                <DetailRow label={t("reviewedAt")} value={formatDateTime(fp.reviewed_at)} />
                                {fp.rejection_reason && (
                                    <DetailRow label={t("rejectionReason")} value={fp.rejection_reason} />
                                )}
                            </>
                        ) : (
                            <p className="text-muted-foreground text-sm py-4">
                                {t("noFranchiseProfile")}
                            </p>
                        )}
                    </SectionCard>

                    {/* Other Information */}
                    <SectionCard title={t("otherInfo")} icon={() => <span>ℹ️</span>}>
                        <DetailRow label={t("deviceId")} value={userDetails.deviceId} />
                        <DetailRow label={t("deviceName")} value={userDetails.deviceName} />
                        <DetailRow label={t("fcmToken")} value={userDetails.fcmToken} />
                        <DetailRow label={t("franchiseId")} value={userDetails.franchise_id} />
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}
