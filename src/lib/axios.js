import axios from "axios";
import { Config } from "./Config";
import { startLoading, stopLoading } from "./globalLoading";

// Create an Axios instance.
//
// ROOT CAUSE FIX (uploads arrived as `{ file: {} }` / binary payloads became
// JSON): this instance used to declare a default `headers: { "Content-Type":
// "application/json" }`. Axios branches on the resolved Content-Type, so any
// FormData body was sent through `JSON.stringify(formDataToJSON(data))`. Since
// a browser `File` has no enumerable own properties, the uploaded file
// collapsed to `{}` and the backend's multer middleware never saw an uploaded
// file. Axios already applies "application/json" on its own for plain-object
// payloads, so removing the instance default only affects multipart requests.
const axiosInstance = axios.create({
  baseURL: `${Config.API_HOST_URl}`,
  // timeout: 10000, // Optional: request timeout
});

/**
 * Keep multipart bodies as native FormData.
 *
 * Removes any pre-existing Content-Type (instance default or one supplied by a
 * caller) so it can neither trigger axios' JSON serialization nor send a
 * boundary-less `multipart/form-data` header. The browser generates the correct
 * `multipart/form-data; boundary=...` value itself.
 */
const stripContentTypeForFormData = (config) => {
  const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;
  if (!isFormData) return;
  if (typeof config.headers?.setContentType === "function") {
    config.headers.setContentType(undefined);
  }
  delete config.headers?.["Content-Type"];
  delete config.headers?.["content-type"];
};

// Track requests that should drive the global loader. Background calls (for
// example on-demand translation batches) opt out via `{ silent: true }`.
const isSilent = (config) => Boolean(config && config.silent) || config?.headers?.["X-Silent"] === "1";

// Optional: Add request interceptor (e.g., attach token)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    stripContentTypeForFormData(config);
    if (!isSilent(config)) {
      config.__globalLoadingTracked = true;
      startLoading();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (response?.config?.__globalLoadingTracked) {
      stopLoading();
    }
    return response;
  },
  (error) => {
    if (error?.config?.__globalLoadingTracked) {
      stopLoading();
    }
    // Global error handling
    if (error.response?.status === 401) {
      // e.g., redirect to login or logout
      console.warn("Unauthorized, logging out...");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
