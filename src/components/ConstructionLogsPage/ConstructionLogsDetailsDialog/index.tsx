"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { QuantityInput } from "@/components/ui/quantity-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { useEmployees } from "@/hooks/useEmployees";
import { usePermissions } from "@/hooks/usePermissions";
import {
    useLogDetails,
    useUpdateLog
} from "@/hooks/useTasks";
import { useConstructionLogsForm } from "@/stores/useConstructionLogsForm";
import {
    mdiAccountOutline,
    mdiAccountTie,
    mdiArchiveEyeOutline,
    mdiClockEnd,
    mdiClose,
    mdiContentSave,
    mdiDomain,
    mdiFileDocumentRefreshOutline,
    mdiFileExport,
    mdiLoading,
    mdiMapMarkerOutline,
    mdiOfficeBuildingOutline,
    mdiSquareEditOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { format as formatFns, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { downloadConstructionLogDoc, generateConstructionLogHtml } from "../utils/exportTemplate";

interface ConstructionLogsDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    logId: string | null;
    initialIsEditing?: boolean;
    onEndShift?: () => void;
    onRenewLog?: () => void;
}

export function ConstructionLogsDetailsDialog({
    isOpen,
    onClose,
    logId,
    initialIsEditing = false,
    onEndShift,
    onRenewLog,
}: ConstructionLogsDetailsDialogProps) {
    const [isEditing, setIsEditing] = useState(false);
    const { mutate: updateLog, isPending: isUpdating } = useUpdateLog();
    const { hasPermission } = usePermissions();
    const canUpdate = hasPermission("construction-logs:update");

    // Fetch log details
    const { data: logDetailsResponse, isLoading: isDetailsLoading } = useLogDetails(logId || "");
    const logData = useMemo(() => {
        return (logDetailsResponse as any)?.data || null;
    }, [logDetailsResponse]);

    const { data: employeesResponse } = useEmployees({ limit: 1000, isActive: true });
    const employees = employeesResponse?.data?.employees || [];
    const { formData, setFormData, resetFormData } = useConstructionLogsForm();


    // Reset/Set editing mode when dialog opens
    useEffect(() => {
        if (isOpen) {
            setIsEditing(initialIsEditing);
        }
    }, [isOpen, initialIsEditing]);

    // Sync form data when log data is loaded
    useEffect(() => {
        if (logData) {
            setFormData({
                logDate: logData.logDate?.split("T")[0] || "",
                projectName: logData.projectName || "",
                constructionName: logData.constructionName || "",
                location: logData.location || logData.constructionSite || "",
                investor: logData.investor || "",
                supervisionConsultingUnit: logData.supervisionConsultingUnit || "",
                constructionContractor: logData.constructionContractor || "",
                workingHours: logData.workingHours || {
                    morning: { start: 7, end: 11 },
                    afternoon: { start: 13, end: 17 },
                },
                weather: logData.weather || "Nắng",
                temperature: logData.temperature ?? 30,
                employeeCount: logData.employeeCount || 0,
                commander: (logData.commander && typeof logData.commander === 'object') ? (logData.commander as any)._id : (logData.commander || ""),
                supervisionUnit: logData.supervisionUnit || "",
                supervisorName: logData.supervisorName || logData.supervisor || "",
                workDescription: logData.workDescription || "",
                dailyWorkVolume: logData.dailyWorkVolume || "",
                mainWorkItems: logData.mainWorkItems || "",
                materialsHandoverB: logData.materialsHandoverB || "",
                transitionalAcceptance: logData.transitionalAcceptance || "",
                equipmentUsed: Array.isArray(logData.equipmentUsed) ? logData.equipmentUsed.join(", ") : (logData.equipmentUsed || ""),
                notes: logData.notes || "",
                supervisorNotes: (logData as any).supervisorNotes || "",
                supervisorEvaluation: {
                    isScheduleOnTrack: (logData as any).supervisorEvaluation?.isScheduleOnTrack ?? false,
                    isSufficientLaborAndEquipment: (logData as any).supervisorEvaluation?.isSufficientLaborAndEquipment ?? false,
                    isConstructionQualityGood: (logData as any).supervisorEvaluation?.isConstructionQualityGood ?? false,
                    laborSafetyStatus: (logData as any).supervisorEvaluation?.laborSafetyStatus ?? "Bình thường",
                    environmentalSanitationStatus: (logData as any).supervisorEvaluation?.environmentalSanitationStatus ?? "Bình thường",
                    nextDayWorkProposals: (logData as any).supervisorEvaluation?.nextDayWorkProposals || "",
                    progressProposals: (logData as any).supervisorEvaluation?.progressProposals || "",
                },
            });
        }
    }, [logData, isOpen]);

    const sEval = formData.supervisorEvaluation ?? {
        isScheduleOnTrack: false,
        isSufficientLaborAndEquipment: false,
        isConstructionQualityGood: false,
        laborSafetyStatus: "Bình thường" as const,
        environmentalSanitationStatus: "Bình thường" as const,
        nextDayWorkProposals: "",
        progressProposals: "",
    };

    const formatTime = (h: number) => {
        const hours = Math.floor(h);
        const minutes = (h % 1) * 60;
        return `${hours}h${minutes === 0 ? "00" : minutes}`;
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!logId) return;

        updateLog(
            { id: logId, data: formData },
            {
                onSuccess: () => {
                    setIsEditing(false);
                }
            }
        );
    };
    const handleExport = () => {
        if (!logData) return;
        const htmlContent = generateConstructionLogHtml(logData);
        downloadConstructionLogDoc(htmlContent, logData.projectName);
    };

    const isPending = isUpdating || isDetailsLoading;
    const isEnded = logData?.status === "closed" || logData?.status === "completed" || !!logData?.shiftEndTime;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={isEditing ? mdiSquareEditOutline : mdiArchiveEyeOutline} size={0.8} className="flex-shrink-0" />
                        <span>
                            {isEditing
                                ? "Cập nhật nhật ký thi công"
                                : `Chi tiết nhật ký: ${logData?.projectName || "Đang tải..."}`}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {isDetailsLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/3" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        </div>
                    ) : !isEditing ? (
                        <div className="space-y-4">
                            {/* Section: Thong tin du an & cong trinh */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Thông tin dự án &amp; công trình</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>
                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50">
                                                    <div className="flex items-center gap-2"><Icon path={mdiDomain} size={0.6} className="flex-shrink-0" /><span>Dự án</span></div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300 font-bold">{logData?.projectName || "—"}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50">
                                                    <div className="flex items-center gap-2"><Icon path={mdiOfficeBuildingOutline} size={0.6} className="flex-shrink-0" /><span>Hạng mục</span></div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300">{logData?.constructionName || "—"}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50">
                                                    <div className="flex items-center gap-2"><Icon path={mdiMapMarkerOutline} size={0.6} className="flex-shrink-0" /><span>Địa điểm</span></div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300">{logData?.location || logData?.constructionSite || "—"}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50">
                                                    <div className="flex items-center gap-2"><Icon path={mdiAccountOutline} size={0.6} className="flex-shrink-0" /><span>Chủ đầu tư</span></div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300">{logData?.investor || "—"}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50">
                                                    <div className="flex items-center gap-2"><Icon path={mdiAccountTie} size={0.6} className="flex-shrink-0" /><span>Đơn vị giám sát</span></div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300">{logData?.supervisionConsultingUnit || "—"}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50">
                                                    <div className="flex items-center gap-2"><Icon path={mdiOfficeBuildingOutline} size={0.6} className="flex-shrink-0" /><span>Bên thi công</span></div>
                                                </TableCell>
                                                <TableCell className="text-neutral-300">{logData?.constructionContractor || "—"}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>

                            {/* Section: Nhat ky thi cong xay dung cong trinh */}
                            <div className="space-y-3 w">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Nhật ký thi công xây dựng công trình</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>
                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50">
                                                    <div className="flex items-center gap-2"><span>MỤC 1. Ngày lập</span></div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">{logData?.logDate ? formatFns(parseISO(logData.logDate), "dd/MM/yyyy") : "—"}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 pl-8">
                                                    <div className="flex items-center gap-2"><span>MỤC 1.1. Ca sáng</span></div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="cyan">{formatTime(logData?.workingHours?.morning?.start)} - {formatTime(logData?.workingHours?.morning?.end)}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 pl-8">
                                                    <div className="flex items-center gap-2"><span>MỤC 1.2. Ca chiều</span></div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="cyan">{formatTime(logData?.workingHours?.afternoon?.start)} - {formatTime(logData?.workingHours?.afternoon?.end)}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50">
                                                    <div className="flex items-center gap-2"><span>MỤC 2. Người ghi nhật ký</span></div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">
                                                        {(logData?.commander && typeof logData.commander === 'object') ? (logData.commander as any).fullName : (logData?.commander || "—")}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50">
                                                    <div className="flex items-center gap-2"><span>MỤC 3. Tình hình thời tiết</span></div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm text-neutral-300">{logData?.weather || "—"}</span>
                                                        {logData?.temperature && <Badge variant="orange" className="font-bold">{logData.temperature}°C</Badge>}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50">
                                                    <div className="flex items-center gap-2"><span>MỤC 4. Đơn vị giám sát</span></div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm text-neutral-300">{logData?.supervisionUnit || "—"}</span>
                                                        <div className="flex items-center gap-1">
                                                            <span>Người giám sát:</span>
                                                            {(logData?.supervisorName || logData?.supervisor) && (
                                                                <div className="flex items-center gap-1">
                                                                    <Badge variant="neutral">{logData?.supervisorName || logData?.supervisor}</Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50">
                                                    <div className="flex items-center gap-2"><span>MỤC 5. Lực lượng công nhân xây lắp</span></div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="cyan">{logData?.employeeCount || 0} người</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 align-top">
                                                    <div className="flex items-center gap-2"><span>MỤC 6. Liệt kê máy móc thi công</span></div>
                                                </TableCell>
                                                <TableCell className="text-sm text-neutral-300">
                                                    {Array.isArray(logData?.equipmentUsed) ? logData.equipmentUsed.join(", ") : (logData?.equipmentUsed || "Không sử dụng thiết bị")}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 align-top">
                                                    <div className="flex items-center gap-2"><span>MỤC 7. Công việc thực hiện trong ngày</span></div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-neutral-300 leading-relaxed ql-editor !p-0 !bg-transparent border-none outline-none !shadow-none" dangerouslySetInnerHTML={{ __html: logData?.workDescription || "Không có nội dung" }} />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 align-top">
                                                    <div className="flex items-center gap-2"><span>MỤC 8. Khối lượng thi công trong ngày</span></div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-neutral-300 leading-relaxed ql-editor !p-0 !bg-transparent border-none outline-none !shadow-none" dangerouslySetInnerHTML={{ __html: logData?.dailyWorkVolume || "—" }} />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 align-top">
                                                    <div className="flex items-center gap-2"><span>MỤC 9. Liệt kê các hạng mục công việc chính bắt đầu triển khai/hoặc hoàn thành đến ngày ghi nhật ký</span></div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-neutral-300 leading-relaxed ql-editor !p-0 !bg-transparent border-none outline-none !shadow-none" dangerouslySetInnerHTML={{ __html: logData?.mainWorkItems || "—" }} />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 align-top">
                                                    <div className="flex items-center gap-2"><span>MỤC 10. Tình hình bàn giao vật tư cho bên B</span></div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-neutral-300 leading-relaxed ql-editor !p-0 !bg-transparent border-none outline-none !shadow-none" dangerouslySetInnerHTML={{ __html: logData?.materialsHandoverB || "—" }} />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 align-top">
                                                    <div className="flex items-center gap-2"><span>MỤC 11. Công tác nghiệm thu chuyển giai đoạn thi công</span></div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-neutral-300 leading-relaxed ql-editor !p-0 !bg-transparent border-none outline-none !shadow-none" dangerouslySetInnerHTML={{ __html: logData?.transitionalAcceptance || "—" }} />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 align-top">
                                                    <div className="flex items-center gap-2"><span>MỤC 12. Các lưu ý của giám sát A đối với nhà thầu</span></div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-neutral-300 leading-relaxed ql-editor !p-0 !bg-transparent border-none outline-none !shadow-none" dangerouslySetInnerHTML={{ __html: (logData as any)?.supervisorNotes || "—" }} />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50" colSpan={2}>
                                                    <span className="font-semibold">MỤC 13. Đánh giá của giám sát A</span>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 pl-8">
                                                    <span>MỤC 13.1. Tiến độ công việc có đáp ứng tiến độ thỏa thuận</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={(logData as any)?.supervisorEvaluation?.isScheduleOnTrack ? "green" : "destructive"}>
                                                        {(logData as any)?.supervisorEvaluation?.isScheduleOnTrack ? "Có" : "Không"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 pl-8">
                                                    <span>MỤC 13.2. Nhà thầu có bố trí đủ nhân lực và máy móc theo cam kết</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={(logData as any)?.supervisorEvaluation?.isSufficientLaborAndEquipment ? "green" : "destructive"}>
                                                        {(logData as any)?.supervisorEvaluation?.isSufficientLaborAndEquipment ? "Có" : "Không"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 pl-8">
                                                    <span>MỤC 13.3. Chất lượng thi công có đảm bảo/không đảm bảo</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={(logData as any)?.supervisorEvaluation?.isConstructionQualityGood ? "green" : "destructive"}>
                                                        {(logData as any)?.supervisorEvaluation?.isConstructionQualityGood ? "Đảm bảo" : "Không đảm bảo"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 pl-8">
                                                    <span>MỤC 13.4. Tình hình công tác an toàn lao động</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={(logData as any)?.supervisorEvaluation?.laborSafetyStatus === "Tốt" ? "green" : (logData as any)?.supervisorEvaluation?.laborSafetyStatus === "Kém" ? "destructive" : "neutral"}>
                                                        {(logData as any)?.supervisorEvaluation?.laborSafetyStatus || "—"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 pl-8">
                                                    <span>MỤC 13.5. Tình hình công tác vệ sinh môi trường</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={(logData as any)?.supervisorEvaluation?.environmentalSanitationStatus === "Tốt" ? "green" : (logData as any)?.supervisorEvaluation?.environmentalSanitationStatus === "Kém" ? "destructive" : "neutral"}>
                                                        {(logData as any)?.supervisorEvaluation?.environmentalSanitationStatus || "—"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 pl-8 align-top">
                                                    <span>MỤC 13.6. Những đề xuất công việc ngày tới</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-neutral-300 leading-relaxed ql-editor !p-0 !bg-transparent border-none outline-none !shadow-none" dangerouslySetInnerHTML={{ __html: (logData as any)?.supervisorEvaluation?.nextDayWorkProposals || "—" }} />
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[30%] bg-darkBackgroundV2/50 pl-8 align-top">
                                                    <span>MỤC 13.7. Những đề xuất để đảm bảo tiến độ</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-neutral-300 leading-relaxed ql-editor !p-0 !bg-transparent border-none outline-none !shadow-none" dangerouslySetInnerHTML={{ __html: (logData as any)?.supervisorEvaluation?.progressProposals || "—" }} />
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <form id="log-details-form" onSubmit={handleSubmit} className="space-y-4">
                            {/* Form fields (copied and adapted from LogDialog) */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Thông tin dự án & công trình</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label>Tên dự án</Label>
                                        <Input
                                            value={formData.projectName}
                                            onChange={(e) => setFormData({ projectName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Hạng mục</Label>
                                        <Input
                                            value={formData.constructionName}
                                            onChange={(e) => setFormData({ constructionName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Địa điểm</Label>
                                        <Input
                                            value={formData.location}
                                            onChange={(e) => setFormData({ location: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Chủ đầu tư</Label>
                                        <Input
                                            value={formData.investor}
                                            onChange={(e) => setFormData({ investor: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Đơn vị giám sát</Label>
                                        <Input
                                            value={formData.supervisionConsultingUnit}
                                            onChange={(e) => setFormData({ supervisionConsultingUnit: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Bên thi công</Label>
                                        <Input
                                            value={formData.constructionContractor}
                                            onChange={(e) => setFormData({ constructionContractor: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Nhật ký thi công */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Nhật ký thi công xây dựng công trình</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        {/* MỤC 1 */}
                                        <div className="space-y-1">
                                            <Label>MỤC 1. Ngày lập</Label>
                                            <DatePicker
                                                date={formData.logDate ? parseISO(formData.logDate) : undefined}
                                                onDateChange={(date) => setFormData({
                                                    logDate: date ? formatFns(date, "yyyy-MM-dd") : ""
                                                })}
                                            />
                                        </div>
                                        {/* MỤC 2 */}
                                        <div className="space-y-1">
                                            <Label>MỤC 2. Người ghi nhật ký</Label>
                                            <Select
                                                value={formData.commander}
                                                onValueChange={(v) => setFormData({ commander: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn người ghi nhật ký" />
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
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-4">
                                            <Label>
                                                <span>MỤC 1.1. Ca sáng</span>
                                                <span className="text-primary ml-2">{formatTime(formData.workingHours.morning.start)} - {formatTime(formData.workingHours.morning.end)}</span>
                                            </Label>
                                            <Slider
                                                min={4} max={12.5} step={0.5}
                                                value={[formData.workingHours.morning.start, formData.workingHours.morning.end]}
                                                onValueChange={([start, end]) => setFormData({
                                                    workingHours: { ...formData.workingHours, morning: { start, end } }
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label>
                                                <span>MỤC 1.2. Ca chiều</span>
                                                <span className="text-primary ml-2">{formatTime(formData.workingHours.afternoon.start)} - {formatTime(formData.workingHours.afternoon.end)}</span>
                                            </Label>
                                            <Slider
                                                min={12.5} max={22} step={0.5}
                                                value={[formData.workingHours.afternoon.start, formData.workingHours.afternoon.end]}
                                                onValueChange={([start, end]) => setFormData({
                                                    workingHours: { ...formData.workingHours, afternoon: { start, end } }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* MỤC 3 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label>MỤC 3. Tình hình thời tiết</Label>
                                        <Input
                                            value={formData.weather}
                                            onChange={(e) => setFormData({ weather: e.target.value })}
                                            placeholder="VD: Nắng, Mưa..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Nhiệt độ (°C)</Label>
                                        <QuantityInput
                                            value={formData.temperature}
                                            onChange={(val) => setFormData({ temperature: val })}
                                        />
                                    </div>
                                </div>
                                {/* MỤC 4 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label>MỤC 4. Đơn vị giám sát</Label>
                                        <Input
                                            value={formData.supervisionUnit}
                                            onChange={(e) => setFormData({ supervisionUnit: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Người giám sát</Label>
                                        <Input
                                            value={formData.supervisorName}
                                            onChange={(e) => setFormData({ supervisorName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    {/* MỤC 5 */}
                                    <div className="space-y-1">
                                        <Label>MỤC 5. Lực lượng công nhân xây lắp</Label>
                                        <QuantityInput
                                            value={formData.employeeCount}
                                            onChange={(val) => setFormData({ employeeCount: val })}
                                        />
                                    </div>

                                    {/* MỤC 6 */}
                                    <div className="space-y-1">
                                        <Label>MỤC 6. Liệt kê máy móc thi công</Label>
                                        <Input
                                            value={formData.equipmentUsed}
                                            onChange={(e) => setFormData({ equipmentUsed: e.target.value })}
                                            placeholder="VD: Máy xúc, búa, khoan..."
                                        />
                                    </div>


                                </div>
                                {/* MỤC 7 */}
                                <div className="space-y-1.5">
                                    <Label>MỤC 7. Công việc thực hiện trong ngày</Label>
                                    <RichTextEditor
                                        value={formData.workDescription}
                                        onChange={(val) => setFormData({ workDescription: val })}
                                        placeholder="Nhập chi tiết các hạng mục đã thi công trong ngày..."
                                    />
                                </div>

                                {/* MỤC 8 */}
                                <div className="space-y-1.5">
                                    <Label>MỤC 8. Khối lượng thi công trong ngày</Label>
                                    <RichTextEditor
                                        value={formData.dailyWorkVolume}
                                        onChange={(val) => setFormData({ dailyWorkVolume: val })}
                                        placeholder="VD: 100m3 bê tông cốt thép..."
                                    />
                                </div>

                                {/* MỤC 9 */}
                                <div className="space-y-1.5">
                                    <Label>MỤC 9. Liệt kê các hạng mục công việc chính bắt đầu triển khai/hoặc hoàn thành đến ngày ghi nhật ký</Label>
                                    <RichTextEditor
                                        value={formData.mainWorkItems}
                                        onChange={(val) => setFormData({ mainWorkItems: val })}
                                        placeholder="VD: Đổ bê tông sàn tầng 2, lắp dựng cốp pha..."
                                    />
                                </div>

                                {/* MỤC 10 */}
                                <div className="space-y-1.5">
                                    <Label>MỤC 10. Tình hình bàn giao vật tư cho bên B</Label>
                                    <RichTextEditor
                                        value={formData.materialsHandoverB}
                                        onChange={(val) => setFormData({ materialsHandoverB: val })}
                                        placeholder="VD: Đã bàn giao đầy đủ thép và xi măng theo kế hoạch..."
                                    />
                                </div>

                                {/* MỤC 11 */}
                                <div className="space-y-1.5">
                                    <Label>MỤC 11. Công tác nghiệm thu chuyển giai đoạn thi công</Label>
                                    <RichTextEditor
                                        value={formData.transitionalAcceptance}
                                        onChange={(val) => setFormData({ transitionalAcceptance: val })}
                                        placeholder="VD: Đã nghiệm thu cốt thép sàn trước khi đổ bê tông..."
                                    />
                                </div>
                                {/* MỤC 12 */}
                                <div className="space-y-1.5">
                                    <Label>MỤC 12. Các lưu ý của giám sát A đối với nhà thầu</Label>
                                    <RichTextEditor
                                        value={formData.supervisorNotes}
                                        onChange={(val) => setFormData({ supervisorNotes: val })}
                                        placeholder="Nhập các lưu ý của giám sát A..."
                                    />
                                </div>

                                {/* MỤC 13 */}
                                <div className="space-y-3">
                                    <Label>MỤC 13. Đánh giá của giám sát A</Label>
                                    <div className="flex items-center justify-between gap-4">
                                        <Label>MỤC 13.1. Tiến độ công việc có đáp ứng tiến độ thỏa thuận</Label>
                                        <RadioGroup
                                            value={sEval.isScheduleOnTrack ? "true" : "false"}
                                            onValueChange={(v) => setFormData({ supervisorEvaluation: { isScheduleOnTrack: v === "true" } })}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <RadioGroupItem value="true" id="d-sot-yes" className="w-5 h-5" />
                                                <Label htmlFor="d-sot-yes" className="cursor-pointer">Có</Label>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <RadioGroupItem value="false" id="d-sot-no" className="w-5 h-5" />
                                                <Label htmlFor="d-sot-no" className="cursor-pointer">Không</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <Label>MỤC 13.2. Nhà thầu có bố trí đủ nhân lực và máy móc theo cam kết</Label>
                                        <RadioGroup
                                            value={sEval.isSufficientLaborAndEquipment ? "true" : "false"}
                                            onValueChange={(v) => setFormData({ supervisorEvaluation: { isSufficientLaborAndEquipment: v === "true" } })}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <RadioGroupItem value="true" id="d-sle-yes" className="w-5 h-5" />
                                                <Label htmlFor="d-sle-yes" className="cursor-pointer">Có</Label>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <RadioGroupItem value="false" id="d-sle-no" className="w-5 h-5" />
                                                <Label htmlFor="d-sle-no" className="cursor-pointer">Không</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <Label>MỤC 13.3. Chất lượng thi công có đảm bảo/không đảm bảo</Label>
                                        <RadioGroup
                                            value={sEval.isConstructionQualityGood ? "true" : "false"}
                                            onValueChange={(v) => setFormData({ supervisorEvaluation: { isConstructionQualityGood: v === "true" } })}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <RadioGroupItem value="true" id="d-cqg-yes" className="w-5 h-5" />
                                                <Label htmlFor="d-cqg-yes" className="cursor-pointer">Đảm bảo</Label>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <RadioGroupItem value="false" id="d-cqg-no" className="w-5 h-5" />
                                                <Label htmlFor="d-cqg-no" className="cursor-pointer">Không đảm bảo</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <Label>MỤC 13.4. Tình hình công tác an toàn lao động</Label>
                                        <RadioGroup
                                            value={sEval.laborSafetyStatus}
                                            onValueChange={(v) => setFormData({ supervisorEvaluation: { laborSafetyStatus: v as "Tốt" | "Bình thường" | "Kém" } })}
                                            className="flex gap-4"
                                        >
                                            {(["Tốt", "Bình thường", "Kém"] as const).map((v) => (
                                                <div key={v} className="flex items-center gap-1.5">
                                                    <RadioGroupItem value={v} id={`d-ls-${v}`} className="w-5 h-5" />
                                                    <Label htmlFor={`d-ls-${v}`} className="cursor-pointer">{v}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <Label>MỤC 13.5. Tình hình công tác vệ sinh môi trường</Label>
                                        <RadioGroup
                                            value={sEval.environmentalSanitationStatus}
                                            onValueChange={(v) => setFormData({ supervisorEvaluation: { environmentalSanitationStatus: v as "Tốt" | "Bình thường" | "Kém" } })}
                                            className="flex gap-4"
                                        >
                                            {(["Tốt", "Bình thường", "Kém"] as const).map((v) => (
                                                <div key={v} className="flex items-center gap-1.5">
                                                    <RadioGroupItem value={v} id={`d-es-${v}`} className="w-5 h-5" />
                                                    <Label htmlFor={`d-es-${v}`} className="cursor-pointer">{v}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>MỤC 13.6. Những đề xuất công việc ngày tới</Label>
                                        <RichTextEditor
                                            value={sEval.nextDayWorkProposals}
                                            onChange={(v) => setFormData({ supervisorEvaluation: { nextDayWorkProposals: v } })}
                                            placeholder="Nhập đề xuất công việc ngày tới..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>MỤC 13.7. Những đề xuất để đảm bảo tiến độ</Label>
                                        <RichTextEditor
                                            value={sEval.progressProposals}
                                            onChange={(v) => setFormData({ supervisorEvaluation: { progressProposals: v } })}
                                            placeholder="Nhập đề xuất để đảm bảo tiến độ..."
                                        />
                                    </div>
                                </div>

                                {/* Ghi chú thêm */}
                                <div className="space-y-1.5">
                                    <Label>Ghi chú thêm</Label>
                                    <RichTextEditor
                                        value={formData.notes}
                                        onChange={(val) => setFormData({ notes: val })}
                                    />
                                </div>

                            </div>
                        </form>
                    )}
                </div>

                <DialogFooter>
                    {!isEditing ? (
                        <>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                                <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                Đóng
                            </Button>
                            {!isEnded && (
                                <>
                                    <Button
                                        type="button"
                                        onClick={onEndShift}
                                        disabled={isPending}
                                    >
                                        <Icon path={mdiClockEnd} size={0.8} className="flex-shrink-0" />
                                        Kết thúc ca
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={onRenewLog}
                                        disabled={isPending}
                                    >
                                        <Icon path={mdiFileDocumentRefreshOutline} size={0.8} className="flex-shrink-0" />
                                        Làm mới công việc
                                    </Button>
                                </>
                            )}
                            <Button type="button" onClick={handleExport} disabled={isPending}>
                                <Icon path={mdiFileExport} size={0.8} className="flex-shrink-0" />
                                Xuất file Word
                            </Button>

                            {canUpdate && (
                                <Button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    disabled={isPending}
                                >
                                    <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                    Cập nhật
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                disabled={isPending}
                            >
                                <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                onClick={() => handleSubmit()}
                                disabled={isPending}
                            >
                                <Icon path={isUpdating ? mdiLoading : mdiContentSave} size={0.8} spin={isUpdating} />
                                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>

        </Dialog>
    );
}
