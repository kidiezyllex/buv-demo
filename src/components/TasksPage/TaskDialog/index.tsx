"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useEmployees } from "@/hooks/useEmployees";
import { ITask } from "@/interface/task";
import Icon from "@mdi/react";
import { mdiClipboardPlus, mdiClipboardEdit } from "@mdi/js";

interface TaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    task: ITask | null;
}

const statusOptions = [
    { value: "pending", label: "Chờ xử lý" },
    { value: "in-progress", label: "Đang thực hiện" },
    { value: "completed", label: "Hoàn thành" },
    { value: "overdue", label: "Quá hạn" },
];

export function TaskDialog({ isOpen, onClose, task }: TaskDialogProps) {
    const isEdit = !!task;
    const { mutate: createTask, isPending: isCreating } = useCreateTask();
    const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
    const { data: employeesRes } = useEmployees({ page: 1, limit: 200 });
    const employees = employeesRes?.data?.employees || [];

    const [formData, setFormData] = useState({
        taskContent: "",
        assignerId: "",
        assigneeId: "",
        deadline: new Date().toISOString().split("T")[0],
        status: "pending",
        notes: "",
    });

    useEffect(() => {
        if (isOpen) {
            if (task) {
                setFormData({
                    taskContent: task.taskContent,
                    assignerId: task.assignerId,
                    assigneeId: task.assigneeId,
                    deadline: task.deadline?.split("T")[0] || new Date().toISOString().split("T")[0],
                    status: task.status,
                    notes: task.notes || "",
                });
            } else {
                setFormData({
                    taskContent: "",
                    assignerId: "",
                    assigneeId: "",
                    deadline: new Date().toISOString().split("T")[0],
                    status: "pending",
                    notes: "",
                });
            }
        }
    }, [isOpen, task]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit && task) {
            updateTask(
                { id: task._id, data: { status: formData.status, notes: formData.notes } },
                { onSuccess: () => onClose() }
            );
        } else {
            createTask(
                {
                    taskContent: formData.taskContent,
                    assignerId: formData.assignerId,
                    assigneeId: formData.assigneeId,
                    deadline: formData.deadline,
                    notes: formData.notes,
                },
                { onSuccess: () => onClose() }
            );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={isEdit ? mdiClipboardEdit : mdiClipboardPlus} size={0.8} className="flex-shrink-0" />
                        <span>{isEdit ? "Cập nhật công việc" : "Phân công công việc"}</span>
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                    <div>
                        <Label>Nội dung công việc</Label>
                        <Textarea
                            value={formData.taskContent}
                            onChange={(e) => setFormData((p) => ({ ...p, taskContent: e.target.value }))}
                            placeholder="Mô tả công việc..."
                            className="bg-darkBackgroundV1 border-darkBorderV1"
                            rows={3}
                            required={!isEdit}
                            disabled={isEdit}
                        />
                    </div>
                    {!isEdit && (
                        <>
                            <div>
                                <Label>Người giao</Label>
                                <Select
                                    value={formData.assignerId}
                                    onValueChange={(v) => setFormData((p) => ({ ...p, assignerId: v }))}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn người giao" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp: any) => (
                                            <SelectItem key={emp._id} value={emp._id}>
                                                {emp.fullName} ({emp.employeeCode})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Người nhận</Label>
                                <Select
                                    value={formData.assigneeId}
                                    onValueChange={(v) => setFormData((p) => ({ ...p, assigneeId: v }))}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn người nhận" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp: any) => (
                                            <SelectItem key={emp._id} value={emp._id}>
                                                {emp.fullName} ({emp.employeeCode})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Hạn chót</Label>
                                <Input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData((p) => ({ ...p, deadline: e.target.value }))}
                                    required
                                />
                            </div>
                        </>
                    )}
                    {isEdit && (
                        <div>
                            <Label>Trạng thái</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(v: any) => setFormData((p) => ({ ...p, status: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div>
                        <Label>Ghi chú</Label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                            className="bg-darkBackgroundV1 border-darkBorderV1"
                            rows={2}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isCreating || isUpdating} className="bg-primary">
                            {isCreating || isUpdating ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo công việc"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
