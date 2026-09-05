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

const ApprovalBadge = ({ status }) => {
    if (status === "approved") {
        return (
            <Badge variant="completed" className="capitalize">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approved
            </Badge>
        );
    }
    if (status === "rejected") {
        return (
            <Badge variant="destructive" className="capitalize">
                <XCircle className="w-3.5 h-3.5" />
                Rejected
            </Badge>
        );
    }
    return (
        <Badge variant="confirmed" className="capitalize">
            <Clock className="w-3.5 h-3.5" />
            Pending
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

    if (loading) return <div className="text-center py-10">Loading...</div>;

    if (loadError) {
        return (
            <div className="text-center py-10 space-y-4">
                <p className="text-muted-foreground">{loadError}</p>
                <Button onClick={() => navigate(-1)} variant="outline">
                    Back
                </Button>
            </div>
        );
    }

    if (!userDetails) {
        return (
            <div className="text-center py-10 space-y-4">
                <p className="text-muted-foreground">Failed to fetch user details.</p>
                <Button onClick={() => navigate(-1)} variant="outline">
                    Back
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">User Details</h1>
                <Button onClick={() => navigate(-1)} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
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
                                alt={`${fullName} Profile`}
                                onError={({ currentTarget }) => {
                                    currentTarget.onerror = null;
                                    currentTarget.src = user;
                                }}
                            />

                            <div>
                                <CardTitle className="text-2xl font-bold">{fullName}</CardTitle>
                                <div className="flex flex-wrap gap-2 justify-center mt-4">
                                    {userDetails.isAdmin && <Badge variant="destructive">Admin</Badge>}
                                    {!userDetails.isAdmin && <Badge variant="outline">Franchise Member</Badge>}
                                    <ApprovalBadge status={approvalStatus} />
                                    {userDetails.isVerified ? (
                                        <Badge variant="completed">Verified</Badge>
                                    ) : (
                                        <Badge variant="secondary">Not Verified</Badge>
                                    )}
                                    {userDetails.isActive ? (
                                        <Badge variant="completed">Active</Badge>
                                    ) : (
                                        <Badge variant="secondary">Inactive</Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Right Content */}
                <div className="col-span-12 md:col-span-8 space-y-4">
                    {/* Personal Information */}
                    <SectionCard title="Personal Info" icon={() => <span>👤</span>}>
                        <DetailRow label="Full Name" value={fullName} />
                        <DetailRow label="Email" value={userDetails.email} />
                        <DetailRow
                            label="Mobile Number"
                            value={userDetails.mobileNumber || userDetails.phoneNumber}
                        />
                        <DetailRow label="Gender" value={userDetails.gender} />
                        <DetailRow label="Age" value={userDetails.age} />
                        <DetailRow label="Birth Date" value={formatDateTime(userDetails.birthDate)} />
                        <DetailRow label="Address" value={userDetails.address} />
                        <DetailRow label="City" value={userDetails.city} />
                        <DetailRow label="State" value={userDetails.state} />
                        <DetailRow label="PIN Code" value={userDetails.pinCode} />
                    </SectionCard>

                    {/* Account Information */}
                    <SectionCard title="Account Information" icon={() => <span>⚙️</span>}>
                        <DetailRow
                            label="Admin/User"
                            value={
                                userDetails.isAdmin
                                    ? "Admin"
                                    : "Franchise Member"
                            }
                        />
                        <DetailRow
                            label="Approval Status"
                            value={
                                <ApprovalBadge status={approvalStatus} />
                            }
                        />
                        <DetailRow
                            label="Account Status"
                            value={
                                userDetails.isActive ? (
                                    <Badge variant="completed">Active</Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                )
                            }
                        />
                        <DetailRow
                            label="Verified"
                            value={
                                userDetails.isVerified ? (
                                    <Badge variant="completed">Yes</Badge>
                                ) : (
                                    <Badge variant="secondary">No</Badge>
                                )
                            }
                        />
                        <DetailRow label="Username" value={userDetails.username} />
                        <DetailRow label="Registration Date" value={formatDateTime(userDetails.createdAt)} />
                        <DetailRow label="Updated At" value={formatDateTime(userDetails.updatedAt)} />

                        {/* Member Portal Password — admin can view the plaintext
                            (only recoverable for passwords set after this feature
                            was deployed). */}
                        {!userDetails.isAdmin && (
                            <div className="grid grid-cols-3 gap-4 items-center py-1.5 border-b border-dashed last:border-0">
                                <p className="text-muted-foreground font-medium text-sm">
                                    Member Portal Password
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
                                                title={passwordVisible ? "Hide password" : "Show password"}
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
                                                title="Copy password"
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
                                            Password not available (only passwords set after this feature are recoverable)
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </SectionCard>

                    {/* Franchise Information */}
                    <SectionCard title="Franchise Information" icon={() => <span>🏪</span>}>
                        {franchiseProfile ? (
                            <>
                                <DetailRow label="Member ID" value={fp.member_id} />
                                <DetailRow label="Distributor ID" value={fp.distributor_id} />
                                <DetailRow label="Franchise Code" value={fp.franchise_code} />
                                <DetailRow label="Franchise Type" value={fp.franchise_type} />
                                <DetailRow label="Under Group" value={fp.under_group} />
                                <DetailRow label="Member Name" value={fp.member_name} />
                                <DetailRow label="Branch Name" value={fp.branch_name} />
                                <DetailRow label="Store Name" value={fp.store_name} />
                                <DetailRow label="Contact Person" value={fp.contact_person} />
                                <DetailRow label="Phone" value={fp.phone} />
                                <DetailRow label="Email" value={fp.email} />
                                <DetailRow label="Address" value={fp.address} />
                                <DetailRow label="State" value={fp.state} />
                                <DetailRow label="City" value={fp.city} />
                                <DetailRow label="District" value={fp.district} />
                                <DetailRow label="Area" value={fp.area} />
                                <DetailRow label="PIN Code" value={fp.pincode} />
                                <DetailRow label="Account Holder" value={fp.account_name} />
                                <DetailRow label="Bank" value={fp.bank_name} />
                                <DetailRow label="Account No." value={fp.account_number} />
                                <DetailRow label="Account Type" value={fp.account_type} />
                                <DetailRow label="IFSC" value={fp.ifsc_code} />
                                <DetailRow label="Branch Address" value={fp.branch_address} />
                                <DetailRow
                                    label="Profile Completion"
                                    value={`${fp.completion_percentage ?? 0}%`}
                                />
                                <DetailRow
                                    label="Submitted for Approval"
                                    value={
                                        fp.submitted_for_approval ? (
                                            <Badge variant="completed">Yes</Badge>
                                        ) : (
                                            <Badge variant="secondary">No</Badge>
                                        )
                                    }
                                />
                                <DetailRow label="Submission Date" value={formatDateTime(fp.submitted_at)} />
                                <DetailRow label="Reviewed By" value={fp.reviewed_by} />
                                <DetailRow label="Reviewed At" value={formatDateTime(fp.reviewed_at)} />
                                {fp.rejection_reason && (
                                    <DetailRow label="Rejection Reason" value={fp.rejection_reason} />
                                )}
                            </>
                        ) : (
                            <p className="text-muted-foreground text-sm py-4">
                                No franchise profile found for this user.
                            </p>
                        )}
                    </SectionCard>

                    {/* Other Information */}
                    <SectionCard title="Other Information" icon={() => <span>ℹ️</span>}>
                        <DetailRow label="Device ID" value={userDetails.deviceId} />
                        <DetailRow label="Device Name" value={userDetails.deviceName} />
                        <DetailRow label="FCM Token" value={userDetails.fcmToken} />
                        <DetailRow label="Franchise ID" value={userDetails.franchise_id} />
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}
