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
import { useContractDetails, useUpdateContract } from "@/hooks/useContracts";
import { usePartners } from "@/hooks/usePartners";
import { usePermissions } from "@/hooks/usePermissions";
import { useUploadPdf } from "@/hooks/useUpload";
import { ContractStatus, IContract, IUpdateContractRequest } from "@/interface/contract";
import {
    mdiArchiveEyeOutline,
    mdiClose,
    mdiContentSave,
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

interface ContractDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    contract: IContract | null;
    defaultIsEditing?: boolean;
}

export function ContractDetailsDialog({ isOpen, onClose, contract, defaultIsEditing = false }: ContractDetailsDialogProps) {
    const { data: detailsResponse, isLoading } = useContractDetails(isOpen ? contract?._id || null : null);
    const contractData = detailsResponse?.data || contract;

    const { mutate: updateContract, isPending } = useUpdateContract();
    const { mutate: uploadPdf, isPending: isUploading } = useUploadPdf();
    const { data: partnersData } = usePartners({ limit: 1000 });
    const partners = partnersData?.data?.partners || [];

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(defaultIsEditing);
    const { hasPermission } = usePermissions();
    const canUpdate = hasPermission("contract-management:update");
    const [form, setForm] = useState<IUpdateContractRequest>({});

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
            }
        });
    };
    // Sync isEditing when dialog opens
    useEffect(() => {
        if (isOpen) {
            setIsEditing(defaultIsEditing);
        }
    }, [isOpen, defaultIsEditing]);

    // Sync form data once when data is available and dialog is open
    useEffect(() => {
        if (isOpen && contractData) {
            setForm({
                contractNumber: contractData.contractNumber,
                contractFile: contractData.contractFile || "",
                constructionItem: contractData.constructionItem,
                partner: typeof contractData.partner === 'object' ? contractData.partner._id : contractData.partner,
                signingDate: contractData.signingDate?.split("T")[0] || "",
                status: contractData.status,
                finalizationDate: contractData.finalizationDate?.split("T")[0] || "",
            });
        }
    }, [isOpen, contractData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!contractData?._id) return;
        updateContract({ id: contractData._id, data: form }, {
            onSuccess: () => {
                setIsEditing(false);
                onClose();
            },
        });
    };

    const updateField = (field: keyof IUpdateContractRequest, value: string) => {
        setForm((p) => ({ ...p, [field]: value }));
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "paid": return "Đã thanh toán";
            case "unpaid": return "Chưa thanh toán";
            case "advanced": return "Tạm ứng";
            default: return status;
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "paid": return "green";
            case "unpaid": return "red";
            case "advanced": return "yellow";
            default: return "secondary";
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        try {
            return format(new Date(dateStr), "dd/MM/yyyy", { locale: vi });
        } catch {
            return dateStr;
        }
    };

    if (!contract) return null;

    const partnerName = typeof contractData?.partner === 'object'
        ? (contractData.partner.partnerName || contractData.partner.name || "-")
        : contractData?.partner || "-";

    const partnerAddress = typeof contractData?.partner === 'object'
        ? contractData.partner.address
        : null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={isEditing ? mdiSquareEditOutline : mdiArchiveEyeOutline} size={0.8} className="flex-shrink-0" />
                        <span>{isEditing ? "Cập nhật hợp đồng" : "Chi tiết hợp đồng"}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {isLoading ? (
                        <div className="space-y-3 md:space-y-4">
                            <Skeleton className="h-[40px] w-full" />
                            <Card className="p-4 space-y-3 md:space-y-4 border border-darkBorderV1 bg-transparent">
                                <Skeleton className="h-[30px] w-3/4" />
                                <Skeleton className="h-[30px] w-1/2" />
                                <Skeleton className="h-[30px] w-2/3" />
                            </Card>
                            <Skeleton className="h-[40px] w-full" />
                            <Card className="p-4 space-y-3 md:space-y-4 border border-darkBorderV1 bg-transparent">
                                <Skeleton className="h-[30px] w-3/4" />
                                <Skeleton className="h-[30px] w-1/2" />
                                <Skeleton className="h-[30px] w-2/3" />
                            </Card>
                        </div>
                    ) : isEditing ? (
                        <form id="edit-contract-form" onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                            <div className="flex items-center gap-3 md:gap-4 mb-2">
                                <h3 className="text-primary font-semibold whitespace-nowrap text-sm">Thông tin chỉnh sửa</h3>
                                <div className="flex-1 border-b border-dashed border-primary mr-1" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="contractNumber">Số hợp đồng</Label>
                                    <Input
                                        id="contractNumber"
                                        value={form.contractNumber}
                                        onChange={(e) => updateField("contractNumber", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="partner">Đối tác</Label>
                                    <Select
                                        value={form.partner}
                                        onValueChange={(val) => updateField("partner", val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
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
                                    <Label htmlFor="constructionItem">Hạng mục thi công</Label>
                                    <Input
                                        id="constructionItem"
                                        value={form.constructionItem}
                                        onChange={(e) => updateField("constructionItem", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="signingDate">Ngày ký</Label>
                                    <DatePicker
                                        date={form.signingDate ? new Date(form.signingDate) : undefined}
                                        onDateChange={(date) => updateField("signingDate", date ? format(date, "yyyy-MM-dd") : "")}
                                        captionLayout="dropdown-years"
                                        fromYear={2020}
                                        toYear={new Date().getFullYear() + 10}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="finalizationDate">Ngày quyết toán</Label>
                                    <DatePicker
                                        date={form.finalizationDate ? new Date(form.finalizationDate) : undefined}
                                        onDateChange={(date) => updateField("finalizationDate", date ? format(date, "yyyy-MM-dd") : "")}
                                        captionLayout="dropdown-years"
                                        fromYear={2020}
                                        toYear={new Date().getFullYear() + 10}
                                    />
                                </div>

                                <div className="space-y-1.5">
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

                                <div className="space-y-1.5">
                                    <Label htmlFor="contractFile">Link file hợp đồng</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="contractFile"
                                            value={form.contractFile}
                                            onChange={(e) => updateField("contractFile", e.target.value)}
                                            className="flex-1"
                                            placeholder="Đường dẫn file (PDF, DOC, DOCX)..."
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
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="shrink-0"
                                        >
                                            <Icon path={isUploading ? mdiLoading : mdiUpload} size={0.8} className={isUploading ? "animate-spin" : ""} />
                                        </Button>
                                        <Link
                                            href={form.contractFile || "#"}
                                            target="_blank"
                                            className={!form.contractFile ? "pointer-events-none" : ""}
                                        >
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="shrink-0"
                                                disabled={!form.contractFile}
                                            >
                                                <Icon path={mdiOpenInNew} size={0.8} className="flex-shrink-0" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-primary font-semibold whitespace-nowrap">Thông tin cơ bản</h3>
                                <div className="flex-1 border-b border-dashed border-primary mr-1" />
                            </div>
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                            <TableCell className="font-semibold text-neutral-300 w-1/3">Số hợp đồng</TableCell>
                                            <TableCell>
                                                <Badge variant="green">{contract.contractNumber}</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                            <TableCell className="font-semibold text-neutral-300">Đối tác</TableCell>
                                            <TableCell className="text-neutral-300 font-medium">{partnerName}</TableCell>
                                        </TableRow>
                                        {partnerAddress && (
                                            <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                                <TableCell className="font-semibold text-neutral-300">Địa chỉ</TableCell>
                                                <TableCell className="text-neutral-300">{partnerAddress}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                            <TableCell className="font-semibold text-neutral-300">Hạng mục thi công</TableCell>
                                            <TableCell className="text-neutral-300 italic">{contract.constructionItem}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Card>

                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-primary font-semibold whitespace-nowrap">Thời gian & trạng thái</h3>
                                <div className="flex-1 border-b border-dashed border-primary mr-1" />
                            </div>
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                            <TableCell className="font-semibold text-neutral-300 w-1/3">Ngày ký</TableCell>
                                            <TableCell><Badge variant="neutral">{formatDate(contract.signingDate)}</Badge></TableCell>
                                        </TableRow>
                                        <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                            <TableCell className="font-semibold text-neutral-300">Ngày quyết toán</TableCell>
                                            <TableCell><Badge variant="neutral">{formatDate(contract.finalizationDate)}</Badge></TableCell>
                                        </TableRow>
                                        <TableRow className="border-b border-darkBorderV1/50 hover:bg-transparent">
                                            <TableCell className="font-semibold text-neutral-300">Trạng thái thanh toán</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(contract.status)}>
                                                    {getStatusLabel(contract.status)}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="border-none hover:bg-transparent">
                                            <TableCell className="font-semibold text-neutral-300">File hợp đồng</TableCell>
                                            <TableCell>
                                                {contract.contractFile ? (
                                                    <Link
                                                        href={contract.contractFile}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline underline-offset-4"
                                                    >
                                                        <Icon path={mdiLinkVariant} size={0.8} className="flex-shrink-0" />
                                                        Click để xem và tải xuống
                                                    </Link>
                                                ) : (
                                                    <span className="text-neutral-300 text-xs italic">Không có file</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {isLoading ? (
                        <Skeleton className="h-10 w-[200px] ml-auto" />
                    ) : isEditing ? (
                        <>
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isPending}>
                                <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                Hủy
                            </Button>
                            <Button type="submit" form="edit-contract-form" disabled={isPending}>
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
                            {canUpdate && (
                                <Button onClick={() => setIsEditing(true)}>
                                    <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                    Cập nhật hợp đồng
                                </Button>
                            )}
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
