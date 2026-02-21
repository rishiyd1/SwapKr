export const apiRequest = async (
  endpoint,
  method = "GET",
  body = null,
  token = null,
) => {
  const headers = {};

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    // Optionally check localStorage if token not explicitly passed
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      headers["Authorization"] = `Bearer ${storedToken}`;
    }
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
    // Remove trailing slash from backendUrl if present
    const baseUrl = backendUrl.endsWith("/")
      ? backendUrl.slice(0, -1)
      : backendUrl;
    // Ensure endpoint has leading slash if not present (optional, but good practice)
    // But usually endpoints passed are like "/api/..."

    // Construct full URL
    // If endpoint is already absolute, use it as is
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(url, config);

    // Auto-logout on 401 (expired/invalid token) — check BEFORE parsing body
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    throw error;
  }
};
