"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
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
    { key: "LastName", label: "Tên (FullName)" },
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
};

const PROVINCES = [
    { label: "Thành phố Cần Thơ", value: "a0Udb000004TOoREAW" },
    { label: "Thành phố Đà Nẵng", value: "a0Udb000004TOoGEAW" },
    { label: "Thành phố Hà Nội", value: "a0Udb000004TOnwEAG" },
    { label: "Thành phố Hải Phòng", value: "a0Udb000004TOo8EAG" },
    { label: "Thành phố Hồ Chí Minh", value: "a0Udb000004TFd4EAG" },
    { label: "Thành phố Huế", value: "a0Udb000004TOoFEAW" },
    { label: "Tỉnh An Giang", value: "a0Udb000004TOoQEAW" },
    { label: "Tỉnh Bắc Ninh", value: "a0Udb000004TOo6EAG" },
    { label: "Tỉnh Cà Mau", value: "a0Udb000004TOoSEAW" },
    { label: "Tỉnh Cao Bằng", value: "a0Udb000004TOnxEAG" },
    { label: "Tỉnh Đắk Lắk", value: "a0Udb000004TOoKEAW" },
    { label: "Tỉnh Điện Biên", value: "a0Udb000004TOnzEAG" },
    { label: "Tỉnh Đồng Nai", value: "a0Udb000004TOoMEAW" },
    { label: "Tỉnh Đồng Tháp", value: "a0Udb000004TOoOEAW" },
    { label: "Tỉnh Gia Lai", value: "a0Udb000004TOoIEAW" },
    { label: "Tỉnh Hà Tĩnh", value: "a0Udb000004TOoDEAW" },
    { label: "Tỉnh Hưng Yên", value: "a0Udb000004TOo9EAG" },
    { label: "Tỉnh Khánh Hòa", value: "a0Udb000004TOoJEAW" },
    { label: "Tỉnh Lai Châu", value: "a0Udb000004TOo0EAG" },
    { label: "Tỉnh Lạng Sơn", value: "a0Udb000004TOo4EAG" },
    { label: "Tỉnh Lào Cai", value: "a0Udb000004TOo2EAG" },
    { label: "Tỉnh Lâm Đồng", value: "a0Udb000004TOoLEAW" },
    { label: "Tỉnh Nghệ An", value: "a0Udb000004TOoCEAW" },
    { label: "Tỉnh Ninh Bình", value: "a0Udb000004TOoAEAW" },
    { label: "Tỉnh Phú Thọ", value: "a0Udb000004TOo7EAG" },
    { label: "Tỉnh Quảng Ngãi", value: "a0Udb000004TOoHEAW" },
    { label: "Tỉnh Quảng Ninh", value: "a0Udb000004TOo5EAG" },
    { label: "Tỉnh Quảng Trị", value: "a0Udb000004TOoEEAW" },
    { label: "Tỉnh Sơn La", value: "a0Udb000004TOo1EAG" },
    { label: "Tỉnh Tây Ninh", value: "a0Udb000004TOoNEAW" },
    { label: "Tỉnh Thái Nguyên", value: "a0Udb000004TOo3EAG" },
    { label: "Tỉnh Thanh Hóa", value: "a0Udb000004TOoBEAW" },
    { label: "Tỉnh Tuyên Quang", value: "a0Udb000004TOnyEAG" },
    { label: "Tỉnh Vĩnh Long", value: "a0Udb000004TOoPEAW" },
];

// Chỉ dùng cho APICreateLead - danh sách rút gọn, đã xác nhận map dữ liệu đầy đủ
// (Category/Campus Group/Group Programme) không bị lỗi thiếu dữ liệu tham chiếu trên org.
const PROGRAMMES = [
    { label: "BSc (Hons) Computer Science", value: "01tdc000001npX3AAI" },
];

export default function LeadApiTesterPage() {
    const [endpoint, setEndpoint] = useState<LeadApiEndpointKey>("create-lead");
    const [form, setForm] = useState<ILeadApiPayload>(DEFAULT_FORM);
    const [isSending, setIsSending] = useState(false);
    const [result, setResult] = useState<ILeadApiResult | null>(null);

    const selectedEndpoint = useMemo(
        () => LEAD_API_ENDPOINTS.find((item) => item.key === endpoint),
        [endpoint]
    );

    const updateField = (key: keyof ILeadApiPayload, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const buildPayload = (): Record<string, unknown> => {
        const base: Record<string, unknown> = {};
        Object.entries(form).forEach(([key, value]) => {
            if (value !== "" && value !== undefined) {
                base[key] = value;
            }
        });

        return base;
    };

    const handleSend = async () => {
        const payload = buildPayload();

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
        <div className="space-y-3 md:space-y-4 bg-gray-100 p-3 md:p-4 min-h-[80vh]">
            <div className="flex items-center gap-3 md:gap-4 mb-2">
                <Image src="/images/logo.png" alt="BUV Logo" width={80} height={40} className="object-contain" />
                <h3 className="text-primary font-semibold whitespace-nowrap">
                    Lead API Tester - Salesforce
                </h3>
                <div className="flex-1 border-b border-dashed border-primary mr-1" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                <Card>
                    <CardHeader className="border-b border-b-gray-200 py-3">
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
                                <p className="text-sm text-neutral-500 mt-1 italic">
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
                                <Label htmlFor="LastName">Tên (FullName)</Label>
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
                                <Select
                                    value={(form.City_or_Province__c as string) || undefined}
                                    onValueChange={(v) => updateField("City_or_Province__c", v)}
                                >
                                    <SelectTrigger id="City_or_Province__c">
                                        <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROVINCES.map((option) => (
                                            <SelectItem key={option.value} value={option.label}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

                        {endpoint === "create-lead" && (
                            <div>
                                <Label htmlFor="Interested_Programme__c">Chương trình quan tâm</Label>
                                <Select
                                    value={(form.Interested_Programme__c as string) || undefined}
                                    onValueChange={(v) => updateField("Interested_Programme__c", v)}
                                >
                                    <SelectTrigger id="Interested_Programme__c">
                                        <SelectValue placeholder="Chọn chương trình (không bắt buộc)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROGRAMMES.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <Button onClick={handleSend} disabled={isSending} className="w-full">
                            <Icon path={isSending ? mdiLoading : mdiSend} size={0.8} className={isSending ? "animate-spin flex-shrink-0" : "flex-shrink-0"} />
                            {isSending ? "Đang gửi..." : "Gửi request"}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b border-b-gray-200 py-3">
                        <div className="flex items-center gap-2">
                            <Icon path={mdiCodeJson} size={0.8} className="text-primary flex-shrink-0" />
                            <span className="font-semibold text-primary">Response</span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 md:space-y-4">
                        {!result && (
                            <div className="text-center text-neutral-500 text-base py-2 italic flex items-center justify-center gap-2">
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
