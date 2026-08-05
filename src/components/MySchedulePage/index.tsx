"use client";

import { Badge } from "@/components/ui/badge";
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
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useResponsive } from "@/hooks/use-mobile";
import { useMyWorkScheduleCalendar } from "@/hooks/useWorkSchedule";
import { IWorkSchedule, WorkScheduleStatus } from "@/interface/workSchedule";
import {
    mdiCalendar,
    mdiCalendarRemoveOutline,
    mdiChevronLeft,
    mdiChevronRight,
    mdiGestureDoubleTap,
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { JobDetailsDialog } from "./JobDetailsDialog";

const getStatusColor = (status: WorkScheduleStatus) => {
    switch (status) {
        case WorkScheduleStatus.COMPLETED:
            return "bg-green-500/20 text-green-400 border-green-500/30";
        case WorkScheduleStatus.IN_PROGRESS:
            return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        case WorkScheduleStatus.PENDING:
            return "bg-orange-500/20 text-orange-400 border-orange-500/30";
        default:
            return "bg-neutral-500/20 text-neutral-300 border-neutral-500/30";
    }
};

const getStatusLabel = (status: WorkScheduleStatus) => {
    switch (status) {
        case WorkScheduleStatus.COMPLETED:
            return "Hoàn thành";
        case WorkScheduleStatus.IN_PROGRESS:
            return "Đang thực hiện";
        case WorkScheduleStatus.PENDING:
            return "Chưa thực hiện";
        default:
            return "Khác";
    }
};

const MONTH_NAMES = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];

const getMonthWeeks = (month: number, year: number) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    // Fill in empty days at the start (Mon=0 ... Sun=6)
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startDayOfWeek; i++) {
        currentWeek.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month - 1, day);
        currentWeek.push(date);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    // Fill in empty days at the end
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }

    return weeks;
};

const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

