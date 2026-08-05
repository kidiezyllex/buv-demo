const SF_INSTANCE_URL = process.env.SF_INSTANCE_URL;
const SF_ACCESS_TOKEN = process.env.SF_ACCESS_TOKEN;
const SF_LEAD_TOKEN = process.env.SF_LEAD_TOKEN;

export async function callSalesforceRest(urlMapping: string, payload: unknown, customToken?: string) {
    const token = customToken || SF_ACCESS_TOKEN;
    if (!SF_INSTANCE_URL || !token) {
        throw new Error("Thiếu SF_INSTANCE_URL / SF_ACCESS_TOKEN");
    }

    const res = await fetch(`${SF_INSTANCE_URL}/services/apexrest/${urlMapping}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(SF_LEAD_TOKEN ? { authorizationpermanent: SF_LEAD_TOKEN } : {}),
        },
        body: JSON.stringify(payload),
    });

    const text = await res.text();
    let json: any;
    try {
        json = JSON.parse(text);
    } catch {
        json = { raw: text };
    }

    if (res.status === 401) {
        json = {
            ...json,
            message:
                (json?.message ? json.message + " — " : "") +
                "SF_ACCESS_TOKEN có thể đã hết hạn, chạy lại `sf org display --target-org DEV` để lấy token mới và cập nhật .env.local",
        };
    }

    return { status: res.status, ok: res.ok, data: json };
}

export async function querySalesforce(soql: string, customToken?: string) {
    const token = customToken || SF_ACCESS_TOKEN;
    if (!SF_INSTANCE_URL || !token) {
        throw new Error("Thiếu SF_INSTANCE_URL / SF_ACCESS_TOKEN");
    }

    const res = await fetch(
        `${SF_INSTANCE_URL}/services/data/v60.0/query?q=${encodeURIComponent(soql)}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const text = await res.text();
    let json: any;
    try {
        json = JSON.parse(text);
    } catch {
        json = { raw: text };
    }

    return { status: res.status, ok: res.ok, data: json };
}
