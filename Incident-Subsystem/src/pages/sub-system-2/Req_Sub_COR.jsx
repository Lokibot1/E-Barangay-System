import React from "react";
import { useNavigate } from "react-router-dom";
import themeTokens from "../../Themetokens";

const Req_Sub_COR = () => {
  const navigate = useNavigate();
  const currentTheme = localStorage.getItem("appTheme") || "blue";
  const t = themeTokens[currentTheme];

  return (
    <div className={`${t.pageBg} min-h-full p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        <p className={`font-kumbh text-lg ${t.subtleText} mb-3`}>
          Home › <span className={`font-semibold ${t.cardText}`}>Request Submitted</span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl p-6 lg:col-span-2`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full bg-green-500 flex items-center justify-center mb-5">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className={`font-spartan text-5xl font-bold ${t.cardText}`}>Request Submitted Successfully</h1>
              <p className={`font-kumbh text-2xl ${t.subtleText} mt-2`}>
                Your application for a Certificate of Residency has been received.
              </p>
            </div>

            <div className={`border-t ${t.cardBorder} my-6`} />

            <h2 className={`font-spartan text-4xl font-bold ${t.cardText} mb-3`}>Request Summary</h2>
            <div className={`font-kumbh text-2xl ${t.cardText} space-y-1`}>
              <p><span className="font-bold">Reference Number:</span> RES-XXXX-XX99-619</p>
              <p><span className="font-bold">Date Submitted:</span> February 20, 2026</p>
              <p><span className="font-bold">Document Type:</span> Certificate of Residency</p>
              <p><span className="font-bold">Applicant Name:</span> [Given Name]</p>
            </div>

            <div className={`border-t ${t.cardBorder} my-6`} />
            <p className={`font-kumbh text-2xl ${t.cardText}`}>
              Please wait for an email notification regarding the status of your request. You may also track its progress.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/sub-system-2/track-cor")}
                className="bg-green-500 hover:bg-green-600 text-white font-kumbh text-2xl px-6 py-2 rounded-full"
              >
                Track Request Status
              </button>
              <button
                onClick={() => navigate("/sub-system-2")}
                className={`font-kumbh text-2xl px-6 py-2 rounded-full ${t.inputBg} ${t.cardText}`}
              >
                Return to Home
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl p-6`}>
              <h3 className={`font-spartan text-4xl font-bold ${t.cardText} mb-4`}>Service Information</h3>
              <p className={`font-kumbh text-3xl font-bold ${t.cardText}`}>Requirements:</p>
              <p className={`font-kumbh text-2xl ${t.cardText} mt-1`}>Valid ID, Personal Appearance.</p>
              <p className={`font-kumbh text-3xl font-bold ${t.cardText} mt-4`}>Fees:</p>
              <p className={`font-kumbh text-2xl ${t.cardText} mt-1`}>0.00</p>
              <p className={`font-kumbh text-3xl font-bold ${t.cardText} mt-4`}>Validity:</p>
              <p className={`font-kumbh text-2xl ${t.cardText} mt-1`}>6 Months</p>
            </div>

            <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl p-6`}>
              <h3 className={`font-spartan text-3xl font-bold ${t.cardText} mb-2`}>Need Help?</h3>
              <p className={`font-kumbh text-2xl ${t.cardText}`}>&nbsp;</p>
              <p className={`font-kumbh text-2xl ${t.cardText}`}>&nbsp;</p>
              <p className={`font-kumbh text-2xl ${t.cardText}`}>&nbsp;</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Req_Sub_COR;