import { NextRequest, NextResponse } from "next/server";
import { querySalesforce } from "@/lib/salesforce";

export async function GET(req: NextRequest) {
    const customToken = req.headers.get("x-sf-access-token") || undefined;

    const soql = "SELECT Id, Name FROM Product2 WHERE IsActive = true ORDER BY Name";

    try {
        const result = await querySalesforce(soql, customToken);

        if (!result.ok) {
            return NextResponse.json(
                { message: result.data?.[0]?.message || result.data?.message || "Không lấy được danh sách chương trình" },
                { status: result.status }
            );
        }

        const records = (result.data.records || []).map((r: any) => ({
            label: r.Name,
            value: r.Id,
        }));

        return NextResponse.json({ programmes: records });
    } catch (error: any) {
        return NextResponse.json(
            { message: error?.message || "Lỗi khi gọi Salesforce API" },
            { status: 502 }
        );
    }
}
