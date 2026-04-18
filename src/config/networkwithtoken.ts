import axios from "axios";
import apiDetails from "./apiDetails";

const instance = axios.create({
    baseURL: apiDetails.baseUrl,
    withCredentials: false,
});

instance.interceptors.request.use(
    async (config) => {
        try {
            const raw = localStorage.getItem("userDetails");
            if (raw) {
                const token = JSON.parse(raw);
                const parsedToken = token?.state?.user?.token;
                if (parsedToken) {
                    config.headers.Authorization = `Bearer ${parsedToken}`;
                }
            }
        } catch {
        }
        return config;
    },
    (err) => Promise.reject(err),
);

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        try {
            if (error.response) {
                console.log("Error", error.response);
                const { data, status } = error.response;
                if (status === 401 && data?.error === "Token Expired") {
                    localStorage.clear();
                    window.location.href = "/login";
                }
                return Promise.reject(data);
            } else {
                return Promise.reject(error);
            }
        } catch (err) {
            return Promise.reject(err);
        }
    },
);

export const authorizedGet = (url: string, config = {}) => instance.get(url, config);
export const authorizedPost = (url: string, data: unknown, config = {}) => instance.post(url, data, config);
export const authorizedPut = (url: string, data: unknown, config = {}) => instance.put(url, data, config);
export const authorizedPatch = (url: string, data: unknown, config = {}) => instance.patch(url, data, config);
export const authorizedDel = (url: string, config = {}) => instance.delete(url, config);

export default instance;