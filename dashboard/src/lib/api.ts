const KEY = "dashboard-login";

export function saveLogin(username: string, password: string) {
  sessionStorage.setItem(KEY, btoa(`${username}:${password}`));
}

export function logout() {
  sessionStorage.removeItem(KEY);
}

export function isLoggedIn() {
  return sessionStorage.getItem(KEY) !== null;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${sessionStorage.getItem(KEY) ?? ""}`,
        ...init.headers,
      },
    });
  } catch (error) {
    throw new Error(
      `Network request failed: ${error instanceof Error ? error.message : String(error)}. Make sure the FastAPI server is running.`
    );
  }

  if (response.status === 401) {
    logout();
    window.dispatchEvent(new CustomEvent("auth-unauthorized"));
    throw new Error("Wrong username or password");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
