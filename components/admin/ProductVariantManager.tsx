"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Alert, FieldError, ButtonLoading, LoadingSpinner } from "@/components/patterns";
import { XIcon } from "@/components/svg";
import {
  getAdminProductVariants,
  createAdminProductVariant,
  updateAdminProductVariant,
  deleteAdminProductVariant,
  type ProductVariant,
  type CreateProductVariantInput,
  type UpdateProductVariantInput,
} from "@/lib/api/admin";

interface ProductVariantManagerProps {
  productId: string;
  disabled?: boolean;
}

export default function ProductVariantManager({
  productId,
  disabled = false,
}: ProductVariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const [variantForm, setVariantForm] = useState<CreateProductVariantInput>({
    productId,
    sku: "",
    name: "",
    basePrice: 0,
    discountPrice: undefined,
    stock: 0,
    attributes: [{ name: "", value: "" }],
    images: [],
    isDefault: false,
  });

  useEffect(() => {
    if (productId) {
      loadVariants();
    }
  }, [productId]);

  const loadVariants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminProductVariants(productId);
      setVariants(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load variants");
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVariant = async () => {
    if (!variantForm.sku || !variantForm.basePrice || variantForm.stock === undefined) {
      setError("SKU, base price, and stock are required");
      return;
    }

    if (variantForm.attributes.length === 0 || !variantForm.attributes[0].name || !variantForm.attributes[0].value) {
      setError("At least one attribute is required");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      await createAdminProductVariant(variantForm);
      await loadVariants();
      // Reset form
      setVariantForm({
        productId,
        sku: "",
        name: "",
        basePrice: 0,
        discountPrice: undefined,
        stock: 0,
        attributes: [{ name: "", value: "" }],
        images: [],
        isDefault: false,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create variant");
    } finally {
      setIsCreating(false);
    }
  };

  // Note: Update functionality can be added later with a modal or inline editing
  // For now, we only support create and delete

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("Are you sure you want to delete this variant? This action cannot be undone.")) {
      return;
    }

    try {
      setError(null);
      await deleteAdminProductVariant(variantId);
      await loadVariants();
    } catch (err: any) {
      setError(err.message || "Failed to delete variant");
    }
  };

  const addAttribute = () => {
    setVariantForm({
      ...variantForm,
      attributes: [...variantForm.attributes, { name: "", value: "" }],
    });
  };

  const removeAttribute = (index: number) => {
    const newAttributes = variantForm.attributes.filter((_, i) => i !== index);
    setVariantForm({ ...variantForm, attributes: newAttributes });
  };

  const updateAttribute = (index: number, field: "name" | "value", value: string) => {
    const newAttributes = [...variantForm.attributes];
    newAttributes[index] = { ...newAttributes[index], [field]: value };
    setVariantForm({ ...variantForm, attributes: newAttributes });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Variants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <Alert variant="error" message={error} />}

        {/* Create New Variant Form */}
        <div className="space-y-4 p-4 border border-neutral-200 rounded-lg">
          <h3 className="text-h4 font-semibold">Add New Variant</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="variant-sku" required>
                SKU
              </Label>
              <Input
                id="variant-sku"
                type="text"
                placeholder="VARIANT-SKU"
                value={variantForm.sku}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, sku: e.target.value.toUpperCase() })
                }
                disabled={disabled || isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant-name">Variant Name</Label>
              <Input
                id="variant-name"
                type="text"
                placeholder="e.g., Red - Large"
                value={variantForm.name}
                onChange={(e) =>
                  setVariantForm({ ...variantForm, name: e.target.value })
                }
                disabled={disabled || isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant-basePrice" required>
                Base Price
              </Label>
              <Input
                id="variant-basePrice"
                type="number"
                step="0.01"
                min="0"
                value={variantForm.basePrice}
                onChange={(e) =>
                  setVariantForm({
                    ...variantForm,
                    basePrice: parseFloat(e.target.value) || 0,
                  })
                }
                disabled={disabled || isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant-discountPrice">Discount Price</Label>
              <Input
                id="variant-discountPrice"
                type="number"
                step="0.01"
                min="0"
                value={variantForm.discountPrice || ""}
                onChange={(e) =>
                  setVariantForm({
                    ...variantForm,
                    discountPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                disabled={disabled || isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant-stock" required>
                Stock
              </Label>
              <Input
                id="variant-stock"
                type="number"
                min="0"
                value={variantForm.stock}
                onChange={(e) =>
                  setVariantForm({
                    ...variantForm,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                disabled={disabled || isCreating}
              />
            </div>

            <div className="space-y-2 flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={variantForm.isDefault}
                  onChange={(e) =>
                    setVariantForm({ ...variantForm, isDefault: e.target.checked })
                  }
                  disabled={disabled || isCreating}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                <Label>Set as default variant</Label>
              </label>
            </div>
          </div>

          {/* Attributes */}
          <div className="space-y-2">
            <Label>Attributes</Label>
            {variantForm.attributes.map((attr, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Attribute name (e.g., Color)"
                  value={attr.name}
                  onChange={(e) => updateAttribute(index, "name", e.target.value)}
                  disabled={disabled || isCreating}
                />
                <Input
                  type="text"
                  placeholder="Attribute value (e.g., Red)"
                  value={attr.value}
                  onChange={(e) => updateAttribute(index, "value", e.target.value)}
                  disabled={disabled || isCreating}
                />
                {variantForm.attributes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttribute(index)}
                    disabled={disabled || isCreating}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAttribute}
              disabled={disabled || isCreating}
            >
              Add Attribute
            </Button>
          </div>

          <Button
            type="button"
            onClick={handleCreateVariant}
            disabled={disabled || isCreating}
          >
            {isCreating ? <ButtonLoading /> : "Add Variant"}
          </Button>
        </div>

        {/* Variants List */}
        <div className="space-y-4">
          <h3 className="text-h4 font-semibold">Existing Variants</h3>
          {variants.length === 0 ? (
            <p className="text-body-sm text-foreground-secondary text-center py-4">
              No variants added yet. Add your first variant above.
            </p>
          ) : (
            <div className="space-y-4">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="p-4 border border-neutral-200 rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {variant.name || variant.sku}
                        </h4>
                        {variant.isDefault && (
                          <span className="px-2 py-1 text-xs font-medium bg-primary-900 text-white rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm text-foreground-secondary font-mono">
                        SKU: {variant.sku}
                      </p>
                      <div className="flex gap-4 mt-2 text-body-sm">
                        <span>
                          Price: $
                          {variant.discountPrice || variant.basePrice}
                          {variant.discountPrice && (
                            <span className="text-foreground-secondary line-through ml-1">
                              ${variant.basePrice}
                            </span>
                          )}
                        </span>
                        <span>Stock: {variant.stock}</span>
                      </div>
                      {variant.attributes.length > 0 && (
                        <div className="mt-2">
                          <p className="text-body-sm font-medium">Attributes:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {variant.attributes.map((attr, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-neutral-100 rounded"
                              >
                                {attr.name}: {attr.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVariant(variant.id)}
                        disabled={disabled}
                        className="text-error-600 hover:text-error-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

