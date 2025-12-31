"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, PasswordInput, Label } from "@/components/ui";
import { AuthLayout } from "@/components/auth";
import { Alert, FieldError } from "@/components/patterns";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";
import { ButtonLoading } from "@/components/patterns";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthData, setLoading, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const result = await login({
        email: data.email,
        password: data.password,
      });

      // Update auth store
      setAuthData(result);

      // Redirect to the original page or default to user settings
      const redirectUrl = searchParams.get("redirect") || "/user/settings";
      router.push(redirectUrl);
    } catch (err: any) {
      const errorMessage =
        err.message || "Login failed. Please check your credentials.";
      setFormError("root", { message: errorMessage });
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      description="Enter your credentials to access your account"
      footerLinks={[
        {
          text: "Don't have an account? Sign up",
          href: "/auth/register",
          label: "Navigate to registration page",
        },
      ]}
    >
      <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
        {/* Error Message */}
        {errors.root && (
          <Alert
            variant="error"
            message={errors.root.message || "An error occurred"}
          />
        )}

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
            disabled={isLoading}
            error={!!errors.email}
            {...register("email")}
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
            autoComplete="current-password"
            placeholder="••••••••"
            aria-required="true"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
            disabled={isLoading}
            error={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <FieldError
              id="password-error"
              message={errors.password.message || "Password is required"}
            />
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-300 text-primary-900 focus:ring-primary-500 focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              {...register("remember")}
            />
            <Label htmlFor="remember" className="ml-2 text-body-sm">
              Remember me
            </Label>
          </div>
          <Link
            href="/auth/forgot-password"
            className="text-body-sm text-primary-900 hover:text-primary-800 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-sm"
            tabIndex={isLoading ? -1 : 0}
          >
            Forgot password?
          </Link>
        </div>

        {/* Login Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <ButtonLoading loadingText="Signing in...">Sign In</ButtonLoading>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout
          title="Sign In"
          description="Enter your credentials to access your account"
        >
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 border-4 border-primary-200 border-t-primary-900 rounded-full animate-spin" />
          </div>
        </AuthLayout>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
