"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AccountLayout } from "@/components/account";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check token and redirect if needed
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (!accessToken) {
      // No token - redirect to login
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  // Check token before rendering
  if (typeof window !== "undefined") {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      // No token, redirecting (don't render)
      return null;
    }
  }

  // Token exists - render children
  return <AccountLayout>{children}</AccountLayout>;
}
