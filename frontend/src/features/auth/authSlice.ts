import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthUser } from "./authTypes";

const initialState: AuthState = {
  isAuthenticated: false,
  isAuthChecked: false,
  accessTokenExpiresAt: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<{ expiresIn: number }>) => {
      state.isAuthenticated = true;
      state.isAuthChecked = true;
      state.accessTokenExpiresAt = Date.now() + action.payload.expiresIn * 1000;
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
    },
    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.isAuthChecked = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.isAuthChecked = true;
      state.user = null;
      state.accessTokenExpiresAt = null;
    },
  },
});

export const { setAuthenticated, setUser, setAuthChecked, logout } = authSlice.actions;
export default authSlice.reducer;
