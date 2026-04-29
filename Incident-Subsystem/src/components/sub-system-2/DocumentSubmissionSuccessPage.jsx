import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import themeTokens from "../../Themetokens";
import {
  buildReceiptPayloadFromRecord,
  getDocumentServiceMeta,
  listStoredRequestRecords,
} from "../../utils/requestCenter";
import { downloadRequestReceipt } from "../../utils/requestReceiptPdf";

const formatDate = (value) => {
  if (!value) return "Unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return parsed.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const DocumentSubmissionSuccessPage = ({
  documentKey,
  serviceTitle,
  successMessage,
  requirements,
  fee,
  validityLabel,
  supportPhone = "8-3663-198",
  supportEmail = "teamtolentino@gmail.com",
  sideQrImageSrc = "",
  sideQrTitle = "Verification QR",
  sideQrCaption = "",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTheme = localStorage.getItem("appTheme") || "modern";
  const t = themeTokens[currentTheme] || themeTokens.modern;

  const documentMeta = getDocumentServiceMeta(documentKey);

  const record = useMemo(() => {
    const passedRecord = location.state?.record;
    if (passedRecord?.reference) {
      return passedRecord;
    }

    return listStoredRequestRecords()
      .filter(
        (entry) =>
          entry.category === "document" &&
          String(entry.type || "").toLowerCase() === documentMeta.key,
      )
      .sort(
        (left, right) =>
          new Date(right?.submittedAt || 0).getTime() -
          new Date(left?.submittedAt || 0).getTime(),
      )[0];
  }, [documentMeta.key, location.state]);

  const receiptPayload = useMemo(
    () => buildReceiptPayloadFromRecord(record || {}),
    [record],
  );

  const verificationUrl =
    record?.verificationUrl ||
    `${window.location.origin}/sub-system-2/verify-document?reference=${encodeURIComponent(
      record?.reference || "",
    )}&document=${encodeURIComponent(documentMeta.label)}`;
  const trackStatusUrl = useMemo(() => {
    if (!record?.reference) {
      return documentMeta.trackPath;
    }

    const params = new URLSearchParams({
      reference: record.reference,
    });

    return `${documentMeta.trackPath}?${params.toString()}`;
  }, [documentMeta.trackPath, record?.reference]);
  const qrLinkHref = sideQrImageSrc || verificationUrl;
  const qrLinkTitle = sideQrImageSrc
    ? "Open the GCash QR in a new tab"
    : "Open the document verification page";
  const qrHelperText = sideQrImageSrc
    ? ""
    : "Click the QR to open the verification page.";

  const nextStepMessage = sideQrImageSrc
    ? "Save your receipt and reference number for follow-up. You can track the request status anytime and use the GCash QR below for payment."
    : "Save your receipt and reference number for follow-up. You can track the request status anytime, and the QR code on this page stays available for quick verification.";

  return (
    <div className={`${t.pageBg} min-h-full p-4 sm:p-6 lg:p-8`}>
      <div className="mx-auto max-w-6xl">
        <p className={`mb-4 text-left text-sm font-kumbh ${t.subtleText}`}>
          Home &gt; <span className={`font-semibold ${t.cardText}`}>Request Submitted</span>
        </p>

        <div className="grid gap-4 lg:grid-cols-[1.65fr_0.95fr]">
          <section className={`${t.cardBg} ${t.cardBorder} rounded-[28px] border p-6 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.35)]`}>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/25">
                <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className={`mt-5 text-3xl font-bold font-spartan ${t.cardText}`}>
                Request Submitted Successfully
              </h1>
              <p className={`mt-3 max-w-2xl text-sm font-kumbh leading-6 ${t.subtleText}`}>
                {successMessage}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Service", serviceTitle],
                ["Reference", record?.reference || "Generating reference..."],
                ["Date Submitted", formatDate(record?.submittedAt || new Date().toISOString())],
                ["Status", record?.status || "Pending review"],
              ].map(([label, value]) => (
                <div key={label} className={`rounded-2xl border ${t.cardBorder} ${t.inputBg} px-4 py-4 text-left`}>
                  <p className={`text-[10px] font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText}`}>
                    {label}
                  </p>
                  <p className={`mt-2 text-sm font-spartan font-semibold ${t.cardText}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className={`my-6 border-t ${t.cardBorder}`} />

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.9fr]">
              <div className="space-y-4 text-left">
                <div className={`rounded-[24px] border ${t.cardBorder} ${t.inputBg} px-5 py-5`}>
                  <p className={`text-[10px] font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText}`}>
                    Next Step
                  </p>
                  <p className={`mt-2 text-sm font-kumbh leading-6 ${t.cardText}`}>
                    {nextStepMessage}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                 
                  <button
                    type="button"
                    onClick={() =>
                      navigate(trackStatusUrl, {
                        state: {
                          referenceNumber: record?.reference || "",
                          requestRecord: record || null,
                        },
                      })
                    }
                    className={`rounded-full border ${t.cardBorder} ${t.inputBg} ${t.cardText} px-5 py-3 text-sm font-kumbh font-semibold`}
                  >
                    Track Status
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/my-requests")}
                    className={`rounded-full border ${t.cardBorder} ${t.inputBg} ${t.cardText} px-5 py-3 text-sm font-kumbh font-semibold`}
                  >
                    Open My Requests
                  </button>
                </div>
              </div>

              <div className={`rounded-[24px] border ${t.cardBorder} ${t.inputBg} px-5 py-5 text-center`}>
                <p className={`text-[10px] font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText}`}>
                  {sideQrTitle}
                </p>
                <a
                  href={qrLinkHref}
                  target="_blank"
                  rel="noreferrer"
                  title={qrLinkTitle}
                  className="mt-4 flex justify-center"
                >
                  <div className="rounded-[24px] bg-white p-4 shadow-sm transition-transform duration-200 hover:scale-[1.02]">
                    {sideQrImageSrc ? (
                      <img
                        src={sideQrImageSrc}
                        alt={sideQrTitle}
                        className="h-44 w-44 rounded-[20px] object-contain"
                      />
                    ) : (
                      <QRCodeCanvas value={verificationUrl} size={176} includeMargin />
                    )}
                  </div>
                </a>
                <p className={`mt-4 break-all text-xs font-kumbh ${t.subtleText}`}>
                  {sideQrImageSrc
                    ? sideQrCaption || "Scan to pay via GCash / InstaPay"
                    : record?.reference || "Reference pending"}
                </p>
                <p className={`mt-2 text-[11px] font-kumbh ${t.subtleText}`}>
                  {qrHelperText}
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className={`${t.cardBg} ${t.cardBorder} rounded-[28px] border p-5 shadow-sm`}>
              <h2 className={`text-xl font-bold font-spartan ${t.cardText}`}>
                Service Information
              </h2>
              <div className="mt-4 space-y-4 text-left">
                <div>
                  <p className={`text-xs font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText}`}>
                    Requirements
                  </p>
                  <p className={`mt-2 text-sm font-kumbh leading-6 ${t.cardText}`}>
                    {requirements}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText}`}>
                    Fee
                  </p>
                  <p className={`mt-2 text-sm font-kumbh ${t.cardText}`}>{fee}</p>
                </div>
                <div>
                  <p className={`text-xs font-kumbh font-semibold uppercase tracking-[0.16em] ${t.subtleText}`}>
                    Processing / Validity
                  </p>
                  <p className={`mt-2 text-sm font-kumbh ${t.cardText}`}>{validityLabel}</p>
                </div>
              </div>
            </section>

            <section className={`${t.cardBg} ${t.cardBorder} rounded-[28px] border p-5 shadow-sm`}>
              <h2 className={`text-lg font-bold font-spartan ${t.cardText}`}>
                Need Help?
              </h2>
              <div className="mt-3 space-y-2 text-left">
                <p className={`text-sm font-kumbh ${t.cardText}`}>{supportPhone}</p>
                <p className={`text-sm font-kumbh ${t.cardText}`}>{supportEmail}</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DocumentSubmissionSuccessPage;
