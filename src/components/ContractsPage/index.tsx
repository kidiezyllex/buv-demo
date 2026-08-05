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
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useContracts, useDeleteContract } from "@/hooks/useContracts";
import { ContractTable } from "./ContractTable";
import { CreateContractDialog } from "./CreateContractDialog";
import { ContractDetailsDialog } from "./ContractDetailsDialog";
import { IContract } from "@/interface/contract";
import Icon from "@mdi/react";
import { mdiMagnify, mdiPlus } from "@mdi/js";
import { usePermissions } from "@/hooks/usePermissions";

export default function ContractsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedContract, setSelectedContract] = useState<IContract | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const { hasPermission } = usePermissions();
    const canAdd = hasPermission("contract-management:add");
    const canUpdate = hasPermission("contract-management:update");
    const canDelete = hasPermission("contract-management:delete");

    const { data: contractsResponse, isLoading, isFetching } = useContracts({
        page: currentPage,
        limit: pageSize,
        searchTerm: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
    });
    const { mutate: deleteContractMutation, isPending: isDeleting } = useDeleteContract();

    const contracts = contractsResponse?.data?.contracts || [];
    const totalItems = contractsResponse?.data?.pagination?.total || 0;
    const totalPages = contractsResponse?.data?.pagination?.totalPages || 1;

    const handleViewDetails = (contract: IContract) => {
        setSelectedContract(contract);
        setIsEditing(false);
        setIsDetailsDialogOpen(true);
    };

    const handleEditDetails = (contract: IContract) => {
        setSelectedContract(contract);
        setIsEditing(true);
        setIsDetailsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        const contract = contracts.find((c: IContract) => c._id === id);
        if (contract) {
            setSelectedContract(contract);
            setIsDeleteDialogOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (!selectedContract) return;
        return new Promise((resolve, reject) => {
            deleteContractMutation(selectedContract._id, {
                onSuccess: () => {
                    setSelectedContract(null);
                    resolve(true);
                },
                onError: (error) => reject(error),
            });
        });
    };

    return (
        <div className="space-y-3 md:space-y-4 bg-darkCardV1  p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/sys">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="#">Tiện ích</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Quản lý hợp đồng</BreadcrumbPage>
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
                                placeholder="Tìm theo số hợp đồng, hạng mục..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 py-2 w-full"
                            />
                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Select
                                value={statusFilter}
                                onValueChange={(val) => {
                                    setStatusFilter(val);
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                                    <SelectItem value="advanced">Tạm ứng</SelectItem>
                                </SelectContent>
                            </Select>
                            {canAdd && (
                                <Button
                                    onClick={() => {
                                        setSelectedContract(null);
                                        setIsCreateDialogOpen(true);
                                    }}
                                >
                                    <Icon path={mdiPlus} size={0.8} className="flex-shrink-0" />
                                    Thêm hợp đồng
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <ContractTable
                            contracts={contracts}
                            isLoading={isLoading || isFetching}
                            onView={handleViewDetails}
                            onEdit={handleEditDetails}
                            onDelete={handleDelete}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                        />
                    </Card>

                    {totalItems > pageSize && (
                        <div className="flex justify-center mt-4">
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

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                isDeleting={isDeleting}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title={`Xóa hợp đồng: ${selectedContract?.contractNumber || ""}`}
                description="Bạn có chắc chắn muốn xóa hợp đồng này?"
                confirmText="Xóa hợp đồng"
                successMessage="Xóa hợp đồng thành công"
                errorMessage="Xóa hợp đồng thất bại"
            />

            <CreateContractDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
            />

            <ContractDetailsDialog
                isOpen={isDetailsDialogOpen}
                onClose={() => {
                    setIsDetailsDialogOpen(false);
                    setSelectedContract(null);
                    setIsEditing(false);
                }}
                contract={selectedContract}
                defaultIsEditing={isEditing}
            />
        </div>
    );
}
