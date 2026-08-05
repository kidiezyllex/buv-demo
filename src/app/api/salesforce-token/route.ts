import { NextResponse } from "next/server";

export async function POST() {
    // Sandbox sử dụng test.salesforce.com hoặc chính URL của instance thay vì login.salesforce.com
    const loginUrl = process.env.SF_INSTANCE_URL
        ? `${process.env.SF_INSTANCE_URL}/services/oauth2/token`
        : "https://test.salesforce.com/services/oauth2/token";
    const clientId = process.env.SF_CLIENT_ID;
    const clientSecret = process.env.SF_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json(
            { message: "Vui lòng cấu hình đầy đủ SF_CLIENT_ID, SF_CLIENT_SECRET trong file .env.local" },
            { status: 400 }
        );
    }

    console.log("LOGIN URL:", loginUrl);
    console.log("CLIENT ID:", clientId);

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);

    try {
        const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.error_description || data.error || "Không thể lấy Access Token từ Salesforce" },
                { status: response.status }
            );
        }

        return NextResponse.json({ access_token: data.access_token });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Lỗi khi gọi API lấy token" },
            { status: 500 }
        );
    }
}
