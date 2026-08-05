import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { backupApi } from "@/api/backup";

export const useCollectionsInfo = () => {
    return useQuery({
        queryKey: ["backup", "collections-info"],
        queryFn: () => backupApi.getCollectionsInfo(),
    });
};

export const useBackupHistory = (params: any) => {
    return useQuery({
        queryKey: ["backup-history", params],
        queryFn: () => backupApi.getHistory(params),
    });
};

export const useExportBackup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => backupApi.exportBackup(),
        onSuccess: ({ blob, fileName }) => {
            saveAs(blob, fileName);
            queryClient.invalidateQueries({ queryKey: ["backup-history"] });
            queryClient.invalidateQueries({ queryKey: ["backup", "collections-info"] });
            toast.success("Tải backup thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Tải backup thất bại");
        },
    });
};

export const useValidateRestore = () => {
    return useMutation({
        mutationFn: ({ file }: { file: File }) => backupApi.validateRestore(file),
        onError: (error: any) => {
            toast.error(error?.message || "Kiểm tra file backup thất bại");
        },
    });
};

export const useExecuteRestore = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ file, checksum, confirmText }: { file: File; checksum: string; confirmText: string }) =>
            backupApi.executeRestore(file, checksum, confirmText),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["backup-history"] });
            queryClient.invalidateQueries({ queryKey: ["backup", "collections-info"] });
            toast.success("Phục hồi dữ liệu thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Phục hồi dữ liệu thất bại");
        },
    });
};
