export type LeadApiEndpointKey =
    | "create-lead"
    | "undergraduate"
    | "english"
    | "pathway"
    | "postgraduate";

export interface ILeadApiEndpointOption {
    key: LeadApiEndpointKey;
    label: string;
    description: string;
}

export const LEAD_API_ENDPOINTS: ILeadApiEndpointOption[] = [
    {
        key: "create-lead",
        label: "APICreateLead",
        description: "API tổng quát, Group Programme lấy theo Interested_Programme__c gửi lên",
    },
    {
        key: "undergraduate",
        label: "APILeadUndergraduate",
        description: "Group Programme cố định: Undergraduate",
    },
    {
        key: "english",
        label: "APILeadEnglish",
        description: "Group Programme cố định: English",
    },
    {
        key: "pathway",
        label: "APILeadPathway",
        description: "Group Programme cố định: Pathway",
    },
    {
        key: "postgraduate",
        label: "APILeadPostgraduate",
        description: "Group Programme cố định: PostGraduate",
    },
];

export const YOU_ARE_OPTIONS = [
    "Student",
    "Parent",
    "Working people",
    "BUV Alumni",
    "Guardian",
] as const;

export type YouAreValue = (typeof YOU_ARE_OPTIONS)[number];

export const LEAD_SOURCE_OPTIONS = [
    "Website",
    "MarComm",
    "School",
    "SRC Agent",
    "Corporate",
    "Recommender",
    "Words of Mouth",
    "Hotline",
    "Barcode Check-in",
    "EDP Recommender",
    "EDP Agent",
    "SRC Recommender",
    "SPELL",
] as const;

// queryParam: tham số trên link dùng để tự điền.
// UTM_CampaignMC__c không có ở đây vì Salesforce tự lấy từ UTM_Campaign__c.
export const UTM_FIELDS = [
    { key: "UTM_Campaign__c", label: "UTM Campaign", queryParam: "utm_campaign", placeholder: "Mã chiến dịch (vd: buvopenday) hoặc link có utm_campaign" },
    { key: "UTM_Content__c", label: "UTM Content", queryParam: "utm_content", placeholder: "vd: banner-1" },
    { key: "UTM_Medium__c", label: "UTM Medium", queryParam: "utm_medium", placeholder: "vd: cpc" },
    { key: "UTM_Source__c", label: "UTM Source", queryParam: "utm_source", placeholder: "vd: facebook" },
    { key: "UTM_Term__c", label: "UTM Term", queryParam: "utm_term", placeholder: "vd: open-day" },
] as const;

export interface ILeadApiPayload {
    LastName?: string;
    Email?: string;
    MobilePhone?: string;
    You_are__c?: string;
    DOB__c?: string;
    City_or_Province__c?: string;
    LeadSource?: string;
    Interested_Programme__c?: string;
    Interested_Category__c?: string;
    Group_Programme__c?: string;
    UTM_Campaign__c?: string;
    UTM_Content__c?: string;
    UTM_Medium__c?: string;
    UTM_Source__c?: string;
    UTM_Term__c?: string;
    [key: string]: unknown;
}

export interface ILeadApiResult {
    status: number;
    message?: string;
    code?: number;
    errorCode?: number;
    data?: unknown;
    raw?: unknown;
}
