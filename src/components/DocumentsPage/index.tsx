"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useResponsive } from "@/hooks/use-mobile";
import { useMe } from "@/hooks/useAuth";
import { useDeleteDocument, useDocuments } from "@/hooks/useDocuments";
import { usePermissions } from "@/hooks/usePermissions";
import { IDocument } from "@/interface/document";
import { mdiCloudUploadOutline, mdiMagnify, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CreateDocumentDialog } from "./CreateDocumentDialog";
import { DocumentDetailsDialog } from "./DocumentDetailsDialog";
import { DocumentTable } from "./DocumentTable";
import { UploadTemplateDialog } from "./UploadTemplateDialog";

interface DocumentsPageProps {
    fixedType?: string;
    title?: string;
}

export default function DocumentsPage({ fixedType, title }: DocumentsPageProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isUploadTemplateOpen, setIsUploadTemplateOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [typeFilter, setTypeFilter] = useState(fixedType || "all");
    const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const { isMobile } = useResponsive();

    const { hasPermission } = usePermissions();
    const canUpload = hasPermission("document-management:upload");
    const canAdd = hasPermission("document-management:add");
    const canUpdate = hasPermission("document-management:update");
    const canDelete = hasPermission("document-management:delete");

    const { data: profile } = useMe();
    const position = profile?.data?.user?.position?.toLowerCase() || "";
    const isSpecialPosition = position.includes("kế toán") || position.includes("giám đốc");

    const allowedTypes = ["incoming", "outgoing", "notification", "decision", "template"];
    if (isSpecialPosition) {
        allowedTypes.push("construction_profile");
    }

    const { data: documentsResponse, isLoading, isFetching } = useDocuments({
        page: currentPage,
        limit: pageSize,
        searchTerm: searchQuery,
        type: typeFilter !== "all" ? typeFilter : (allowedTypes.length > 0 ? allowedTypes.join(",") : undefined),
    });

    const { mutate: deleteDocumentMutation, isPending: isDeleting } = useDeleteDocument();

    const documents = (documentsResponse?.data?.documents || []).filter(doc => {
        if (!isSpecialPosition && doc.type === 'construction_profile') return false;
        return true;
    });
    const totalItems = documentsResponse?.data?.pagination?.total || 0;
    const totalPages = documentsResponse?.data?.pagination?.totalPages || 1;

    const handleViewDetails = (doc: IDocument) => {
        setSelectedDoc(doc);
        setIsEditing(false);
        setIsDetailsDialogOpen(true);
    };

    const handleEditDetails = (doc: IDocument) => {
        setSelectedDoc(doc);
        setIsEditing(true);
        setIsDetailsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        const doc = documents.find((d: IDocument) => d._id === id);
        if (doc) {
            setSelectedDoc(doc);
            setIsDeleteDialogOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (!selectedDoc) return;
        return new Promise((resolve, reject) => {
            deleteDocumentMutation(selectedDoc._id, {
                onSuccess: () => {
                    setSelectedDoc(null);
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
                        <BreadcrumbLink href="/sys/utilities">Tiện ích</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{title || "Quản lý văn bản"}</BreadcrumbPage>
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
                                placeholder="Tìm theo tiêu đề, số hiệu, nội dung..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 py-2 w-full"
                            />
                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>
                        <div className="flex items-center gap-3">
                            {!fixedType && (
                                <Select
                                    value={typeFilter}
                                    onValueChange={(val) => {
                                        setTypeFilter(val);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Loại văn bản" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả loại</SelectItem>
                                        <SelectItem value="incoming">Công văn đến</SelectItem>
                                        <SelectItem value="outgoing">Công văn đi</SelectItem>
                                        <SelectItem value="notification">Thông báo</SelectItem>
                                        <SelectItem value="decision">Quyết định</SelectItem>
                                        <SelectItem value="template">Mẫu văn bản</SelectItem>
                                        {isSpecialPosition && (
                                            <SelectItem value="construction_profile">Hồ sơ công trình</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                            {canUpload && (
                                <Button
                                    onClick={() => setIsUploadTemplateOpen(true)}
                                >
                                    <Icon path={mdiCloudUploadOutline} size={0.8} className="flex-shrink-0" />
                                    {fixedType === "guide" ? "Thêm tài liệu hướng dẫn" : "Upload mẫu văn bản"}
                                </Button>
                            )}
                            {canAdd && fixedType !== "guide" && (
                                <Button
                                    onClick={() => {
                                        setSelectedDoc(null);
                                        setIsCreateDialogOpen(true);
                                    }}
                                >
                                    <Icon path={mdiPlus} size={0.8} className="flex-shrink-0" />
                                    Thêm văn bản
                                </Button>
                            )}
                        </div>
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <DocumentTable
                            documents={documents}
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
                title={`Xóa văn bản: ${selectedDoc?.documentNumber || ""}`}
                description="Bạn có chắc chắn muốn xóa văn bản này khỏi hệ thống? Thao tác này không thể hoàn tác."
                confirmText="Xóa văn bản"
                successMessage="Xóa văn bản thành công"
                errorMessage="Xóa văn bản thất bại"
            />

            <CreateDocumentDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                fixedType={fixedType}
            />

            <DocumentDetailsDialog
                isOpen={isDetailsDialogOpen}
                onClose={() => {
                    setIsDetailsDialogOpen(false);
                    setSelectedDoc(null);
                    setIsEditing(false);
                }}
                document={selectedDoc}
                defaultIsEditing={isEditing}
                fixedType={fixedType}
            />

            <UploadTemplateDialog
                isOpen={isUploadTemplateOpen}
                onClose={() => setIsUploadTemplateOpen(false)}
                fixedType={fixedType}
            />
        </div>
    );
}
