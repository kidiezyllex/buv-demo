import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TokenState {
    accessToken: string;
    expiresAt: number | null; // Timestamp khi token hết hạn
    isFetching: boolean;
    fetchToken: (forceRefresh?: boolean) => Promise<string>;
    clearToken: () => void;
    setAccessToken: (token: string) => void;
}

export const useTokenStore = create<TokenState>()(
    persist(
        (set, get) => ({
            accessToken: "",
            expiresAt: null,
            isFetching: false,
            fetchToken: async (forceRefresh = false) => {
                const state = get();
                
                // Nếu token còn hạn và không ép buộc lấy mới, không cần call API
                if (!forceRefresh && state.accessToken && state.expiresAt && Date.now() < state.expiresAt) {
                    return state.accessToken;
                }

                set({ isFetching: true });
                try {
                    const res = await fetch("/api/salesforce-token", { method: "POST" });
                    const data = await res.json();
                    
                    if (res.ok && data.access_token) {
                        // Lưu token và set thời gian hết hạn là 3 giờ (3 * 60 * 60 * 1000 ms)
                        set({
                            accessToken: data.access_token,
                            expiresAt: Date.now() + 3 * 60 * 60 * 1000,
                        });
                        return data.access_token;
                    } else {
                        throw new Error(data.message || "Lỗi khi lấy Token");
                    }
                } catch (error) {
                    console.error("Failed to fetch token:", error);
                    throw error;
                } finally {
                    set({ isFetching: false });
                }
            },
            clearToken: () => set({ accessToken: "", expiresAt: null }),
            setAccessToken: (token: string) => set({ 
                accessToken: token, 
                // Tự đặt thời gian sống 3 giờ nếu người dùng nhập tay
                expiresAt: Date.now() + 3 * 60 * 60 * 1000 
            }),
        }),
        {
            name: "salesforce-token-storage",
        }
    )
);
