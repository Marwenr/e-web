"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  Textarea,
  Label,
  Container,
  Section,
} from "@/components/ui";
import { Alert, FieldError, ButtonLoading } from "@/components/patterns";
import { HeroSection } from "@/components/hero";
import { createContact } from "@/lib/api/contact";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  message: z.string().min(1, "Message is required").trim(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await createContact(data);
      setSubmitSuccess(true);
      reset();

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to submit contact form. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <HeroSection
        backgroundImage="/landing4.webp"
        title="Wear like a pro"
        description="You have questions about our products or our shop, or even just a message to say hi!"
      />

      {/* Contact Us Section */}
      <Section variant="muted">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-h1 font-bold text-foreground mb-4">
                Contact Us
              </h2>
              <p className="text-body-lg text-foreground-secondary">
                We love to hear from our customers, so please feel free to
                contact us with any feedback or questions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Contact Form */}
              <div>
                {submitSuccess && (
                  <Alert
                    variant="success"
                    message="Thank you for contacting us! We'll get back to you soon."
                    className="mb-6"
                  />
                )}
                {submitError && (
                  <Alert
                    variant="error"
                    message={submitError}
                    className="mb-6"
                  />
                )}
                <form
                  className="space-y-4"
                  noValidate
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="space-y-2">
                    <Label htmlFor="name" required>
                      Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jane Smith"
                      disabled={isSubmitting}
                      error={!!errors.name}
                      {...register("name")}
                    />
                    {errors.name && (
                      <FieldError
                        message={errors.name.message || "Name is required"}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" required>
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@gmail.com"
                      disabled={isSubmitting}
                      error={!!errors.email}
                      {...register("email")}
                    />
                    {errors.email && (
                      <FieldError
                        message={errors.email.message || "Email is required"}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" required>
                      Your message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Write here..."
                      rows={6}
                      disabled={isSubmitting}
                      error={!!errors.message}
                      {...register("message")}
                    />
                    {errors.message && (
                      <FieldError
                        message={
                          errors.message.message || "Message is required"
                        }
                      />
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <ButtonLoading>Submitting...</ButtonLoading>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </form>
              </div>

              {/* Image Placeholder */}
              <div className="hidden lg:block">
                <div className="relative w-full h-full min-h-[500px] bg-neutral-200 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                    <div className="text-center p-8">
                      <div className="w-32 h-32 mx-auto mb-4 bg-neutral-300 rounded-full flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-neutral-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-body text-foreground-secondary">
                        We&apos;re here to help
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
