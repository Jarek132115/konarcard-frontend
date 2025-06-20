// Ensure this line uses the VITE_API_URL as previously discussed
const BASE_URL = import.meta.env.VITE_API_URL;

export const api = async (
  endpoint,
  init // This will contain method, body, headers etc.
) => {
  const url = `${BASE_URL}${endpoint}`;
  const isFormData = init?.body instanceof FormData;

  // CORRECTED: Initialize headers property, ensuring it's always an object
  // and merging with any provided headers from 'init'.
  // This prevents 'TypeError: Cannot set properties of undefined (setting 'Authorization')'
  // if 'init.headers' is not provided.
  let requestHeaders = init?.headers ? { ...init.headers } : {};

  // Set default Content-Type if not FormData and not already set
  // For FormData, the browser automatically sets 'Content-Type: multipart/form-data' with boundary
  if (!isFormData && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Get token from localStorage and add to headers if it exists
  const token = localStorage.getItem('token');
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...init,
    headers: requestHeaders, // Use our carefully constructed headers object
    // For JWT in Authorization header, `credentials: 'include'` is generally not necessary
    // and can sometimes cause issues with certain CORS configurations if not carefully handled.
    // We can remove it as it's primarily for cookies.
    // credentials: 'include', // REMOVED as per previous discussion, not needed for JWT via Authorization header
  };

  const response = await fetch(url, config);

  // Handle 401 (Unauthorized) and 403 (Forbidden) errors by clearing token
  // This helps log users out if their token becomes invalid/expired.
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    // Optional: Add a redirect to login page if you want users to be immediately redirected
    // window.location.href = '/login'; 
  }

  let data = null;
  try {
    // Only attempt to parse JSON if the response actually has a JSON content type
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // If it's not JSON, it might be a text response or an empty response.
      // Attempt to read as text; if empty, provide an empty object for consistent structure.
      data = await response.text().then(text => text ? { message: text } : {});
    }
  } catch (error) {
    // Log error if parsing fails, but don't re-throw as the API might legitimately return non-JSON on some success cases.
    console.error("Error parsing API response or response was empty:", error);
    // data remains null or is set to a default empty object in case of parsing errors
  }

  if (!response.ok) {
    // If the HTTP response status is not OK (e.g., 4xx, 5xx), throw an Error
    // Use the error message from the backend response if available, otherwise a generic one.
    throw new Error(data?.error || data?.message || `Request to ${endpoint} failed with status ${response.status}`);
  }

  return {
    data,
    status: response.status,
    ok: response.ok,
  };
};