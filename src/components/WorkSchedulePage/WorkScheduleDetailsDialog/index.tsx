"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWorkScheduleDetails } from "@/hooks/useWorkSchedule";
import { IUpdateHistory, IWorkSchedule, WorkScheduleStatus } from "@/interface/workSchedule";
import {
    mdiAccount,
    mdiAccountGroupOutline,
    mdiBadgeAccountOutline,
    mdiCalendarEdit,
    mdiCalendarMonth,
    mdiCalendarRemoveOutline,
    mdiCheckboxMarkedCircleOutline,
    mdiClockOutline,
    mdiClose,
    mdiHistory,
    mdiInformationOutline,
    mdiNoteTextOutline,
    mdiTextBoxOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { format, isValid, parseISO } from "date-fns";

interface WorkScheduleDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    scheduleId: string | null;
    onEdit?: (schedule: IWorkSchedule) => void;
}

export function WorkScheduleDetailsDialog({
    isOpen,
    onClose,
    scheduleId,
    onEdit,
}: WorkScheduleDetailsDialogProps) {
    const { data: detailsResponse, isLoading } = useWorkScheduleDetails(scheduleId || "");
    const details = detailsResponse?.data;

    if (!scheduleId) return null;

    const getStatusVariant = (status: WorkScheduleStatus) => {
        switch (status) {
            case WorkScheduleStatus.COMPLETED:
                return "green";
            case WorkScheduleStatus.IN_PROGRESS:
                return "blue";
            case WorkScheduleStatus.PENDING:
                return "orange";
            default:
                return "secondary";
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
            case WorkScheduleStatus.OTHER:
                return "Khác";
            default:
                return status;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiInformationOutline} size={0.8} className="flex-shrink-0" />
                        <span>Chi tiết công việc ngày {details?.date && isValid(parseISO(details.date)) ? format(parseISO(details.date), "dd/MM/yyyy") : ""}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <LoadingSpinner />
                        </div>
                    ) : details ? (
                        <div className="space-y-4">
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[180px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiAccount} size={0.6} />
                                                    <span>Nhân viên</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="green">
                                                    {typeof details.employeeId === 'object'
                                                        ? `${details.employeeId.employeeCode} - ${details.employeeId.fullName}`
                                                        : `${details.employeeCode || '-'} - ${details.employeeName || '-'}`}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        {(typeof details.employeeId === 'object' || details.department) && (
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiAccountGroupOutline} size={0.6} />
                                                        <span>Phòng ban</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">
                                                        {typeof details.employeeId === 'object'
                                                            ? details.employeeId.department
                                                            : details.department || '-'}
                                                    </Badge>

                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {(typeof details.employeeId === 'object' || details.position) && (
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiBadgeAccountOutline} size={0.6} />
                                                        <span>Chức vụ</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">{typeof details.employeeId === 'object'
                                                        ? details.employeeId.position
                                                        : details.position || '-'}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiCalendarMonth} size={0.6} />
                                                    <span>Ngày làm việc</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">{details.date && isValid(parseISO(details.date))
                                                    ? format(parseISO(details.date), "dd/MM/yyyy")
                                                    : "Chưa có ngày"}</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold align-top">
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Icon path={mdiTextBoxOutline} size={0.6} />
                                                    <span>Nội dung</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 whitespace-pre-wrap leading-relaxed">
                                                {details.workContent}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiClockOutline} size={0.6} />
                                                    <span>Trạng thái</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(details.status)}>
                                                    {getStatusLabel(details.status)}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold align-top">
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Icon path={mdiCheckboxMarkedCircleOutline} size={0.6} />
                                                    <span>Kết quả</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-neutral-300">
                                                {details.result || <span className="italic text-neutral-400">Chưa có kết quả</span>}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold align-top border-none">
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Icon path={mdiNoteTextOutline} size={0.6} />
                                                    <span>Ghi chú</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {details.notes || <span className="italic text-neutral-400">Không có ghi chú</span>}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Card>

                            {details.updateHistory && details.updateHistory.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <h3 className="text-primary font-semibold whitespace-nowrap flex items-center gap-2">
                                            <Icon path={mdiHistory} size={0.8} className="flex-shrink-0" />
                                            Lịch sử cập nhật
                                        </h3>
                                        <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                    </div>
                                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Thời điểm cập nhật</TableHead>
                                                    <TableHead>Trạng thái</TableHead>
                                                    <TableHead>Nội dung công việc, kết quả, ghi chú</TableHead>
                                                    <TableHead>Người cập nhật</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {details.updateHistory.map((item: IUpdateHistory, index: number) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="align-top">
                                                            <Badge variant="neutral">
                                                                {item.updatedAt && isValid(parseISO(item.updatedAt))
                                                                    ? format(parseISO(item.updatedAt), "HH:mm dd/MM/yyyy")
                                                                    : "Chưa có thời gian"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center align-top">
                                                            <Badge variant={getStatusVariant(item.status)}>
                                                                {getStatusLabel(item.status)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <div className="space-y-1.5 py-0.5">
                                                                <div className="text-sm">
                                                                    <span className="text-neutral-300 font-semibold">Nội dung: </span>
                                                                    <span className="text-neutral-300">{item.workContent}</span>
                                                                </div>
                                                                {item.result && (
                                                                    <div className="text-sm">
                                                                        <span className="text-neutral-300 font-semibold">Kết quả: </span>
                                                                        <span className="text-neutral-300">{item.result}</span>
                                                                    </div>
                                                                )}
                                                                {item.notes && (
                                                                    <div className="text-sm">
                                                                        <span className="text-neutral-300 font-semibold">Ghi chú: </span>
                                                                        <span className="text-neutral-300">{item.notes}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="align-top">
                                                            <Badge variant="green">
                                                                {typeof item.updatedBy === 'object'
                                                                    ? `${item.updatedBy.fullName}`
                                                                    : item.updatedBy}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Card>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-neutral-400 text-sm py-10 italic flex items-center justify-center gap-1">
                            <Icon path={mdiCalendarRemoveOutline} size={0.8} className="flex-shrink-0" />
                            Không tìm thấy chi tiết công việc
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                    {onEdit && details && (
                        <Button
                            type="button"
                            onClick={() => {
                                onClose();
                                onEdit(details);
                            }}
                        >
                            <Icon path={mdiCalendarEdit} size={0.8} className="flex-shrink-0" />
                            Cập nhật lịch
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
