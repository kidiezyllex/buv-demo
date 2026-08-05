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
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { ISafetyInspection } from "@/interface/employee";
import { formatDateOnly } from "@/lib/format";
import {
    mdiArchiveEyeOutline,
    mdiBarcode,
    mdiCalendar,
    mdiClose,
    mdiFilePdfBox,
    mdiLinkVariant,
    mdiOfficeBuilding,
    mdiShieldCheckOutline,
    mdiTooltipImageOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import Link from "next/link";

interface SafetyInspectionDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    inspection: ISafetyInspection | null;
}

export function SafetyInspectionDetailsDialog({
    isOpen,
    onClose,
    inspection,
}: SafetyInspectionDetailsDialogProps) {
    if (!inspection) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiArchiveEyeOutline} size={0.8} className="flex-shrink-0" />
                        <span>Chi tiết lịch sử kiểm tra an toàn</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                        <Table>
                            <TableBody>
                                <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                    <TableCell className="font-semibold text-neutral-300 w-1/3">
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiCalendar} size={0.6} />
                                            <span>Ngày tạo</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-neutral-300">
                                        {inspection.createdAt ? formatDateOnly(inspection.createdAt) : "---"}
                                    </TableCell>
                                </TableRow>
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableCell className="font-semibold text-neutral-300">
                                        <div className="flex items-center gap-2">
                                            <Icon path={mdiFilePdfBox} size={0.6} />
                                            <span>Bài thi sát hạch</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {inspection.examFile ? (
                                            <Link
                                                href={inspection.examFile}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline underline-offset-4"
                                            >
                                                <Icon path={mdiLinkVariant} size={0.8} className="flex-shrink-0" />
                                                Click để xem và tải xuống
                                            </Link>
                                        ) : (
                                            <span className="text-neutral-300 italic text-sm">Không có tệp</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Card>

                    <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <h3 className="text-primary font-semibold whitespace-nowrap">Hồ sơ an toàn điện</h3>
                            <div className="flex-1 border-b border-dashed border-primary mr-1" />
                        </div>
                        <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                            <Table>
                                <TableBody>
                                    <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                        <TableCell className="font-semibold text-neutral-300 w-1/3">
                                            <div className="flex items-center gap-2">
                                                <Icon path={mdiBarcode} size={0.6} />
                                                <span>Mã thẻ</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-300">
                                            {inspection.electricalSafety?.cardCode ? (
                                                <Badge variant="neutral">{inspection.electricalSafety.cardCode}</Badge>
                                            ) : "---"}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                        <TableCell className="font-semibold text-neutral-300">
                                            <div className="flex items-center gap-2">
                                                <Icon path={mdiCalendar} size={0.6} />
                                                <span>Ngày cấp thẻ</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-300">
                                            {inspection.electricalSafety?.cardIssueDate
                                                ? formatDateOnly(inspection.electricalSafety.cardIssueDate)
                                                : "---"}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                        <TableCell className="font-semibold text-neutral-300">
                                            <div className="flex items-center gap-2">
                                                <Icon path={mdiShieldCheckOutline} size={0.6} />
                                                <span>Bậc an toàn</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-300">
                                            {inspection.electricalSafety?.level ? (
                                                <Badge variant="green">{inspection.electricalSafety.level}</Badge>
                                            ) : "---"}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableCell className="font-semibold text-neutral-300">
                                            <div className="flex items-center gap-2">
                                                <Icon path={mdiTooltipImageOutline} size={0.6} />
                                                <span>Ảnh thẻ</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {inspection.electricalSafety?.cardImage ? (
                                                <img
                                                    src={inspection.electricalSafety.cardImage}
                                                    alt="Thẻ an toàn điện"
                                                    className="object-contain rounded-md max-h-[180px] w-auto border border-darkBorderV1"
                                                />
                                            ) : (
                                                <span className="text-neutral-300 italic text-sm">Chưa có ảnh</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center gap-3 md:gap-4">
                            <h3 className="text-primary font-semibold whitespace-nowrap">Hồ sơ an toàn lao động</h3>
                            <div className="flex-1 border-b border-dashed border-primary mr-1" />
                        </div>
                        <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                            <Table>
                                <TableBody>
                                    <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                        <TableCell className="font-semibold text-neutral-300 w-1/3">
                                            <div className="flex items-center gap-2">
                                                <Icon path={mdiBarcode} size={0.6} />
                                                <span>Mã thẻ</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-300">
                                            {inspection.laborSafety?.cardCode ? (
                                                <Badge variant="neutral">{inspection.laborSafety.cardCode}</Badge>
                                            ) : "---"}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                        <TableCell className="font-semibold text-neutral-300">
                                            <div className="flex items-center gap-2">
                                                <Icon path={mdiCalendar} size={0.6} />
                                                <span>Ngày cấp thẻ</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-300">
                                            {inspection.laborSafety?.cardIssueDate
                                                ? formatDateOnly(inspection.laborSafety.cardIssueDate)
                                                : "---"}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                        <TableCell className="font-semibold text-neutral-300">
                                            <div className="flex items-center gap-2">
                                                <Icon path={mdiOfficeBuilding} size={0.6} />
                                                <span>Đơn vị cấp</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-300">
                                            {inspection.laborSafety?.issuer ? (
                                                <Badge variant="green">{inspection.laborSafety.issuer}</Badge>
                                            ) : "---"}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableCell className="font-semibold text-neutral-300">
                                            <div className="flex items-center gap-2">
                                                <Icon path={mdiTooltipImageOutline} size={0.6} />
                                                <span>Ảnh thẻ</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {inspection.laborSafety?.cardImage ? (
                                                <img
                                                    src={inspection.laborSafety.cardImage}
                                                    alt="Thẻ an toàn lao động"
                                                    className="object-contain rounded-md max-h-[180px] w-auto border border-darkBorderV1"
                                                />
                                            ) : (
                                                <span className="text-neutral-300 italic text-sm">Chưa có ảnh</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
