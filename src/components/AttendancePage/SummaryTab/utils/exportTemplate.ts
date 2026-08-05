import { ATTENDANCE_TYPE_SYMBOLS, IMonthlySummaryEmployee } from "@/interface/attendance";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function handleAttendanceExportExcel(
    monthlySummaryData: IMonthlySummaryEmployee[],
    selectedMonth: number,
    selectedYear: number,
    daysInMonth: number,
    signatureUrl?: string
) {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Bang Cham Cong");

        // 1. Column Widths (Derived from HTML width=xx)
        // STT: 31px (~4.43), Name: 140px (~20), Days: 33px (~4.71), Totals: 92px/105px (~13/15)
        worksheet.columns = [
            { width: 4.5 },  // STT
            { width: 22 },   // Họ và tên
            ...Array(31).fill({ width: 4.8 }), // Days 1-31
            { width: 13 },   // Công đi làm
            { width: 13 },   // Công làm T7, CN
            { width: 13 },   // Phép/Ốm/Nghỉ bù
            { width: 13 },   // Công dư
            { width: 15 },   // Tổng công tháng
        ];

        // Reusable Style Definitions
        const fontTimes10 = { name: "Times New Roman", size: 10 };
        const fontTimes11B = { name: "Times New Roman", size: 11, bold: true };
        const fontTimes12 = { name: "Times New Roman", size: 12 };
        const fontTimes12B = { name: "Times New Roman", size: 12, bold: true };
        const fontTimes13B = { name: "Times New Roman", size: 13, bold: true };
        const fontTimes14B = { name: "Times New Roman", size: 14, bold: true };
        const fontTimes18B = { name: "Times New Roman", size: 18, bold: true };
        const fontSummary = { name: "Times New Roman", size: 9, bold: true };

        const borderSolid: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FF000000" } };
        const borderHair: Partial<ExcelJS.Border> = { style: "hair", color: { argb: "FF000000" } };

        const alignCenterMiddle: Partial<ExcelJS.Alignment> = { vertical: "middle", horizontal: "center", wrapText: true };
        const fillYellow: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } };

        const fillOrangeHighlight: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFE0B2" } };

        // 2. Header Info (Rows 1-3)
        worksheet.mergeCells(1, 1, 1, 15);
        const cellH1 = worksheet.getCell(1, 1);
        cellH1.value = "CÔNG TY TNHH GIẢI PHÁP";
        cellH1.font = fontTimes14B;

        worksheet.mergeCells(2, 1, 2, 15);
        const cellH2 = worksheet.getCell(2, 1);
        cellH2.value = "TỰ ĐỘNG ĐIỆN";
        cellH2.font = fontTimes14B;

        worksheet.mergeCells(3, 1, 3, 35);
        const cellTitle = worksheet.getCell(3, 1);
        cellTitle.value = {
            richText: [
                { text: "BẢNG CHẤM CÔNG THÁNG ", font: fontTimes18B },
                { text: `${selectedMonth} `, font: { ...fontTimes18B, color: { argb: "FFFF0000" } } },
                { text: `NĂM ${selectedYear}`, font: fontTimes18B }
            ]
        };
        cellTitle.alignment = alignCenterMiddle;
        worksheet.getRow(3).height = 35;

        // 3. Table Header (Rows 4-6)
        // Set default borders for header area
        for (let r = 4; r <= 6; r++) {
            const row = worksheet.getRow(r);
            row.height = 25;
            for (let c = 1; c <= 35; c++) {
                row.getCell(c).border = { top: borderSolid, left: borderSolid, bottom: borderSolid, right: borderSolid };
                row.getCell(c).alignment = alignCenterMiddle;
                row.getCell(c).font = fontTimes11B;
            }
        }

        worksheet.mergeCells(4, 1, 5, 1);
        worksheet.getCell(4, 1).value = "SỐTT";

        worksheet.mergeCells(4, 2, 5, 2);
        worksheet.getCell(4, 2).value = "Họ và tên";

        worksheet.mergeCells(4, 3, 4, 3 + daysInMonth - 1);
        worksheet.getCell(4, 3).value = "NGÀY CÔNG TRONG THÁNG";

        worksheet.mergeCells(4, daysInMonth + 3, 5, daysInMonth + 7);
        worksheet.getCell(4, daysInMonth + 3).value = "Tổng cộng";

        // Row 5: Days
        for (let d = 1; d <= 31; d++) {
            const cell = worksheet.getCell(5, d + 2);
            if (d <= daysInMonth) {
                cell.value = d;
                const date = new Date(selectedYear, selectedMonth - 1, d);
                if (date.getDay() === 0 || date.getDay() === 6) cell.fill = fillYellow;
            } else {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
            }
        }

        // Row 6: Legend
        worksheet.getRow(6).eachCell(cell => { cell.font = fontTimes11B; });
        worksheet.getCell(6, 1).value = "a";
        worksheet.getCell(6, 2).value = "b";
        for (let d = 1; d <= daysInMonth; d++) worksheet.getCell(6, d + 2).value = d;
        worksheet.getCell(6, daysInMonth + 3).value = "Công đi làm";
        worksheet.getCell(6, daysInMonth + 4).value = "Công làm T7, CN";
        worksheet.getCell(6, daysInMonth + 5).value = "Phép/Ốm/NB";
        worksheet.getCell(6, daysInMonth + 6).value = "Công dư";
        worksheet.getCell(6, daysInMonth + 7).value = "Tổng công";

        // 4. Fill Data (Rows 7 onwards)
        const startRowIndex = 7;
        monthlySummaryData.forEach((item, index) => {
            const rowIndex = startRowIndex + index;
            const row = worksheet.getRow(rowIndex);
            row.height = 24.95; // Match HTML height

            const isFirst = index === 0;
            const topB = isFirst ? borderSolid : borderHair;
            const bottomB = borderHair;

            // STT
            const c1 = row.getCell(1);
            c1.value = index + 1;
            c1.border = { top: topB, left: borderSolid, bottom: bottomB, right: borderSolid };
            c1.alignment = alignCenterMiddle;
            c1.font = fontTimes10;

            // Name
            const c2 = row.getCell(2);
            c2.value = item.employee.fullName;
            c2.border = { top: topB, left: borderSolid, bottom: bottomB, right: borderSolid };
            c2.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
            c2.font = fontTimes12;

            // Days records
            for (let d = 1; d <= 31; d++) {
                const cell = row.getCell(d + 2);
                cell.border = { top: topB, left: borderSolid, bottom: bottomB, right: borderSolid };
                cell.alignment = alignCenterMiddle;
                cell.font = fontTimes10;

                if (d <= daysInMonth) {
                    const record = item.records.find((r) => new Date(r.date).getDate() === d);
                    cell.value = record ? (ATTENDANCE_TYPE_SYMBOLS[record.type] || "+") : "";

                    // If has businessTripNotes, add comment and highlight
                    if (record?.businessTripNotes?.trim()) {
                        cell.note = record.businessTripNotes;
                        cell.fill = fillOrangeHighlight;
                    }
                }
            }

            // Summary
            const cSum1 = row.getCell(daysInMonth + 3);
            cSum1.value = (item.summary.totalWorkDays || 0) + (item.summary.totalBusinessTrip || 0);
            cSum1.border = { top: topB, left: borderSolid, bottom: bottomB, right: borderSolid };
            cSum1.font = fontSummary;
            cSum1.alignment = alignCenterMiddle;

            const cSum2 = row.getCell(daysInMonth + 4);
            cSum2.value = item.summary.totalWeekendWork || 0;
            cSum2.border = { top: topB, left: borderSolid, bottom: bottomB, right: borderSolid };
            cSum2.font = fontSummary;
            cSum2.alignment = alignCenterMiddle;

            const cSum3 = row.getCell(daysInMonth + 5);
            cSum3.value = item.summary.totalPaidLeave || 0;
            cSum3.border = { top: topB, left: borderSolid, bottom: bottomB, right: borderSolid };
            cSum3.font = fontSummary;
            cSum3.alignment = alignCenterMiddle;

            const cSum4 = row.getCell(daysInMonth + 6);
            cSum4.value = item.summary.surplusDays || 0;
            cSum4.border = { top: topB, left: borderSolid, bottom: bottomB, right: borderSolid };
            cSum4.font = fontSummary;
            cSum4.alignment = alignCenterMiddle;

            const cSum5 = row.getCell(daysInMonth + 7);
            cSum5.value = item.summary.totalAttendance || 0;
            cSum5.border = { top: topB, left: borderSolid, bottom: bottomB, right: borderSolid };
            cSum5.font = fontSummary;
            cSum5.alignment = alignCenterMiddle;
        });

        // 5. Grand Total Row (Row after all data)
        const totalRowIndex = startRowIndex + monthlySummaryData.length;
        const totalRow = worksheet.getRow(totalRowIndex);
        totalRow.height = 25;
        totalRow.getCell(2).value = "Tổng cộng";
        totalRow.getCell(2).font = fontTimes12B;
        for (let c = 1; c <= daysInMonth + 7; c++) {
            totalRow.getCell(c).border = { top: borderSolid, left: borderSolid, bottom: borderSolid, right: borderSolid };
        }

        // 6. Footer Signature
        const signatureRowStart = totalRowIndex + 2;
        const now = new Date();
        const dateStr = `Đà Nẵng, ngày ${now.getDate().toString().padStart(2, "0")} tháng ${(now.getMonth() + 1).toString().padStart(2, "0")} năm ${now.getFullYear()}`;

        const dateRow = worksheet.getRow(signatureRowStart);
        dateRow.getCell(21).value = dateStr;
        dateRow.getCell(21).font = { name: "Times New Roman", size: 14, italic: true };
        worksheet.mergeCells(signatureRowStart, 21, signatureRowStart, 35);

        const signTitleRow = worksheet.getRow(signatureRowStart + 1);
        signTitleRow.height = 25;
        signTitleRow.getCell(1).value = "NGƯỜI LẬP BẢNG";
        worksheet.mergeCells(signatureRowStart + 1, 1, signatureRowStart + 1, 7);

        signTitleRow.getCell(25).value = "LÃNH ĐẠO";
        worksheet.mergeCells(signatureRowStart + 1, 25, signatureRowStart + 1, 30);

        [1, 25].forEach(col => {
            signTitleRow.getCell(col).font = fontTimes13B;
            signTitleRow.getCell(col).alignment = alignCenterMiddle;
        });

        // Add Digital Signature Image
        if (signatureUrl) {
            try {
                const response = await fetch(signatureUrl);
                const arrayBuffer = await response.arrayBuffer();
                const imageId = workbook.addImage({
                    buffer: arrayBuffer,
                    extension: "png",
                });

                worksheet.addImage(imageId, {
                    tl: { col: 1.7, row: signatureRowStart + 1.2 }, // Adjusted for visual balance
                    ext: { width: 140, height: 70 },
                });
            } catch (error) {
                console.error("Failed to embed signature image:", error);
            }
        }

        // Save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, `Bang_cham_cong_T${selectedMonth}_${selectedYear}.xlsx`);

    } catch (error) {
        console.error("Excel Export Error:", error);
        throw error;
    }
}
