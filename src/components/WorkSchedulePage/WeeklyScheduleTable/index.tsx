import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IEmployee } from "@/interface/employee";
import { IWorkSchedule, WorkScheduleStatus } from "@/interface/workSchedule";
import { mdiCalendarRemoveOutline } from "@mdi/js";
import Icon from "@mdi/react";

interface WeeklyScheduleTableProps {
    employees: IEmployee[];
    calendarData: any[];
    weekDates: Date[];
    onCellClick?: (employeeId: string, date: string) => void;
    onScheduleClick: (schedule: IWorkSchedule) => void;
}

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

const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getDayName = (date: Date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
};

// Reorder to start from Monday (Thứ 2)
const getWeekDaysStartingMonday = (weekDates: Date[]) => {
    const sunday = weekDates.find(d => d.getDay() === 0);
    const otherDays = weekDates.filter(d => d.getDay() !== 0);
    return sunday ? [...otherDays, sunday] : weekDates;
};

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
};

export function WeeklyScheduleTable({
    employees,
    calendarData,
    weekDates,
    onCellClick,
    onScheduleClick,
}: WeeklyScheduleTableProps) {
    const orderedWeekDates = getWeekDaysStartingMonday(weekDates);
    const scheduleMap = new Map<string, IWorkSchedule[]>();
    calendarData.forEach((day: any) => {
        day.schedules.forEach((schedule: IWorkSchedule) => {
            const key = `${schedule.employeeId}-${day.date}`;
            if (!scheduleMap.has(key)) {
                scheduleMap.set(key, []);
            }
            scheduleMap.get(key)?.push(schedule);
        });
    });

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px] sticky left-0 bg-darkBackgroundV1 z-10 border-r border-darkBorderV1">
                            Nhân viên
                        </TableHead>
                        {orderedWeekDates.map((date, index) => (
                            <TableHead key={index} className="text-center min-w-[150px] border-r border-darkBorderV1">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{getDayName(date)}</span>
                                        {isToday(date) && (
                                            <Badge variant="cyan">Hôm nay</Badge>
                                        )}
                                    </div>
                                    <span className="text-sm text-neutral-300">{formatDate(date)}</span>
                                </div>
                            </TableHead>
                        ))}

                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((employee) => (
                        <TableRow key={employee._id} className="hover:bg-darkBackgroundV1/50 border-darkBorderV1">
                            <TableCell className="sticky left-0 bg-darkCardV1/95 backdrop-blur-sm z-10 border-r border-darkBorderV1 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.3)]">
                                <div className="flex flex-col gap-2 py-1">
                                    <span className="text-neutral-300 font-bold text-sm leading-tight">{employee.fullName}</span>
                                    <div className="flex flex-wrap gap-1">
                                        <Badge variant="green">{employee.employeeCode}</Badge>
                                        <Badge variant="cyan">{employee.department}</Badge>
                                    </div>
                                </div>
                            </TableCell>
                            {orderedWeekDates.map((date, index) => {
                                const dateKey = formatDateKey(date);
                                const key = `${employee._id}-${dateKey}`;
                                const schedules = scheduleMap.get(key) || [];

                                return (
                                    <TableCell
                                        key={index}
                                        className={`p-2 border-r border-darkBorderV1 ${onCellClick ? 'cursor-pointer' : ''} bg-darkCardV1`}
                                        onClick={() => {
                                            if (schedules.length === 0 && onCellClick) {
                                                onCellClick(employee._id, dateKey);
                                            }
                                        }}
                                    >
                                        <div className="flex flex-col gap-1">
                                            {schedules.length === 0 ? (
                                                <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                                    <Icon path={mdiCalendarRemoveOutline} size={1} className="flex-shrink-0" />
                                                    <span className="text-wrap text-start">{onCellClick ? 'Click để thêm lịch.' : 'Click để thêm lịch.'}</span>
                                                </div>
                                            ) : (
                                                schedules.map((schedule) => (
                                                    <div
                                                        key={schedule._id}
                                                        className={`group cursor-pointer p-2 rounded-lg border transition-all hover:brightness-110 active:scale-[0.98] w-full max-w-[200px] mb-1 last:mb-0 ${getStatusColor(schedule.status)}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onScheduleClick({ ...schedule, date: schedule.date || dateKey });
                                                        }}
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
    );
}
