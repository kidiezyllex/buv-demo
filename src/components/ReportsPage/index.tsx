"use client";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
    useEquipmentReport,
    useTaskReport,
    useBorrowReturnReport,
    useExportReport,
} from "@/hooks/useReports";
import Icon from "@mdi/react";
import { mdiTools, mdiClipboardCheck, mdiPackageVariant, mdiFileExport } from "@mdi/js";

export default function ReportsPage() {
    const { data: equipmentReport, isLoading: loadingEquipment } = useEquipmentReport();
    const { data: taskReport, isLoading: loadingTask } = useTaskReport();
    const { data: borrowReport, isLoading: loadingBorrow } = useBorrowReturnReport();
    const { mutate: exportReport, isPending: isExporting } = useExportReport();

    const eq = equipmentReport?.data ?? equipmentReport;
    const task = taskReport?.data ?? taskReport;
    const borrow = borrowReport?.data ?? borrowReport;
    const isLoading = loadingEquipment || loadingTask || loadingBorrow;

    const handleExport = (type: string) => {
        exportReport(type);
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
                        <BreadcrumbPage>Báo cáo thống kê</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
                        <h2 className="text-xl font-semibold text-neutral-300">
                            Báo cáo thống kê
                        </h2>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleExport("equipment")}
                                disabled={isExporting}
                                className="border-darkBorderV1"
                            >
                                <Icon path={mdiFileExport} size={0.8} className="mr-2" />
                                Xuất báo cáo thiết bị
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleExport("tasks")}
                                disabled={isExporting}
                                className="border-darkBorderV1"
                            >
                                <Icon path={mdiFileExport} size={0.8} className="mr-2" />
                                Xuất báo cáo công việc
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleExport("borrow-return")}
                                disabled={isExporting}
                                className="border-darkBorderV1"
                            >
                                <Icon path={mdiFileExport} size={0.8} className="mr-2" />
                                Xuất báo cáo mượn trả
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                        <Card className="border border-darkBorderV1 bg-transparent">
                            <CardHeader className="border-b border-b-darkBorderV1 py-3">
                                <div className="flex items-center gap-2">
                                    <Icon path={mdiTools} size={0.8} className="text-primary" />
                                    <span className="font-semibold text-primary">
                                        Báo cáo thiết bị
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-32 w-full rounded-lg" />
                                ) : (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-300">Tổng thiết bị</span>
                                            <span className="font-medium">{eq?.total ?? 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-300">Sẵn sàng</span>
                                            <span className="font-medium text-green-500">{eq?.available ?? 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-300">Bảo trì</span>
                                            <span className="font-medium text-amber-500">{eq?.maintenance ?? 0}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-darkBorderV1">
                                            <span className="text-neutral-300">Tỷ lệ sẵn sàng</span>
                                            <span className="font-semibold text-primary">{eq?.availabilityRate ?? "-"}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-darkBorderV1 bg-transparent">
                            <CardHeader className="border-b border-b-darkBorderV1 py-3">
                                <div className="flex items-center gap-2">
                                    <Icon path={mdiClipboardCheck} size={0.8} className="text-primary" />
                                    <span className="font-semibold text-primary">
                                        Báo cáo công việc
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-32 w-full rounded-lg" />
                                ) : (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-300">Tổng</span>
                                            <span className="font-medium">{task?.total ?? 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-300">Chờ / Đang làm</span>
                                            <span>{(task?.pending ?? 0) + (task?.inProgress ?? 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-300">Hoàn thành</span>
                                            <span className="font-medium text-green-500">{task?.completed ?? 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-300">Quá hạn</span>
                                            <span className="font-medium text-red-400">{task?.overdue ?? 0}</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-darkBorderV1">
                                            <span className="text-neutral-300">Tỷ lệ hoàn thành</span>
                                            <span className="font-semibold text-primary">{task?.completionRate ?? "-"}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-darkBorderV1 bg-transparent">
                            <CardHeader className="border-b border-b-darkBorderV1 py-3">
                                <div className="flex items-center gap-2">
                                    <Icon path={mdiPackageVariant} size={0.8} className="text-primary" />
                                    <span className="font-semibold text-primary">
                                        Báo cáo mượn trả
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <Skeleton className="h-32 w-full rounded-lg" />
                                ) : (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-neutral-300">Tổng phiếu</span>
                                            <span className="font-medium">{borrow?.total ?? 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-300">Đang mượn</span>
                                            <span className="font-medium text-amber-500">{borrow?.borrowed ?? 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-300">Đã trả</span>
                                            <span className="font-medium text-green-500">{borrow?.returned ?? 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-neutral-300">Quá hạn</span>
                                            <span className="font-medium text-red-400">{borrow?.overdue ?? 0}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
