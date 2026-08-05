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
import { useMe } from "@/hooks/useAuth";
import { useDeletePaymentRecord } from "@/hooks/usePaymentRecords";
import { IPaymentRecord } from "@/interface/paymentRecord";
import { mdiEyeOutline, mdiSquareEditOutline, mdiTextBoxRemoveOutline, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";
import { PaymentRecordDetailsDialog } from "../PaymentRecordDetailsDialog";
import { UpdatePaymentDialog } from "../UpdatePaymentDialog";

interface PaymentRecordTableProps {
    records: IPaymentRecord[];
    isLoading?: boolean;
    currentPage?: number;
    pageSize?: number;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "APPROVED":
            return <Badge variant="green">Đã duyệt</Badge>;
        case "REJECTED":
            return <Badge variant="red">Từ chối</Badge>;
        case "PAID":
            return <Badge variant="blue">Đã thanh toán</Badge>;
        case "PENDING":
        default:
            return <Badge variant="orange">Chờ duyệt</Badge>;
    }
};

const getTypeBadge = (type: string) => {
    switch (type) {
        case "PAYMENT":
            return <Badge variant="sky">Đề nghị thanh toán</Badge>;
        case "ADVANCE":
            return <Badge variant="teal">Đề nghị tạm ứng</Badge>;
        default:
            return <Badge variant="secondary">{type}</Badge>;
    }
};