export default function MySchedulePage() {
    const now = new Date();
    const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

    const { isMobile } = useResponsive();

    const { data: calendarResponse, isLoading } = useMyWorkScheduleCalendar({
        month: currentMonth,
        year: currentYear,
    });

    const calendarData = calendarResponse?.data?.calendar || [];

    // Build a map of date -> schedules
    const scheduleMap = useMemo(() => {
        const map = new Map<string, IWorkSchedule[]>();
        calendarData.forEach((day: any) => {
            map.set(day.date, day.schedules || []);
        });
        return map;
    }, [calendarData]);

    const monthWeeks = useMemo(() => getMonthWeeks(currentMonth, currentYear), [currentMonth, currentYear]);

    const handlePreviousMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentMonth(today.getMonth() + 1);
        setCurrentYear(today.getFullYear());
    };

    const handleScheduleClick = (schedule: IWorkSchedule) => {
        setSelectedScheduleId(schedule._id);
        setIsDetailsDialogOpen(true);
    };

    const dayHeaders = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

    return (
        <div className="space-y-3 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
            {/* Breadcrumb */}
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
                        <BreadcrumbPage>Lịch làm cá nhân</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Month Navigation */}
            {isMobile ? (
                <div className="space-y-3">
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-neutral-400 bg-darkBorderV1 h-10 px-3 rounded-md">
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                            <span className="text-green-400">Hoàn thành</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                            <span className="text-blue-400">Đang thực hiện</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                            <span className="text-orange-400">Chưa thực hiện</span>
                        </div>
                    </div>
                    {/* Title */}
                    <div className="text-sm flex-1 font-semibold text-neutral-300 flex items-center gap-1 bg-darkBorderV1 h-10 px-3 rounded-md">
                        <Icon path={mdiCalendar} size={0.8} className="flex-shrink-0" />
                        <span>Lịch làm việc của bạn trong: </span>
                        <span className="text-primary">{MONTH_NAMES[currentMonth - 1]} / {currentYear}</span>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                        <Button size="icon" onClick={handlePreviousMonth} variant="ghost">
                            <Icon path={mdiChevronLeft} size={0.8} className="flex-shrink-0" />
                        </Button>
                        <Button onClick={handleToday} variant="ghost" className="flex-1">
                            <Icon path={mdiGestureDoubleTap} size={0.8} className="flex-shrink-0" />
                            Tháng hiện tại
                        </Button>
                        <Button size="icon" onClick={handleNextMonth} variant="ghost">
                            <Icon path={mdiChevronRight} size={0.8} className="flex-shrink-0" />
                        </Button>
                    </div>
                </div>
            ) : (
                // Desktop
                <div className="flex items-center justify-between gap-3">
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-neutral-400 bg-darkBorderV1 h-10 px-3 rounded-md">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                            <span className="text-green-400">Hoàn thành</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-blue-400" />
                            <span className="text-blue-400">Đang thực hiện</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-orange-400" />
                            <span className="text-orange-400">Chưa thực hiện</span>
                        </div>
                    </div>
                    {/* Title */}
                    <div className="text-sm flex-1 font-semibold text-neutral-300 flex items-center gap-1 bg-darkBorderV1 h-10 px-3 rounded-md">
                        <Icon path={mdiCalendar} size={0.8} className="flex-shrink-0" />
                        <span>Lịch làm việc của bạn trong: </span>
                        <span className="text-primary">{MONTH_NAMES[currentMonth - 1]} / {currentYear}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="icon" onClick={handlePreviousMonth} variant="ghost">
                            <Icon path={mdiChevronLeft} size={0.8} className="flex-shrink-0" />
                        </Button>
                        <Button onClick={handleToday} variant="ghost">
                            <Icon path={mdiGestureDoubleTap} size={0.8} className="flex-shrink-0" />
                            Tháng hiện tại
                        </Button>
                        <Button size="icon" onClick={handleNextMonth} variant="ghost">
                            <Icon path={mdiChevronRight} size={0.8} className="flex-shrink-0" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Monthly Calendar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {dayHeaders.map((day, index) => (
                                            <TableHead key={index} className="text-center min-w-[150px] border-r border-darkBorderV1 last:border-r-0">
                                                <span className="font-semibold">{day}</span>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {monthWeeks.map((week, weekIndex) => (
                                        <TableRow key={weekIndex} className="border-darkBorderV1">
                                            {week.map((date, dayIndex) => {
                                                if (!date) {
                                                    return (
                                                        <TableCell
                                                            key={dayIndex}
                                                            className="p-2 border-r border-darkBorderV1 last:border-r-0 bg-darkBackgroundV1/30 align-top min-h-[100px] h-[120px]"
                                                        />
                                                    );
                                                }

                                                const dateKey = formatDateKey(date);
                                                const schedules = scheduleMap.get(dateKey) || [];
                                                return (
                                                    <TableCell
                                                        key={dayIndex}
                                                        className={`p-2 border-r border-darkBorderV1 last:border-r-0 bg-darkCardV1 align-top min-h-[100px] h-[120px]`}
                                                    >
                                                        <div className="flex flex-col gap-1">
                                                            {/* Date number */}
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-sm font-bold ${isToday(date) ? 'text-primary' : 'text-neutral-400'}`}>
                                                                    {format(date, "dd/MM/yyyy")}
                                                                </span>
                                                                {isToday(date) && (
                                                                    <Badge variant="green">Hôm nay</Badge>
                                                                )}
                                                            </div>

                                                            {/* Schedules */}
                                                            {schedules.length === 0 ? (
                                                                <div className="text-center text-neutral-300 text-sm py-2 italic flex items-center justify-center gap-1">
                                                                    <Icon path={mdiCalendarRemoveOutline} size={0.8} className="flex-shrink-0 text-neutral-400" />
                                                                </div>
                                                            ) : (
                                                                schedules.map((schedule: IWorkSchedule) => (
                                                                    <div
                                                                        key={schedule._id}
                                                                        className={`group cursor-pointer p-2 rounded-lg border transition-all hover:brightness-110 active:scale-[0.98] w-full max-w-[200px] mb-1 last:mb-0 ${getStatusColor(schedule.status)}`}
                                                                        onClick={() => handleScheduleClick(schedule)}
                                                                    >
                                                                        <div className="flex flex-col gap-1">
                                                                            <div className="font-semibold text-xs leading-snug break-words whitespace-normal transition-all">
                                                                                {schedule.workContent}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 opacity-80 mt-1">
                                                                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${schedule.status === WorkScheduleStatus.COMPLETED ? 'bg-green-400' :
                                                                                    schedule.status === WorkScheduleStatus.IN_PROGRESS ? 'bg-blue-400' :
                                                                                        'bg-orange-400'
                                                                                    }`} />
                                                                                <span className="text-xs font-bold uppercase truncate">
                                                                                    {getStatusLabel(schedule.status)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </Card>
            </motion.div>
            <JobDetailsDialog
                isOpen={isDetailsDialogOpen}
                onClose={() => {
                    setIsDetailsDialogOpen(false);
                    setSelectedScheduleId(null);
                }}
                scheduleId={selectedScheduleId}
            />
        </div>
    );
}
