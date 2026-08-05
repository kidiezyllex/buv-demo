import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { partnerApi } from "@/api/partners";
import { toast } from "react-toastify";

// --- SUB-MODULE 5A: PARTNER INFORMATION ---

export const usePartners = (params: any) => {
    return useQuery({
        queryKey: ["partners", params],
        queryFn: () => partnerApi.getPartners(params),
    });
};

export const useSearchPartners = (params: any) => {
    return useQuery({
        queryKey: ["partners", "search", params],
        queryFn: () => partnerApi.searchPartners(params),
        enabled: !!(params.partnerName || params.address),
    });
};

export const usePartnerDetails = (id: string) => {
    return useQuery({
        queryKey: ["partners", id],
        queryFn: () => partnerApi.getPartnerDetails(id),
        enabled: !!id,
    });
};

export const useCreatePartner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => partnerApi.createPartner(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partners"] });
            toast.success("Thêm đối tác thành công");
        },
        onError: (error: any) => {
            toast.error(error?.message || "Thêm đối tác thất bại");
        },
    });
};

export const useUpdatePartner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            partnerApi.updatePartner(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partners"] });
            toast.success("Cập nhật đối tác thành công");
        },
    });
};

export const useDeletePartner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => partnerApi.deletePartner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["partners"] });
        },
    });
};

// --- SUB-MODULE 5B: CONSTRUCTION PLANS ---

export const useConstructionPlans = (params: any) => {
    return useQuery({
        queryKey: ["construction-plans", params],
        queryFn: () => partnerApi.getPlans(params),
    });
};

export const usePlansByPartner = (partnerId: string) => {
    return useQuery({
        queryKey: ["construction-plans", "partner", partnerId],
        queryFn: () => partnerApi.getPlansByPartner(partnerId),
        enabled: !!partnerId,
    });
};

export const usePlanDetails = (id: string) => {
    return useQuery({
        queryKey: ["construction-plans", id],
        queryFn: () => partnerApi.getPlanDetails(id),
        enabled: !!id,
    });
};

export const useCreatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => partnerApi.createPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-plans"] });
            toast.success("Lưu phương án thi công thành công");
        },
    });
};

export const useUpdatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            partnerApi.updatePlan(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-plans"] });
            toast.success("Cập nhật phương án thành công");
        },
    });
};

export const useDeletePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => partnerApi.deletePlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["construction-plans"] });
            toast.success("Xóa phương án thành công");
        },
    });
};

export const useDownloadPlan = () => {
    return useMutation({
        mutationFn: (id: string) => partnerApi.downloadPlan(id),
        onSuccess: (response) => {
            if (response.statusCode === 200 && response.data?.url) {
                window.open(response.data.url, "_blank");
            }
        },
    });
};
