"use client";

import { useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Icon from "@mdi/react";
import {
    mdiSend,
    mdiLoading,
    mdiCodeJson,
    mdiAccountSchool,
    mdiCheckCircleOutline,
    mdiCloseCircleOutline,
} from "@mdi/js";
import { toast } from "react-toastify";
import {
    ILeadApiPayload,
    ILeadApiResult,
    LEAD_API_ENDPOINTS,
    LeadApiEndpointKey,
    YOU_ARE_OPTIONS,
} from "@/interface/leadApi";
import { leadApi } from "@/api/leadApi";

const REQUIRED_FIELDS: { key: keyof ILeadApiPayload; label: string }[] = [
    { key: "LastName", label: "Tên (LastName)" },
    { key: "Email", label: "Email" },
    { key: "MobilePhone", label: "Số điện thoại (MobilePhone)" },
    { key: "You_are__c", label: "Vai trò (You are?)" },
    { key: "DOB__c", label: "Ngày sinh (DOB__c)" },
    { key: "City_or_Province__c", label: "Tỉnh/Thành phố" },
    { key: "LeadSource", label: "Nguồn Lead (LeadSource)" },
];

const DEFAULT_FORM: ILeadApiPayload = {
    LastName: "",
    Email: "",
    MobilePhone: "",
    You_are__c: "",
    DOB__c: "",
    City_or_Province__c: "",
    LeadSource: "MarComm",
    Interested_Programme__c: "",
    Interested_Category__c: "",
};

export default function LeadApiTesterPage() {
    const [endpoint, setEndpoint] = useState<LeadApiEndpointKey>("create-lead");
    const [form, setForm] = useState<ILeadApiPayload>(DEFAULT_FORM);
    const [extraJson, setExtraJson] = useState("{}");
    const [isSending, setIsSending] = useState(false);
    const [result, setResult] = useState<ILeadApiResult | null>(null);

    const selectedEndpoint = useMemo(
        () => LEAD_API_ENDPOINTS.find((item) => item.key === endpoint),
        [endpoint]
    );

    const updateField = (key: keyof ILeadApiPayload, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const buildPayload = (): Record<string, unknown> | null => {
        let extra: Record<string, unknown> = {};
        try {
            extra = extraJson.trim() ? JSON.parse(extraJson) : {};
        } catch {
            toast.error("Trường JSON bổ sung không hợp lệ");
            return null;
        }

        const base: Record<string, unknown> = {};
        Object.entries(form).forEach(([key, value]) => {
            if (value !== "" && value !== undefined) {
                base[key] = value;
            }
        });

        return { ...base, ...extra };
    };

    const handleSend = async () => {
        const payload = buildPayload();
        if (!payload) return;

        setIsSending(true);
        setResult(null);
        try {
            const { status, body } = await leadApi.callEndpoint(endpoint, payload);
            setResult({
                status,
                message: body?.Message || body?.message,
                code: body?.Code,
                errorCode: body?.errorCode,
                data: body?.data,
                raw: body,
            });

            if (status >= 200 && status < 300 && !body?.errorCode) {
                toast.success("Gọi API thành công");
            } else {
                toast.warning(body?.Message || body?.message || "API trả về lỗi");
            }
        } catch (error: any) {
            setResult({
                status: 0,
                message: error?.message || "Không thể kết nối tới API",
            });
            toast.error(error?.message || "Không thể kết nối tới API");
        } finally {
            setIsSending(false);
        }
    };

    const isSuccess = result && result.status >= 200 && result.status < 300 && !result.errorCode;

    return (
        <div className="space-y-3 md:space-y-4 bg-darkCardV1 p-3 md:p-4 min-h-[80vh]">
            <div className="flex items-center gap-3 md:gap-4">
                <h3 className="text-primary font-semibold whitespace-nowrap">
                    Lead API Tester - Salesforce
                </h3>
                <div className="flex-1 border-b border-dashed border-primary mr-1" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                <Card>
                    <CardHeader className="border-b border-b-darkBorderV1 py-3">
                        <div className="flex items-center gap-2">
                            <Icon path={mdiAccountSchool} size={0.8} className="text-primary flex-shrink-0" />
                            <span className="font-semibold text-primary">Request</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4">
                        <div>
                            <Label htmlFor="endpoint">API Endpoint</Label>
                            <Select value={endpoint} onValueChange={(v) => setEndpoint(v as LeadApiEndpointKey)}>
                                <SelectTrigger id="endpoint">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LEAD_API_ENDPOINTS.map((item) => (
                                        <SelectItem key={item.key} value={item.key}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedEndpoint && (
                                <p className="text-sm text-neutral-400 mt-1 italic">
                                    {selectedEndpoint.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 md:gap-4">
                            <h3 className="text-primary font-semibold whitespace-nowrap">7 trường bắt buộc</h3>
                            <div className="flex-1 border-b border-dashed border-primary mr-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div>
                                <Label htmlFor="LastName">Tên (LastName)</Label>
                                <Input
                                    id="LastName"
                                    value={form.LastName as string}
                                    onChange={(e) => updateField("LastName", e.target.value)}
                                    placeholder="Nguyen Van A"
                                />
                            </div>
                            <div>
                                <Label htmlFor="Email">Email</Label>
                                <Input
                                    id="Email"
                                    type="email"
                                    value={form.Email as string}
                                    onChange={(e) => updateField("Email", e.target.value)}
                                    placeholder="test@example.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="MobilePhone">Số điện thoại</Label>
                                <Input
                                    id="MobilePhone"
                                    value={form.MobilePhone as string}
                                    onChange={(e) => updateField("MobilePhone", e.target.value)}
                                    placeholder="0987654321"
                                />
                            </div>
                            <div>
                                <Label htmlFor="You_are__c">Vai trò (You are?)</Label>
                                <Select
                                    value={(form.You_are__c as string) || undefined}
                                    onValueChange={(v) => updateField("You_are__c", v)}
                                >
                                    <SelectTrigger id="You_are__c">
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {YOU_ARE_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="DOB__c" className="mb-2 block">Ngày sinh</Label>
                                <DatePicker
                                    date={form.DOB__c ? new Date(form.DOB__c as string) : undefined}
                                    onDateChange={(date) => {
                                        updateField("DOB__c", date ? format(date, "yyyy-MM-dd") : "");
                                    }}
                                    placeholder="Chọn ngày sinh"
                                    captionLayout="dropdown"
                                    fromYear={1900}
                                />
                            </div>
                            <div>
                                <Label htmlFor="City_or_Province__c">Tỉnh/Thành phố</Label>
                                <Input
                                    id="City_or_Province__c"
                                    value={form.City_or_Province__c as string}
                                    onChange={(e) => updateField("City_or_Province__c", e.target.value)}
                                    placeholder="Ha Noi"
                                />
                            </div>
                            <div>
                                <Label htmlFor="LeadSource">Nguồn Lead</Label>
                                <Input
                                    id="LeadSource"
                                    value={form.LeadSource as string}
                                    onChange={(e) => updateField("LeadSource", e.target.value)}
                                    placeholder="MarComm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4">
                            <h3 className="text-primary font-semibold whitespace-nowrap">Thông tin bổ sung</h3>
                            <div className="flex-1 border-b border-dashed border-primary mr-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div>
                                <Label htmlFor="Interested_Programme__c">Interested Programme (Product2 Id)</Label>
                                <Input
                                    id="Interested_Programme__c"
                                    value={form.Interested_Programme__c as string}
                                    onChange={(e) => updateField("Interested_Programme__c", e.target.value)}
                                    placeholder="01txxxxxxxxxxxx"
                                />
                            </div>
                            <div>
                                <Label htmlFor="Interested_Category__c">Interested Category</Label>
                                <Input
                                    id="Interested_Category__c"
                                    value={form.Interested_Category__c as string}
                                    onChange={(e) => updateField("Interested_Category__c", e.target.value)}
                                    placeholder="Tên category"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="extraJson">JSON bổ sung (override / field khác)</Label>
                            <Textarea
                                id="extraJson"
                                value={extraJson}
                                onChange={(e) => setExtraJson(e.target.value)}
                                rows={4}
                                placeholder='{"FirstName": "A"}'
                            />
                        </div>

                        <Button onClick={handleSend} disabled={isSending} className="w-full">
                            <Icon path={isSending ? mdiLoading : mdiSend} size={0.8} className={isSending ? "animate-spin flex-shrink-0" : "flex-shrink-0"} />
                            {isSending ? "Đang gửi..." : "Gửi request"}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b border-b-darkBorderV1 py-3">
                        <div className="flex items-center gap-2">
                            <Icon path={mdiCodeJson} size={0.8} className="text-primary flex-shrink-0" />
                            <span className="font-semibold text-primary">Response</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4">
                        {!result && (
                            <div className="text-center text-neutral-400 text-base py-2 italic flex items-center justify-center gap-2">
                                <Icon path={mdiCodeJson} size={1} className="flex-shrink-0" />
                                Chưa có response nào
                            </div>
                        )}

                        {result && (
                            <>
                                <div className="flex items-center gap-2">
                                    <Badge variant={isSuccess ? "green" : "red"}>
                                        HTTP {result.status || "N/A"}
                                    </Badge>
                                    {isSuccess ? (
                                        <Icon path={mdiCheckCircleOutline} size={0.8} className="text-green-400 flex-shrink-0" />
                                    ) : (
                                        <Icon path={mdiCloseCircleOutline} size={0.8} className="text-red-400 flex-shrink-0" />
                                    )}
                                    <span className="text-sm">{result.message}</span>
                                </div>
                                <Textarea
                                    readOnly
                                    value={JSON.stringify(result.raw ?? {}, null, 2)}
                                    rows={18}
                                    className="font-mono text-xs"
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
