import React from "react";
import themeTokens from "../Themetokens";

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  currentTheme,
  ...props
}) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;

  return (
    <div className="form-group">
      <label className="block text-sm font-semibold text-slate-700 mb-2 font-kumbh">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 bg-white text-slate-900 appearance-none cursor-pointer font-kumbh ${
          error
            ? "border-red-400 focus:ring-2 focus:ring-red-300 focus:border-red-400 hover:border-red-400"
            : `border-slate-300 focus:ring-2 ${t.primaryRing} ${t.primaryBorder} ${t.primaryHoverBorder}`
        }`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: "right 0.5rem center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "1.5em 1.5em",
          paddingRight: "2.5rem",
        }}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

export default SelectField;
