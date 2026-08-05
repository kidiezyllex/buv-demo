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
import Icon from "@mdi/react";
import { mdiMagnify, mdiTextBoxPlusOutline, mdiRefresh } from "@mdi/js";
import {
    useBorrowRecords
} from "@/hooks/useEquipment";
import { EquipmentBorrowTable } from "./EquipmentBorrowTable";
import { CreateBorrowDialog } from "./CreateBorrowDialog";
import { ReturnDialog } from "./ReturnDialog";
import { IBorrowReturn } from "@/interface/equipment";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useResponsive } from "@/hooks/use-mobile";

export default function EquipmentBorrowPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("desc");
    const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
    const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<IBorrowReturn | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const { isMobile, isTablet } = useResponsive();

    const { data: borrowResponse, isLoading, isFetching, refetch } = useBorrowRecords({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sort: sortOrder === "desc" ? "-borrowDate" : "borrowDate",
    });

    const handleRefresh = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setSortOrder("desc");
        setCurrentPage(1);
        refetch();
    };

    const records = borrowResponse?.data?.records || borrowResponse?.data?.borrowRecords || borrowResponse?.data || [];
    const recordList = Array.isArray(records) ? records : [];
    const totalItems = borrowResponse?.data?.pagination?.total || recordList.length;
    const totalPages = borrowResponse?.data?.pagination?.totalPages || 1;

    const handleReturn = (record: IBorrowReturn) => {
        setSelectedRecord(record);
        setIsReturnDialogOpen(true);
    };

    return (
        <TooltipProvider>
            <div className="space-y-3 md:space-y-4 bg-darkCardV1  p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
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
                            <BreadcrumbPage>Tạo phiếu mượn trả</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-col gap-3 md:gap-4">
                        {isMobile ? (
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleRefresh}
                                        disabled={isFetching}
                                        className="bg-darkBorderV1 hover:bg-darkBorderV1/70 font-medium"
                                    >
                                        <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                    </Button>
                                    <div className="relative w-full">
                                        <Input
                                            placeholder="Tìm theo thiết bị, người mượn..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8 w-full text-sm"
                                        />
                                        <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                            <SelectItem value="pending">Chờ duyệt</SelectItem>
                                            <SelectItem value="borrowed">Đã mượn</SelectItem>
                                            <SelectItem value="partially_returned">Trả một phần</SelectItem>
                                            <SelectItem value="returned">Đã trả</SelectItem>
                                            <SelectItem value="overdue">Quá hạn</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={sortOrder} onValueChange={setSortOrder}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sắp xếp ngày mượn" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="desc">Mới nhất trước</SelectItem>
                                            <SelectItem value="asc">Cũ nhất trước</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => setIsBorrowDialogOpen(true)}
                                >
                                    <Icon path={mdiTextBoxPlusOutline} size={0.8} className="flex-shrink-0" />
                                    Tạo phiếu mượn
                                </Button>
                            </div>
                        ) : isTablet ? (
                            <div className="flex flex-col gap-3 mb-2">
                                <div className="relative w-full">
                                    <Input
                                        placeholder="Tìm theo thiết bị, người mượn..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 py-2 w-full"
                                    />
                                    <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Trạng thái" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                                <SelectItem value="pending">Chờ duyệt</SelectItem>
                                                <SelectItem value="borrowed">Đã mượn</SelectItem>
                                                <SelectItem value="partially_returned">Trả một phần</SelectItem>
                                                <SelectItem value="returned">Đã trả</SelectItem>
                                                <SelectItem value="overdue">Quá hạn</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={sortOrder} onValueChange={setSortOrder}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Sắp xếp ngày mượn" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="desc">Mới nhất trước</SelectItem>
                                                <SelectItem value="asc">Cũ nhất trước</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={handleRefresh}
                                            disabled={isFetching}
                                        >
                                            <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                        </Button>
                                        <Button
                                            onClick={() => setIsBorrowDialogOpen(true)}
                                        >
                                            <Icon path={mdiTextBoxPlusOutline} size={0.8} className="flex-shrink-0" />
                                            Tạo phiếu mượn
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                <div className="relative w-full flex-1 min-w-[300px]">
                                    <Input
                                        placeholder="Tìm theo thiết bị, người mượn..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 py-2 w-full"
                                    />
                                    <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                            <SelectItem value="pending">Chờ duyệt</SelectItem>
                                            <SelectItem value="borrowed">Đã mượn</SelectItem>
                                            <SelectItem value="partially_returned">Trả một phần</SelectItem>
                                            <SelectItem value="returned">Đã trả</SelectItem>
                                            <SelectItem value="overdue">Quá hạn</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={sortOrder} onValueChange={setSortOrder}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Sắp xếp ngày mượn" />
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
                                    <Button
                                        onClick={() => setIsBorrowDialogOpen(true)}
                                    >
                                        <Icon path={mdiTextBoxPlusOutline} size={0.8} className="flex-shrink-0" />
                                        Tạo phiếu mượn
                                    </Button>
                                </div>
                            </div>
                        )}

                        <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                            <EquipmentBorrowTable
                                records={recordList}
                                isLoading={isLoading || isFetching}
                                onReturn={handleReturn}
                                currentPage={currentPage}
                                pageSize={pageSize}
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

                <CreateBorrowDialog
                    isOpen={isBorrowDialogOpen}
                    onClose={() => setIsBorrowDialogOpen(false)}
                />

                <ReturnDialog
                    isOpen={isReturnDialogOpen}
                    onClose={() => {
                        setIsReturnDialogOpen(false);
                        setSelectedRecord(null);
                    }}
                    record={selectedRecord}
                />
            </div>
        </TooltipProvider>
    );
}
