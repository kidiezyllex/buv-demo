"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

interface EditFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}

export function EditField({ label, value, onChange, placeholder }: EditFieldProps) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || label} />
        </div>
    );
}
