# Frontend-Backend Auth Integration

Complete authentication integration between Next.js frontend and Fastify backend.

## ✅ Completed Integration

### **API Client** (`/lib/api/`)
- ✅ API configuration with base URL
- ✅ Auth API functions (login, register, logout, etc.)
- ✅ Token management (localStorage)
- ✅ Error handling
- ✅ Response parsing

### **Auth Store** (`/store/auth.ts`)
- ✅ Zustand store for auth state
- ✅ User data management
- ✅ Authentication status
- ✅ Loading states
- ✅ Logout functionality

### **Connected Pages**

#### **Login** (`/app/auth/login/page.tsx`)
- ✅ Connected to backend `/auth/login`
- ✅ Form submission with API call
- ✅ Error handling
- ✅ Loading states
- ✅ Token storage
- ✅ Redirect to user settings on success

#### **Register** (`/app/auth/register/page.tsx`)
- ✅ Connected to backend `/auth/register`
- ✅ Form validation
- ✅ API integration
- ✅ Error handling
- ✅ Redirect to verify email

#### **Forgot Password** (`/app/auth/forgot-password/page.tsx`)
- ✅ Connected to backend `/auth/forgot-password`
- ✅ Success state handling
- ✅ Error messages

#### **Reset Password** (`/app/auth/reset-password/page.tsx`)
- ✅ Connected to backend `/auth/reset-password`
- ✅ Token from URL query params
- ✅ Password validation
- ✅ Success redirect

#### **Security Page** (`/app/user/security/page.tsx`)
- ✅ Change password connected to `/auth/change-password`
- ✅ Logout all connected to `/auth/logout-all`
- ✅ Error handling
- ✅ Success messages

#### **Logout** (`/components/auth/LogoutModal.tsx`)
- ✅ Connected to backend `/auth/logout`
- ✅ Token revocation
- ✅ State cleanup
- ✅ Redirect to login

## 🔧 Configuration

### Environment Variables

Create `.env.local` in `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend Endpoints

All endpoints are under `/api/auth/`:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/logout-all` - Logout all devices (protected)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (protected)
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email

## 📦 Token Management

- **Storage**: localStorage
- **Access Token**: `accessToken`
- **Refresh Token**: `refreshToken`
- **Auto-include**: Tokens automatically added to authenticated requests
- **Auto-clear**: Tokens cleared on logout

## 🔐 Authentication Flow

1. **Login/Register** → API call → Store tokens → Update Zustand store → Redirect
2. **Authenticated Requests** → Auto-include Bearer token in headers
3. **Token Refresh** → Automatic refresh when access token expires
4. **Logout** → Revoke refresh token → Clear tokens → Clear store → Redirect

## 🎯 Usage Examples

### Login
```tsx
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';

const { setAuthData } = useAuthStore();
const result = await login({ email, password });
setAuthData(result);
```

### Authenticated Request
```tsx
import { getAuthHeaders } from '@/lib/api/config';

const response = await fetch(`${API_BASE_URL}/protected`, {
  headers: getAuthHeaders(),
});
```

### Logout
```tsx
import { logout } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';

const { logout: logoutStore } = useAuthStore();
await logout();
logoutStore();
```

## 🚀 Next Steps

1. Add token refresh interceptor for automatic token renewal
2. Add route protection middleware
3. Add session persistence
4. Add user profile update API integration
5. Add active sessions API integration

## 📝 Notes

- All API calls use fetch API
- Error handling is consistent across all pages
- Loading states are managed via Zustand
- Tokens are stored in localStorage (consider httpOnly cookies for production)
- CORS must be configured on backend for frontend origin

