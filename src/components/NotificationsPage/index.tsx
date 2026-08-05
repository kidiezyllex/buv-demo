"use client";

import { useState } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { motion } from "framer-motion";
import {
    useNotifications,
    useUnreadCount,
    useMarkRead,
    useMarkReadAll,
} from "@/hooks/useReports";
import { NotificationList } from "./NotificationList";

export default function NotificationsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const { data: notifResponse, isLoading } = useNotifications({
        page: currentPage,
        limit: pageSize,
    });
    const { data: unreadData } = useUnreadCount();
    const { mutate: markRead } = useMarkRead();
    const { mutate: markReadAllMutation } = useMarkReadAll();

    const notifications = notifResponse?.data?.notifications || notifResponse?.data || [];
    const list = Array.isArray(notifications) ? notifications : [];
    const totalItems = notifResponse?.data?.pagination?.total ?? list.length;
    const totalPages = notifResponse?.data?.pagination?.totalPages || 1;
    const unreadCount = unreadData?.data?.count ?? unreadData?.count ?? 0;

    const handleMarkRead = (id: string) => {
        markRead(id);
    };

    return (
        <div className="space-y-3 md:space-y-4 bg-darkCardV1  p-3 md:p-4 rounded-2xl border border-darkBorderV1 min-h-[80vh]">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/sys">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Thông báo</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col gap-3 md:gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4">
                        <h2 className="text-xl font-semibold text-neutral-300">
                            Thông báo
                            {unreadCount > 0 && (
                                <span className="ml-2 text-sm font-normal text-primary">
                                    ({unreadCount} chưa đọc)
                                </span>
                            )}
                        </h2>
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => markReadAllMutation()}
                                className="border-primary/50 text-primary"
                            >
                                Đánh dấu tất cả đã đọc
                            </Button>
                        )}
                    </div>

                    <Card className="p-4 border border-darkBorderV1 bg-transparent">
                        {isLoading ? (
                            <div className="space-y-3 md:space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <NotificationList
                                notifications={list}
                                onMarkRead={handleMarkRead}
                            />
                        )}
                    </Card>

                    {totalItems > pageSize && (
                        <div className="flex justify-center">
                            <Pagination
                                page={currentPage}
                                pageSize={pageSize}
                                total={totalItems}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
