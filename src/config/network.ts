import axios from "axios";
import apiDetails from "./apiDetails";

const instance = axios.create({
    baseURL: apiDetails.baseUrl,
    withCredentials: false,
});

// Attach static token to every outgoing request
instance.interceptors.request.use(
    (config) => {
        if (apiDetails.staticToken) {
            config.headers.Authorization = `Bearer ${apiDetails.staticToken}`;
        }
        return config;
    },
    (err) => {
        return Promise.reject(err);
    },
);

instance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        try {
            if (error.response) {
                console.log("Error", error.response);
                const { data } = error.response;
                return Promise.reject(data);
            } else {
                return Promise.reject(error);
            }
        } catch (err) {
            return Promise.reject(err);
        }
    },
);

export const get = (url: string, config = {}) => {
    return instance.get(url, config);
};

export const post = (url: string, data: unknown, config = {}) => {
    return instance.post(url, data, config);
};

export const put = (url: string, data: unknown, config = {}) => {
    return instance.put(url, data, config);
};

export const del = (url: string, config = {}) => {
    return instance.delete(url, config);
};

export default instance;