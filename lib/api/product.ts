import { API_BASE_URL, getAuthHeaders, ApiError } from "./config";
import { apiCache } from "./cache";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  category:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | string;
  sku: string;
  basePrice: number;
  discountPrice?: number;
  discountPercent?: number;
  status: string;
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

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  category:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | string;
  basePrice: number;
  discountPrice?: number;
  discountPercent?: number;
  soldCount: number;
  images: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  publishedAt?: string;
  createdAt: string;
  status?: string;
}

export interface PaginatedProductsResponse {
  data: ProductListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

/**
 * Get all products with filtering and pagination
 */
export async function getProducts(
  params?: ProductQueryParams
): Promise<PaginatedProductsResponse> {
  try {
    // Validate API_BASE_URL
    if (!API_BASE_URL) {
      throw new ApiError(
        "API base URL is not configured",
        "API_CONFIG_ERROR",
        500
      );
    }

    // Generate cache key from params (before building URL)
    const cacheKey = apiCache.generateKey("products", params);

    // Check cache first (only on client-side)
    if (typeof window !== "undefined") {
      const cachedData = apiCache.get<PaginatedProductsResponse>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params?.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/products${
      queryString ? `?${queryString}` : ""
    }`;

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new ApiError(
        `Invalid API URL format: ${url}`,
        "INVALID_URL_ERROR",
        500
      );
    }

    // Build headers - minimal for public GET requests
    // Don't set Content-Type for GET requests as it can trigger CORS preflight
    const headers: HeadersInit = {};

    // Only add auth token if available (for authenticated requests)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    // Build fetch options - minimal configuration
    const fetchOptions: RequestInit = {
      method: "GET",
    };

    // Only add headers if we have any (empty headers object can cause issues)
    if (Object.keys(headers).length > 0) {
      fetchOptions.headers = headers;
    }

    // Add cache control for client-side only
    if (typeof window !== "undefined") {
      fetchOptions.cache = "no-store";
    }

    // Make the fetch request with better error handling
    let response: Response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (fetchError) {
      // Handle network errors (CORS, connection refused, etc.)
      const errorMessage =
        fetchError instanceof Error
          ? fetchError.message
          : "Network error occurred";

      console.error("Fetch error details:", {
        url,
        error: fetchError,
        errorName: fetchError instanceof Error ? fetchError.name : "Unknown",
        errorMessage,
        API_BASE_URL,
        isClient: typeof window !== "undefined",
        fetchOptions: JSON.stringify(fetchOptions),
      });

      // Provide more helpful error message
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError") ||
        (fetchError instanceof TypeError &&
          fetchError.message.includes("fetch"))
      ) {
        throw new ApiError(
          `Unable to connect to the API server at ${API_BASE_URL}. This could be due to:\n1. Backend server not running\n2. CORS configuration issue\n3. Network connectivity problem\n\nPlease check the browser console and network tab for more details.`,
          "NETWORK_ERROR",
          0
        );
      }

      throw new ApiError(`Network error: ${errorMessage}`, "NETWORK_ERROR", 0);
    }

    if (!response.ok) {
      let errorMessage = "Failed to fetch products";
      let errorCode = "GET_PRODUCTS_ERROR";

      try {
        const data = await response.json();
        errorMessage = data.error?.message || data.message || errorMessage;
        errorCode = data.error?.code || errorCode;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(errorMessage, errorCode, response.status);
    }

    const data = await response.json();

    const result: PaginatedProductsResponse = {
      data: data.data || [],
      meta: data.meta || { page: 1, limit: 10, total: 0, totalPages: 0 },
    };

    // Cache the result (only on client-side, cache for 2 minutes)
    if (typeof window !== "undefined") {
      apiCache.set(cacheKey, result, 2 * 60 * 1000); // 2 minutes TTL
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Log the actual error for debugging
    console.error("Error fetching products:", error);
    console.error("API_BASE_URL:", API_BASE_URL);
    console.error(
      "Error type:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Provide more context in error message
    let errorMessage =
      "Failed to fetch products. Please check your network connection and API configuration.";

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific fetch errors
      if (error.message.includes("fetch") || error.name === "TypeError") {
        errorMessage = `Network error: Unable to connect to API at ${API_BASE_URL}. Please ensure the backend server is running on port 3001. Error: ${error.message}`;
      } else if (error.message.includes("URL")) {
        errorMessage = `Invalid URL: ${API_BASE_URL}. Please check your API configuration.`;
      }
    }

    throw new ApiError(errorMessage, "GET_PRODUCTS_ERROR", 500);
  }
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/slug/${slug}`, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error?.message || "Product not found",
        data.error?.code || "PRODUCT_NOT_FOUND",
        response.status
      );
    }

    // Extract data from { success: true, data: {...} } response
    return data.data || data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch product", "GET_PRODUCT_ERROR", 500);
  }
}

/**
 * Get best selling products
 */
export async function getBestSellers(
  params?: ProductQueryParams
): Promise<PaginatedProductsResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params?.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/products/best-sellers${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error?.message || "Failed to fetch best sellers",
        data.error?.code || "GET_BEST_SELLERS_ERROR",
        response.status
      );
    }

    return {
      data: data.data || [],
      meta: data.meta || { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Failed to fetch best sellers",
      "GET_BEST_SELLERS_ERROR",
      500
    );
  }
}

/**
 * Get new arrival products
 */
export async function getNewArrivals(
  params?: ProductQueryParams
): Promise<PaginatedProductsResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params?.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/products/new-arrivals${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error?.message || "Failed to fetch new arrivals",
        data.error?.code || "GET_NEW_ARRIVALS_ERROR",
        response.status
      );
    }

    return {
      data: data.data || [],
      meta: data.meta || { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Failed to fetch new arrivals",
      "GET_NEW_ARRIVALS_ERROR",
      500
    );
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(
  params?: ProductQueryParams
): Promise<PaginatedProductsResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params?.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/products/featured${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error?.message || "Failed to fetch featured products",
        data.error?.code || "GET_FEATURED_PRODUCTS_ERROR",
        response.status
      );
    }

    return {
      data: data.data || [],
      meta: data.meta || { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Failed to fetch featured products",
      "GET_FEATURED_PRODUCTS_ERROR",
      500
    );
  }
}

/**
 * Get discounted products
 */
export async function getDiscountedProducts(
  params?: ProductQueryParams
): Promise<PaginatedProductsResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params?.minPrice !== undefined)
      queryParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice !== undefined)
      queryParams.append("maxPrice", params.maxPrice.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/products/discounted${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error?.message || "Failed to fetch discounted products",
        data.error?.code || "GET_DISCOUNTED_PRODUCTS_ERROR",
        response.status
      );
    }

    return {
      data: data.data || [],
      meta: data.meta || { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Failed to fetch discounted products",
      "GET_DISCOUNTED_PRODUCTS_ERROR",
      500
    );
  }
}
