"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEmployees } from "@/hooks/useEmployees";
import { useCreateWorkSchedule } from "@/hooks/useWorkSchedule";
import { IEmployee } from "@/interface/employee";
import { WorkScheduleStatus } from "@/interface/workSchedule";
import { mdiCalendarPlusOutline, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

interface CreateWorkScheduleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    defaultDate?: string;
    defaultEmployeeId?: string;
}

export function CreateWorkScheduleDialog({
    isOpen,
    onClose,
    defaultDate,
    defaultEmployeeId,
}: CreateWorkScheduleDialogProps) {
    const [formData, setFormData] = useState({
        employeeId: "",
        date: "",
        workContent: "",
        status: WorkScheduleStatus.PENDING,
        result: "",
        notes: "",
    });

    const { data: employeesResponse } = useEmployees({ page: 1, limit: 100, isActive: true });
    const createMutation = useCreateWorkSchedule();
    const employees = employeesResponse?.data?.employees || [];

    useEffect(() => {
        if (isOpen) {
            setFormData({
                employeeId: defaultEmployeeId || "",
                date: defaultDate || format(new Date(), "yyyy-MM-dd"),
                workContent: "",
                status: WorkScheduleStatus.PENDING,
                result: "",
                notes: "",
            });
        }
    }, [defaultDate, defaultEmployeeId, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            employeeId: formData.employeeId,
            date: formData.date,
            workContent: formData.workContent,
            status: formData.status,
            result: formData.result || undefined,
            notes: formData.notes || undefined,
        }, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const isPending = createMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiCalendarPlusOutline} size={0.8} className="flex-shrink-0" />
                        <span>Tạo lịch làm việc mới</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <form id="create-work-schedule-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {(defaultEmployeeId && defaultDate) ? (
                            <div className="col-span-2 p-3 bg-darkBackgroundV1 rounded-lg border border-darkBorderV1 space-y-2">
                                <div className="flex flex-wrap items-center gap-1">
                                    <Badge variant="green">Tạo lịch làm việc cho nhân viên:</Badge>
                                    <Badge variant="neutral">{employees.find((e: IEmployee) => e._id === formData.employeeId)?.fullName || "Nhân viên"} ({employees.find((e: IEmployee) => e._id === formData.employeeId)?.employeeCode})</Badge>
                                    <span>--</span>
                                    <Badge variant="green">Ngày làm việc:</Badge>
                                    <Badge variant="neutral">{formData.date ? format(parseISO(formData.date), "dd/MM/yyyy") : ""}</Badge>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <Label htmlFor="employeeId">
                                        Nhân viên <span className="text-red-400 italic text-xs">(*)</span>
                                    </Label>
                                    <Select
                                        value={formData.employeeId}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, employeeId: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn nhân viên" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((emp: IEmployee) => (
                                                <SelectItem key={emp._id} value={emp._id}>
                                                    {emp.employeeCode} - {emp.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="date">
                                        Ngày làm việc <span className="text-red-400 italic text-xs">(*)</span>
                                    </Label>
                                    <DatePicker
                                        date={formData.date ? parseISO(formData.date) : undefined}
                                        onDateChange={(date) =>
                                            setFormData({
                                                ...formData,
                                                date: date ? format(date, "yyyy-MM-dd") : "",
                                            })
                                        }
                                        captionLayout="dropdown"
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-1.5 col-span-2">
                            <Label htmlFor="workContent">
                                Nội dung công việc <span className="text-red-400 italic text-xs">(*)</span>
                            </Label>
                            <Textarea
                                id="workContent"
                                value={formData.workContent}
                                onChange={(e) =>
                                    setFormData({ ...formData, workContent: e.target.value })
                                }
                                placeholder="Nhập nội dung công việc..."
                                rows={3}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Trạng thái</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, status: value as WorkScheduleStatus })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={WorkScheduleStatus.PENDING}>Chưa thực hiện</SelectItem>
                                    <SelectItem value={WorkScheduleStatus.IN_PROGRESS}>Đang thực hiện</SelectItem>
                                    <SelectItem value={WorkScheduleStatus.COMPLETED}>Hoàn thành</SelectItem>
                                    <SelectItem value={WorkScheduleStatus.OTHER}>Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="result">Kết quả</Label>
                            <Input
                                id="result"
                                value={formData.result}
                                onChange={(e) =>
                                    setFormData({ ...formData, result: e.target.value })
                                }
                                placeholder="Kết quả thực hiện..."
                            />
                        </div>

                        <div className="space-y-1.5 col-span-2">
                            <Label htmlFor="notes">Ghi chú</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData({ ...formData, notes: e.target.value })
                                }
                                placeholder="Nhập ghi chú..."
                                rows={2}
                            />
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        form="create-work-schedule-form"
                        disabled={isPending}
                    >
                        <Icon path={mdiCalendarPlusOutline} size={0.8} className="flex-shrink-0" />
                        {isPending ? "Đang xử lý..." : "Tạo lịch làm việc"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
