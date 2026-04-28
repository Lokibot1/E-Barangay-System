import {
  extractResidentDocumentRelativePath,
  getResidentDocumentStorageUrl,
} from "../config/api";

const missingResidentDocumentUrls = new Set();
const loggedResidentDocumentErrors = new Set();

const normalizeUrl = (value) => (typeof value === "string" ? value.trim() : "");

export const isResidentDocumentProxyUrl = (value) =>
  normalizeUrl(value).includes("/resident-documents");

export const markResidentDocumentSourceAsMissing = (value) => {
  const normalizedValue = normalizeUrl(value);
  if (normalizedValue) {
    missingResidentDocumentUrls.add(normalizedValue);
  }
};

export const resolveResidentDocumentFallbackUrl = (value) => {
  if (!isResidentDocumentProxyUrl(value)) {
    return null;
  }

  const relativePath = extractResidentDocumentRelativePath(value);
  return relativePath ? getResidentDocumentStorageUrl(relativePath) : null;
};

const logResidentDocumentErrorOnce = (url, error) => {
  const statusCode = error?.response?.status || "unknown";
  const key = `${statusCode}:${url}`;

  if (loggedResidentDocumentErrors.has(key)) {
    return;
  }

  loggedResidentDocumentErrors.add(key);
  console.error("Failed to load resident document image:", error);
};

export const loadResidentDocumentSource = async (value, apiClient) => {
  const normalizedValue = normalizeUrl(value);

  if (!normalizedValue) {
    return { kind: "empty", src: null, revoke: null };
  }

  if (!isResidentDocumentProxyUrl(normalizedValue)) {
    return missingResidentDocumentUrls.has(normalizedValue)
      ? { kind: "missing", src: null, revoke: null }
      : { kind: "ready", src: normalizedValue, revoke: null };
  }

  const fallbackUrl = resolveResidentDocumentFallbackUrl(normalizedValue);
  const proxyKnownMissing = missingResidentDocumentUrls.has(normalizedValue);
  const fallbackKnownMissing = fallbackUrl
    ? missingResidentDocumentUrls.has(fallbackUrl)
    : false;

  if (proxyKnownMissing) {
    if (fallbackUrl && !fallbackKnownMissing) {
      return { kind: "ready", src: fallbackUrl, revoke: null };
    }

    return { kind: "missing", src: null, revoke: null };
  }

  try {
    const response = await apiClient.get(normalizedValue, { responseType: "blob" });
    const objectUrl = URL.createObjectURL(response.data);

    return {
      kind: "ready",
      src: objectUrl,
      revoke: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    if (error?.response?.status === 404) {
      markResidentDocumentSourceAsMissing(normalizedValue);
    } else {
      logResidentDocumentErrorOnce(normalizedValue, error);
    }

    if (fallbackUrl && !fallbackKnownMissing) {
      return { kind: "ready", src: fallbackUrl, revoke: null };
    }

    return { kind: "missing", src: null, revoke: null };
  }
};
