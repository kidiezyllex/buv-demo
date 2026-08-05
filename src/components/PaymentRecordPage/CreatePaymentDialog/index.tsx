"use client";

import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/hooks/useAuth";
import { useCreatePaymentRecord } from "@/hooks/usePaymentRecords";
import { useUploadPdf } from "@/hooks/useUpload";
import { usePaymentRecordForm } from "@/stores/usePaymentRecordForm";
import {
    mdiAccountCashOutline,
    mdiClose,
    mdiCreditCardSearch,
    mdiFileLinkOutline,
    mdiLoading,
    mdiPlus,
    mdiUpload
} from "@mdi/js";
import Icon from "@mdi/react";
import { useRef } from "react";
import { toast } from "react-toastify";

interface CreatePaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    defaultType?: "PAYMENT" | "ADVANCE";
}

export function CreatePaymentDialog({ isOpen, onClose, defaultType = "PAYMENT" }: CreatePaymentDialogProps) {
    const {
        paymentForm,
        advanceForm,
        activeTab,
        setPaymentForm,
        setAdvanceForm,
        setActiveTab,
        resetAll,
    } = usePaymentRecordForm();

    const { mutate: createRecord, isPending } = useCreatePaymentRecord();
    const { mutate: uploadPdf, isPending: isUploading } = useUploadPdf();
    const { data: meRes } = useMe();
    const currentEmployee = meRes?.data?.user;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Chỉ chấp nhận file PDF, DOC hoặc DOCX");
            return;
        }

        uploadPdf(file, {
            onSuccess: (response: any) => {
                const url = response.data.url;
                if (activeTab === "PAYMENT") {
                    setPaymentForm({ attachmentFile: url });
                } else {
                    setAdvanceForm({ attachmentFile: url });
                }
                toast.success("Tải file lên thành công");
            }
        });
    };

    const handleClose = () => {
        resetAll();
        onClose();
    };

    const getAmountSuggestions = (val: string) => {
        if (!val || isNaN(Number(val))) return [];
        const numStr = val.replace(/\D/g, "");
        if (!numStr || numStr === "0") return [];

        const suggestions: string[] = [];
        const targetedLengths = [6, 7, 8];

        targetedLengths.forEach((len) => {
            if (numStr.length < len) {
                const zerosToAdd = len - numStr.length;
                suggestions.push(numStr + "0".repeat(zerosToAdd));
            }
        });

        return suggestions;
    };

    const formatCurrency = (val: string) => {
        if (!val) return "0 VNĐ";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(Number(val));
    };

    const handleSubmitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        const missing: string[] = [];
        if (!currentEmployee?._id) missing.push("Không xác định được nhân viên đăng nhập");
        if (!paymentForm.content) missing.push("Nội dung thanh toán");
        if (!paymentForm.amount || isNaN(Number(paymentForm.amount))) missing.push("Số tiền hợp lệ");
        if (missing.length > 0) {
            toast.warning(
                <div>
                    <p className="font-bold mb-1">Vui lòng điền đủ thông tin:</p>
                    <ul className="list-disc ml-4 text-sm">
                        {missing.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
            );
            return;
        }

        createRecord(
            {
                type: "PAYMENT",
                requesterId: currentEmployee?._id,
                content: paymentForm.content,
                amount: Number(paymentForm.amount),
                attachment: paymentForm.attachment,
                attachmentFile: paymentForm.attachmentFile,
            },
            { onSuccess: handleClose }
        );
    };

    const handleSubmitAdvance = (e: React.FormEvent) => {
        e.preventDefault();
        const missing: string[] = [];
        if (!currentEmployee?._id) missing.push("Không xác định được nhân viên đăng nhập");
        if (!advanceForm.projectName) missing.push("Tên công trình");
        if (!advanceForm.amount || isNaN(Number(advanceForm.amount))) missing.push("Số tiền hợp lệ");
        if (missing.length > 0) {
            toast.warning(
                <div>
                    <p className="font-bold mb-1">Vui lòng điền đủ thông tin:</p>
                    <ul className="list-disc ml-4 text-sm">
                        {missing.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
            );
            return;
        }

        createRecord(
            {
                type: "ADVANCE",
                requesterId: currentEmployee?._id,
                projectName: advanceForm.projectName,
                projectAddress: advanceForm.projectAddress,
                amount: Number(advanceForm.amount),
                attachmentFile: advanceForm.attachmentFile,
            },
            { onSuccess: handleClose }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiCreditCardSearch} size={0.8} className="flex-shrink-0" />
                        <span>Tạo hồ sơ thanh toán</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "PAYMENT" | "ADVANCE")}>
                        <TabsList className="w-full">
                            <TabsTrigger value="PAYMENT" className="flex-1">
                                <Icon path={mdiCreditCardSearch} size={0.8} className="mr-1.5 flex-shrink-0" />
                                Đề nghị thanh toán
                            </TabsTrigger>
                            <TabsTrigger value="ADVANCE" className="flex-1">
                                <Icon path={mdiAccountCashOutline} size={0.8} className="mr-1.5 flex-shrink-0" />
                                Đề nghị tạm ứng
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="PAYMENT">
                            <form id="create-payment-form" onSubmit={handleSubmitPayment} className="space-y-3 md:space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label>Nhân viên đề nghị</Label>
                                        <div className="flex items-center gap-2 h-10 px-2 rounded-md bg-darkBorderV1">
                                            <Badge variant="green" className="shrink-0">
                                                {currentEmployee?.employeeCode || "---"}
                                            </Badge>
                                            <span className="text-sm text-neutral-300 font-semibold truncate">
                                                {currentEmployee?.fullName || "Đang tải..."}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Số tiền (VNĐ) <span className="text-red-400 italic text-sm">(*)</span></Label>
                                        <div className="space-y-2">
                                            <Input
                                                type="number"
                                                value={paymentForm.amount}
                                                onChange={(e) => setPaymentForm({ amount: e.target.value })}
                                                placeholder="Nhập số tiền..."
                                                min={0}
                                            />
                                            {paymentForm.amount && !isNaN(Number(paymentForm.amount)) && Number(paymentForm.amount) > 0 && Number(paymentForm.amount) < 100000000 && getAmountSuggestions(paymentForm.amount).length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <span className="text-sm text-neutral-400 font-semibold">Gợi ý nhanh:</span>
                                                    {getAmountSuggestions(paymentForm.amount).map((sugg) => (
                                                        <Badge
                                                            key={sugg}
                                                            variant="neutral"
                                                            className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-all active:scale-95 py-1 px-2 border border-darkBorderV1"
                                                            onClick={() => setPaymentForm({ amount: sugg })}
                                                        >
                                                            {formatCurrency(sugg)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-1">
                                        <Label>Nội dung thanh toán <span className="text-red-400 italic text-sm">(*)</span></Label>
                                        <Textarea
                                            value={paymentForm.content}
                                            onChange={(e) => setPaymentForm({ content: e.target.value })}
                                            placeholder="Nhập nội dung thanh toán..."
                                            rows={4}
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-1">
                                        <Label>Kèm theo</Label>
                                        <Input
                                            value={paymentForm.attachment}
                                            onChange={(e) => setPaymentForm({ attachment: e.target.value })}
                                            placeholder="VD: Bảng chi phí chi tiết và hóa đơn"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-1">
                                        <Label>Tệp đính kèm (PDF, DOC, DOCX)</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    value={paymentForm.attachmentFile}
                                                    onChange={(e) => setPaymentForm({ attachmentFile: e.target.value })}
                                                    placeholder="Tải lên hoặc dán link file..."
                                                    className="pr-10"
                                                />
                                                <Icon path={mdiFileLinkOutline} size={0.6} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300" />
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileUpload}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="shrink-0"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                            >
                                                <Icon path={isUploading ? mdiLoading : mdiUpload} size={0.8} className={isUploading ? "animate-spin" : ""} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </TabsContent>

                        <TabsContent value="ADVANCE">
                            <form id="create-advance-form" onSubmit={handleSubmitAdvance} className="space-y-3 md:space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div className="space-y-1">
                                        <Label>Nhân viên đề nghị</Label>
                                        <div className="flex items-center gap-2 h-10 px-2 rounded-md bg-darkBorderV1">
                                            <Badge variant="green" className="shrink-0">
                                                {currentEmployee?.employeeCode || "---"}
                                            </Badge>
                                            <span className="text-sm text-neutral-300 font-semibold truncate">
                                                {currentEmployee?.fullName || "Đang tải..."}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Số tiền (VNĐ) <span className="text-red-400 italic text-sm">(*)</span></Label>
                                        <div className="space-y-2">
                                            <Input
                                                type="number"
                                                value={advanceForm.amount}
                                                onChange={(e) => setAdvanceForm({ amount: e.target.value })}
                                                placeholder="Nhập số tiền..."
                                                min={0}
                                            />
                                            {advanceForm.amount && !isNaN(Number(advanceForm.amount)) && Number(advanceForm.amount) > 0 && Number(advanceForm.amount) < 100000000 && getAmountSuggestions(advanceForm.amount).length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <span className="text-sm text-neutral-400 font-semibold">Gợi ý nhanh:</span>
                                                    {getAmountSuggestions(advanceForm.amount).map((sugg) => (
                                                        <Badge
                                                            key={sugg}
                                                            variant="neutral"
                                                            className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-all active:scale-95 py-1 px-2 border border-darkBorderV1"
                                                            onClick={() => setAdvanceForm({ amount: sugg })}
                                                        >
                                                            {formatCurrency(sugg)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label>
                                            Tên công trình <span className="text-red-400 italic text-sm">(*)</span>
                                        </Label>
                                        <Input
                                            value={advanceForm.projectName}
                                            onChange={(e) => setAdvanceForm({ projectName: e.target.value })}
                                            placeholder="Nhập tên công trình..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Địa chỉ công trình</Label>
                                        <Input
                                            value={advanceForm.projectAddress}
                                            onChange={(e) => setAdvanceForm({ projectAddress: e.target.value })}
                                            placeholder="Nhập địa chỉ công trình..."
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-1">
                                        <Label>Tệp đính kèm (PDF, DOC, DOCX)</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    value={advanceForm.attachmentFile}
                                                    onChange={(e) => setAdvanceForm({ attachmentFile: e.target.value })}
                                                    placeholder="Tải lên hoặc dán link file..."
                                                    className="pr-10"
                                                />
                                                <Icon path={mdiFileLinkOutline} size={0.6} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300" />
                                            </div>
                                            <input
                                                type="file"
                                                // reuse the same logic
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileUpload}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="shrink-0"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                            >
                                                <Icon path={isUploading ? mdiLoading : mdiUpload} size={0.8} className={isUploading ? "animate-spin" : ""} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                    <Button
                        type="submit"
                        form={activeTab === "PAYMENT" ? "create-payment-form" : "create-advance-form"}
                        disabled={isPending || isUploading}
                    >
                        <Icon path={isPending ? mdiLoading : mdiPlus} size={0.8} className={isPending ? "animate-spin" : "flex-shrink-0"} />
                        {isPending ? "Đang lưu..." : "Tạo hồ sơ"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
