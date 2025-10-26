import { auth } from "./firebase";

class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "";
  }

  async getAuthHeaders() {
    try {
      const user = auth.currentUser;
      let headers = {
        "Content-Type": "application/json",
      };

      if (user) {
        try {
          const token = await user.getIdToken();
          headers["Authorization"] = `Bearer ${token}`;
        } catch (tokenError) {
          console.warn("Failed to get auth token:", tokenError);
          // Continue without token, the API will handle authentication
        }
      }

      return headers;
    } catch (error) {
      console.error("Error getting auth headers:", error);
      return {
        "Content-Type": "application/json",
      };
    }
  }

  async request(url, options = {}) {
    try {
      const headers = await this.getAuthHeaders();

      const config = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      };

      const response = await fetch(`${this.baseURL}${url}`, config);

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        try {
          // Try to refresh the token
          await auth.currentUser?.getIdToken(true);
          // Retry the request with new token
          const newHeaders = await this.getAuthHeaders();
          config.headers = { ...config.headers, ...newHeaders };
          const retryResponse = await fetch(`${this.baseURL}${url}`, config);
          return this.handleResponse(retryResponse);
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
          // Redirect to login or handle as needed
          if (typeof window !== "undefined") {
            window.location.href = "/auth";
          }
          throw new Error("Authentication failed");
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error(`❌ API Request failed for ${url}:`, error);
      throw error;
    }
  }

  async handleResponse(response) {
    const text = await response.text();

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error("❌ Failed to parse response:", parseError);
      throw new Error("Invalid response from server");
    }

    if (!response.ok) {
      const errorMessage =
        data.error || data.message || `HTTP error! status: ${response.status}`;
      console.error(`❌ API Error ${response.status}:`, errorMessage);

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  async get(url) {
    return this.request(url, {
      method: "GET",
    });
  }

  async post(url, data) {
    return this.request(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(url, data) {
    return this.request(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch(url, data) {
    return this.request(url, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(url) {
    return this.request(url, {
      method: "DELETE",
    });
  }

  // File upload method
  async upload(url, formData) {
    const headers = await this.getAuthHeaders();
    delete headers["Content-Type"]; // Let browser set content type for FormData

    return this.request(url, {
      method: "POST",
      body: formData,
      headers,
    });
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Alternative: Export as default if preferred
export default apiClient;
