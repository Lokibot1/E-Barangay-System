import React, { useState, useEffect, useCallback } from "react";
import themeTokens from "../../Themetokens";
import {
  getAllCustomFields,
  createCustomField,
  updateCustomField,
} from "../../services/sub-system-3/customFieldService";

// ── Permanent (hardcoded) fields per form type ────────────────────────────────
const INCIDENT_PERMANENT_FIELDS = [
  { label: "Types of Incident", type: "checkbox", step: "Step 1 – Incident Details" },
  { label: "Proof, Evidence, Attachments", type: "file", step: "Step 1 – Incident Details" },
  { label: "Brief Description", type: "textarea", step: "Step 1 – Incident Details" },
  { label: "Pin the Incident Location", type: "map", step: "Step 2 – Location Mapping" },
  { label: "Additional Notes", type: "textarea", step: "Step 2 – Location Mapping" },
];

const COMPLAINT_PERMANENT_FIELDS = [
  { label: "Date of Complaint", type: "date", step: "Step 1 – Basic Information" },
  { label: "Time of Complaint", type: "time", step: "Step 1 – Basic Information" },
  { label: "Location", type: "text", step: "Step 1 – Basic Information" },
  { label: "Pin Location on Map", type: "map", step: "Step 1 – Basic Information" },
  { label: "Complaint Type", type: "select", step: "Step 2 – Complaint Details" },
  { label: "Severity", type: "select", step: "Step 2 – Complaint Details" },
  { label: "Description", type: "textarea", step: "Step 2 – Complaint Details" },
  { label: "Complainant Name", type: "text", step: "Step 3 – Parties Involved" },
  { label: "Complainant Contact Number", type: "tel", step: "Step 3 – Parties Involved" },
  { label: "Respondent Name", type: "text", step: "Step 3 – Parties Involved" },
  { label: "Respondent Address", type: "textarea", step: "Step 3 – Parties Involved" },
  { label: "Witnesses", type: "text-list", step: "Step 3 – Parties Involved" },
  { label: "Desired Resolution", type: "textarea", step: "Step 4 – Additional Info" },
  { label: "Additional Notes", type: "textarea", step: "Step 4 – Additional Info" },
  { label: "Evidence / Attachments", type: "file", step: "Step 4 – Additional Info" },
];

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Text Area" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "select", label: "Dropdown (Select)" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
];

const TYPES_WITH_OPTIONS = ["select", "checkbox", "radio"];

// Type badge styling
const getTypeBadge = (type, isDark) => {
  const map = {
    text: isDark ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700",
    textarea: isDark ? "bg-purple-900/40 text-purple-300" : "bg-purple-100 text-purple-700",
    number: isDark ? "bg-orange-900/40 text-orange-300" : "bg-orange-100 text-orange-700",
    date: isDark ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-700",
    time: isDark ? "bg-teal-900/40 text-teal-300" : "bg-teal-100 text-teal-700",
    select: isDark ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-100 text-yellow-700",
    checkbox: isDark ? "bg-pink-900/40 text-pink-300" : "bg-pink-100 text-pink-700",
    radio: isDark ? "bg-indigo-900/40 text-indigo-300" : "bg-indigo-100 text-indigo-700",
    file: isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600",
    map: isDark ? "bg-emerald-900/40 text-emerald-300" : "bg-emerald-100 text-emerald-700",
    "text-list": isDark ? "bg-cyan-900/40 text-cyan-300" : "bg-cyan-100 text-cyan-700",
    tel: isDark ? "bg-rose-900/40 text-rose-300" : "bg-rose-100 text-rose-700",
  };
  return map[type] || (isDark ? "bg-slate-700 text-slate-300" : "bg-gray-100 text-gray-600");
};

const EMPTY_NEW_FIELD = {
  field_label: "",
  field_type: "text",
  field_description: "",
  field_options: "",
  field_rules: "",
  is_active: true,
};

