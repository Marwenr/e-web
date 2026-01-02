"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If user is already connected, redirect to settings
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (accessToken) {
      // User is connected - redirect to settings
      router.push("/user/settings");
    }
  }, [router]);

  // If connected, don't render auth pages (redirecting)
  if (typeof window !== "undefined") {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      return null; // Redirecting to settings
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary pt-24 pb-8 px-4 sm:pt-28 sm:pb-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
