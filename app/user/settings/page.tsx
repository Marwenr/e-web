"use client";

import { useState, useEffect } from "react";
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
  Input,
  Label,
} from "@/components/ui";
import { UserIcon } from "@/components/svg";
import { Alert, FieldError, ButtonLoading } from "@/components/patterns";
import { useAuthStore } from "@/store/auth";
import { updateProfile } from "@/lib/api/user";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function UserSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  // Pre-fill inputs with current user data from store
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSuccess(false);
    try {
      // Call API to update user profile
      const updatedUser = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // Update the store with new user data
      updateUser({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to update profile. Please try again.";
      setFormError("root", { message: errorMessage });
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {isSuccess && (
        <Alert variant="success" message="Profile updated successfully!" />
      )}

      {/* Error Message */}
      {errors.root && (
        <Alert
          variant="error"
          message={errors.root.message || "An error occurred"}
        />
      )}

      {/* Profile Information Card */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                  <UserIcon className="h-10 w-10 sm:h-12 sm:w-12 text-foreground-tertiary" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="avatar" className="text-body-sm">
                  Profile Picture
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <label
                    htmlFor="avatar"
                    className="inline-flex items-center justify-center px-4 py-2 text-body-sm font-medium text-primary-900 bg-background border border-primary-900 rounded-md hover:bg-primary-50 cursor-pointer transition-colors"
                  >
                    Change Photo
                    <input
                      id="avatar"
                      name="avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    Remove
                  </Button>
                </div>
                <p className="text-body-xs text-foreground-tertiary">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200" />

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" required>
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="John"
                  aria-required="true"
                  disabled={isSubmitting}
                  error={!!errors.firstName}
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <FieldError
                    message={
                      errors.firstName.message || "First name is required"
                    }
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" required>
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  aria-required="true"
                  disabled={isSubmitting}
                  error={!!errors.lastName}
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <FieldError
                    message={errors.lastName.message || "Last name is required"}
                  />
                )}
              </div>
            </div>

            {/* Email Field (Readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={user?.email || ""}
                readOnly
                disabled
                className="bg-neutral-50 cursor-not-allowed"
                aria-label="Email address (cannot be changed)"
              />
              <p className="text-body-xs text-foreground-tertiary">
                Email cannot be changed. Contact support if you need to update
                your email address.
              </p>
            </div>

            {/* Save Button */}
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
                  <ButtonLoading loadingText="Saving...">
                    Save Changes
                  </ButtonLoading>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
