import { NextRequest, NextResponse } from "next/server";
import { querySalesforce } from "@/lib/salesforce";

export async function GET(req: NextRequest) {
    const customToken = req.headers.get("x-sf-access-token") || undefined;

    const soql = "SELECT Id, Name FROM Province__c ORDER BY Name";

    try {
        const result = await querySalesforce(soql, customToken);

        if (!result.ok) {
            return NextResponse.json(
                { message: result.data?.[0]?.message || result.data?.message || "Không lấy được danh sách tỉnh/thành phố" },
                { status: result.status }
            );
        }

        const records = (result.data.records || []).map((r: any) => ({
            label: r.Name,
            value: r.Id,
        }));

        return NextResponse.json({ provinces: records });
    } catch (error: any) {
        return NextResponse.json(
            { message: error?.message || "Lỗi khi gọi Salesforce API" },
            { status: 502 }
        );
    }
}
