
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

async function wakeBackend() {
	for (let i = 0; i < 5; i++) {
		try {
			await fetch("https://companymanagementbe.onrender.com/api/v1/health")
			return
		} catch {
			await new Promise(r => setTimeout(r, 4000))
		}
	}
}

export const ReactQueryClientProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	useEffect(() => {
		wakeBackend()
	}, [])

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
