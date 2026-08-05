"use client";

import { Button } from "@/components/ui/button";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateContract } from "@/hooks/useContracts";
import { usePartners } from "@/hooks/usePartners";
import { useUploadPdf } from "@/hooks/useUpload";
import { ContractStatus, ICreateContractRequest } from "@/interface/contract";
import { mdiClose, mdiFileDocumentPlusOutline, mdiLoading, mdiPlus, mdiUpload } from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

interface CreateContractDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateContractDialog({ isOpen, onClose }: CreateContractDialogProps) {
    const { mutate: createContract, isPending } = useCreateContract();
    const { mutate: uploadPdf, isPending: isUploading } = useUploadPdf();
    const { data: partnersData } = usePartners({ limit: 1000 });
    const partners = partnersData?.data?.partners || [];

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<ICreateContractRequest>({
        contractNumber: "",
        contractFile: "",
        constructionItem: "",
        partner: "",
        signingDate: new Date().toISOString().split("T")[0],
        status: "unpaid",
        finalizationDate: "",
    });

    const resetForm = () => {
        setForm({
            contractNumber: "",
            contractFile: "",
            constructionItem: "",
            partner: "",
            signingDate: new Date().toISOString().split("T")[0],
            status: "unpaid",
            finalizationDate: "",
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const missingFields: string[] = [];
        if (!form.contractNumber.trim()) missingFields.push("Số hợp đồng");
        if (!form.partner) missingFields.push("Đối tác");
        if (!form.constructionItem.trim()) missingFields.push("Hạng mục thi công");
        if (!form.signingDate) missingFields.push("Ngày ký");

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

        createContract(form, {
            onSuccess: () => {
                resetForm();
                onClose();
            },
        });
    };

    const updateField = (field: keyof ICreateContractRequest, value: string) => {
        setForm((p) => ({ ...p, [field]: value }));
    };

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
                updateField("contractFile", url);
                toast.success("Tải file lên thành công");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiFileDocumentPlusOutline} size={0.8} className="flex-shrink-0" />
                        <span>Tạo mới hợp đồng</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <form id="create-contract-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="contractNumber">Số hợp đồng <span className="text-destructive">*</span></Label>
                            <Input
                                id="contractNumber"
                                value={form.contractNumber}
                                onChange={(e) => updateField("contractNumber", e.target.value)}
                                placeholder="VD: HD-2026-001"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="partner">Đối tác <span className="text-destructive">*</span></Label>
                            <Select
                                value={form.partner}
                                onValueChange={(val) => updateField("partner", val)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn đối tác" />
                                </SelectTrigger>
                                <SelectContent>
                                    {partners.map((p: any) => (
                                        <SelectItem key={p._id} value={p._id}>
                                            {p.partnerName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-2 space-y-1">
                            <Label htmlFor="constructionItem">Hạng mục thi công <span className="text-destructive">*</span></Label>
                            <Input
                                id="constructionItem"
                                value={form.constructionItem}
                                onChange={(e) => updateField("constructionItem", e.target.value)}
                                placeholder="VD: Xây dựng phần thô Tòa nhà A"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="signingDate">Ngày ký <span className="text-destructive">*</span></Label>
                            <DatePicker
                                date={form.signingDate ? new Date(form.signingDate) : undefined}
                                onDateChange={(date) => updateField("signingDate", date ? format(date, "yyyy-MM-dd") : "")}
                                captionLayout="dropdown-years"
                                fromYear={2020}
                                toYear={new Date().getFullYear() + 10}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="finalizationDate">Ngày quyết toán</Label>
                            <DatePicker
                                date={form.finalizationDate ? new Date(form.finalizationDate) : undefined}
                                onDateChange={(date) => updateField("finalizationDate", date ? format(date, "yyyy-MM-dd") : "")}
                                captionLayout="dropdown-years"
                                fromYear={2020}
                                toYear={new Date().getFullYear() + 10}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="status">Trạng thái thanh toán</Label>
                            <Select
                                value={form.status}
                                onValueChange={(val: ContractStatus) => updateField("status", val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                                    <SelectItem value="advanced">Tạm ứng</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="contractFile">Link file hợp đồng</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="contractFile"
                                    value={form.contractFile}
                                    onChange={(e) => updateField("contractFile", e.target.value)}
                                    placeholder="Đường dẫn file (PDF, DOC, DOCX)..."
                                    className="flex-1"
                                />
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
                    </form>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Hủy
                    </Button>
                    <Button type="submit" form="create-contract-form" disabled={isPending}>
                        <Icon path={isPending ? mdiLoading : mdiPlus} size={0.8} className={isPending ? "animate-spin" : ""} />
                        {isPending ? "Đang lưu..." : "Thêm mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
