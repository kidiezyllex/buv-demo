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
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import Icon from "@mdi/react";
import {
    mdiCalendarMonthOutline,
    mdiClockCheckOutline,
} from "@mdi/js";

import {
    AttendanceType,
    ATTENDANCE_TYPE_COLORS,
} from "@/interface/attendance";
import DailyTab from "./DailyTab";
import SummaryTab from "./SummaryTab";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";


const ATTENDANCE_LEGEND: { value: AttendanceType; label: string; symbol: string }[] = [
    { value: "present", label: "VP - Làm tại văn phòng", symbol: "VP" },
    { value: "business_trip", label: "CT - Công tác", symbol: "CT" },
    { value: "compensatory_leave", label: "NB - Nghỉ bù", symbol: "NB" },
    { value: "annual_leave", label: "P - Nghỉ phép", symbol: "P" },
    { value: "sick_leave", label: "O - Nghỉ ốm", symbol: "O" },
    { value: "maternity_leave", label: "TS - Nghỉ thai sản", symbol: "TS" },
];

export default function AttendancePage() {
    const [activeTab, setActiveTab] = useState<"daily" | "summary">("daily");
    const { hasPermission } = usePermissions();
    const canViewTable = hasPermission("attendance-management:view-table");

    return (
        <TooltipProvider>
            <div className="space-y-3 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
                {/* Header Breadcrumb */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/sys">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="#">Điều hành & chấm công</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Chấm công</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {canViewTable && (<div className="flex items-center gap-3">
                            <Button
                                onClick={() => setActiveTab("daily")}
                                variant={activeTab === "daily" ? "default" : "ghost"}
                            >
                                <Icon path={mdiClockCheckOutline} size={0.8} className="flex-shrink-0" />
                                Chấm công cá nhân
                            </Button>

                            <Button
                                onClick={() => setActiveTab("summary")}
                                variant={activeTab === "summary" ? "default" : "ghost"}
                            >
                                <Icon path={mdiCalendarMonthOutline} size={0.8} className="flex-shrink-0" />
                                Bảng tổng hợp tháng
                            </Button>
                        </div>
                        )}

                        {/* Common Legend */}
                        <div className="flex flex-wrap items-center gap-3">
                            {ATTENDANCE_LEGEND.map((opt) => (
                                <div key={opt.value} className="flex items-center gap-2 px-1.5 py-1 rounded-lg border border-darkBorderV1 bg-darkCardV2/30">
                                    <Badge variant={ATTENDANCE_TYPE_COLORS[opt.value] as any}>
                                        {opt.symbol}
                                    </Badge>
                                    <span className={cn(
                                        "text-xs font-semibold",
                                        ATTENDANCE_TYPE_COLORS[opt.value] === "green" && "text-green-400",
                                        ATTENDANCE_TYPE_COLORS[opt.value] === "indigo" && "text-indigo-400",
                                        ATTENDANCE_TYPE_COLORS[opt.value] === "orange" && "text-orange-400",
                                        ATTENDANCE_TYPE_COLORS[opt.value] === "blue" && "text-blue-400",
                                        ATTENDANCE_TYPE_COLORS[opt.value] === "amber" && "text-amber-400",
                                        ATTENDANCE_TYPE_COLORS[opt.value] === "pink" && "text-pink-400",
                                        (!ATTENDANCE_TYPE_COLORS[opt.value] || ATTENDANCE_TYPE_COLORS[opt.value] === "neutral") && "text-neutral-300"
                                    )}>
                                        {opt.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {activeTab === "daily" ? <DailyTab /> : <SummaryTab />}
                </motion.div>
            </div>
        </TooltipProvider>
    );
}
