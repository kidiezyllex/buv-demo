import type { MenuItem } from "@/interface/types";
import {
	mdiAccountCircleOutline,
	mdiAccountClockOutline,
	mdiAccountGroup,
	mdiApps,
	mdiCalendar,
	mdiCalendarAccount,
	mdiClipboardCheckOutline,
	mdiClockCheckOutline,
	mdiCreditCardSearch,
	mdiDatabaseExport,
	mdiFileDocumentMultipleOutline,
	mdiFileDocumentOutline,
	mdiFileSign,
	mdiHandshake,
	mdiNotebookMultiple,
	mdiStoreCheckOutline,
	mdiToolboxOutline,
	mdiTools,
	mdiViewDashboard,
	mdiWrenchClock
} from "@mdi/js";

export const getDashboardMenuItems = (permissions: string[] = [], role?: string): MenuItem[] => {
	const allItems: MenuItem[] = [
		{
			id: "dashboard",
			name: "Báo cáo và thống kê",
			path: "/sys",
			icon: mdiViewDashboard,
		},
		{
			id: "profile",
			name: "Tài khoản cá nhân",
			path: "/sys/profile",
			icon: mdiAccountCircleOutline,
		},
		{
			id: "employee-management",
			name: "Quản lý nhân sự",
			path: "/sys/employees",
			icon: mdiAccountGroup,
		},
		{
			id: "equipment-management",
			name: "Quản lý dụng cụ",
			path: "/sys/equipment",
			icon: mdiTools,
			subMenu: [
				{
					id: "equipment-list",
					name: "Danh sách dụng cụ",
					path: "/sys/equipment",
					icon: mdiToolboxOutline,
				},
				{
					id: "equipment-borrow",
					name: "Tạo phiếu mượn trả",
					path: "/sys/equipment/borrow",
					icon: mdiClipboardCheckOutline,
				},
				{
					id: "equipment-inventory",
					name: "Kiểm kho",
					path: "/sys/equipment/inventory",
					icon: mdiStoreCheckOutline,
				},
			],
		},
		{
			id: "work-management",
			name: "Điều hành & chấm công",
			path: "/sys/tasks",
			icon: mdiAccountClockOutline,
			subMenu: [
				{
					id: "personal-schedule",
					name: "Lịch làm cá nhân",
					path: "/sys/schedule",
					icon: mdiCalendarAccount,
				},
				{
					id: "task-schedule",
					name: "Phân công công việc",
					path: "/sys/assignment",
					icon: mdiCalendar,
				},
				{
					id: "attendance-management",
					name: "Chấm công",
					path: "/sys/attendance",
					icon: mdiClockCheckOutline,
				},
				{
					id: "payment-records",
					name: "Hồ sơ thanh toán",
					path: "/sys/payment-records",
					icon: mdiCreditCardSearch,
				},
			],
		},
		{
			id: "construction-management",
			name: "Quản lý thi công",
			path: "/sys/construction",
			icon: mdiWrenchClock,
			subMenu: [
				{
					id: "construction-logs",
					name: "Nhật ký thi công",
					path: "/sys/tasks/logs",
					icon: mdiNotebookMultiple,
				},
				{
					id: "construction-plans",
					name: "Phương án thi công",
					path: "/sys/partners/plans",
					icon: mdiFileDocumentOutline,
				},
			],
		},
		{
			id: "utilities",
			name: "Tiện ích",
			path: "/sys/utilities",
			icon: mdiApps,
			subMenu: [
				{
					id: "partner-management",
					name: "Quản lý đối tác",
					path: "/sys/partners",
					icon: mdiHandshake,
				},
				{
					id: "document-management",
					name: "Quản lý văn bản",
					path: "/sys/documents",
					icon: mdiFileDocumentMultipleOutline,
				},
				{
					id: "guide-management",
					name: "Quản lý tài liệu HD",
					path: "/sys/guides",
					icon: mdiFileDocumentOutline,
				},
				{
					id: "contract-management",
					name: "Quản lý hợp đồng",
					path: "/sys/contracts",
					icon: mdiFileSign,
				},
				{
					id: "backup-management",
					name: "Sao lưu & Phục hồi",
					path: "/sys/backup",
					icon: mdiDatabaseExport,
				},
			],
		},
	];

	const filteredItems = allItems.map((item) => {
		if (item.id === "work-management" && item.subMenu && role !== "admin") {
			return {
				...item,
				subMenu: item.subMenu.filter((sub) => sub.id !== "task-schedule"),
			};
		}
		if (item.id === "equipment-management" && item.subMenu && permissions.length === 0) {
			return {
				...item,
				subMenu: item.subMenu.filter((sub) => sub.id !== "equipment-inventory"),
			};
		}
		if (item.id === "construction-management" && item.subMenu && permissions.length === 0) {
			return {
				...item,
				subMenu: item.subMenu.filter((sub) => sub.id !== "construction-logs"),
			};
		}
		if (item.id === "utilities" && item.subMenu) {
			return {
				...item,
				subMenu: item.subMenu.filter((sub) => {
					if (sub.id === "contract-management") {
						return role === "admin" || permissions.includes("contract-management:view");
					}
					if (sub.id === "backup-management") {
						return role === "admin";
					}
					return true;
				}),
			};
		}
		return item;
	});

	if (role === "admin") {
		return filteredItems;
	}

	return filteredItems.filter((item) => item.id !== "dashboard");
};
