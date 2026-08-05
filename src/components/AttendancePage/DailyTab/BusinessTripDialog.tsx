import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mdiAirplane, mdiContentSave } from "@mdi/js";
import Icon from "@mdi/react";
import { IconX } from "@tabler/icons-react";
import { useState } from "react";

interface BusinessTripDialogProps {
    isOpen: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: (data: { businessTripNotes: string; notes: string }) => void;
}

export const BusinessTripDialog = ({
    isOpen,
    isSubmitting,
    onClose,
    onConfirm,
}: BusinessTripDialogProps) => {
    const [businessTripNotes, setBusinessTripNotes] = useState("");
    const [notes, setNotes] = useState("");

    const handleConfirm = () => {
        onConfirm({ businessTripNotes, notes });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-primary flex items-center gap-2">
                        <Icon path={mdiAirplane} size={0.8} />
                        Ghi chú công tác
                    </DialogTitle>
                </DialogHeader>

                <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="businessTripNotes">Nội dung công tác</Label>
                        <Input
                            id="businessTripNotes"
                            placeholder="Ví dụ: Đi khảo sát công trình cầu Rồng"
                            value={businessTripNotes}
                            onChange={(e) => setBusinessTripNotes(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Ghi chú thêm</Label>
                        <Textarea
                            id="notes"
                            placeholder="Ví dụ: Kèm theo biên bản khảo sát số 01"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 bg-transparent border-neutral-400/50 text-neutral-300 hover:bg-darkBorderV1"
                    >
                        <IconX className="h-4 w-4 text-neutral-300" />
                        <span className="text-neutral-300">Hủy</span>
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isSubmitting || !businessTripNotes.trim()}
                        className="flex-1"
                    >
                        <Icon path={mdiContentSave} size={0.8} />
                        Lưu chấm công
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
