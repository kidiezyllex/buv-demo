"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { EditField } from "@/components/ProfilePage/EditField";
import { ProfileItem } from "@/components/ProfilePage/ProfileItem";
import { IEmployee } from "@/interface/employee";
import { formatDateOnly, formatDateWithTime } from "@/lib/format";
import {
    mdiAccount,
    mdiAccountBoxPlusOutline,
    mdiAccountEditOutline,
    mdiAccountTie,
    mdiBarcode,
    mdiCalendar,
    mdiCardAccountDetailsOutline,
    mdiClose,
    mdiContentSave,
    mdiLoading,
    mdiLoginVariant,
    mdiMapMarkerOutline,
    mdiOfficeBuilding,
    mdiPhone,
    mdiSchool,
    mdiShieldCheckOutline,
    mdiUpdate
} from "@mdi/js";
import Icon from "@mdi/react";
import React from "react";

interface InfoTabProps {
    employee?: IEmployee;
    profile?: any;
    formData: {
        fullName: string;
        dateOfBirth: string;
        hometown: string;
        phoneNumber: string;
        identityCard: string;
        qualification: string;
    };
    isEditing: boolean;
    isUpdating: boolean;
    setIsEditing: (v: boolean) => void;
    handleCancel: () => void;
    handleSubmit: () => void;
    handleChange: (field: string, value: any) => void;
}

export function InfoTab({
    employee,
    profile,
    formData,
    isEditing,
    isUpdating,
    setIsEditing,
    handleCancel,
    handleSubmit,
    handleChange,
}: InfoTabProps) {
    return (
        <div className="flex flex-col gap-3 md:gap-4">
            {/* Left Column - View / Edit Info */}
            <Card className="p-3 md:p-4">
                <div className="flex items-center justify-between gap-3 md:gap-4 mb-3">
                    <div className="flex items-center gap-3 md:gap-4 flex-1">
                        <h3 className="text-primary font-semibold whitespace-nowrap">Thông tin cơ bản</h3>
                        <div className="flex-1 border-b border-dashed border-primary mr-1" />
                    </div>
                    <div className="flex gap-3">
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)}>
                                <Icon path={mdiAccountEditOutline} size={0.8} className="flex-shrink-0" />
                                Cập nhật thông tin
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={handleCancel} disabled={isUpdating} className="w-full flex-1">
                                    <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                    Hủy
                                </Button>
                                <Button onClick={handleSubmit} disabled={isUpdating} className="w-full flex-1">
                                    <Icon path={isUpdating ? mdiLoading : mdiContentSave} size={0.8} className={isUpdating ? "animate-spin" : ""} />
                                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {!isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        <ProfileItem icon={mdiAccount} label="Họ và tên" value={employee?.fullName && <Badge variant="neutral">{employee?.fullName}</Badge>} />
                        <ProfileItem icon={mdiBarcode} label="Mã nhân viên" value={employee?.employeeCode && <Badge variant="green">{employee?.employeeCode}</Badge>} />
                        <ProfileItem
                            icon={mdiCalendar}
                            label="Ngày sinh"
                            value={employee?.dateOfBirth && <Badge variant="neutral">{formatDateOnly(employee.dateOfBirth)}</Badge>}
                        />
                        <ProfileItem icon={mdiCardAccountDetailsOutline} label="Số CCCD" value={employee?.identityCard && <Badge variant="neutral">{employee?.identityCard}</Badge>} />
                        <ProfileItem icon={mdiPhone} label="Số điện thoại" value={employee?.phoneNumber && <Badge variant="neutral">{employee?.phoneNumber}</Badge>} />
                        <ProfileItem icon={mdiMapMarkerOutline} label="Quê quán" value={employee?.hometown && <Badge variant="neutral">{employee?.hometown}</Badge>} />
                        <ProfileItem icon={mdiSchool} label="Trình độ (Bậc)" value={employee?.qualification && <Badge variant="neutral">{employee?.qualification}</Badge>} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        <EditField label="Họ và tên" value={formData.fullName} onChange={(v) => handleChange("fullName", v)} />
                        <div className="space-y-1.5">
                            <Label>Ngày sinh</Label>
                            <DatePicker date={formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined} onDateChange={(d) => handleChange("dateOfBirth", d?.toISOString())} captionLayout="dropdown" />
                        </div>
                        <EditField label="Số CCCD" value={formData.identityCard} onChange={(v) => handleChange("identityCard", v)} />
                        <EditField label="Số điện thoại" value={formData.phoneNumber} onChange={(v) => handleChange("phoneNumber", v)} />
                        <EditField label="Quê quán" value={formData.hometown} onChange={(v) => handleChange("hometown", v)} />
                        <EditField label="Trình độ (Bậc)" value={formData.qualification} onChange={(v) => handleChange("qualification", v)} />
                    </div>
                )}
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Right Column - Role & Activity */}
                <Card className="p-3 md:p-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <h3 className="text-primary font-semibold whitespace-nowrap">Công việc</h3>
                        <div className="flex-1 border-b border-dashed border-primary mr-1" />
                    </div>
                    <div className="space-y-4">
                        <ProfileItem icon={mdiOfficeBuilding} label="Phòng ban" value={employee?.department && <Badge variant="neutral">{employee?.department}</Badge>} />
                        <ProfileItem icon={mdiAccountTie} label="Chức vụ" value={employee?.position && <Badge variant="neutral">{employee?.position}</Badge>} />
                        <ProfileItem
                            icon={mdiShieldCheckOutline}
                            label="Trạng thái"
                            value={<Badge variant={employee?.isActive ? "green" : "red"}>{employee?.isActive ? "Đang làm việc" : "Đã thôi việc"}</Badge>}
                        />
                    </div>
                </Card>

                <Card className="p-3 md:p-4">
                    <div className="flex items-center gap-3 md:gap-4">
                        <h3 className="text-primary font-semibold whitespace-nowrap">Hoạt động gần đây</h3>
                        <div className="flex-1 border-b border-dashed border-primary mr-1" />
                    </div>
                    <div className="space-y-4">
                        {profile?.lastLogin && (
                            <ProfileItem
                                label="Đăng nhập lần cuối"
                                value={<Badge variant="neutral">{formatDateWithTime(profile.lastLogin)}</Badge>}
                                icon={mdiLoginVariant}
                            />
                        )}
                        {profile?.updatedAt && (
                            <ProfileItem
                                label="Cập nhật gần nhất"
                                value={<Badge variant="neutral">{formatDateWithTime(profile.updatedAt)}</Badge>}
                                icon={mdiUpdate}
                            />
                        )}
                        {profile?.createdAt && (
                            <ProfileItem
                                label="Ngày tạo tài khoản"
                                value={<Badge variant="neutral">{formatDateOnly(profile.createdAt)}</Badge>}
                                icon={mdiAccountBoxPlusOutline}
                            />
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
