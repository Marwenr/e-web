import {
  API_BASE_URL,
  getAuthHeaders,
  ApiError,
  handleApiResponse,
} from "./config";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  image?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryQueryParams {
  isActive?: boolean;
  parentId?: string;
}

/**
 * Get all categories from the API
 */
export async function getCategories(
  params?: CategoryQueryParams
): Promise<Category[]> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.isActive !== undefined) {
      queryParams.append("isActive", params.isActive.toString());
    }

    if (params?.parentId) {
      queryParams.append("parentId", params.parentId);
    }

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/categories${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(
        data.error?.message || "Failed to fetch categories",
        data.error?.code || "GET_CATEGORIES_ERROR",
        response.status
      );
    }

    return handleApiResponse<Category[]>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Failed to fetch categories",
      "GET_CATEGORIES_ERROR",
      500
    );
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(
        data.error?.message || "Failed to fetch category",
        data.error?.code || "GET_CATEGORY_ERROR",
        response.status
      );
    }

    return handleApiResponse<Category>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch category", "GET_CATEGORY_ERROR", 500);
  }
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/slug/${slug}`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new ApiError(
        data.error?.message || "Failed to fetch category",
        data.error?.code || "GET_CATEGORY_ERROR",
        response.status
      );
    }

    return handleApiResponse<Category>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch category", "GET_CATEGORY_ERROR", 500);
  }
}
