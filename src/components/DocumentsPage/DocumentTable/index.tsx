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
import { DocumentType, IDocument } from "@/interface/document";
import {
    mdiEyeOutline,
    mdiFileDocumentRemoveOutline,
    mdiLinkVariant,
    mdiSquareEditOutline,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import Link from "next/link";

interface DocumentTableProps {
    documents: IDocument[];
    isLoading?: boolean;
    onView: (document: IDocument) => void;
    onEdit: (document: IDocument) => void;
    onDelete: (id: string) => void;
    currentPage?: number;
    pageSize?: number;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export function DocumentTable({
    documents,
    isLoading = false,
    onView,
    onEdit,
    onDelete,
    currentPage = 1,
    pageSize = 10,
    canUpdate = true,
    canDelete = true,
}: DocumentTableProps) {

    const getTypeLabel = (type: DocumentType) => {
        switch (type) {
            case "incoming": return "Công văn đến";
            case "outgoing": return "Công văn đi";
            case "notification": return "Thông báo";
            case "decision": return "Quyết định";
            case "template": return "Mẫu văn bản";
            case "construction_profile": return "Hồ sơ công trình";
            case "guide": return "Tài liệu hướng dẫn";
            default: return type;
        }
    };

    const getTypeVariant = (type: DocumentType) => {
        switch (type) {
            case "incoming": return "blue";
            case "outgoing": return "orange";
            case "notification": return "purple";
            case "decision": return "red";
            case "template": return "green";
            case "construction_profile": return "cyan";
            case "guide": return "yellow";
            default: return "secondary";
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try {
            return format(new Date(dateStr), "dd/MM/yyyy", { locale: vi });
        } catch {
            return dateStr;
        }
    };

    const getDocumentDate = (doc: IDocument) => {
        if (doc.type === "incoming") return doc.receivedDate;
        return doc.issuedDate;
    };

    return (
        <div className="w-full overflow-auto border border-darkBorderV1 rounded-md bg-darkCardV1/30">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Số hiệu</TableHead>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead>Loại văn bản</TableHead>
                        <TableHead>Đối tác / Nguồn</TableHead>
                        <TableHead>Ngày ban hành/nhận</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i} className="border-b border-darkBorderV1/50">
                                <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : documents.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                    <Icon path={mdiFileDocumentRemoveOutline} size={1} className="flex-shrink-0" />
                                    Chưa có văn bản nào
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        documents.map((doc, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            const partnerName = typeof doc.partner === 'object'
                                ? (doc.partner.partnerName || "-")
                                : doc.sender || "-";

                            return (
                                <TableRow
                                    key={doc._id}
                                    className="border-b border-darkBorderV1/50 hover:bg-darkBorderV1/20 transition-colors cursor-pointer"
                                    onClick={() => onView(doc)}
                                >
                                    <TableCell className="text-neutral-300 font-medium">{rowNumber}</TableCell>
                                    <TableCell className="w-[240px] min-w-[240px]">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-neutral-300">{doc.documentNumber}</span>
                                            {doc.fileUrl && (
                                                <Link
                                                    href={doc.fileUrl}
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
                                    <TableCell className="min-w-[300px] w-[300px] text-neutral-300">
                                        {doc.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getTypeVariant(doc.type)}>
                                            {getTypeLabel(doc.type)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-neutral-300 max-w-[200px] truncate">
                                        {partnerName}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">
                                            {formatDate(getDocumentDate(doc))}
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
                                                                onView(doc);
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

                                            {canUpdate && doc.type !== "template" && (
                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onEdit(doc);
                                                                }}
                                                            >
                                                                <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Cập nhật văn bản
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
                                                                    onDelete(doc._id);
                                                                }}
                                                            >
                                                                <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Xóa văn bản
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
