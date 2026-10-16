import { NextRequest, NextResponse } from "next/server";
import { callSalesforceRest } from "@/lib/salesforce";

const ALLOWED_ENDPOINTS: Record<string, string> = {
    "create-lead": "APICreateLead",
    "undergraduate": "APILeadUndergraduate",
    "english": "APILeadEnglish",
    "pathway": "APILeadPathway",
    "postgraduate": "APILeadPostgraduate",
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ endpoint: string }> }) {
    const { endpoint } = await params;
    const urlMapping = ALLOWED_ENDPOINTS[endpoint];

    if (!urlMapping) {
        return NextResponse.json(
            { message: `Endpoint không hợp lệ: ${endpoint}` },
            { status: 400 }
        );
    }

    let payload: unknown;
    try {
        payload = await req.json();
    } catch {
        return NextResponse.json({ message: "Request body không phải JSON hợp lệ" }, { status: 400 });
    }

    const customToken = req.headers.get("x-sf-access-token") || undefined;

    try {
        const result = await callSalesforceRest(urlMapping, payload, customToken);
        return NextResponse.json(result.data, { status: result.status });
    } catch (error: any) {
        return NextResponse.json(
            { message: error?.message || "Lỗi khi gọi Salesforce API" },
            { status: 502 }
        );
    }
}
