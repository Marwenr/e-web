"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Label } from "@/components/ui";
import { AuthLayout } from "@/components/auth";
import { Alert, FieldError, ButtonLoading } from "@/components/patterns";
import { forgotPassword } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { isLoading, setLoading } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);

    try {
      await forgotPassword(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      const errorMessage =
        err.message || "Failed to send reset link. Please try again.";
      setFormError("root", { message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      description="Enter your email address and we'll send you a link to reset your password"
      footerLinks={[
        {
          text: "Remember your password? Sign in",
          href: "/auth/login",
          label: "Navigate to login page",
        },
      ]}
    >
      {isSuccess ? (
        /* Success Message */
        <div className="space-y-4">
          <Alert
            variant="success"
            title="Reset link sent!"
            message="We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password."
          />
          <div className="text-center space-y-2">
            <p className="text-body-sm text-foreground-secondary">
              Didn&apos;t receive the email? Check your spam folder or try
              again.
            </p>
          </div>
        </div>
      ) : (
        /* Reset Form */
        <form
          className="space-y-4"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Error Message */}
          {errors.root && (
            <Alert
              variant="error"
              message={errors.root.message || "An error occurred"}
            />
          )}

          {/* Instructions */}
          <div className="p-3 rounded-md bg-neutral-50 border border-neutral-200">
            <p className="text-body-sm text-foreground-secondary">
              Enter the email address associated with your account, and
              we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-required="true"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              error={!!errors.email}
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <FieldError
                id="email-error"
                message={errors.email.message || "Invalid email"}
              />
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <ButtonLoading loadingText="Sending reset link...">
                Send Reset Link
              </ButtonLoading>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
