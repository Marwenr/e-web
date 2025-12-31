import { API_BASE_URL, handleApiResponse, ApiError, apiFetch } from "./config";

// ==================== Admin Products API ====================

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  sku: string;
  basePrice: number;
  discountPrice?: number;
  status: "draft" | "active" | "archived";
  soldCount: number;
  publishedAt?: string;
  images: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductListResponse {
  data: AdminProduct[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  categoryId: string;
  sku: string;
  basePrice: number;
  discountPrice?: number;
  status?: "draft" | "active" | "archived";
  images?: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  attributes?: Array<{
    name: string;
    value: string;
  }>;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface AdminProductListOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: "draft" | "active" | "archived";
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "name" | "createdAt" | "updatedAt" | "basePrice" | "soldCount";
  sortOrder?: "asc" | "desc";
}

export interface BulkActionInput {
  productIds: string[];
  action: "publish" | "unpublish" | "archive" | "delete";
}

export interface BulkActionResponse {
  success: number;
  failed: number;
  errors?: string[];
}

/**
 * Get all products for admin
 */
export async function getAdminProducts(
  options: AdminProductListOptions = {}
): Promise<AdminProductListResponse> {
  const params = new URLSearchParams();
  if (options.page) params.append("page", options.page.toString());
  if (options.limit) params.append("limit", options.limit.toString());
  if (options.search) params.append("search", options.search);
  if (options.status) params.append("status", options.status);
  if (options.categoryId) params.append("categoryId", options.categoryId);
  if (options.minPrice !== undefined)
    params.append("minPrice", options.minPrice.toString());
  if (options.maxPrice !== undefined)
    params.append("maxPrice", options.maxPrice.toString());
  if (options.sortBy) params.append("sortBy", options.sortBy);
  if (options.sortOrder) params.append("sortOrder", options.sortOrder);

  const response = await apiFetch(
    `${API_BASE_URL}/admin/products?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error?.message || data.message || "An error occurred",
      data.error?.code || "API_ERROR",
      response.status
    );
  }

  // Backend returns { success: true, data: [...], meta: {...} }
  // We need to return { data: [...], meta: {...} }
  if (data.success && data.data && data.meta) {
    return {
      data: data.data,
      meta: data.meta,
    };
  }

  // Fallback to handleApiResponse behavior
  return handleApiResponse<AdminProductListResponse>(response);
}

/**
 * Get product by ID (admin)
 */
export async function getAdminProductById(
  productId: string
): Promise<AdminProduct> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/products/${productId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleApiResponse<AdminProduct>(response);
}

/**
 * Create a new product
 */
export async function createAdminProduct(
  input: CreateProductInput
): Promise<AdminProduct> {
  const response = await apiFetch(`${API_BASE_URL}/admin/products`, {
    method: "POST",
    body: JSON.stringify(input),
    credentials: "include",
  });

  return handleApiResponse<AdminProduct>(response);
}

/**
 * Update a product
 */
export async function updateAdminProduct(
  productId: string,
  input: UpdateProductInput
): Promise<AdminProduct> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/products/${productId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
      credentials: "include",
    }
  );

  return handleApiResponse<AdminProduct>(response);
}

/**
 * Delete a product
 */
export async function deleteAdminProduct(productId: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/products/${productId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  await handleApiResponse(response);
}

/**
 * Publish a product
 */
export async function publishAdminProduct(
  productId: string
): Promise<AdminProduct> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/products/${productId}/publish`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  return handleApiResponse<AdminProduct>(response);
}

/**
 * Unpublish a product
 */
export async function unpublishAdminProduct(
  productId: string
): Promise<AdminProduct> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/products/${productId}/unpublish`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  return handleApiResponse<AdminProduct>(response);
}

/**
 * Archive a product
 */
export async function archiveAdminProduct(
  productId: string
): Promise<AdminProduct> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/products/${productId}/archive`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  return handleApiResponse<AdminProduct>(response);
}

/**
 * Bulk actions on products
 */
export async function bulkActionProducts(
  input: BulkActionInput
): Promise<BulkActionResponse> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/products/bulk-action`,
    {
      method: "POST",
      body: JSON.stringify(input),
      credentials: "include",
    }
  );

  return handleApiResponse<BulkActionResponse>(response);
}

// ==================== Admin Inventory API ====================

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantSku: string;
  variantName?: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  lowStockAlert: boolean;
}

export interface InventoryListResponse {
  data: InventoryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface InventoryListOptions {
  page?: number;
  limit?: number;
  productId?: string;
  lowStockOnly?: boolean;
  search?: string;
}

export interface UpdateStockInput {
  stock: number;
  reservedStock?: number;
}

export interface BulkUpdateStockInput {
  updates: Array<{
    variantId: string;
    stock: number;
    reservedStock?: number;
  }>;
}

/**
 * Get inventory list
 */
export async function getAdminInventory(
  options: InventoryListOptions = {}
): Promise<InventoryListResponse> {
  const params = new URLSearchParams();
  if (options.page) params.append("page", options.page.toString());
  if (options.limit) params.append("limit", options.limit.toString());
  if (options.productId) params.append("productId", options.productId);
  if (options.lowStockOnly) params.append("lowStockOnly", "true");
  if (options.search) params.append("search", options.search);

  const response = await apiFetch(
    `${API_BASE_URL}/admin/inventory?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleApiResponse<InventoryListResponse>(response);
}

