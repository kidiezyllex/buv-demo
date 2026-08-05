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
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/hooks/useAuth";
import { usePaymentRecordDetails, useUpdatePaymentRecord } from "@/hooks/usePaymentRecords";
import { useUploadPdf } from "@/hooks/useUpload";
import {
    mdiAccountCashOutline,
    mdiClose,
    mdiContentSave,
    mdiCreditCardSearch,
    mdiFileLinkOutline,
    mdiLoading,
    mdiUpload
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface UpdatePaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    recordId: string | null;
}

export function UpdatePaymentDialog({ isOpen, onClose, recordId }: UpdatePaymentDialogProps) {
    const { data: response, isLoading, refetch } = usePaymentRecordDetails(recordId || "");
    const { mutate: updateRecord, isPending: isUpdating } = useUpdatePaymentRecord();
    const { mutate: uploadPdf, isPending: isUploading } = useUploadPdf();
    const { data: meRes } = useMe();
    const currentEmployee = meRes?.data?.user;

    const record = response?.data;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [amount, setAmount] = useState<string>("");
    const [content, setContent] = useState("");
    const [attachment, setAttachment] = useState("");
    const [attachmentFile, setAttachmentFile] = useState("");
    const [projectName, setProjectName] = useState("");
    const [projectAddress, setProjectAddress] = useState("");

    useEffect(() => {
        if (record) {
            setAmount(record.amount?.toString() || "");
            setContent(record.content || "");
            setAttachment(record.attachment || "");
            setAttachmentFile(record.attachmentFile || "");
            setProjectName(record.projectName || "");
            setProjectAddress(record.projectAddress || "");
        }
    }, [record]);

    useEffect(() => {
        if (isOpen && recordId) {
            refetch();
        }
    }, [isOpen, recordId, refetch]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Chỉ chấp nhận file PDF, DOC hoặc DOCX");
            return;
        }

        uploadPdf(file, {
            onSuccess: (res: any) => {
                setAttachmentFile(res.data.url);
                toast.success("Tải file lên thành công");
            }
        });
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!recordId) return;

        const missing: string[] = [];
        if (record?.type === "PAYMENT") {
            if (!content) missing.push("Nội dung thanh toán");
        } else {
            if (!projectName) missing.push("Tên công trình");
        }
        if (!amount || isNaN(Number(amount))) missing.push("Số tiền hợp lệ");

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

        updateRecord(
            {
                id: recordId,
                data: {
                    type: record?.type,
                    amount: Number(amount),
                    content: record?.type === "PAYMENT" ? content : undefined,
                    attachment: record?.type === "PAYMENT" ? attachment : undefined,
                    attachmentFile,
                    projectName: record?.type === "ADVANCE" ? projectName : undefined,
                    projectAddress: record?.type === "ADVANCE" ? projectAddress : undefined,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Cập nhật hồ sơ thành công");
                    onClose();
                }
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiCreditCardSearch} size={0.8} className="flex-shrink-0" />
                        <span>Cập nhật hồ sơ thanh toán</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <LoadingSpinner />
                        </div>
                    ) : record ? (
                        <form id="update-payment-form" onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div className="space-y-1.5">
                                    <Label>Nhân viên đề nghị</Label>
                                    <div className="flex items-center gap-2 h-10 px-2 rounded-md bg-darkBorderV1">
                                        <Badge variant="green" className="shrink-0">
                                            {record.requesterId?.employeeCode || record.requesterName || "---"}
                                        </Badge>
                                        <span className="text-sm text-neutral-300 font-semibold truncate">
                                            {record.requesterId?.fullName || "---"}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Loại hồ sơ</Label>
                                    <div className="flex items-center gap-2 h-10 px-2 rounded-md bg-darkBorderV1">
                                        <Icon
                                            path={record.type === "PAYMENT" ? mdiCreditCardSearch : mdiAccountCashOutline}
                                            size={0.7}
                                            className="text-primary shrink-0"
                                        />
                                        <span className="text-sm text-neutral-300 font-semibold">
                                            {record.type === "PAYMENT" ? "Đề nghị thanh toán" : "Đề nghị tạm ứng"}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1 col-span-1 md:col-span-2">
                                    <Label>Số tiền (VNĐ) <span className="text-red-400 italic text-sm">(*)</span></Label>
                                    <div className="space-y-2">
                                        <Input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Nhập số tiền..."
                                            min={0}
                                        />
                                        {amount && !isNaN(Number(amount)) && Number(amount) > 0 && Number(amount) < 100000000 && getAmountSuggestions(amount).length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <span className="text-sm text-neutral-400 font-semibold">Gợi ý nhanh:</span>
                                                {getAmountSuggestions(amount).map((sugg) => (
                                                    <Badge
                                                        key={sugg}
                                                        variant="neutral"
                                                        className="cursor-pointer hover:bg-primary/20 hover:text-primary transition-all active:scale-95 py-1 px-2 border border-darkBorderV1"
                                                        onClick={() => setAmount(sugg)}
                                                    >
                                                        {formatCurrency(sugg)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {record.type === "PAYMENT" ? (
                                    <>
                                        <div className="col-span-1 md:col-span-2 space-y-1">
                                            <Label>Nội dung thanh toán <span className="text-red-400 italic text-sm">(*)</span></Label>
                                            <Textarea
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                placeholder="Nhập nội dung thanh toán..."
                                                rows={4}
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2 space-y-1">
                                            <Label>Kèm theo</Label>
                                            <Input
                                                value={attachment}
                                                onChange={(e) => setAttachment(e.target.value)}
                                                placeholder="VD: Bảng chi phí chi tiết và hóa đơn"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-1">
                                            <Label>
                                                Tên công trình <span className="text-red-400 italic text-sm">(*)</span>
                                            </Label>
                                            <Input
                                                value={projectName}
                                                onChange={(e) => setProjectName(e.target.value)}
                                                placeholder="Nhập tên công trình..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Địa chỉ công trình</Label>
                                            <Input
                                                value={projectAddress}
                                                onChange={(e) => setProjectAddress(e.target.value)}
                                                placeholder="Nhập địa chỉ công trình..."
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="col-span-1 md:col-span-2 space-y-1">
                                    <Label>Tệp đính kèm (PDF, DOC, DOCX)</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                value={attachmentFile}
                                                onChange={(e) => setAttachmentFile(e.target.value)}
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
                    ) : (
                        <div className="text-center py-10 text-neutral-300 italic">
                            Không tìm thấy dữ liệu hồ sơ
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>
                    <Button
                        type="submit"
                        form="update-payment-form"
                        disabled={isUpdating || isUploading || !record}
                    >
                        <Icon path={isUpdating ? mdiLoading : mdiContentSave} size={0.8} className={isUpdating ? "animate-spin" : "flex-shrink-0"} />
                        {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
