"use client";

import { InfoTab } from "@/components/ProfilePage/InfoTab";
import { SafetyTab } from "@/components/ProfilePage/SafetyTab";
import { SecurityTab } from "@/components/ProfilePage/SecurityTab";
import { SignatureTab } from "@/components/ProfilePage/SignatureTab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useChangePassword, useMe, useUpdateMe } from "@/hooks/useAuth";
import { useUploadImage, useUploadPdf } from "@/hooks/useUpload";
import { ISafetyInspection } from "@/interface/employee";
import { formatDateWithTime } from "@/lib/format";
import {
    mdiAccount,
    mdiCalendar,
    mdiCameraOutline,
    mdiGestureDoubleTap,
    mdiLockOutline,
    mdiShieldCheckOutline,
    mdiSignatureFreehand
} from "@mdi/js";
import Icon from "@mdi/react";
import { Allura } from "next/font/google";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const allura = Allura({
    subsets: ["latin"],
    weight: ["400"],
});

export default function ProfilePage() {
    const { data: meResponse, isLoading } = useMe();
    const { mutate: updateMe, isPending: isUpdating } = useUpdateMe();
    const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();
    const { mutateAsync: uploadImage } = useUploadImage();
    const { mutateAsync: uploadPdf, isPending: isUploadingPdf } = useUploadPdf();

    const profile = meResponse?.data;
    const employee = profile?.user;

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<"info" | "safety" | "signature" | "security">("info");
    const [signatureText, setSignatureText] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const avatarFileInputRef = useRef<HTMLInputElement>(null);
    const elecCardFileInputRef = useRef<HTMLInputElement>(null);
    const laborCardFileInputRef = useRef<HTMLInputElement>(null);
    const pdfFileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        dateOfBirth: "",
        hometown: "",
        phoneNumber: "",
        identityCard: "",
        qualification: "",
        digitalSignature: "",
        avatar: "",
        electricalSafetyCardCode: "",
        electricalSafetyCardIssueDate: "",
        electricalSafetyLevel: "",
        electricalSafetyCardImage: "",
        laborSafetyCardCode: "",
        laborSafetyCardIssueDate: "",
        laborSafetyCardIssuer: "",
        laborSafetyCardImage: "",
        latestExamFile: "",
        safetyInspections: [] as ISafetyInspection[],
    });

    const [passwordForm, setPasswordForm] = useState<{
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }>({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const resetForm = useCallback(() => {
        if (employee) {
            const firstInspection = employee.safetyInspections?.[0];
            setFormData({
                fullName: employee.fullName || "",
                dateOfBirth: employee.dateOfBirth || "",
                hometown: employee.hometown || "",
                phoneNumber: employee.phoneNumber || "",
                identityCard: employee.identityCard || "",
                qualification: employee.qualification || "",
                digitalSignature: employee.digitalSignature || "",
                avatar: employee.avatar || "",
                electricalSafetyCardCode: firstInspection?.electricalSafety?.cardCode || "",
                electricalSafetyCardIssueDate: firstInspection?.electricalSafety?.cardIssueDate || "",
                electricalSafetyLevel: firstInspection?.electricalSafety?.level || "",
                electricalSafetyCardImage: firstInspection?.electricalSafety?.cardImage || "",
                laborSafetyCardCode: firstInspection?.laborSafety?.cardCode || "",
                laborSafetyCardIssueDate: firstInspection?.laborSafety?.cardIssueDate || "",
                laborSafetyCardIssuer: firstInspection?.laborSafety?.issuer || "",
                laborSafetyCardImage: firstInspection?.laborSafety?.cardImage || "",
                latestExamFile: firstInspection?.examFile || "",
                safetyInspections: employee.safetyInspections || [],
            });
            setSignatureText(employee.fullName || "");
        }
    }, [employee]);

    useEffect(() => {
        resetForm();
    }, [employee, resetForm]);

    const handleCancel = () => {
        resetForm();
        setIsEditing(false);
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setIsEditing(true);
    };

    const handleSubmit = () => {
        let payload = { ...formData };
        if (activeTab === "safety") {
            const newInspection: ISafetyInspection = {
                electricalSafety: {
                    cardCode: formData.electricalSafetyCardCode,
                    cardIssueDate: formData.electricalSafetyCardIssueDate,
                    level: formData.electricalSafetyLevel,
                    cardImage: formData.electricalSafetyCardImage,
                },
                laborSafety: {
                    cardCode: formData.laborSafetyCardCode,
                    cardIssueDate: formData.laborSafetyCardIssueDate,
                    issuer: formData.laborSafetyCardIssuer,
                    cardImage: formData.laborSafetyCardImage,
                },
                examFile: formData.latestExamFile || (formData.safetyInspections?.[0]?.examFile || ""),
            };
            const updatedInspections = [newInspection, ...(formData.safetyInspections || [])];
            payload = {
                ...formData,
                safetyInspections: updatedInspections,
            };
            setFormData(payload);
        }
        const {
            latestExamFile,
            electricalSafetyCardCode,
            electricalSafetyCardIssueDate,
            electricalSafetyLevel,
            electricalSafetyCardImage,
            laborSafetyCardCode,
            laborSafetyCardIssueDate,
            laborSafetyCardIssuer,
            laborSafetyCardImage,
            ...cleanPayload
        } = payload;
        updateMe(cleanPayload, {
            onSuccess: () => {
                setIsEditing(false);
            },
        });
    };

    const handlePasswordChange = () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
            return;
        }
        changePassword(
            {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            },
            {
                onSuccess: () => {
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                },
            }
        );
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const response = await uploadImage(file);
                if (response?.data?.url) {
                    const newAvatar = response.data.url;
                    setFormData(prev => ({ ...prev, avatar: newAvatar }));
                    updateMe({ ...formData, avatar: newAvatar });
                }
            } catch (error) {
                console.error("Upload avatar error:", error);
            }
        }
    };

    const handleUploadSignature = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const response = await uploadImage(file);
                if (response?.data?.url) {
                    handleChange("digitalSignature", response.data.url);
                }
            } catch (error) {
                console.error("Upload signature error:", error);
            }
        }
    };

    const generateSignatureImage = async () => {
        if (!signatureText) {
            toast.error("Vui lòng nhập tên để tạo chữ ký");
            return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `140px ${allura.style.fontFamily}, cursive`;
            ctx.fillStyle = "#000000";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(signatureText, canvas.width / 2, canvas.height / 2);
            canvas.toBlob(async (blob) => {
                if (blob) {
                    const file = new File([blob], "signature.png", { type: "image/png" });
                    try {
                        const response = await uploadImage(file);
                        if (response?.data?.url) {
                            handleChange("digitalSignature", response.data.url);
                            toast.success("Đã tạo và tải lên chữ ký!");
                        }
                    } catch (error) {
                        toast.error("Không thể tải lên chữ ký vừa tạo");
                    }
                }
            }, "image/png");
        }
    };

    const downloadSignature = async () => {
        const signatureUrl = formData.digitalSignature || employee?.digitalSignature;
        if (!signatureUrl) {
            toast.error("Không tìm thấy chữ ký để tải");
            return;
        }
        const id = toast.loading("Đang chuẩn bị tệp tải xuống...");
        try {
            const response = await fetch(signatureUrl);
            if (!response.ok) throw new Error("Network response was not ok");
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `signature-${employee?.fullName || "signature"}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.update(id, { render: "Tải xuống thành công!", type: "success", isLoading: false, autoClose: 2000 });
        } catch (error) {
            toast.update(id, { render: "Đang mở trong tab mới...", type: "warning", isLoading: false, autoClose: 3000 });
            window.open(signatureUrl, "_blank");
        }
    };

    const handleUploadElecCardImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const response = await uploadImage(file);
                if (response?.data?.url) {
                    handleChange("electricalSafetyCardImage", response.data.url);
                }
            } catch (error) {
                console.error("Upload electrical safety card image error:", error);
            }
        }
    };

    const handleUploadLaborCardImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const response = await uploadImage(file);
                if (response?.data?.url) {
                    handleChange("laborSafetyCardImage", response.data.url);
                }
            } catch (error) {
                console.error("Upload labor safety card image error:", error);
            }
        }
    };

    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith(".pdf")) {
                toast.error("Chỉ chấp nhận file PDF (.pdf)");
                return;
            }
            try {
                const response = await uploadPdf(file);
                if (response?.data?.url) {
                    handleChange("latestExamFile", response.data.url);
                    toast.success("Đã tải lên file PDF bài thi sát hạch thành công!");
                }
            } catch (error) {
                console.error("Upload pdf error:", error);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    const tabs = [
        { id: "info" as const, label: "Thông tin cá nhân", icon: mdiAccount },
        { id: "safety" as const, label: "Hồ sơ", icon: mdiShieldCheckOutline },
        { id: "signature" as const, label: "Chữ ký điện tử", icon: mdiSignatureFreehand },
        { id: "security" as const, label: "Đổi mật khẩu", icon: mdiLockOutline },
    ];

    return (
        <div className="space-y-4">
            {/* Profile Header */}
            <Card className="relative overflow-hidden border border-darkBorderV1 bg-darkCardV1">
                {/* Background image */}
                <div className="absolute inset-x-0 top-0 h-32 md:h-24 overflow-hidden">
                    <img src="/images/profile.gif" alt="" className="w-full h-full object-cover" draggable={false} />
                    <div className="absolute inset-0 bg-darkCardV1/60" />
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative p-3 md:p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-[3px] border-primary/30 bg-darkBackgroundV1 p-1 shadow-lg shadow-primary/10">
                                <img
                                    src={employee?.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.username || "Sophie"}`}
                                    alt="Avatar"
                                    className="w-full h-full rounded-xl object-cover"
                                />
                            </div>
                            <input
                                type="file"
                                ref={avatarFileInputRef}
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                            <button
                                className="absolute flex items-center justify-center -bottom-1 -right-1 h-8 w-8 rounded-full bg-black/90 hover:bg-black text-neutral-300 border-none shadow-sm transition-colors"
                                onClick={() => avatarFileInputRef.current?.click()}
                            >
                                <Icon path={mdiCameraOutline} size={0.8} className="flex-shrink-0" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl md:text-2xl font-semibold text-neutral-300">{employee?.fullName || "---"}</h1>
                                <Badge variant="cyan">
                                    {employee?.employeeCode || profile?.username}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                                <Badge variant="green">Vai trò:</Badge>
                                <Badge variant="neutral">{employee?.position || "---"}</Badge>
                                <span>--</span>
                                <Badge variant="green">Phòng ban:</Badge>
                                <Badge variant="neutral">{employee?.department || "---"}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                                <Badge variant="green">Đăng nhập lần cuối:</Badge>
                                <Badge variant="neutral">{profile?.lastLogin ? formatDateWithTime(profile.lastLogin) : "---"}</Badge>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 self-start md:self-end w-full md:w-fit">
                            <Link href="/sys/schedule">
                                <Button>
                                    <Icon path={mdiCalendar} size={0.8} className="flex-shrink-0" />
                                    Xem lịch làm việc
                                </Button>
                            </Link>
                            <Link href="/sys/attendance">
                                <Button>
                                    <Icon path={mdiGestureDoubleTap} size={0.8} className="flex-shrink-0" />
                                    Chấm công
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Tab Navigation */}
            <div className="flex gap-1 p-1 bg-darkCardV1 border border-darkBorderV1 rounded-xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                            ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(65,198,81,0.08)]"
                            : "text-neutral-300 hover:text-neutral-300 hover:bg-darkBackgroundV1/50 border border-transparent"
                            }`}
                    >
                        <Icon path={tab.icon} size={0.8} className="flex-shrink-0" />
                        <span className="hidden sm:inline font-semibold">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Modular Tab Content */}
            {activeTab === "info" && (
                <InfoTab
                    employee={employee}
                    profile={profile}
                    formData={formData}
                    isEditing={isEditing}
                    isUpdating={isUpdating}
                    setIsEditing={setIsEditing}
                    handleCancel={handleCancel}
                    handleSubmit={handleSubmit}
                    handleChange={handleChange}
                />
            )}

            {activeTab === "signature" && (
                <SignatureTab
                    formData={formData}
                    isEditing={isEditing}
                    isUpdating={isUpdating}
                    signatureText={signatureText}
                    fileInputRef={fileInputRef}
                    setIsEditing={setIsEditing}
                    setSignatureText={setSignatureText}
                    handleCancel={handleCancel}
                    handleSubmit={handleSubmit}
                    handleChange={handleChange}
                    handleUploadSignature={handleUploadSignature}
                    generateSignatureImage={generateSignatureImage}
                    downloadSignature={downloadSignature}
                />
            )}

            {activeTab === "security" && (
                <SecurityTab
                    passwordForm={passwordForm}
                    showPasswords={showPasswords}
                    isChangingPassword={isChangingPassword}
                    setPasswordForm={setPasswordForm}
                    setShowPasswords={setShowPasswords}
                    handlePasswordChange={handlePasswordChange}
                />
            )}

            {activeTab === "safety" && (
                <SafetyTab
                    formData={formData}
                    isEditing={isEditing}
                    isUpdating={isUpdating}
                    isUploadingPdf={isUploadingPdf}
                    elecCardFileInputRef={elecCardFileInputRef}
                    laborCardFileInputRef={laborCardFileInputRef}
                    pdfFileInputRef={pdfFileInputRef}
                    setIsEditing={setIsEditing}
                    handleCancel={handleCancel}
                    handleSubmit={handleSubmit}
                    handleChange={handleChange}
                    handleUploadElecCardImage={handleUploadElecCardImage}
                    handleUploadLaborCardImage={handleUploadLaborCardImage}
                    handlePdfUpload={handlePdfUpload}
                    setFormData={setFormData}
                    updateMe={updateMe}
                />
            )}
        </div>
    );
}
