import React from "react";
import themeTokens from "../Themetokens";

const CheckboxField = ({
  label,
  checked,
  onChange,
  currentTheme,
  ...props
}) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;

  return (
    <div className="flex items-center group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={`w-5 h-5 ${t.checkboxAccent} ${t.checkboxBorder} rounded focus:ring-2 ${t.checkboxRing} cursor-pointer transition-all`}
        {...props}
      />
      <label
        className={`ml-3 text-sm font-medium ${t.checkboxLabelText} cursor-pointer select-none ${t.checkboxLabelHover}`}
      >
        {label}
      </label>
    </div>
  );
};

export default CheckboxField;
