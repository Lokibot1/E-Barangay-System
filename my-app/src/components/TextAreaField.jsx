import React from "react";
import themeTokens from "../Themetokens";

const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  error,
  currentTheme,
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
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${t.formInputBg} ${t.formInputText} ${t.formInputPlaceholder} resize-none font-kumbh ${
          error
            ? "border-red-400 focus:ring-2 focus:ring-red-300 focus:border-red-400 hover:border-red-400"
            : `${t.formInputBorder} focus:ring-2 ${t.primaryRing} ${t.primaryBorder} ${t.primaryHoverBorder}`
        }`}
        {...props}
      />
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

export default TextAreaField;
