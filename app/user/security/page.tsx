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
import { changePassword, logoutAll } from "@/lib/api/auth";
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

export default function AccountSecurityPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Placeholder active sessions data
  const activeSessions = [
    {
      id: "1",
      device: "Chrome on Linux",
      location: "New York, USA",
      lastActive: "Just now",
      isCurrent: true,
    },
    {
      id: "2",
      device: "Safari on iPhone",
      location: "San Francisco, USA",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
  ];

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSuccess(false);
    setError(null);

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
        setError(errorMessage);
      }
    }
  };

  const handleLogoutAll = async () => {
    if (
      !confirm(
        "Are you sure you want to logout from all devices? You will need to sign in again on all devices."
      )
    ) {
      return;
    }

    setIsLoggingOutAll(true);
    setError(null);
    try {
      await logoutAll();
      // Redirect to login after logout all
      window.location.href = "/auth/login";
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to logout from all devices";
      setError(errorMessage);
      setIsLoggingOutAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {isSuccess && (
        <Alert variant="success" message="Password updated successfully!" />
      )}

      {/* Error Message */}
      {(errors.root || error) && (
        <Alert
          variant="error"
          message={errors.root?.message || error || "An error occurred"}
        />
      )}

      {/* Change Password Form */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Security Warning */}
            <div className="p-3 rounded-md bg-warning-50 border border-warning-200">
              <p className="text-body-sm text-warning-800 font-medium">
                Security Tip
              </p>
              <p className="text-body-xs text-warning-700 mt-1">
                Use a strong password with at least 8 characters, including
                letters, numbers, and special characters.
              </p>
            </div>

            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" required>
                Current Password
              </Label>
              <PasswordInput
                id="currentPassword"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={errors.currentPassword ? "true" : "false"}
                aria-describedby={
                  errors.currentPassword ? "currentPassword-error" : undefined
                }
                error={!!errors.currentPassword}
                disabled={isSubmitting}
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <FieldError
                  id="currentPassword-error"
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
                autoComplete="new-password"
                placeholder="••••••••"
                aria-required="true"
                aria-invalid={errors.newPassword ? "true" : "false"}
                aria-describedby={
                  errors.newPassword ? "newPassword-error" : undefined
                }
                error={!!errors.newPassword}
                disabled={isSubmitting}
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <FieldError
                  id="newPassword-error"
                  message={errors.newPassword.message || "Invalid password"}
                />
              )}
            </div>

            {/* Confirm Password */}
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
                disabled={isSubmitting}
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
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-neutral-200">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => reset()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
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
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Devices currently signed in to your account. Revoke any session you
            don&apos;t recognize.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSessions.length > 0 ? (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-neutral-200 rounded-md"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-body font-medium text-foreground">
                        {session.device}
                      </p>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 text-label font-medium bg-primary-100 text-primary-900 rounded-md">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm text-foreground-secondary mt-1">
                      {session.location} • Last active: {session.lastActive}
                    </p>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoggingOutAll}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-body text-foreground-secondary">
                No active sessions
              </p>
            </div>
          )}

          {/* Logout All Sessions Button */}
          {activeSessions.length > 1 && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="p-4 rounded-md bg-error-50 border border-error-200 mb-4">
                <p className="text-body-sm text-error-800 font-medium mb-1">
                  Warning
                </p>
                <p className="text-body-xs text-error-700">
                  This will sign you out of all devices except this one.
                  You&apos;ll need to sign in again on all other devices.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                disabled={isLoggingOutAll || isSubmitting}
                onClick={handleLogoutAll}
              >
                {isLoggingOutAll ? (
                  <ButtonLoading>Logging out...</ButtonLoading>
                ) : (
                  "Logout All Other Sessions"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
