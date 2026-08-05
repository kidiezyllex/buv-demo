"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    mdiEye,
    mdiEyeOff,
    mdiLoading,
    mdiLockOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import React from "react";

interface SecurityTabProps {
    passwordForm: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    };
    showPasswords: {
        current: boolean;
        new: boolean;
        confirm: boolean;
    };
    isChangingPassword: boolean;
    setPasswordForm: React.Dispatch<React.SetStateAction<{
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }>>;
    setShowPasswords: React.Dispatch<React.SetStateAction<{
        current: boolean;
        new: boolean;
        confirm: boolean;
    }>>;
    handlePasswordChange: () => void;
}

export function SecurityTab({
    passwordForm,
    showPasswords,
    isChangingPassword,
    setPasswordForm,
    setShowPasswords,
    handlePasswordChange,
}: SecurityTabProps) {
    return (
        <Card className="p-3 md:p-4">
            <div className="flex items-center gap-3 md:gap-4">
                <h3 className="text-primary font-semibold whitespace-nowrap">Đổi mật khẩu</h3>
                <div className="flex-1 border-b border-dashed border-primary mr-1" />
            </div>

            <div className="flex md:flex-row flex-col items-end w-full">
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 md:flex-1 md:mr-4 mr-0 mb-3 md:mb-0">
                    <div className="space-y-1">
                        <Label>Mật khẩu hiện tại</Label>
                        <div className="relative">
                            <Input
                                type={showPasswords.current ? "text" : "password"}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                                placeholder="••••••••"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-primary transition-colors"
                            >
                                <Icon path={showPasswords.current ? mdiEyeOff : mdiEye} size={0.8} className="flex-shrink-0" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Mật khẩu mới</Label>
                        <div className="relative">
                            <Input
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                                placeholder="••••••••"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-primary transition-colors"
                            >
                                <Icon path={showPasswords.new ? mdiEyeOff : mdiEye} size={0.8} className="flex-shrink-0" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Xác nhận mật khẩu mới</Label>
                        <div className="relative">
                            <Input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                                placeholder="••••••••"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-primary transition-colors"
                            >
                                <Icon path={showPasswords.confirm ? mdiEyeOff : mdiEye} size={0.8} className="flex-shrink-0" />
                            </button>
                        </div>
                    </div>
                </div>

                <Button
                    className="w-full md:w-fit"
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                >
                    <Icon
                        path={isChangingPassword ? mdiLoading : mdiLockOutline}
                        size={0.8}
                        className={isChangingPassword ? "animate-spin" : ""}
                    />
                    {isChangingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                </Button>
            </div>
        </Card>
    );
}
