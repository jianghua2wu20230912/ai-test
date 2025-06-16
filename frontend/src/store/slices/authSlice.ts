import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a basic user structure for the auth state
interface UserProfile {
  id: string | null;
  email: string | null;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
  // Add any other relevant user fields you expect from the backend User schema
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: UserProfile | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Function to safely parse user from localStorage
const getInitialUser = (): UserProfile | null => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      return JSON.parse(userString) as UserProfile;
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      localStorage.removeItem('user'); // Clear corrupted user data
      return null;
    }
  }
  return null;
};

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  user: getInitialUser(),
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthTokens(state, action: PayloadAction<{ token: string }>) {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.status = 'succeeded';
      state.error = null;
      localStorage.setItem('token', action.payload.token);
    },
    setUser(state, action: PayloadAction<UserProfile>) {
      state.user = action.payload;
      // Stringify user before storing in localStorage
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearAuth(state) {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.status = 'failed';
      state.error = action.payload;
    },
    setSuccess(state) { // General success state if needed
      state.status = 'succeeded';
      state.error = null;
    }
  },
});

export const {
  setAuthTokens,
  setUser,
  clearAuth,
  setLoading,
  setError,
  setSuccess
} = authSlice.actions;

export default authSlice.reducer;
