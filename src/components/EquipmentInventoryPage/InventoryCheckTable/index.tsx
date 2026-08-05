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
import { IInventoryCheck } from "@/interface/inventory";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { mdiEyeOutline, mdiTextBoxRemoveOutline, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface InventoryCheckTableProps {
    records: IInventoryCheck[];
    isLoading?: boolean;
    currentPage: number;
    pageSize: number;
    onView: (id: string) => void;
    onDelete: (id: string) => void;
    onPrint?: (id: string) => void;
    canDelete?: boolean;
}

export function InventoryCheckTable({ records, isLoading = false, currentPage, pageSize, onView, onDelete, onPrint, canDelete = true }: InventoryCheckTableProps) {
    return (
        <TooltipProvider>
            <div className="w-full overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Mã phiếu</TableHead>
                            <TableHead>Ngày kiểm</TableHead>
                            <TableHead>Loại kiểm kê</TableHead>
                            <TableHead>Người kiểm kê</TableHead>
                            <TableHead>Số mặt hàng</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(pageSize)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-8 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-12 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                        <Icon path={mdiTextBoxRemoveOutline} size={1} className="flex-shrink-0" />
                                        Chưa có phiếu kiểm kê nào
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((record, index) => {
                                const rowNumber = (currentPage - 1) * pageSize + index + 1;
                                const checker = (record as any).checkedBy || record.checkerId;
                                const itemCount = record.items?.length || 0;

                                return (
                                    <TableRow
                                        key={record._id}
                                        className="hover:bg-primary/5 transition-colors border-darkBorderV1 group cursor-pointer"
                                        onClick={() => onView(record._id)}
                                    >
                                        <TableCell className="text-center text-neutral-300 text-xs">{rowNumber}</TableCell>
                                        <TableCell
                                        >
                                            <Badge variant="green" className="font-medium">{record.checkCode}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="neutral">{format(new Date(record.checkDate), "dd/MM/yyyy", { locale: vi })}</Badge>
                                        </TableCell>
                                        <TableCell className="text-neutral-300">
                                            <Badge variant="neutral">{record.checkType === 'weekly' ? 'Hàng tuần' :
                                                record.checkType === 'monthly' ? 'Hàng tháng' :
                                                    record.checkType === 'quarterly' ? 'Hàng quý' :
                                                        record.checkType}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="neutral">
                                                {checker?.fullName || "-"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="cyan">{itemCount}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={record.status === 'completed' ? 'green' : 'orange'}>
                                                {record.status === 'completed' ? 'Hoàn tất' : 'Lưu nháp'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <motion.div
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onView(record._id);
                                                                }}
                                                            >
                                                                <Icon path={mdiEyeOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Xem chi tiết
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </motion.div>

                                                {canDelete && (
                                                    <motion.div
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onDelete(record._id);
                                                                    }}
                                                                >
                                                                    <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Xóa phiếu kiểm kê
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </motion.div>
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
        </TooltipProvider>
    );
}
