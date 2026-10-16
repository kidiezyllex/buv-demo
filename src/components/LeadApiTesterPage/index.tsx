"use client";

import { useEffect, useState } from "react";
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
    LEAD_SOURCE_OPTIONS,
    YOU_ARE_OPTIONS,
} from "@/interface/leadApi";
import { leadApi } from "@/api/leadApi";
import { useTokenStore } from "@/store/useTokenStore";

const DEFAULT_FORM: ILeadApiPayload = {
    LastName: "",
    Email: "",
    MobilePhone: "",
    You_are__c: "",
    DOB__c: "",
    City_or_Province__c: "",
    LeadSource: "",
    Interested_Programme__c: "",
    Group_Programme__c: "",
};

export default function LeadApiTesterPage() {
    const [form, setForm] = useState<ILeadApiPayload>(DEFAULT_FORM);
    const [programmes, setProgrammes] = useState<{ label: string; value: string }[]>([]);
    const [isLoadingProgrammes, setIsLoadingProgrammes] = useState(false);
    const [provinces, setProvinces] = useState<{ label: string; value: string }[]>([]);
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [groupProgrammes, setGroupProgrammes] = useState<{ label: string; value: string }[]>([]);
    const [isLoadingGroupProgrammes, setIsLoadingGroupProgrammes] = useState(false);

    const {
        accessToken: sfToken,
        fetchToken
    } = useTokenStore();
    //mic check check
    const [isSending, setIsSending] = useState(false);
    const [result, setResult] = useState<ILeadApiResult | null>(null);

    useEffect(() => {
        // Tự động kiểm tra và lấy token nếu chưa có hoặc đã hết hạn (không ép buộc refresh)
        fetchToken().catch(() => { });
    }, [fetchToken]);

    useEffect(() => {
        if (!sfToken) return;
        setIsLoadingProgrammes(true);
        leadApi
            .getProgrammes(sfToken)
            .then((data) => setProgrammes(data || []))
            .catch(() => toast.error("Không lấy được danh sách chương trình từ Salesforce"))
            .finally(() => setIsLoadingProgrammes(false));
    }, [sfToken]);

    useEffect(() => {
        if (!sfToken) return;
        setIsLoadingProvinces(true);
        leadApi
            .getProvinces(sfToken)
            .then((data) => setProvinces(data || []))
            .catch(() => toast.error("Không lấy được danh sách tỉnh/thành phố từ Salesforce"))
            .finally(() => setIsLoadingProvinces(false));
    }, [sfToken]);

    useEffect(() => {
        if (!sfToken) return;
        setIsLoadingGroupProgrammes(true);
        leadApi
            .getGroupProgrammes(sfToken)
            .then((data) => setGroupProgrammes(data || []))
            .catch(() => toast.error("Không lấy được danh sách nhóm chương trình từ Salesforce"))
            .finally(() => setIsLoadingGroupProgrammes(false));
    }, [sfToken]);

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

    // Gửi request tới API Salesforce

    const handleSend = async () => {
        const payload = buildPayload();

        setIsSending(true);
        setResult(null);
        try {
            const { status, body } = await leadApi.callEndpoint("create-lead", payload, sfToken);
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
            }
        } catch (error: any) {
            setResult({
                status: 0,
                message: error?.message || "Không thể kết nối tới API",
            });
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
                    Lead API Tester
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
                            <Label htmlFor="Group_Programme__c">Nhóm chương trình (Group Programme)</Label>
                            <Select
                                value={(form.Group_Programme__c as string) || undefined}
                                onValueChange={(v) => updateField("Group_Programme__c", v === "none" ? "" : v)}
                                disabled={isLoadingGroupProgrammes}
                            >
                                <SelectTrigger id="Group_Programme__c">
                                    <SelectValue
                                        placeholder={
                                            isLoadingGroupProgrammes
                                                ? "Đang tải danh sách nhóm chương trình..."
                                                : "Chọn nhóm chương trình"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">-- Không chọn --</SelectItem>
                                    {groupProgrammes.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="Interested_Programme__c">Chương trình quan tâm</Label>
                            <Select
                                value={(form.Interested_Programme__c as string) || undefined}
                                onValueChange={(v) => updateField("Interested_Programme__c", v)}
                                disabled={isLoadingProgrammes}
                            >
                                <SelectTrigger id="Interested_Programme__c">
                                    <SelectValue
                                        placeholder={
                                            isLoadingProgrammes
                                                ? "Đang tải danh sách chương trình..."
                                                : "Chọn chương trình (không bắt buộc)"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {programmes.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                    onValueChange={(v) => updateField("You_are__c", v === "none" ? "" : v)}
                                >
                                    <SelectTrigger id="You_are__c">
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Không chọn --</SelectItem>
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
                                    onValueChange={(v) => updateField("City_or_Province__c", v === "none" ? "" : v)}
                                    disabled={isLoadingProvinces}
                                >
                                    <SelectTrigger id="City_or_Province__c">
                                        <SelectValue
                                            placeholder={
                                                isLoadingProvinces
                                                    ? "Đang tải danh sách tỉnh/thành phố..."
                                                    : "Chọn tỉnh/thành phố"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Không chọn --</SelectItem>
                                        {provinces.map((option) => (
                                            <SelectItem key={option.value} value={option.label}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="LeadSource">Nguồn Lead</Label>
                                <Select
                                    value={(form.LeadSource as string) || undefined}
                                    onValueChange={(v) => updateField("LeadSource", v === "none" ? "" : v)}
                                >
                                    <SelectTrigger id="LeadSource">
                                        <SelectValue placeholder="Chọn nguồn lead" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- Không chọn --</SelectItem>
                                        {LEAD_SOURCE_OPTIONS.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

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
