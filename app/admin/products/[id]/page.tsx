"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Textarea,
  Select,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
import {
  Alert,
  FieldError,
  ButtonLoading,
  LoadingSpinner,
} from "@/components/patterns";
import {
  getAdminProductById,
  updateAdminProduct,
  getAdminCategories,
  type UpdateProductInput,
  type AdminProduct,
} from "@/lib/api/admin";
import { type Category } from "@/lib/api/category";
import { XIcon } from "@/components/svg";
import ProductVariantManager from "@/components/admin/ProductVariantManager";

interface ProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
}

const productSchema = z
  .object({
    name: z
      .string()
      .min(1, "Product name is required")
      .max(200, "Product name cannot exceed 200 characters")
      .trim(),
    slug: z.string().optional(),
    description: z.string().optional(),
    shortDescription: z
      .string()
      .max(500, "Short description cannot exceed 500 characters")
      .optional(),
    categoryId: z.string().min(1, "Category is required"),
    sku: z.string().min(1, "SKU is required").trim().toUpperCase(),
    basePrice: z
      .number()
      .min(0, "Base price must be at least 0")
      .nonnegative("Base price cannot be negative"),
    discountPrice: z
      .number()
      .min(0, "Discount price must be at least 0")
      .optional()
      .nullable(),
    stock: z.number().min(0, "Stock must be at least 0").optional(),
    status: z.enum(["draft", "active", "archived"]).optional(),
    seoTitle: z
      .string()
      .max(70, "SEO title cannot exceed 70 characters")
      .optional(),
    seoDescription: z
      .string()
      .max(160, "SEO description cannot exceed 160 characters")
      .optional(),
    seoKeywords: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.discountPrice !== null && data.discountPrice !== undefined) {
        return data.discountPrice < data.basePrice;
      }
      return true;
    },
    {
      message: "Discount price must be less than base price",
      path: ["discountPrice"],
    }
  );

