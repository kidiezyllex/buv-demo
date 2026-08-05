import axios from "axios";
import cookies from "js-cookie";
import { sendGet, sendPost } from "./axios";

function getAuthToken() {
    return (
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        cookies.get("accessToken") ||
        ""
    );
}

export const backupApi = {
    getCollectionsInfo: () => sendGet("/backup/collections-info"),

    getHistory: (params: any) => sendGet("/backup/history", params),

    exportBackup: async () => {
        const token = getAuthToken();
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || "https://companymanagementbe.onrender.com/api/v1"}/backup/export`,
                null,
                {
                    responseType: "blob",
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );
            const disposition = response.headers["content-disposition"] || "";
            const match = disposition.match(/filename="?([^"]+)"?/);
            const fileName = match?.[1] || `backup_${Date.now()}.json`;
            return { blob: response.data as Blob, fileName };
        } catch (error: any) {
            const errorBlob = error?.response?.data;
            if (errorBlob instanceof Blob) {
                const text = await errorBlob.text();
                let parsed: any = null;
                try {
                    parsed = JSON.parse(text);
                } catch {
                    // Không parse được, giữ nguyên lỗi gốc
                }
                if (parsed) throw parsed;
            }
            throw error;
        }
    },

    validateRestore: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return sendPost("/backup/restore/validate", formData);
    },

    executeRestore: (file: File, checksum: string, confirmText: string) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("checksum", checksum);
        formData.append("confirmText", confirmText);
        return sendPost("/backup/restore", formData);
    },
};
