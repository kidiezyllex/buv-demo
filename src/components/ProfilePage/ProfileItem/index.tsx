"use client";

import Icon from "@mdi/react";
import React from "react";

interface ProfileItemProps {
    icon: string;
    label: string;
    value: React.ReactNode;
}

export function ProfileItem({ icon, label, value }: ProfileItemProps) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-darkBackgroundV1/50 border border-darkBorderV1/50">
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon path={icon} size={1} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <span className="text-sm text-neutral-300 block font-semibold">{label}</span>
                <div className="text-sm text-neutral-300 mt-0.5">
                    {value || <span className="italic text-neutral-400">Chưa thiết lập</span>}
                </div>
            </div>
        </div>
    );
}
