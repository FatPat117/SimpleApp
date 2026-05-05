import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { store } from "../app/store";
import { logout, setAuthenticated } from "../features/auth/authSlice";

type ViteImportMeta = ImportMeta & {
  env?: {
    VITE_API_URL?: string;
  };
};

const rawApiUrl = (import.meta as ViteImportMeta).env?.VITE_API_URL ?? "http://localhost:4000/api";
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, "");
export const API_BASE_URL = normalizedApiUrl.endsWith("/api") ? normalizedApiUrl : `${normalizedApiUrl}/api`;

type RequestConfigWithRetry = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let queue: Array<() => void> = [];

const flushQueue = () => {
  queue.forEach((cb) => cb());
  queue = [];
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfigWithRetry | undefined;
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push(() => {
          api(originalRequest).then(resolve).catch(reject);
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await refreshClient.post<{ expiresIn: number }>("/auth/refresh");
      store.dispatch(setAuthenticated({ expiresIn: data.expiresIn }));
      flushQueue();
      return api(originalRequest);
    } catch (refreshError) {
      store.dispatch(logout());
      if (window.location.pathname !== "/signin") {
        window.location.href = "/signin?reason=session-expired";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
