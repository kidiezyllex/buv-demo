import axios from "axios";
import { LeadApiEndpointKey } from "@/interface/leadApi";

// Gọi thẳng tới API route nội bộ của Next.js (không qua instance chung trong "./axios"
// vì instance đó gắn sẵn baseURL + Bearer token của hệ thống Company Management, không phù hợp ở đây).
export const leadApi = {
    callEndpoint: (endpoint: LeadApiEndpointKey, payload: Record<string, unknown>) =>
        axios
            .post(`/api/lead-proxy/${endpoint}`, payload, { validateStatus: () => true })
            .then((res) => ({ status: res.status, body: res.data })),
};
