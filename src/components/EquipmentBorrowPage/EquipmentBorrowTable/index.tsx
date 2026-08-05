"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDeleteBorrowRecord } from "@/hooks/useEquipment";
import { usePermissions } from "@/hooks/usePermissions";
import { IBorrowReturn } from "@/interface/equipment";
import { mdiEyeOutline, mdiPackageDown, mdiTextBoxRemoveOutline, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";
import { BorrowDetailsDialog } from "../BorrowDetailsDialog";

interface EquipmentBorrowTableProps {
    records: IBorrowReturn[];
    isLoading?: boolean;
    onReturn: (record: IBorrowReturn) => void;
    currentPage?: number;
    pageSize?: number;
}

export function EquipmentBorrowTable({
    records,
    isLoading = false,
    onReturn,
    currentPage = 1,
    pageSize = 10,
}: EquipmentBorrowTableProps) {
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<IBorrowReturn | null>(null);

    const { mutateAsync: deleteRecord, isPending: isDeleting } = useDeleteBorrowRecord();
    const { isAdmin } = usePermissions();

    const handleRowClick = (recordId: string) => {
        setSelectedRecordId(recordId);
        setIsDetailsOpen(true);
    };

    return (
        <>
            <BorrowDetailsDialog
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedRecordId(null);
                }}
                recordId={selectedRecordId}
            />

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                isDeleting={isDeleting}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setRecordToDelete(null);
                }}
                onConfirm={async () => {
                    if (recordToDelete) {
                        await deleteRecord(recordToDelete._id);
                    }
                }}
                title="Xóa phiếu mượn thiết bị"
                description={`Bạn có chắc chắn muốn xóa phiếu mượn ${recordToDelete?.recordCode}? Hành động này không thể hoàn tác.`}
                confirmText="Xác nhận xóa"
                successMessage="Xóa phiếu mượn trả thành công"
                errorMessage="Có lỗi xảy ra khi xóa phiếu mượn"
            />

            <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Mã phiếu</TableHead>
                            <TableHead>Người mượn</TableHead>
                            <TableHead>Ngày mượn</TableHead>
                            <TableHead>Số lượng</TableHead>
                            <TableHead>Tình trạng mượn</TableHead>
                            <TableHead>Ngày trả</TableHead>
                            <TableHead>Thủ kho</TableHead>
                            <TableHead>Thủ trưởng</TableHead>
                            <TableHead>Kỹ thuật</TableHead>
                            <TableHead>Tình trạng trả</TableHead>
                            <TableHead>Ghi chú</TableHead>
                            <TableHead>Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(pageSize)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={13}>
                                    <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                        <Icon path={mdiTextBoxRemoveOutline} size={1} className="flex-shrink-0" />
                                        Chưa có phiếu mượn trả nào
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((record: IBorrowReturn, index: number) => {
                                const rowNumber = (currentPage - 1) * pageSize + index + 1;
                                const borrower = typeof record.borrowerId === 'object' ? record.borrowerId : null;

                                return (
                                    <TableRow
                                        key={record._id}
                                        className="hover:bg-primary/5 transition-colors cursor-pointer group"
                                        onClick={() => handleRowClick(record._id)}
                                    >
                                        <TableCell className="text-center text-neutral-300 text-sm">{rowNumber}</TableCell>
                                        <TableCell>
                                            <Badge variant="green">{record.recordCode || "Chưa có mã"}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="neutral">
                                                {borrower?.fullName || record.borrowerName || "-"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="neutral">{record.borrowDate ? format(new Date(record.borrowDate), "dd/MM/yyyy", { locale: vi }) : "Chưa rõ"}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="cyan">
                                                {record.quantity || record.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge
                                                    variant={
                                                        record.status === "returned"
                                                            ? "green"
                                                            : record.status === "partially_returned"
                                                                ? "blue"
                                                                : record.status === "overdue"
                                                                    ? "red"
                                                                    : record.status === "pending"
                                                                        ? "orange"
                                                                        : "orange"
                                                    }
                                                >
                                                    {record.status === "borrowed"
                                                        ? "Đã mượn"
                                                        : record.status === "returned"
                                                            ? "Đã trả"
                                                            : record.status === "partially_returned"
                                                                ? "Trả một phần"
                                                                : record.status === "pending"
                                                                    ? "Chờ duyệt"
                                                                    : "Quá hạn"}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="neutral">{record.returnDate || record.items?.[0]?.returnDate ? format(new Date(record.returnDate || record.items?.[0]?.returnDate!), "dd/MM/yyyy", { locale: vi }) : "Chưa trả"}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 min-w-[120px]">
                                                <Badge variant="neutral">
                                                    {record.storekeeperId && typeof record.storekeeperId === 'object' ? record.storekeeperId?.fullName : "-"}
                                                </Badge>
                                                <Badge variant={record.isStorekeeperSigned ? "green" : "orange"} className="w-fit">
                                                    {record.isStorekeeperSigned ? "Đã ký" : "Chờ ký"}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 min-w-[120px]">
                                                <Badge variant="neutral">
                                                    {record.unitHeadId && typeof record.unitHeadId === 'object' ? record.unitHeadId?.fullName : "-"}
                                                </Badge>
                                                <Badge variant={record.isUnitHeadSigned ? "green" : "orange"} className="w-fit">
                                                    {record.isUnitHeadSigned ? "Đã ký" : "Chờ ký"}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 min-w-[120px]">
                                                <Badge variant="neutral">
                                                    {record.technicalStaffId && typeof record.technicalStaffId === 'object' ? record.technicalStaffId?.fullName : "-"}
                                                </Badge>
                                                <Badge variant={record.isTechnicalStaffSigned ? "green" : "orange"} className="w-fit">
                                                    {record.isTechnicalStaffSigned ? "Đã ký" : "Chờ ký"}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-300 min-w-[180px]">
                                            {record.returnCondition || record.items?.[0]?.returnCondition || <span className="text-neutral-400 italic">
                                                Chưa có thông tin
                                            </span>}
                                        </TableCell>
                                        <TableCell className="text-neutral-300 max-w-[150px] truncate">
                                            {record.notes || <span className="text-neutral-400 italic">
                                                Không có ghi chú
                                            </span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRowClick(record._id);
                                                            }}
                                                        >
                                                            <Icon path={mdiEyeOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Chi tiết mượn thiết bị</TooltipContent>
                                                </Tooltip>

                                                {record.status !== "returned" && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onReturn(record);
                                                                }}
                                                            >
                                                                <Icon path={mdiPackageDown} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Trả thiết bị
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}

                                                {isAdmin && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setRecordToDelete(record);
                                                                    setIsDeleteDialogOpen(true);
                                                                }}
                                                            >
                                                                <Icon path={mdiTrashCanOutline} size={0.8} />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Xóa phiếu mượn</TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
