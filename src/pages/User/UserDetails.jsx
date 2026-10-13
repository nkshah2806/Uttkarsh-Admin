import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById, getMemberPortalPassword } from "@/services/userService";
import { ProfileSkeleton, ErrorState } from "@/components/ui/skeleton-loaders";
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
import { useTranslation } from "react-i18next";
import LocalizedText from "@/components/LocalizedText";

const ApprovalBadge = ({ status }) => {
    const { t } = useTranslation();
    if (status === "approved") {
        return (
            <Badge variant="completed" className="capitalize">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t("user.approved")}
            </Badge>
        );
    }
    if (status === "rejected") {
        return (
            <Badge variant="destructive" className="capitalize">
                <XCircle className="w-3.5 h-3.5" />
                {t("user.rejected")}
            </Badge>
        );
    }
    return (
        <Badge variant="confirmed" className="capitalize">
            <Clock className="w-3.5 h-3.5" />
            {t("user.pending")}
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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
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
                throw new Error(err?.response?.data?.message || "Failed to fetch user details.");
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
                setLoadError(err?.message || "Failed to fetch user details.");
            })
            .finally(() => setLoading(false));
    }, [id]);

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

    if (loading) return <ProfileSkeleton />;

    if (loadError) {
        return (
            <div className="text-center py-10 space-y-4">
                <p className="text-muted-foreground">{loadError}</p>
                <Button onClick={() => navigate(-1)} variant="outline">
                    {t("user.back")}
                </Button>
            </div>
        );
    }

    if (!userDetails) {
        return (
            <div className="text-center py-10 space-y-4">
                <p className="text-muted-foreground">{t("user.fetchFailed")}</p>
                <Button onClick={() => navigate(-1)} variant="outline">
                    {t("user.back")}
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

    // Normalize franchise fields (model uses snake_case).
    const fp = franchiseProfile || {};

    // Profile picture resolution order: the member-profile document is the
    // primary source, with the User record as a fallback for older records
    // captured before the member profile picture existed.
    const memberPicture = fp.profile_picture || userDetails.image || "";
    const memberPictureSrc = memberPicture
        ? `${Config.API_URL}${memberPicture}`
        : user;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t("user.detailsTitle")}</h1>
                <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t("user.back")}
                </Button>
            </div>

            <div className="grid grid-cols-12 gap-4">
                {/* Left Sidebar */}
                <div className="col-span-12 md:col-span-4 space-y-4">
                    <Card className="shadow-xl">
                        <CardHeader className="flex flex-col items-center text-center gap-4">
                            <img
                                className="w-24 h-24 rounded-full object-cover flex-none"
                                src={memberPictureSrc}
                                alt={t("user.profileAlt", { name: fullName })}
                                onError={({ currentTarget }) => {
                                    currentTarget.onerror = null;
                                    currentTarget.src = user;
                                }}
                            />

                            <div>
                                <CardTitle className="text-2xl font-bold">{fullName}</CardTitle>
                                <div className="flex flex-wrap gap-2 justify-center mt-4">
                                    {userDetails.isAdmin && <Badge variant="destructive">{t("user.admin")}</Badge>}
                                    {!userDetails.isAdmin && <Badge variant="outline">{t("user.franchiseMember")}</Badge>}
                                    <ApprovalBadge status={approvalStatus} />
                                    {userDetails.isVerified ? (
                                        <Badge variant="completed">{t("user.verified")}</Badge>
                                    ) : (
                                        <Badge variant="secondary">{t("user.notVerified")}</Badge>
                                    )}
                                    {userDetails.isActive ? (
                                        <Badge variant="completed">{t("user.active")}</Badge>
                                    ) : (
                                        <Badge variant="secondary">{t("user.inactive")}</Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Right Content */}
                <div className="col-span-12 md:col-span-8 space-y-4">
                    {/* Personal Information */}
                    <SectionCard title={t("user.personalInfo")} icon={() => <span>👤</span>}>
                        <DetailRow label={t("user.fullName")} value={<LocalizedText value={fullName} fallback="-" />} />
                        <DetailRow label={t("user.email")} value={userDetails.email} />
                        <DetailRow
                            label={t("user.mobileNumber")}
                            value={userDetails.mobileNumber || userDetails.phoneNumber}
                        />
                        <DetailRow label={t("user.gender")} value={<LocalizedText value={userDetails.gender} fallback="-" />} />
                        <DetailRow label={t("user.age")} value={userDetails.age} />
                        <DetailRow label={t("user.birthDate")} value={formatDateTime(userDetails.birthDate)} />
                        <DetailRow label={t("user.address")} value={userDetails.address} />
                        <DetailRow label={t("user.city")} value={userDetails.city} />
                        <DetailRow label={t("user.state")} value={userDetails.state} />
                        <DetailRow label={t("user.pinCode")} value={userDetails.pinCode} />
                    </SectionCard>

                    {/* Account Information */}
                    <SectionCard title={t("user.accountInformation")} icon={() => <span>⚙️</span>}>
                        <DetailRow
                            label={t("user.adminOrUser")}
                            value={
                                userDetails.isAdmin
                                    ? t("user.admin")
                                    : t("user.franchiseMember")
                            }
                        />
                        <DetailRow
                            label={t("user.approvalStatus")}
                            value={
                                <ApprovalBadge status={approvalStatus} />
                            }
                        />
                        <DetailRow
                            label={t("user.accountStatus")}
                            value={
                                userDetails.isActive ? (
                                    <Badge variant="completed">{t("user.active")}</Badge>
                                ) : (
                                    <Badge variant="secondary">{t("user.inactive")}</Badge>
                                )
                            }
                        />
                        <DetailRow
                            label={t("user.verified")}
                            value={
                                userDetails.isVerified ? (
                                    <Badge variant="completed">{t("user.yes")}</Badge>
                                ) : (
                                    <Badge variant="secondary">{t("user.no")}</Badge>
                                )
                            }
                        />
                        <DetailRow label={t("user.username")} value={userDetails.username} />
                        <DetailRow label={t("user.registrationDate")} value={formatDateTime(userDetails.createdAt)} />
                        <DetailRow label={t("user.updatedAt")} value={formatDateTime(userDetails.updatedAt)} />

                        {/* Member Portal Password — admin can view the plaintext
                            (only recoverable for passwords set after this feature
                            was deployed). */}
                        {!userDetails.isAdmin && (
                            <div className="grid grid-cols-3 gap-4 items-center py-1.5 border-b border-dashed last:border-0">
                                <p className="text-muted-foreground font-medium text-sm">
                                    {t("user.memberPortalPassword")}
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
                                                title={passwordVisible ? t("user.hidePassword") : t("user.showPassword")}
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
                                                title={t("user.copyPassword")}
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
                                            {t("user.passwordNotAvailable")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </SectionCard>

                    {/* Franchise Information */}
                    <SectionCard title={t("user.franchiseInformation")} icon={() => <span>🏪</span>}>
                        {franchiseProfile ? (
                            <>
                                <DetailRow label={t("user.memberId")} value={fp.member_id} />
                                <DetailRow label={t("user.distributorId")} value={fp.distributor_id} />
                                <DetailRow label={t("user.franchiseCode")} value={fp.franchise_code} />
                                <DetailRow label={t("user.franchiseType")} value={fp.franchise_type} />
                                <DetailRow label={t("user.underGroup")} value={fp.under_group} />
                                <DetailRow label={t("user.memberName")} value={<LocalizedText value={fp.member_name} fallback="-" />} />
                                <DetailRow label={t("user.branchName")} value={<LocalizedText value={fp.branch_name} fallback="-" />} />
                                <DetailRow label={t("user.storeName")} value={<LocalizedText value={fp.store_name} fallback="-" />} />
                                <DetailRow label={t("user.contactPerson")} value={<LocalizedText value={fp.contact_person} fallback="-" />} />
                                <DetailRow label={t("user.phone")} value={fp.phone} />
                                <DetailRow label={t("user.email")} value={fp.email} />
                                <DetailRow label={t("user.address")} value={<LocalizedText value={fp.address} fallback="-" />} />
                                <DetailRow label={t("user.state")} value={<LocalizedText value={fp.state} fallback="-" />} />
                                <DetailRow label={t("user.city")} value={<LocalizedText value={fp.city} fallback="-" />} />
                                <DetailRow label={t("user.district")} value={<LocalizedText value={fp.district} fallback="-" />} />
                                <DetailRow label={t("user.area")} value={<LocalizedText value={fp.area} fallback="-" />} />
                                <DetailRow label={t("user.pinCode")} value={fp.pincode} />
                                <DetailRow label={t("user.accountHolder")} value={<LocalizedText value={fp.account_name} fallback="-" />} />
                                <DetailRow label={t("user.bank")} value={<LocalizedText value={fp.bank_name} fallback="-" />} />
                                <DetailRow label={t("user.accountNo")} value={fp.account_number} />
                                <DetailRow label={t("user.accountType")} value={fp.account_type} />
                                <DetailRow label={t("user.ifsc")} value={fp.ifsc_code} />
                                <DetailRow label={t("user.branchAddress")} value={<LocalizedText value={fp.branch_address} fallback="-" />} />
                                <DetailRow
                                    label={t("user.profileCompletion")}
                                    value={`${fp.completion_percentage ?? 0}%`}
                                />
                                <DetailRow
                                    label={t("user.submittedForApproval")}
                                    value={
                                        fp.submitted_for_approval ? (
                                            <Badge variant="completed">{t("user.yes")}</Badge>
                                        ) : (
                                            <Badge variant="secondary">{t("user.no")}</Badge>
                                        )
                                    }
                                />
                                <DetailRow label={t("user.submissionDate")} value={formatDateTime(fp.submitted_at)} />
                                <DetailRow label={t("user.reviewedBy")} value={<LocalizedText value={fp.reviewed_by} fallback="-" />} />
                                <DetailRow label={t("user.reviewedAt")} value={formatDateTime(fp.reviewed_at)} />
                                {fp.rejection_reason && (
                                    <DetailRow label={t("user.rejectionReason")} value={<LocalizedText value={fp.rejection_reason} fallback="-" />} />
                                )}
                            </>
                        ) : (
                            <p className="text-muted-foreground text-sm py-4">
                                {t("user.noFranchiseProfile")}
                            </p>
                        )}
                    </SectionCard>

                    {/* Member Profile Picture */}
                    {!userDetails.isAdmin && (
                        <SectionCard title={t("user.memberProfilePicture")} icon={() => <span>🖼️</span>}>
                            <div className="flex items-center gap-4 py-2">
                                <img
                                    className="w-20 h-20 rounded-full object-cover border border-border bg-muted flex-none"
                                    src={memberPictureSrc}
                                    alt={t("user.profileAlt", { name: fullName })}
                                    onError={({ currentTarget }) => {
                                        currentTarget.onerror = null;
                                        currentTarget.src = user;
                                    }}
                                />
                                {memberPicture ? (
                                    <Badge variant="completed">{t("user.yes")}</Badge>
                                ) : (
                                    <Badge variant="secondary">{t("user.no")}</Badge>
                                )}
                            </div>
                        </SectionCard>
                    )}

                    {/* Other Information */}
                    <SectionCard title={t("user.otherInformation")} icon={() => <span>ℹ️</span>}>
                        <DetailRow label={t("user.deviceId")} value={userDetails.deviceId} />
                        <DetailRow label={t("user.deviceName")} value={userDetails.deviceName} />
                        <DetailRow label={t("user.fcmToken")} value={userDetails.fcmToken} />
                        <DetailRow label={t("user.franchiseId")} value={userDetails.franchise_id} />
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}
