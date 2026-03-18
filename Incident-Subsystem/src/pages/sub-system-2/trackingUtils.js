const REFERENCE_PREFIX_CONFIG = {
  BID: {
    endpoint: "track-request",
    documentType: "Barangay ID",
  },
  COI: {
    endpoint: "track-coi",
    documentType: "Certificate of Indigency",
  },
  COR: {
    endpoint: "track-cor",
    documentType: "Certificate of Residency",
  },
};

const REFERENCE_NUMBER_PATTERN = /^(BID|COI|COR)-\d{4}-\d{5}$/;

export const normalizeReferenceNumber = (value = "") =>
  value.trim().toUpperCase();

export const getReferencePrefix = (referenceNumber = "") =>
  normalizeReferenceNumber(referenceNumber).split("-")[0];

export const isReferenceNumberFormatValid = (referenceNumber = "") =>
  REFERENCE_NUMBER_PATTERN.test(normalizeReferenceNumber(referenceNumber));

export const getReferenceNumberFormatHint = () =>
  "Use BID-2026-00068, COI-2026-00032, or COR-2026-00001 format.";

export const resolveTrackingPath = (
  referenceNumber,
  fallbackPath = "track-request",
) => {
  const prefix = getReferencePrefix(referenceNumber);
  return REFERENCE_PREFIX_CONFIG[prefix]?.endpoint || fallbackPath;
};

export const resolveDocumentType = (
  referenceNumber,
  documentTypeFromApi,
  fallbackDocumentType,
) => {
  if (documentTypeFromApi) return documentTypeFromApi;

  const prefix = getReferencePrefix(referenceNumber);
  return (
    REFERENCE_PREFIX_CONFIG[prefix]?.documentType || fallbackDocumentType
  );
};
