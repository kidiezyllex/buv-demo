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
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useResponsive } from "@/hooks/use-mobile";
import { useMe } from "@/hooks/useAuth";
import { usePaymentRecords } from "@/hooks/usePaymentRecords";
import {
    mdiAccountCashOutline,
    mdiCreditCardSearch,
    mdiMagnify,
    mdiRefresh,
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CreatePaymentDialog } from "./CreatePaymentDialog";
import { PaymentRecordTable } from "./PaymentRecordTable";

export default function PaymentRecordPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createDefaultType, setCreateDefaultType] = useState<"PAYMENT" | "ADVANCE">("PAYMENT");

    const { isMobile, isTablet } = useResponsive();
    const { data: meRes } = useMe();

    const me = meRes?.data?.user;
    const role = meRes?.data?.role || "";
    const position = (me?.position || "").toLowerCase();

    // Privileged users can see all records: admin, managers (directors, department heads, accountants)
    const canSeeAll = role === "admin" ||
        position.includes("tổ trưởng") ||
        position.includes("giám đốc") ||
        position.includes("kế toán") ||
        position.includes("kế toán trưởng");

    const { data: recordsResponse, isLoading, isFetching, refetch } = usePaymentRecords({
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        requesterId: canSeeAll ? undefined : me?._id,
    });

    const handleRefresh = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setTypeFilter("all");
        setCurrentPage(1);
        refetch();
    };

    const openCreate = (type: "PAYMENT" | "ADVANCE") => {
        setCreateDefaultType(type);
        setIsCreateOpen(true);
    };

    const records = recordsResponse?.data?.records || recordsResponse?.data || [];
    const recordList = Array.isArray(records) ? records : [];
    const totalItems = recordsResponse?.data?.pagination?.total || recordList.length;
    const totalPages = recordsResponse?.data?.pagination?.totalPages || 1;

    const FilterSelects = () => (
        <>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className={isMobile ? "w-full" : "w-[200px]"}>
                    <SelectValue placeholder="Loại hồ sơ" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="PAYMENT">Đề nghị thanh toán</SelectItem>
                    <SelectItem value="ADVANCE">Đề nghị tạm ứng</SelectItem>
                </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={isMobile ? "w-full" : "w-[200px]"}>
                    <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                    <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                    <SelectItem value="REJECTED">Từ chối</SelectItem>
                    <SelectItem value="PAID">Đã thanh toán</SelectItem>
                </SelectContent>
            </Select>
        </>
    );

    return (
        <TooltipProvider>
            <div className="space-y-3 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/sys">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="#">Điều hành &amp; chấm công</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Hồ sơ thanh toán</BreadcrumbPage>
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
                                            placeholder="Tìm kiếm hồ sơ..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8 w-full text-sm"
                                        />
                                        <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <FilterSelects />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button className="w-full" onClick={() => openCreate("PAYMENT")}>
                                        <Icon path={mdiCreditCardSearch} size={0.8} className="flex-shrink-0" />
                                        Đề nghị TT
                                    </Button>
                                    <Button className="w-full" variant="outline" onClick={() => openCreate("ADVANCE")}>
                                        <Icon path={mdiAccountCashOutline} size={0.8} className="flex-shrink-0" />
                                        Đề nghị TU
                                    </Button>
                                </div>
                            </div>

                        ) : isTablet ? (
                            <div className="flex flex-col gap-3 mb-2">
                                <div className="relative w-full">
                                    <Input
                                        placeholder="Tìm kiếm hồ sơ..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 py-2 w-full"
                                    />
                                    <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <FilterSelects />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="icon" variant="outline" onClick={handleRefresh} disabled={isFetching}>
                                            <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                        </Button>
                                        <Button onClick={() => openCreate("PAYMENT")}>
                                            <Icon path={mdiCreditCardSearch} size={0.8} className="flex-shrink-0" />
                                            Thanh toán
                                        </Button>
                                        <Button variant="outline" onClick={() => openCreate("ADVANCE")}>
                                            <Icon path={mdiAccountCashOutline} size={0.8} className="flex-shrink-0" />
                                            Tạm ứng
                                        </Button>
                                    </div>
                                </div>
                            </div>

                        ) : (
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                                <div className="relative w-full flex-1">
                                    <Input
                                        placeholder="Tìm kiếm hồ sơ..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 py-2 w-full"
                                    />
                                    <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <FilterSelects />
                                    <Button onClick={handleRefresh} disabled={isFetching} variant="ghost">
                                        <Icon path={mdiRefresh} size={0.8} className={isFetching ? "animate-spin" : ""} />
                                        Reset bộ lọc
                                    </Button>
                                    <Button onClick={() => openCreate("ADVANCE")}>
                                        <Icon path={mdiAccountCashOutline} size={0.8} />
                                        Tạo hồ sơ thanh toán
                                    </Button>
                                </div>
                            </div>
                        )}

                        <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                            <PaymentRecordTable
                                records={recordList}
                                isLoading={isLoading || isFetching}
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

                <CreatePaymentDialog
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    defaultType={createDefaultType}
                />
            </div>
        </TooltipProvider>
    );
}
