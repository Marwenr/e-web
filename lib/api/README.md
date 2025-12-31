# API Integration

Frontend-backend authentication integration.

## Setup

1. Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

2. Make sure the backend is running on port 3001 (or update the URL accordingly)

## API Client

### Configuration
- Base URL: `NEXT_PUBLIC_API_URL` or defaults to `http://localhost:3001/api`
- All requests include proper headers
- Automatic token management (stored in localStorage)

### Auth Functions

#### `login(credentials)`
- POST `/auth/login`
- Stores tokens automatically
- Returns user data and tokens

#### `register(data)`
- POST `/auth/register`
- Stores tokens automatically
- Returns user data and tokens

#### `logout()`
- POST `/auth/logout`
- Revokes refresh token
- Clears local tokens

#### `logoutAll()`
- POST `/auth/logout-all`
- Requires authentication
- Logs out from all devices

#### `forgotPassword(email)`
- POST `/auth/forgot-password`
- Sends password reset email

#### `resetPassword(token, newPassword)`
- POST `/auth/reset-password`
- Resets password with token from email

#### `changePassword(currentPassword, newPassword)`
- POST `/auth/change-password`
- Requires authentication
- Changes user password

#### `refreshToken()`
- POST `/auth/refresh`
- Automatically called when access token expires
- Updates stored tokens

## Token Management

- Tokens stored in `localStorage`
- Access token: `accessToken`
- Refresh token: `refreshToken`
- Automatically included in authenticated requests
- Cleared on logout

## Error Handling

All API functions throw `ApiError` objects with:
- `message`: Error message
- `code`: Error code
- `statusCode`: HTTP status code

## Usage Example

```tsx
import { login } from '@/lib/api/auth';

try {
  const result = await login({ email, password });
  // User is now authenticated
  // Tokens are stored automatically
} catch (error) {
  // Handle error
  console.error(error.message);
}
```

