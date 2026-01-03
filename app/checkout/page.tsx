"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Container,
  Section,
} from "@/components/ui";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { getAddresses, createAddress, type Address } from "@/lib/api/address";
import { createOrder, PaymentMethod as OrderPaymentMethod, type OrderAddress } from "@/lib/api/order";
import { Alert, FieldError, LoadingState, EmptyState } from "@/components/patterns";
import { ShoppingBagIcon } from "@/components/svg";
import { getOrCreateSessionId } from "@/lib/api/cart";

// Form schema for checkout address
const checkoutAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phoneNumber: z.string().min(1, "Phone number is required").trim(),
  addressLine1: z.string().min(1, "Address line 1 is required").trim(),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required").trim(),
  state: z.string().min(1, "State/Province is required").trim(),
  postalCode: z.string().min(1, "Postal code is required").trim(),
  country: z.string().min(1, "Country is required").trim(),
});

type CheckoutAddressFormData = z.infer<typeof checkoutAddressSchema>;

type PaymentMethod = "cash" | "card" | null;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading: cartLoading, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [guestAddress, setGuestAddress] = useState<CheckoutAddressFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    getValues,
  } = useForm<CheckoutAddressFormData>({
    resolver: zodResolver(checkoutAddressSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  // Load addresses if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    } else {
      setIsLoadingAddresses(false);
      setShowAddressForm(true);
    }
  }, [isAuthenticated]);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user && showAddressForm) {
      if (user.firstName) setValue("firstName", user.firstName);
      if (user.lastName) setValue("lastName", user.lastName);
      if (user.email) setValue("email", user.email);
    }
  }, [user, showAddressForm, setValue]);

  const loadAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const data = await getAddresses();
      setAddresses(data);
      if (data.length > 0) {
        // Auto-select default address if available
        const defaultAddress = data.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      } else {
        setShowAddressForm(true);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to load addresses";
      setError(errorMessage);
      setShowAddressForm(true);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const onSubmitAddressForm = async (data: CheckoutAddressFormData) => {
    setError(null);
    try {
      if (isAuthenticated) {
        // Create address and select it
        const newAddress = await createAddress({
          fullName: `${data.firstName} ${data.lastName}`,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          isDefault: addresses.length === 0,
        });
        setAddresses([...addresses, newAddress]);
        setSelectedAddressId(newAddress.id);
        setShowAddressForm(false);
      } else {
        // For guest users, store the form data
        setGuestAddress(data);
        setSelectedAddressId("guest");
        setShowAddressForm(false);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to save address";
      setError(errorMessage);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowAddressForm(false);
  };

  const handleContinueToPayment = async () => {
    if (!selectedAddressId && !showAddressForm) {
      setError("Please select or add a delivery address");
      return;
    }
    
    // If form is shown and user is not authenticated, validate and continue directly
    if (showAddressForm && !isAuthenticated) {
      // Get form values using react-hook-form
      const formData = getValues();

      // Basic validation
      if (!formData.firstName || !formData.lastName || !formData.phoneNumber || 
          !formData.addressLine1 || !formData.city || !formData.state || 
          !formData.postalCode || !formData.country) {
        setError("Please complete all required fields");
        return;
      }

      // Store guest address and continue
      setGuestAddress(formData);
      setSelectedAddressId("guest");
      setShowAddressForm(false);
      setStep(2);
      setError(null);
      return;
    }

    if (showAddressForm) {
      setError("Please complete the address form");
      return;
    }
    setStep(2);
    setError(null);
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }
    if (!selectedAddressId && !guestAddress) {
      setError("Please select or add a delivery address");
      return;
    }

    setError(null);
    setIsPlacingOrder(true);
    
    try {
      // Get address data
      let shippingAddress: OrderAddress;
      
      if (selectedAddressId && selectedAddressId !== "guest") {
        // Use selected address
        const address = addresses.find((addr) => addr.id === selectedAddressId);
        if (!address) {
          throw new Error("Selected address not found");
        }
        shippingAddress = {
          fullName: address.fullName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        };
      } else if (guestAddress) {
        // Use guest address from form
        shippingAddress = {
          fullName: `${guestAddress.firstName} ${guestAddress.lastName}`,
          addressLine1: guestAddress.addressLine1,
          addressLine2: guestAddress.addressLine2,
          city: guestAddress.city,
          state: guestAddress.state,
          postalCode: guestAddress.postalCode,
          country: guestAddress.country,
          phoneNumber: guestAddress.phoneNumber,
          email: guestAddress.email || undefined,
        };
      } else {
        throw new Error("No address available");
      }

      // Get sessionId for guest users
      let sessionId: string | undefined = undefined;
      if (!isAuthenticated) {
        sessionId = getOrCreateSessionId();
      }

      // Create order
      const order = await createOrder(
        {
          shippingAddress,
          paymentMethod: paymentMethod === "cash" ? OrderPaymentMethod.CASH : OrderPaymentMethod.CARD,
          notes: undefined,
        },
        sessionId
      );

      // Clear the cart after order is created
      await clearCart();
      
      // If user is not authenticated, redirect to home page
      if (!isAuthenticated) {
        router.push("/");
      } else {
        // If authenticated, redirect to order confirmation page
        router.push(`/orders/${order.id}/confirmation`);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to place order";
      setError(errorMessage);
      setIsPlacingOrder(false);
    }
  };

  // Redirect if cart is empty
  if (!cartLoading && (!cart || cart.items.length === 0)) {
    return (
      <Section className="py-12">
        <Container>
          <EmptyState
            icon={<ShoppingBagIcon className="h-16 w-16 text-neutral-400" />}
            title="Your cart is empty"
            description="Add some items to your cart before checkout"
            action={
              <Button variant="primary" onClick={() => router.push("/products")}>
                Continue Shopping
              </Button>
            }
          />
        </Container>
      </Section>
    );
  }

  if (cartLoading) {
    return (
      <Section className="py-12">
        <Container>
          <LoadingState message="Loading checkout..." />
        </Container>
      </Section>
    );
  }

  const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
  const subtotal = cart?.subtotal || 0;
  const tax: number = 0; // Placeholder
  const shipping: number = 0; // Placeholder
  const total = subtotal + tax + shipping;

  // Get display address (either selected address or guest address)
  const displayAddress = selectedAddressId === "guest" && guestAddress
    ? {
        fullName: `${guestAddress.firstName} ${guestAddress.lastName}`,
        addressLine1: guestAddress.addressLine1,
        addressLine2: guestAddress.addressLine2,
        city: guestAddress.city,
        state: guestAddress.state,
        postalCode: guestAddress.postalCode,
        country: guestAddress.country,
      }
    : selectedAddress;

  return (
    <Section className="py-8 md:py-12">
      <Container>
        <div className="mb-8">
          <h1 className="text-h1 font-bold text-foreground mb-2">Checkout</h1>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? "text-primary-900" : "text-foreground-secondary"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step >= 1
                    ? "bg-primary-900 text-white"
                    : "bg-neutral-200 text-foreground-secondary"
                }`}
              >
                1
              </div>
              <span className="text-body-md font-medium">Address</span>
            </div>
            <div className="w-12 h-0.5 bg-neutral-200" />
            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? "text-primary-900" : "text-foreground-secondary"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step >= 2
                    ? "bg-primary-900 text-white"
                    : "bg-neutral-200 text-foreground-secondary"
                }`}
              >
                2
              </div>
              <span className="text-body-md font-medium">Payment</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6">
            <Alert variant="error" message={error} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address */}
            {step === 1 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingAddresses ? (
                    <LoadingState message="Loading addresses..." />
                  ) : addresses.length > 0 && !showAddressForm ? (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {addresses.map((address) => (
                          <label
                            key={address.id}
                            className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              selectedAddressId === address.id
                                ? "border-primary-900 bg-primary-50"
                                : "border-neutral-200 hover:border-primary-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="address"
                              value={address.id}
                              checked={selectedAddressId === address.id}
                              onChange={() => handleAddressSelect(address.id)}
                              className="mt-1 h-4 w-4 text-primary-900 focus:ring-primary-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-foreground">
                                  {address.fullName}
                                </h3>
                                {address.isDefault && (
                                  <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-900 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-body-sm text-foreground-secondary">
                                {address.addressLine1}
                                {address.addressLine2 && `, ${address.addressLine2}`}
                              </p>
                              <p className="text-body-sm text-foreground-secondary">
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p className="text-body-sm text-foreground-secondary">
                                {address.country}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddressForm(true);
                          setSelectedAddressId(null);
                        }}
                      >
                        Add New Address
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmitAddressForm)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" required>
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            type="text"
                            disabled={isSubmitting}
                            error={!!errors.firstName}
                            {...register("firstName")}
                          />
                          {errors.firstName && (
                            <FieldError message={errors.firstName.message || "First name is required"} />
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" required>
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            type="text"
                            disabled={isSubmitting}
                            error={!!errors.lastName}
                            {...register("lastName")}
                          />
                          {errors.lastName && (
                            <FieldError message={errors.lastName.message || "Last name is required"} />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            disabled={isSubmitting}
                            error={!!errors.email}
                            {...register("email")}
                          />
                          {errors.email && (
                            <FieldError message={errors.email.message || "Invalid email address"} />
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber" required>
                            Phone Number
                          </Label>
                          <Input
                            id="phoneNumber"
                            type="tel"
                            disabled={isSubmitting}
                            error={!!errors.phoneNumber}
                            {...register("phoneNumber")}
                          />
                          {errors.phoneNumber && (
                            <FieldError message={errors.phoneNumber.message || "Phone number is required"} />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addressLine1" required>
                          Address Line 1
                        </Label>
                        <Input
                          id="addressLine1"
                          type="text"
                          disabled={isSubmitting}
                          error={!!errors.addressLine1}
                          {...register("addressLine1")}
                        />
                        {errors.addressLine1 && (
                          <FieldError message={errors.addressLine1.message || "Address line 1 is required"} />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                        <Input
                          id="addressLine2"
                          type="text"
                          disabled={isSubmitting}
                          error={!!errors.addressLine2}
                          {...register("addressLine2")}
                        />
                        {errors.addressLine2 && (
                          <FieldError message={errors.addressLine2.message || "Invalid address line 2"} />
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city" required>
                            City
                          </Label>
                          <Input
                            id="city"
                            type="text"
                            disabled={isSubmitting}
                            error={!!errors.city}
                            {...register("city")}
                          />
                          {errors.city && <FieldError message={errors.city.message || "City is required"} />}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state" required>
                            State / Province
                          </Label>
                          <Input
                            id="state"
                            type="text"
                            disabled={isSubmitting}
                            error={!!errors.state}
                            {...register("state")}
                          />
                          {errors.state && <FieldError message={errors.state.message || "State/Province is required"} />}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="postalCode" required>
                            Postal Code
                          </Label>
                          <Input
                            id="postalCode"
                            type="text"
                            disabled={isSubmitting}
                            error={!!errors.postalCode}
                            {...register("postalCode")}
                          />
                          {errors.postalCode && (
                            <FieldError message={errors.postalCode.message || "Postal code is required"} />
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country" required>
                            Country
                          </Label>
                          <Input
                            id="country"
                            type="text"
                            disabled={isSubmitting}
                            error={!!errors.country}
                            {...register("country")}
                          />
                          {errors.country && (
                            <FieldError message={errors.country.message || "Country is required"} />
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        {addresses.length > 0 && isAuthenticated && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowAddressForm(false);
                              reset();
                            }}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                        )}
                        {isAuthenticated ? (
                          <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Address"}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="primary"
                            onClick={handleContinueToPayment}
                            disabled={isSubmitting}
                            className="w-full"
                          >
                            Continue to Payment
                          </Button>
                        )}
                      </div>
                    </form>
                  )}

                  {!showAddressForm && selectedAddressId && (
                    <div className="mt-6 pt-6 border-t border-neutral-200">
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={handleContinueToPayment}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <label
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === "cash"
                          ? "border-primary-900 bg-primary-50"
                          : "border-neutral-200 hover:border-primary-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={() => setPaymentMethod("cash")}
                        className="mt-1 h-4 w-4 text-primary-900 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          Cash on Delivery
                        </h3>
                        <p className="text-body-sm text-foreground-secondary">
                          Pay with cash when your order is delivered
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === "card"
                          ? "border-primary-900 bg-primary-50"
                          : "border-neutral-200 hover:border-primary-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="mt-1 h-4 w-4 text-primary-900 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          Payment by Credit Card
                        </h3>
                        <p className="text-body-sm text-foreground-secondary">
                          Pay securely with your credit or debit card
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="mt-6 pt-6 border-t border-neutral-200 flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(1);
                        setError(null);
                      }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      onClick={handlePlaceOrder}
                      disabled={!paymentMethod || isPlacingOrder}
                    >
                      {isPlacingOrder ? "Placing Order..." : "Place Order"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Selected Address */}
                  {step >= 1 && displayAddress && (
                    <div className="pb-4 border-b border-neutral-200">
                      <h3 className="text-body-sm font-semibold text-foreground mb-2">
                        Delivery Address
                      </h3>
                      <div className="text-body-sm text-foreground-secondary space-y-1">
                        <p className="font-medium">{displayAddress.fullName}</p>
                        <p>{displayAddress.addressLine1}</p>
                        {displayAddress.addressLine2 && <p>{displayAddress.addressLine2}</p>}
                        <p>
                          {displayAddress.city}, {displayAddress.state}{" "}
                          {displayAddress.postalCode}
                        </p>
                        <p>{displayAddress.country}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  {step >= 2 && paymentMethod && (
                    <div className="pb-4 border-b border-neutral-200">
                      <h3 className="text-body-sm font-semibold text-foreground mb-2">
                        Payment Method
                      </h3>
                      <p className="text-body-sm text-foreground-secondary">
                        {paymentMethod === "cash" ? "Cash on Delivery" : "Credit Card"}
                      </p>
                    </div>
                  )}

                  {/* Cart Items */}
                  <div className="space-y-3">
                    <h3 className="text-body-sm font-semibold text-foreground">
                      Items ({cart?.itemCount || 0})
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart?.items.map((item, index) => {
                        const image =
                          item.product?.images?.find((img: any) => img.isPrimary) ||
                          item.product?.images?.[0];
                        const productName = item.variant?.name
                          ? `${item.product?.name || "Product"} - ${item.variant.name}`
                          : item.product?.name || "Product";
                        const displayPrice =
                          item.variant?.discountPrice ??
                          item.variant?.basePrice ??
                          item.product?.discountPrice ??
                          item.product?.basePrice ??
                          item.price;

                        return (
                          <div key={index} className="flex gap-3">
                            {image && (
                              <div className="relative w-16 h-16 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                  src={typeof image === "string" ? image : image.url}
                                  alt={productName}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-body-sm font-medium text-foreground line-clamp-2">
                                {productName}
                              </p>
                              <p className="text-body-xs text-foreground-secondary">
                                Qty: {item.quantity}
                              </p>
                              <p className="text-body-sm font-semibold text-foreground">
                                ${(displayPrice * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="pt-4 border-t border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-body-md text-foreground-secondary">Subtotal</span>
                      <span className="text-body-md font-medium text-foreground">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-md text-foreground-secondary">Tax</span>
                      <span className="text-body-md font-medium text-foreground">
                        ${tax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-md text-foreground-secondary">Shipping</span>
                      <span className="text-body-md font-medium text-foreground">
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-neutral-200">
                      <div className="flex items-center justify-between">
                        <span className="text-h4 font-bold text-foreground">Total</span>
                        <span className="text-h4 font-bold text-foreground">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

