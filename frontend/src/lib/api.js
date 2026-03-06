import axios from "axios";
import { ENV } from "./env";

const api = axios.create({
    baseURL: ENV.API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Module-level token getter; set once by AuthProvider on mount
let _getToken = null;

export function setTokenGetter(getToken) {
    _getToken = getToken;
}

// Request interceptor — attaches Clerk JWT to every outgoing request
api.interceptors.request.use(async (config) => {
    if (_getToken) {
        const token = await _getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor — handles unauthorized errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("Unauthorized request, clearing session...");
            // Optionally handle redirect to login here if not handled by Clerk
        }
        return Promise.reject(error);
    }
);

export default api;
