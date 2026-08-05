"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { IEquipmentHistory, IInspectionHistoryItem } from "@/interface/equipment";

interface EquipmentHistoryTableProps {
    equipmentId: string;
    history: IEquipmentHistory | IInspectionHistoryItem[] | any[];
    isLoading?: boolean;
}

function formatDate(d: string) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function EquipmentHistoryTable({ equipmentId, history, isLoading = false }: EquipmentHistoryTableProps) {
    const items: IInspectionHistoryItem[] = Array.isArray(history)
        ? history.filter((x) => x?.inspectionDate || x?.nextInspectionDate)
        : (history as IEquipmentHistory)?.inspectionHistory || [];

    if (!isLoading && items.length === 0) {
        return (
            <div className="p-8 text-center text-neutral-300">
                Thiết bị này chưa có lịch sử kiểm định
            </div>
        );
    }

    return (
        <div className="w-full overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ngày kiểm định</TableHead>
                        <TableHead>Số tem kiểm định</TableHead>
                        <TableHead>Ngày kiểm định tiếp theo</TableHead>
                        <TableHead>Cập nhật lúc</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                            </TableRow>
                        ))
                    ) : (
                        items.map((item: any, index: number) => (
                            <TableRow key={item._id || index}>
                                <TableCell>{formatDate(item.inspectionDate)}</TableCell>
                                <TableCell>{item.inspectionSealNumber || "-"}</TableCell>
                                <TableCell>
                                    <span className={item.nextInspectionDate && new Date(item.nextInspectionDate) < new Date() ? "text-red-400" : ""}>
                                        {formatDate(item.nextInspectionDate)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-neutral-300 text-sm">
                                    {formatDate(item.updatedAt)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
