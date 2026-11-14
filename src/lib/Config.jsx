const rawBackendUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:1990" : "https://api.utkarshassessment.com");

const backendUrl = rawBackendUrl.replace(/\/+$/, "");

export const Config = {
  API_HOST_URl: `${backendUrl}/api/`,
  API_URL: `${backendUrl}/`,
};

