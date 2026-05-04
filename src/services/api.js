const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, "")}/api`
    : "http://localhost:5000/api");

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");
export const BACKEND_URL = API_BASE_URL.replace(/\/api$/, "");
export const AUTH_CHANGED_EVENT = "tufto:auth-changed";
export const CART_UPDATED_EVENT = "tufto:cart-updated";

function safeParse(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

export function getAuthSession() {
  const user = safeParse(localStorage.getItem("user"));
  const role = user?.role || localStorage.getItem("role");
  const token = localStorage.getItem("token");

  return {
    user,
    role,
    token,
    isAuthenticated: Boolean(user && token),
  };
}

export function emitAuthChanged() {
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

export function emitCartUpdated(cart = null) {
  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: cart,
    })
  );
}

export function saveAuthSession({ user, token }) {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("role", user.role);
  localStorage.setItem("token", token);
  emitAuthChanged();
}

export function clearAuthSession() {
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("token");
  emitAuthChanged();
  emitCartUpdated({
    items: [],
    summary: {
      subtotal: 0,
      total: 0,
      totalQuantity: 0,
      itemCount: 0,
    },
  });
}

export function resolveAssetUrl(value) {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return value.startsWith("/") ? `${BACKEND_URL}${value}` : `${BACKEND_URL}/${value}`;
}

export async function apiRequest(path, options = {}) {
  const { token } = getAuthSession();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
