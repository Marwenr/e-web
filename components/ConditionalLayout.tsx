"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuthStore, useCartStore } from "@/store";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const isAdminPage = pathname?.startsWith("/admin");
  const { initialize: initializeAuth } = useAuthStore();
  const { initialize: initializeCart } = useCartStore();

  // Initialize stores on app load
  useEffect(() => {
    initializeAuth();
    initializeCart();
  }, [initializeAuth, initializeCart]);

  return (
    <>
      {!isAuthPage && !isAdminPage && <Navbar />}
      <div className="min-h-screen">{children}</div>
      {!isAuthPage && !isAdminPage && <Footer />}
    </>
  );
}
