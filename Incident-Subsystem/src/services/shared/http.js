import {
  buildAuthHeaders,
  handleUnauthorizedResponse,
  isAuthenticated,
} from "../../homepage/services/loginService";
import {
  createServerUnavailableError,
  rememberRemoteRequestFailure,
  rememberRemoteRequestSuccess,
  runDedupedRemoteRequest,
  shouldAttemptRemoteRequest,
} from "../../utils/remoteRequestControl";

export const parseJsonSafe = async (response) => {
  const data = await response.json().catch(() => ({}));
  return data && typeof data === "object" ? data : {};
};

export const requestJson = async (
  url,
  {
    method = "GET",
    body,
    headers = {},
    includeJson = false,
    requireAuth = true,
    errorMessage = "Request failed.",
  } = {},
) => {
  if (requireAuth && !isAuthenticated()) {
    throw new Error("You must be logged in to continue.");
  }

  const normalizedMethod = String(method || "GET").toUpperCase();
  const shouldDedupeRequest = normalizedMethod === "GET";

  if (shouldDedupeRequest && !shouldAttemptRemoteRequest(url)) {
    throw createServerUnavailableError();
  }

  try {
    const request = () =>
      fetch(url, {
        method,
        headers: requireAuth
          ? { ...buildAuthHeaders({ includeJson }), ...headers }
          : headers,
        body,
      });

    const response = shouldDedupeRequest
      ? await runDedupedRemoteRequest(
          `${normalizedMethod}:${String(url)}`,
          request,
        )
      : await request();

    if (requireAuth) {
      handleUnauthorizedResponse(response);
    }

    const data = await parseJsonSafe(response);

    if (!response.ok) {
      throw new Error(data.message || errorMessage);
    }

    rememberRemoteRequestSuccess(url);
    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    if (error instanceof TypeError) {
      rememberRemoteRequestFailure(url, error);

      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new Error("You appear to be offline. Reconnect and try again.");
      }

      throw createServerUnavailableError();
    }

    if (String(error?.message || "") === "The server is currently unavailable.") {
      rememberRemoteRequestFailure(url, error);
    }

    throw error;
  }
};
