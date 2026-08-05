"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMyAttendanceStatus, useSelfCheckIn } from "@/hooks/useAttendance";
import { useMe } from "@/hooks/useAuth";
import {
    ATTENDANCE_TYPE_COLORS,
    AttendanceType,
} from "@/interface/attendance";
import { cn } from "@/lib/utils";
import {
    mdiAirplane,
    mdiBabyBottle,
    mdiCalendar,
    mdiCalendarCheck,
    mdiCheckCircle,
    mdiCoffee,
    mdiContentSave,
    mdiGestureDoubleTap,
    mdiMedicalBag,
    mdiOfficeBuildingMarker
} from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState } from "react";
import { BusinessTripDialog } from "./BusinessTripDialog";

const ATTENDANCE_OPTIONS_TILES: {
    value: AttendanceType;
    label: string;
    symbol: string;
    icon: string;
    description: string;
}[] = [
        { value: "present", label: "Làm tại VP", symbol: "VP", icon: mdiOfficeBuildingMarker, description: "Làm tại VP" },
        { value: "business_trip", label: "Công tác", symbol: "CT", icon: mdiAirplane, description: "Công tác" },
        { value: "compensatory_leave", label: "Nghỉ bù", symbol: "NB", icon: mdiCoffee, description: "Nghỉ bù" },
        { value: "annual_leave", label: "Nghỉ phép", symbol: "P", icon: mdiCalendarCheck, description: "Nghỉ phép" },
        { value: "sick_leave", label: "Nghỉ ốm", symbol: "O", icon: mdiMedicalBag, description: "Nghỉ ốm" },
        { value: "maternity_leave", label: "Nghỉ thai sản", symbol: "TS", icon: mdiBabyBottle, description: "Nghỉ thai sản" },
    ];

