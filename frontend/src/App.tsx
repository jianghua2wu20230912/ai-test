import React from 'react';
import React, { useEffect } from 'react'; // Added useEffect
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { ConfigProvider } from 'antd';
import { useAppDispatch, useAppSelector } from './store/hooks'; // Redux hooks
import { setUser, clearAuth, setLoading, setError, setSuccess } from './store/slices/authSlice'; // Auth actions
import { authService } from './services/authService'; // AuthService

// Optional: Define a custom theme or use Ant Design's default
// import antdTheme from './styles/antdTheme';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const tryAutoLogin = async () => {
      if (token) { // Token loaded from localStorage by initialSate of authSlice
        dispatch(setLoading());
        try {
          // No need to setAuthTokens again, as token is already in state from localStorage
          // Just need to fetch user details to confirm token validity and hydrate user state
          const userData = await authService.fetchCurrentUser();
          dispatch(setUser(userData));
          dispatch(setSuccess()); // Indicate auth state is now successfully hydrated and valid
        } catch (err: any) {
          console.error('Auto-login failed, token might be invalid:', err);
          dispatch(clearAuth()); // Clear invalid token and user data
          // Optionally dispatch setError if you want to show a global message,
          // but often for auto-login failures, silent clear is preferred.
          // dispatch(setError('Session expired. Please log in again.'));
        }
      }
    };

    tryAutoLogin();
  }, [token, dispatch]); // Depend on token to re-run if token changes externally (though unlikely here)

  return (
    <ConfigProvider /* theme={antdTheme} */ >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
