import { getUser } from "../homepage/services/loginService";

const REQUEST_RECORDS_KEY = "ebs:request-center:records";

export const DOCUMENT_SERVICE_META = {
  bid: {
    key: "bid",
    label: "Barangay ID",
    prefix: "BID",
    trackPath: "/sub-system-2/track-bid",
  },
  coi: {
    key: "coi",
    label: "Certificate of Indigency",
    prefix: "COI",
    trackPath: "/sub-system-2/track-coi",
  },
  cor: {
    key: "cor",
    label: "Certificate of Residency",
    prefix: "COR",
    trackPath: "/sub-system-2/track-cor",
  },
};

const CASE_META = {
  complaint: {
    label: "Complaint",
    prefix: "CMP",
    route: "/incident-complaint/case-management",
  },
  incident: {
    label: "Incident Report",
    prefix: "INC",
    route: "/incident-complaint/case-management",
  },
  appointment: {
    label: "Appointment",
    prefix: "APT",
    route: "/my-requests",
  },
};

const readJson = (key, fallback) => {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const titleCase = (value = "") =>
  String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const pickFirstValue = (source, paths = []) => {
  for (const path of paths) {
    const segments = String(path).split(".");
    let current = source;

    for (const segment of segments) {
      current = current?.[segment];
      if (current === undefined || current === null) break;
    }

    if (current !== undefined && current !== null && current !== "") {
      return current;
    }
  }

  return "";
};

const normalizeStatusLabel = (value, fallback = "Pending") => {
  if (!value) return fallback;

  const normalized = String(value).trim().replace(/[_-]+/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const createFallbackReference = (prefix) => {
  const now = new Date();
  const year = now.getFullYear();
  const unique = String(now.getTime()).slice(-5);
  return `${prefix}-${year}-${unique.padStart(5, "0")}`;
};

export const getCurrentUserScope = () => {
  const user = getUser();
  return String(
    user?.id ??
      user?.resident_id ??
      user?.residentId ??
      user?.email ??
      "guest",
  );
};

export const getCurrentUserDisplayName = () => {
  const user = getUser();
  if (!user) return "Resident";

  if (user.name) return user.name;

  const parts = [user.first_name, user.middle_name, user.last_name]
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean);

  return parts.join(" ") || "Resident";
};

export const getCurrentUserContactInfo = () => {
  const user = getUser();
  return {
    email: user?.email || "",
    phone:
      user?.contact_number ||
      user?.contact ||
      user?.phone ||
      user?.mobile ||
      "",
  };
};

export const listStoredRequestRecords = ({ userScope } = {}) => {
  const scope = userScope || getCurrentUserScope();
  const records = readJson(REQUEST_RECORDS_KEY, []);

  return records
    .filter((record) => String(record?.userScope || "") === String(scope))
    .sort(
      (left, right) =>
        new Date(right?.submittedAt || 0).getTime() -
        new Date(left?.submittedAt || 0).getTime(),
    );
};

const upsertRequestRecord = (record) => {
  const existing = readJson(REQUEST_RECORDS_KEY, []);
  const next = [
    record,
    ...existing.filter((entry) => entry?.id !== record.id),
  ].slice(0, 200);

  writeJson(REQUEST_RECORDS_KEY, next);
  return record;
};

export const getDocumentServiceMeta = (documentType) => {
  const normalized = slugify(documentType);

  if (normalized.includes("barangay") || normalized === "bid") {
    return DOCUMENT_SERVICE_META.bid;
  }

  if (normalized.includes("indigency") || normalized === "coi") {
    return DOCUMENT_SERVICE_META.coi;
  }

  if (normalized.includes("residency") || normalized === "cor") {
    return DOCUMENT_SERVICE_META.cor;
  }

  return DOCUMENT_SERVICE_META.bid;
};

const buildVerificationUrl = ({ reference, documentType }) => {
  const params = new URLSearchParams({
    reference,
    document: documentType,
  });
  const path = `/sub-system-2/verify-document?${params.toString()}`;

  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
};

export const saveDocumentRequestRecord = ({
  documentType,
  formData = {},
  responseData = {},
}) => {
  const meta = getDocumentServiceMeta(documentType);
  const reference =
    pickFirstValue(responseData, [
      "reference_number",
      "referenceNumber",
      "tracking_number",
      "trackingNumber",
      "data.reference_number",
      "data.referenceNumber",
      "data.tracking_number",
      "data.trackingNumber",
      "request.reference_number",
      "request.referenceNumber",
      "request.tracking_number",
      "request.trackingNumber",
    ]) || createFallbackReference(meta.prefix);

  const submittedAt =
    pickFirstValue(responseData, [
      "submitted_at",
      "created_at",
      "data.submitted_at",
      "data.created_at",
      "request.submitted_at",
      "request.created_at",
    ]) || new Date().toISOString();

  const status = normalizeStatusLabel(
    pickFirstValue(responseData, [
      "status",
      "data.status",
      "request.status",
    ]),
  );

  const purpose =
    formData.purposeOfRequest ||
    formData.specificPurpose ||
    "General request";

  const record = {
    id: `document:${reference}`,
    userScope: getCurrentUserScope(),
    category: "document",
    type: meta.key,
    title: `${meta.label} Request`,
    documentType: meta.label,
    reference,
    status,
    submittedAt,
    requesterName:
      formData.fullName || getCurrentUserDisplayName() || "Resident",
    email:
      formData.emailAddress || getCurrentUserContactInfo().email || "",
    contactNumber:
      formData.contactNumber || getCurrentUserContactInfo().phone || "",
    address: [formData.purokZone, formData.streetAddress]
      .filter(Boolean)
      .join(", "),
    purpose,
    trackPath: meta.trackPath,
    verificationUrl: buildVerificationUrl({
      reference,
      documentType: meta.label,
    }),
    details: {
      ...formData,
      uploadedFileName:
        formData.uploadedFileName ||
        formData.fileName ||
        responseData?.file_name ||
        "",
    },
    responseData,
  };

  return upsertRequestRecord(record);
};

export const saveCaseRequestRecord = ({
  kind,
  formData = {},
  responseData = {},
}) => {
  const meta = CASE_META[kind] || CASE_META.complaint;
  const entityId = pickFirstValue(responseData, [
    "id",
    "data.id",
    `${kind}.id`,
  ]);
  const reference =
    entityId !== ""
      ? `${meta.prefix}-${String(entityId).padStart(5, "0")}`
      : createFallbackReference(meta.prefix);

  const submittedAt =
    pickFirstValue(responseData, [
      "created_at",
      "submitted_at",
      "data.created_at",
      "data.submitted_at",
    ]) || new Date().toISOString();

  const title =
    kind === "complaint"
      ? `Complaint: ${formData.complaintType || "General Concern"}`
      : `Incident: ${formData.description?.slice(0, 40) || "Report"}`;

  const status = normalizeStatusLabel(
    pickFirstValue(responseData, ["status", "data.status"]),
    kind === "complaint" ? "Ongoing" : "Pending",
  );

  const record = {
    id: `${kind}:${reference}`,
    userScope: getCurrentUserScope(),
    category: kind,
    type: kind,
    title,
    reference,
    status,
    submittedAt,
    requesterName:
      formData.complainantName ||
      getCurrentUserDisplayName() ||
      "Resident",
    contactNumber:
      formData.complainantContact || getCurrentUserContactInfo().phone || "",
    email: getCurrentUserContactInfo().email || "",
    location: formData.location || "",
    route: meta.route,
    details: {
      ...formData,
    },
    responseData,
  };

  return upsertRequestRecord(record);
};

export const findStoredRequestRecord = (reference, { userScope } = {}) => {
  const normalizedReference = String(reference || "").trim().toUpperCase();
  return listStoredRequestRecords({ userScope }).find(
    (record) => String(record.reference || "").trim().toUpperCase() === normalizedReference,
  );
};

export const buildReceiptPayloadFromRecord = (record) => ({
  title: record?.title || "Acknowledgment Receipt",
  reference: record?.reference || record?.id || "N/A",
  category: record?.category || "request",
  status: record?.status || "Pending",
  submittedAt: record?.submittedAt || new Date().toISOString(),
  requesterName: record?.requesterName || "Resident",
  contactNumber: record?.contactNumber || "",
  email: record?.email || "",
  address: record?.address || record?.location || "",
  purpose: record?.purpose || "",
  documentType: record?.documentType || "",
  verificationUrl: record?.verificationUrl || "",
  details: record?.details || {},
});

export const buildReceiptPayloadFromAppointment = (appointment) => ({
  title: appointment?.title || `Appointment #${appointment?.id || ""}`.trim(),
  reference: `APT-${String(appointment?.id || "PENDING").padStart(5, "0")}`,
  category: "appointment",
  status: normalizeStatusLabel(appointment?.status, "Scheduled"),
  submittedAt:
    appointment?.created_at ||
    appointment?.scheduled_at ||
    new Date().toISOString(),
  requesterName: appointment?.complainant_name || "Resident",
  contactNumber: appointment?.complainant_contact || "",
  email: "",
  address: appointment?.respondent_address || "",
  purpose: appointment?.description || appointment?.respondent_name || "",
  documentType: "",
  verificationUrl: "",
  details: {
    complaintId: appointment?.complaint_id || "",
    scheduledAt: appointment?.scheduled_at || "",
    respondentName: appointment?.respondent_name || "",
  },
});
