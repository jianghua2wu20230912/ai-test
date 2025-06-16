import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // other reducers will be added here as the application grows
  },
  // Optional: configure middleware, devTools integration, etc.
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger), // Example with a logger
  devTools: process.env.NODE_ENV !== 'production', // Enable DevTools only in development
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState, ...}
export type AppDispatch = typeof store.dispatch;
