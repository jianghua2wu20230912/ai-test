import api from './api'; // Our configured Axios instance
import { UserProfile } from '../store/slices/authSlice'; // Assuming UserProfile is exported or define here

// Define interfaces for request/response if they differ from UserProfile or are more specific
interface LoginCredentials {
  username: string; // FastAPI Users uses 'username' which is our email
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  // is_active, is_superuser, is_verified are usually not set by client during registration
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  // Potentially other fields like refresh_token if using them
}

// User read schema from backend (fastapi-users default for /users/me)
// This should match the User schema defined in backend.app.schemas.user.User
// For now, we'll use UserProfile, but a more specific type might be needed.
type CurrentUserResponse = UserProfile;


export const authService = {
  loginUser: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const params = new URLSearchParams();
    params.append('username', credentials.username);
    params.append('password', credentials.password);
    // Grant_type is not typically needed if using fastapi-users' default /auth/jwt/login
    // unless you have a custom OAuth2 flow that requires it.
    // params.append('grant_type', 'password');

    const response = await api.post<TokenResponse>('/auth/jwt/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  registerUser: async (userData: RegisterData): Promise<CurrentUserResponse> => {
    // FastAPI-Users register endpoint returns the created user object by default
    const response = await api.post<CurrentUserResponse>('/auth/register', userData);
    return response.data;
  },

  logoutUser: async (): Promise<void> => {
    // FastAPI-Users /auth/jwt/logout endpoint invalidates the token server-side (if applicable)
    // It requires an Authorization header, which our Axios instance adds.
    // It usually returns a 200 or 204 on success.
    await api.post('/auth/jwt/logout');
  },

  fetchCurrentUser: async (): Promise<CurrentUserResponse> => {
    // FastAPI-Users /users/me endpoint
    const response = await api.get<CurrentUserResponse>('/users/me');
    return response.data;
  },
};
