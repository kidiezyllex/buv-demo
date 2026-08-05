"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ITask } from "@/interface/task";
import Icon from "@mdi/react";
import { mdiSquareEditOutline, mdiTrashCanOutline } from "@mdi/js";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskTableProps {
    tasks: ITask[];
    isLoading?: boolean;
    onEdit: (task: ITask) => void;
    onDelete: (id: string) => void;
    currentPage?: number;
    pageSize?: number;
}

function formatDate(d: string) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

const statusMap: Record<string, { label: string; variant: "green" | "orange" | "destructive" | "default" }> = {
    pending: { label: "Chờ xử lý", variant: "default" },
    "in-progress": { label: "Đang thực hiện", variant: "orange" },
    completed: { label: "Hoàn thành", variant: "green" },
    overdue: { label: "Quá hạn", variant: "destructive" },
};

export function TaskTable({
    tasks,
    isLoading = false,
    onEdit,
    onDelete,
    currentPage = 1,
    pageSize = 10,
}: TaskTableProps) {
    return (
        <div className="w-full overflow-auto border border-darkBackgroundV1 rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Nội dung</TableHead>
                        <TableHead>Người giao</TableHead>
                        <TableHead>Người nhận</TableHead>
                        <TableHead>Hạn chót</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(pageSize)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-6 w-8" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : tasks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7}>
                                <div className="text-center text-neutral-300 text-sm py-10 italic flex items-center justify-center gap-1">
                                    <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                    Chưa có công việc nào
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        tasks.map((task, index) => {
                            const rowNumber = (currentPage - 1) * pageSize + index + 1;
                            const status = statusMap[task.status] || { label: task.status, variant: "default" };
                            return (
                                <TableRow
                                    key={task._id}
                                    className="hover:bg-darkBorderV1/50 transition-colors cursor-pointer"
                                    onClick={() => onEdit(task)}
                                >
                                    <TableCell>{rowNumber}</TableCell>
                                    <TableCell className="max-w-[200px] truncate" title={task.taskContent}>
                                        {task.taskContent}
                                    </TableCell>
                                    <TableCell>{task.assignerName}</TableCell>
                                    <TableCell>{task.assigneeName}</TableCell>
                                    <TableCell>{formatDate(task.deadline)}</TableCell>
                                    <TableCell>
                                        <Badge variant={status.variant}>{status.label}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TooltipProvider>
                                            <div className="flex justify-end gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit(task);
                                                            }}
                                                        >
                                                            <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Cập nhật</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="destructive"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDelete(task._id);
                                                            }}
                                                        >
                                                            <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Xóa</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
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
