import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mdiDeleteForever } from "@mdi/js";
import Icon from "@mdi/react";
import {
  IconAlertTriangle,
  IconLoader2,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { toast } from "react-toastify";

interface DeleteDialogProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<any>;
  title: string;
  description: string;
  confirmText: string;
  successMessage: string;
  errorMessage: string;
  warningMessage?: string;
}

export const DeleteDialog = ({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  successMessage,
  errorMessage,
}: DeleteDialogProps) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      toast.success(successMessage);
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            <Icon path={mdiDeleteForever} size={0.8} className="flex-shrink-0" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-3 md:p-4">
          {description && (
            <div className="bg-darkBorderV1 border-darkBorderV1 border rounded-lg p-3 md:p-4">
              <div className="flex items-start gap-2">
                <IconAlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-400">
                  <p className="font-semibold mb-1">Warning:</p>
                  <p>{description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 bg-transparent border-neutral-400/50 text-neutral-300 hover:bg-darkBorderV1"
          >
            <IconX className="h-4 w-4 text-neutral-300" />
            <span className="text-neutral-300">Hủy</span>
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <IconTrash className="h-4 w-4" />
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
