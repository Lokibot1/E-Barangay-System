import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import themeTokens from "../../Themetokens";

const Track_COI = () => {
  const navigate = useNavigate();
  const currentTheme = localStorage.getItem("appTheme") || "modern";
  const t = themeTokens[currentTheme];

  const [refNumber, setRefNumber] = useState("");
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    if (!refNumber.trim()) {
      setError("Please enter a reference number.");
      return;
    }

    setLoading(true);
    setError("");
    setRequestData(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/track-coi/${refNumber}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Reference number not found");
      }

      setRequestData(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${t.pageBg} min-h-full p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-5xl mx-auto text-left">
        <h1 className={`text-2xl font-bold ${t.cardText} mb-4`}>
          Track Request Status
        </h1>

        <div className="flex rounded-2xl overflow-hidden border border-gray-300 mb-4">
          <input
            placeholder="Enter Reference Number"
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTrack()}
            className={`flex-1 px-3 py-2 text-lg ${t.inputBg} ${t.inputText} outline-none`}
          />
          <button
            onClick={handleTrack}
            className="px-4 bg-green-500 text-white text-lg"
            disabled={loading}
          >
            {loading ? "Searching..." : "Track"}
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {requestData && (
          <div className={`${t.cardBg} border rounded-2xl p-6`}>
            <h2 className="text-xl font-bold mb-4">
              Status: {requestData.status}
            </h2>

            <div className="space-y-2">
              {/*  <p>
                <strong>Reference Number:</strong>{" "}
                {requestData.reference_number}
              </p> */}
              <p>
                <strong>Date Submitted:</strong> {requestData.date_submitted}
              </p>
              <p>
                <strong>Document Type:</strong> Certificate of Indigency
              </p>
              <p>
                <strong>Applicant Name:</strong> {requestData.full_name}
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate("/sub-system-2")}
                className="px-6 py-2 bg-blue-500 text-white rounded-full"
              >
                Return to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Step = ({ number, active = false, current = false }) => (
  <div
    className={`w-10 h-10 rounded-full flex items-center justify-center font-spartan text-lg font-bold ${
      active
        ? "bg-green-500 text-white"
        : current
          ? "bg-lime-200 text-black"
          : "bg-gray-400 text-white"
    }`}
  >
    {number}
  </div>
);

const StepLabel = ({ title, sub }) => (
  <div>
    <p className="font-kumbh text-sm font-bold text-black leading-tight">
      {title}
    </p>
    <p className="font-kumbh text-xs text-gray-600 leading-tight mt-1">{sub}</p>
  </div>
);

export default Track_COI;
