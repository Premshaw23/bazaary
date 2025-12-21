const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

type ApiError = {
  status: number;
  message: string;
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });


  if (!res.ok) {
    let message = "Request failed";
    let errorBody = null;
    try {
      const data = await res.json();
      message = data.message || message;
      errorBody = data;
    } catch {}

    // Log error details for debugging
    if (typeof window !== 'undefined') {
      console.error('apiFetch error:', { status: res.status, message, errorBody });
    } else {
      // eslint-disable-next-line no-console
      console.error('apiFetch error (server):', { status: res.status, message, errorBody });
    }

    throw { status: res.status, message, errorBody } as ApiError;
  }

  return res.json();
}
