import {
  buildAuthHeaders,
  notifyAuthForbidden,
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
import { logClientError } from "../../utils/systemDiagnostics";

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
    // Wrap fetch + JSON parse together so runDedupedRemoteRequest caches the
    // parsed result. Without this, concurrent callers (e.g. React StrictMode)
    // receive the same Response object and the second caller gets {} because
    // the body stream was already consumed by the first.
    const fetchAndParse = async () => {
      const resp = await fetch(url, {
        method,
        headers: requireAuth
          ? { ...buildAuthHeaders({ includeJson }), ...headers }
          : headers,
        body,
      });
      const data = await parseJsonSafe(resp);
      return { response: resp, data };
    };

    const { response, data } = shouldDedupeRequest
      ? await runDedupedRemoteRequest(
          `${normalizedMethod}:${String(url)}`,
          fetchAndParse,
        )
      : await fetchAndParse();

    if (requireAuth) {
      handleUnauthorizedResponse(response);
    }

    if (requireAuth && response?.status === 403) {
      notifyAuthForbidden({
        message: data.message || "403 Forbidden",
        url: String(url),
      });
    }

    if (!response.ok) {
      logClientError({
        source: "http.request",
        message: data.message || errorMessage,
        severity: response.status >= 500 ? "error" : "warning",
        context: {
          url,
          method: normalizedMethod,
          status: response.status,
          response: data,
        },
      });
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
      logClientError({
        source: "http.network",
        message: error.message || "Network request failed",
        severity: "error",
        context: {
          url,
          method: normalizedMethod,
        },
      });

      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        throw new Error("You appear to be offline. Reconnect and try again.");
      }

      throw createServerUnavailableError();
    }

    if (String(error?.message || "") === "The server is currently unavailable.") {
      rememberRemoteRequestFailure(url, error);
    }

    if (!(error instanceof TypeError)) {
      logClientError({
        source: "http.request",
        message: error?.message || errorMessage,
        severity: "error",
        context: {
          url,
          method: normalizedMethod,
        },
      });
    }

    throw error;
  }
};