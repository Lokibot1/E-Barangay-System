import React from "react";
import themeTokens from "../../Themetokens";

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  currentTheme,
  icon,
  ...props
}) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;

  return (
    <div className="form-group">
      <label
        className={`block text-sm font-semibold ${t.labelText} mb-2 font-kumbh`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.subtleText} pointer-events-none`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${icon ? "pl-9 pr-4" : "px-4"} py-3 border rounded-lg transition-all duration-200 ${t.inputBg} ${t.inputText} ${t.inputPlaceholder} font-kumbh ${
            error
              ? "border-red-400 focus:ring-2 focus:ring-red-300 focus:border-red-400 hover:border-red-400"
              : `${t.inputBorder} focus:ring-2 ${t.primaryRing} ${t.primaryBorder} ${t.primaryHoverBorder}`
          }`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
