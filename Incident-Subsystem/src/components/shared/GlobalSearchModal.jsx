import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import themeTokens from "../../Themetokens";
import { residentService } from "../../services/sub-system-1/residents";
import { incidentService } from "../../services/sub-system-3/incidentService";
import { getAllComplaints } from "../../services/sub-system-3/complaintService";
import {
  canViewAppointments,
  canViewDocuments,
  canViewIncidentCases,
  canViewResidents,
  mapAdminPathToAccessiblePath,
} from "../../homepage/services/loginService";
import { DOCUMENTS_API_BASE_URL } from "../../config/runtimeApi";
import { requestJson } from "../../services/shared/http";

const RESULT_TYPE_STYLES = {
  resident: "bg-emerald-50 text-emerald-700 border-emerald-200",
  incident: "bg-rose-50 text-rose-700 border-rose-200",
  complaint: "bg-amber-50 text-amber-700 border-amber-200",
  document: "bg-sky-50 text-sky-700 border-sky-200",
  appointment: "bg-violet-50 text-violet-700 border-violet-200",
};

const normalizeText = (value) => String(value || "").toLowerCase().trim();

const normalizeCollection = (payload) =>
  Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

const getIncidentTypeLabel = (incident) => {
  if (typeof incident?.type === "string" && incident.type.trim()) {
    try {
      const parsed = JSON.parse(incident.type);
      if (Array.isArray(parsed)) return parsed.join(", ");
      return String(parsed);
    } catch {
      return incident.type;
    }
  }

  if (Array.isArray(incident?.types) && incident.types.length > 0) {
    return incident.types.map((type) => type?.name).filter(Boolean).join(", ");
  }

  return "Incident";
};

