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
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { usePartners, useDeletePartner } from "@/hooks/usePartners";
import { PartnerTable } from "./PartnerTable";
import { CreatePartnerDialog } from "./CreatePartnerDialog";
import { PartnerDetailsDialog } from "./PartnerDetailsDialog";
import { IPartner } from "@/interface/partner";
import Icon from "@mdi/react";
import { mdiPlus, mdiMagnify } from "@mdi/js";
import { usePermissions } from "@/hooks/usePermissions";

export default function PartnersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState<IPartner | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const { hasPermission } = usePermissions();
    const canAdd = hasPermission("partner-management:add");
    const canUpdate = hasPermission("partner-management:update");
    const canDelete = hasPermission("partner-management:delete");

    const { data: partnersResponse, isLoading, isFetching } = usePartners({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
    });
    const { mutate: deletePartnerMutation, isPending: isDeleting } = useDeletePartner();

    const partners = partnersResponse?.data?.partners || partnersResponse?.data || [];
    const partnerList = Array.isArray(partners) ? partners : [];
    const totalItems = partnersResponse?.data?.pagination?.total || partnerList.length;
    const totalPages = partnersResponse?.data?.pagination?.totalPages || 1;

    const handleViewDetails = (partner: IPartner) => {
        setSelectedPartner(partner);
        setIsEditing(false);
        setIsDetailsDialogOpen(true);
    };

    const handleEditDetails = (partner: IPartner) => {
        setSelectedPartner(partner);
        setIsEditing(true);
        setIsDetailsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        const partner = partnerList.find((p: IPartner) => p._id === id);
        if (partner) {
            setSelectedPartner(partner);
            setIsDeleteDialogOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (!selectedPartner) return;
        return new Promise((resolve, reject) => {
            deletePartnerMutation(selectedPartner._id, {
                onSuccess: () => {
                    setSelectedPartner(null);
                    resolve(true);
                },
                onError: reject,
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
                        <BreadcrumbPage>Thông tin đối tác</BreadcrumbPage>
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
                                placeholder="Tìm theo tên, địa chỉ đối tác..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 py-2 w-full"
                            />
                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>
                        <div className="flex items-center gap-3">
                            {canAdd && (
                                <Button
                                    onClick={() => {
                                        setSelectedPartner(null);
                                        setIsCreateDialogOpen(true);
                                    }}
                                >
                                    <Icon path={mdiPlus} size={0.8} className="flex-shrink-0" />
                                    Thêm đối tác
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <PartnerTable
                            partners={partnerList}
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

            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                isDeleting={isDeleting}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title={`Xóa đối tác: ${selectedPartner?.partnerName || ""}`}
                description="Bạn có chắc chắn muốn xóa đối tác này?"
                confirmText="Xóa đối tác"
                successMessage="Xóa đối tác thành công"
                errorMessage="Xóa đối tác thất bại"
            />

            <CreatePartnerDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
            />

            <PartnerDetailsDialog
                isOpen={isDetailsDialogOpen}
                onClose={() => {
                    setIsDetailsDialogOpen(false);
                    setSelectedPartner(null);
                    setIsEditing(false);
                }}
                partner={selectedPartner}
                defaultIsEditing={isEditing}
            />
        </div>
    );
}
