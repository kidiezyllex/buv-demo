"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  type ChartConfig
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useInspectionDue } from "@/hooks/useEquipment";
import {
  useAttendanceTodayReport,
  useBorrowReturnReport,
  useDocumentsMonthlyReport,
  useNotifications,
  usePaymentReport,
  useStatistics,
  useTaskReport,
} from "@/hooks/useReports";
import { useOverdueTasks } from "@/hooks/useTasks";
import {
  mdiAccountGroup,
  mdiAlertCircle,
  mdiArrowRightThin,
  mdiCalendarAlert,
  mdiCashMultiple,
  mdiClipboardText,
  mdiClockCheckOutline,
  mdiHandshake,
  mdiSwapHorizontal,
  mdiTools,
} from "@mdi/js";
import { Icon } from "@mdi/react";
import { motion } from "framer-motion";
import Link from "next/link";

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  href: string;
}

function MetricCard({ icon, title, value, subtitle, href }: MetricCardProps) {
  return (
    <Link href={href} className="h-full block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <Card className="h-full bg-gradient-to-br from-darkBackgroundV1 via-darkBackgroundV1 to-primary/10 border-primary/20 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex flex-col gap-2">
                <p className="text-sm uppercase text-nowrap truncate text-neutral-400 font-semibold tracking-wider">
                  {title}
                </p>
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold mt-2">{value}</h3>
                  <div className="p-3 rounded-full bg-darkBorderV1 text-neutral-300">
                    {icon}
                  </div>
                </div>
                {subtitle && <p className="text-sm font-semibold italic text-primary">{subtitle}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}

function ProgressBar({ value, total, colorClassName }: { value: number; total: number; colorClassName: string }) {
  const percent = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-darkBorderV1 overflow-hidden">
      <div className={`h-full rounded-full ${colorClassName}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="border-b border-b-darkBorderV1 py-3">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="border-b border-b-darkBorderV1 py-3">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[220px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(n: number) {
  if (!n) return "0 đ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

// Bảng màu dùng chung cho chart - bám theo theme của project (primary xanh lá + các status color đã dùng ở Badge)
const CHART_COLORS = {
  primary: "#41C651",
  secondary: "#2D8B38",
  cyan: "#22d3ee",
  amber: "#f59e0b",
  red: "#f87171",
  violet: "#a78bfa",
  neutral: "#9ca3af",
};

const TASK_STATUS_CONFIG = {
  pending: { label: "Chờ xử lý", color: CHART_COLORS.neutral },
  inProgress: { label: "Đang làm", color: CHART_COLORS.cyan },
  completed: { label: "Hoàn thành", color: CHART_COLORS.primary },
  overdue: { label: "Quá hạn", color: CHART_COLORS.red },
} satisfies ChartConfig;

const PAYMENT_STATUS_CONFIG = {
  amount: { label: "Số tiền" },
  pending: { label: "Chờ duyệt", color: CHART_COLORS.amber },
  approved: { label: "Đã duyệt", color: CHART_COLORS.cyan },
  rejected: { label: "Từ chối", color: CHART_COLORS.red },
  paid: { label: "Đã thanh toán", color: CHART_COLORS.primary },
} satisfies ChartConfig;

const ATTENDANCE_CONFIG = {
  count: { label: "Số nhân viên" },
} satisfies ChartConfig;

const DOCUMENT_CONFIG = {
  count: { label: "Số văn bản" },
} satisfies ChartConfig;

const ATTENDANCE_TYPE_LABEL: Record<string, string> = {
  present: "Làm tại VP",
  business_trip: "Công tác",
  weekend_work: "Đi T7/CN",
  compensatory_leave: "Nghỉ bù",
  annual_leave: "Nghỉ phép",
  sick_leave: "Nghỉ ốm",
  maternity_leave: "Thai sản",
  holiday: "Nghỉ lễ",
};

const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  incoming: "Công văn đến",
  outgoing: "Công văn đi",
  notification: "Thông báo",
  decision: "Quyết định",
  template: "Mẫu văn bản",
  guide: "Hướng dẫn",
  construction_profile: "Hồ sơ CT",
  procedure: "Quy trình",
  regulation: "Quy định",
  circular: "Thông tư",
};

export default function StatisticsPage() {
  const { data: statisticsRes, isLoading: isLoadingStats } = useStatistics();
  const { data: inspectionDueRes, isLoading: isLoadingInspection } = useInspectionDue(30);
  const { data: overdueRes, isLoading: isLoadingOverdue } = useOverdueTasks();
  const { data: notificationsRes, isLoading: isLoadingNotif } = useNotifications({
    limit: 15,
    page: 1,
  });
  const { data: taskReportRes, isLoading: isLoadingTaskReport } = useTaskReport();
  const { data: paymentReportRes, isLoading: isLoadingPayment } = usePaymentReport();
  const { data: attendanceTodayRes, isLoading: isLoadingAttendance } = useAttendanceTodayReport();
  const { data: borrowReturnRes, isLoading: isLoadingBorrowReturn } = useBorrowReturnReport();
  const { data: documentsMonthlyRes, isLoading: isLoadingDocuments } = useDocumentsMonthlyReport();

  const isLoading =
    isLoadingStats ||
    isLoadingInspection ||
    isLoadingOverdue ||
    isLoadingNotif ||
    isLoadingTaskReport ||
    isLoadingPayment ||
    isLoadingAttendance ||
    isLoadingBorrowReturn ||
    isLoadingDocuments;

  if (isLoading) return <DashboardSkeleton />;

  const stats = statisticsRes?.data ?? statisticsRes ?? {};
  const employees = stats.employees ?? stats.totalEmployees ?? 0;
  const equipment = stats.equipment ?? stats.totalEquipment ?? 0;
  const partners = stats.partners ?? stats.totalPartners ?? 0;
  const tasks = stats.tasks ?? stats.totalTasks ?? 0;

  const taskReport = taskReportRes?.data ?? {};
  const paymentReport = paymentReportRes?.data ?? {};
  const attendanceToday = attendanceTodayRes?.data ?? {};
  const borrowReturn = borrowReturnRes?.data ?? {};
  const documentsMonthly = documentsMonthlyRes?.data ?? {};

  const inspectionDueList = Array.isArray(inspectionDueRes?.data)
    ? inspectionDueRes.data
    : Array.isArray(inspectionDueRes?.data?.equipment)
      ? inspectionDueRes.data.equipment
      : inspectionDueRes?.data?.list ?? [];
  const overdueList = Array.isArray(overdueRes?.data)
    ? overdueRes.data
    : overdueRes?.data?.tasks ?? overdueRes?.data?.list ?? [];
  const notifications = Array.isArray(notificationsRes?.data)
    ? notificationsRes.data
    : notificationsRes?.data?.notifications ?? notificationsRes?.data ?? [];

  const alertCount =
    (inspectionDueList.length > 0 ? inspectionDueList.length : 0) +
    (overdueList.length > 0 ? overdueList.length : 0) +
    (paymentReport.pendingApproval?.count || 0) +
    (borrowReturn.overdue || 0) +
    notifications.filter((n: any) => n.priority === "high" || n.type === "borrow_conflict").length;

  const attendanceTotal = attendanceToday.totalActiveEmployees || 0;
  const attendanceRecorded = attendanceToday.totalRecorded || 0;

  // Chart data
  const taskStatusData = [
    { key: "pending", label: TASK_STATUS_CONFIG.pending.label, value: taskReport.pending || 0, fill: CHART_COLORS.neutral },
    { key: "inProgress", label: TASK_STATUS_CONFIG.inProgress.label, value: taskReport.inProgress || 0, fill: CHART_COLORS.cyan },
    { key: "completed", label: TASK_STATUS_CONFIG.completed.label, value: taskReport.completed || 0, fill: CHART_COLORS.primary },
    { key: "overdue", label: TASK_STATUS_CONFIG.overdue.label, value: taskReport.overdue || 0, fill: CHART_COLORS.red },
  ].filter((d) => d.value > 0);

  const paymentStatusData = [
    { key: "pending", label: PAYMENT_STATUS_CONFIG.pending.label, amount: paymentReport.statusBreakdown?.pending?.totalAmount || 0, fill: CHART_COLORS.amber },
    { key: "approved", label: PAYMENT_STATUS_CONFIG.approved.label, amount: paymentReport.statusBreakdown?.approved?.totalAmount || 0, fill: CHART_COLORS.cyan },
    { key: "rejected", label: PAYMENT_STATUS_CONFIG.rejected.label, amount: paymentReport.statusBreakdown?.rejected?.totalAmount || 0, fill: CHART_COLORS.red },
    { key: "paid", label: PAYMENT_STATUS_CONFIG.paid.label, amount: paymentReport.statusBreakdown?.paid?.totalAmount || 0, fill: CHART_COLORS.primary },
  ];

  const attendanceTypeData = Object.entries(attendanceToday.typeBreakdown || {}).map(([type, count]) => ({
    type,
    label: ATTENDANCE_TYPE_LABEL[type] || type,
    count: count as number,
  }));

  const documentTypeData = Object.entries(documentsMonthly.typeBreakdown || {}).map(([type, count]) => ({
    type,
    label: DOCUMENT_TYPE_LABEL[type] || type,
    count: count as number,
  }));

  return (
    <div className="space-y-3 md:space-y-4 bg-darkCardV1 p-3 md:p-4 rounded-2xl border border-darkBorderV1">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neutral-300">
            Bảng điều khiển
          </h1>
          <p className="text-neutral-400 mt-2 text-base">
            Chào mừng quay trở lại, đây là những gì đang diễn ra hôm nay.
          </p>
        </div>
        {alertCount > 0 && (
          <Badge variant="amber">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse mr-1.5" />
            {alertCount} cảnh báo cần xử lý
          </Badge>
        )}
      </div>

      {/* Số liệu tổng quan - GET /api/reports/statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          icon={<Icon path={mdiAccountGroup} size={0.8} className="flex-shrink-0" />}
          title="Nhân sự"
          value={employees}
          subtitle="Tổng số nhân viên"
          href="/sys/employees"
        />
        <MetricCard
          icon={<Icon path={mdiTools} size={0.8} className="flex-shrink-0" />}
          title="Thiết bị"
          value={equipment}
          subtitle="Tổng thiết bị & dụng cụ"
          href="/sys/equipment"
        />
        <MetricCard
          icon={<Icon path={mdiHandshake} size={0.8} className="flex-shrink-0" />}
          title="Đối tác"
          value={partners}
          subtitle="Tổng đối tác"
          href="/sys/partners"
        />
        <MetricCard
          icon={<Icon path={mdiClipboardText} size={0.8} className="flex-shrink-0" />}
          title="Công việc"
          value={tasks}
          subtitle={`${taskReport.completed ?? 0} hoàn thành · ${taskReport.overdue ?? 0} quá hạn`}
          href="/sys/tasks"
        />
      </div>

      {/* Thanh toán, Chấm công, Mượn trả thiết bị - dữ liệu vận hành hàng ngày */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="border border-darkBorderV1">
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Icon path={mdiCashMultiple} size={0.8} className="flex-shrink-0" />
                <span className="font-semibold">Thanh toán</span>
              </div>
              <Link
                href="/sys/payment-records"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Xem tất cả
                <Icon path={mdiArrowRightThin} size={0.8} className="flex-shrink-0" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 !bg-darkBackgroundV1 h-full !mt-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-300">Đã thanh toán</p>
              {paymentReport.statusBreakdown?.paid?.count > 0 ? (
                <Badge variant="green">{paymentReport.statusBreakdown.paid.count} phiếu</Badge>
              ) : (
                <Badge variant="neutral">Chưa có</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-300">Đang chờ duyệt</p>
              {paymentReport.pendingApproval?.count > 0 ? (
                <Badge variant="amber">{paymentReport.pendingApproval.count} phiếu</Badge>
              ) : (
                <Badge variant="green">Không có</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-darkBorderV1 !gap-0">
          <CardHeader className="border-b border-b-darkBorderV1 py-3 ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Icon path={mdiClockCheckOutline} size={0.8} className="flex-shrink-0" />
                <span className="font-semibold">Chấm công hôm nay</span>
              </div>
              <Link
                href="/sys/attendance"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Xem tất cả
                <Icon path={mdiArrowRightThin} size={0.8} className="flex-shrink-0" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 !bg-darkBackgroundV1 h-full !mt-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-300">
                Đã ghi nhận {attendanceRecorded}/{attendanceTotal}
              </p>
              <span className="text-sm font-semibold text-primary">
                {attendanceTotal > 0 ? Math.round((attendanceRecorded / attendanceTotal) * 100) : 0}%
              </span>
            </div>
            <ProgressBar value={attendanceRecorded} total={attendanceTotal} colorClassName="bg-primary" />
            {attendanceToday.notRecorded > 0 && (
              <p className="text-sm text-amber-400">{attendanceToday.notRecorded} nhân viên chưa chấm công</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-darkBorderV1">
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Icon path={mdiSwapHorizontal} size={0.8} className="flex-shrink-0" />
                <span className="font-semibold">Mượn trả thiết bị</span>
              </div>
              <Link
                href="/sys/equipment/borrow"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Xem tất cả
                <Icon path={mdiArrowRightThin} size={0.8} className="flex-shrink-0" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 !bg-darkBackgroundV1 h-full !mt-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-300">Đang mượn</p>
              <Badge variant="cyan">{borrowReturn.borrowed || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-300">Đã trả</p>
              <Badge variant="green">{borrowReturn.returned || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-300">Quá hạn trả</p>
              {borrowReturn.overdue > 0 ? (
                <Badge variant="destructive">{borrowReturn.overdue}</Badge>
              ) : (
                <Badge variant="green">Không có</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card className="border border-darkBorderV1">
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <div className="flex items-center gap-2 text-primary">
              <Icon path={mdiClipboardText} size={0.8} className="flex-shrink-0" />
              <span className="font-semibold">Phân bổ trạng thái công việc</span>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {taskStatusData.length === 0 ? (
              <p className="text-neutral-300 text-sm py-10 text-center">Chưa có dữ liệu công việc</p>
            ) : (
              <ChartContainer config={TASK_STATUS_CONFIG} className="mx-auto aspect-square max-h-[240px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
                  <Pie data={taskStatusData} dataKey="value" nameKey="label" innerRadius={55} outerRadius={85} strokeWidth={2}>
                    {taskStatusData.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} stroke="var(--darkCardV1, #051A1D)" />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
            {taskStatusData.length > 0 && (
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                {taskStatusData.map((entry) => (
                  <div key={entry.key} className="flex items-center gap-1.5 text-xs text-neutral-300">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.fill }} />
                    {entry.label} ({entry.value})
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-darkBorderV1">
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <div className="flex items-center gap-2 text-primary">
              <Icon path={mdiCashMultiple} size={0.8} className="flex-shrink-0" />
              <span className="font-semibold">Thanh toán theo trạng thái</span>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <ChartContainer config={PAYMENT_STATUS_CONFIG} className="max-h-[240px] w-full">
              <BarChart data={paymentStatusData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--darkBorderV1, #233738)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value) => formatCurrency(value as number)}
                    />
                  }
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {paymentStatusData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div> */}

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card className="border border-darkBorderV1">
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <div className="flex items-center gap-2 text-primary">
              <Icon path={mdiClockCheckOutline} size={0.8} className="flex-shrink-0" />
              <span className="font-semibold">Chấm công hôm nay theo loại</span>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {attendanceTypeData.length === 0 ? (
              <p className="text-neutral-300 text-sm py-10 text-center">Chưa có dữ liệu chấm công hôm nay</p>
            ) : (
              <ChartContainer config={ATTENDANCE_CONFIG} className="max-h-[220px] w-full">
                <BarChart data={attendanceTypeData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid horizontal={false} stroke="var(--darkBorderV1, #233738)" />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
                  <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border border-darkBorderV1">
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <div className="flex items-center gap-2 text-primary">
              <Icon path={mdiClipboardText} size={0.8} className="flex-shrink-0" />
              <span className="font-semibold">Văn bản theo loại (tháng này)</span>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {documentTypeData.length === 0 ? (
              <p className="text-neutral-300 text-sm py-10 text-center">Chưa có văn bản nào trong tháng này</p>
            ) : (
              <ChartContainer config={DOCUMENT_CONFIG} className="max-h-[220px] w-full">
                <BarChart data={documentTypeData} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid horizontal={false} stroke="var(--darkBorderV1, #233738)" />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
                  <Bar dataKey="count" fill={CHART_COLORS.cyan} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card className="border border-darkBorderV1">
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Icon path={mdiCalendarAlert} size={0.8} className="flex-shrink-0" />
                <span className="font-semibold">Thiết bị sắp hết hạn kiểm định</span>
              </div>
              <Link
                href="/sys/equipment/history"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Xem tất cả
                <Icon path={mdiArrowRightThin} size={0.8} className="flex-shrink-0" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {inspectionDueList.length === 0 ? (
              <p className="text-neutral-300 text-sm py-4 text-center">
                Không có thiết bị nào sắp đến hạn kiểm định (30 ngày)
              </p>
            ) : (
              <ul className="space-y-2 max-h-[240px] overflow-y-auto">
                {inspectionDueList.slice(0, 8).map((item: any, idx: number) => (
                  <li
                    key={item._id || item.equipmentId || idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-darkBorderV1/20 border border-darkBorderV1/40"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-300">
                        {item.equipmentName ?? item.equipmentCode ?? item.name ?? "Thiết bị"}
                      </p>
                      <p className="text-xs text-neutral-300">
                        Hạn KĐ: {formatDate(item.nextInspectionDate ?? item.nextInspection)}
                      </p>
                    </div>
                    <Badge variant="amber">Sắp hết hạn</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border border-darkBorderV1">
          <CardHeader className="border-b border-b-darkBorderV1 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Icon path={mdiAlertCircle} size={0.8} className="flex-shrink-0" />
                <span className="font-semibold">Công việc quá hạn</span>
              </div>
              <Link
                href="/sys/tasks"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Xem tất cả
                <Icon path={mdiArrowRightThin} size={0.8} className="flex-shrink-0" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            {overdueList.length === 0 ? (
              <p className="text-neutral-300 text-sm py-4 text-center">
                Không có công việc quá hạn
              </p>
            ) : (
              <ul className="space-y-2 max-h-[240px] overflow-y-auto">
                {overdueList.slice(0, 8).map((task: any, idx: number) => (
                  <li
                    key={task._id || idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-darkBorderV1/20 border border-darkBorderV1/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-300 truncate">
                        {task.taskContent ?? task.content ?? "Công việc"}
                      </p>
                      <p className="text-xs text-neutral-300">
                        Người nhận: {task.assigneeName ?? task.assignee ?? "-"} • Hạn:{" "}
                        {formatDate(task.deadline ?? task.dueDate)}
                      </p>
                    </div>
                    <Badge variant="destructive">Quá hạn</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
