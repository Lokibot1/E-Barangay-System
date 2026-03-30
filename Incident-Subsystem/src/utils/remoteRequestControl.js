const DEFAULT_RETRY_DELAY_MS = 30 * 1000;
const MAX_RETRY_DELAY_MS = 5 * 60 * 1000;

const failureStateByScope = new Map();
const inflightRequestByKey = new Map();

const normalizeUrl = (url) => {
  if (typeof url !== "string") return String(url || "");

  try {
    const base =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "http://localhost";
    return new URL(url, base).toString();
  } catch {
    return url;
  }
};

const getScopeKey = (url) => {
  const normalizedUrl = normalizeUrl(url);

  try {
    const parsed = new URL(normalizedUrl);
    return parsed.origin;
  } catch {
    return normalizedUrl;
  }
};

const getFailureState = (url) => failureStateByScope.get(getScopeKey(url)) || null;

export const createServerUnavailableError = () =>
  new Error("The server is currently unavailable.");

export const isServerUnavailableLikeError = (error) => {
  if (!error) return false;

  if (error instanceof TypeError) {
    return true;
  }

  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("server is currently unavailable") ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed")
  );
};

export const shouldAttemptRemoteRequest = (url) => {
  const state = getFailureState(url);
  if (!state) return true;
  return Date.now() >= state.retryAt;
};

export const rememberRemoteRequestSuccess = (url) => {
  failureStateByScope.delete(getScopeKey(url));
};

export const rememberRemoteRequestFailure = (url, error) => {
  if (!isServerUnavailableLikeError(error)) return;

  const key = getScopeKey(url);
  const previousState = failureStateByScope.get(key);
  const nextFailureCount = (previousState?.failureCount || 0) + 1;
  const retryDelay = Math.min(
    DEFAULT_RETRY_DELAY_MS * 2 ** (nextFailureCount - 1),
    MAX_RETRY_DELAY_MS,
  );

  failureStateByScope.set(key, {
    failureCount: nextFailureCount,
    retryAt: Date.now() + retryDelay,
  });
};

export const runDedupedRemoteRequest = async (key, requestFactory) => {
  const normalizedKey = String(key || "");
  const existingRequest = inflightRequestByKey.get(normalizedKey);
  if (existingRequest) {
    return existingRequest;
  }

  const requestPromise = Promise.resolve()
    .then(() => requestFactory())
    .finally(() => {
      inflightRequestByKey.delete(normalizedKey);
    });

  inflightRequestByKey.set(normalizedKey, requestPromise);
  return requestPromise;
};
