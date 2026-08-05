import { sendGet, sendPut } from "./axios";

export const reportApi = {
    // Dashboard / Statistics
    getStatistics: () => sendGet("/reports/statistics"),

    // 6A: Notifications
    getNotifications: (params: any) => sendGet("/notifications", params),
    getUnreadCount: () => sendGet("/notifications/unread-count"),
    getNotificationDetails: (id: string) => sendGet(`/notifications/${id}`),
    markRead: (id: string) => sendPut(`/notifications/${id}/read`),
    markReadAll: () => sendPut("/notifications/read-all"),

    // 6B: Reports
    getEquipmentReport: () => sendGet("/reports/equipment"),
    getTaskReport: () => sendGet("/reports/tasks"),
    getBorrowReturnReport: () => sendGet("/reports/borrow-return"),
    getPaymentReport: () => sendGet("/reports/payments"),
    getAttendanceTodayReport: () => sendGet("/reports/attendance-today"),
    getConstructionSafetyReport: () => sendGet("/reports/construction-safety"),
    getDocumentsMonthlyReport: () => sendGet("/reports/documents-monthly"),
    getInventoryIssuesReport: () => sendGet("/reports/inventory-issues"),
    exportReport: (type: string) => sendGet("/reports/export", { type }),
};
