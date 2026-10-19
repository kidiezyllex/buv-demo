import axios from "axios";
import { LeadApiEndpointKey } from "@/interface/leadApi";

// Gọi thẳng tới API route nội bộ của Next.js (không qua instance chung trong "./axios"
// vì instance đó gắn sẵn baseURL + Bearer token của hệ thống Company Management, không phù hợp ở đây).
export const leadApi = {
    callEndpoint: (endpoint: LeadApiEndpointKey, payload: Record<string, unknown>, sfToken?: string) => {
        const headers: Record<string, string> = {};
        if (sfToken) {
            headers["x-sf-access-token"] = sfToken;
        }
        return axios
            .post(`/api/lead-proxy/${endpoint}`, payload, { validateStatus: () => true, headers })
            .then((res) => ({ status: res.status, body: res.data }));
    },
    getProgrammes: (sfToken?: string) => {
        const headers: Record<string, string> = {};
        if (sfToken) {
            headers["x-sf-access-token"] = sfToken;
        }
        return axios
            .get("/api/products", { headers })
            .then((res) => res.data?.programmes as { label: string; value: string }[]);
    },
    getProvinces: (sfToken?: string) => {
        const headers: Record<string, string> = {};
        if (sfToken) {
            headers["x-sf-access-token"] = sfToken;
        }
        return axios
            .get("/api/provinces", { headers })
            .then((res) => res.data?.provinces as { label: string; value: string }[]);
    },
    getGroupProgrammes: (sfToken?: string) => {
        const headers: Record<string, string> = {};
        if (sfToken) {
            headers["x-sf-access-token"] = sfToken;
        }
        return axios
            .get("/api/group-programmes", { headers })
            .then((res) => res.data?.groupProgrammes as { label: string; value: string }[]);
    },
    getEventActivities: (sfToken?: string) => {
        const headers: Record<string, string> = {};
        if (sfToken) {
            headers["x-sf-access-token"] = sfToken;
        }
        return axios
            .get("/api/event-activities", { headers })
            .then((res) => res.data?.eventActivities as { label: string; value: string }[]);
    },
};
