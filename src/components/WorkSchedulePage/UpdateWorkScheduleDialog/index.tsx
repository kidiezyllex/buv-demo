"use client";

import { Button } from "@/components/ui/button";
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
import { useUpdateWorkSchedule } from "@/hooks/useWorkSchedule";
import { IWorkSchedule, WorkScheduleStatus } from "@/interface/workSchedule";
import { mdiCalendarEdit, mdiClose, mdiSquareEditOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";

interface UpdateWorkScheduleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: IWorkSchedule | null;
}

export function UpdateWorkScheduleDialog({
    isOpen,
    onClose,
    schedule,
}: UpdateWorkScheduleDialogProps) {
    const [formData, setFormData] = useState({
        workContent: "",
        status: WorkScheduleStatus.PENDING,
        result: "",
        notes: "",
    });

    const updateMutation = useUpdateWorkSchedule();

    useEffect(() => {
        if (schedule && isOpen) {
            setFormData({
                workContent: schedule.workContent,
                status: schedule.status,
                result: schedule.result || "",
                notes: schedule.notes || "",
            });
        }
    }, [schedule, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!schedule) return;

        updateMutation.mutate({
            id: schedule._id,
            data: {
                workContent: formData.workContent,
                status: formData.status,
                result: formData.result || undefined,
                notes: formData.notes || undefined,
            },
        }, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const isPending = updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiCalendarEdit} size={0.8} className="flex-shrink-0" />
                        <span>Cập nhật lịch làm việc: Nhân viên {typeof schedule?.employeeId === 'object' ? schedule.employeeId.fullName : schedule?.employeeName} ({typeof schedule?.employeeId === 'object' ? schedule.employeeId.employeeCode : schedule?.employeeCode})</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <form id="update-work-schedule-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
                        form="update-work-schedule-form"
                        disabled={isPending}
                    >
                        <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                        {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
