// Ensure this line uses the VITE_API_URL as previously discussed
const BASE_URL = import.meta.env.VITE_API_URL;

export const api = async (
  endpoint,
  init // This will contain method, body, headers etc.
) => {
  const url = `${BASE_URL}${endpoint}`;
  const isFormData = init?.body instanceof FormData;

  // Initialize headers
  const headers = isFormData
    ? init?.headers // leave it alone for FormData
    : {
      'Content-Type': 'application/json',
      ...init?.headers,
    };

  // Get token from localStorage and add to headers if it exists
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...init,
    headers, // Use the prepared headers object
    // For JWT in Authorization header, `credentials: 'include'` is generally not necessary
    // and can sometimes cause issues with certain CORS configurations if not carefully handled.
    // We can remove it as it's primarily for cookies.
    // credentials: 'include', // REMOVED
  };

  const response = await fetch(url, config);

  // Handle 401 (Unauthorized) and 403 (Forbidden) errors by clearing token
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    // Optionally, you might want to redirect to login page here,
    // but that's typically handled by the AuthContext or a global error handler.
    // For now, just ensure the token is cleared.
  }

  let data = null;
  try {
    // Only attempt to parse JSON if the response has content
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // If it's not JSON, it might be a text response or empty
      data = await response.text().then(text => text ? { message: text } : {});
    }
  } catch (error) {
    console.error("Error parsing API response or response was empty:", error);
    // data remains null or is set to a default empty object
  }

  if (!response.ok) {
    // If response is not ok, throw an error with the message from data, or a generic one
    throw new Error(data?.error || data?.message || "Request failed");
  }

  return {
    data,
    status: response.status,
    ok: response.ok,
  };
};