const BASE_URL = "http://localhost:8000";

type ApiResponse<T> = Promise<{
  data: T;
  status: number;
  ok: boolean;
}>;

export const api = async <T>(
  endpoint: string,
  init?: RequestInit
): ApiResponse<T> => {
  const url = `${BASE_URL}${endpoint}`;

  const isFormData = init?.body instanceof FormData;

  const config: RequestInit = {
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
  } catch {
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
