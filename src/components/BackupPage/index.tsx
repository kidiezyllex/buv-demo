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
import { Pagination } from "@/components/ui/pagination";
import { useBackupHistory, useCollectionsInfo, useExportBackup } from "@/hooks/useBackup";
import {
    mdiDatabase,
    mdiDatabaseExport,
    mdiDatabaseImport,
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { BackupHistoryTable } from "./BackupHistoryTable";
import { RestoreDialog } from "./RestoreDialog";

export default function BackupPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

    const { data: collectionsInfoResponse, isLoading: isLoadingCollections } = useCollectionsInfo();
    const { data: historyResponse, isLoading: isLoadingHistory, isFetching: isFetchingHistory } = useBackupHistory({
        page: currentPage,
        limit: pageSize,
    });
    const { mutate: exportBackup, isPending: isExporting } = useExportBackup();

    const collections = collectionsInfoResponse?.data?.collections || [];
    const totalRecords = collectionsInfoResponse?.data?.totalRecords || 0;

    const history = historyResponse?.data?.history || [];
    const totalItems = historyResponse?.data?.pagination?.total || 0;
    const totalPages = historyResponse?.data?.pagination?.totalPages || 1;

    return (
        <div className="space-y-3 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
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
                        <BreadcrumbPage>Sao lưu & Phục hồi</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col gap-3 md:gap-4">
                    <Card>
                        <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-primary font-semibold whitespace-nowrap">Thông tin dữ liệu hiện tại</h3>
                                <div className="flex-1 border-b border-dashed border-primary mr-1" />
                            </div>

                            {isLoadingCollections ? (
                                <div className="text-center text-neutral-400 text-sm py-2 italic">Đang tải thông tin...</div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {collections.map((col: { name: string; count: number }) => (
                                        <div
                                            key={col.name}
                                            className="flex items-center gap-2 border-2 border-darkBorderV1 rounded-md px-3 py-1.5 text-sm text-neutral-300"
                                        >
                                            <Icon path={mdiDatabase} size={0.8} className="text-primary flex-shrink-0" />
                                            {col.name}: <span className="font-semibold text-primary">{col.count}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-2 border border-primary/40 rounded-md px-3 py-1.5 text-sm text-neutral-300">
                                        Tổng cộng: <span className="font-semibold text-primary">{totalRecords}</span> bản ghi
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <Card>
                            <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Sao lưu dữ liệu</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>
                                <p className="text-base text-neutral-400">
                                    Tải toàn bộ dữ liệu hiện tại xuống file JSON để làm bản sao lưu. File có thể dùng để phục hồi dữ liệu khi cần.
                                </p>
                                <Button onClick={() => exportBackup()} disabled={isExporting}>
                                    <Icon path={mdiDatabaseExport} size={0.8} />
                                    {isExporting ? "Đang tạo backup..." : "Tải backup"}
                                </Button>
                            </div>
                        </Card>

                        <Card>
                            <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Phục hồi dữ liệu</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>
                                <p className="text-base text-neutral-400">
                                    Phục hồi dữ liệu từ file backup đã tải trước đó. Dữ liệu hiện tại sẽ bị ghi đè hoàn toàn.
                                </p>
                                <Button variant="destructive" onClick={() => setIsRestoreDialogOpen(true)}>
                                    <Icon path={mdiDatabaseImport} size={0.8} />
                                    Phục hồi dữ liệu
                                </Button>
                            </div>
                        </Card>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        <h3 className="text-primary font-semibold whitespace-nowrap">Lịch sử sao lưu & phục hồi</h3>
                        <div className="flex-1 border-b border-dashed border-primary mr-1" />
                    </div>

                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <BackupHistoryTable
                            history={history}
                            isLoading={isLoadingHistory || isFetchingHistory}
                            currentPage={currentPage}
                            pageSize={pageSize}
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

            <RestoreDialog
                isOpen={isRestoreDialogOpen}
                onClose={() => setIsRestoreDialogOpen(false)}
            />
        </div>
    );
}
