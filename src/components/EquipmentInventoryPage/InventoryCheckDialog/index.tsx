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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuantityInput } from "@/components/ui/quantity-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/context/useUserContext";
import { useAvailableEquipment, useCreateInventoryCheck } from "@/hooks/useEquipment";
import { InventoryActionType, InventoryCheckStatus } from "@/interface/inventory";
import { cn } from "@/lib/utils";
import {
    mdiCheckCircleOutline,
    mdiClipboardCheckOutline,
    mdiClose,
    mdiContentSave,
    mdiMagnify,
    mdiPlus,
    mdiTextBoxPlusOutline,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
interface InventoryCheckDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

interface InventoryItem {
    equipmentId: string;
    equipmentCode: string;
    equipmentName: string;
    expectedQuantity: number;
    actualQuantity: number;
    difference: number; // Tự tính
    actionType: InventoryActionType;
    notes: string;
}

export function InventoryCheckDialog({ isOpen, onClose }: InventoryCheckDialogProps) {
    const { profile } = useUser();
    const { mutate: createCheck, isPending } = useCreateInventoryCheck();
    const { data: equipmentRes } = useAvailableEquipment();

    const [checkCode, setCheckCode] = useState("");
    const [checkDate, setCheckDate] = useState(new Date());
    const [checkType, setCheckType] = useState("monthly");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<InventoryItem[]>([]);

    // State for searchable select
    const [searchQuery, setSearchQuery] = useState("");
    const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);

    const equipmentList = equipmentRes?.data || [];

    const filteredEquipment = useMemo(() => {
        if (!searchQuery) return equipmentList;
        return equipmentList.filter((eq: any) =>
            eq.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            eq.equipmentCode.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [equipmentList, searchQuery]);

    useEffect(() => {
        if (isOpen && !checkCode) {
            const date = format(new Date(), "yyyyMMdd");
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            setCheckCode(`KK${date}${random}`);
        }
    }, [isOpen]);

    const handleSelectFromList = (eq: any) => {
        const existing = items.find(i => i.equipmentId === eq._id);
        if (existing) {
            setActiveItem({ ...existing });
        } else {
            setActiveItem({
                equipmentId: eq._id,
                equipmentCode: eq.equipmentCode,
                equipmentName: eq.equipmentName,
                expectedQuantity: eq.quantity || 0,
                actualQuantity: eq.quantity || 0,
                difference: 0,
                actionType: 'normal',
                notes: ""
            });
        }
    };

    const handleUpdateActive = (updates: Partial<InventoryItem>) => {
        if (!activeItem) return;
        const updated = { ...activeItem, ...updates };
        if ('actualQuantity' in updates) {
            const actual = parseInt(updates.actualQuantity as any) || 0;
            updated.actualQuantity = actual;
            updated.difference = actual - updated.expectedQuantity;
        }
        setActiveItem(updated);
    };

    const handleAddOrUpdateItem = () => {
        if (!activeItem) return;

        setItems(prev => {
            const index = prev.findIndex(i => i.equipmentId === activeItem.equipmentId);
            if (index > -1) {
                const newItems = [...prev];
                newItems[index] = activeItem;
                return newItems;
            }
            return [...prev, activeItem];
        });

        setActiveItem(null);
        setSearchQuery("");
    };

    const handleRemoveItem = (index: number) => {
        const itemToRemove = items[index];
        setItems(prev => prev.filter((_, i) => i !== index));
        if (activeItem?.equipmentId === itemToRemove.equipmentId) {
            setActiveItem(null);
        }
    };

    const prepareSubmit = (status: InventoryCheckStatus) => {
        if (items.length === 0) {
            toast.error("Vui lòng thêm ít nhất 1 thiết bị để kiểm kê");
            return;
        }

        onSubmit(status);
    };

    const onSubmit = (status: InventoryCheckStatus) => {
        const payload = {
            checkCode,
            checkDate: format(checkDate, "yyyy-MM-dd"), // Định dạng YYYY-MM-DD
            checkType: checkType === 'weekly' ? 'Hàng tuần' :
                checkType === 'monthly' ? 'Hàng tháng' :
                    checkType === 'quarterly' ? 'Hàng quý' : checkType,
            status,
            notes,
            items: items.map(item => {
                const diff = Math.abs(item.difference < 0 ? item.difference : 0);
                const isLost = item.actionType === 'lost';
                const isDamaged = item.actionType === 'repair_pending' || item.actionType === 'liquidation_pending';

                return {
                    equipmentId: item.equipmentId,
                    actualQuantity: item.actualQuantity,
                    expectedQuantity: item.expectedQuantity,
                    damagedQuantity: isDamaged ? diff : 0,
                    lostQuantity: isLost ? diff : (item.actionType === 'normal' ? diff : 0),
                    qualityStatus: item.notes || "Kiểm kê",
                    actionType: item.actionType,
                    notes: item.notes
                };
            })
        };

        createCheck(payload, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const resetForm = () => {
        setCheckCode("");
        setCheckDate(new Date());
        setCheckType("monthly");
        setNotes("");
        setItems([]);
        setSearchQuery("");
    };

    useEffect(() => {
        if (!isOpen) resetForm();
    }, [isOpen]);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent size="medium">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary">
                            <Icon path={mdiClipboardCheckOutline} size={0.8} className="flex-shrink-0" />
                            <span>Thực hiện kiểm kê thiết bị</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                        {/* A. Thông tin chung */}
                        <Card className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 !space-y-0 items-start">
                            <div className="space-y-2">
                                <Label>Loại kiểm kê</Label>
                                <Select value={checkType} onValueChange={setCheckType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn loại..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weekly">Hàng tuần</SelectItem>
                                        <SelectItem value="monthly">Hàng tháng</SelectItem>
                                        <SelectItem value="quarterly">Hàng quý</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Ghi chú chung</Label>
                                <Input
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Nhập ghi chú cho đợt kiểm kê này..."
                                />
                            </div>
                        </Card>

                        {/* B. Chọn và Cấu hình thiết bị */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {/* LEFT: Selection Area */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Bước 1: Chọn thiết bị</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>

                                <Card className="p-4 flex-1">
                                    <div className="relative mb-3">
                                        <Input
                                            placeholder="Tìm mã hoặc tên thiết bị..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                        <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                    </div>
                                    <ScrollArea className="h-[250px] border border-darkBorderV1 rounded-md bg-darkBackgroundV2/50 p-1">
                                        <div className="space-y-1">
                                            {filteredEquipment.length > 0 ? (
                                                filteredEquipment.map((eq: any) => (
                                                    <div
                                                        key={eq._id}
                                                        onClick={() => handleSelectFromList(eq)}
                                                        className={cn(
                                                            "p-2.5 rounded-lg cursor-pointer transition-all flex justify-between items-center group border",
                                                            activeItem?.equipmentId === eq._id
                                                                ? "bg-primary/20 border-primary/50 text-neutral-300"
                                                                : "bg-darkBackgroundV1/40 border-transparent hover:border-primary/30 hover:bg-primary/5 text-neutral-300"
                                                        )}
                                                    >
                                                        <div className="flex flex-col min-w-0 gap-1">
                                                            <span className="text-sm font-semibold truncate text-primary">{eq.equipmentName}</span>
                                                            <div className="flex items-center gap-1">
                                                                <Badge variant="neutral">
                                                                    {eq.equipmentCode}
                                                                </Badge>
                                                                <Badge variant="cyan">
                                                                    Tồn kho: {eq.availableQuantity}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-neutral-300 text-sm py-2 italic flex items-center justify-center gap-1">
                                                    <Icon path={mdiMagnify} size={0.8} className="flex-shrink-0" />
                                                    Không tìm thấy thiết bị nào
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </Card>
                            </div>

                            {/* RIGHT: Active Config Area */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Bước 2: Cấu hình kiểm kê</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>

                                {activeItem ? (
                                    <Card className="p-4 flex-1">
                                        <div className="flex justify-between items-start">
                                            <div className="min-w-0 space-y-1">
                                                <h5 className="text-sm font-bold text-primary truncate">{activeItem.equipmentName}</h5>
                                                <Badge variant="neutral">{activeItem.equipmentCode}</Badge>
                                            </div>
                                            <button
                                                className="h-8 w-8 flex items-center justify-center rounded-full bg-black/90 hover:bg-black text-neutral-300 border-none shadow-sm transition-colors"
                                                onClick={() => setActiveItem(null)}>
                                                <Icon path={mdiClose} size={0.8} className="text-neutral-300 hover:text-primary transition-colors" />
                                            </button>
                                        </div>

                                        <div className="space-y-3 md:space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                <div className="space-y-1">
                                                    <Label>Số lượng thực tế</Label>
                                                    <QuantityInput
                                                        value={activeItem.actualQuantity}
                                                        onChange={(val) => handleUpdateActive({ actualQuantity: val })}
                                                    />
                                                    <p className="text-sm text-neutral-400 italic">Số lượng sổ sách: {activeItem.expectedQuantity}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Hướng xử lý</Label>
                                                    <Select
                                                        value={activeItem.actionType}
                                                        onValueChange={(v: InventoryActionType) => handleUpdateActive({ actionType: v })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="normal">Bình thường</SelectItem>
                                                            <SelectItem value="repair_pending">Chờ sửa chữa</SelectItem>
                                                            <SelectItem value="liquidation_pending">Chờ thanh lý</SelectItem>
                                                            <SelectItem value="lost">Thất lạc</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Label>Ghi chú tình trạng</Label>
                                                <Textarea
                                                    value={activeItem.notes}
                                                    onChange={(e) => handleUpdateActive({ notes: e.target.value })}
                                                    placeholder="Ghi chú chi tiết về tình trạng..."
                                                    className="resize-none"
                                                />
                                            </div>

                                            <Button
                                                className="w-full"
                                                onClick={handleAddOrUpdateItem}
                                            >
                                                <Icon path={mdiPlus} size={0.8} className="flex-shrink-0" />
                                                {items.find(i => i.equipmentId === activeItem.equipmentId) ? "Cập nhật thiết bị" : "Thêm thiết bị vào danh sách"}
                                            </Button>
                                        </div>
                                    </Card>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-darkBorderV1 rounded-xl bg-darkBackgroundV2/30 text-neutral-300 italic text-sm text-center">
                                        <Icon path={mdiClipboardCheckOutline} size={1.5} className="mb-3 opacity-70" />
                                        <span>Chọn thiết bị <br /> để bắt đầu nhập số liệu</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* C. Danh sách thiết bị đã kiểm đếm */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-primary font-semibold whitespace-nowrap">Danh sách đã thêm ({items.length})</h3>
                                <div className="flex-1 border-b border-dashed border-primary mr-1" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {items.length === 0 ? (
                                    <div className="col-span-full py-10 flex flex-col items-center justify-center text-neutral-300 italic text-sm border-2 border-dashed border-darkBorderV1 rounded-xl bg-darkBackgroundV1/30">
                                        <Icon path={mdiTextBoxPlusOutline} size={1.5} className="mb-2 opacity-70" />
                                        <span>Chưa có thiết bị nào được thêm vào danh sách</span>
                                    </div>
                                ) : (
                                    items.map((item, idx) => (
                                        <Card key={item.equipmentId} className="p-3 items-start flex gap-3 md:gap-4 group justify-start !space-y-0">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="min-w-0 space-y-1">
                                                        <h4 className="font-bold text-neutral-300 truncate text-sm mb-1" title={item.equipmentName}>{item.equipmentName}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="blue">{item.equipmentCode}</Badge>
                                                            <Badge variant="neutral">
                                                                Xử lý: {item.actionType === 'normal' ? "Bình thường" :
                                                                    item.actionType === 'repair_pending' ? "Chờ sửa chữa" :
                                                                        item.actionType === 'liquidation_pending' ? "Chờ thanh lý" : "Thất lạc"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 shrink-0">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button" size="icon"
                                                                        variant="green"
                                                                        onClick={() => setActiveItem({ ...item })}
                                                                    >
                                                                        <Icon path={mdiTextBoxPlusOutline} size={0.8} className="flex-shrink-0" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Sửa cấu hình</TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        type="button" size="icon"
                                                                        variant="red"
                                                                        onClick={() => handleRemoveItem(idx)}
                                                                    >
                                                                        <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Gỡ bỏ</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>

                                                {/* <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-300">
                                                    <span>Thực tế: <strong className="text-primary">{item.actualQuantity}</strong></span>
                                                    <span>|</span>
                                                    <span>Sổ sách: <strong className="text-neutral-300">{item.expectedQuantity}</strong></span>
                                                    <span>|</span>
                                                    <span className={cn(
                                                        item.difference < 0 ? "text-red-400" :
                                                            item.difference > 0 ? "text-green-500" : "text-neutral-300"
                                                    )}>
                                                        {item.difference < 0 ? `Thiếu: ${Math.abs(item.difference)}` :
                                                            item.difference > 0 ? `Thừa: ${item.difference}` : "Đủ số lượng"}
                                                    </span>
                                                    {item.notes && (
                                                        <span className="text-sm text-neutral-300 italic text-wrap">
                                                            - {item.notes}
                                                        </span>
                                                    )}
                                                </div> */}
                                                <div className="flex flex-wrap items-center gap-1 mt-2">
                                                    <Badge variant="green">Thực tế:</Badge>
                                                    <Badge variant="neutral">{item.actualQuantity}</Badge>
                                                    <span>--</span>
                                                    <Badge variant="green">Sổ sách:</Badge>
                                                    <Badge variant="neutral">{item.expectedQuantity}</Badge>
                                                    <span>--</span>
                                                    <Badge variant="neutral">{item.difference < 0 ? `Thiếu: ${Math.abs(item.difference)}` :
                                                        item.difference > 0 ? `Thừa: ${item.difference}` : "Đủ số lượng"}</Badge>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose} disabled={isPending}>
                            <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                            Hủy bỏ
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => prepareSubmit('draft')}
                                disabled={isPending || items.length === 0}
                            >
                                <Icon path={mdiContentSave} size={0.8} className="flex-shrink-0" />
                                Lưu bản nháp
                            </Button>
                            <Button
                                onClick={() => prepareSubmit('completed')}
                                disabled={isPending || items.length === 0}
                            >
                                <Icon path={mdiCheckCircleOutline} size={0.8} className="flex-shrink-0" />
                                {isPending ? "Đang xử lý..." : "Hoàn thành kiểm kê"}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>
    );
}
