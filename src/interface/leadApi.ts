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
