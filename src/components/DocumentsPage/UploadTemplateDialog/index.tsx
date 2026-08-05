"use client";

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
import { useCreateDocument } from "@/hooks/useDocuments";
import { useUploadPdf } from "@/hooks/useUpload";
import { ICreateDocumentRequest } from "@/interface/document";
import {
    mdiCheckCircle,
    mdiClose,
    mdiCloudUploadOutline,
    mdiDelete,
    mdiFileDocumentOutline,
    mdiFileUploadOutline,
    mdiLinkVariant,
    mdiLoading,
    mdiOpenInNew,
    mdiTextBoxMultipleOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

interface UploadTemplateDialogProps {
    isOpen: boolean;
    onClose: () => void;
    fixedType?: string;
}

export function UploadTemplateDialog({ isOpen, onClose, fixedType }: UploadTemplateDialogProps) {
    const { mutate: createDocument, isPending } = useCreateDocument();
    const { mutate: uploadPdf, isPending: isUploading } = useUploadPdf();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>("");

    const [form, setForm] = useState<ICreateDocumentRequest>({
        title: "",
        documentNumber: "", // Will be auto-generated
        type: (fixedType as any) || "template",
        fileUrl: "",
        publicId: "",
        description: "",
        issuedDate: new Date().toISOString().split("T")[0],
    });

    const resetForm = () => {
        setForm({
            title: "",
            documentNumber: "",
            type: (fixedType as any) || "template",
            fileUrl: "",
            publicId: "",
            description: "",
            issuedDate: new Date().toISOString().split("T")[0],
        });
        setFileName("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.fileUrl) {
            toast.error(`Vui lòng tải lên file ${form.type === "template" ? "mẫu văn bản" : "tài liệu hướng dẫn"}`);
            return;
        }

        // Generate a document number if empty
        const prefix = form.type === "template" ? "MAU" : "HD";
        const finalForm = {
            ...form,
            documentNumber: form.documentNumber || `${prefix}-${Date.now().toString().slice(-6)}`
        };

        createDocument(finalForm, {
            onSuccess: () => {
                resetForm();
                onClose();
                toast.success(`Tải ${form.type === "template" ? "mẫu văn bản" : "tài liệu hướng dẫn"} lên thành công`);
            },
        });
    };

    const updateField = <K extends keyof ICreateDocumentRequest>(field: K, value: ICreateDocumentRequest[K]) => {
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

        setFileName(file.name);
        uploadPdf(file, {
            onSuccess: (response: any) => {
                const url = response.data.url;
                const publicId = response.data.publicId || "appwrite-file-id";
                setForm(p => ({ ...p, fileUrl: url, publicId }));
                toast.success("Tải file lên thành công");
            }
        });
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setForm(p => ({ ...p, fileUrl: "", publicId: "" }));
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isPending ? "loading" : "upload"}
                                initial={{ rotate: -10, scale: 0.8 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Icon path={isPending ? mdiLoading : mdiFileUploadOutline} size={0.8} className={isPending ? "animate-spin" : ""} />
                            </motion.div>
                        </AnimatePresence>
                        <span>{form.type === "guide" ? "Tải lên tài liệu hướng dẫn" : "Tải lên mẫu văn bản"}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <form id="upload-template-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="title">Tên tài liệu <span className="text-destructive">*</span></Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                placeholder={form.type === "template" ? "VD: Mẫu hợp đồng lao động mới..." : "VD: Hướng dẫn sử dụng phần mềm..."}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label>Tệp đính kèm (PDF, DOC, DOCX) <span className="text-destructive">*</span></Label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileUpload}
                            />

                            <motion.div
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    relative group cursor-pointer border-2 border-dashed rounded-xl p-8
                                    flex flex-col items-center justify-center gap-3 transition-all duration-300
                                    ${form.fileUrl
                                        ? "border-primary/40 bg-primary/5"
                                        : "border-darkBorderV1 hover:border-primary/30 hover:bg-primary/5 bg-darkCardV1/30"}
                                `}
                            >
                                <div className={`
                                    w-14 h-14 rounded-full flex items-center justify-center transition-colors
                                    ${form.fileUrl ? "bg-primary/20 text-primary" : "bg-darkBorderV1/50 text-neutral-300 group-hover:text-primary group-hover:bg-primary/10"}
                                `}>
                                    <Icon
                                        path={isUploading ? mdiLoading : (form.fileUrl ? (form.type === "template" ? mdiFileDocumentOutline : mdiTextBoxMultipleOutline) : mdiCloudUploadOutline)}
                                        size={1.5}
                                        className={isUploading ? "animate-spin" : ""}
                                    />
                                </div>

                                <div className="text-center">
                                    {isUploading ? (
                                        <p className="text-primary font-medium animate-pulse">Đang tải tệp lên...</p>
                                    ) : form.fileUrl ? (
                                        <div className="space-y-1">
                                            <p className="text-primary font-semibold flex items-center justify-center gap-1">
                                                <Icon path={mdiCheckCircle} size={0.6} />
                                                Tải lên thành công
                                            </p>
                                            <p className="text-neutral-300 text-sm truncate italic">
                                                {fileName || "template.pdf"}
                                            </p>
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1 text-sm mt-2 bg-darkBackgroundV1/50 px-3 py-1.5 rounded-lg border border-darkBorderV1 max-w-[400px] hover:border-primary/30 text-neutral-300 transition-all cursor-default"
                                            >
                                                <Icon path={mdiLinkVariant} size={0.6} className="shrink-0" />
                                                <span className="truncate flex-1">{form.fileUrl}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-neutral-300 font-semibold">Nhấn để chọn tệp (PDF, DOC, DOCX)</p>
                                            <p className="text-sm mt-1 text-neutral-300">Dung lượng tối đa 20MB</p>
                                        </>
                                    )}
                                </div>

                                {form.fileUrl && !isUploading && (
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <Link
                                            href={form.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-8 h-8 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center text-primary transition-colors border border-primary/30"
                                            title="Xem tệp"
                                        >
                                            <Icon path={mdiOpenInNew} size={0.6} />
                                        </Link>
                                        <div
                                            onClick={handleRemoveFile}
                                            className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors border border-red-500/30"
                                            title="Gỡ bỏ"
                                        >
                                            <Icon path={mdiDelete} size={0.6} />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </form>
                </div>

                <DialogFooter className="mt-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isPending || isUploading}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Hủy bỏ
                    </Button>
                    <Button
                        type="submit"
                        form="upload-template-form"
                        disabled={isPending || isUploading || !form.title || !form.fileUrl}
                    >
                        <Icon path={isPending ? mdiLoading : mdiCloudUploadOutline} size={0.8} className={isPending ? "animate-spin" : ""} />
                        {isPending ? "Đang lưu..." : `Tải lên ${form.type === "template" ? "mẫu" : "hướng dẫn"}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
