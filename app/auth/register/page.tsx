"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, PasswordInput, Label } from "@/components/ui";
import { AuthLayout } from "@/components/auth";
import { Alert, FieldError, ButtonLoading } from "@/components/patterns";
import { register } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").trim(),
    lastName: z.string().min(1, "Last name is required").trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuthData, setLoading, isLoading } = useAuthStore();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);

    try {
      const result = await register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // Update auth store
      setAuthData(result);

      // Redirect to verify email page
      router.push("/auth/verify-email");
    } catch (err: any) {
      const errorMessage =
        err.message || "Registration failed. Please try again.";

      // Check if it's a field-specific error
      if (errorMessage.toLowerCase().includes("email")) {
        setFormError("email", { message: errorMessage });
      } else {
        setFormError("root", { message: errorMessage });
      }
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      description="Enter your information to create a new account"
      footerLinks={[
        {
          text: "Already have an account? Sign in",
          href: "/auth/login",
          label: "Navigate to login page",
        },
      ]}
    >
      <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
        {/* General Error Message */}
        {errors.root && (
          <Alert
            variant="error"
            message={errors.root.message || "An error occurred"}
          />
        )}

        {/* First Name & Last Name Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
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
              aria-invalid={errors.firstName ? "true" : "false"}
              aria-describedby={
                errors.firstName ? "firstName-error" : undefined
              }
              error={!!errors.firstName}
              disabled={isLoading}
              {...registerField("firstName")}
            />
            {errors.firstName && (
              <FieldError
                id="firstName-error"
                message={errors.firstName.message || "First name is required"}
              />
            )}
          </div>

          {/* Last Name */}
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
              aria-invalid={errors.lastName ? "true" : "false"}
              aria-describedby={errors.lastName ? "lastName-error" : undefined}
              error={!!errors.lastName}
              disabled={isLoading}
              {...registerField("lastName")}
            />
            {errors.lastName && (
              <FieldError
                id="lastName-error"
                message={errors.lastName.message || "Last name is required"}
              />
            )}
          </div>
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
            {...registerField("email")}
          />
          {errors.email && (
            <FieldError
              id="email-error"
              message={errors.email.message || "Invalid email"}
            />
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="password" required>
            Password
          </Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-required="true"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
            error={!!errors.password}
            disabled={isLoading}
            {...registerField("password")}
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
            Confirm Password
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
            disabled={isLoading}
            {...registerField("confirmPassword")}
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

        {/* Terms Checkbox */}
        <div className="space-y-2">
          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              aria-required="true"
              aria-invalid={errors.terms ? "true" : "false"}
              aria-describedby={errors.terms ? "terms-error" : undefined}
              className="h-4 w-4 mt-1 rounded border-neutral-300 text-primary-900 focus:ring-primary-500 focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              {...registerField("terms")}
            />
            <Label htmlFor="terms" className="ml-2 text-body-sm">
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-primary-900 hover:text-primary-800 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-sm"
                tabIndex={isLoading ? -1 : 0}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-primary-900 hover:text-primary-800 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-sm"
                tabIndex={isLoading ? -1 : 0}
              >
                Privacy Policy
              </Link>
            </Label>
          </div>
          {errors.terms && (
            <FieldError
              id="terms-error"
              message={
                errors.terms.message ||
                "You must agree to the terms and conditions"
              }
            />
          )}
        </div>

        {/* Register Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <ButtonLoading loadingText="Creating account...">
              Create Account
            </ButtonLoading>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