export default function GlobalSearchModal({
  isOpen,
  onClose,
  currentTheme,
}) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [datasets, setDatasets] = useState({
    residents: [],
    incidents: [],
    complaints: [],
    documents: [],
    appointments: [],
  });

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const isDark = currentTheme === "dark";

  const loadSearchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [residentResult, incidentResult, complaintResult, documentResult] =
        await Promise.allSettled([
          residentService.getResidents(),
          incidentService.getAllIncidents(),
          getAllComplaints(),
          requestJson(`${DOCUMENTS_API_BASE_URL}/documents`, {
            errorMessage: "Failed to load document records.",
          }),
        ]);

      const residents =
        residentResult.status === "fulfilled" ? residentResult.value : [];
      const incidents =
        incidentResult.status === "fulfilled"
          ? normalizeCollection(incidentResult.value)
          : [];
      const complaints =
        complaintResult.status === "fulfilled"
          ? normalizeCollection(complaintResult.value)
          : [];
      const documents =
        documentResult.status === "fulfilled"
          ? normalizeCollection(documentResult.value)
          : [];

      const appointments = complaints.flatMap((complaint) =>
        (complaint?.appointments || []).map((appointment) => ({
          ...appointment,
          complaint_id: appointment?.complaint_id ?? complaint?.id,
          complaint_type: complaint?.type || "",
          complainant_name: complaint?.complainant_name || "",
        })),
      );

      setDatasets({
        residents,
        incidents,
        complaints,
        documents,
        appointments,
      });
      setHasLoaded(true);

      if (
        residentResult.status === "rejected" &&
        incidentResult.status === "rejected" &&
        complaintResult.status === "rejected" &&
        documentResult.status === "rejected"
      ) {
        setError("Unable to load searchable records right now.");
      }
    } catch (loadError) {
      setError(loadError.message || "Unable to load searchable records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || hasLoaded) return;
    loadSearchData();
  }, [hasLoaded, isOpen, loadSearchData]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return [];

    const matches = (values) =>
      values.some((value) => normalizeText(value).includes(normalizedQuery));

    const residentResults = canViewResidents()
      ? datasets.residents
      .filter((resident) =>
        matches([
          resident?.name,
          resident?.barangay_id,
          resident?.trackingNumber,
          resident?.resolved_purok,
          resident?.resolved_street,
          resident?.status,
        ]),
      )
      .slice(0, 6)
      .map((resident) => ({
        id: `resident-${resident.id}`,
        type: "resident",
        title: resident?.name || resident?.barangay_id || "Resident",
        subtitle: [
          resident?.barangay_id,
          resident?.status,
          resident?.resolved_purok,
        ]
          .filter(Boolean)
          .join(" · "),
        route: mapAdminPathToAccessiblePath("/admin/residents"),
        state: {
          openResidentId: String(resident.id),
          openResidentBarangayId: String(
            resident?.barangay_id || resident?.trackingNumber || "",
          ),
          openResidentMode: "view",
          openResidentTab: "basic",
          searchQuery:
            resident?.barangay_id || resident?.name || resident?.trackingNumber || "",
        },
        payload: resident,
      }))
      : [];

    const incidentResults = canViewIncidentCases()
      ? datasets.incidents
      .filter((incident) =>
        matches([
          incident?.description,
          incident?.location,
          incident?.status,
          getIncidentTypeLabel(incident),
          incident?.reported_by,
        ]),
      )
      .slice(0, 6)
      .map((incident) => ({
        id: `incident-${incident.id}`,
        type: "incident",
        title: getIncidentTypeLabel(incident),
        subtitle: [
          incident?.location,
          incident?.status,
          incident?.reported_by,
        ]
          .filter(Boolean)
          .join(" · "),
        route: mapAdminPathToAccessiblePath("/admin/incidents"),
        state: {
          openId: String(incident.id),
          openType: "incident",
          defaultTab: "details",
        },
        payload: incident,
      }))
      : [];

    const complaintResults = canViewIncidentCases()
      ? datasets.complaints
      .filter((complaint) =>
        matches([
          complaint?.type,
          complaint?.description,
          complaint?.location,
          complaint?.status,
          complaint?.complainant_name,
        ]),
      )
      .slice(0, 6)
      .map((complaint) => ({
        id: `complaint-${complaint.id}`,
        type: "complaint",
        title: complaint?.type || "Complaint",
        subtitle: [
          complaint?.complainant_name,
          complaint?.status,
          complaint?.location,
        ]
          .filter(Boolean)
          .join(" · "),
        route: mapAdminPathToAccessiblePath("/admin/incidents"),
        state: {
          openId: String(complaint.id),
          openType: "complaint",
          defaultTab: "details",
        },
        payload: complaint,
      }))
      : [];

    const documentResults = canViewDocuments()
      ? datasets.documents
      .filter((documentRecord) =>
        matches([
          documentRecord?.full_name,
          documentRecord?.documentType,
          documentRecord?.reference_number,
          documentRecord?.status,
        ]),
      )
      .slice(0, 6)
      .map((documentRecord) => ({
        id: `document-${documentRecord.reference_number}`,
        type: "document",
        title: documentRecord?.full_name || documentRecord?.reference_number,
        subtitle: [
          documentRecord?.documentType,
          documentRecord?.reference_number,
          documentRecord?.status,
        ]
          .filter(Boolean)
          .join(" · "),
        route: mapAdminPathToAccessiblePath("/admin/documents-inquiry"),
        state: {
          openReferenceNumber: String(documentRecord.reference_number || ""),
          searchQuery:
            documentRecord?.reference_number || documentRecord?.full_name || "",
        },
        payload: documentRecord,
      }))
      : [];

    const appointmentResults = canViewAppointments()
      ? datasets.appointments
      .filter((appointment) =>
        matches([
          appointment?.title,
          appointment?.description,
          appointment?.status,
          appointment?.complainant_name,
          appointment?.scheduled_at,
        ]),
      )
      .slice(0, 6)
      .map((appointment) => ({
        id: `appointment-${appointment.id}`,
        type: "appointment",
        title: appointment?.title || "Appointment",
        subtitle: [
          appointment?.complainant_name,
          appointment?.status,
          appointment?.scheduled_at,
        ]
          .filter(Boolean)
          .join(" · "),
        route: mapAdminPathToAccessiblePath("/admin/appointments"),
        state: {
          openAppointmentId: String(appointment.id),
          searchQuery:
            appointment?.complainant_name || appointment?.title || String(appointment.id),
        },
        payload: appointment,
      }))
      : [];

    return [
      ...residentResults,
      ...incidentResults,
      ...complaintResults,
      ...documentResults,
      ...appointmentResults,
    ].slice(0, 24);
  }, [datasets, query]);

  const hasQuery = Boolean(query.trim());
  const suggestionResults = useMemo(() => results.slice(0, 6), [results]);

  if (!isOpen) {
    return null;
  }

  const openResult = (result) => {
    onClose();
    navigate(result.route, {
      state: {
        ...(result.state || {}),
        globalSearchQuery: query,
      },
    });
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && suggestionResults.length > 0) {
      event.preventDefault();
      openResult(suggestionResults[0]);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[12000] flex items-start justify-center bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div
        className={`relative z-10 w-full max-w-3xl overflow-hidden rounded-[28px] border ${t.cardBorder} ${t.cardBg} shadow-[0_30px_70px_rgba(15,23,42,0.24)]`}
      >
        <div className={`border-b ${t.cardBorder} px-5 py-4 sm:px-6`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${t.primaryLight}`}>
              <svg className={`h-5 w-5 ${t.primaryText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.6-5.15a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className={`font-spartan text-lg font-bold ${t.cardText}`}>
                Search
              </h3>
              <p className={`text-xs ${t.subtleText} font-kumbh`}>
                Search residents, incidents, complaints, documents, and appointments in one place.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close smart search"
              title="Close (Esc)"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                isDark
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18 18 6" />
              </svg>
            </button>
          </div>

          <div className="relative mt-4">
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Try a name, barangay ID, type, reference number, or status..."
              className={`w-full rounded-[18px] border px-4 py-3 text-sm outline-none transition-colors ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
                  : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
              }`}
            />

            {hasQuery && !loading && !error && suggestionResults.length > 0 && (
              <div
                className={`absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-[20px] border shadow-[0_20px_50px_rgba(15,23,42,0.14)] ${
                  isDark
                    ? "border-slate-700 bg-slate-900"
                    : "border-slate-200 bg-white"
                }`}
              >
                {suggestionResults.map((result) => (
                  <button
                    key={`suggestion-${result.id}`}
                    type="button"
                    onClick={() => openResult(result)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                      isDark
                        ? "border-b border-slate-800 last:border-b-0 hover:bg-slate-800"
                        : "border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="1.9"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m21 21-4.35-4.35m1.6-5.15a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-semibold ${t.cardText}`}>
                        {result.title}
                      </p>
                      <p className={`mt-0.5 truncate text-xs ${t.subtleText}`}>
                        {result.subtitle || "Open module"}
                      </p>
                    </div>
                    <span
                      className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        RESULT_TYPE_STYLES[result.type] ||
                        "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      {result.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`max-h-[68vh] overflow-y-auto px-5 py-4 sm:px-6 ${isDark ? "bg-slate-950/40" : "bg-slate-50/60"}`}>
          {loading ? (
            <div className={`rounded-[20px] border px-5 py-8 text-center ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
              <p className={`text-sm font-semibold ${t.cardText}`}>Loading searchable records...</p>
              <p className={`mt-1 text-xs ${t.subtleText}`}>Please wait while we prepare the search index.</p>
            </div>
          ) : error ? (
            <div className={`rounded-[20px] border px-5 py-8 text-center ${isDark ? "border-rose-900/50 bg-rose-950/20" : "border-rose-200 bg-rose-50"}`}>
              <p className={`text-sm font-semibold ${isDark ? "text-rose-300" : "text-rose-700"}`}>{error}</p>
              <button
                type="button"
                onClick={loadSearchData}
                className={`mt-3 rounded-full px-4 py-2 text-xs font-semibold ${
                  isDark ? "bg-rose-300 text-slate-950 hover:bg-rose-200" : "bg-rose-600 text-white hover:bg-rose-700"
                }`}
              >
                Retry loading
              </button>
            </div>
          ) : !query.trim() ? (
            <div className={`rounded-[20px] border px-5 py-8 text-center ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
              <p className={`text-sm font-semibold ${t.cardText}`}>Start typing to search</p>
              <p className={`mt-1 text-xs ${t.subtleText}`}>
                Matching records will appear right below the search field.
              </p>
            </div>
          ) : hasQuery && suggestionResults.length > 0 ? (
            <div className={`rounded-[20px] border px-5 py-6 text-center ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
              <p className={`text-sm font-semibold ${t.cardText}`}>Suggestions ready</p>
              <p className={`mt-1 text-xs ${t.subtleText}`}>
                Choose a result from the list below the search field or press Enter to open the first match.
              </p>
            </div>
          ) : (
            <div className={`rounded-[20px] border px-5 py-8 text-center ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
              <p className={`text-sm font-semibold ${t.cardText}`}>No matching results</p>
              <p className={`mt-1 text-xs ${t.subtleText}`}>
                Try a different name, type, reference number, or status keyword.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