type ProductFormData = z.infer<typeof productSchema>;

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      categoryId: "",
      sku: "",
      basePrice: 0,
      discountPrice: undefined,
      stock: undefined,
      status: "draft",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: [],
    },
  });

  useEffect(() => {
    loadCategories();
    loadProduct();
  }, [productId]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await getAdminCategories({});
      setCategories(data || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadProduct = async () => {
    try {
      setLoadingProduct(true);
      const product = await getAdminProductById(productId);
      reset({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        shortDescription: product.shortDescription || "",
        categoryId: product.category?.id || "",
        sku: product.sku || "",
        basePrice: product.basePrice || 0,
        discountPrice: product.discountPrice || undefined,
        stock: product.stock !== undefined ? product.stock : undefined,
        status: product.status || "draft",
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
        seoKeywords: product.seoKeywords || [],
      });
      // Load images
      setImages(
        product.images?.map((img) => ({
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary || false,
        })) || []
      );
    } catch (error) {
      console.error("Failed to load product:", error);
      setSubmitError("Failed to load product. Please try again.");
    } finally {
      setLoadingProduct(false);
    }
  };

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;

    const newImage: ProductImage = {
      url: newImageUrl.trim(),
      alt: newImageAlt.trim() || undefined,
      isPrimary: images.length === 0, // First image is primary by default
    };

    setImages([...images, newImage]);
    setNewImageUrl("");
    setNewImageAlt("");
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // If we removed the primary image and there are still images, make the first one primary
    if (images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    setImages(newImages);
  };

  const handleSetPrimaryImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setImages(newImages);
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submitData: UpdateProductInput = {
        name: data.name.trim(),
        slug: data.slug?.trim() || generateSlug(data.name),
        description: data.description?.trim() || undefined,
        shortDescription: data.shortDescription?.trim() || undefined,
        categoryId: data.categoryId,
        sku: data.sku.trim().toUpperCase(),
        basePrice: data.basePrice,
        discountPrice: data.discountPrice || undefined,
        stock: data.stock || undefined,
        status: data.status || "draft",
        images: images.length > 0 ? images : [],
        seoTitle: data.seoTitle?.trim() || undefined,
        seoDescription: data.seoDescription?.trim() || undefined,
        seoKeywords: data.seoKeywords || undefined,
      };

      await updateAdminProduct(productId, submitData);
      router.push("/admin/products");
    } catch (err: any) {
      const errorMessage =
        err.message || "Failed to update product. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProduct || loadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-h1 font-bold text-foreground">Edit Product</h1>
        <p className="text-body text-foreground-secondary mt-2">
          Update product information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {submitError && (
          <Alert variant="error" message={submitError} className="mb-4" />
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" required>
                Product Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Product name"
                disabled={isSubmitting}
                error={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <FieldError
                  message={errors.name.message || "Product name is required"}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                type="text"
                placeholder="product-slug"
                disabled={isSubmitting}
                error={!!errors.slug}
                {...register("slug")}
              />
              {errors.slug && (
                <FieldError message={errors.slug.message || "Invalid slug"} />
              )}
              <p className="text-body-xs text-foreground-secondary">
                URL-friendly version of the name.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Textarea
                id="shortDescription"
                placeholder="Brief product description (max 500 characters)"
                disabled={isSubmitting}
                error={!!errors.shortDescription}
                rows={3}
                {...register("shortDescription")}
              />
              {errors.shortDescription && (
                <FieldError
                  message={
                    errors.shortDescription.message || "Invalid description"
                  }
                />
              )}
              <p className="text-body-xs text-foreground-secondary">
                {watch("shortDescription")?.length || 0}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Full product description"
                disabled={isSubmitting}
                error={!!errors.description}
                rows={6}
                {...register("description")}
              />
              {errors.description && (
                <FieldError
                  message={errors.description.message || "Invalid description"}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId" required>
                Category
              </Label>
              <Select
                id="categoryId"
                disabled={isSubmitting || categories.length === 0}
                error={!!errors.categoryId}
                value={watch("categoryId") || ""}
                onChange={(e) => setValue("categoryId", e.target.value)}
              >
                <option value="">
                  {categories.length === 0
                    ? "No categories available"
                    : "Select a category"}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              {errors.categoryId && (
                <FieldError
                  message={errors.categoryId.message || "Category is required"}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku" required>
                SKU
              </Label>
              <Input
                id="sku"
                type="text"
                placeholder="PRODUCT-SKU"
                disabled={isSubmitting}
                error={!!errors.sku}
                {...register("sku", {
                  onChange: (e) => {
                    setValue("sku", e.target.value.toUpperCase());
                  },
                })}
              />
              {errors.sku && (
                <FieldError message={errors.sku.message || "SKU is required"} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice" required>
                  Base Price
                </Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  disabled={isSubmitting}
                  error={!!errors.basePrice}
                  {...register("basePrice", {
                    valueAsNumber: true,
                  })}
                />
                {errors.basePrice && (
                  <FieldError
                    message={
                      errors.basePrice.message || "Base price is required"
                    }
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPrice">Discount Price</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  disabled={isSubmitting}
                  error={!!errors.discountPrice}
                  {...register("discountPrice", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                />
                {errors.discountPrice && (
                  <FieldError
                    message={
                      errors.discountPrice.message || "Invalid discount price"
                    }
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  disabled={isSubmitting}
                  error={!!errors.stock}
                  {...register("stock", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                />
                {errors.stock && (
                  <FieldError
                    message={errors.stock.message || "Invalid stock value"}
                  />
                )}
                <p className="text-body-sm text-foreground-secondary">
                  Stock disponible (for products without variants)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                disabled={isSubmitting}
                error={!!errors.status}
                value={watch("status") || "draft"}
                onChange={(e) =>
                  setValue(
                    "status",
                    e.target.value as "draft" | "active" | "archived"
                  )
                }
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </Select>
              {errors.status && (
                <FieldError
                  message={errors.status.message || "Invalid status"}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Add Image</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Image URL"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  disabled={isSubmitting}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddImage())
                  }
                />
                <Input
                  type="text"
                  placeholder="Alt text (optional)"
                  value={newImageAlt}
                  onChange={(e) => setNewImageAlt(e.target.value)}
                  disabled={isSubmitting}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddImage())
                  }
                />
                <Button
                  type="button"
                  onClick={handleAddImage}
                  disabled={isSubmitting || !newImageUrl.trim()}
                >
                  Add
                </Button>
              </div>
              <p className="text-body-xs text-foreground-secondary">
                At least one image is required. Mark one image as primary.
              </p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group border border-neutral-200 rounded-lg overflow-hidden"
                  >
                    <div className="aspect-square bg-neutral-100">
                      <img
                        src={image.url}
                        alt={image.alt || `Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EImage%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <div className="p-2 space-y-2">
                      {image.isPrimary && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-900 text-white rounded">
                          Primary
                        </span>
                      )}
                      <div className="flex gap-2">
                        {!image.isPrimary && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetPrimaryImage(index)}
                            disabled={isSubmitting}
                            className="flex-1 text-xs"
                          >
                            Set Primary
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveImage(index)}
                          disabled={isSubmitting}
                          className="text-error-600 hover:text-error-700"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <p className="text-body-sm text-foreground-secondary text-center py-4">
                No images added yet. Add at least one image for your product.
              </p>
            )}
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                type="text"
                placeholder="SEO title"
                disabled={isSubmitting}
                error={!!errors.seoTitle}
                maxLength={70}
                {...register("seoTitle")}
              />
              {errors.seoTitle && (
                <FieldError
                  message={errors.seoTitle.message || "Invalid SEO title"}
                />
              )}
              <p className="text-body-xs text-foreground-secondary">
                {watch("seoTitle")?.length || 0}/70 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                placeholder="SEO description"
                disabled={isSubmitting}
                error={!!errors.seoDescription}
                rows={3}
                maxLength={160}
                {...register("seoDescription")}
              />
              {errors.seoDescription && (
                <FieldError
                  message={
                    errors.seoDescription.message || "Invalid SEO description"
                  }
                />
              )}
              <p className="text-body-xs text-foreground-secondary">
                {watch("seoDescription")?.length || 0}/160 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <ButtonLoading /> : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Product Variants */}
      <ProductVariantManager productId={productId} disabled={isSubmitting} />
    </div>
  );
}