/**
 * Get inventory by variant ID
 */
export async function getAdminInventoryByVariantId(
  variantId: string
): Promise<InventoryItem> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/inventory/variant/${variantId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleApiResponse<InventoryItem>(response);
}

/**
 * Update stock for a variant
 */
export async function updateAdminStock(
  variantId: string,
  input: UpdateStockInput
): Promise<InventoryItem> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/inventory/variant/${variantId}/stock`,
    {
      method: "PUT",
      body: JSON.stringify(input),
      credentials: "include",
    }
  );

  return handleApiResponse<InventoryItem>(response);
}

/**
 * Bulk update stock
 */
export async function bulkUpdateAdminStock(
  input: BulkUpdateStockInput
): Promise<BulkActionResponse> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/inventory/bulk-update`,
    {
      method: "PUT",
      body: JSON.stringify(input),
      credentials: "include",
    }
  );

  return handleApiResponse<BulkActionResponse>(response);
}

/**
 * Get low stock alerts
 */
export async function getAdminLowStockAlerts(
  threshold?: number
): Promise<InventoryItem[]> {
  const params = new URLSearchParams();
  if (threshold !== undefined) params.append("threshold", threshold.toString());

  const response = await apiFetch(
    `${API_BASE_URL}/admin/inventory/low-stock?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleApiResponse<InventoryItem[]>(response);
}

// ==================== Admin Product Variants API ====================

export interface ProductVariant {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  sku: string;
  name?: string;
  basePrice: number;
  discountPrice?: number;
  stock: number;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  images?: string[];
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductVariantInput {
  productId: string;
  sku: string;
  name?: string;
  basePrice: number;
  discountPrice?: number;
  stock: number;
  attributes: Array<{
    name: string;
    value: string;
  }>;
  images?: string[];
  isDefault?: boolean;
}

export interface UpdateProductVariantInput
  extends Partial<CreateProductVariantInput> {
  productId?: never; // Cannot change productId
}

/**
 * Get all variants for a product
 */
export async function getAdminProductVariants(
  productId: string
): Promise<ProductVariant[]> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/products/${productId}/variants`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleApiResponse<ProductVariant[]>(response);
}

/**
 * Get variant by ID
 */
export async function getAdminProductVariantById(
  variantId: string
): Promise<ProductVariant> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/products/variants/${variantId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleApiResponse<ProductVariant>(response);
}

/**
 * Create a new variant
 */
export async function createAdminProductVariant(
  input: CreateProductVariantInput
): Promise<ProductVariant> {
  const response = await apiFetch(`${API_BASE_URL}/admin/products/variants`, {
    method: "POST",
    body: JSON.stringify(input),
    credentials: "include",
  });

  return handleApiResponse<ProductVariant>(response);
}

/**
 * Update a variant
 */
export async function updateAdminProductVariant(
  variantId: string,
  input: UpdateProductVariantInput
): Promise<ProductVariant> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/products/variants/${variantId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
      credentials: "include",
    }
  );

  return handleApiResponse<ProductVariant>(response);
}

/**
 * Delete a variant
 */
export async function deleteAdminProductVariant(
  variantId: string
): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/products/variants/${variantId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  await handleApiResponse(response);
}

// ==================== Admin Categories API ====================

import { Category } from "./category";

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  image?: string;
  isActive?: boolean;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface AdminCategoryListOptions {
  isActive?: boolean;
  parentId?: string;
}

/**
 * Get all categories for admin
 */
export async function getAdminCategories(
  options: AdminCategoryListOptions = {}
): Promise<Category[]> {
  const params = new URLSearchParams();
  if (options.isActive !== undefined)
    params.append("isActive", options.isActive.toString());
  if (options.parentId) params.append("parentId", options.parentId);

  const response = await apiFetch(
    `${API_BASE_URL}/admin/categories?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleApiResponse<Category[]>(response);
}

/**
 * Get category by ID (admin)
 */
export async function getAdminCategoryById(
  categoryId: string
): Promise<Category> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/categories/${categoryId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleApiResponse<Category>(response);
}

/**
 * Create a new category
 */
export async function createAdminCategory(
  input: CreateCategoryInput
): Promise<Category> {
  const response = await apiFetch(`${API_BASE_URL}/admin/categories`, {
    method: "POST",
    body: JSON.stringify(input),
    credentials: "include",
  });

  return handleApiResponse<Category>(response);
}

/**
 * Update a category
 */
export async function updateAdminCategory(
  categoryId: string,
  input: UpdateCategoryInput
): Promise<Category> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/categories/${categoryId}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
      credentials: "include",
    }
  );

  return handleApiResponse<Category>(response);
}

/**
 * Delete a category
 */
export async function deleteAdminCategory(categoryId: string): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/admin/categories/${categoryId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  await handleApiResponse(response);
}
