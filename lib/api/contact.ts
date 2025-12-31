import { API_BASE_URL, handleApiResponse, ApiError } from './config';

export interface CreateContactData {
  name: string;
  email: string;
  message: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Submit a contact form
 */
export async function createContact(
  data: CreateContactData
): Promise<Contact> {
  try {
    // Validate API_BASE_URL
    if (!API_BASE_URL) {
      throw new ApiError(
        "API base URL is not configured",
        "API_CONFIG_ERROR",
        500
      );
    }

    const url = `${API_BASE_URL}/contact`;

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

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      let errorMessage = "Failed to submit contact form";
      try {
        const errorData = await response.json();
        errorMessage =
          errorData.error?.message || errorData.message || errorMessage;
      } catch {
        errorMessage = `Server returned ${response.status} ${response.statusText}`;
      }

      throw new ApiError(errorMessage, "CREATE_CONTACT_ERROR", response.status);
    }

    return handleApiResponse<Contact>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    throw new ApiError(errorMessage, "CREATE_CONTACT_ERROR", 0);
  }
}

