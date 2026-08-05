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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEmployees } from "@/hooks/useEmployees";
import { useAvailableEquipment, useCreateBorrow } from "@/hooks/useEquipment";
import { useUploadFile } from "@/hooks/useUpload";
import { cn } from "@/lib/utils";
import { useBorrowFormStore } from "@/stores/useBorrowFormStore";
import {
    mdiClose,
    mdiImagePlus,
    mdiMagnify,
    mdiPlus,
    mdiTextBoxPlusOutline,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface CreateBorrowDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SelectedItem {
    equipmentId: string;
    equipmentCode: string;
    equipmentName: string;
    quantity: number;
    borrowCondition: string;
    borrowImages: string[];
}

export function CreateBorrowDialog({ isOpen, onClose }: CreateBorrowDialogProps) {
    const { mutate: createBorrow, isPending } = useCreateBorrow();
    const { data: equipmentRes } = useAvailableEquipment();
    const { data: employeesRes } = useEmployees({ page: 1, limit: 200 });
    const { mutate: uploadFile } = useUploadFile();

    const { formData, setFormData, setSelectedItems, resetFormData } = useBorrowFormStore();
    const { projectName, borrowerId, borrowDate, returnDate, notes, selectedItems } = formData;

    const [searchTerm, setSearchTerm] = useState("");
    const [activeItem, setActiveItem] = useState<SelectedItem | null>(null);
    const [conflicts, setConflicts] = useState<Record<string, any>>({});

    const equipmentList = equipmentRes?.data || [];
    const employeesList = employeesRes?.data?.employees || [];

    // Check conflicts for all selected items
    useEffect(() => {
        const checkConflicts = async () => {
            const newConflicts: Record<string, any> = {};
            for (const item of selectedItems) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/borrow-return/check-conflict?equipmentId=${item.equipmentId}&quantity=${item.quantity}`);
                    const data = await res.json();
                    if (data.data?.hasConflict) {
                        newConflicts[item.equipmentId] = data.data;
                    }
                } catch (e) {
                    console.error("Conflict check failed for", item.equipmentId);
                }
            }
            setConflicts(newConflicts);
        };

        if (selectedItems.length > 0) {
            checkConflicts();
        } else {
            setConflicts({});
        }
    }, [selectedItems]);

    const handleSelectFromList = (eq: any) => {
        const existing = selectedItems.find(i => i.equipmentId === eq._id);
        if (existing) {
            setActiveItem({ ...existing });
        } else {
            setActiveItem({
                equipmentId: eq._id,
                equipmentCode: eq.equipmentCode,
                equipmentName: eq.equipmentName,
                quantity: 1,
                borrowCondition: "Bình thường",
                borrowImages: [],
            });
        }
    };

    const handleCommitItem = () => {
        if (!activeItem) return;

        // Validation
        if (!activeItem.quantity || Number(activeItem.quantity) <= 0) {
            toast.error("Số lượng phải lớn hơn 0");
            return;
        }

        const idx = selectedItems.findIndex(i => i.equipmentId === activeItem.equipmentId);
        if (idx > -1) {
            const newItems = [...selectedItems];
            newItems[idx] = activeItem;
            setSelectedItems(newItems);
            toast.success("Đã cập nhật thiết bị");
        } else {
            setSelectedItems([...selectedItems, activeItem]);
            toast.success("Đã thêm vào danh sách");
        }
        setActiveItem(null);
    };

    const handleUpdateActive = (updates: Partial<SelectedItem>) => {
        if (!activeItem) return;
        setActiveItem({ ...activeItem, ...updates });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!activeItem) return;
        const file = e.target.files?.[0];
        if (!file) return;

        uploadFile(file, {
            onSuccess: (response: any) => {
                const imageUrl = response?.data?.url;
                if (imageUrl) {
                    handleUpdateActive({
                        borrowImages: [...activeItem.borrowImages, imageUrl]
                    });
                }
            },
        });
    };

    const handleRemoveImage = (imgIdx: number) => {
        if (!activeItem) return;
        handleUpdateActive({
            borrowImages: activeItem.borrowImages.filter((_, i) => i !== imgIdx)
        });
    };

    const handleRemoveItem = (idx: number) => {
        const itemToRemove = selectedItems[idx];
        setSelectedItems(selectedItems.filter((_, i) => i !== idx));
        if (activeItem?.equipmentId === itemToRemove.equipmentId) {
            setActiveItem(null);
        }
    };

    const resetForm = () => {
        resetFormData();
        setSearchTerm("");
        setActiveItem(null);
        setConflicts({});
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const missingFields: string[] = [];
        if (!borrowerId) missingFields.push("Nhân viên mượn");
        if (selectedItems.length === 0) missingFields.push("Danh sách thiết bị (ít nhất 1 thiết bị)");

        if (missingFields.length > 0) {
            toast.warning(
                <div>
                    <p className="font-bold mb-1">Vui lòng điền đủ thông tin:</p>
                    <ul className="list-disc ml-4 text-sm">
                        {missingFields.map((field, index) => (
                            <li key={index}>{field}</li>
                        ))}
                    </ul>
                </div>
            );
            return;
        }

        createBorrow(
            {
                projectName,
                borrowerId,
                borrowDate: borrowDate, // already ISO string in store
                returnDate: returnDate, // already ISO string or null in store
                items: selectedItems.map(item => ({
                    equipmentId: item.equipmentId,
                    quantity: item.quantity,
                    borrowCondition: item.borrowCondition,
                    borrowImages: item.borrowImages,
                })),
                notes,
            },
            {
                onSuccess: () => {
                    toast.success("Tạo phiếu mượn thành công");
                    resetForm();
                    onClose();
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiTextBoxPlusOutline} size={0.8} className="flex-shrink-0" />
                        <span>Tạo phiếu mượn thiết bị</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <form id="create-borrow-form" onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                        {/* General Info */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-primary font-semibold whitespace-nowrap">Thông tin chung</h3>
                                <div className="flex-1 border-b border-dashed border-primary mr-1" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div className="space-y-1.5">
                                    <Label>Tên công trình</Label>
                                    <Input
                                        value={projectName}
                                        onChange={(e) => setFormData({ projectName: e.target.value })}
                                        placeholder="Nhập tên dự án..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Nhân viên <span className="text-red-400 italic text-sm">(*)</span></Label>
                                    <Select value={borrowerId} onValueChange={(val) => setFormData({ borrowerId: val })} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn nhân viên" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employeesList.map((emp: any) => (
                                                <SelectItem key={emp._id} value={emp._id}>
                                                    {emp.employeeCode} - {emp.fullName} - {emp.position}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Ngày trả (dự kiến)</Label>
                                    <DatePicker
                                        date={returnDate ? new Date(returnDate) : undefined}
                                        onDateChange={(date) => setFormData({ returnDate: date ? date.toISOString() : null })}
                                        withTime={true}
                                        captionLayout="dropdown"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Ghi chú phiếu</Label>
                                    <Input
                                        value={notes}
                                        onChange={(e) => setFormData({ notes: e.target.value })}
                                        placeholder="Ghi chú chung..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div className="flex flex-col gap-3 md:gap-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-primary font-semibold whitespace-nowrap">Chọn thiết bị</h3>
                                        <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                    </div>

                                    {/* Search & Selector */}
                                    <Card className="p-3 md:p-4 flex-1">
                                        <div className="relative">
                                            <Input
                                                placeholder="Tìm mã hoặc tên thiết bị..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10"
                                            />
                                            <Icon path={mdiMagnify} size={0.8} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-300" />
                                        </div>
                                        <ScrollArea className="h-[250px] border border-darkBorderV1 rounded-md bg-darkBackgroundV2/50">
                                            <div className="space-y-1 p-1 w-full">
                                                {equipmentList
                                                    .filter((eq: any) =>
                                                        eq.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        eq.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map((eq: any) => (
                                                        <div
                                                            key={eq._id}
                                                            onClick={() => handleSelectFromList(eq)}
                                                            className={cn(
                                                                "p-2.5 w-full rounded-lg cursor-pointer transition-all flex justify-between items-center group border",
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
                                                    ))}
                                            </div>
                                        </ScrollArea>
                                    </Card>
                                </div>

                                {/* RIGHT: Active Config Area */}
                                <div className="flex flex-col gap-3 md:gap-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-primary font-semibold whitespace-nowrap">Cấu hình dụng cụ</h3>
                                        <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                    </div>

                                    {activeItem ? (
                                        <Card className="p-3 md:p-4 flex-1">
                                            <div className="flex justify-between items-start">
                                                <span className="text-base font-semibold text-neutral-300">Dụng cụ: {activeItem.equipmentName}</span>
                                                <button onClick={() => setActiveItem(null)}>
                                                    <Icon path={mdiClose} size={0.8} className="text-neutral-300 hover:text-primary transition-colors" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                <div className="space-y-1">
                                                    <Label>Số lượng</Label>
                                                    <QuantityInput
                                                        value={activeItem.quantity}
                                                        onChange={(val) => handleUpdateActive({ quantity: val })}
                                                        min={1}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Tình trạng</Label>
                                                    <Input
                                                        value={activeItem.borrowCondition}
                                                        onChange={(e) => handleUpdateActive({ borrowCondition: e.target.value })}
                                                        placeholder="VD: Bình thường..."
                                                    />
                                                </div>

                                                <div className="col-span-2 space-y-1">
                                                    <Label>Hình ảnh minh chứng</Label>
                                                    <div className="flex gap-2 flex-wrap min-h-[66px] p-2 border border-darkBorderV1 rounded bg-darkBackgroundV1/50">
                                                        {activeItem.borrowImages.map((img, idx) => (
                                                            <div key={idx} className="relative w-20 h-20 rounded overflow-hidden group border border-darkBorderV2">
                                                                <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveImage(idx)}
                                                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 bg-red-500 text-neutral-300 rounded-full flex items-center justify-center shadow-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <Icon path={mdiClose} size={0.6} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <label className="w-20 h-20 rounded border border-dashed border-darkBorderV1 flex items-center justify-center cursor-pointer hover:border-primary transition-colors bg-darkBackgroundV2 group">
                                                            <Icon path={mdiImagePlus} size={0.6} className="text-neutral-300 group-hover:text-primary" />
                                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                className="w-full flex-1"
                                                onClick={handleCommitItem}
                                            >
                                                <Icon path={mdiPlus} size={0.8} className="flex-shrink-0" />
                                                {selectedItems.some(i => i.equipmentId === activeItem.equipmentId) ? 'Cập nhật thiết bị' : 'Thêm thiết bị vào danh sách'}
                                            </Button>
                                        </Card>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-darkBorderV1 rounded-xl bg-darkBackgroundV2/30 text-neutral-300 italic text-sm text-center">
                                            <Icon path={mdiTextBoxPlusOutline} size={1.5} className="mb-3 opacity-70" />
                                            <span>Chọn thiết bị<br /> để cấu hình thông tin mượn</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ROW 2: Added Items List (Full Width Below) */}
                            <div className="col-span-12 flex flex-col gap-3 md:gap-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Danh sách đã thêm ({selectedItems.length})</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    {selectedItems.length > 0 ? (
                                        selectedItems.map((item, idx) => (
                                            <Card key={item.equipmentId} className="p-3 items-start flex gap-3 md:gap-4 group justify-start !space-y-0">
                                                <div className="w-20 h-20 rounded overflow-hidden shrink-0 bg-darkBackgroundV1 border border-darkBorderV1">
                                                    {item.borrowImages[0] ? (
                                                        <img src={item.borrowImages[0]} alt="Tool" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xs text-neutral-300 text-center px-1 uppercase font-bold">No Image</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <div className="min-w-0 space-y-2">
                                                            <h4 className="font-bold text-neutral-300 truncate text-sm mb-1" title={item.equipmentName}>{item.equipmentName}</h4>
                                                            <Badge variant="blue">{item.equipmentCode}</Badge>
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
                                                                    <TooltipContent>
                                                                        <p>Sửa cấu hình</p>
                                                                    </TooltipContent>
                                                                </Tooltip>

                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            type="button" size="icon" variant="red"
                                                                            onClick={() => handleRemoveItem(idx)}
                                                                        >
                                                                            <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Gỡ bỏ</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between text-sm text-neutral-300">
                                                        <div className="flex flex-wrap items-center gap-1">
                                                            <Badge variant="green">Số lượng:</Badge>
                                                            <Badge variant="neutral">{item.quantity}</Badge>
                                                            <span>--</span>
                                                            <Badge variant="green">Trạng thái:</Badge>
                                                            <Badge variant="neutral">{item.borrowCondition}</Badge>
                                                        </div>
                                                        {item.borrowImages.length > 1 && (
                                                            <span className="bg-darkBackgroundV1 px-1.5 py-0.5 rounded text-sm border border-darkBorderV1">+{item.borrowImages.length - 1} ảnh</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-10 flex flex-col items-center justify-center text-neutral-300 italic text-sm border-2 border-dashed border-darkBorderV1 rounded-xl bg-darkBackgroundV1/30">
                                            <Icon path={mdiTextBoxPlusOutline} size={1.5} className="mb-2 opacity-70" />
                                            <span>Chưa có thiết bị nào được thêm vào danh sách</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                    <Button
                        type="submit"
                        form="create-borrow-form"
                        disabled={isPending}
                    >
                        <Icon path={mdiPlus} size={0.8} className="flex-shrink-0" />
                        {isPending ? "Đang lưu..." : "Thêm mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
