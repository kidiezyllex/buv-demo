"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { IContract } from "@/interface/contract";
import { mdiEyeOutline, mdiFileDocumentRemoveOutline, mdiLinkVariant, mdiSquareEditOutline, mdiTrashCanOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import Link from "next/link";

interface ContractTableProps {
    contracts: IContract[];
    isLoading?: boolean;
    onView: (contract: IContract) => void;
    onEdit: (contract: IContract) => void;
    onDelete: (id: string) => void;
    currentPage?: number;
    pageSize?: number;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export function ContractTable({
    contracts,
    isLoading = false,
    onView,
    onEdit,
    onDelete,
    currentPage = 1,
    pageSize = 10,
    canUpdate = true,
    canDelete = true,
}: ContractTableProps) {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case "paid": return "green";
            case "unpaid": return "red";
            case "advanced": return "yellow";
            default: return "secondary";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "paid": return "Đã thanh toán";
            case "unpaid": return "Chưa thanh toán";
            case "advanced": return "Tạm ứng";
            default: return status;
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "dd/MM/yyyy", { locale: vi });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="w-full overflow-auto border border-darkBorderV1 rounded-md bg-darkCardV1/30">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Số hợp đồng</TableHead>
                        <TableHead>Đối tác</TableHead>
                        <TableHead>Hạng mục thi công</TableHead>
                        <TableHead>Ngày ký</TableHead>
                        <TableHead>Ngày quyết toán</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i} className="border-b border-darkBorderV1/50">
                                <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : contracts.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8}>
                                <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiFileDocumentRemoveOutline} size={1} className="flex-shrink-0" />
                                    Chưa có hợp đồng nào
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        contracts.map((contract, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            const partnerName = typeof contract.partner === 'object'
                                ? (contract.partner.partnerName || contract.partner.name || "-")
                                : contract.partner;

                            return (
                                <TableRow
                                    key={contract._id}
                                    className="border-b border-darkBorderV1/50 hover:bg-darkBorderV1/20 transition-colors cursor-pointer"
                                    onClick={() => onView(contract)}
                                >
                                    <TableCell className="text-neutral-300 font-medium">{rowNumber}</TableCell>
                                    <TableCell className="w-[240px] min-w-[240px]">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-primary">{contract.contractNumber}</span>
                                            {contract.contractFile && (
                                                <Link
                                                    href={contract.contractFile}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline underline-offset-4 text-sm w-fit"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Icon path={mdiLinkVariant} size={0.6} className="flex-shrink-0" />
                                                    Click để xem và tải xuống
                                                </Link>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-neutral-300 min-w-[200px] w-[200px]">
                                        {partnerName}
                                    </TableCell>
                                    <TableCell className="min-w-[300px] w-[300px] text-neutral-300" title={contract.constructionItem}>
                                        {contract.constructionItem}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{formatDate(contract.signingDate)}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{formatDate(contract.finalizationDate)}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(contract.status)}>
                                            {getStatusLabel(contract.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onView(contract);
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

                                            {canUpdate && (
                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onEdit(contract);
                                                                }}
                                                            >
                                                                <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Cập nhật hợp đồng
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </motion.div>
                                            )}

                                            {canDelete && (
                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDelete(contract._id);
                                                                }}
                                                            >
                                                                <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Xóa hợp đồng
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
    );
}
