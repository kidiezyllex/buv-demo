"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useMe } from "@/hooks/useAuth";
import {
    useBorrowDetails,
    useStorekeeperSign,
    useTechnicalStaffSign,
    useUnitHeadSign
} from "@/hooks/useEquipment";
import { IBorrowReturn } from "@/interface/equipment";
import { formatDateOnly, formatDateWithTime } from "@/lib/format";
import {
    mdiAccount,
    mdiAccountTie,
    mdiArchiveEyeOutline,
    mdiBarcode,
    mdiClose,
    mdiDrawPen,
    mdiFileExport,
    mdiImageRemoveOutline,
    mdiOfficeBuilding,
    mdiPackageDown,
    mdiPhone,
    mdiPrinter
} from "@mdi/js";
import Icon from "@mdi/react";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ReturnDialog } from "../ReturnDialog";

interface BorrowDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    recordId: string | null;
}

export function BorrowDetailsDialog({ isOpen, onClose, recordId }: BorrowDetailsDialogProps) {
    const { data: response, isLoading, refetch } = useBorrowDetails(recordId || "");
    const { data: profile } = useMe();
    const [isReturnOpen, setIsReturnOpen] = useState(false);

    const { mutate: storekeeperSign, isPending: isSignStorekeeperPending } = useStorekeeperSign();
    const { mutate: unitHeadSign, isPending: isSignUnitHeadPending } = useUnitHeadSign();
    const { mutate: technicalStaffSign, isPending: isSignTechnicalStaffPending } = useTechnicalStaffSign();

    const handleStorekeeperSign = () => {
        if (!recordId) return;
        storekeeperSign(recordId, {
            onSuccess: () => refetch()
        });
    };

    const handleUnitHeadSign = () => {
        if (!recordId) return;
        unitHeadSign(recordId, {
            onSuccess: () => refetch()
        });
    };

    const handleTechnicalStaffSign = () => {
        if (!recordId) return;
        technicalStaffSign(recordId, {
            onSuccess: () => refetch()
        });
    };

    useEffect(() => {
        if (isOpen && recordId) {
            refetch();
        }
    }, [isOpen, recordId, refetch]);

    const record: IBorrowReturn | undefined = response?.data;
    const printRef = useRef<HTMLDivElement>(null);

    // Extract nested data for borrower
    const borrower = record?.borrowerId && typeof record.borrowerId === 'object' ? record.borrowerId : null;
    const borrowerName = borrower?.fullName || record?.borrowerName || "---";
    const borrowerCode = borrower?.employeeCode || "";
    const department = borrower?.department || "";
    const position = borrower?.position || "";
    const phoneNumber = borrower?.phoneNumber || "";

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const windowPrint = window.open('', '', 'width=900,height=900');
        if (!windowPrint) return;

        windowPrint.document.write(`
            <html>
                <head>
                    <title>In phiếu mượn trả</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; color: #333; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                        .section { margin-bottom: 20px; }
                        .section-title { font-weight: bold; border-bottom: 1px dashed #666; margin-bottom: 10px; padding-bottom: 5px; color: #000; }
                        table { width: 100%; border-collapse: collapse; }
                        td, th { padding: 8px; border-bottom: 1px solid #eee; text-align: left; }
                        th { background: #f4f4f4; }
                        .label { width: 200px; font-weight: 600; color: #555; }
                        .value { color: #000; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>PHIẾU MƯỢN TRẢ THIẾT BỊ</h1>
                        <p>Ngày in: ${format(new Date(), "dd/MM/yyyy HH:mm")}</p>
                    </div>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        windowPrint.document.close();

        // Wait for images to load if any
        setTimeout(() => {
            windowPrint.focus();
            windowPrint.print();
            windowPrint.close();
        }, 500);
    };

    const handleExport = () => {
        if (!record) return;

        const borrowDateFormatted = format(new Date(record.borrowDate), "dd/MM/yyyy");
        const expectedReturnDateFormatted = record.expectedReturnDate
            ? format(new Date(record.expectedReturnDate), "dd/MM/yyyy")
            : "....................................................................";
        const items = record.items || [];
        const itemsHtml = items.map((item, index) => {
            const eqCode = item.equipmentCode || (typeof item.equipmentId === 'object' ? item.equipmentId?.equipmentCode : '');
            const eqName = item.equipmentName || (typeof item.equipmentId === 'object' ? item.equipmentId?.equipmentName : '');
            const serial = typeof item.equipmentId === 'object' ? item.equipmentId?.serialNumber : '';
            const returnDateStr = item.returnDate ? format(new Date(item.returnDate), "dd/MM/yyyy") : "";

            return `
                <tr>
                    <td style="text-align: center;">${index + 1}</td>
                    <td>${eqName}</td>
                    <td style="text-align: center;">${eqCode}</td>
                    <td style="text-align: center;">${serial}</td>
                    <td style="text-align: center;">Cái</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td>${item.borrowCondition || ""}</td>
                    <td style="text-align: center;">${returnDateStr}</td>
                    <td>${item.returnCondition || ""}</td>
                    <td>${record.notes || ""}</td>
                </tr>
            `;
        }).join('');

        const storekeeper = record.storekeeperId && typeof record.storekeeperId === 'object' ? (record.storekeeperId as any) : null;
        const storekeeperName = storekeeper?.fullName || "";
        const storekeeperSignature = record.isStorekeeperSigned && storekeeper?.digitalSignature ? storekeeper.digitalSignature : "";

        const technicalStaff = record.technicalStaffId && typeof record.technicalStaffId === 'object' ? (record.technicalStaffId as any) : null;
        const technicalStaffName = technicalStaff?.fullName || "";
        const technicalStaffSignature = record.isTechnicalStaffSigned && technicalStaff?.digitalSignature ? technicalStaff.digitalSignature : "";

        const unitHead = record.unitHeadId && typeof record.unitHeadId === 'object' ? (record.unitHeadId as any) : null;
        const unitHeadName = unitHead?.fullName || "";
        const unitHeadSignature = record.isUnitHeadSigned && unitHead?.digitalSignature ? unitHead.digitalSignature : "";

        const htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="UTF-8">
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        @page Section1 {
            size: 29.7cm 21cm;
            margin: 1.5cm 1.5cm;
            mso-page-orientation: landscape;
        }
        div.Section1 {
            page: Section1;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 13pt;
            line-height: 1.2;
        }
        .header-table {
            width: 100%;
            border: none;
            margin-bottom: 5px;
        }
        .header-table td {
            border: none;
            padding: 0;
            vertical-align: middle;
        }
        .info-section {
            margin-bottom: 5px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
        }
        table.data-table th, table.data-table td {
            border: 1px solid black;
            padding: 5px;
            font-size: 13pt;
        }
        table.data-table th {
            background-color: #f2f2f2;
            text-align: center;
            font-weight: bold;
        }
        .signatures-table {
            width: 100%;
            border: none;
            margin-top: 20px;
        }
        .signatures-table td {
            border: none;
            text-align: center;
            font-weight: bold;
            width: 25%;
            vertical-align: middle;
            padding: 5px;
        }
    </style>
</head>
<body>
<div class="Section1">
    <table class="header-table">
        <tr>
            <td style="width: 25%; font-weight: bold; font-size: 13pt;">Công ty: TNHH Giải Pháp Tự Động Điện</td>
            <td style="width: 50%; text-align: center; font-weight: bold; font-size: 18pt; text-transform: uppercase;">
                PHIẾU ĐIỀU ĐỘNG THIẾT BỊ - DỤNG CỤ
            </td>
            <td style="width: 25%;"></td>
        </tr>
    </table>

    <table class="header-table">
        <tr>
            <td style="width: 65%;">
                <strong>1. Tên công trình:</strong> ${record.projectName || "...................................................................."}
            </td>
            <td style="width: 35%; text-align: right; font-weight: bold;">
                Nhóm trưởng: ${borrowerName}
            </td>
        </tr>
    </table>

    <div class="info-section">
        <strong>2. Thời gian mượn:</strong> Từ ngày ${borrowDateFormatted} đến ngày ${expectedReturnDateFormatted}.
    </div>
    <div class="info-section">
        <strong>3. Tổ / Nhóm trưởng có trách nhiệm phân công người sử dụng bảo quản thiết bị tốt và giao về kho đúng ngày. </strong>
    </div>

    <table class="data-table">
        <thead>
            <tr>
                <th rowspan="2">STT</th>
                <th rowspan="2">Tên thiết bị - dụng cụ</th>
                <th rowspan="2">Mã số</th>
                <th rowspan="2">Số chế tạo</th>
                <th rowspan="2">ĐVT</th>
                <th colspan="2">Bàn giao thiết bị, dụng cụ</th>
                <th colspan="2">Trả lại thiết bị, dụng cụ</th>
                <th rowspan="2">Ghi chú</th>
            </tr>
            <tr>
                <th style="width: 60px;">SL</th>
                <th>Tình trạng</th>
                <th style="width: 90px;">Ngày trả</th>
                <th>Tình trạng</th>
            </tr>
        </thead>
        <tbody>
            ${itemsHtml}
        </tbody>
    </table>

    <table class="signatures-table">
        <tr>
            <td>NGƯỜI SỬ DỤNG</td>
            <td>TRƯỞNG NHÓM</td>
            <td>THỦ KHO</td>
            <td>KỸ THUẬT</td>
        </tr>
        <tr>
            <td style="height: 80px;">
                ${(borrower as any)?.digitalSignature ? `<img src="${(borrower as any).digitalSignature}" width="140" height="70" />` : ""}
            </td>
            <td style="height: 80px;"></td>
            <td style="height: 80px;">
                ${storekeeperSignature ? `<img src="${storekeeperSignature}" width="140" height="70" />` : ""}
            </td>
            <td style="height: 80px;">
                ${technicalStaffSignature ? `<img src="${technicalStaffSignature}" width="140" height="70" />` : ""}
            </td>
        </tr>
        <tr>
            <td>${borrowerName}</td>
            <td></td>
            <td>${storekeeperName}</td>
            <td>${technicalStaffName}</td>
        </tr>
    </table>

    <div style="text-align: center; font-weight: bold; margin-top: 40px; font-size: 13pt; text-transform: uppercase;">
        THỦ TRƯỞNG ĐƠN VỊ
        <div style="height: 80px; margin: 10px 0;">
            ${unitHeadSignature ? `<img src="${unitHeadSignature}" width="140" height="70" />` : ""}
        </div>
        <div style="font-weight: bold;">${unitHeadName}</div>
    </div>
</div>
</body>
</html>`;

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Phieu_Dieu_Dong_Thiet_Bi_${record._id}.doc`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (!recordId) return null;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "returned":
                return <Badge variant="green">Đã trả</Badge>;
            case "partially_returned":
                return <Badge variant="blue">Trả một phần</Badge>;
            case "overdue":
                return <Badge variant="red">Quá hạn</Badge>;
            case "borrowed":
                return <Badge variant="orange">Đã mượn</Badge>;
            case "pending":
                return <Badge variant="orange">Chờ duyệt</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <>
            <Dialog open={isOpen && !isReturnOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent size="medium">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary">
                            <Icon path={mdiArchiveEyeOutline} size={0.8} className="flex-shrink-0" />
                            <span>Chi tiết phiếu mượn trả</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar p-3 md:p-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-10">
                                <LoadingSpinner />
                            </div>
                        ) : record ? (
                            <div className="space-y-3 md:space-y-4" ref={printRef}>
                                {/* Thông tin mượn & Ghi chú */}
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Thông tin mượn</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>
                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">Tên công trình</TableCell>
                                                <TableCell className="text-neutral-300">
                                                    <Badge variant="green">
                                                        {record.projectName || "-"}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">Ngày mượn</TableCell>
                                                <TableCell>
                                                    <Badge variant="neutral">{formatDateWithTime(record.borrowDate)}</Badge>
                                                </TableCell>
                                            </TableRow>
                                            {record.expectedReturnDate && (
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">Ngày trả dự kiến</TableCell>
                                                    <TableCell>
                                                        <Badge variant="neutral">{formatDateOnly(record.expectedReturnDate)}</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">Trạng thái phiếu</TableCell>
                                                <TableCell>{getStatusBadge(record.status)}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-neutral-300 font-semibold w-[220px]">Ghi chú bổ sung</TableCell>
                                                <TableCell>
                                                    {record.notes ? (
                                                        <span className="text-neutral-300 italic">{record.notes}</span>
                                                    ) : (
                                                        <span className="text-neutral-400 italic">
                                                            Không có ghi chú
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Card>

                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Thông tin người mượn</h3>
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
                                                        {borrowerName}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                            {borrowerCode && (
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiBarcode} size={0.6} />
                                                            <span>Mã nhân viên</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell><Badge variant="green">{borrowerCode}</Badge></TableCell>
                                                </TableRow>
                                            )}
                                            {department && (
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiOfficeBuilding} size={0.6} />
                                                            <span>Phòng ban</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell><Badge variant="neutral">{department}</Badge></TableCell>
                                                </TableRow>
                                            )}
                                            {position && (
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiAccountTie} size={0.6} />
                                                            <span>Chức vụ</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell><Badge variant="neutral">{position}</Badge></TableCell>
                                                </TableRow>
                                            )}
                                            {phoneNumber && (
                                                <TableRow>
                                                    <TableCell className="text-neutral-300 font-semibold w-[220px]">
                                                        <div className="flex items-center gap-2">
                                                            <Icon path={mdiPhone} size={0.6} />
                                                            <span>Số điện thoại</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell><Badge variant="neutral">{phoneNumber}</Badge></TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>

                                {/* Danh sách dụng cụ */}
                                <div className="flex items-center gap-3 md:gap-4">
                                    <h3 className="text-primary font-semibold whitespace-nowrap">Danh sách dụng cụ ({record.items?.length || 0})</h3>
                                    <div className="flex-1 border-b border-dashed border-primary mr-1" />
                                </div>

                                <Card className="p-0 overflow-hidden border border-darkBorderV1 bg-transparent">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>STT</TableHead>
                                                <TableHead>Mã thiết bị</TableHead>
                                                <TableHead>Tên thiết bị</TableHead>
                                                <TableHead>Số lượng</TableHead>
                                                <TableHead>Tình trạng</TableHead>
                                                <TableHead>Ảnh thiết bị lúc mượn</TableHead>
                                                <TableHead>Ảnh thiết bị lúc trả</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {record.items?.map((item, idx) => {
                                                const eqName = item.equipmentName || (typeof item.equipmentId === 'object' ? item.equipmentId?.equipmentName : '');
                                                const eqCode = item.equipmentCode || (typeof item.equipmentId === 'object' ? item.equipmentId?.equipmentCode : '');

                                                return (
                                                    <TableRow key={idx}>
                                                        <TableCell className="text-center">{idx + 1}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="green">{eqCode}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="neutral">
                                                                {eqName}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell><Badge variant="cyan">{item.quantity}</Badge></TableCell>
                                                        <TableCell className="text-neutral-300 min-w-[160px]">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-xs text-primary font-semibold uppercase tracking-tighter">Trước khi mượn:</span>
                                                                <span className="text-sm">{item.borrowCondition || "-"}</span>
                                                                {item.status === 'returned' && (
                                                                    <>
                                                                        <span className="text-xs text-green-500 font-semibold uppercase tracking-tighter mt-1">Sau khi trả:</span>
                                                                        <span className="text-sm text-neutral-300">{item.returnCondition || "-"}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-1 justify-center flex-wrap max-w-[120px]">
                                                                {item.borrowImages?.map((img, i) => (
                                                                    <Link key={i} href={img} target="_blank" rel="noreferrer" className="w-20 h-20 rounded border border-darkBorderV1 overflow-hidden shrink-0 hover:border-primary transition-colors">
                                                                        <img src={img} alt="Borrow" className="w-full h-full object-cover" />
                                                                    </Link>
                                                                ))}
                                                                {(!item.borrowImages || item.borrowImages.length === 0) && (
                                                                    <div className="text-center text-neutral-300 text-sm py-2 italic flex items-start justify-start gap-1">
                                                                        <Icon path={mdiImageRemoveOutline} size={0.8} className="flex-shrink-0" />
                                                                        <span>Chưa có ảnh</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-1 justify-center flex-wrap max-w-[120px]">
                                                                {item.returnImages?.map((img, i) => (
                                                                    <Link key={i} href={img} target="_blank" rel="noreferrer" className="w-20 h-20 rounded border border-green-500/30 overflow-hidden shrink-0 hover:border-green-400 transition-colors">
                                                                        <img src={img} alt="Return" className="w-full h-full object-cover" />
                                                                    </Link>
                                                                ))}
                                                                {(!item.returnImages || item.returnImages.length === 0) && (
                                                                    <div className="text-center text-neutral-300 text-sm py-2 italic flex items-start justify-start gap-1">
                                                                        <Icon path={mdiImageRemoveOutline} size={0.8} className="flex-shrink-0" />
                                                                        <span>Chưa có ảnh</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {getStatusBadge(item.status)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-neutral-300">
                                Không tìm thấy thông tin phiếu mượn trả
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            <Icon path={mdiClose} size={0.8} className="flex-shrink-0" />
                            Đóng
                        </Button>
                        <Button type="button" onClick={handlePrint}>
                            <Icon path={mdiPrinter} size={0.8} className="flex-shrink-0" />
                            In
                        </Button>
                        <Button type="button" onClick={handleExport}>
                            <Icon path={mdiFileExport} size={0.8} className="flex-shrink-0" />
                            Xuất file Word
                        </Button>

                        {record && record.status !== 'returned' && (
                            <Button
                                type="button"
                                onClick={() => setIsReturnOpen(true)}
                            >
                                <Icon path={mdiPackageDown} size={0.8} className="flex-shrink-0" />
                                Trả thiết bị
                            </Button>
                        )}
                        {record && !record.isTechnicalStaffSigned && (profile?.data?.user?.position?.includes("Kỹ thuật")) && (
                            <Button
                                type="button"

                                onClick={handleTechnicalStaffSign}
                                disabled={isSignTechnicalStaffPending}
                            >
                                <Icon path={mdiDrawPen} size={0.8} className="flex-shrink-0" />
                                Kỹ thuật xác nhận ký
                            </Button>
                        )}
                        {record && !record.isStorekeeperSigned && (profile?.data?.user?.position?.includes("Thủ kho")) && (
                            <Button
                                type="button"

                                onClick={handleStorekeeperSign}
                                disabled={isSignStorekeeperPending}
                            >
                                <Icon path={mdiDrawPen} size={0.8} className="flex-shrink-0" />
                                Thủ kho xác nhận ký
                            </Button>
                        )}
                        {record && !record.isUnitHeadSigned && (profile?.data?.user?.position?.includes("Thủ trưởng")) && (
                            <Button
                                type="button"

                                onClick={handleUnitHeadSign}
                                disabled={isSignUnitHeadPending}
                            >
                                <Icon path={mdiDrawPen} size={0.8} className="flex-shrink-0" />
                                Thủ trưởng xác nhận ký
                            </Button>
                        )}

                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {
                record && (
                    <ReturnDialog
                        isOpen={isReturnOpen}
                        onClose={() => {
                            setIsReturnOpen(false);
                            refetch();
                        }}
                        record={record}
                    />
                )
            }
        </>
    );
}
