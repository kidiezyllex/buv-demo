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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useExecuteRestore, useValidateRestore } from "@/hooks/useBackup";
import {
    mdiAlertOutline,
    mdiClose,
    mdiDatabaseImport,
    mdiFileUploadOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useState } from "react";

const CONFIRM_TEXT = "RESTORE";

interface RestoreDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RestoreDialog({ isOpen, onClose }: RestoreDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [step, setStep] = useState<1 | 2>(1);
    const [confirmInput, setConfirmInput] = useState("");

    const { mutate: validateRestore, data: validateResult, isPending: isValidating, reset: resetValidate } = useValidateRestore();
    const { mutate: executeRestore, isPending: isRestoring } = useExecuteRestore();

    const handleClose = () => {
        setSelectedFile(null);
        setStep(1);
        setConfirmInput("");
        resetValidate();
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        validateRestore({ file });
    };

    const handleContinue = () => {
        setStep(2);
    };

    const handleConfirmRestore = () => {
        if (!selectedFile || !validateResult?.data?.checksum) return;
        executeRestore(
            {
                file: selectedFile,
                checksum: validateResult.data.checksum,
                confirmText: confirmInput,
            },
            {
                onSuccess: () => handleClose(),
            }
        );
    };

    const comparison = validateResult?.data?.comparison || [];
    const isConfirmMatched = confirmInput === CONFIRM_TEXT;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent size="small">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiDatabaseImport} size={0.8} />
                        <span>Phục hồi dữ liệu từ file backup</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar p-3 md:p-4">
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="restoreFile">Chọn file backup (.json)</Label>
                                <Input
                                    id="restoreFile"
                                    type="file"
                                    accept="application/json"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {selectedFile && (
                                <div className="flex items-center gap-2 text-sm text-neutral-300">
                                    <Icon path={mdiFileUploadOutline} size={0.6} className="flex-shrink-0" />
                                    {selectedFile.name}
                                </div>
                            )}

                            {isValidating && (
                                <div className="text-center text-neutral-400 text-sm py-2 italic">
                                    Đang kiểm tra file backup...
                                </div>
                            )}

                            {validateResult && (
                                <div className="space-y-3 md:space-y-4">
                                    <div className="bg-darkBorderV1 border-darkBorderV1 border rounded-lg p-3 md:p-4">
                                        <div className="flex items-start gap-2">
                                            <IconAlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                            <div className="text-sm text-red-400">
                                                <p className="font-semibold mb-1">Cảnh báo:</p>
                                                <p>Toàn bộ dữ liệu hiện tại sẽ bị xoá và thay thế bằng dữ liệu trong file này. Thao tác không thể hoàn tác.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Danh mục</TableHead>
                                                <TableHead>Hiện tại</TableHead>
                                                <TableHead>Sau khi phục hồi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {comparison.map((item: any) => (
                                                <TableRow key={item.name}>
                                                    <TableCell className="text-neutral-300">{item.name}</TableCell>
                                                    <TableCell className="text-neutral-300">{item.currentCount}</TableCell>
                                                    <TableCell className="text-neutral-300">{item.fileCount}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </>
                    )}

                    {step === 2 && (
                        <div className="space-y-3 md:space-y-4">
                            <div className="bg-darkBorderV1 border-darkBorderV1 border rounded-lg p-3 md:p-4">
                                <div className="flex items-start gap-2">
                                    <Icon path={mdiAlertOutline} size={0.8} className="text-red-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-red-400">
                                        <p className="font-semibold mb-1">Xác nhận cuối cùng:</p>
                                        <p>Nhập chính xác chuỗi <span className="font-bold">{CONFIRM_TEXT}</span> để xác nhận phục hồi dữ liệu.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmText">Nhập &quot;{CONFIRM_TEXT}&quot; để xác nhận</Label>
                                <Input
                                    id="confirmText"
                                    value={confirmInput}
                                    onChange={(e) => setConfirmInput(e.target.value)}
                                    placeholder={CONFIRM_TEXT}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isRestoring}>
                        <Icon path={mdiClose} size={0.8} />
                        Hủy bỏ
                    </Button>
                    {step === 1 ? (
                        <Button
                            onClick={handleContinue}
                            disabled={!validateResult || isValidating}
                        >
                            <Icon path={mdiDatabaseImport} size={0.8} />
                            Tiếp tục
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={handleConfirmRestore}
                            disabled={!isConfirmMatched || isRestoring}
                        >
                            <Icon path={mdiDatabaseImport} size={0.8} />
                            {isRestoring ? "Đang phục hồi..." : "Xác nhận phục hồi"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
