"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IBackupHistory } from "@/interface/backup";
import { mdiDatabaseExport, mdiDatabaseImport, mdiDatabaseOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface BackupHistoryTableProps {
    history: IBackupHistory[];
    isLoading?: boolean;
    currentPage?: number;
    pageSize?: number;
}

export function BackupHistoryTable({
    history,
    isLoading = false,
    currentPage = 1,
    pageSize = 10,
}: BackupHistoryTableProps) {
    const formatDateTime = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "HH:mm dd/MM/yyyy", { locale: vi });
        } catch {
            return dateStr;
        }
    };

    const getPerformerName = (performedBy: IBackupHistory["performedBy"]) => {
        if (typeof performedBy === "object" && performedBy !== null) {
            return performedBy.fullName || "-";
        }
        return performedBy || "-";
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Tên file</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                    <TableHead>Số bản ghi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    [...Array(pageSize)].map((_, i) => (
                        <TableRow key={i} className="border-b border-darkBorderV1/50">
                            <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                        </TableRow>
                    ))
                ) : history.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7}>
                            <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                <Icon path={mdiDatabaseOutline} size={1} className="flex-shrink-0" />
                                Chưa có lịch sử sao lưu nào
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    history.map((item, index) => {
                        const rowNumber = (currentPage - 1) * pageSize + index + 1;
                        return (
                            <TableRow key={item._id} className="border-b border-darkBorderV1/50">
                                <TableCell className="text-neutral-300 font-medium">{rowNumber}</TableCell>
                                <TableCell>
                                    <Badge variant={item.type === "backup" ? "blue" : "orange"}>
                                        <Icon
                                            path={item.type === "backup" ? mdiDatabaseExport : mdiDatabaseImport}
                                            size={0.6}
                                            className="flex-shrink-0 mr-1"
                                        />
                                        {item.type === "backup" ? "Sao lưu" : "Phục hồi"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-neutral-300">{item.fileName}</TableCell>
                                <TableCell className="text-neutral-300">{getPerformerName(item.performedBy)}</TableCell>
                                <TableCell>
                                    <Badge variant="green">{item.totalRecords}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.status === "success" ? "green" : "red"}>
                                        {item.status === "success" ? "Thành công" : "Thất bại"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="neutral">
                                        {formatDateTime(item.createdAt)}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );
}
