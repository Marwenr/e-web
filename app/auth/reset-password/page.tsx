"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, PasswordInput, Label } from "@/components/ui";
import { AuthLayout } from "@/components/auth";
import { Alert, FieldError, ButtonLoading } from "@/components/patterns";
import { resetPassword } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, setLoading } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setFormError("root", {
        message:
          "Invalid or missing reset token. Please request a new password reset link.",
      });
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, setFormError]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setFormError("root", { message: "Invalid reset token" });
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, data.password);
      setIsSuccess(true);
    } catch (err: any) {
      const errorMessage =
        err.message || "Password reset failed. Please try again.";
      setFormError("root", { message: errorMessage });
      setLoading(false);
    }
  };

  return (
    <>
      {isSuccess ? (
        /* Success Message */
        <div className="space-y-4">
          <Alert
            variant="success"
            title="Password reset successful!"
            message="Your password has been successfully updated. You can now sign in with your new password."
          />
          <Link href="/auth/login" className="block">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              type="button"
            >
              Go to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        /* Reset Form */
        <form
          className="space-y-4"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* General Error Message */}
          {errors.root && (
            <Alert
              variant="error"
              message={errors.root.message || "An error occurred"}
            />
          )}

          {/* Instructions */}
          <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200">
            <p className="text-body-sm text-foreground-secondary">
              Please enter your new password. Make sure it&apos;s at least 8
              characters long and includes a mix of letters, numbers, and
              special characters.
            </p>
          </div>

          {/* New Password Input */}
          <div className="space-y-2">
            <Label htmlFor="password" required>
              New Password
            </Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-required="true"
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
              error={!!errors.password}
              disabled={isLoading || !token}
              {...register("password")}
            />
            {errors.password && (
              <FieldError
                id="password-error"
                message={errors.password.message || "Invalid password"}
              />
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" required>
              Confirm New Password
            </Label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••"
              aria-required="true"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
              error={!!errors.confirmPassword}
              disabled={isLoading || !token}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <FieldError
                id="confirmPassword-error"
                message={
                  errors.confirmPassword.message || "Passwords do not match"
                }
              />
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading || !token}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <ButtonLoading loadingText="Resetting password...">
                Reset Password
              </ButtonLoading>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset Password"
      description="Enter your new password below"
      footerLinks={[
        {
          text: "Back to Sign In",
          href: "/auth/login",
          label: "Navigate to login page",
        },
      ]}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
