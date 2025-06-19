// Remove TypeScript specific type definitions
// type ApiResponse<T> = Promise<{
//   data: T;
//   status: number;
//   ok: boolean;
// }>;

// Ensure this line uses the VITE_API_URL as previously discussed
const BASE_URL = import.meta.env.VITE_API_URL;
// Removed <T> from function signature and type annotations
export const api = async (
  endpoint, // init?: RequestInit type annotation removed
  init // : ApiResponse<T> type annotation removed
) => {
  const url = `${BASE_URL}${endpoint}`;

  const isFormData = init?.body instanceof FormData;

  const config = { // RequestInit type annotation removed
    credentials: 'include',
    ...init,
    headers: isFormData
      ? init?.headers // leave it alone for FormData
      : {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
  };

  const response = await fetch(url, config);

  let data;
  try {
    data = await response.json();
  } catch (error) { // Added error parameter for console.error or toast
    console.error("Error parsing API response:", error); // Added console.error
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return {
    data,
    status: response.status,
    ok: response.ok,
  };
};