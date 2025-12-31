import { Button } from '@/components/ui';
import { AuthLayout } from '@/components/auth';

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Verify Your Email"
      description="We've sent a verification link to your email address"
      footerLinks={[
        {
          text: 'Back to Sign In',
          href: '/auth/login',
          label: 'Navigate to login',
        },
      ]}
    >
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <p className="text-body text-foreground-secondary">
            Please check your email and click on the verification link to activate your account.
          </p>
          <p className="text-body-sm text-foreground-tertiary">
            Didn&apos;t receive the email? Check your spam folder or request a new verification link.
          </p>
        </div>
        <Button variant="primary" size="lg" className="w-full">
          Resend Verification Email
        </Button>
      </div>
    </AuthLayout>
  );
}

