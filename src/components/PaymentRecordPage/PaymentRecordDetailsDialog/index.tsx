"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/hooks/useAuth";
import {
    useAccountantSign,
    useApproverSign,
    useChiefAccountantSign,
    useConfirmPaid,
    useDepartmentHeadSign,
    useDirectorSign,
    usePaymentRecordDetails,
    useRejectPaymentRecord
} from "@/hooks/usePaymentRecords";
import {
    mdiAccount,
    mdiAccountGroupOutline,
    mdiAccountTie,
    mdiBarcode, mdiCalendar, mdiCashCheck, mdiClose,
    mdiCreditCardSearch,
    mdiDrawPen, mdiFileDocumentOutline, mdiFileExport,
    mdiInformationOutline,
    mdiLayers,
    mdiLinkVariant,
    mdiMapMarker,
    mdiNoteOffOutline, mdiNoteTextOutline, mdiOfficeBuilding,
    mdiPaperclip,
    mdiSquareEditOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface PaymentRecordDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    recordId: string | null;
    onUpdateClick?: () => void;
}

const formatAmount = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const getStatusBadge = (status: string) => {
    switch (status) {
        case "APPROVED": return <Badge variant="green">Đã duyệt</Badge>;
        case "PAID": return <Badge variant="cyan">Đã thanh toán</Badge>;
        case "REJECTED": return <Badge variant="red">Từ chối</Badge>;
        default: return <Badge variant="orange">Chờ duyệt</Badge>;
    }
};

const getTypeBadge = (type: string) => {
    switch (type) {
        case "PAYMENT":
            return <Badge variant="sky">Đề nghị thanh toán</Badge>;
        case "ADVANCE":
            return <Badge variant="teal">Đề nghị tạm ứng</Badge>;
        default:
            return <Badge variant="secondary">{type}</Badge>;
    }
};

