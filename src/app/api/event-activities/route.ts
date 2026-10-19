import { NextRequest, NextResponse } from "next/server";
import { querySalesforce } from "@/lib/salesforce";

// Chỉ lấy hoạt động thuộc Campaign đang chạy (IsActive = true)
const SOQL =
    "SELECT Id, Name__c, Start_Time__c FROM Event_Activity__c " +
    "WHERE Campaign__r.IsActive = true AND Name__c != null " +
    "ORDER BY No__c, Start_Time__c, Name__c";

// "9:30" -> "09:30"
const formatTime = (time?: string) => {
    if (!time) return "";
    const [h, m = "00"] = time.trim().split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
};

export async function GET(req: NextRequest) {
    const customToken = req.headers.get("x-sf-access-token") || undefined;

    try {
        const result = await querySalesforce(SOQL, customToken);

        if (!result.ok) {
            return NextResponse.json(
                { message: result.data?.[0]?.message || result.data?.message || "Không lấy được danh sách hoạt động" },
                { status: result.status }
            );
        }

        const records = (result.data.records || []).map((r: any) => {
            const time = formatTime(r.Start_Time__c);
            return {
                label: time ? `${time} – ${r.Name__c}` : r.Name__c,
                value: r.Id,
            };
        });

        return NextResponse.json({ eventActivities: records });
    } catch (error: any) {
        return NextResponse.json(
            { message: error?.message || "Lỗi khi gọi Salesforce API" },
            { status: 502 }
        );
    }
}