const formatAmount = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export function PaymentRecordTable({
    records,
    isLoading = false,
    currentPage = 1,
    pageSize = 10,
}: PaymentRecordTableProps) {
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [recordToDeleteId, setRecordToDeleteId] = useState<string | null>(null);
    const [isFromDetails, setIsFromDetails] = useState(false);

    const { mutateAsync: deleteRecord, isPending: isDeleting } = useDeletePaymentRecord();
    const { data: meRes } = useMe();
    const userRole = meRes?.data?.role || "";

    const handleRowClick = (id: string, action: "view" | "update" = "view") => {
        setIsFromDetails(false);
        setSelectedRecordId(id);
        if (action === "view") {
            setIsDetailsOpen(true);
        } else {
            setIsUpdateOpen(true);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setRecordToDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (recordToDeleteId) {
            await deleteRecord(recordToDeleteId);
        }
    };

    return (
        <>
            <PaymentRecordDetailsDialog
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedRecordId(null);
                }}
                recordId={selectedRecordId}
                onUpdateClick={() => {
                    setIsDetailsOpen(false);
                    setIsUpdateOpen(true);
                    setIsFromDetails(true);
                }}
            />

            <UpdatePaymentDialog
                isOpen={isUpdateOpen}
                onClose={() => {
                    setIsUpdateOpen(false);
                    if (isFromDetails) {
                        setIsDetailsOpen(true);
                        setIsFromDetails(false);
                    } else {
                        setSelectedRecordId(null);
                    }
                }}
                recordId={selectedRecordId}
            />

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                isDeleting={isDeleting}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setRecordToDeleteId(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Xóa hồ sơ thanh toán"
                description="Hành động này không thể hoàn tác. Hồ sơ sẽ bị xóa vĩnh viễn khỏi hệ thống."
                confirmText="Xanh nhận xóa"
                successMessage="Xóa hồ sơ thanh toán thành công"
                errorMessage="Có lỗi xảy ra khi xóa hồ sơ"
            />
            <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Mã hồ sơ</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Người đề nghị</TableHead>
                            <TableHead>Số tiền</TableHead>
                            <TableHead>Nội dung / Công trình</TableHead>
                            <TableHead>Phụ trách bộ phận<br /><span>(Tổ trưởng)</span></TableHead>
                            <TableHead>Kế toán /<br /><span>Kế toán trưởng</span></TableHead>
                            <TableHead>Giám đốc /<br /><span>Người duyệt</span></TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(pageSize)].map((_, i) => (
                                <TableRow key={i}>
                                    {[...Array(13)].map((__, j) => (
                                        <TableCell key={j}><Skeleton className="h-6 w-20" /></TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={13}>
                                    <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                        <Icon path={mdiTextBoxRemoveOutline} size={1} className="flex-shrink-0" />
                                        Chưa có hồ sơ thanh toán nào
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((record, index) => {
                                const rowNumber = (currentPage - 1) * pageSize + index + 1;
                                const requester = typeof record.requesterId === "object" ? record.requesterId : null;
                                const requesterName = requester?.fullName || record.requesterName || "Chưa xác định";

                                const departmentHead = record.type === "ADVANCE"
                                    ? (typeof record.departmentHeadId === "object" ? record.departmentHeadId : null)
                                    : null;
                                const deptHeadSigned = record.type === "ADVANCE" ? record.isDepartmentHeadSigned : false;

                                const accountantOrKTT = record.type === "PAYMENT"
                                    ? (typeof record.accountantId === "object" ? record.accountantId : null)
                                    : (typeof record.chiefAccountantId === "object" ? record.chiefAccountantId : null);
                                const accountantOrKTTSigned = record.type === "PAYMENT" ? record.isAccountantSigned : record.isChiefAccountantSigned;

                                const directorOrApprover = record.type === "PAYMENT"
                                    ? (typeof record.approverId === "object" ? record.approverId : null)
                                    : (typeof record.directorId === "object" ? record.directorId : null);
                                const directorOrApproverSigned = record.type === "PAYMENT" ? record.isApproverSigned : record.isDirectorSigned;

                                const descriptionText = record.type === "PAYMENT" ? record.content : record.projectName;

                                return (
                                    <TableRow
                                        key={record._id}
                                        className="hover:bg-primary/5 transition-colors cursor-pointer"
                                        onClick={(e) => {
                                            // Only trigger if clicking the row itself, not a button
                                            if (!(e.target as HTMLElement).closest('button')) {
                                                handleRowClick(record._id);
                                            }
                                        }}
                                    >
                                        <TableCell className="text-center text-neutral-300 text-sm">{rowNumber}</TableCell>
                                        <TableCell className="font-medium text-primary uppercase">
                                            <Badge variant="green">{record.recordCode || "Chưa có mã"}</Badge>
                                        </TableCell>
                                        <TableCell>{getTypeBadge(record.type)}</TableCell>
                                        <TableCell>
                                            <Badge variant="neutral">
                                                {requesterName}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="neutral">{formatAmount(record.amount)}</Badge>
                                        </TableCell>
                                        <TableCell className="text-neutral-300 max-w-[180px] truncate">
                                            {descriptionText || "—"}
                                        </TableCell>
                                        {/* Phụ trách bộ phận (Tổ trưởng) — ADVANCE only */}
                                        <TableCell>
                                            {record.type === "ADVANCE" ? (
                                                <div className="flex flex-col gap-1 min-w-[110px]">
                                                    <Badge variant="neutral">
                                                        {departmentHead?.fullName || "Chưa phân công"}
                                                    </Badge>
                                                    <Badge variant={deptHeadSigned ? "green" : "orange"} className="w-fit">
                                                        {deptHeadSigned ? "Đã ký" : "Chờ ký"}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <span className="text-neutral-500 text-sm">—</span>
                                            )}
                                        </TableCell>

                                        {/* Kế toán (PAYMENT) / Kế toán trưởng (ADVANCE) */}
                                        <TableCell>
                                            <div className="flex flex-col gap-1 min-w-[110px]">
                                                <Badge variant="neutral">
                                                    {accountantOrKTT?.fullName || "Chưa phân công"}
                                                </Badge>
                                                <Badge variant={accountantOrKTTSigned ? "green" : "orange"} className="w-fit">
                                                    {accountantOrKTTSigned ? "Đã ký" : "Chờ ký"}
                                                </Badge>
                                            </div>
                                        </TableCell>

                                        {/* Giám đốc (ADVANCE) / Người duyệt (PAYMENT) */}
                                        <TableCell>
                                            <div className="flex flex-col gap-1 min-w-[110px]">
                                                <Badge variant="neutral">
                                                    {directorOrApprover?.fullName || "Chưa phân công"}
                                                </Badge>
                                                <Badge variant={directorOrApproverSigned ? "green" : "orange"} className="w-fit">
                                                    {directorOrApproverSigned ? "Đã ký" : "Chờ ký"}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                                        <TableCell>
                                            <Badge variant="neutral">
                                                {format(new Date(record.createdAt), "dd/MM/yyyy", { locale: vi })}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end space-x-2">
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
                                                    <TooltipContent>Xem chi tiết</TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRowClick(record._id, "update");
                                                            }}
                                                        >
                                                            <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Cập nhật</TooltipContent>
                                                </Tooltip>

                                                {userRole === "admin" && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                onClick={(e) => handleDeleteClick(e, record._id)}
                                                            >
                                                                <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Xóa hồ sơ</TooltipContent>
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
            </div >
        </>
    );
}
