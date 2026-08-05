"use client";

import { useState } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { motion } from "framer-motion";
import {
    useConstructionLogs,
    useStartNewDay,
    useDeleteLog,
} from "@/hooks/useTasks";
import { ConstructionLogsTable } from "./ConstructionLogsTable";
import { CreateConstructionLogDialog } from "./CreateConstructionLogDialog";
import { ConstructionLogsDetailsDialog } from "./ConstructionLogsDetailsDialog";
import { EndShiftDialog } from "./EndShiftDialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { IConstructionLog } from "@/interface/task";
import Icon from "@mdi/react";
import { mdiBookPlusOutline, mdiMagnify, mdiRefresh } from "@mdi/js";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { downloadConstructionLogDoc, generateConstructionLogHtml } from "./utils/exportTemplate";
import { usePermissions } from "@/hooks/usePermissions";

export default function ConstructionLogsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isEndShiftDialogOpen, setIsEndShiftDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<IConstructionLog | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const { hasPermission } = usePermissions();
    const canAdd = hasPermission("construction-logs:add");
    const canUpdate = hasPermission("construction-logs:update");
    const canDelete = hasPermission("construction-logs:delete");


    const { data: logsResponse, isLoading, isFetching, refetch } = useConstructionLogs({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sort: sortOrder === "desc" ? "-logDate" : "logDate",
    });
    const { mutate: startNewDay } = useStartNewDay();
    const { mutate: deleteLogMutation, isPending: isDeleting } = useDeleteLog();

    const logs = logsResponse?.data?.logs || logsResponse?.data || [];
    const logList = Array.isArray(logs) ? logs : [];
    const totalItems = logsResponse?.data?.pagination?.total || logList.length;
    const totalPages = logsResponse?.data?.pagination?.totalPages || 1;

    const handleRefresh = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setSortOrder("desc");
        setCurrentPage(1);
        refetch();
    };

    const handleView = (log: IConstructionLog, isEditing: boolean = false) => {
        setSelectedLog(log);
        setIsDetailsDialogOpen(true);
        setIsEditingDetails(isEditing);
    };

    const handleEndShift = (log: IConstructionLog) => {
        setSelectedLog(log);
        setIsEndShiftDialogOpen(true);
    };

    const handleRenewLog = (log: IConstructionLog) => {
        const today = new Date().toISOString().split('T')[0];
        startNewDay({
            newDate: today,
            projectName: log.projectName,
            constructionName: log.constructionName
        });
    };

    const handleExport = (log: IConstructionLog) => {
        const html = generateConstructionLogHtml(log);
        downloadConstructionLogDoc(html, log.projectName);
    };

    const handleDelete = (id: string) => {
        setSelectedLog(logList.find((l: IConstructionLog) => l._id === id) || null);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedLog) return;
        return new Promise((resolve, reject) => {
            deleteLogMutation(selectedLog._id, {
                onSuccess: () => {
                    setSelectedLog(null);
                    resolve(true);
                },
                onError: (error) => {
                    reject(error);
                }
            });
        });
    };

    const [isEditingDetails, setIsEditingDetails] = useState(false);

    return (
        <div className="space-y-3 md:space-y-4 bg-darkCardV1  p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/sys">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="#">Quản lý thi công</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Nhật ký thi công</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="relative w-full flex-1 min-w-[300px]">
                            <Input
                                placeholder="Tìm theo dự án, công trường..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 py-2 w-full"
                            />
                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="active">Mới tạo</SelectItem>
                                    <SelectItem value="updated">Đã cập nhật</SelectItem>
                                    <SelectItem value="completed">Đã hoàn thành</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Sắp xếp ngày" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Mới nhất trước</SelectItem>
                                    <SelectItem value="asc">Cũ nhất trước</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={handleRefresh}
                                disabled={isFetching}
                                title="Reset bộ lọc"
                                variant="ghost"
                            >
                                <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                Reset bộ lọc
                            </Button>

                            {canAdd && (
                                <Button
                                    onClick={() => {
                                        setSelectedLog(null);
                                        setIsCreateDialogOpen(true);
                                    }}
                                >
                                    <Icon path={mdiBookPlusOutline} size={0.8} className="flex-shrink-0" />
                                    Tạo nhật ký
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <ConstructionLogsTable
                            logs={logList}
                            isLoading={isLoading || isFetching}
                            onView={handleView}
                            onDelete={handleDelete}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                        />
                    </Card>

                    {totalItems > pageSize && (
                        <div className="flex justify-center">
                            <Pagination
                                page={currentPage}
                                pageSize={pageSize}
                                total={totalItems}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </motion.div>

            <CreateConstructionLogDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
            />

            <ConstructionLogsDetailsDialog
                isOpen={isDetailsDialogOpen}
                logId={selectedLog?._id || null}
                initialIsEditing={isEditingDetails}
                onClose={() => {
                    setIsDetailsDialogOpen(false);
                    setSelectedLog(null);
                    setIsEditingDetails(false);
                }}
                onEndShift={() => selectedLog && handleEndShift(selectedLog)}
                onRenewLog={() => selectedLog && handleRenewLog(selectedLog)}
            />

            <EndShiftDialog
                isOpen={isEndShiftDialogOpen}
                onClose={() => {
                    setIsEndShiftDialogOpen(false);
                    setSelectedLog(null);
                }}
                log={selectedLog}
            />

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                isDeleting={isDeleting}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title={`Xóa nhật ký: ${selectedLog?.constructionName || ""}`}
                description="Bạn có chắc chắn muốn xóa nhật ký này không? Hành động này không thể hoàn tác."
                confirmText="Xóa nhật ký"
                successMessage="Xóa nhật ký thành công"
                errorMessage="Xóa nhật ký thất bại"
            />

        </div>
    );
}
