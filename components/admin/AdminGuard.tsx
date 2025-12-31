"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { LoadingSpinner } from "@/components/patterns";

interface AdminGuardProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "staff" | "super_admin";
}

/**
 * AdminGuard component
 * Protects admin routes by checking authentication and admin role
 * Handles loading, unauthorized, and forbidden states
 */
export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  requiredRole = "admin",
}) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState<
    "unauthenticated" | "unauthorized" | "forbidden" | null
  >(null);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);
      setAccessDenied(null);

      // Initialize auth state if not already done
      if (!isAuthenticated && !isLoading) {
        await initialize();
      }

      // Wait a bit for auth state to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      setIsChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, isLoading, initialize]);

  // Handle navigation in useEffect to avoid setState during render
  useEffect(() => {
    if (isChecking || isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      setAccessDenied("unauthenticated");
      router.push("/auth/login?redirect=/admin");
      return;
    }

    // Check if user has admin role
    const adminRoles = ["admin", "staff", "super_admin"];
    const userRole = user.role?.toLowerCase();

    if (!adminRoles.includes(userRole)) {
      setAccessDenied("unauthorized");
      return;
    }

    // Check specific role requirement
    if (requiredRole === "super_admin" && userRole !== "super_admin") {
      setAccessDenied("forbidden");
      return;
    }

    // User has access
    setAccessDenied(null);
  }, [isChecking, isLoading, isAuthenticated, user, requiredRole, router]);

  // Show loading state
  if (isChecking || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show unauthenticated state (redirecting)
  if (accessDenied === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-body text-foreground-secondary mt-4">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // Show unauthorized state (not admin)
  if (accessDenied === "unauthorized") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-h2 font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-body text-foreground-secondary mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-primary-900 text-white rounded-md hover:bg-primary-800 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Show forbidden state (insufficient role)
  if (accessDenied === "forbidden") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-h2 font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-body text-foreground-secondary mb-6">
            This page requires Super Admin privileges.
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 bg-primary-900 text-white rounded-md hover:bg-primary-800 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // User has access, render children
  return <>{children}</>;
};
