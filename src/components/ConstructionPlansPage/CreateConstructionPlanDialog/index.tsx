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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useCreatePlan,
    usePartners,
} from "@/hooks/usePartners";
import { useUploadPdf } from "@/hooks/useUpload";
import { IPartner } from "@/interface/partner";
import {
    mdiCheckCircle,
    mdiClose,
    mdiCloudUploadOutline,
    mdiDelete,
    mdiFileDocumentOutline,
    mdiFileDocumentPlusOutline,
    mdiLinkVariant,
    mdiLoading,
    mdiOpenInNew,
    mdiPlus,
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "react-toastify";

interface CreateConstructionPlanDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateConstructionPlanDialog({
    isOpen,
    onClose,
}: CreateConstructionPlanDialogProps) {
    const { mutate: createPlan, isPending: isCreating } = useCreatePlan();
    const { mutate: uploadPdf, isPending: isUploading } = useUploadPdf();
    const { data: partnersResponse } = usePartners({ limit: 100 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>("");
    const partners = partnersResponse?.data?.partners || [];

    const [formData, setFormData] = useState({
        partnerId: "",
        description: "",
        constructionPlansFileUrl: "",
    });

    const resetForm = () => {
        setFormData({
            partnerId: "",
            description: "",
            constructionPlansFileUrl: "",
        });
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                if (response.data?.url) {
                    setFormData((prev) => ({
                        ...prev,
                        constructionPlansFileUrl: response.data.url,
                    }));
                    toast.success("Tải file lên thành công");
                }
            },
        });
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFormData((prev) => ({ ...prev, constructionPlansFileUrl: "" }));
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const missingFields: string[] = [];
        if (!formData.partnerId) missingFields.push("Đối tác");
        if (!formData.description.trim()) missingFields.push("Mô tả phương án");
        if (!formData.constructionPlansFileUrl) missingFields.push("File phương án thi công (PDF, DOC, DOCX)");

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

        createPlan(
            {
                partnerId: formData.partnerId,
                description: formData.description,
                constructionPlansFileUrl: formData.constructionPlansFileUrl,
            },
            {
                onSuccess: () => {
                    resetForm();
                    onClose();
                },
            }
        );
    };

    const isPending = isCreating || isUploading;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiFileDocumentPlusOutline} size={0.8} className="flex-shrink-0" />
                        <span>Thêm phương án thi công mới</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    <form id="create-plan-form" onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="partnerId">Đối tác <span className="text-destructive">*</span></Label>
                            <Select
                                value={formData.partnerId}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, partnerId: value }))}
                                disabled={isPending}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn đối tác" />
                                </SelectTrigger>
                                <SelectContent>
                                    {partners.map((partner: IPartner) => (
                                        <SelectItem key={partner._id} value={partner._id}>
                                            {partner.partnerName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="description">Mô tả phương án <span className="text-destructive">*</span></Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Nhập mô tả phương án thi công..."
                                disabled={isPending}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>File phương án thi công (PDF, DOC, DOCX)</Label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                            />
                            <motion.div
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    relative group cursor-pointer border-2 border-dashed rounded-xl p-8
                                    flex flex-col items-center justify-center gap-3 transition-all duration-300
                                    ${formData.constructionPlansFileUrl
                                        ? "border-primary/40 bg-primary/5"
                                        : "border-darkBorderV1 hover:border-primary/30 hover:bg-primary/5 bg-darkCardV1/30"}
                                `}
                            >
                                <div className={`
                                    w-14 h-14 rounded-full flex items-center justify-center transition-colors
                                    ${formData.constructionPlansFileUrl ? "bg-primary/20 text-primary" : "bg-darkBorderV1/50 text-neutral-300 group-hover:text-primary group-hover:bg-primary/10"}
                                `}>
                                    <Icon
                                        path={isUploading ? mdiLoading : (formData.constructionPlansFileUrl ? mdiFileDocumentOutline : mdiCloudUploadOutline)}
                                        size={1.5}
                                        className={isUploading ? "animate-spin" : ""}
                                    />
                                </div>

                                <div className="text-center">
                                    {isUploading ? (
                                        <p className="text-primary font-medium animate-pulse">Đang tải tệp lên...</p>
                                    ) : formData.constructionPlansFileUrl ? (
                                        <div className="space-y-1">
                                            <p className="text-primary font-semibold flex items-center justify-center gap-1">
                                                <Icon path={mdiCheckCircle} size={0.6} />
                                                Tải lên thành công
                                            </p>
                                            <p className="text-neutral-300 text-sm truncate italic">
                                                {fileName || "file_phuong_an"}
                                            </p>
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1 text-sm mt-2 bg-darkBackgroundV1/50 px-3 py-1.5 rounded-lg border border-darkBorderV1 max-w-[300px] hover:border-primary/30 text-neutral-300 transition-all cursor-default"
                                            >
                                                <Icon path={mdiLinkVariant} size={0.6} className="shrink-0" />
                                                <span className="truncate flex-1">{formData.constructionPlansFileUrl}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-neutral-300 font-semibold">Nhấn để chọn tệp (PDF, DOC, DOCX)</p>
                                            <p className="text-sm mt-1 text-neutral-300">Dung lượng tối đa 20MB</p>
                                        </>
                                    )}
                                </div>

                                {formData.constructionPlansFileUrl && !isUploading && (
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <Link
                                            href={formData.constructionPlansFileUrl}
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
                                            className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors border border-red-500/30 cursor-pointer"
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

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => { resetForm(); onClose(); }}
                        disabled={isPending}
                    >
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Hủy bỏ
                    </Button>
                    <Button
                        form="create-plan-form"
                        type="submit"
                        disabled={isPending}
                    >
                        <Icon
                            path={isPending ? mdiLoading : mdiPlus}
                            size={0.8}
                            className={isPending ? "animate-spin" : ""}
                        />
                        {isCreating ? "Đang lưu..." : "Thêm phương án"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
