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

export default api;
