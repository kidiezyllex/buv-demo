const SF_INSTANCE_URL = process.env.SF_INSTANCE_URL;
const SF_ACCESS_TOKEN = process.env.SF_ACCESS_TOKEN;
const SF_LEAD_TOKEN = process.env.SF_LEAD_TOKEN;

export async function callSalesforceRest(urlMapping: string, payload: unknown) {
    if (!SF_INSTANCE_URL || !SF_ACCESS_TOKEN) {
        throw new Error("Thiếu SF_INSTANCE_URL / SF_ACCESS_TOKEN trong biến môi trường");
    }

    const res = await fetch(`${SF_INSTANCE_URL}/services/apexrest/${urlMapping}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SF_ACCESS_TOKEN}`,
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
