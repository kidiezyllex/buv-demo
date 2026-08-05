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
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateReturn } from "@/hooks/useEquipment";
import { useUploadFile } from "@/hooks/useUpload";
import { IBorrowReturn } from "@/interface/equipment";
import Icon from "@mdi/react";
import { mdiImagePlus, mdiClose, mdiPackageDown, mdiCheck } from "@mdi/js";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";

interface ReturnDialogProps {
    isOpen: boolean;
    onClose: () => void;
    record: IBorrowReturn | null;
}

interface ItemReturnState {
    equipmentId: string;
    equipmentName: string;
    equipmentCode: string;
    returnDate: Date;
    returnCondition: string;
    returnImages: string[];
    isReturned: boolean;
    isSelected: boolean;
}

export function ReturnDialog({ isOpen, onClose, record }: ReturnDialogProps) {
    const { mutate: updateReturn, isPending } = useUpdateReturn();
    const { mutate: uploadFile } = useUploadFile();

    const [itemStates, setItemStates] = useState<ItemReturnState[]>([]);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (record && isOpen) {
            const items = record.items || [];
            const initialStates = items.map(item => ({
                equipmentId: typeof item.equipmentId === 'string' ? item.equipmentId : item.equipmentId._id,
                equipmentName: item.equipmentName,
                equipmentCode: item.equipmentCode,
                returnDate: item.returnDate ? new Date(item.returnDate) : new Date(),
                returnCondition: item.returnCondition || "Thiết bị hoạt động tốt, không hư hỏng",
                returnImages: item.returnImages || [],
                isReturned: item.status === 'returned',
                isSelected: item.status !== 'returned'
            }));
            setItemStates(initialStates);
            setNotes(record.notes || "");
        }
    }, [record, isOpen]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemIdx: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        uploadFile(file, {
            onSuccess: (response: any) => {
                const imageUrl = response?.data?.url;
                if (imageUrl) {
                    setItemStates(prev => {
                        const newStates = [...prev];
                        newStates[itemIdx] = {
                            ...newStates[itemIdx],
                            returnImages: [...newStates[itemIdx].returnImages, imageUrl]
                        };
                        return newStates;
                    });
                }
            },
        });
    };

    const handleRemoveImage = (itemIdx: number, imgIdx: number) => {
        setItemStates(prev => {
            const newStates = [...prev];
            newStates[itemIdx] = {
                ...newStates[itemIdx],
                returnImages: newStates[itemIdx].returnImages.filter((_, i) => i !== imgIdx)
            };
            return newStates;
        });
    };

    const updateItemField = (idx: number, field: keyof ItemReturnState, value: any) => {
        setItemStates(prev => {
            const newStates = [...prev];
            (newStates[idx] as any)[field] = value;
            return newStates;
        });
    };

    const toggleSelectAll = () => {
        const eligibleItems = itemStates.filter(it => !it.isReturned);
        const allSelected = eligibleItems.every(it => it.isSelected);

        setItemStates(prev => prev.map(it => {
            if (it.isReturned) return it;
            return { ...it, isSelected: !allSelected };
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!record) return;

        const selectedToReturn = itemStates.filter(s => s.isSelected && !s.isReturned);
        if (selectedToReturn.length === 0) {
            toast.error("Vui lòng chọn ít nhất một thiết bị để trả");
            return;
        }

        const itemsPayload = itemStates.map(s => {
            const originalItem = record.items?.find(item => {
                const id = typeof item.equipmentId === 'string' ? item.equipmentId : item.equipmentId._id;
                return id === s.equipmentId;
            });

            if (s.isSelected && !s.isReturned) {
                return {
                    ...originalItem,
                    equipmentId: s.equipmentId,
                    returnDate: s.returnDate.toISOString(),
                    returnCondition: s.returnCondition,
                    returnImages: s.returnImages,
                    status: 'returned'
                };
            }

            return {
                ...originalItem,
                equipmentId: s.equipmentId
            };
        });

        updateReturn(
            {
                id: record._id,
                data: {
                    items: itemsPayload,
                    notes: notes || record.notes
                },
            },
            {
                onSuccess: () => {
                    toast.success("Xác nhận trả thiết bị thành công");
                    onClose();
                },
            }
        );
    };

    if (!record) return null;

    const eligibleItemsCount = itemStates.filter(it => !it.isReturned).length;
    const selectedItemsCount = itemStates.filter(it => !it.isReturned && it.isSelected).length;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiPackageDown} size={0.8} className="flex-shrink-0" />
                        <span>Xác nhận trả thiết bị</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 md:gap-4 flex-1">
                            <h3 className="text-primary font-semibold whitespace-nowrap">Danh sách thiêt bị</h3>
                            <div className="flex-1 border-b border-dashed border-primary mr-2" />
                        </div>
                        {eligibleItemsCount > 1 && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="select-all"
                                    checked={eligibleItemsCount > 0 && selectedItemsCount === eligibleItemsCount}
                                    onCheckedChange={toggleSelectAll}
                                />
                                <Label htmlFor="select-all">Chọn tất cả</Label>
                            </div>
                        )}
                    </div>

                    {/* Items List */}
                    <div className="space-y-3 md:space-y-4">
                        {itemStates.map((it, idx) => (
                            <div
                                key={idx}
                                className={`p-4 rounded-lg border-2 transition-all ${it.isReturned ? 'border-green-500/20 bg-green-500/5 opacity-80' :
                                    it.isSelected ? 'border-primary/30 bg-primary/5' : 'border-darkBorderV1 bg-darkCardV1/20'
                                    }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-3 items-center">
                                            {!it.isReturned && (
                                                <Checkbox
                                                    checked={it.isSelected}
                                                    onCheckedChange={(val) => updateItemField(idx, 'isSelected', !!val)}
                                                />
                                            )}
                                            <div className="flex gap-2 items-center">
                                                <span className="font-bold text-neutral-300 text-sm">{it.equipmentName}</span>
                                                <Badge variant="cyan">{it.equipmentCode}</Badge>
                                            </div>
                                        </div>
                                        {it.isReturned && <Badge variant="green">Đã trả</Badge>}
                                    </div>

                                    {!it.isReturned && it.isSelected && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1 duration-200 mt-2 pt-2 border-t border-primary/10">
                                            <div className="space-y-1">
                                                <Label>Ngày trả</Label>
                                                <DatePicker
                                                    date={it.returnDate}
                                                    onDateChange={(d) => updateItemField(idx, 'returnDate', d || new Date())}
                                                    withTime={true}
                                                    captionLayout="dropdown"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>Tình trạng</Label>
                                                <Input
                                                    value={it.returnCondition}
                                                    onChange={(e) => updateItemField(idx, 'returnCondition', e.target.value)}
                                                    placeholder="Tình trạng lúc trả..."
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <Label>Ảnh minh chứng</Label>
                                                <div className="flex gap-2 flex-wrap min-h-[50px] p-2 border border-dashed border-darkBorderV1 rounded-md bg-darkBackgroundV1/50">
                                                    {it.returnImages.map((img, imgIdx) => (
                                                        <div key={imgIdx} className="relative w-20 h-20 rounded border border-darkBorderV1 overflow-hidden group">
                                                            <img src={img} alt="Return" className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveImage(idx, imgIdx)}
                                                                className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-neutral-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Icon path={mdiClose} size={0.6} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <label className="w-20 h-20 rounded border border-dashed border-darkBorderV1 flex items-center justify-center cursor-pointer hover:border-primary transition-colors hover:bg-primary/5">
                                                        <Icon path={mdiImagePlus} size={0.6} className="text-neutral-300" />
                                                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, idx)} className="hidden" />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <Label>Ghi chú chung</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ghi chú thêm cho phiếu trả..."
                            className="h-20"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPending || selectedItemsCount === 0}
                    >
                        <Icon path={mdiCheck} size={0.8} className="flex-shrink-0" />
                        {isPending ? "Đang xử lý..." : selectedItemsCount > 0 ? `Xác nhận trả ${selectedItemsCount} thiết bị` : "Xác nhận trả thiết bị"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