function formatDateVN(d: Date) {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatted = d.toLocaleDateString("vi-VN", options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function DailyTab() {
    const now = new Date();
    const todayDate = now.toISOString().slice(0, 10);

    const [selectedType, setSelectedType] = useState<AttendanceType>("present");

    const { data: meResponse } = useMe();
    const profile = meResponse?.data;

    const { data: statusResponse } = useMyAttendanceStatus();
    const myRecordToday = statusResponse?.data;

    const [isBusinessTripDialogOpen, setIsBusinessTripDialogOpen] = useState(false);
    const { mutate: doSelfCheckIn, isPending: isCheckingIn } = useSelfCheckIn();

    const isLocked = !!myRecordToday?.isLocked;

    useMemo(() => {
        if (myRecordToday) {
            setSelectedType(myRecordToday.type);
        }
    }, [myRecordToday]);

    const handleSaveSelf = () => {
        if (isLocked) return;
        if (selectedType === "business_trip") {
            setIsBusinessTripDialogOpen(true);
        } else {
            doSelfCheckIn({
                type: selectedType,
                notes: "",
                date: todayDate,
            });
        }
    };

    const handleConfirmBusinessTrip = (data: { businessTripNotes: string; notes: string }) => {
        doSelfCheckIn({
            type: "business_trip",
            businessTripNotes: data.businessTripNotes,
            notes: data.notes,
            date: todayDate,
        }, {
            onSuccess: () => {
                setIsBusinessTripDialogOpen(false);
            }
        });
    };

    return (
        <>
            <motion.div
                key="daily"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center space-y-4"
            >
                <Card className="w-full relative overflow-hidden border border-darkBorderV1 bg-darkCardV1">
                    <div className="absolute inset-x-0 top-0 h-32 md:h-24 overflow-hidden">
                        <img src="/images/profile.gif" alt="" className="w-full h-full object-cover" draggable={false} />
                        <div className="absolute inset-0 bg-darkCardV1/60" />
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-5">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-[3px] border-primary/30 bg-darkBackgroundV1 p-1 shadow-lg shadow-primary/10">
                                <img
                                    src={profile?.user?.avatar || profile?.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.username || "Sophie"}`}
                                    alt="Avatar"
                                    className="w-full h-full rounded-xl object-cover"
                                />
                            </div>

                            <div className="flex-1 space-y-1 pb-1">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl md:text-2xl font-semibold text-neutral-300">
                                        {profile?.user?.fullName || profile?.fullName || "---"}
                                    </h1>
                                    <Badge variant="green">
                                        {profile?.user?.employeeCode || profile?.username}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-1">
                                    <Badge variant="green">Vai trò:</Badge>
                                    <Badge variant="neutral">{profile?.user?.position || profile?.role || "---"}</Badge>
                                    <span>--</span>
                                    <Badge variant="green">Phòng ban:</Badge>
                                    <Badge variant="neutral">{profile?.user?.department || "---"}</Badge>
                                </div>
                            </div>

                            <div className="flex w-full md:w-fit flex-col md:flex-row justify-center items-center gap-4">
                                <div className="flex w-full flex-row justify-between md:flex-col gap-1">
                                    <div className="flex  items-center gap-1 text-primary font-semibold text-sm">
                                        <Icon path={mdiGestureDoubleTap} size={0.8} className="flex-shrink-0" />
                                        Chấm công hôm nay
                                    </div>
                                    <div className="flex items-center gap-1 text-primary font-semibold text-sm">
                                        <Icon path={mdiCalendar} size={0.8} className="flex-shrink-0" />
                                        {formatDateVN(now)}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSaveSelf}
                                    disabled={isLocked || isCheckingIn}
                                    className="w-full md:w-fit"
                                >
                                    {isLocked ? (
                                        <>
                                            <Icon path={mdiCheckCircle} size={0.8} className="flex-shrink-0" />
                                            Đã xác thực công
                                        </>
                                    ) : (
                                        <>
                                            <Icon path={mdiContentSave} size={0.8} className="flex-shrink-0" />
                                            Lưu chấm công
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4 w-full">
                    {ATTENDANCE_OPTIONS_TILES.map((opt) => {
                        const isSelected = selectedType === opt.value;
                        return (
                            <motion.div
                                key={opt.value}
                                whileHover={!isLocked ? { scale: 1.02, y: -4 } : {}}
                                whileTap={!isLocked ? { scale: 0.98 } : {}}
                                onClick={() => !isLocked && setSelectedType(opt.value)}
                                className={`relative cursor-pointer rounded-2xl p-3 flex flex-col items-center justify-center transition-all duration-300 border-2 h-fit ${isSelected
                                    ? "bg-primary/5 border-primary shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.2)]"
                                    : "bg-darkCardV1 border-darkBorderV1 hover:border-neutral-700 shadow-xl"
                                    } ${isLocked && !isSelected ? "opacity-40 grayscale-[0.5] cursor-not-allowed" : ""}`}
                            >
                                {isSelected && (
                                    <div className="absolute top-2 right-2 bg-primary text-neutral-300 p-1 rounded-full shadow-lg">
                                        <Icon path={mdiCheckCircle} size={0.8} className="flex-shrink-0" />
                                    </div>
                                )}

                                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${isSelected ? "bg-primary/20" : "bg-darkBackgroundV1 border border-darkBorderV1"
                                    }`}>
                                    <Icon
                                        path={opt.icon}
                                        size={1.2}
                                        className={isSelected ? "text-primary" : "text-neutral-300"}
                                    />
                                </div>

                                <div className="flex flex-col justify-center items-center gap-2">
                                    <div className="flex items-center gap-2 px-1.5 py-1 rounded-lg border border-darkBorderV1 bg-darkCardV2/30">
                                        <Badge variant={ATTENDANCE_TYPE_COLORS[opt.value] as any}>
                                            {opt.symbol}
                                        </Badge>
                                        <span className={cn(
                                            "text-xs font-semibold",
                                            ATTENDANCE_TYPE_COLORS[opt.value] === "green" && "text-green-400",
                                            ATTENDANCE_TYPE_COLORS[opt.value] === "indigo" && "text-indigo-400",
                                            ATTENDANCE_TYPE_COLORS[opt.value] === "orange" && "text-orange-400",
                                            ATTENDANCE_TYPE_COLORS[opt.value] === "blue" && "text-blue-400",
                                            ATTENDANCE_TYPE_COLORS[opt.value] === "amber" && "text-amber-400",
                                            ATTENDANCE_TYPE_COLORS[opt.value] === "pink" && "text-pink-400",
                                            (!ATTENDANCE_TYPE_COLORS[opt.value] || ATTENDANCE_TYPE_COLORS[opt.value] === "neutral") && "text-neutral-300"
                                        )}>{opt.label}</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {isLocked && (
                    <div className="w-full bg-green-500/10 border border-green-500/20 p-4 rounded-3xl flex items-center justify-center text-green-400 flex-col pb-8">
                        <Image
                            src="/images/attendance.gif"
                            alt="attendance"
                            width={280}
                            height={280}
                            unoptimized
                            draggable={false}
                        />
                        <div className="flex items-center gap-2">
                            <Icon path={mdiCheckCircle} size={1} />
                            <span className="text-lg font-semibold">BẠN ĐÃ HOÀN THÀNH CHẤM CÔNG NGÀY HÔM NAY</span>
                        </div>

                    </div>
                )}
            </motion.div>

            <BusinessTripDialog
                isOpen={isBusinessTripDialogOpen}
                isSubmitting={isCheckingIn}
                onClose={() => setIsBusinessTripDialogOpen(false)}
                onConfirm={handleConfirmBusinessTrip}
            />
        </>
    );
}
