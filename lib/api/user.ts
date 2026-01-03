import { API_BASE_URL, handleApiResponse, apiFetch, ApiError } from "./config";

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  storeId?: string;
}

/**
 * Get current user profile
 * Requires authentication
 */
export async function getCurrentUser(): Promise<UserProfile> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
    });

    return await handleApiResponse<UserProfile>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, "GET_USER_ERROR");
    }
    throw error;
  }
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
}

/**
 * Update user profile
 * Requires authentication
 */
export async function updateProfile(
  data: UpdateProfileData
): Promise<UserProfile> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/auth/profile`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    return await handleApiResponse<UserProfile>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, "UPDATE_PROFILE_ERROR");
    }
    throw error;
  }
}