const SignRow = ({ label, person, isSigned, signedAt }: {
    label: string;
    person: any;
    isSigned?: boolean;
    signedAt?: string | null;
}) => (
    <TableRow>
        <TableCell className="text-neutral-300 font-semibold w-[220px]">
            <div className="flex items-center gap-2">
                <Icon path={mdiAccountTie} size={0.6} />
                <span>{label}</span>
            </div>
        </TableCell>
        <TableCell>
            <div className="flex flex-col gap-1">
                <Badge variant="neutral">{person?.fullName || "-"}</Badge>
                <div className="flex items-center gap-2">
                    <Badge variant={isSigned ? "green" : "orange"} className="w-fit">
                        {isSigned ? "Đã ký" : "Chờ ký"}
                    </Badge>
                    {signedAt && (
                        <Badge variant="neutral">
                            {format(new Date(signedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                        </Badge>
                    )}
                </div>
            </div>
        </TableCell>
    </TableRow>
);

export function PaymentRecordDetailsDialog({ isOpen, onClose, recordId, onUpdateClick }: PaymentRecordDetailsDialogProps) {
    const { data: response, isLoading, refetch } = usePaymentRecordDetails(recordId || "");
    const { data: profileRes } = useMe();

    const { mutate: accountantSign, isPending: isSigningAccountant } = useAccountantSign();
    const { mutate: approverSign, isPending: isSigningApprover } = useApproverSign();
    const { mutate: directorSign, isPending: isSigningDirector } = useDirectorSign();
    const { mutate: chiefAccountantSign, isPending: isSigningCA } = useChiefAccountantSign();
    const { mutate: departmentHeadSign, isPending: isSigningDH } = useDepartmentHeadSign();
    const { mutate: rejectRecord, isPending: isRejecting } = useRejectPaymentRecord();
    const { mutate: confirmPaid, isPending: isConfirmingPaid } = useConfirmPaid();

    const [notes, setNotes] = useState("");
    const [isConfirmPaidOpen, setIsConfirmPaidOpen] = useState(false);
    const record = response?.data;

    useEffect(() => {
        if (record) {
            setNotes(record.notes || "");
        }
    }, [record]);
    const handleExport = () => {
        if (!record) return;

        const numberToWordsVN = (num: number): string => {
            if (num === 0) return "Không đồng";
            const ones = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
            const teens = ["mười", "mười một", "mười hai", "mười ba", "mười bốn", "mười lăm",
                "mười sáu", "mười bảy", "mười tám", "mười chín"];
            const tens = ["", "", "hai mươi", "ba mươi", "bốn mươi", "năm mươi",
                "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];

            const readHundreds = (n: number): string => {
                if (n === 0) return "";
                const h = Math.floor(n / 100);
                const rest = n % 100;
                let result = h > 0 ? ones[h] + " trăm" : "";
                if (rest === 0) return result.trim();
                if (rest < 10) return (result + (result ? " linh " : "") + ones[rest]).trim();
                if (rest < 20) return (result + (result ? " " : "") + teens[rest - 10]).trim();
                const t = Math.floor(rest / 10);
                const o = rest % 10;
                return (result + (result ? " " : "") + tens[t] + (o > 0 ? " " + (o === 5 ? "lăm" : ones[o]) : "")).trim();
            };

            const billion = Math.floor(num / 1_000_000_000);
            const million = Math.floor((num % 1_000_000_000) / 1_000_000);
            const thousand = Math.floor((num % 1_000_000) / 1_000);
            const rest = num % 1_000;

            const parts: string[] = [];
            if (billion > 0) parts.push(readHundreds(billion) + " tỷ");
            if (million > 0) parts.push(readHundreds(million) + " triệu");
            if (thousand > 0) parts.push(readHundreds(thousand) + " ngàn");
            if (rest > 0) parts.push(readHundreds(rest));

            const result = parts.join(", ");
            return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
        };

        const wordDocDate = format(new Date(record.createdAt), "'Ngày' dd 'tháng' MM 'năm' yyyy");
        const createdAtFormatted = format(new Date(record.createdAt), "dd/MM/yyyy");
        const requesterName = requester?.fullName || record.requesterName || "";
        const requesterCode = requester?.employeeCode || "";
        const amountFormatted = formatAmount(record.amount);
        const plainAmount = new Intl.NumberFormat("vi-VN").format(record.amount) + " đồng";
        const amountInWords = numberToWordsVN(record.amount);

        let htmlContent = "";

        if (record.type === "ADVANCE") {
            const directorName = director?.fullName || "";
            const chiefAccountantName = chiefAccountant?.fullName || "";
            const departmentHeadName = departmentHead?.fullName || "";
            const directorSig = record.isDirectorSigned && (director as any)?.digitalSignature ? (director as any).digitalSignature : "";
            const chiefAccountantSig = record.isChiefAccountantSigned && (chiefAccountant as any)?.digitalSignature ? (chiefAccountant as any).digitalSignature : "";
            const departmentHeadSig = record.isDepartmentHeadSigned && (departmentHead as any)?.digitalSignature ? (departmentHead as any).digitalSignature : "";
            const requesterSig = (requester as any)?.digitalSignature || "";
            const requesterPosition = (requester as any)?.position || "";
            const requesterDepartment = (requester as any)?.department || "";

            htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="UTF-8">
    <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
    <style>
        @page Section1 { size: 21cm 29.7cm; margin: 2cm 2cm; }
        div.Section1 { page: Section1; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; }
        table { border-collapse: collapse; }
        td { vertical-align: top; }
        .sig-row td { text-align: center; width: 25%; padding: 5px; }
        .sig-img { height: 80px; text-align: center; }
    </style>
</head>
<body>
<div class="Section1">
    <table cellspacing="0" cellpadding="0" style="border-collapse:collapse; width:100%;">
        <tbody>
            <tr>
                <td style="width:186pt; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; font-size:13pt;"><strong>CÔNG TY TNHH GIẢI PHÁP</strong><br><strong>TỰ ĐỘNG ĐIỆN</strong></p>
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; font-size:13pt;"><em>Số:&nbsp;&nbsp;${record.recordCode || "............"}</em></p>
                </td>
                <td style="width:295.2pt; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; font-size:13pt;"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br><strong>Độc lập – Tự do – Hạnh phúc</strong></p>
                </td>
            </tr>
        </tbody>
    </table>

    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; font-size:16pt;"><strong>&nbsp;</strong></p>
    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:150%; font-size:18pt;"><strong>GIẤY ĐỀ NGHỊ TẠM ỨNG TIỀN CÔNG TRÌNH</strong></p>
    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:150%; font-size:13pt;"><em>${wordDocDate}</em></p>

    <p style="margin-top:0pt; margin-bottom:0pt; font-size:13pt;"><strong>Kính gửi</strong>:<span style="width:19.04pt; display:inline-block;">&nbsp;</span>-&nbsp;&nbsp;&nbsp; Ban Giám đốc Công ty TNHH Giải pháp tự động điện</p>
    <p style="margin-top:0pt; margin-left:90pt; margin-bottom:0pt; text-indent:-18pt; font-size:13pt;">-<span style="width:13.67pt; font:7pt 'Times New Roman'; display:inline-block;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>Phòng Tài chính – Kế toán</p>

    <p style="margin-top:6pt; margin-bottom:0pt; line-height:150%; font-size:13pt;">Tôi tên là: ${requesterName}</p>
    <p style="margin-top:0pt; margin-bottom:0pt; line-height:150%; font-size:13pt;">Chức vụ: ${requesterPosition || "............................................"}</p>
    <p style="margin-top:0pt; margin-bottom:0pt; line-height:150%; font-size:13pt;">Đơn vị công tác: ${requesterDepartment || "............................................"}</p>
    <p style="margin-top:0pt; margin-bottom:0pt; line-height:150%; font-size:13pt;">Số CMND/CCCD:…………………ngày cấp………………nơi cấp…………………………………</p>
    <p style="margin-top:0pt; margin-bottom:0pt; line-height:150%; font-size:13pt;">Hiện tôi đang tham gia thực hiện công trình: ${record.projectName || "............................................"}.</p>
    ${record.projectAddress ? `<p style="margin-top:0pt; margin-bottom:0pt; line-height:150%; font-size:13pt;">(Địa chỉ công trình: ${record.projectAddress})</p>` : ""}
    <p style="margin-top:0pt; margin-bottom:0pt; line-height:150%; font-size:13pt;">Nay tôi làm đơn này kính đề nghị Ban Giám đốc công ty và Phòng Tài chính – Kế toán xem xét, tạm ứng cho tôi số tiền là: ${plainAmount}. (Bằng chữ: ${amountInWords}).</p>

    <p style="margin-top:20pt; margin-bottom:0pt; text-align:center; font-size:13pt;">
        <strong>Giám đốc</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <strong>Kế toán trưởng</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <strong>Phụ trách bộ phận</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <strong>Người đề nghị</strong>
    </p>
    <p style="margin-top:0pt; margin-bottom:0pt; font-size:13pt;">
        Duyệt tạm ứng:…….&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <em>(Ký, họ tên)</em>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <em>(Ký, họ tên)</em>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <strong>tạm ứng</strong>
    </p>
    <p style="margin-top:0pt; margin-bottom:0pt; font-size:13pt;"><em>(Ký, họ tên)</em></p>

    <table cellspacing="0" cellpadding="0" style="border-collapse:collapse; width:100%; margin-top:10px;">
        <tbody>
            <tr class="sig-row">
                <td style="text-align:center; width:25%; padding:5px;">
                    <div class="sig-img">${directorSig ? `<img src="${directorSig}" width="140" height="70" />` : "&nbsp;"}</div>
                    <strong>${directorName}</strong>
                </td>
                <td style="text-align:center; width:25%; padding:5px;">
                    <div class="sig-img">${chiefAccountantSig ? `<img src="${chiefAccountantSig}" width="140" height="70" />` : "&nbsp;"}</div>
                    <strong>${chiefAccountantName}</strong>
                </td>
                <td style="text-align:center; width:25%; padding:5px;">
                    <div class="sig-img">${departmentHeadSig ? `<img src="${departmentHeadSig}" width="140" height="70" />` : "&nbsp;"}</div>
                    <strong>${departmentHeadName}</strong>
                </td>
                <td style="text-align:center; width:25%; padding:5px;">
                    <div class="sig-img">${requesterSig ? `<img src="${requesterSig}" width="140" height="70" />` : "&nbsp;"}</div>
                    <strong>${requesterName}</strong>
                </td>
            </tr>
        </tbody>
    </table>
</div>
</body>
</html>`;
        } else {
            const accountantName = accountant?.fullName || "";
            const approverName = approver?.fullName || "";
            const accountantSig = record.isAccountantSigned && (accountant as any)?.digitalSignature ? (accountant as any).digitalSignature : "";
            const approverSig = record.isApproverSigned && (approver as any)?.digitalSignature ? (approver as any).digitalSignature : "";
            const requesterSig = (requester as any)?.digitalSignature || "";

            htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="UTF-8">
    <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
    <style>
        @page Section1 { size: 21cm 29.7cm; margin: 2cm 2cm; }
        div.Section1 { page: Section1; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; line-height: 1.5; }
        table { border-collapse: collapse; }
        td { vertical-align: top; }
        .sig-img { height: 80px; text-align: center; }
    </style>
</head>
<body>
<div class="Section1">
    <table cellspacing="0" cellpadding="0" style="width:100%; border-collapse:collapse;">
        <tbody>
            <tr>
                <td style="width:187.7pt; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; line-height:150%; font-size:13.5pt;"><strong>CÔNG TY TNHH GIẢI PHÁP TỰ ĐỘNG ĐIỆN</strong></p>
                </td>
                <td style="width:286.65pt; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; font-size:13.5pt;"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p>
                    <p style="margin-top:0pt; margin-bottom:0pt; text-align:center; font-size:13.5pt;"><strong>Độc lập – Tự do – Hạnh phúc</strong></p>
                </td>
            </tr>
        </tbody>
    </table>

    <p style="margin-top:6pt; margin-bottom:6pt; font-size:14pt;">&nbsp;</p>
    <p style="margin-top:6pt; margin-bottom:6pt; text-align:center; font-size:18pt;"><strong>GIẤY ĐỀ NGHỊ THANH TOÁN</strong></p>
    <p style="margin-top:6pt; margin-bottom:6pt; text-align:center; font-size:14pt;"><em>${wordDocDate}</em></p>

    <p style="margin-top:6pt; margin-bottom:6pt; font-size:14pt;">&nbsp;</p>
    <p style="margin-top:6pt; margin-left:18pt; margin-bottom:6pt; line-height:150%; font-size:14pt;">Kính gửi: BLĐ Công ty TNHH Giải Pháp Tự Động Điện</p>
    <p style="margin-top:6pt; margin-left:18pt; margin-bottom:6pt; line-height:150%; font-size:14pt;">Họ và tên người đề nghị thanh toán: ${requesterName}</p>
    <p style="margin-top:6pt; margin-left:18pt; margin-bottom:6pt; line-height:150%; font-size:14pt;">Nội dung thanh toán: ${record.content || ""}</p>
    <p style="margin-top:6pt; margin-left:18pt; margin-bottom:6pt; line-height:150%; font-size:14pt;">Số tiền: ${plainAmount}</p>
    <p style="margin-top:6pt; margin-left:18pt; margin-bottom:6pt; line-height:150%; font-size:14pt;">Viết bằng chữ: ${amountInWords}.</p>
    ${record.attachment ? `<p style="margin-top:6pt; margin-left:18pt; margin-bottom:6pt; line-height:150%; font-size:14pt;">Kèm theo: ${record.attachment}</p>` : ""}

    <table cellspacing="0" cellpadding="0" style="margin-right:auto; margin-left:auto; border-collapse:collapse; width:100%;">
        <tbody>
            <tr>
                <td style="width:159.05pt; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                    <p style="margin-top:6pt; margin-bottom:6pt; text-align:center; line-height:150%; font-size:14pt;"><strong>Người đề nghị thanh toán</strong><br><em>(Ký, họ tên)</em></p>
                    <div class="sig-img">${requesterSig ? `<img src="${requesterSig}" width="140" height="70" />` : "&nbsp;"}</div>
                    <strong>${requesterName}</strong>
                </td>
                <td style="width:130.85pt; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                    <p style="margin-top:6pt; margin-bottom:6pt; text-align:center; line-height:150%; font-size:14pt;"><strong>Kế Toán</strong><br><em>(Ký, họ tên)</em></p>
                    <div class="sig-img">${accountantSig ? `<img src="${accountantSig}" width="140" height="70" />` : "&nbsp;"}</div>
                    <strong>${accountantName}</strong>
                </td>
                <td style="width:144.95pt; padding-right:5.4pt; padding-left:5.4pt; vertical-align:top;">
                    <p style="margin-top:6pt; margin-left:18pt; margin-bottom:6pt; text-align:center; line-height:150%; font-size:14pt;"><strong>Người duyệt</strong><br><em>(Ký, họ tên)</em></p>
                    <div class="sig-img">${approverSig ? `<img src="${approverSig}" width="140" height="70" />` : "&nbsp;"}</div>
                    <strong>${approverName}</strong>
                </td>
            </tr>
        </tbody>
    </table>
</div>
</body>
</html>`;
        }

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        const fileName = record.type === "ADVANCE"
            ? `Ho_So_Tam_Ung_${record._id}.doc`
            : `Ho_So_Thanh_Toan_${record._id}.doc`;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        if (isOpen && recordId) refetch();
    }, [isOpen, recordId, refetch]);

    if (!recordId) return null;

    const profile = profileRes?.data?.user;
    const position = profile?.position || "";

    const requester = record?.requesterId && typeof record.requesterId === "object" ? record.requesterId : null;
    const accountant = record?.accountantId && typeof record.accountantId === "object" ? record.accountantId : null;
    const approver = record?.approverId && typeof record.approverId === "object" ? record.approverId : null;
    const director = record?.directorId && typeof record.directorId === "object" ? record.directorId : null;
    const chiefAccountant = record?.chiefAccountantId && typeof record.chiefAccountantId === "object" ? record.chiefAccountantId : null;
    const departmentHead = record?.departmentHeadId && typeof record.departmentHeadId === "object" ? record.departmentHeadId : null;

    const handleSign = (signFn: any) => {
        if (!recordId) return;
        signFn({ id: recordId, notes }, { onSuccess: () => refetch() });
    };

    const isSignedByDirector = record?.type === "PAYMENT" ? record?.isApproverSigned : record?.isDirectorSigned;
    const canReject = record?.status === "PENDING" && position.includes("Giám đốc") && !isSignedByDirector;

    const handleReject = () => {
        if (!recordId) return;
        if (!notes.trim()) {
            toast.warning("Vui lòng nhập lý do từ chối vào mục ghi chú");
            return;
        }
        rejectRecord({ id: recordId, notes }, { onSuccess: () => refetch() });
    };


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent size="medium">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Icon path={mdiFileDocumentOutline} size={0.8} className="flex-shrink-0" />
                        <span>Chi tiết hồ sơ thanh toán</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <LoadingSpinner />
                        </div>
                    ) : record ? (
                        <div className="space-y-3 md:space-y-4">
                            {/* Thông tin chung */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-primary font-semibold whitespace-nowrap">Thông tin hồ sơ</h3>
                                <div className="flex-1 border-b border-dashed border-primary mr-1" />
                            </div>
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiBarcode} size={0.6} />
                                                    <span>Mã hồ sơ</span>
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge variant="green">{record.recordCode || "—"}</Badge></TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiLayers} size={0.6} />
                                                    <span>Loại hồ sơ</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getTypeBadge(record.type)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiInformationOutline} size={0.6} />
                                                    <span>Trạng thái</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiCreditCardSearch} size={0.6} />
                                                    <span>Số tiền</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">{formatAmount(record.amount)}</Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiCalendar} size={0.6} />
                                                    <span>Ngày tạo</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">
                                                    {format(new Date(record.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>

                                        {/* PAYMENT-specific */}
                                        {record.type === "PAYMENT" && (
                                            <>
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiNoteTextOutline} size={0.6} />
                                                            <span>Nội dung</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">
                                                        {record.content || "—"}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiPaperclip} size={0.6} />
                                                            <span>Kèm theo</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {record.attachment ? (
                                                            <span className="text-neutral-300">{record.attachment}</span>
                                                        ) : (
                                                            <div className="text-neutral-300 text-sm italic flex items-center gap-1">
                                                                <Icon path={mdiNoteOffOutline} size={0.8} className="flex-shrink-0" />
                                                                Không có tài liệu đính kèm
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            </>
                                        )}

                                        {/* ADVANCE-specific */}
                                        {record.type === "ADVANCE" && (
                                            <>
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiOfficeBuilding} size={0.6} />
                                                            <span>Tên công trình</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">
                                                        {record.projectName || "—"}
                                                    </TableCell>
                                                </TableRow>
                                                {record.projectAddress && (
                                                    <TableRow>
                                                        <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                            <div className="flex items-center gap-2">
                                                                <Icon path={mdiMapMarker} size={0.6} />
                                                                <span>Địa chỉ công trình</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-neutral-300">
                                                            {record.projectAddress}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </>
                                        )}

                                        {/* Attachment File - common to both */}
                                        {record.attachmentFile && (
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiLinkVariant} size={0.6} />
                                                        <span>Tệp đính kèm</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={record.attachmentFile}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline underline-offset-4"
                                                    >
                                                        <Icon path={mdiLinkVariant} size={0.8} className="flex-shrink-0" />
                                                        <span className="text-sm underline break-all">Xem tài liệu đính kèm</span>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>

                            {/* Người đề nghị */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-primary font-semibold whitespace-nowrap">Người đề nghị</h3>
                                <div className="flex-1 border-b border-dashed border-primary mr-1" />
                            </div>
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                <div className="flex items-center gap-2">
                                                    <Icon path={mdiAccount} size={0.6} />
                                                    <span>Họ và tên</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="neutral">
                                                    {requester?.fullName || record.requesterName || "—"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        {requester?.employeeCode && (
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiBarcode} size={0.6} />
                                                        <span>Mã nhân viên</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell><Badge variant="neutral">{requester.employeeCode}</Badge></TableCell>
                                            </TableRow>
                                        )}
                                        {requester?.department && (
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiAccountGroupOutline} size={0.6} />
                                                        <span>Phòng ban</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">{requester.department}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        {requester?.position && (
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                    <div className="flex items-center gap-2">
                                                        <Icon path={mdiAccountTie} size={0.6} />
                                                        <span>Vị trí</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">{requester.position}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>

                            {/* Ký duyệt */}
                            <div className="flex items-center gap-3 md:gap-4">
                                <h3 className="text-primary font-semibold whitespace-nowrap">Trạng thái ký duyệt</h3>
                                <div className="flex-1 border-b border-dashed border-primary mr-1" />
                            </div>
                            <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                <Table>
                                    <TableBody>
                                        {record.type === "PAYMENT" && (
                                            <>
                                                <SignRow
                                                    label="Kế toán"
                                                    person={accountant}
                                                    isSigned={record.isAccountantSigned}
                                                    signedAt={record.accountantSignedAt}
                                                />
                                                <SignRow
                                                    label="Người duyệt"
                                                    person={approver}
                                                    isSigned={record.isApproverSigned}
                                                    signedAt={record.approverSignedAt}
                                                />
                                            </>
                                        )}
                                        {record.type === "ADVANCE" && (
                                            <>
                                                <SignRow
                                                    label="Giám đốc"
                                                    person={director}
                                                    isSigned={record.isDirectorSigned}
                                                    signedAt={record.directorSignedAt}
                                                />
                                                <SignRow
                                                    label="Kế toán trưởng"
                                                    person={chiefAccountant}
                                                    isSigned={record.isChiefAccountantSigned}
                                                    signedAt={record.chiefAccountantSignedAt}
                                                />
                                                <SignRow
                                                    label="Phụ trách bộ phận"
                                                    person={departmentHead}
                                                    isSigned={record.isDepartmentHeadSigned}
                                                    signedAt={record.departmentHeadSignedAt}
                                                />
                                            </>
                                        )}
                                    </TableBody>
                                </Table>
                            </Card>

                            {/* Ghi chú & Từ chối — Only show if user can reject or has existing notes */}
                            {(canReject || record.notes) && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <h3 className="text-primary font-semibold whitespace-nowrap">
                                            {canReject ? "Ghi chú hoặc Nhập lý do từ chối" : "Ghi chú / Lý do từ chối"}
                                        </h3>
                                        <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                    </div>
                                    <Textarea
                                        placeholder={canReject ? "Nhập ghi chú hoặc lý do từ chối..." : ""}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        readOnly={!canReject}
                                        rows={4}
                                    />
                                    {record.status === "REJECTED" && (
                                        <p className="text-red-400 text-sm italic">* Hồ sơ này đã bị từ chối.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-neutral-300">
                            Không tìm thấy thông tin hồ sơ thanh toán
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                        Đóng
                    </Button>

                    {record && (
                        <>
                            {record.status !== "REJECTED" && (
                                <Button type="button" onClick={handleExport}>
                                    <Icon path={mdiFileExport} size={0.8} className="flex-shrink-0" />
                                    Xuất file Word
                                </Button>
                            )}

                            {/* Sign buttons — PAYMENT type */}
                            {record?.type === "PAYMENT" && !record.isAccountantSigned && position.toLowerCase().includes("kế toán") && (
                                <Button
                                    type="button"
                                    onClick={() => handleSign(accountantSign)}
                                    disabled={isSigningAccountant}
                                >
                                    <Icon path={mdiDrawPen} size={0.8} className="flex-shrink-0" />
                                    Kế toán xác nhận ký
                                </Button>
                            )}
                            {record?.type === "PAYMENT" && !record.isApproverSigned && (position.toLowerCase().includes("giám đốc") || position.toLowerCase().includes("kế toán trưởng")) && (
                                <Button
                                    type="button"
                                    onClick={() => handleSign(approverSign)}
                                    disabled={isSigningApprover}
                                >
                                    <Icon path={mdiDrawPen} size={0.8} className="flex-shrink-0" />
                                    Người duyệt xác nhận ký
                                </Button>
                            )}

                            {/* Sign buttons — ADVANCE type */}
                            {record?.type === "ADVANCE" && !record.isDirectorSigned && position.toLowerCase().includes("giám đốc") && (
                                <Button
                                    type="button"
                                    onClick={() => handleSign(directorSign)}
                                    disabled={isSigningDirector}
                                >
                                    <Icon path={mdiDrawPen} size={0.8} className="flex-shrink-0" />
                                    Giám đốc xác nhận ký
                                </Button>
                            )}
                            {record?.type === "ADVANCE" && !record.isChiefAccountantSigned && position.toLowerCase().includes("kế toán") && (
                                <Button
                                    type="button"
                                    onClick={() => handleSign(chiefAccountantSign)}
                                    disabled={isSigningCA}
                                >
                                    <Icon path={mdiDrawPen} size={0.8} className="flex-shrink-0" />
                                    Kế toán xác nhận ký
                                </Button>
                            )}
                            {record?.type === "ADVANCE" && !record.isDepartmentHeadSigned && position.toLowerCase().includes("tổ trưởng") && (
                                <Button
                                    type="button"
                                    onClick={() => handleSign(departmentHeadSign)}
                                    disabled={isSigningDH}
                                >
                                    <Icon path={mdiDrawPen} size={0.8} className="flex-shrink-0" />
                                    Phụ trách bộ phận xác nhận ký
                                </Button>
                            )}

                            {/* Reject button — Only if allowed (Director and not yet signed) */}
                            {canReject && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleReject}
                                    disabled={isRejecting}
                                >
                                    <Icon path={mdiNoteOffOutline} size={0.8} className="flex-shrink-0" />
                                    Từ chối hồ sơ
                                </Button>
                            )}
                            <Button
                                type="button"
                                onClick={onUpdateClick}
                            >
                                <Icon path={mdiSquareEditOutline} size={0.8} className="flex-shrink-0" />
                                Cập nhật hồ sơ
                            </Button>

                            {record.status === "APPROVED" && position.toLowerCase().includes("kế toán") && (
                                <Button
                                    type="button"
                                    onClick={() => setIsConfirmPaidOpen(true)}
                                >
                                    <Icon path={mdiCashCheck} size={0.8} />
                                    Xác nhận đã thanh toán
                                </Button>
                            )}
                        </>
                    )}
                </DialogFooter>

                <ConfirmDialog
                    isOpen={isConfirmPaidOpen}
                    onClose={() => setIsConfirmPaidOpen(false)}
                    onConfirm={() => {
                        if (recordId) {
                            confirmPaid(recordId, {
                                onSuccess: () => {
                                    refetch();
                                    setIsConfirmPaidOpen(false);
                                }
                            });
                        }
                    }}
                    title="Xác nhận thanh toán"
                    description="Bạn có chắc chắn muốn xác nhận hồ sơ này đã được thanh toán? Trạng thái sẽ chuyển sang 'Đã thanh toán'."
                    confirmText="Đồng ý thanh toán"
                    isPending={isConfirmingPaid}
                />
            </DialogContent>
        </Dialog>
    );
}
