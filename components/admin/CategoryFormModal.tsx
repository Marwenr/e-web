"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input, Textarea, Label, Select } from "@/components/ui";
import { Alert, FieldError, ButtonLoading } from "@/components/patterns";
import { Category } from "@/lib/api/category";
import { CreateCategoryInput, UpdateCategoryInput } from "@/lib/api/admin";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters").trim(),
  slug: z.string().optional(),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  parentId: z.string().nullable().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
  category?: Category | null;
  categories: Category[];
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSave,
  category,
  categories,
}: CategoryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: null,
      image: "",
      isActive: true,
    },
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");

  // Auto-generate slug from name when name changes (only for new categories)
  useEffect(() => {
    if (nameValue && !category && !slugValue) {
      // Only auto-generate for new categories if slug is empty
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, category, slugValue, setValue]);

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      reset({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        parentId: category.parentId || null,
        image: category.image || "",
        isActive: category.isActive ?? true,
      });
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        parentId: null,
        image: "",
        isActive: true,
      });
    }
    setSubmitError(null);
  }, [category, reset]);

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submitData: CreateCategoryInput | UpdateCategoryInput = {
        name: data.name.trim(),
        slug: data.slug?.trim() || generateSlug(data.name),
        description: data.description?.trim() || undefined,
        parentId: data.parentId || null,
        image: data.image?.trim() || undefined,
        isActive: data.isActive ?? true,
      };

      await onSave(submitData);
      reset();
      onClose();
    } catch (err: any) {
      const errorMessage =
        err.message || "Failed to save category. Please try again.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isChildOfCategory = (
    categoryId: string,
    parentId: string,
    allCategories: Category[]
  ): boolean => {
    const category = allCategories.find((c) => c.id === categoryId);
    if (!category || !category.parentId) return false;
    if (category.parentId === parentId) return true;
    return isChildOfCategory(category.parentId, parentId, allCategories);
  };

  // Filter out current category and its children from parent options
  const getAvailableParents = (): Category[] => {
    if (!category) return categories;
    return categories.filter((c) => {
      if (c.id === category.id) return false;
      return !isChildOfCategory(c.id, category.id, categories);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "Edit Category" : "Create New Category"}
      description={
        category
          ? "Update category information"
          : "Add a new category to organize your products"
      }
      size="md"
    >
      <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
        {submitError && (
          <Alert variant="error" message={submitError} className="mb-4" />
        )}

        <div className="space-y-2">
          <Label htmlFor="name" required>
            Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Category name"
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
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            type="text"
            placeholder="category-slug"
            disabled={isSubmitting}
            error={!!errors.slug}
            {...register("slug")}
          />
          {errors.slug && (
            <FieldError message={errors.slug.message || "Invalid slug"} />
          )}
          <p className="text-body-xs text-foreground-secondary">
            URL-friendly version of the name. Auto-generated if left empty.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Category description (optional)"
            disabled={isSubmitting}
            error={!!errors.description}
            rows={3}
            {...register("description")}
          />
          {errors.description && (
            <FieldError
              message={errors.description.message || "Invalid description"}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentId">Parent Category</Label>
          <Select
            id="parentId"
            disabled={isSubmitting}
            error={!!errors.parentId}
            value={watch("parentId") || ""}
            onChange={(e) => setValue("parentId", e.target.value || null)}
          >
            <option value="">None (Top-level category)</option>
            {getAvailableParents().map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
          {errors.parentId && (
            <FieldError
              message={errors.parentId.message || "Invalid parent category"}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            type="text"
            placeholder="https://example.com/image.jpg"
            disabled={isSubmitting}
            error={!!errors.image}
            {...register("image")}
          />
          {errors.image && (
            <FieldError message={errors.image.message || "Invalid image URL"} />
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            disabled={isSubmitting}
            checked={watch("isActive")}
            onChange={(e) => setValue("isActive", e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Active
          </Label>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t border-neutral-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <ButtonLoading />
            ) : category ? (
              "Update Category"
            ) : (
              "Create Category"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

