import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import themeTokens from "../../Themetokens";
import { DOCUMENTS_API_BASE_URL } from "../../config/runtimeApi";
import { isAuthenticated } from "../../homepage/services/loginService";
import {
  DOCUMENT_SERVICE_META,
  findStoredRequestRecord,
  getDocumentServiceMeta,
} from "../../utils/requestCenter";
import {
  getReferenceNumberFormatHint,
  isReferenceNumberFormatValid,
  normalizeReferenceNumber,
  resolveDocumentType,
  resolveTrackingPath,
} from "./trackingUtils";

const VerifyDocumentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("appTheme") || "modern",
  );
  const [referenceInput, setReferenceInput] = useState(
    () => normalizeReferenceNumber(searchParams.get("reference") || ""),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const t = themeTokens[currentTheme] || themeTokens.modern;
  const backPath = isAuthenticated() ? "/sub-system-2" : "/";

  useEffect(() => {
    const handleThemeChange = (event) => {
      setCurrentTheme(event.detail);
    };

    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const verificationSummary = useMemo(() => {
    if (!result) return null;

    return {
      title: result.documentType || "Document Request",
      reference: result.reference,
      status: result.status || "Pending",
      requesterName: result.requesterName || result.full_name || "Resident",
      submittedAt: result.submittedAt || result.created_at || "",
      sourceLabel: result.sourceLabel,
      purpose: result.purpose || "",
      address: result.address || result.location || "",
    };
  }, [result]);

  const lookupReference = async (value) => {
    const normalizedReference = normalizeReferenceNumber(value);

    if (!normalizedReference) {
      setError("Enter a reference number to verify.");
      setResult(null);
      return;
    }

    if (!isReferenceNumberFormatValid(normalizedReference)) {
      setError(getReferenceNumberFormatHint());
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const localRecord = findStoredRequestRecord(normalizedReference);

    try {
      const trackingPath = resolveTrackingPath(normalizedReference);
      const response = await fetch(
        `${DOCUMENTS_API_BASE_URL}/${trackingPath}/${normalizedReference}`,
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Reference number not found.");
      }

      const documentType = resolveDocumentType(
        normalizedReference,
        data.document_type,
        localRecord?.documentType || getDocumentServiceMeta(searchParams.get("document")).label,
      );

      setResult({
        reference: data.reference_number || normalizedReference,
        documentType,
        status: data.status || localRecord?.status || "Pending",
        requesterName:
          data.full_name || localRecord?.requesterName || "Resident",
        submittedAt:
          data.created_at || data.submitted_at || localRecord?.submittedAt || "",
        purpose: localRecord?.purpose || "",
        address: localRecord?.address || "",
        sourceLabel: "Verified against live request tracking",
      });
    } catch (lookupError) {
      if (localRecord) {
        setResult({
          ...localRecord,
          sourceLabel: "Verified from saved receipt on this device",
        });
      } else {
        setError(lookupError.message || "Unable to verify this reference.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialReference = normalizeReferenceNumber(
      searchParams.get("reference") || "",
    );

    if (initialReference) {
      lookupReference(initialReference);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`${t.pageBg} min-h-full p-4 sm:p-6 lg:p-8`}>
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className={`inline-flex items-center gap-2 rounded-xl border ${t.cardBorder} ${t.cardBg} px-4 py-2 text-sm font-kumbh font-semibold ${t.cardText}`}
        >
          {isAuthenticated() ? "Back to Document Services" : "Back to Home"}
        </button>

        <section className={`rounded-[32px] border ${t.cardBorder} bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-white shadow-2xl`}>
          <p className="text-[11px] font-kumbh font-semibold uppercase tracking-[0.24em] text-white/75">
            Document Verification
          </p>
          <h1 className="mt-3 text-4xl font-bold font-spartan leading-none">
            Verify a Request Reference
          </h1>
          <p className="mt-4 max-w-3xl text-sm font-kumbh text-white/85">
            Enter or open a receipt QR reference to confirm that the document request exists and check its current status.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={referenceInput}
              onChange={(event) => {
                setReferenceInput(normalizeReferenceNumber(event.target.value));
                setError("");
              }}
              placeholder="BID-2026-00068"
              className="h-14 flex-1 rounded-2xl border border-white/20 bg-white/15 px-4 text-base font-spartan tracking-[0.08em] text-white placeholder:text-white/60 outline-none"
            />
            <button
              type="button"
              onClick={() => lookupReference(referenceInput)}
              disabled={loading}
              className="h-14 rounded-2xl bg-white px-6 text-sm font-spartan font-semibold uppercase tracking-[0.16em] text-emerald-700 disabled:opacity-70"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-kumbh text-rose-700">
            {error}
          </div>
        )}

        {verificationSummary && (
          <section className={`rounded-[28px] border ${t.cardBorder} ${t.cardBg} p-6 shadow-xl`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] font-kumbh font-semibold uppercase tracking-[0.2em] text-emerald-600">
                  Verification Result
                </p>
                <h2 className={`mt-2 text-3xl font-bold font-spartan ${t.cardText}`}>
                  {verificationSummary.title}
                </h2>
                <p className={`mt-2 text-sm font-kumbh ${t.subtleText}`}>
                  {verificationSummary.sourceLabel}
                </p>
              </div>

              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-spartan font-bold uppercase tracking-[0.16em] text-emerald-700">
                {verificationSummary.status}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["Reference Number", verificationSummary.reference],
                ["Requested By", verificationSummary.requesterName],
                ["Submitted", verificationSummary.submittedAt],
                ["Address", verificationSummary.address || "Not provided"],
                ["Purpose", verificationSummary.purpose || "General request"],
                ["Document", verificationSummary.title],
              ].map(([label, value]) => (
                <div key={label} className={`rounded-2xl border ${t.cardBorder} ${t.inlineBg} px-4 py-4`}>
                  <p className={`text-[10px] font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText}`}>
                    {label}
                  </p>
                  <p className={`mt-2 text-sm font-spartan font-semibold ${t.cardText}`}>
                    {value || "-"}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  const reference = verificationSummary.reference;
                  const meta = DOCUMENT_SERVICE_META[
                    getDocumentServiceMeta(verificationSummary.title).key
                  ];
                  navigate(meta.trackPath, { state: { reference } });
                }}
                className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-kumbh font-semibold text-white"
              >
                Open Tracker
              </button>
              <button
                type="button"
                onClick={() => navigate("/my-requests")}
                className={`rounded-2xl border ${t.cardBorder} ${t.inputBg} ${t.cardText} px-5 py-3 text-sm font-kumbh font-semibold`}
              >
                View My Requests
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default VerifyDocumentPage;
