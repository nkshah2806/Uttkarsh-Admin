const backendUrl =
  import.meta.env.VITE_API_URL || "https://api.utkarshassessment.com";

export const Config = {
  API_HOST_URl: `${backendUrl}/api/`,
  API_URL: `${backendUrl}/`,
};

