import React from "react";
import { useNavigate } from "react-router-dom";
import themeTokens from "../../Themetokens";

const Track_COI = () => {
  const navigate = useNavigate();
  const currentTheme = localStorage.getItem("appTheme") || "blue";
  const t = themeTokens[currentTheme];

  return (
    <div className={`${t.pageBg} min-h-full p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto text-left">
        <p className={`font-kumbh text-lg ${t.subtleText} mb-2`}>
          Home › Request Submitted › <span className={`font-semibold ${t.cardText}`}>Track Request Status</span>
        </p>
        <h1 className={`font-spartan text-5xl font-bold ${t.cardText} mb-4`}>Track Request Status</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex rounded-2xl overflow-hidden border border-gray-300">
              <input readOnly value="IND-XXXX-XX99-619" className={`flex-1 px-4 py-4 text-3xl font-kumbh ${t.inputBg} ${t.inputText} outline-none`} />
              <button className="px-8 bg-green-500 text-white font-kumbh text-4xl">Track</button>
            </div>

            <div className={`${t.cardBg} border-4 border-blue-500 rounded-3xl p-6`}>
              <div className="bg-lime-100 rounded-xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-4 border-black flex items-center justify-center">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="font-spartan text-4xl font-bold text-black">Status: Under Review</h2>
              </div>

              <div className="mt-6">
                <div className="flex items-start">
                  <div className="flex-1 flex flex-col items-center text-center">
                    <Step number="✓" active />
                    <StepLabel title="Request Submitted" sub="Date: February 20, 2026" />
                  </div>
                  <div className="flex-1 h-1 bg-green-500 mt-10" />
                  <div className="flex-1 flex flex-col items-center text-center">
                    <Step number="2" current />
                    <StepLabel title="Under Review" sub="Current Step" />
                  </div>
                  <div className="flex-1 h-1 bg-gray-300 mt-10" />
                  <div className="flex-1 flex flex-col items-center text-center">
                    <Step number="3" />
                    <StepLabel title="Ready for Pick-Up" sub="Pending" />
                  </div>
                  <div className="flex-1 h-1 bg-gray-300 mt-10" />
                  <div className="flex-1 flex flex-col items-center text-center">
                    <Step number="4" />
                    <StepLabel title="Completed" sub="Pending" />
                  </div>
                </div>
              </div>

              <div className={`border-t ${t.cardBorder} my-4`} />
              <h3 className={`font-spartan text-4xl font-bold ${t.cardText} mb-2`}>Request Details</h3>
              <div className={`font-kumbh text-2xl ${t.cardText} space-y-1`}>
                <p><span className="font-bold">Reference Number:</span> XXXX-XX99-619</p>
                <p><span className="font-bold">Date Submitted:</span> February 20, 2026</p>
                <p><span className="font-bold">Document Type:</span> Certificate of Indigency</p>
                <p><span className="font-bold">Applicants Name:</span> [Given Name]</p>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => navigate("/sub-system-2")}
                  className={`font-kumbh text-2xl px-12 py-2 rounded-full ${t.inputBg} ${t.cardText}`}
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl p-6 text-left`}>
              <h3 className={`font-spartan text-4xl font-bold ${t.cardText} mb-2`}>Service Information</h3>
              <p className={`font-kumbh text-2xl ${t.cardText}`}>
                A Certificate of Indigency request has been received and is currently under review.
              </p>
            </div>
            <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl p-6 text-left`}>
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

const Step = ({ number, active = false, current = false }) => (
  <div
    className={`w-20 h-20 rounded-full flex items-center justify-center font-spartan text-4xl font-bold ${
      active ? "bg-green-500 text-white" : current ? "bg-lime-200 text-black" : "bg-gray-400 text-white"
    }`}
  >
    {number}
  </div>
);

const StepLabel = ({ title, sub }) => (
  <div>
    <p className="font-kumbh text-xl font-bold text-black leading-tight">{title}</p>
    <p className="font-kumbh text-lg text-gray-600 leading-tight mt-1">{sub}</p>
  </div>
);

export default Track_COI;