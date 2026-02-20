import React from "react";
import themeTokens from "../../Themetokens";

const Req_BIDPage = () => {
  const currentTheme = localStorage.getItem("appTheme") || "blue";
  const t = themeTokens[currentTheme];

  return (
    <div className={`${t.pageBg} min-h-full p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`font-spartan text-4xl sm:text-5xl font-bold ${t.cardText}`}>
          Request for Barangay ID
        </h1>
        <p className={`font-kumbh text-lg ${t.subtleText} mt-2 mb-6`}>
          Please fill out the form below to request a certificate.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={`${t.cardBg} ${t.cardBorder} border rounded-2xl p-6 lg:col-span-2`}
          >
            <h2 className={`font-spartan text-4xl font-bold ${t.cardText} mb-4`}>
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name:" t={t} />
              <Field label="Contact Number:" t={t} />
              <Field label="Date of Birth:" type="date" t={t} />
              <SelectField
                label="Civil Status:"
                options={["Single", "Married", "Widowed", "Separated"]}
                t={t}
              />
              <Field label="Email Address:" className="md:col-span-2" t={t} />
            </div>

            <h3 className={`font-spartan text-4xl font-bold ${t.cardText} mt-8 mb-4`}>
              Address Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Purok/Zone:"
                options={["Purok/Zone 1", "Purok/Zone 2", "Purok/Zone 3", "Purok/Zone 4"]}
                t={t}
              />
              <Field label="Street Address:" t={t} />
            </div>

            <h3 className={`font-spartan text-4xl font-bold ${t.cardText} mt-8 mb-4`}>
              ID Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Emergency Contact Name:" t={t} />
              <Field label="Emergency Contact No.:" t={t} />
              <SelectField
                label="Blood Type:"
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                t={t}
              />
            </div>

            <h3 className={`font-spartan text-4xl font-bold ${t.cardText} mt-8 mb-4`}>
              Supporting Documents
            </h3>

            <div>
              <label className={`font-kumbh text-2xl font-medium ${t.cardText} block mb-2`}>
                Upload Valid ID (Government-issued):
              </label>
              <div className="flex items-center gap-2">
                <button className="bg-green-500 hover:bg-green-600 text-white font-kumbh text-lg px-4 py-1.5 rounded-lg transition-colors">
                  Upload file
                </button>
                <span className={`font-kumbh text-xl ${t.subtleText}`}>File list</span>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-kumbh text-2xl py-3 rounded-full transition-colors">
                Submit Barangay ID Request
              </button>
              <button className={`w-full ${t.inputBg} ${t.cardText} font-kumbh text-2xl py-3 rounded-full`}>
                Cancel
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl p-6`}>
              <h3 className={`font-spartan text-4xl font-bold ${t.cardText} mb-4`}>
                Service Information
              </h3>
              <p className={`font-kumbh text-3xl font-bold ${t.cardText}`}>Requirements:</p>
              <p className={`font-kumbh text-2xl ${t.cardText} mt-1`}>
                Valid ID, Proof of Billing,
                <br />
                Personal Appearance.
              </p>

              <p className={`font-kumbh text-3xl font-bold ${t.cardText} mt-4`}>Fees:</p>
              <p className={`font-kumbh text-2xl ${t.cardText} mt-1`}>&nbsp;</p>

              <p className={`font-kumbh text-3xl font-bold ${t.cardText} mt-4`}>Validity:</p>
              <p className={`font-kumbh text-2xl ${t.cardText} mt-1`}>1 Year</p>
            </div>

            <div className={`${t.cardBg} ${t.cardBorder} border rounded-2xl p-6`}>
              <h3 className={`font-spartan text-3xl font-bold ${t.cardText} mb-2`}>
                Need Help?
              </h3>
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

const Field = ({ label, type = "text", className = "", t }) => (
  <div className={className}>
    <label className={`font-kumbh text-2xl font-medium ${t.cardText} block mb-1`}>
      {label}
    </label>
    <input
      type={type}
      className={`w-full border ${t.cardBorder} rounded-xl px-3 py-2 text-xl font-kumbh ${t.inputBg} ${t.inputText}`}
    />
  </div>
);

const SelectField = ({ label, options, t }) => (
  <div>
    <label className={`font-kumbh text-2xl font-medium ${t.cardText} block mb-1`}>
      {label}
    </label>
    <select
      className={`w-full border ${t.cardBorder} rounded-xl px-3 py-2 text-xl font-kumbh ${t.inputBg} ${t.inputText}`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default Req_BIDPage;