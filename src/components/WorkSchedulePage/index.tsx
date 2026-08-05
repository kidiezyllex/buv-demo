"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Icon from "@mdi/react";
import {
    mdiCalendarPlusOutline,
    mdiChevronLeft,
    mdiChevronRight,
    mdiGestureDoubleTap,
    mdiMagnify
} from "@mdi/js";
import { useEmployees } from "@/hooks/useEmployees";
import { useWorkScheduleCalendar } from "@/hooks/useWorkSchedule";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { IWorkSchedule } from "@/interface/workSchedule";
import { CreateWorkScheduleDialog } from "./CreateWorkScheduleDialog";
import { WorkScheduleDetailsDialog } from "./WorkScheduleDetailsDialog";
import { UpdateWorkScheduleDialog } from "./UpdateWorkScheduleDialog";
import { IEmployee } from "@/interface/employee";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { WeeklyScheduleTable } from "./WeeklyScheduleTable";
import { usePermissions } from "@/hooks/usePermissions";
import { useResponsive } from "@/hooks/use-mobile";
// Helper function to get start of week (Monday)
const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
};

// Helper function to get week dates
const getWeekDates = (startDate: Date) => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
    }
    return dates;
};

export default function WorkSchedulePage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<IWorkSchedule | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedEmployeeIdForDialog, setSelectedEmployeeIdForDialog] = useState<string | undefined>();

    const { hasPermission } = usePermissions();
    const { isMobile, isTablet } = useResponsive();
    const canAdd = hasPermission("task-schedule:add");
    const canUpdate = hasPermission("task-schedule:update");

    // Calculate week dates
    const weekStart = getStartOfWeek(currentDate);
    const weekDates = getWeekDates(weekStart);

    const formatDateParam = (date: Date) => {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const d = date.getDate().toString().padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const { data: employeesResponse, isLoading: loadingEmployees } = useEmployees({
        page: 1,
        limit: 100,
        isActive: true,
    });

    // Fetch calendar data
    const { data: calendarResponse, isLoading: loadingCalendar } = useWorkScheduleCalendar({
        startDate: formatDateParam(weekDates[0]),
        endDate: formatDateParam(weekDates[6]),
        employeeId: selectedEmployeeId === "all" ? undefined : selectedEmployeeId,
    });

    const employees = employeesResponse?.data?.employees || [];
    const calendarData = calendarResponse?.data?.calendar || [];

    // Filter employees by search query and selected employee
    const filteredEmployees = useMemo(() => {
        let result = employees;

        // Filter by selected employee dropdown
        if (selectedEmployeeId !== "all") {
            result = result.filter((emp: IEmployee) => emp._id === selectedEmployeeId);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (emp: IEmployee) =>
                    emp.fullName?.toLowerCase().includes(query) ||
                    emp.employeeCode?.toLowerCase().includes(query) ||
                    emp.department?.toLowerCase().includes(query)
            );
        }

        return result;
    }, [employees, searchQuery, selectedEmployeeId]);

    // Navigate to previous week
    const handlePreviousWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    // Navigate to next week
    const handleNextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    // Go to current week
    const handleToday = () => {
        setCurrentDate(new Date());
    };

    // Handle cell click (create new schedule)
    const handleCellClick = (employeeId: string, date: string) => {
        setSelectedEmployeeIdForDialog(employeeId);
        setSelectedDate(date);
        setSelectedSchedule(null);
        setIsCreateDialogOpen(true);
    };

    // Handle schedule click (view details)
    const handleScheduleClick = (schedule: IWorkSchedule) => {
        setSelectedSchedule(schedule);
        setIsDetailsDialogOpen(true);
    };

    // Format week range for display
    const formatWeekRange = () => {
        const start = weekDates[0];
        const end = weekDates[6];
        const startStr = `${start.getDate()}/${start.getMonth() + 1}`;
        const endStr = `${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
        return `${startStr} - ${endStr}`;
    };

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
                        <BreadcrumbPage>Lịch làm việc</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {isMobile ? (
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <div className="relative w-full">
                            <Input
                                placeholder="Tìm kiếm nhân viên..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 w-full text-sm"
                            />
                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>
                    </div>
                    <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Xem theo nhân viên" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả nhân viên</SelectItem>
                            {employees.map((emp: IEmployee) => (
                                <SelectItem key={emp._id} value={emp._id}>
                                    {emp.employeeCode} - {emp.fullName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button size="icon" onClick={handlePreviousWeek} variant="ghost">
                                <Icon path={mdiChevronLeft} size={0.8} className="flex-shrink-0" />
                            </Button>
                            <Button onClick={handleToday} variant="ghost">
                                <Icon path={mdiGestureDoubleTap} size={0.8} className="flex-shrink-0" />
                                Tuần hiện tại
                            </Button>
                            <Button size="icon" onClick={handleNextWeek} variant="ghost">
                                <Icon path={mdiChevronRight} size={0.8} className="flex-shrink-0" />
                            </Button>
                        </div>
                        <div className="text-sm font-semibold text-neutral-300">
                            {formatWeekRange()}
                        </div>
                    </div>
                    {canAdd && (
                        <Button
                            className="w-full"
                            onClick={() => {
                                setSelectedSchedule(null);
                                setIsCreateDialogOpen(true);
                            }}
                        >
                            <Icon path={mdiCalendarPlusOutline} size={0.8} className="flex-shrink-0" />
                            Thêm lịch làm việc
                        </Button>
                    )}
                </div>
            ) : isTablet ? (
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <div className="relative w-full flex-1">
                            <Input
                                placeholder="Tìm kiếm nhân viên..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 py-2 w-full"
                            />
                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                        </div>
                        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Xem theo nhân viên" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả nhân viên</SelectItem>
                                {employees.map((emp: IEmployee) => (
                                    <SelectItem key={emp._id} value={emp._id}>
                                        {emp.employeeCode} - {emp.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button size="icon" onClick={handlePreviousWeek} variant="ghost">
                                <Icon path={mdiChevronLeft} size={0.8} className="flex-shrink-0" />
                            </Button>
                            <Button onClick={handleToday} variant="ghost">
                                <Icon path={mdiGestureDoubleTap} size={0.8} className="flex-shrink-0" />
                                Tuần hiện tại
                            </Button>
                            <Button size="icon" onClick={handleNextWeek} variant="ghost">
                                <Icon path={mdiChevronRight} size={0.8} className="flex-shrink-0" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-sm font-semibold text-neutral-300">
                                {formatWeekRange()}
                            </div>
                            {canAdd && (
                                <Button
                                    onClick={() => {
                                        setSelectedSchedule(null);
                                        setIsCreateDialogOpen(true);
                                    }}
                                >
                                    <Icon path={mdiCalendarPlusOutline} size={0.8} className="flex-shrink-0" />
                                    Thêm lịch làm việc
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="relative w-full flex-1 min-w-[300px]">
                            <Input
                                placeholder="Tìm kiếm nhân viên..."
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
                                        setSelectedSchedule(null);
                                        setIsCreateDialogOpen(true);
                                    }}
                                >
                                    <Icon path={mdiCalendarPlusOutline} size={0.8} className="flex-shrink-0" />
                                    Thêm lịch làm việc
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Week Navigation */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button size="icon" onClick={handlePreviousWeek} variant="ghost">
                                <Icon path={mdiChevronLeft} size={0.8} className="flex-shrink-0" />
                            </Button>
                            <Button onClick={handleToday} variant="ghost">
                                <Icon path={mdiGestureDoubleTap} size={0.8} className="flex-shrink-0" />
                                Tuần hiện tại
                            </Button>
                            <Button size="icon" onClick={handleNextWeek} variant="ghost">
                                <Icon path={mdiChevronRight} size={0.8} className="flex-shrink-0" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-neutral-300 text-sm font-semibold">Xem theo nhân viên:</p>
                            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                                <SelectTrigger className="w-[250px]">
                                    <SelectValue placeholder="Xem theo nhân viên" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả nhân viên</SelectItem>
                                    {employees.map((emp: IEmployee) => (
                                        <SelectItem key={emp._id} value={emp._id}>
                                            {emp.employeeCode} - {emp.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm font-semibold text-neutral-300">
                            Lịch của tuần: {formatWeekRange()}
                        </div>
                    </div>
                </>
            )}

            {/* Weekly Schedule Table */}
            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                {loadingEmployees || loadingCalendar ? (
                    <div className="flex justify-center items-center py-20">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <WeeklyScheduleTable
                        employees={filteredEmployees}
                        calendarData={calendarData}
                        weekDates={weekDates}
                        onCellClick={canAdd ? handleCellClick : undefined}
                        onScheduleClick={handleScheduleClick}
                    />
                )}
            </Card>

            {/* Dialogs */}
            <CreateWorkScheduleDialog
                isOpen={isCreateDialogOpen}
                onClose={() => {
                    setIsCreateDialogOpen(false);
                    setSelectedDate("");
                    setSelectedEmployeeIdForDialog(undefined);
                }}
                defaultDate={selectedDate}
                defaultEmployeeId={selectedEmployeeIdForDialog || (selectedEmployeeId === "all" ? undefined : selectedEmployeeId)}
            />

            <WorkScheduleDetailsDialog
                isOpen={isDetailsDialogOpen}
                onClose={() => {
                    setIsDetailsDialogOpen(false);
                    setSelectedSchedule(null);
                }}
                scheduleId={selectedSchedule?._id || null}
                onEdit={canUpdate ? (schedule) => {
                    setSelectedSchedule(schedule);
                    setIsUpdateDialogOpen(true);
                } : undefined}
            />

            <UpdateWorkScheduleDialog
                isOpen={isUpdateDialogOpen}
                onClose={() => {
                    setIsUpdateDialogOpen(false);
                    setSelectedSchedule(null);
                }}
                schedule={selectedSchedule}
            />
        </div>
    );
}
