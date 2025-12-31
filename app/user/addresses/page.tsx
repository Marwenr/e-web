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
import {
  Alert,
  FieldError,
  ButtonLoading,
  EmptyState,
} from "@/components/patterns";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  type Address,
  type CreateAddressData,
} from "@/lib/api/address";

const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required").trim(),
  addressLine1: z.string().min(1, "Address line 1 is required").trim(),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required").trim(),
  state: z.string().min(1, "State/Province is required").trim(),
  postalCode: z.string().min(1, "Postal code is required").trim(),
  country: z.string().min(1, "Country is required").trim(),
  isDefault: z.boolean(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    reset,
    setValue,
    clearErrors,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      isDefault: false,
    },
  });

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const data = await getAddresses();
      setAddresses(data);
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to load addresses";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    setError(null);
    setSuccess(null);

    try {
      if (isEditing) {
        // Update existing address
        await updateAddress(isEditing, data);
        setSuccess("Address updated successfully!");
      } else {
        // Create new address
        await createAddress(data);
        setSuccess("Address created successfully!");
      }

      // Reset form and reload addresses
      resetForm();
      await loadAddresses();
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to save address";
      setError(errorMessage);
      setFormError("root", { message: errorMessage });
    }
  };

  const handleEdit = (address: Address) => {
    setValue("fullName", address.fullName);
    setValue("addressLine1", address.addressLine1);
    setValue("addressLine2", address.addressLine2 || "");
    setValue("city", address.city);
    setValue("state", address.state);
    setValue("postalCode", address.postalCode);
    setValue("country", address.country);
    setValue("isDefault", address.isDefault);
    setIsEditing(address.id);
    setShowForm(true);
    setError(null);
    setSuccess(null);
    clearErrors();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await deleteAddress(id);
      setSuccess("Address deleted successfully!");
      await loadAddresses();
    } catch (err: unknown) {
      const errorMessage =
        (err instanceof Error ? err.message : undefined) ||
        "Failed to delete address";
      setError(errorMessage);
    }
  };

  const resetForm = () => {
    reset({
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      isDefault: false,
    });
    setIsEditing(null);
    setShowForm(false);
    setError(null);
    setSuccess(null);
    clearErrors();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-h2 font-bold text-foreground">Addresses</h1>
          <p className="text-body text-foreground-secondary mt-2">
            Manage your shipping and billing addresses
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary-200 border-t-primary-900 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-body text-foreground-secondary">
              Loading addresses...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h2 font-bold text-foreground">Addresses</h1>
        <p className="text-body text-foreground-secondary mt-2">
          Manage your shipping and billing addresses
        </p>
      </div>

      {/* Success Message */}
      {success && <Alert variant="success" message={success} />}

      {/* Error Message */}
      {error && <Alert variant="error" message={error} />}

      {/* Addresses List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Saved Addresses</CardTitle>
          <CardDescription>
            Add and manage your delivery addresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 && !showForm ? (
            <EmptyState
              title="No saved addresses"
              description="Add your first address to get started"
              action={
                <Button variant="outline" onClick={() => setShowForm(true)}>
                  Add New Address
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="p-4 border border-neutral-200 rounded-md space-y-3"
                >
                  <div className="flex items-start justify-between">
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(address)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {(showForm || addresses.length > 0) && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>
              {isEditing ? "Edit Address" : "Add New Address"}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? "Update address information"
                : "Enter a new shipping or billing address"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.root && (
              <Alert
                variant="error"
                message={errors.root.message || "An error occurred"}
              />
            )}
            <form
              className="space-y-4"
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="space-y-2">
                <Label htmlFor="fullName" required>
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  disabled={isSubmitting}
                  error={!!errors.fullName}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <FieldError
                    message={errors.fullName.message || "Full name is required"}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine1" required>
                  Address Line 1
                </Label>
                <Input
                  id="addressLine1"
                  type="text"
                  placeholder="123 Main Street"
                  disabled={isSubmitting}
                  error={!!errors.addressLine1}
                  {...register("addressLine1")}
                />
                {errors.addressLine1 && (
                  <FieldError
                    message={
                      errors.addressLine1.message ||
                      "Address line 1 is required"
                    }
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input
                  id="addressLine2"
                  type="text"
                  placeholder="Apartment, suite, etc."
                  disabled={isSubmitting}
                  error={!!errors.addressLine2}
                  {...register("addressLine2")}
                />
                {errors.addressLine2 && (
                  <FieldError
                    message={
                      errors.addressLine2.message || "Invalid address line 2"
                    }
                  />
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
                    placeholder="New York"
                    disabled={isSubmitting}
                    error={!!errors.city}
                    {...register("city")}
                  />
                  {errors.city && (
                    <FieldError
                      message={errors.city.message || "City is required"}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" required>
                    State / Province
                  </Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="NY"
                    disabled={isSubmitting}
                    error={!!errors.state}
                    {...register("state")}
                  />
                  {errors.state && (
                    <FieldError
                      message={
                        errors.state.message || "State/Province is required"
                      }
                    />
                  )}
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
                    placeholder="10001"
                    disabled={isSubmitting}
                    error={!!errors.postalCode}
                    {...register("postalCode")}
                  />
                  {errors.postalCode && (
                    <FieldError
                      message={
                        errors.postalCode.message || "Postal code is required"
                      }
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" required>
                    Country
                  </Label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="United States"
                    disabled={isSubmitting}
                    error={!!errors.country}
                    {...register("country")}
                  />
                  {errors.country && (
                    <FieldError
                      message={errors.country.message || "Country is required"}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <input
                  id="defaultAddress"
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-primary-900 focus:ring-primary-500"
                  disabled={isSubmitting}
                  {...register("isDefault")}
                />
                <Label htmlFor="defaultAddress" className="ml-2 text-body-sm">
                  Set as default address
                </Label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
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
                      Save Address
                    </ButtonLoading>
                  ) : isEditing ? (
                    "Update Address"
                  ) : (
                    "Save Address"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
