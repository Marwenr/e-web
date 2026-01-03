import { API_BASE_URL, handleApiResponse, apiFetch, ApiError } from './config';

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UpdateAddressData {
  fullName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

/**
 * Get all addresses for the current user
 */
export async function getAddresses(): Promise<Address[]> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/addresses`, {
      method: 'GET',
    });

    return await handleApiResponse<Address[]>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, 'GET_ADDRESSES_ERROR');
    }
    throw error;
  }
}

/**
 * Get a single address by ID
 */
export async function getAddressById(id: string): Promise<Address> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'GET',
    });

    return await handleApiResponse<Address>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, 'GET_ADDRESS_ERROR');
    }
    throw error;
  }
}

/**
 * Create a new address
 */
export async function createAddress(data: CreateAddressData): Promise<Address> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/addresses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return await handleApiResponse<Address>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, 'CREATE_ADDRESS_ERROR');
    }
    throw error;
  }
}

/**
 * Update an address
 */
export async function updateAddress(id: string, data: UpdateAddressData): Promise<Address> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    return await handleApiResponse<Address>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, 'UPDATE_ADDRESS_ERROR');
    }
    throw error;
  }
}

/**
 * Delete an address
 */
export async function deleteAddress(id: string): Promise<void> {
  try {
    const response = await apiFetch(`${API_BASE_URL}/addresses/${id}`, {
      method: 'DELETE',
    });

    await handleApiResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new ApiError(error.message, 'DELETE_ADDRESS_ERROR');
    }
    throw error;
  }
}

