"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useMonthlySummary, useSignMonthly } from "@/hooks/useAttendance";
import { useMe } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import {
    ATTENDANCE_TYPE_COLORS,
    ATTENDANCE_TYPE_SYMBOLS,
    IMonthlySummaryEmployee
} from "@/interface/attendance";
import {
    mdiChevronLeft,
    mdiChevronRight,
    mdiFileExcelOutline,
    mdiMagnify,
    mdiRefresh
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { handleAttendanceExportExcel } from "./utils/exportTemplate";
function getDaysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
}

function getDayOfWeek(day: number, month: number, year: number) {
    const d = new Date(year, month - 1, day);
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[d.getDay()];
}

function isWeekend(day: number, month: number, year: number) {
    const d = new Date(year, month - 1, day);
    return d.getDay() === 0 || d.getDay() === 6;
}

export default function SummaryTab() {
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [searchQuery, setSearchQuery] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("all");

    // Hooks
    const { data: employeesResponse } = useEmployees({ page: 1, limit: 200, isActive: true });

    const { data: summaryResponse, isLoading: isLoadingSummary, isFetching: isFetchingSummary } = useMonthlySummary({
        month: selectedMonth,
        year: selectedYear,
        department: departmentFilter !== "all" ? departmentFilter : undefined,
        search: searchQuery || undefined,
    });

    const { mutate: signMonthly } = useSignMonthly();

    // Derived
    const employees = useMemo(() => {
        const list = employeesResponse?.data?.employees || employeesResponse?.data || [];
        return Array.isArray(list) ? list : [];
    }, [employeesResponse]);

    const monthlySummaryData: IMonthlySummaryEmployee[] = useMemo(() => {
        return summaryResponse?.data?.data || [];
    }, [summaryResponse]);

    const departments = useMemo(() => {
        const depts = new Set<string>();
        employees.forEach((e: any) => {
            if (e.department) depts.add(e.department);
        });
        return Array.from(depts).sort();
    }, [employees]);

    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);

    // Handlers
    const goToPrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(y => y - 1);
        } else setSelectedMonth(m => m - 1);
    };

    const goToNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(y => y + 1);
        } else setSelectedMonth(m => m + 1);
    };

    const goToCurrentMonth = () => {
        setSelectedMonth(now.getMonth() + 1);
        setSelectedYear(now.getFullYear());
    };

    const handleRefresh = () => {
        setSearchQuery("");
        setDepartmentFilter("all");
    };

    const { data: meResponse } = useMe();

    const handleExportExcel = async () => {
        const digitalSignature = meResponse?.data?.user?.digitalSignature;

        if (!digitalSignature) {
            toast.warning("Vui lòng cập nhật chữ ký điện tử để thực hiện xuất file");
            return;
        }

        try {
            await handleAttendanceExportExcel(
                monthlySummaryData,
                selectedMonth,
                selectedYear,
                daysInMonth,
                digitalSignature
            );
            toast.success("Xuất file Excel thành công");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi xuất file Excel");
        }
    };

    return (
        <motion.div
            key="summary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
        >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button onClick={goToPrevMonth} variant="ghost" size="icon">
                        <Icon path={mdiChevronLeft} size={0.8} className="flex-shrink-0" />
                    </Button>
                    <Button variant="ghost">
                        Tháng {selectedMonth}/{selectedYear}
                    </Button>
                    <Button onClick={goToNextMonth} variant="ghost" size="icon">
                        <Icon path={mdiChevronRight} size={0.8} className="flex-shrink-0" />
                    </Button>
                    <Button
                        onClick={goToCurrentMonth}
                        variant="ghost"
                    >
                        Tháng này
                    </Button>
                </div>

                <Button onClick={handleExportExcel}>
                    <Icon path={mdiFileExcelOutline} size={0.8} className="flex-shrink-0" />
                    Xuất file Excel
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[250px]">
                    <Input
                        placeholder="Tìm theo tên, mã nhân viên..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 py-2 w-full"
                    />
                    <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Phòng ban" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả phòng ban</SelectItem>
                        {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleRefresh} variant="ghost">
                    <Icon path={mdiRefresh} size={0.8} className="flex-shrink-0" />
                    Reset bộ lọc
                </Button>
            </div>

            {/* Table */}
            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                <div className="overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow showHoverTooltip={false}>
                                <TableHead className="sticky left-0 z-20 bg-darkCardV1 min-w-[50px] text-center">STT</TableHead>
                                <TableHead className="sticky left-[50px] z-20 bg-darkCardV1 min-w-[90px] text-center">Mã NV</TableHead>
                                <TableHead className="sticky left-[140px] z-20 bg-darkCardV1 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)] min-w-[180px]">Họ và Tên</TableHead>
                                {Array.from({ length: daysInMonth }, (_, i) => {
                                    const day = i + 1;
                                    const dow = getDayOfWeek(day, selectedMonth, selectedYear);
                                    const weekend = isWeekend(day, selectedMonth, selectedYear);
                                    return (
                                        <TableHead key={day}>
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className={weekend ? "text-orange-400 font-bold" : ""}>{day}</span>
                                                <span className={`text-sm ${weekend ? "text-orange-400/70" : "text-neutral-300"}`}>{dow}</span>
                                            </div>
                                        </TableHead>
                                    );
                                })}
                                <TableHead>
                                    <Tooltip>
                                        <TooltipTrigger asChild><span className="cursor-help">VP</span></TooltipTrigger>
                                        <TooltipContent>Văn phòng</TooltipContent>
                                    </Tooltip>
                                </TableHead>
                                <TableHead>
                                    <Tooltip>
                                        <TooltipTrigger asChild><span className="cursor-help">CT</span></TooltipTrigger>
                                        <TooltipContent>Công tác</TooltipContent>
                                    </Tooltip>
                                </TableHead>
                                <TableHead>
                                    <Tooltip>
                                        <TooltipTrigger asChild><span className="cursor-help">NB</span></TooltipTrigger>
                                        <TooltipContent>Nghỉ bù</TooltipContent>
                                    </Tooltip>
                                </TableHead>
                                <TableHead>
                                    <Tooltip>
                                        <TooltipTrigger asChild><span className="cursor-help">P</span></TooltipTrigger>
                                        <TooltipContent>Nghỉ phép</TooltipContent>
                                    </Tooltip>
                                </TableHead>
                                <TableHead>
                                    <Tooltip>
                                        <TooltipTrigger asChild><span className="cursor-help">O</span></TooltipTrigger>
                                        <TooltipContent>Nghỉ ốm</TooltipContent>
                                    </Tooltip>
                                </TableHead>
                                <TableHead>
                                    <Tooltip>
                                        <TooltipTrigger asChild><span className="cursor-help">TS</span></TooltipTrigger>
                                        <TooltipContent>Thai sản</TooltipContent>
                                    </Tooltip>
                                </TableHead>
                                <TableHead className="text-center min-w-[160px] text-wrap">Công đi làm</TableHead>
                                <TableHead className="text-center min-w-[160px] text-wrap">Công làm T7, CN</TableHead>
                                <TableHead className="text-center min-w-[160px] text-wrap">Phép/Ốm/Nghỉ bù</TableHead>
                                <TableHead className="text-center min-w-[160px] text-wrap">Công dư</TableHead>
                                <TableHead className="text-center min-w-[160px] font-bold text-primary text-wrap bg-primary/5">Tổng công tháng</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingSummary || isFetchingSummary ? (
                                [...Array(8)].map((_, i) => (
                                    <TableRow showHoverTooltip={false} key={i} className="hover:bg-transparent border-darkBorderV1/30">
                                        <TableCell className="sticky left-0 z-10 bg-darkCardV1 border-r border-darkBorderV1/50">
                                            <Skeleton className="h-4 w-4 mx-auto bg-white/5" />
                                        </TableCell>
                                        <TableCell className="sticky left-[50px] z-10 bg-darkCardV1 border-r border-darkBorderV1/50">
                                            <Skeleton className="h-6 w-14 mx-auto bg-white/5" />
                                        </TableCell>
                                        <TableCell className="sticky left-[140px] z-10 bg-darkCardV1 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">
                                            <Skeleton className="h-4 w-32 bg-white/5" />
                                        </TableCell>
                                        {Array.from({ length: daysInMonth + 12 }).map((_, j) => (
                                            <TableCell key={j} className="text-center">
                                                <Skeleton className="h-6 w-6 mx-auto bg-white/5 rounded-md" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : monthlySummaryData.length === 0 ? (
                                <TableRow showHoverTooltip={false}>
                                    <TableCell colSpan={daysInMonth + 15}>
                                        <div className="text-center text-neutral-300 py-8 italic">
                                            Chưa có dữ liệu chấm công tháng {selectedMonth}/{selectedYear}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                monthlySummaryData.map((item, index) => (
                                    <TableRow showHoverTooltip={false} key={item.employee._id} className="hover:bg-darkBorderV1/50">
                                        <TableCell className="sticky left-0 z-10 bg-darkCardV1 text-neutral-300 text-center border-r border-darkBorderV1/50">{index + 1}</TableCell>
                                        <TableCell className="sticky left-[50px] z-10 bg-darkCardV1 text-center border-r border-darkBorderV1/50">
                                            <Badge variant="cyan" className="px-1.5 py-0 min-w-[60px] justify-center">{item.employee.employeeCode}</Badge>
                                        </TableCell>
                                        <TableCell className="sticky left-[140px] z-10 bg-darkCardV1 text-nowrap font-medium shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">
                                            {item.employee.fullName}
                                        </TableCell>
                                        {Array.from({ length: daysInMonth }, (_, i) => {
                                            const day = i + 1;
                                            const record = item.records.find((r) => new Date(r.date).getDate() === day);
                                            const weekend = isWeekend(day, selectedMonth, selectedYear);
                                            return (
                                                <TableCell key={day} className={record?.businessTripNotes ? "bg-orange-500/10" : ""}>
                                                    {record ? (
                                                        record.businessTripNotes ? (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Badge variant={ATTENDANCE_TYPE_COLORS[record.type] as any} className="cursor-pointer">
                                                                        {ATTENDANCE_TYPE_SYMBOLS[record.type]}
                                                                    </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-[250px]">
                                                                    <div className="text-sm font-semibold text-green-400 mb-1">Ghi chú công tác:</div>
                                                                    <div className="text-sm">{record.businessTripNotes}</div>
                                                                    {record.notes && (
                                                                        <>
                                                                            <div className="text-sm items-center gap-1 border-t border-darkBorderV1/50 pt-1 mt-1 font-bold text-orange-400">Ghi chú thêm:</div>
                                                                            <div className="text-sm italic text-neutral-400">{record.notes}</div>
                                                                        </>
                                                                    )}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : (
                                                            <Badge variant={ATTENDANCE_TYPE_COLORS[record.type] as any}>
                                                                {ATTENDANCE_TYPE_SYMBOLS[record.type]}
                                                            </Badge>
                                                        )
                                                    ) : (
                                                        <span className={weekend ? "text-orange-400/30" : "text-neutral-700"}>{weekend ? "–" : ""}</span>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell className="font-bold text-green-400 text-center">{item.summary.totalWorkDays}</TableCell>
                                        <TableCell className="font-bold text-indigo-400 text-center">{item.summary.totalBusinessTrip}</TableCell>
                                        <TableCell className="font-bold text-orange-400 text-center">{item.summary.totalCompensatoryLeave}</TableCell>
                                        <TableCell className="font-bold text-blue-400 text-center">{item.summary.totalAnnualLeave}</TableCell>
                                        <TableCell className="font-bold text-amber-400 text-center">{item.summary.totalSickLeave}</TableCell>
                                        <TableCell className="font-bold text-pink-400 text-center">{item.summary.totalMaternityLeave}</TableCell>
                                        <TableCell className="font-bold text-green-400 text-center">{item.summary.totalWorkDays + item.summary.totalBusinessTrip}</TableCell>
                                        <TableCell className="font-bold text-orange-400 text-center">{item.summary.totalWeekendWork}</TableCell>
                                        <TableCell className="font-bold text-amber-400 text-center">{item.summary.totalPaidLeave}</TableCell>
                                        <TableCell className={`font-bold text-center ${item.summary.surplusDays > 0 ? "text-emerald-400" : "text-neutral-300"}`}>
                                            {item.summary.surplusDays}
                                        </TableCell>
                                        <TableCell className="font-bold text-primary text-center bg-primary/5">{item.summary.totalAttendance}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </motion.div>
    );
}
