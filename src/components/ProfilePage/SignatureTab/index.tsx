"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    mdiAccountEditOutline,
    mdiAutoFix,
    mdiClose,
    mdiCloudUploadOutline,
    mdiContentSave,
    mdiDownload,
    mdiLoading,
    mdiSignatureFreehand,
    mdiTrashCanOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { Allura } from "next/font/google";
import React from "react";

const allura = Allura({
    subsets: ["latin"],
    weight: ["400"],
});

interface SignatureTabProps {
    formData: {
        digitalSignature: string;
    };
    isEditing: boolean;
    isUpdating: boolean;
    signatureText: string;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    setIsEditing: (v: boolean) => void;
    setSignatureText: (v: string) => void;
    handleCancel: () => void;
    handleSubmit: () => void;
    handleChange: (field: string, value: any) => void;
    handleUploadSignature: (e: React.ChangeEvent<HTMLInputElement>) => void;
    generateSignatureImage: () => void;
    downloadSignature: () => void;
}

export function SignatureTab({
    formData,
    isEditing,
    isUpdating,
    signatureText,
    fileInputRef,
    setIsEditing,
    setSignatureText,
    handleCancel,
    handleSubmit,
    handleChange,
    handleUploadSignature,
    generateSignatureImage,
    downloadSignature,
}: SignatureTabProps) {
    return (
        <Card className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-3 md:gap-4 mb-3">
                <div className="flex items-center gap-3 md:gap-4 flex-1">
                    <h3 className="text-primary font-semibold">Chữ ký điện tử</h3>
                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                </div>
                <div className="flex gap-3">
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                            <Icon path={mdiAccountEditOutline} size={0.8} className="flex-shrink-0" />
                            Cập nhật thông tin
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleCancel} disabled={isUpdating} className="w-full flex-1">
                                <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                Hủy
                            </Button>
                            <Button onClick={handleSubmit} disabled={isUpdating} className="w-full flex-1">
                                <Icon path={isUpdating ? mdiLoading : mdiContentSave} size={0.8} className={isUpdating ? "animate-spin" : ""} />
                                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className={cn("grid grid-cols-1 gap-3 md:gap-4", isEditing && "md:grid-cols-2")}>
                {/* Preview */}
                <div className="space-y-2">
                    <Label>Chữ ký hiện tại</Label>
                    <Card className="p-4 flex flex-col items-center justify-center bg-darkBackgroundV1/30 border-darkBorderV1 min-h-[200px]">
                        {formData.digitalSignature ? (
                            <div className="relative group w-fit">
                                <img
                                    src={formData.digitalSignature}
                                    alt="Digital Signature"
                                    className="object-contain rounded-md max-h-[160px]"
                                />
                                <button
                                    className="absolute flex items-center justify-center top-1 right-1 h-8 w-8 rounded-full bg-black/70 hover:bg-black/90 text-neutral-300 border-none shadow-sm transition-colors"
                                    onClick={downloadSignature}
                                >
                                    <Icon path={mdiDownload} size={0.8} className="flex-shrink-0" />
                                </button>
                            </div>
                        ) : (
                            <div className="text-neutral-300 italic text-sm flex flex-col items-center gap-2">
                                <Icon path={mdiSignatureFreehand} size={2} className="opacity-30" />
                                <span>Chưa có chữ ký điện tử</span>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Upload / Generate */}
                {isEditing && (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Tải lên file ảnh</Label>
                            <input
                                type="file"
                                ref={fileInputRef as any}
                                accept="image/*"
                                onChange={handleUploadSignature}
                                className="hidden"
                            />
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="cursor-pointer border-2 border-dashed border-darkBorderV1 hover:border-primary/40 hover:bg-primary/5 bg-darkBackgroundV1/30 rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-darkBorderV1/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <Icon path={mdiCloudUploadOutline} size={1} className="text-neutral-300 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-neutral-300">Nhấn để chọn ảnh</p>
                                    <p className="text-sm text-neutral-300 mt-1">PNG, JPG up to 5MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Hoặc tạo chữ ký từ tên</Label>
                            <div className="flex gap-2">
                                <Input value={signatureText} onChange={(e) => setSignatureText(e.target.value)} placeholder="Nhập tên..." />
                                <Button type="button" onClick={generateSignatureImage}>
                                    <Icon path={mdiAutoFix} size={0.8} className="flex-shrink-0" />
                                    Tạo ảnh chữ ký
                                </Button>
                            </div>
                        </div>

                        {formData.digitalSignature && (
                            <div className="flex gap-2">
                                <Button type="button" variant="red" onClick={() => handleChange("digitalSignature", "")} className="flex-1">
                                    <Icon path={mdiTrashCanOutline} size={0.8} className="flex-shrink-0" />
                                    Xóa ảnh
                                </Button>
                                <Button type="button" variant="outline" onClick={downloadSignature} className="flex-1">
                                    <Icon path={mdiDownload} size={0.8} className="flex-shrink-0" />
                                    Tải xuống ảnh
                                </Button>
                            </div>
                        )}

                        <div style={{ ...allura.style, opacity: 0, position: "absolute", pointerEvents: "none" }}>
                            {signatureText}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
