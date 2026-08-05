"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { INotification } from "@/interface/report";
import { mdiCheckCircleOutline } from "@mdi/js";
import Icon from "@mdi/react";


interface NotificationListProps {
    notifications: INotification[];
    onMarkRead: (id: string) => void;
}

function formatDate(d: string) {
    if (!d) return "";
    return new Date(d).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const priorityMap = {
    low: { label: "Thấp", variant: "default" as const },
    medium: { label: "Trung bình", variant: "orange" as const },
    high: { label: "Cao", variant: "destructive" as const },
};

export function NotificationList({ notifications, onMarkRead }: NotificationListProps) {
    if (notifications.length === 0) {
        return (
            <div className="p-8 text-center text-neutral-300">
                Chưa có thông báo nào
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {notifications.map((notif) => {
                const priority = priorityMap[notif.priority] || priorityMap.medium;
                return (
                    <Card
                        key={notif._id}
                        className={`p-4 border border-darkBorderV1 transition-colors ${!notif.isRead ? "bg-primary/5 border-primary/20" : "bg-darkBackgroundV1/30"
                            }`}
                    >
                        <div className="flex items-start justify-between gap-3 md:gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className={`font-semibold ${!notif.isRead ? "text-neutral-300" : "text-neutral-300"}`}>
                                        {notif.title}
                                    </h4>
                                    <Badge variant={priority.variant}>
                                        {priority.label}
                                    </Badge>
                                    {!notif.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                                    )}
                                </div>
                                <p className="text-sm text-neutral-300 mt-1">{notif.message}</p>
                                <p className="text-xs text-neutral-300 mt-2">
                                    {formatDate(notif.createdAt)}
                                </p>
                            </div>
                            {!notif.isRead && (
                                <Button
                                    variant="outline"
                                    onClick={() => onMarkRead(notif._id)}
                                    className="shrink-0"
                                >
                                    <Icon path={mdiCheckCircleOutline} size={0.8} className="flex-shrink-0" />
                                    Đánh dấu đã đọc
                                </Button>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
