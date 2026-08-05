"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/useUserContext";
import { useEquipment, useEquipmentHistory, useInspectionDue, useUpdateInspection } from "@/hooks/useEquipment";
import { IEquipment, IEquipmentHistory } from "@/interface/equipment";
import { mdiClose, mdiContentSave, mdiMagnify, mdiSquareEditOutline, mdiTools } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Label } from "../ui/label";
import { EquipmentHistoryTable } from "./EquipmentHistoryTable";

export default function EquipmentHistoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        equipmentCode: "",
        equipmentName: "",
        serialNumber: "",
        operationDate: undefined as Date | undefined,
        inspectionDate: undefined as Date | undefined,
        inspectionSealNumber: "",
        nextInspectionDate: undefined as Date | undefined,
    });

    const { profile } = useUser();

    // Check if user is admin or has edit permissions
    const canEdit = profile?.data?.role === "admin" ||
        profile?.data?.role === "manager" ||
        (profile?.data?.permissions && Array.isArray(profile.data.permissions) && profile.data.permissions.includes("equipment:edit"));

    const { data: equipmentResponse, isLoading: isLoadingEquipment } = useEquipment({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
    });

    const { data: historyResponse, isLoading: isLoadingHistory } = useEquipmentHistory(
        selectedEquipmentId || ""
    );
    const { data: inspectionDue } = useInspectionDue(30);

    const updateInspectionMutation = useUpdateInspection();

    const equipment = equipmentResponse?.data?.equipment || [];
    const history: IEquipmentHistory | null = historyResponse?.data ? (historyResponse.data as IEquipmentHistory) : null;
    const historyList = history?.inspectionHistory || [];

    // Update form data when history is loaded
    useEffect(() => {
        if (history) {
            setFormData({
                equipmentCode: history.equipmentCode || "",
                equipmentName: history.equipmentName || "",
                serialNumber: history.serialNumber || "",
                operationDate: history.operationDate ? new Date(history.operationDate) : undefined,
                inspectionDate: history.inspectionDate ? new Date(history.inspectionDate) : undefined,
                inspectionSealNumber: history.inspectionSealNumber || "",
                nextInspectionDate: history.nextInspectionDate ? new Date(history.nextInspectionDate) : undefined,
            });
        }
    }, [history]);

    const handleSave = async () => {
        if (!selectedEquipmentId) return;

        try {
            const data = {
                equipmentCode: formData.equipmentCode,
                equipmentName: formData.equipmentName,
                serialNumber: formData.serialNumber,
                operationDate: formData.operationDate?.toISOString(),
                inspectionDate: formData.inspectionDate?.toISOString(),
                inspectionSealNumber: formData.inspectionSealNumber,
                nextInspectionDate: formData.nextInspectionDate?.toISOString(),
            };

            await updateInspectionMutation.mutateAsync({ id: selectedEquipmentId, data });

            setIsEditing(false);
            toast.success("Cập nhật lý lịch thiết bị thành công");
        } catch (error) {
            toast.error("Cập nhật thất bại");
        }
    };

    const handleCancel = () => {
        if (history) {
            setFormData({
                equipmentCode: history.equipmentCode || "",
                equipmentName: history.equipmentName || "",
                serialNumber: history.serialNumber || "",
                operationDate: history.operationDate ? new Date(history.operationDate) : undefined,
                inspectionDate: history.inspectionDate ? new Date(history.inspectionDate) : undefined,
                inspectionSealNumber: history.inspectionSealNumber || "",
                nextInspectionDate: history.nextInspectionDate ? new Date(history.nextInspectionDate) : undefined,
            });
        }
        setIsEditing(false);
    };

    // Calculate days until next inspection
    const getDaysUntilNextInspection = () => {
        if (!formData.nextInspectionDate) return null;
        const today = new Date();
        const nextDate = new Date(formData.nextInspectionDate);
        const diffTime = nextDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilNext = getDaysUntilNextInspection();
    const isExpiringSoon = daysUntilNext !== null && daysUntilNext <= 30 && daysUntilNext > 0;
    const isExpired = daysUntilNext !== null && daysUntilNext <= 0;

    return (
        <div className="space-y-3 md:space-y-4 bg-darkCardV1  p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/sys">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="#">Quản lý dụng cụ</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Lý lịch thiết bị</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
                        <div className="relative w-full md:w-80">
                            <Input
                                placeholder="Tìm kiếm thiết bị (tên, mã)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 py-2 w-full"
                            />
                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>
                        <Link href="/sys/equipment">
                            <Button variant="outline">
                                <Icon path={mdiTools} size={0.8} className="flex-shrink-0" />
                                Xem Danh sách dụng cụ
                            </Button>
                        </Link>
                    </div>

                    {inspectionDue?.data?.length > 0 && (
                        <Card className="p-3 border-amber-500/30 bg-amber-500/5 border">
                            <p className="text-sm text-amber-400">
                                Có {inspectionDue.data.length} thiết bị sắp đến hạn kiểm định (30 ngày).
                            </p>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
                        <Card className="lg:col-span-1 p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                            <div className="p-3 border-b border-darkBorderV1 font-semibold">
                                Chọn thiết bị xem lý lịch
                            </div>
                            {isLoadingEquipment ? (
                                <div className="p-4 space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                                    ))}
                                </div>
                            ) : (
                                <div className="max-h-[400px] overflow-y-auto">
                                    {equipment.length === 0 ? (
                                        <div className="p-4 text-center text-neutral-300 text-sm">
                                            Không có thiết bị
                                        </div>
                                    ) : (
                                        equipment.map((item: IEquipment) => (
                                            <button
                                                key={item._id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedEquipmentId(item._id);
                                                    setIsEditing(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 border-b border-darkBorderV1/50 hover:bg-darkBorderV1/30 transition-colors ${selectedEquipmentId === item._id
                                                    ? "bg-primary/20 border-l-4 border-l-primary"
                                                    : ""
                                                    }`}
                                            >
                                                <div className="font-medium text-neutral-300 truncate">
                                                    {item.equipmentName}
                                                </div>
                                                <div className="text-xs text-neutral-300">
                                                    {item.equipmentCode} • SL: {item.quantity}
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </Card>

                        <Card className="lg:col-span-2 p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                            <div className="p-3 border-b border-darkBorderV1 font-semibold flex flex-wrap items-center justify-between gap-2">
                                <span>Lý lịch thiết bị</span>
                                {canEdit && selectedEquipmentId && (
                                    <>
                                        {isEditing ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={handleCancel}
                                                >
                                                    <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                                    Hủy
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    onClick={handleSave}
                                                    disabled={updateInspectionMutation.isPending}
                                                >
                                                    <Icon path={mdiContentSave} size={0.8} className="flex-shrink-0" />
                                                    Lưu
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                Cập nhật
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>

                            {!selectedEquipmentId ? (
                                <div className="p-8 text-center text-neutral-300">
                                    Chọn một thiết bị bên trái để xem lý lịch kiểm định
                                </div>
                            ) : isLoadingHistory ? (
                                <div className="p-4 space-y-3 md:space-y-4">
                                    {[...Array(4)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 space-y-3 md:space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        <div className="space-y-2">
                                            <Label>
                                                Mã dụng cụ <span className="text-red-400 italic text-xs">(*)</span>
                                            </Label>
                                            <Input
                                                value={formData.equipmentCode}
                                                onChange={(e) => setFormData({ ...formData, equipmentCode: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="Nhập mã dụng cụ"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Tên dụng cụ <span className="text-red-400 italic text-xs">(*)</span>
                                            </Label>
                                            <Input
                                                value={formData.equipmentName}
                                                onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="Nhập tên dụng cụ"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Số chế tạo
                                            </Label>
                                            <Input
                                                value={formData.serialNumber}
                                                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="Nhập số chế tạo"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Ngày vận hành
                                            </Label>
                                            <DatePicker
                                                date={formData.operationDate}
                                                onDateChange={(date) => setFormData({ ...formData, operationDate: date })}
                                                disabled={!isEditing}
                                                placeholder="Chọn ngày vận hành"
                                                captionLayout="dropdown"
                                            />
                                        </div>
                                    </div>

                                    {/* Thông tin kiểm định */}
                                    <div className="border-t border-darkBorderV1 pt-4 mt-4">
                                        <h3 className="text-sm font-semibold text-neutral-300 mb-4">
                                            Thông tin kiểm định
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                            <div className="space-y-2">
                                                <Label>
                                                    Ngày kiểm định
                                                </Label>
                                                <DatePicker
                                                    date={formData.inspectionDate}
                                                    onDateChange={(date) => setFormData({ ...formData, inspectionDate: date })}
                                                    disabled={!isEditing}
                                                    placeholder="Chọn ngày kiểm định"
                                                    captionLayout="dropdown"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>
                                                    Số tem kiểm định
                                                </Label>
                                                <Input
                                                    value={formData.inspectionSealNumber}
                                                    onChange={(e) => setFormData({ ...formData, inspectionSealNumber: e.target.value })}
                                                    disabled={!isEditing}
                                                    placeholder="Nhập số tem kiểm định"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>
                                                    Hạn kiểm định tiếp theo
                                                </Label>
                                                <DatePicker
                                                    date={formData.nextInspectionDate}
                                                    onDateChange={(date) => setFormData({ ...formData, nextInspectionDate: date })}
                                                    disabled={!isEditing}
                                                    placeholder="Chọn ngày kiểm định tiếp theo"
                                                    captionLayout="dropdown"
                                                />
                                            </div>
                                        </div>

                                        {/* Thông báo hạn kiểm định */}
                                        {formData.nextInspectionDate && (
                                            <div className={`mt-4 p-3 rounded-lg ${isExpired
                                                ? "bg-red-500/10 border border-red-500/30"
                                                : isExpiringSoon
                                                    ? "bg-amber-500/10 border border-amber-500/30"
                                                    : "bg-green-500/10 border border-green-500/30"
                                                }`}>
                                                <p className={`text-sm ${isExpired
                                                    ? "text-red-400"
                                                    : isExpiringSoon
                                                        ? "text-amber-500"
                                                        : "text-green-500"
                                                    }`}>
                                                    {isExpired
                                                        ? `⚠️ Thiết bị đã hết hạn kiểm định (${Math.abs(daysUntilNext || 0)} ngày trước)`
                                                        : isExpiringSoon
                                                            ? `⚠️ Thiết bị sắp đến hạn kiểm định (${daysUntilNext} ngày)`
                                                            : `✅ Thiết bị còn ${daysUntilNext} ngày đến hạn kiểm định`
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-darkBorderV1 pt-4 mt-4">
                                        <h3 className="text-sm font-semibold text-neutral-300 mb-4">
                                            Lịch sử kiểm định
                                        </h3>
                                        <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                            <EquipmentHistoryTable
                                                equipmentId={selectedEquipmentId}
                                                history={historyList}
                                                isLoading={isLoadingHistory}
                                            />
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
