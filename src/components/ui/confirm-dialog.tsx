import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  IconAlertTriangle,
  IconCheck,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  variant?: "default" | "destructive" | "warning";
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isPending = false,
  variant = "default",
}: ConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconAlertTriangle
              className={cn(
                "h-5 w-5",
                variant === "destructive"
                  ? "text-red-400"
                  : variant === "warning"
                    ? "text-yellow-500"
                    : "text-primary",
              )}
            />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-3 md:p-4">
          <p className="text-sm text-neutral-300">{description}</p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 bg-transparent border-neutral-400/50 text-neutral-300 hover:bg-darkBorderV1"
          >
            <IconX className="h-4 w-4 text-neutral-300" />
            <span className="text-neutral-300">{cancelText}</span>
          </Button>
          <Button className="flex-1" onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconCheck className="h-4 w-4" />
            )}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
