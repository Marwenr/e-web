"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PasswordInput,
  Label,
} from "@/components/ui";
import { Alert, FieldError, ButtonLoading } from "@/components/patterns";
import { changePassword } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const { isLoading, setLoading } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setLoading(true);
    setIsSuccess(false);

    try {
      await changePassword(data.currentPassword, data.newPassword);
      setIsSuccess(true);
      reset();
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Password change failed. Please try again.";

      if (
        errorMessage.toLowerCase().includes("current password") ||
        errorMessage.toLowerCase().includes("incorrect")
      ) {
        setFormError("currentPassword", { message: errorMessage });
      } else {
        setFormError("root", { message: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {isSuccess && (
        <Alert variant="success" message="Password updated successfully!" />
      )}

      {/* Error Message */}
      {errors.root && (
        <Alert
          variant="error"
          message={errors.root.message || "An error occurred"}
        />
      )}

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" required>
                Current Password
              </Label>
              <PasswordInput
                id="currentPassword"
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={errors.currentPassword ? "true" : "false"}
                disabled={isLoading}
                error={!!errors.currentPassword}
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <FieldError
                  message={
                    errors.currentPassword.message || "Invalid current password"
                  }
                />
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" required>
                New Password
              </Label>
              <PasswordInput
                id="newPassword"
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={errors.newPassword ? "true" : "false"}
                disabled={isLoading}
                error={!!errors.newPassword}
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <FieldError
                  message={errors.newPassword.message || "Invalid password"}
                />
              )}
              <p className="text-body-xs text-foreground-tertiary">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" required>
                Confirm New Password
              </Label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                disabled={isLoading}
                error={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <FieldError
                  message={
                    errors.confirmPassword.message || "Passwords do not match"
                  }
                />
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <ButtonLoading loadingText="Updating...">
                    Update Password
                  </ButtonLoading>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