const UpdateFormModal = ({ isOpen, onClose, formType, currentTheme }) => {
  const t = themeTokens[currentTheme] || themeTokens.blue;
  const isDark = currentTheme === "dark";

  const permanentFields =
    formType === "incident" ? INCIDENT_PERMANENT_FIELDS : COMPLAINT_PERMANENT_FIELDS;

  // ── State ──────────────────────────────────────────────────────────────────
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newField, setNewField] = useState(EMPTY_NEW_FIELD);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // ── Fetch custom fields for this formType ──────────────────────────────────
  const fetchFields = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllCustomFields();
      // response is either an array or { data: [...] }
      const all = Array.isArray(response) ? response : response.data || [];
      setCustomFields(all.filter((f) => f.field_for === formType));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [formType]);

  useEffect(() => {
    if (isOpen) {
      fetchFields();
      setShowAddForm(false);
      setNewField(EMPTY_NEW_FIELD);
      setSaveError(null);
    }
  }, [isOpen, fetchFields]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // ── Toggle is_active ───────────────────────────────────────────────────────
  const handleToggle = async (field) => {
    setTogglingId(field.id);
    try {
      await updateCustomField(field.id, { is_active: !field.is_active });
      setCustomFields((prev) =>
        prev.map((f) => (f.id === field.id ? { ...f, is_active: !f.is_active } : f))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  // ── Create new custom field ────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const payload = {
        field_label: newField.field_label.trim(),
        field_for: formType,
        field_type: newField.field_type,
        field_description: newField.field_description.trim() || undefined,
        field_rules: newField.field_rules.trim() || undefined,
        is_active: newField.is_active,
      };

      if (TYPES_WITH_OPTIONS.includes(newField.field_type) && newField.field_options.trim()) {
        payload.field_options = newField.field_options
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean);
      }

      const result = await createCustomField(payload);
      const created = result.data || result;
      setCustomFields((prev) => [...prev, created]);
      setShowAddForm(false);
      setNewField(EMPTY_NEW_FIELD);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const formTitle = formType === "incident" ? "Incident Report Form" : "Complaint Report Form";
  const formColor = formType === "incident" ? "text-blue-400" : "text-rose-400";
  const addBtnColor =
    formType === "incident"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-rose-600 hover:bg-rose-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative ${isDark ? "bg-slate-800" : "bg-white"} rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="bg-gray-800 text-white px-5 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <svg className={`w-5 h-5 ${formColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h2 className="text-sm font-bold font-spartan tracking-wide uppercase">
                Update {formTitle}
              </h2>
              <p className="text-xs text-slate-400 font-kumbh mt-0.5">
                Manage fields shown to residents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable Body ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Permanent Fields Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className={`text-xs font-bold uppercase tracking-widest font-kumbh ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Permanent Fields
              </h3>
              <span className={`text-xs font-kumbh ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                — cannot be removed
              </span>
            </div>

            <div className={`rounded-xl border ${isDark ? "border-slate-700 bg-slate-700/30" : "border-slate-200 bg-slate-50"} overflow-hidden`}>
              {permanentFields.map((field, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-4 py-3 ${idx !== permanentFields.length - 1 ? (isDark ? "border-b border-slate-700" : "border-b border-slate-100") : ""}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <svg className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold font-kumbh truncate ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        {field.label}
                      </p>
                      <p className={`text-xs font-kumbh ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {field.step}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className={`text-xs font-kumbh font-medium px-2 py-0.5 rounded-full ${getTypeBadge(field.type, isDark)}`}>
                      {field.type}
                    </span>
                    {/* Locked toggle */}
                    <div className="relative flex items-center justify-center w-10 h-6 rounded-full bg-green-500/30 cursor-not-allowed">
                      <div className="absolute right-1 w-4 h-4 rounded-full bg-green-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Fields Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h3 className={`text-xs font-bold uppercase tracking-widest font-kumbh ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Custom Fields
                </h3>
              </div>
              <button
                onClick={() => { setShowAddForm((p) => !p); setSaveError(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-kumbh uppercase rounded-lg text-white transition-colors ${addBtnColor}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAddForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                </svg>
                {showAddForm ? "Cancel" : "Add Field"}
              </button>
            </div>

            {/* Add Field Form */}
            {showAddForm && (
              <form
                onSubmit={handleCreate}
                className={`mb-4 rounded-xl border p-4 space-y-3 ${isDark ? "border-slate-600 bg-slate-700/40" : "border-slate-200 bg-slate-50"}`}
              >
                <p className={`text-xs font-bold font-kumbh uppercase tracking-wide ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  New Custom Field
                </p>

                {saveError && (
                  <p className="text-xs text-red-500 font-kumbh bg-red-500/10 px-3 py-2 rounded-lg">
                    {saveError}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {/* Field Label */}
                  <div className="col-span-2">
                    <label className={`block text-xs font-semibold mb-1 font-kumbh ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      Field Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newField.field_label}
                      onChange={(e) => setNewField((p) => ({ ...p, field_label: e.target.value }))}
                      placeholder="e.g. Barangay Official Notified"
                      required
                      className={`w-full px-3 py-2 text-sm rounded-lg border font-kumbh transition-colors ${isDark ? "bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 focus:border-blue-500" : "bg-white border-slate-300 text-slate-700 placeholder-slate-400 focus:border-blue-500"} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                  </div>

                  {/* Field Type */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1 font-kumbh ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      Field Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newField.field_type}
                      onChange={(e) => setNewField((p) => ({ ...p, field_type: e.target.value, field_options: "" }))}
                      className={`w-full px-3 py-2 text-sm rounded-lg border font-kumbh transition-colors ${isDark ? "bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500" : "bg-white border-slate-300 text-slate-700 focus:border-blue-500"} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    >
                      {FIELD_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Validation Rules */}
                  <div>
                    <label className={`block text-xs font-semibold mb-1 font-kumbh ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      Validation Rules
                    </label>
                    <select
                      value={newField.field_rules}
                      onChange={(e) => setNewField((p) => ({ ...p, field_rules: e.target.value }))}
                      className={`w-full px-3 py-2 text-sm rounded-lg border font-kumbh transition-colors ${isDark ? "bg-slate-700 border-slate-600 text-slate-200 focus:border-blue-500" : "bg-white border-slate-300 text-slate-700 focus:border-blue-500"} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    >
                      <option value="required">Required</option>
                      <option value="">Not Required</option>
                    </select>
                  </div>

                  {/* Options (for select/checkbox/radio) */}
                  {TYPES_WITH_OPTIONS.includes(newField.field_type) && (
                    <div className="col-span-2">
                      <label className={`block text-xs font-semibold mb-1 font-kumbh ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        Options <span className={`font-normal ${isDark ? "text-slate-500" : "text-slate-400"}`}>(comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        value={newField.field_options}
                        onChange={(e) => setNewField((p) => ({ ...p, field_options: e.target.value }))}
                        placeholder='e.g. Yes, No, N/A'
                        className={`w-full px-3 py-2 text-sm rounded-lg border font-kumbh transition-colors ${isDark ? "bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 focus:border-blue-500" : "bg-white border-slate-300 text-slate-700 placeholder-slate-400 focus:border-blue-500"} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />
                    </div>
                  )}

                  {/* Description */}
                  <div className="col-span-2">
                    <label className={`block text-xs font-semibold mb-1 font-kumbh ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      Description
                    </label>
                    <textarea
                      value={newField.field_description}
                      onChange={(e) => setNewField((p) => ({ ...p, field_description: e.target.value }))}
                      placeholder="Brief description of this field..."
                      rows={2}
                      className={`w-full px-3 py-2 text-sm rounded-lg border font-kumbh resize-none transition-colors ${isDark ? "bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500 focus:border-blue-500" : "bg-white border-slate-300 text-slate-700 placeholder-slate-400 focus:border-blue-500"} focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                  </div>

                  {/* is_active toggle */}
                  <div className="col-span-2 flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-semibold font-kumbh ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        Active on form
                      </p>
                      <p className={`text-xs font-kumbh ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        Enable to show this field to residents
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewField((p) => ({ ...p, is_active: !p.is_active }))}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${newField.is_active ? "bg-green-500" : (isDark ? "bg-slate-600" : "bg-slate-300")}`}
                    >
                      <span className={`absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${newField.is_active ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setSaveError(null); }}
                    className={`px-4 py-2 text-xs font-bold font-kumbh uppercase rounded-lg transition-colors ${isDark ? "bg-slate-600 text-slate-300 hover:bg-slate-500" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-4 py-2 text-xs font-bold font-kumbh uppercase rounded-lg text-white transition-colors disabled:opacity-60 ${addBtnColor}`}
                  >
                    {saving ? "Saving..." : "Save Field"}
                  </button>
                </div>
              </form>
            )}

            {/* Custom Field List */}
            {loading ? (
              <div className={`flex items-center justify-center py-10 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-sm font-kumbh">Loading custom fields...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 py-4 px-4 bg-red-500/10 rounded-xl">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-xs font-kumbh text-red-500">{error}</p>
                <button onClick={fetchFields} className="ml-auto text-xs font-kumbh font-semibold text-red-500 underline">Retry</button>
              </div>
            ) : customFields.length === 0 ? (
              <div className={`rounded-xl border-2 border-dashed py-10 text-center ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                <svg className={`w-8 h-8 mx-auto mb-2 ${isDark ? "text-slate-600" : "text-slate-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <p className={`text-sm font-kumbh ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  No custom fields yet. Click "Add Field" to create one.
                </p>
              </div>
            ) : (
              <div className={`rounded-xl border ${isDark ? "border-slate-700 bg-slate-700/30" : "border-slate-200 bg-white"} overflow-hidden`}>
                {customFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className={`flex items-center justify-between px-4 py-3 transition-colors ${!field.is_active ? (isDark ? "opacity-50" : "opacity-60") : ""} ${idx !== customFields.length - 1 ? (isDark ? "border-b border-slate-700" : "border-b border-slate-100") : ""}`}
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-semibold font-kumbh ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                          {field.field_label}
                        </p>
                        <span className={`text-xs font-kumbh font-medium px-2 py-0.5 rounded-full ${getTypeBadge(field.field_type, isDark)}`}>
                          {field.field_type}
                        </span>
                        {field.field_rules && (
                          <span className={`text-xs font-kumbh px-2 py-0.5 rounded-full ${isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700"}`}>
                            {field.field_rules}
                          </span>
                        )}
                      </div>
                      {field.field_description && (
                        <p className={`text-xs font-kumbh mt-0.5 truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          {field.field_description}
                        </p>
                      )}
                      {field.field_options && field.field_options.length > 0 && (
                        <p className={`text-xs font-kumbh mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          Options: {Array.isArray(field.field_options) ? field.field_options.join(", ") : field.field_options}
                        </p>
                      )}
                    </div>

                    {/* Toggle */}
                    <button
                      type="button"
                      disabled={togglingId === field.id}
                      onClick={() => handleToggle(field)}
                      title={field.is_active ? "Click to disable" : "Click to enable"}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${togglingId === field.id ? "opacity-50 cursor-wait" : "cursor-pointer"} ${field.is_active ? "bg-green-500" : (isDark ? "bg-slate-600" : "bg-slate-300")}`}
                    >
                      <span className={`absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${field.is_active ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className={`rounded-xl p-3 ${isDark ? "bg-slate-700/40 border border-slate-700" : "bg-slate-50 border border-slate-100"}`}>
            <div className="flex flex-wrap gap-4 text-xs font-kumbh">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-green-500/30 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>Locked / Active (permanent)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-3.5 rounded-full bg-green-500 relative">
                  <div className="absolute right-0.5 top-0.5 w-2.5 h-2.5 rounded-full bg-white" />
                </div>
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>Shown on form</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-3.5 rounded-full relative ${isDark ? "bg-slate-600" : "bg-slate-300"}`}>
                  <div className="absolute left-0.5 top-0.5 w-2.5 h-2.5 rounded-full bg-white" />
                </div>
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>Hidden from form</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className={`flex-shrink-0 px-5 py-3 border-t flex items-center justify-between ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
          <p className={`text-xs font-kumbh ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {customFields.filter((f) => f.is_active).length} custom field{customFields.filter((f) => f.is_active).length !== 1 ? "s" : ""} active
          </p>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs font-bold font-kumbh uppercase rounded-lg transition-colors ${isDark ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateFormModal;
