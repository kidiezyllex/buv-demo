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
import { useMe } from "@/hooks/useAuth";
import { useCreateDocument } from "@/hooks/useDocuments";
import { usePartners } from "@/hooks/usePartners";
import { useUploadPdf } from "@/hooks/useUpload";
import { DocumentType, ICreateDocumentRequest } from "@/interface/document";
import {
    mdiClose,
    mdiFileDocumentPlusOutline,
    mdiFileLinkOutline,
    mdiLoading,
    mdiPlus,
    mdiUpload
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

interface CreateDocumentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    fixedType?: string;
}

export function CreateDocumentDialog({ isOpen, onClose, fixedType }: CreateDocumentDialogProps) {
    const { mutate: createDocument, isPending } = useCreateDocument();
    const { mutate: uploadPdf, isPending: isUploading } = useUploadPdf();
    const { data: partnersData } = usePartners({ limit: 1000 });
    const { data: profile } = useMe();
    const position = profile?.data?.user?.position?.toLowerCase() || "";
    const isSpecialPosition = position.includes("kế toán") || position.includes("giám đốc");
    const partners = partnersData?.data?.partners || [];

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<ICreateDocumentRequest>({
        title: "",
        documentNumber: "",
        type: (fixedType as any) || "incoming",
        fileUrl: "",
        publicId: "",
        description: "",
        issuedDate: new Date().toISOString().split("T")[0],
        receivedDate: "",
        sender: "",
        receiver: "",
        partner: "",
    });

    const resetForm = () => {
        setForm({
            title: "",
            documentNumber: "",
            type: (fixedType as any) || "incoming",
            fileUrl: "",
            publicId: "",
            description: "",
            issuedDate: new Date().toISOString().split("T")[0],
            receivedDate: "",
            sender: "",
            receiver: "",
            partner: "",
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const missingFields: string[] = [];

        // Common required fields
        if (!form.title.trim()) missingFields.push("Tiêu đề văn bản");
        if (!form.documentNumber.trim()) missingFields.push("Số hiệu / Mã hiệu");
        if (!form.type) missingFields.push("Loại văn bản");

        // Type specific fields
        if (form.type === "incoming") {
            if (!form.receivedDate) missingFields.push("Ngày nhận");
            if (!form.sender?.trim()) missingFields.push("Người gửi / Đơn vị gửi");
            if (!form.partner) missingFields.push("Đối tác liên quan");
        }

        if (form.type === "outgoing") {
            if (!form.issuedDate) missingFields.push("Ngày gửi đi");
            if (!form.receiver?.trim()) missingFields.push("Người nhận / Đơn vị nhận");
        }

        if (form.type === "notification" || form.type === "decision" || form.type === "template" || form.type === "construction_profile" || form.type === "guide") {
            if (!form.issuedDate) missingFields.push("Ngày ban hành");
        }

        // File validation
        const needsFile = ["incoming", "outgoing", "notification", "decision", "construction_profile", "guide"].includes(form.type as string);
        if (needsFile && !form.fileUrl) {
            missingFields.push("Tệp văn bản (PDF, DOC, DOCX)");
        }

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

        createDocument(form, {
            onSuccess: () => {
                resetForm();
                onClose();
            },
        });
    };

    const updateField = (field: keyof ICreateDocumentRequest, value: string) => {
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
                const publicId = response.data.publicId || "appwrite-file-id"; // Backend expects publicId
                setForm(p => ({ ...p, fileUrl: url, publicId }));
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
                        <span>{fixedType === "guide" ? "Thêm tài liệu hướng dẫn mới" : "Thêm văn bản mới"}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <form id="create-document-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {!fixedType && (
                            <div className="space-y-1">
                                <Label htmlFor="type">Loại văn bản <span className="text-destructive">*</span></Label>
                                <Select
                                    value={form.type}
                                    onValueChange={(val: DocumentType) => updateField("type", val)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="incoming">Công văn đến</SelectItem>
                                        <SelectItem value="outgoing">Công văn đi</SelectItem>
                                        <SelectItem value="notification">Thông báo</SelectItem>
                                        <SelectItem value="decision">Quyết định</SelectItem>
                                        {isSpecialPosition && (
                                            <SelectItem value="construction_profile">Hồ sơ công trình</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className={`space-y-1 ${form.type === "guide" ? "col-span-2" : ""}`}>
                            <Label htmlFor="title">Tiêu đề văn bản <span className="text-destructive">*</span></Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                placeholder="Nhập tiêu đề hoặc tên văn bản..."
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="documentNumber">Số hiệu / Mã hiệu <span className="text-destructive">*</span></Label>
                            <Input
                                id="documentNumber"
                                value={form.documentNumber}
                                onChange={(e) => updateField("documentNumber", e.target.value)}
                                placeholder="VD: CV-2026-001"
                                required
                            />
                        </div>
                        {form.type === "incoming" && (
                            <>
                                <div className="space-y-1.5">
                                    <Label htmlFor="receivedDate">Ngày nhận <span className="text-destructive">*</span></Label>
                                    <DatePicker
                                        date={form.receivedDate ? new Date(form.receivedDate) : undefined}
                                        onDateChange={(date) => updateField("receivedDate", date ? format(date, "yyyy-MM-dd") : "")}
                                        captionLayout="dropdown-years"
                                        fromYear={2020}
                                        toYear={new Date().getFullYear() + 1}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="sender">Người gửi / Đơn vị gửi <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="sender"
                                        value={form.sender}
                                        onChange={(e) => updateField("sender", e.target.value)}
                                        placeholder="Tên công ty hoặc cá nhân..."
                                        required={form.type === "incoming"}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="partner">Đối tác liên quan <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={form.partner}
                                        onValueChange={(val) => updateField("partner", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn đối tác (nếu có)" />
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
                            </>
                        )}

                        {form.type === "outgoing" && (
                            <>
                                <div className="space-y-1.5">
                                    <Label htmlFor="issuedDate">Ngày gửi đi <span className="text-destructive">*</span></Label>
                                    <DatePicker
                                        date={form.issuedDate ? new Date(form.issuedDate) : undefined}
                                        onDateChange={(date) => updateField("issuedDate", date ? format(date, "yyyy-MM-dd") : "")}
                                        captionLayout="dropdown-years"
                                        fromYear={2020}
                                        toYear={new Date().getFullYear() + 1}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="receiver">Người nhận / Đơn vị nhận <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="receiver"
                                        value={form.receiver}
                                        onChange={(e) => updateField("receiver", e.target.value)}
                                        placeholder="Công ty đối tác hoặc cá nhân..."
                                        required={form.type === "outgoing"}
                                    />
                                </div>
                            </>
                        )}

                        {(form.type === "notification" || form.type === "decision" || form.type === "template" || form.type === "construction_profile" || form.type === "guide") && (
                            <div className="space-y-1">
                                <Label htmlFor="issuedDate">Ngày ban hành <span className="text-destructive">*</span></Label>
                                <DatePicker
                                    date={form.issuedDate ? new Date(form.issuedDate) : undefined}
                                    onDateChange={(date) => updateField("issuedDate", date ? format(date, "yyyy-MM-dd") : "")}
                                    captionLayout="dropdown-years"
                                    fromYear={2020}
                                    toYear={new Date().getFullYear() + 1}
                                />
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label htmlFor="description">Ghi chú / Mô tả</Label>
                            <Input
                                id="description"
                                value={form.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                placeholder="Tóm tắt nội dung văn bản..."
                            />
                        </div>
                        {(form.type === "incoming" || form.type === "outgoing" || form.type === "notification" || form.type === "decision" || form.type === "construction_profile" || form.type === "guide") && (
                            <div className="space-y-1">
                                <Label htmlFor="fileUrl">Tệp văn bản (PDF, DOC, DOCX) <span className="text-destructive">*</span></Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            id="fileUrl"
                                            value={form.fileUrl}
                                            onChange={(e) => updateField("fileUrl", e.target.value)}
                                            placeholder="Tải lên hoặc dán link file PDF..."
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
                        )}
                    </form>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Hủy bỏ
                    </Button>
                    <Button type="submit" form="create-document-form" disabled={isPending || isUploading}>
                        <Icon path={isPending ? mdiLoading : mdiPlus} size={0.8} className={isPending ? "animate-spin" : ""} />
                        {isPending ? "Đang xử lý..." : "Thêm văn bản"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
