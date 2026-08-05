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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { mdiMagnify, mdiRefresh, mdiClipboardCheckOutline } from "@mdi/js";
import { useInventoryChecks, useDeleteInventoryCheck, usePrintInventoryCheck } from "@/hooks/useEquipment";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { InventoryCheckTable } from "./InventoryCheckTable";
import { InventoryCheckDialog } from "./InventoryCheckDialog";
import { InventoryDetailsDialog } from "./InventoryDetailsDialog";
import Icon from "@mdi/react";
import { usePermissions } from "@/hooks/usePermissions";

export default function EquipmentInventoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [checkType, setCheckType] = useState<string>("all");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const { hasPermission } = usePermissions();
    const canAdd = hasPermission("equipment-inventory:add");
    const canDelete = hasPermission("equipment-inventory:delete");

    const { data: inventoryResponse, isLoading, isFetching, refetch } = useInventoryChecks({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        checkType: checkType === "all" ? undefined : checkType,
    });

    const { mutate: deleteCheck, isPending: isDeleting } = useDeleteInventoryCheck();
    const { mutate: printCheck } = usePrintInventoryCheck();

    const handleRefresh = () => {
        setSearchQuery("");
        setCheckType("all");
        setCurrentPage(1);
        refetch();
    };

    const records = inventoryResponse?.data?.records || [];
    const totalItems = inventoryResponse?.data?.pagination?.total || records.length;
    const totalPages = inventoryResponse?.data?.pagination?.totalPages || 1;

    const handleView = (id: string) => {
        setSelectedRecordId(id);
        setIsDetailsOpen(true);
    };

    const handleDelete = (id: string) => {
        setSelectedRecordId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedRecordId) return;
        return deleteCheck(selectedRecordId);
    };

    return (
        <div className="space-y-3 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[85vh]">
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
                        <BreadcrumbPage>Kiểm kho</BreadcrumbPage>
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
                                placeholder="Tìm kiếm mã phiếu, người thực hiện..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 py-2 w-full"
                            />
                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>

                        <div className="flex items-center gap-3">
                            <Select value={checkType} onValueChange={setCheckType}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Loại kiểm kê" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả loại kiểm kê</SelectItem>
                                    <SelectItem value="weekly">Hàng tuần</SelectItem>
                                    <SelectItem value="monthly">Hàng tháng</SelectItem>
                                    <SelectItem value="quarterly">Hàng quý</SelectItem>
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
                                    onClick={() => setIsCreateOpen(true)}
                                    className="gap-2"
                                >
                                    <Icon path={mdiClipboardCheckOutline} size={0.8} className="flex-shrink-0" />
                                    Tạo phiếu mới
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent backdrop-blur-sm">
                        <InventoryCheckTable
                            records={records}
                            isLoading={isLoading || isFetching}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onView={handleView}
                            onDelete={handleDelete}
                            onPrint={(id) => printCheck(id)}
                            canDelete={canDelete}
                        />
                    </Card>

                    {totalItems > pageSize && (
                        <div className="flex justify-center pt-2">
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

            <InventoryCheckDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />

            <InventoryDetailsDialog
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
                    setSelectedRecordId(null);
                }}
                onConfirm={confirmDelete}
                title="Xóa phiếu kiểm kê"
                description="Bạn có chắc chắn muốn xóa phiếu kiểm kê này không? Hành động này không thể hoàn tác và sẽ ảnh hưởng đến lịch sử kho."
                confirmText="Xóa phiếu"
                successMessage="Xóa phiếu kiểm kê thành công"
                errorMessage="Xóa phiếu kiểm kê thất bại"
            />
        </div>
    );
}
