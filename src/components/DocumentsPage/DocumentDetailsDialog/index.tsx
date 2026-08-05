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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { useMe } from "@/hooks/useAuth";
import { useDocumentDetails, useUpdateDocument } from "@/hooks/useDocuments";
import { usePartners } from "@/hooks/usePartners";
import { usePermissions } from "@/hooks/usePermissions";
import { useUploadPdf } from "@/hooks/useUpload";
import { DocumentType, IDocument, IUpdateDocumentRequest } from "@/interface/document";
import {
    mdiArchiveEyeOutline,
    mdiClose,
    mdiContentSave,
    mdiFileLinkOutline,
    mdiLinkVariant,
    mdiLoading,
    mdiOpenInNew,
    mdiSquareEditOutline,
    mdiUpload
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface DocumentDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    document: IDocument | null;
    defaultIsEditing?: boolean;
    fixedType?: string;
}

export function DocumentDetailsDialog({ isOpen, onClose, document, defaultIsEditing = false, fixedType }: DocumentDetailsDialogProps) {
    const { data: detailsResponse, isLoading } = useDocumentDetails(isOpen ? document?._id || null : null);
    const docData = detailsResponse?.data || document;

    const { mutate: updateDocument, isPending } = useUpdateDocument();
    const { mutate: uploadPdf, isPending: isUploading } = useUploadPdf();
    const { data: partnersData } = usePartners({ limit: 1000 });
    const partners = partnersData?.data?.partners || [];
    const { data: profile } = useMe();
    const position = profile?.data?.user?.position?.toLowerCase() || "";
    const isSpecialPosition = position.includes("kế toán") || position.includes("giám đốc");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(defaultIsEditing);
    const { hasPermission } = usePermissions();
    const canUpdate = hasPermission("document-management:update");
    const [form, setForm] = useState<IUpdateDocumentRequest>({});

    useEffect(() => {
        if (isOpen) {
            setIsEditing(defaultIsEditing);
        }
    }, [isOpen, defaultIsEditing]);

    useEffect(() => {
        if (isOpen && docData) {
            setForm({
                title: docData.title,
                documentNumber: docData.documentNumber,
                type: docData.type,
                fileUrl: docData.fileUrl || "",
                publicId: docData.publicId || "",
                description: docData.description || "",
                issuedDate: docData.issuedDate?.split("T")[0] || "",
                receivedDate: docData.receivedDate?.split("T")[0] || "",
                sender: docData.sender || "",
                receiver: docData.receiver || "",
                partner: typeof docData.partner === 'object' ? docData.partner._id : docData.partner,
            });
        }
    }, [isOpen, docData]);

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
                const publicId = response.data.publicId || "appwrite-file-id";
                setForm(p => ({ ...p, fileUrl: url, publicId }));
                toast.success("Tải file lên thành công");
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!docData?._id) return;

        const missingFields: string[] = [];

        // Common required fields
        if (!form.title?.trim()) missingFields.push("Tiêu đề văn bản");
        if (!form.documentNumber?.trim()) missingFields.push("Số hiệu / Mã hiệu");
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

        updateDocument({ id: docData._id, data: form }, {
            onSuccess: () => {
                setIsEditing(false);
                onClose();
            },
        });
    };

    const updateField = (field: keyof IUpdateDocumentRequest, value: string) => {
        setForm((p) => ({ ...p, [field]: value }));
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "incoming": return "Công văn đến";
            case "outgoing": return "Công văn đi";
            case "notification": return "Thông báo";
            case "decision": return "Quyết định";
            case "template": return "Mẫu văn bản";
            case "construction_profile": return "Hồ sơ công trình";
            case "guide": return "Tài liệu hướng dẫn";
            default: return type;
        }
    };

    const getTypeVariant = (type: string) => {
        switch (type) {
            case "incoming": return "blue";
            case "outgoing": return "orange";
            case "notification": return "purple";
            case "decision": return "red";
            case "template": return "green";
            case "construction_profile": return "cyan";
            case "guide": return "blue";
            default: return "secondary";
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        try {
            return format(new Date(dateStr), "dd/MM/yyyy", { locale: vi });
        } catch {
            return dateStr;
        }
    };

    if (!document) return null;

    const partnerName = typeof docData?.partner === 'object'
        ? (docData.partner.partnerName || docData.partner.name || "-")
        : "-";

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={isEditing ? mdiSquareEditOutline : mdiArchiveEyeOutline} size={0.8} className="flex-shrink-0" />
                        <span>{isEditing ? "Cập nhật văn bản" : "Chi tiết văn bản"}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {isLoading ? (
                        <div className="space-y-3 md:space-y-4">
                            <Skeleton className="h-[100px] w-full" />
                            <Skeleton className="h-[200px] w-full" />
                        </div>
                    ) : isEditing ? (
                        <form id="edit-doc-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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

                            {!fixedType && (
                                <div className="space-y-1.5">
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

                            {form.type === "incoming" && (
                                <>
                                    <div className="space-y-1">
                                        <Label htmlFor="receivedDate">Ngày nhận <span className="text-destructive">*</span></Label>
                                        <DatePicker
                                            date={form.receivedDate ? new Date(form.receivedDate) : undefined}
                                            onDateChange={(date) => updateField("receivedDate", date ? format(date, "yyyy-MM-dd") : "")}
                                            captionLayout="dropdown-years"
                                            fromYear={2020}
                                            toYear={new Date().getFullYear() + 1}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="sender">Người gửi / Đơn vị gửi <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="sender"
                                            value={form.sender}
                                            onChange={(e) => updateField("sender", e.target.value)}
                                            placeholder="Tên công ty hoặc cá nhân..."
                                            required={form.type === "incoming"}
                                        />
                                    </div>
                                    <div className="space-y-1">
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
                                    <div className="space-y-1">
                                        <Label htmlFor="issuedDate">Ngày gửi đi <span className="text-destructive">*</span></Label>
                                        <DatePicker
                                            date={form.issuedDate ? new Date(form.issuedDate) : undefined}
                                            onDateChange={(date) => updateField("issuedDate", date ? format(date, "yyyy-MM-dd") : "")}
                                            captionLayout="dropdown-years"
                                            fromYear={2020}
                                            toYear={new Date().getFullYear() + 1}
                                        />
                                    </div>
                                    <div className="space-y-1">
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
                                <div className="space-y-1.5">
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
                                <div className="space-y-1.5">
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
                                        {form.fileUrl && (
                                            <Link href={form.fileUrl} target="_blank">
                                                <Button type="button" variant="outline" size="icon" className="shrink-0">
                                                    <Icon path={mdiOpenInNew} size={0.8} className="flex-shrink-0" />
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </form>
                    ) : (
                        <div className="space-y-3 md:space-y-4">
                            <div className="space-y-3 md:space-y-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Thông tin chi tiết</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>
                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                <TableCell className="font-semibold text-neutral-300">Số hiệu</TableCell>
                                                <TableCell className="text-neutral-300">
                                                    <Badge variant="green">{docData.documentNumber}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                <TableCell className="font-semibold text-neutral-300 w-1/3">Tiêu đề</TableCell>
                                                <TableCell className="text-neutral-300">{docData.title}</TableCell>
                                            </TableRow>
                                            <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                <TableCell className="font-semibold text-neutral-300">Loại văn bản</TableCell>
                                                <TableCell>
                                                    <Badge variant={getTypeVariant(docData.type)}>
                                                        {getTypeLabel(docData.type)}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                <TableCell className="font-semibold text-neutral-300">Mô tả</TableCell>
                                                <TableCell className="text-neutral-300 italic text-sm">{docData.description || "-"}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>

                            <div className="space-y-3 md:space-y-4">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Thời gian & Nguồn</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>
                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            {docData.type === "incoming" && (
                                                <>
                                                    <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                        <TableCell className="font-semibold text-neutral-300 w-1/3">Ngày nhận</TableCell>
                                                        <TableCell>
                                                            <Badge variant="cyan">
                                                                {formatDate(docData.receivedDate)}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                        <TableCell className="font-semibold text-neutral-300">Người / Đơn vị gửi</TableCell>
                                                        <TableCell className="text-neutral-300">{docData.sender || "-"}</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                        <TableCell className="font-semibold text-neutral-300">Đối tác (Lọc)</TableCell>
                                                        <TableCell className="text-neutral-300">{partnerName}</TableCell>
                                                    </TableRow>
                                                </>
                                            )}
                                            {docData.type === "outgoing" && (
                                                <>
                                                    <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                        <TableCell className="font-semibold text-neutral-300 w-1/3">Ngày gửi</TableCell>
                                                        <TableCell className="text-neutral-300">{formatDate(docData.issuedDate)}</TableCell>
                                                    </TableRow>
                                                    <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                        <TableCell className="font-semibold text-neutral-300">Người / Đơn vị nhận</TableCell>
                                                        <TableCell className="text-neutral-300">{docData.receiver || "-"}</TableCell>
                                                    </TableRow>
                                                </>
                                            )}
                                            {(docData.type === "notification" || docData.type === "decision" || docData.type === "template" || docData.type === "construction_profile" || docData.type === "guide") && (
                                                <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                    <TableCell className="font-semibold text-neutral-300 w-1/3">Ngày ban hành</TableCell>
                                                    <TableCell><Badge variant="neutral">{formatDate(docData.issuedDate)}</Badge></TableCell>
                                                </TableRow>
                                            )}
                                            <TableRow className="border-none hover:bg-transparent">
                                                <TableCell className="font-semibold text-neutral-300">Tệp đính kèm</TableCell>
                                                <TableCell>
                                                    {docData.fileUrl ? (
                                                        <Link
                                                            href={docData.fileUrl}
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
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {isEditing ? (
                        <>
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isPending}>
                                <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                Hủy bỏ
                            </Button>
                            <Button type="submit" form="edit-doc-form" disabled={isPending || isUploading}>
                                <Icon path={isPending ? mdiLoading : mdiContentSave} size={0.8} className={isPending ? "animate-spin" : ""} />
                                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </>
                    ) : (
                        <div className="flex gap-2 w-full justify-end">
                            <Button variant="outline" onClick={onClose}>
                                <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                Đóng
                            </Button>
                            {docData?.type !== "template" && canUpdate && (
                                <Button onClick={() => setIsEditing(true)}>
                                    <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                    Cập nhật văn bản
                                </Button>
                            )}
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
