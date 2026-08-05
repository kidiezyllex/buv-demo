"use client";

import { EditField } from "@/components/ProfilePage/EditField";
import { ProfileItem } from "@/components/ProfilePage/ProfileItem";
import { SafetyInspectionDetailsDialog } from "@/components/ProfilePage/SafetyTab/SafetyInspectionDetailsDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadBox } from "@/components/ui/template-upload";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ISafetyInspection } from "@/interface/employee";
import { formatDateOnly } from "@/lib/format";
import {
    mdiAccountEditOutline,
    mdiBarcode,
    mdiCalendar,
    mdiClose,
    mdiCloudUploadOutline,
    mdiContentSave,
    mdiDownload,
    mdiEyeOutline,
    mdiFilePdfBox,
    mdiLoading,
    mdiOfficeBuilding,
    mdiShieldCheckOutline,
    mdiSquareEditOutline,
    mdiTooltipImageOutline,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import Link from "next/link";
import React, { useState } from "react";

interface SafetyTabProps {
    formData: {
        electricalSafetyCardCode: string;
        electricalSafetyCardIssueDate: string;
        electricalSafetyLevel: string;
        electricalSafetyCardImage: string;
        laborSafetyCardCode: string;
        laborSafetyCardIssueDate: string;
        laborSafetyCardIssuer: string;
        laborSafetyCardImage: string;
        latestExamFile: string;
        safetyInspections: ISafetyInspection[];
    };
    isEditing: boolean;
    isUpdating: boolean;
    isUploadingPdf: boolean;
    elecCardFileInputRef: React.RefObject<HTMLInputElement | null>;
    laborCardFileInputRef: React.RefObject<HTMLInputElement | null>;
    pdfFileInputRef: React.RefObject<HTMLInputElement | null>;
    setIsEditing: (v: boolean) => void;
    handleCancel: () => void;
    handleSubmit: () => void;
    handleChange: (field: string, value: any) => void;
    handleUploadElecCardImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleUploadLaborCardImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    updateMe: (payload: any) => void;
}

export function SafetyTab({
    formData,
    isEditing,
    isUpdating,
    isUploadingPdf,
    elecCardFileInputRef,
    laborCardFileInputRef,
    pdfFileInputRef,
    setIsEditing,
    handleCancel,
    handleSubmit,
    handleChange,
    handleUploadElecCardImage,
    handleUploadLaborCardImage,
    handlePdfUpload,
    setFormData,
    updateMe,
}: SafetyTabProps) {
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [detailsIndex, setDetailsIndex] = useState<number | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <div className="space-y-4">
            {/* Combined Card for Hồ sơ an toàn điện, Hồ sơ an toàn lao động, & PDF Bài thi sát hạch */}
            <Card className="p-3 md:p-4">
                <div className="flex items-center justify-between gap-3 md:gap-4 mb-4">
                    <div className="flex items-center gap-3 md:gap-4 flex-1">
                        <h3 className="text-primary font-semibold whitespace-nowrap">Hồ sơ an toàn</h3>
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

                <div className="space-y-4">
                    {/* Grid 2 cột cho Hồ sơ an toàn điện & Hồ sơ an toàn lao động */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Hồ sơ an toàn điện */}
                        <Card className="bg-darkBackgroundV1/30 border-darkBorderV1 p-3 md:p-4:">
                            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                                <Icon path={mdiShieldCheckOutline} size={0.8} className="text-primary" />
                                <h4 className="text-sm font-semibold text-primary">Hồ sơ an toàn điện</h4>
                            </div>

                            {!isEditing ? (
                                <div className="space-y-3">
                                    <ProfileItem icon={mdiBarcode} label="Mã thẻ an toàn điện" value={formData.electricalSafetyCardCode ? <Badge variant="neutral">{formData.electricalSafetyCardCode}</Badge> : null} />
                                    <ProfileItem icon={mdiCalendar} label="Ngày cấp thẻ" value={formData.electricalSafetyCardIssueDate ? <Badge variant="neutral">{formatDateOnly(formData.electricalSafetyCardIssueDate)}</Badge> : null} />
                                    <ProfileItem icon={mdiShieldCheckOutline} label="Bậc an toàn" value={formData.electricalSafetyLevel ? <Badge variant="green">{formData.electricalSafetyLevel}</Badge> : null} />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <EditField
                                        label="Mã thẻ an toàn điện"
                                        value={formData.electricalSafetyCardCode}
                                        onChange={(v) => handleChange("electricalSafetyCardCode", v)}
                                        placeholder="Nhập mã thẻ an toàn điện..."
                                    />
                                    <div className="space-y-1.5">
                                        <Label>Ngày cấp thẻ</Label>
                                        <DatePicker
                                            date={formData.electricalSafetyCardIssueDate ? new Date(formData.electricalSafetyCardIssueDate) : undefined}
                                            onDateChange={(d) => handleChange("electricalSafetyCardIssueDate", d?.toISOString())}
                                            captionLayout="dropdown"
                                        />
                                    </div>
                                    <EditField
                                        label="Bậc an toàn"
                                        value={formData.electricalSafetyLevel}
                                        onChange={(v) => handleChange("electricalSafetyLevel", v)}
                                        placeholder="Nhập bậc an toàn..."
                                    />
                                </div>
                            )}

                            {/* Upload & Preview File Ảnh */}
                            <div className="space-y-2 pt-2">
                                <Label className="font-semibold text-primary text-xs">Tải lên file ảnh (Thẻ an toàn điện)</Label>
                                <Card className="p-3 flex flex-col items-center justify-center bg-darkBackgroundV1/40 border-darkBorderV1 min-h-[160px] relative">
                                    {formData.electricalSafetyCardImage ? (
                                        <div className="relative group w-full flex justify-center">
                                            <img
                                                src={formData.electricalSafetyCardImage}
                                                alt="Thẻ an toàn điện"
                                                className="object-contain rounded-md max-h-[180px] w-auto border border-darkBorderV1"
                                            />
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    className="absolute top-1 right-1 h-8 w-8 rounded-full bg-black/80 hover:bg-black text-red-400 flex items-center justify-center transition-colors"
                                                    onClick={() => handleChange("electricalSafetyCardImage", "")}
                                                >
                                                    <Icon path={mdiTrashCanOutline} size={0.8} />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-neutral-400 text-sm flex flex-col items-center gap-2 p-4">
                                            <Icon path={mdiTooltipImageOutline} size={2} className="opacity-30" />
                                            <span>Chưa có ảnh thẻ an toàn điện</span>
                                        </div>
                                    )}
                                </Card>
                                {isEditing && (
                                    <div>
                                        <input
                                            type="file"
                                            ref={elecCardFileInputRef as any}
                                            accept="image/*"
                                            onChange={handleUploadElecCardImage}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full mt-1"
                                            onClick={() => elecCardFileInputRef.current?.click()}
                                        >
                                            <Icon path={mdiCloudUploadOutline} size={0.8} />
                                            Tải lên file ảnh
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Hồ sơ an toàn lao động */}
                        <Card className="bg-darkBackgroundV1/30 border-darkBorderV1 p-3 md:p-4:">
                            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                                <Icon path={mdiOfficeBuilding} size={0.8} className="text-primary" />
                                <h4 className="text-sm font-semibold text-primary">Hồ sơ an toàn lao động</h4>
                            </div>

                            {!isEditing ? (
                                <div className="space-y-3">
                                    <ProfileItem icon={mdiBarcode} label="Mã thẻ an toàn lao động" value={formData.laborSafetyCardCode ? <Badge variant="neutral">{formData.laborSafetyCardCode}</Badge> : null} />
                                    <ProfileItem icon={mdiCalendar} label="Ngày cấp thẻ" value={formData.laborSafetyCardIssueDate ? <Badge variant="neutral">{formatDateOnly(formData.laborSafetyCardIssueDate)}</Badge> : null} />
                                    <ProfileItem icon={mdiOfficeBuilding} label="Đơn vị cấp" value={formData.laborSafetyCardIssuer ? <Badge variant="green">{formData.laborSafetyCardIssuer}</Badge> : null} />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <EditField
                                        label="Mã thẻ an toàn lao động"
                                        value={formData.laborSafetyCardCode}
                                        onChange={(v) => handleChange("laborSafetyCardCode", v)}
                                        placeholder="Nhập mã thẻ an toàn lao động..."
                                    />
                                    <div className="space-y-1.5">
                                        <Label>Ngày cấp thẻ</Label>
                                        <DatePicker
                                            date={formData.laborSafetyCardIssueDate ? new Date(formData.laborSafetyCardIssueDate) : undefined}
                                            onDateChange={(d) => handleChange("laborSafetyCardIssueDate", d?.toISOString())}
                                            captionLayout="dropdown"
                                        />
                                    </div>
                                    <EditField
                                        label="Đơn vị cấp"
                                        value={formData.laborSafetyCardIssuer}
                                        onChange={(v) => handleChange("laborSafetyCardIssuer", v)}
                                        placeholder="Nhập đơn vị cấp thẻ..."
                                    />
                                </div>
                            )}

                            {/* Upload & Preview File Ảnh */}
                            <div className="space-y-2 pt-2">
                                <Label className="font-semibold text-primary text-xs">Tải lên file ảnh (Thẻ an toàn lao động)</Label>
                                <Card className="p-3 flex flex-col items-center justify-center bg-darkBackgroundV1/40 border-darkBorderV1 min-h-[160px] relative">
                                    {formData.laborSafetyCardImage ? (
                                        <div className="relative group w-full flex justify-center">
                                            <img
                                                src={formData.laborSafetyCardImage}
                                                alt="Thẻ an toàn lao động"
                                                className="object-contain rounded-md max-h-[180px] w-auto border border-darkBorderV1"
                                            />
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    className="absolute top-1 right-1 h-8 w-8 rounded-full bg-black/80 hover:bg-black text-red-400 flex items-center justify-center transition-colors"
                                                    onClick={() => handleChange("laborSafetyCardImage", "")}
                                                >
                                                    <Icon path={mdiTrashCanOutline} size={0.8} />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-neutral-400 text-sm flex flex-col items-center gap-2 p-4">
                                            <Icon path={mdiTooltipImageOutline} size={2} className="opacity-30" />
                                            <span>Chưa có ảnh thẻ an toàn lao động</span>
                                        </div>
                                    )}
                                </Card>
                                {isEditing && (
                                    <div>
                                        <input
                                            type="file"
                                            ref={laborCardFileInputRef as any}
                                            accept="image/*"
                                            onChange={handleUploadLaborCardImage}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full mt-1"
                                            onClick={() => laborCardFileInputRef.current?.click()}
                                        >
                                            <Icon path={mdiCloudUploadOutline} size={0.8} />
                                            Tải lên file ảnh
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* File PDF Bài thi sát hạch an toàn */}
                    <UploadBox
                        title="File PDF bài thi sát hạch an toàn"
                        icon={mdiFilePdfBox}
                        headerColor="bg-[#E55153]/50"
                        inputRef={pdfFileInputRef as any}
                        onFileChange={handlePdfUpload}
                        currentFile={formData.latestExamFile}
                        accept=".pdf"
                        isPending={isUploadingPdf}
                        disabled={!isEditing}
                        onCustomClick={() => {
                            if (!isEditing) setIsEditing(true);
                        }}
                        uploadText="Nhấn để chọn file PDF bài thi sát hạch mẫu (.pdf)"
                        onDeleteCurrentFile={() => handleChange("latestExamFile", "")}
                    />

                    {/* Cặp button Hủy và Lưu thay đổi phía dưới */}
                    <div className="w-full grid grid-cols-2 gap-3">
                        {!isEditing ? (
                            <>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
                                    <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                    Hủy
                                </Button>
                                <Button onClick={handleSubmit} disabled={isUpdating}>
                                    <Icon path={isUpdating ? mdiLoading : mdiContentSave} size={0.8} className={isUpdating ? "animate-spin" : ""} />
                                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </Card>

            {/* Bottom Section: Safety Inspection Exam History Table */}
            <Card className="p-3 md:p-4">
                <div className="flex items-center gap-3 md:gap-4 mb-4">
                    <h3 className="text-primary font-semibold whitespace-nowrap">Lịch sử kiểm tra an toàn</h3>
                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                </div>

                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16 text-center">STT</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead>Bậc an toàn điện</TableHead>
                                <TableHead>Đơn vị cấp an toàn lao động</TableHead>
                                <TableHead>Bài thi</TableHead>
                                <TableHead className="w-20 text-center">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formData.safetyInspections && formData.safetyInspections.length > 0 ? (
                                formData.safetyInspections.map((item, index) => (
                                    <TableRow key={item._id || index}>
                                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                        <TableCell>
                                            <Badge variant="neutral">{item.createdAt ? formatDateOnly(item.createdAt) : "---"}</Badge>
                                        </TableCell>
                                        <TableCell><Badge variant="neutral">{item.electricalSafety?.level || "---"}</Badge></TableCell>
                                        <TableCell><Badge variant="neutral">{item.laborSafety?.issuer || "---"}</Badge></TableCell>
                                        <TableCell>
                                            {item.examFile ? (
                                                <Link
                                                    href={item.examFile}
                                                    target="_blank"
                                                >
                                                    <Button
                                                        variant="outline"
                                                    >
                                                        <Icon path={mdiDownload} size={0.8} />
                                                        Xem / Tải file
                                                    </Button>
                                                </Link>

                                            ) : (
                                                <span className="text-neutral-400 italic">Chưa có file</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end space-x-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDetailsIndex(index);
                                                                setIsDetailsOpen(true);
                                                            }}
                                                        >
                                                            <Icon path={mdiEyeOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Xem chi tiết lịch sử kiểm tra</TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (item.electricalSafety || item.laborSafety) {
                                                                    setFormData((prev: any) => ({
                                                                        ...prev,
                                                                        electricalSafetyCardCode: item.electricalSafety?.cardCode || prev.electricalSafetyCardCode,
                                                                        electricalSafetyCardIssueDate: item.electricalSafety?.cardIssueDate || prev.electricalSafetyCardIssueDate,
                                                                        electricalSafetyLevel: item.electricalSafety?.level || prev.electricalSafetyLevel,
                                                                        electricalSafetyCardImage: item.electricalSafety?.cardImage || prev.electricalSafetyCardImage,
                                                                        laborSafetyCardCode: item.laborSafety?.cardCode || prev.laborSafetyCardCode,
                                                                        laborSafetyCardIssueDate: item.laborSafety?.cardIssueDate || prev.laborSafetyCardIssueDate,
                                                                        laborSafetyCardIssuer: item.laborSafety?.issuer || prev.laborSafetyCardIssuer,
                                                                        laborSafetyCardImage: item.laborSafety?.cardImage || prev.laborSafetyCardImage,
                                                                        latestExamFile: item.examFile || prev.latestExamFile,
                                                                    }));
                                                                }
                                                                setIsEditing(true);
                                                            }}
                                                        >
                                                            <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Cập nhật lịch sử kiểm tra</TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="destructive"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteIndex(index);
                                                                setIsDeleteOpen(true);
                                                            }}
                                                        >
                                                            <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Xóa lịch sử kiểm tra</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                            <Icon path={mdiTooltipImageOutline} size={1} className="flex-shrink-0" />
                                            Chưa có lịch sử sát hạch an toàn nào
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </Card>

            <SafetyInspectionDetailsDialog
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setDetailsIndex(null);
                }}
                inspection={detailsIndex !== null ? formData.safetyInspections?.[detailsIndex] || null : null}
            />

            <DeleteDialog
                isOpen={isDeleteOpen}
                isDeleting={isUpdating}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setDeleteIndex(null);
                }}
                onConfirm={async () => {
                    if (deleteIndex === null) return;
                    const updatedInspections = (formData.safetyInspections || []).filter((_, i) => i !== deleteIndex);
                    const newFormData = { ...formData, safetyInspections: updatedInspections };
                    setFormData(newFormData);
                    await updateMe(newFormData);
                }}
                title="Xóa lịch sử kiểm tra an toàn"
                description="Bạn có chắc chắn muốn xóa bản ghi lịch sử kiểm tra an toàn này không? Hành động này không thể hoàn tác."
                confirmText="Xóa bản ghi"
                successMessage="Đã xóa lịch sử kiểm tra an toàn thành công!"
                errorMessage="Không thể xóa lịch sử kiểm tra an toàn"
            />
        </div>
    );
}
