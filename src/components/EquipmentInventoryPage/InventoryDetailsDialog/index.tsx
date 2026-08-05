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
import { useInventoryCheckDetails, usePrintInventoryCheck } from "@/hooks/useEquipment";
import { cn } from "@/lib/utils";
import {
    mdiAccount,
    mdiAlertCircleOutline,
    mdiCalendar,
    mdiClipboardTextOutline,
    mdiClose,
    mdiPrinter,
    mdiTagOutline,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface InventoryDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    recordId: string | null;
    onDelete?: (id: string) => void;
}

export function InventoryDetailsDialog({ isOpen, onClose, recordId, onDelete }: InventoryDetailsDialogProps) {
    const { data: response, isLoading } = useInventoryCheckDetails(recordId || "");
    const { mutate: printCheck, isPending: isPrinting } = usePrintInventoryCheck();
    const record = response?.data;

    const handleDelete = () => {
        if (recordId && onDelete) {
            onDelete(recordId);
            onClose();
        }
    };

    if (!recordId) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiClipboardTextOutline} size={0.8} className="flex-shrink-0" />
                        <span>Chi tiết phiếu kiểm kê</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <LoadingSpinner />
                        </div>
                    ) : record ? (
                        <>
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow className="border-darkBorderV1/50">
                                            <TableCell className="text-neutral-300 font-semibold w-[180px] bg-darkBackgroundV2/30">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiTagOutline} size={0.6} />
                                                    <span>Mã phiếu</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="green">
                                                    {record.checkCode}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 font-semibold w-[180px] bg-darkBackgroundV2/30">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiCalendar} size={0.6} />
                                                    <span>Ngày thực hiện</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">{format(new Date(record.checkDate), "dd/MM/yyyy", { locale: vi })}</Badge>
                                            </TableCell>
                                        </TableRow>

                                        <TableRow className="border-darkBorderV1/50">
                                            <TableCell className="text-neutral-300 font-semibold bg-darkBackgroundV2/30">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiAccount} size={0.6} />
                                                    <span>Người thực hiện</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">
                                                    {(record as any).checkedBy?.fullName || record.checkerId?.fullName || "Hệ thống"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 font-semibold bg-darkBackgroundV2/30">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiTagOutline} size={0.6} />
                                                    <span>Loại kiểm kê</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="cyan">
                                                    {record.checkType === 'weekly' ? 'Hàng tuần' :
                                                        record.checkType === 'monthly' ? 'Hàng tháng' :
                                                            record.checkType === 'quarterly' ? 'Hàng quý' : record.checkType}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>

                                        <TableRow className="border-darkBorderV1/50">
                                            <TableCell className="text-neutral-300 font-semibold bg-darkBackgroundV2/30">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiAlertCircleOutline} size={0.6} />
                                                    <span>Trạng thái</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={record.status === 'completed' ? 'green' : 'orange'}>
                                                    {record.status === 'completed' ? 'Đã hoàn tất' : 'Bản nháp'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 font-semibold bg-darkBackgroundV2/30">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiClipboardTextOutline} size={0.6} />
                                                    <span>Ghi chú chung</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-neutral-300 italic font-medium">
                                                {record.notes || "-"}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Card>

                            <div className="space-y-2">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Kết quả kiểm đếm</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>
                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>STT</TableHead>
                                                <TableHead>Tên thiết bị</TableHead>
                                                <TableHead>Mã số</TableHead>
                                                <TableHead>Sổ sách</TableHead>
                                                <TableHead>Thực tế</TableHead>
                                                <TableHead>Hư hỏng/Mất</TableHead>
                                                <TableHead>Hướng xử lý</TableHead>
                                                <TableHead>Ghi chú</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {record.items?.map((item: any, idx: number) => {
                                                const diff = item.actualQuantity - item.expectedQuantity;
                                                return (
                                                    <TableRow key={idx} className="border-darkBorderV1 hover:bg-white/5 transition-colors">
                                                        <TableCell className="text-center text-xs text-neutral-300">{idx + 1}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="neutral">
                                                                {item.equipmentId?.equipmentName || item.equipmentName}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="green">
                                                                {item.equipmentId?.equipmentCode || item.equipmentCode}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell><Badge variant="cyan">{item.expectedQuantity || 0}</Badge></TableCell>
                                                        <TableCell><Badge variant="cyan">{item.actualQuantity}</Badge></TableCell>
                                                        <TableCell className={cn(
                                                            diff < 0 ? "text-red-400" :
                                                                diff > 0 ? "text-green-500" : "text-neutral-300"
                                                        )}>
                                                            {diff < 0 ? `Thiếu: ${Math.abs(diff)}` :
                                                                diff > 0 ? `Thừa: ${diff}` : "Đủ (Khớp)"}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    item.actionType === 'normal' ? 'green' :
                                                                        item.actionType === 'repair_pending' ? 'yellow' :
                                                                            item.actionType === 'liquidation_pending' ? 'orange' : 'red'
                                                                }
                                                            >
                                                                {item.actionType === 'normal' ? 'Bình thường' :
                                                                    item.actionType === 'repair_pending' ? 'Chờ sửa chữa' :
                                                                        item.actionType === 'liquidation_pending' ? 'Chờ thanh lý' : 'Thất lạc'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-neutral-300 text-sm italic">
                                                            {item.notes || "-"}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-20 text-neutral-300">
                            Không tìm thấy dữ liệu phiếu kiểm kê.
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} />
                        Đóng
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => recordId && printCheck(recordId)}
                            disabled={isPrinting}
                        >
                            <Icon path={mdiPrinter} size={0.8} spin={isPrinting} />
                            In phiếu
                        </Button>
                        {record?.status === 'draft' && (
                            <Button variant="destructive" onClick={handleDelete}>
                                <Icon path={mdiTrashCanOutline} size={0.8} />
                                Xóa bản nháp
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
