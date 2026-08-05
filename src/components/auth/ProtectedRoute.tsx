"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/context/useUserContext";
import Image from "next/image";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoadingProfile, profile } = useUser();
  const router = useRouter();
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (!isLoadingProfile && !profile) {
      if (typeof window !== "undefined") {
        const hasAccessTokenLS =
          !!localStorage.getItem("accessToken") ||
          !!localStorage.getItem("token");
        const hasAccessTokenCookie =
          typeof document !== "undefined" &&
          document.cookie
            .split(";")
            .some((c) => c.trim().startsWith("accessToken="));

        if (hasAccessTokenLS || hasAccessTokenCookie) {
          try {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");
            localStorage.removeItem("userProfile");
          } catch (e) {
            console.error("Failed to clear auth storage", e);
          }

          if (typeof document !== "undefined") {
            document.cookie =
              "accessToken=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }

          router.push("/auth/login");
        }
      }
    }
  }, [isClient, isLoadingProfile, profile, router]);

  useEffect(() => {
    if (!isClient) return;

    const checkAuth = () => {
      const hasToken =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      const hasProfile = localStorage.getItem("userProfile");

      if (!hasToken && !hasProfile && !isLoadingProfile) {
        router.push("/auth/login");
      }
    };

    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
  }, [isClient, isLoadingProfile, router]);

  useEffect(() => {
    if (isClient && isAuthenticated && profile && !isLoadingProfile) {
      checkUserRole();
    }
  }, [isClient, isAuthenticated, profile, isLoadingProfile]);

  const checkUserRole = () => {
    if (!allowedRoles || allowedRoles.length === 0) {
      return;
    }

    setIsCheckingRole(true);

    const userRole = profile?.data?.role || "admin";

    if (!allowedRoles.includes(userRole)) {
      router.push("/sys");
    }

    setIsCheckingRole(false);
  };

  if (!isClient) {
    if (typeof window !== "undefined") {
      const storedProfile = localStorage.getItem("userProfile");
      const hasToken = localStorage.getItem("accessToken");

      if (storedProfile && hasToken) {
        return <>{children}</>;
      }
    }

    return (
      <div className="min-h-screen h-screen bg-darkBackgroundV1 flex flex-col items-center justify-center gap-3 md:gap-4">
        <Image
          src="/images/loading.gif"
          alt="Loading..."
          width={280}
          height={280}
          unoptimized
          draggable={false}
        />
      </div>
    );
  }

  if (isLoadingProfile || isCheckingRole) {
    return (
      <div className="min-h-screen h-screen bg-darkBackgroundV1 flex flex-col items-center justify-center gap-3 md:gap-4">
        <Image
          src="/images/loading.gif"
          alt="Loading..."
          width={280}
          height={280}
          unoptimized
          draggable={false}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen h-screen bg-darkBackgroundV1 flex flex-col items-center justify-center gap-3 md:gap-4">
        <Image
          src="/images/loading.gif"
          alt="Loading..."
          width={280}
          height={280}
          unoptimized
          draggable={false}
        />
      </div>
    );
  }

  return <>{children}</>;
}
