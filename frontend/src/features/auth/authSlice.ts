import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthUser } from "./authTypes";

const initialState: AuthState = {
  isAuthenticated: false,
  accessTokenExpiresAt: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<{ expiresIn: number }>) => {
      state.isAuthenticated = true;
      state.accessTokenExpiresAt = Date.now() + action.payload.expiresIn * 1000;
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessTokenExpiresAt = null;
    },
  },
});

export const { setAuthenticated, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
