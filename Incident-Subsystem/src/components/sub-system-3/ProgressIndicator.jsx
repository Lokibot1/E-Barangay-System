import React from "react";
import themeTokens from "../../Themetokens";

const ProgressIndicator = ({ currentStep, totalSteps, currentTheme }) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
          >
            <path d="M12.959 2.5H17.5v4m0 11v6H.5v-21h4.459M3.5 17.5h6m-6-4h6m-6-4h10" />
            <path d="m14 .5l-1.562 3h-7L4 .5zm-1.5 15v2h2l8-8l-2-2z" />
          </g>
        </svg>
      ),
    },
    {
      number: 2,
      title: "Details",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 16 16"
        >
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          >
            <rect width="10.5" height="12.5" x="2.75" y="1.75" />
            <path d="m5.75 7.75h4.5m-4.5 3h2.5m-2.5-6h4.5" />
          </g>
        </svg>
      ),
    },
    {
      number: 3,
      title: "People",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 16 16"
        >
          <path
            fill="currentColor"
            d="M5.5 3.5a2.5 2.5 0 1 1 5 0a2.5 2.5 0 0 1-5 0m1 3.5A1.5 1.5 0 0 0 5 8.5V11a3 3 0 1 0 6 0V8.5A1.5 1.5 0 0 0 9.5 7zm-2.444.97A2.5 2.5 0 0 0 4 8.5V11a4 4 0 0 0 1.213 2.87l-.1.028a3 3 0 0 1-3.673-2.121l-.389-1.45A1.5 1.5 0 0 1 2.112 8.49zm6.73 5.9A4 4 0 0 0 12 11V8.5q-.001-.274-.056-.53l1.943.52a1.5 1.5 0 0 1 1.061 1.838l-.388 1.449a3 3 0 0 1-3.773 2.093M1 5a2 2 0 1 1 4 0a2 2 0 0 1-4 0m10 0a2 2 0 1 1 4 0a2 2 0 0 1-4 0"
          />
        </svg>
      ),
    },
    { number: 4, title: "Additional", icon: "📎" },
  ];

  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div>
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between relative">
        <div
          className={`absolute top-5 left-0 right-0 h-1 ${t.progressTrackBg} -z-10`}
        >
          <div
            className={`h-full bg-gradient-to-r ${t.progressGrad} transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 transform ${
                step.number < currentStep
                  ? `bg-gradient-to-br ${t.stepCompleteBg} text-white scale-100 shadow-lg`
                  : step.number === currentStep
                    ? `bg-gradient-to-br ${t.stepActiveBg} text-white scale-110 shadow-xl ring-4 ${t.stepActiveRing}`
                    : `${t.stepInactiveBg} ${t.stepInactiveText} border-2 ${t.stepInactiveBorder}`
              }`}
            >
              {step.number < currentStep ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <span className="font-bold">
                  {typeof step.icon === "string" ? step.icon : step.icon}
                </span>
              )}
            </div>
            <div className="mt-2 text-center font-kumbh">
              <p
                className={`text-xs font-semibold transition-colors ${step.number <= currentStep ? t.stepLabelActive : t.stepLabelInactive}`}
              >
                {step.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-semibold ${t.stepLabelActive}`}>
            Step {currentStep} of {totalSteps}
          </span>
          <span className={`text-xs ${t.stepLabelInactive}`}>
            {steps[currentStep - 1].title}
          </span>
        </div>
        <div
          className={`h-2 ${t.progressTrackBg} rounded-full overflow-hidden`}
        >
          <div
            className={`h-full bg-gradient-to-r ${t.progressGrad} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
