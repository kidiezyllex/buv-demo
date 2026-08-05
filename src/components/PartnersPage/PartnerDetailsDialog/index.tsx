"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { usePartnerDetails, useUpdatePartner } from "@/hooks/usePartners";
import { usePermissions } from "@/hooks/usePermissions";
import { IContact, IPartner } from "@/interface/partner";
import {
    mdiAccountGroupOutline,
    mdiArchiveEyeOutline,
    mdiClose,
    mdiDomain,
    mdiLoading,
    mdiMapMarkerOutline,
    mdiMinus,
    mdiPlus,
    mdiSquareEditOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";

interface PartnerDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    partner: IPartner | null;
    defaultIsEditing?: boolean;
}

export function PartnerDetailsDialog({
    isOpen,
    onClose,
    partner,
    defaultIsEditing = false
}: PartnerDetailsDialogProps) {
    const { data: detailsResponse, isLoading } = usePartnerDetails(partner?._id || "");
    const partnerData = detailsResponse?.data || partner;

    const { mutate: updatePartner, isPending: isUpdating } = useUpdatePartner();
    const [isEditing, setIsEditing] = useState(defaultIsEditing);
    const { hasPermission } = usePermissions();
    const canUpdate = hasPermission("partner-management:update");

    const [formData, setFormData] = useState({
        partnerName: "",
        address: "",
        contacts: [{ name: "", phoneNumber: "" }] as IContact[],
        isActive: true,
    });

    // Sync isEditing with defaultIsEditing when dialog opens
    useEffect(() => {
        if (isOpen) {
            setIsEditing(defaultIsEditing);
        }
    }, [isOpen, defaultIsEditing]);

    // Reset and sync data when dialog opens
    useEffect(() => {
        if (isOpen && partnerData && !isEditing) {
            setFormData({
                partnerName: partnerData.partnerName || "",
                address: partnerData.address || "",
                contacts: partnerData.contacts?.length
                    ? partnerData.contacts.map((c: any) => ({ name: c.name, phoneNumber: c.phoneNumber }))
                    : [{ name: "", phoneNumber: "" }],
                isActive: partnerData.isActive ?? true,
            });
        }
    }, [isOpen, partnerData, isEditing]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addContact = () => {
        setFormData((prev) => ({
            ...prev,
            contacts: [...prev.contacts, { name: "", phoneNumber: "" }],
        }));
    };

    const removeContact = (i: number) => {
        setFormData((prev) => ({
            ...prev,
            contacts: prev.contacts.length > 1 ? prev.contacts.filter((_, idx) => idx !== i) : prev.contacts,
        }));
    };

    const updateContact = (i: number, field: keyof IContact, value: string) => {
        setFormData((prev) => {
            const nextContacts = [...prev.contacts];
            nextContacts[i] = { ...nextContacts[i], [field]: value };
            return { ...prev, contacts: nextContacts };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!partner) return;

        const validContacts = formData.contacts.filter((c) => c.name.trim() || c.phoneNumber.trim());
        const { isActive, ...dataWithoutStatus } = formData;
        const data = { ...dataWithoutStatus, contacts: validContacts };

        updatePartner(
            { id: partnerData._id, data },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    onClose();
                },
            }
        );
    };

    if (!partner) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={isEditing ? mdiSquareEditOutline : mdiArchiveEyeOutline} size={0.8} className="flex-shrink-0" />
                        <span>{isEditing ? "Cập nhật đối tác" : "Chi tiết đối tác"}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {isLoading ? (
                        <div className="space-y-3 md:space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    ) : isEditing ? (
                        <form id="edit-partner-form" onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <Label htmlFor="partnerName">Tên đối tác</Label>
                                    <Input
                                        id="partnerName"
                                        value={formData.partnerName}
                                        onChange={(e) => handleChange("partnerName", e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="address">Địa chỉ</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleChange("address", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <Label>Thông tin liên hệ</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addContact}
                                        >
                                            <Icon path={mdiPlus} size={0.8} className="flex-shrink-0" />
                                            Thêm liên hệ
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {formData.contacts.map((c, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    value={c.name}
                                                    onChange={(e) => updateContact(i, "name", e.target.value)}
                                                    placeholder="Họ tên liên hệ"
                                                />
                                                <Input
                                                    value={c.phoneNumber}
                                                    onChange={(e) => updateContact(i, "phoneNumber", e.target.value)}
                                                    placeholder="Số điện thoại"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removeContact(i)}
                                                    disabled={formData.contacts.length <= 1}
                                                    className="flex-shrink-0"
                                                >
                                                    <Icon path={mdiMinus} size={0.8} className="flex-shrink-0" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3 md:space-y-4">
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiDomain} size={0.6} />
                                                    <span>Tên đối tác</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 font-medium whitespace-normal">
                                                {partnerData.partnerName}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[160px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiMapMarkerOutline} size={0.6} />
                                                    <span>Địa chỉ</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-neutral-300 whitespace-normal">
                                                {partnerData.address || "-"}
                                            </TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </Card>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-primary font-semibold text-sm pl-1">
                                    <Icon path={mdiAccountGroupOutline} size={0.8} className="flex-shrink-0" />
                                    <span>Danh sách liên hệ</span>
                                </div>
                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            {partnerData.contacts?.length ? (
                                                partnerData.contacts.map((contact: any, idx: number) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="text-neutral-300 font-medium w-[160px]">
                                                            {contact.name || "Chưa có tên"}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="neutral">{contact.phoneNumber || "Chưa có số điện thoại"}</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={2} className="text-center text-neutral-300 py-4">
                                                        Chưa có thông tin liên hệ
                                                    </TableCell>
                                                </TableRow>
                                            )}
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
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                disabled={isUpdating}
                            >
                                <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                Hủy
                            </Button>
                            <Button
                                form="edit-partner-form"
                                type="submit"
                                disabled={isUpdating}
                            >
                                <Icon
                                    path={isUpdating ? mdiLoading : mdiSquareEditOutline}
                                    size={0.8}
                                    className={isUpdating ? "animate-spin" : ""}
                                />
                                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                                <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                                Đóng
                            </Button>
                            {canUpdate && (
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsEditing(true);
                                    }}
                                    disabled={isLoading || !partnerData}
                                >
                                    <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                    Cập nhật
                                </Button>
                            )}
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
