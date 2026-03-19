import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Archive,
  ChevronDown,
  ChevronUp,
  FilePlus,
  PencilLine,
  RotateCcw,
  Search,
  Trash2,
  UserMinus,
  X,
} from "lucide-react";
import DatePickerField from "./DatePickerField";
import { fetchAuditLogs } from "../../homepage/services/auditLogService";
import { residentService } from "../../services/sub-system-1/residents";
import { householdService } from "../../services/sub-system-1/household";

// ─── Parallax CSS ─────────────────────────────────────────────────────────────

const PARALLAX_CSS = `
  .log-entry {
    opacity: 0;
    transform: translateY(var(--start-y, 10px));
    transition: opacity 0.35s ease, transform 0.35s ease;
    transition-delay: calc(min(var(--i, 0), 6) * 28ms);
  }
  .log-entry.log-visible {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ─── Config & Helpers ─────────────────────────────────────────────────────────

const ACTION_CONFIG = {
  created: {
    label: "Created",
    Icon: FilePlus,
    iconBg: "bg-emerald-100 text-emerald-600",
    iconBgDark: "bg-emerald-900/30 text-emerald-400",
    dot: "bg-emerald-500",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    darkBadge: "border-emerald-800/40 bg-emerald-900/20 text-emerald-300",
    statsBg: "bg-emerald-50 text-emerald-700",
    statsDark: "bg-emerald-900/20 text-emerald-300",
  },
  updated: {
    label: "Updated",
    Icon: PencilLine,
    iconBg: "bg-blue-100 text-blue-600",
    iconBgDark: "bg-blue-900/30 text-blue-400",
    dot: "bg-blue-500",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    darkBadge: "border-blue-800/40 bg-blue-900/20 text-blue-300",
    statsBg: "bg-blue-50 text-blue-700",
    statsDark: "bg-blue-900/20 text-blue-300",
  },
  deleted: {
    label: "Deleted",
    Icon: Trash2,
    iconBg: "bg-red-100 text-red-600",
    iconBgDark: "bg-red-900/30 text-red-400",
    dot: "bg-red-500",
    badge: "border-red-200 bg-red-50 text-red-700",
    darkBadge: "border-red-800/40 bg-red-900/20 text-red-300",
    statsBg: "bg-red-50 text-red-700",
    statsDark: "bg-red-900/20 text-red-300",
  },
  archived: {
    label: "Archived",
    Icon: Archive,
    iconBg: "bg-amber-100 text-amber-600",
    iconBgDark: "bg-amber-900/30 text-amber-400",
    dot: "bg-amber-500",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    darkBadge: "border-amber-800/40 bg-amber-900/20 text-amber-300",
    statsBg: "bg-amber-50 text-amber-700",
    statsDark: "bg-amber-900/20 text-amber-300",
  },
  restored: {
    label: "Restored",
    Icon: RotateCcw,
    iconBg: "bg-teal-100 text-teal-600",
    iconBgDark: "bg-teal-900/30 text-teal-400",
    dot: "bg-teal-500",
    badge: "border-teal-200 bg-teal-50 text-teal-700",
    darkBadge: "border-teal-800/40 bg-teal-900/20 text-teal-300",
    statsBg: "bg-teal-50 text-teal-700",
    statsDark: "bg-teal-900/20 text-teal-300",
  },
  deactivated: {
    label: "Deactivated",
    Icon: UserMinus,
    iconBg: "bg-rose-100 text-rose-600",
    iconBgDark: "bg-rose-900/30 text-rose-400",
    dot: "bg-rose-500",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    darkBadge: "border-rose-800/40 bg-rose-900/20 text-rose-300",
    statsBg: "bg-rose-50 text-rose-700",
    statsDark: "bg-rose-900/20 text-rose-300",
  },
};

const TYPE_LABELS = {
  incident: "Incident Report",
  complaint: "Complaint",
  appointment: "Appointment",
  user: "User Account",
  customfield: "Custom Field",
  auditlog: "Audit Log",
  resident: "Resident Profile",
  household: "Household Record",
};

// Route map for "View record" navigation
const TYPE_ROUTES = {
  incident: "/admin/incidents",
  complaint: "/admin/incidents",
  appointment: "/admin/appointments",
  resident: "/admin/residents",
  household: "/admin/households",
  user: "/admin/user-management",
};

// Types that deep-link into the modal with the updates tab open
const MODAL_TYPES = new Set(["incident", "complaint"]);

const SOURCE_LABELS = {
  resident: "Resident",
  household: "Household",
  system: "System",
};

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    cls: "bg-violet-100 text-violet-700 border-violet-200",
    darkCls: "bg-violet-900/25 text-violet-300 border-violet-800/40",
  },
  user: {
    label: "Resident",
    cls: "bg-sky-100 text-sky-700 border-sky-200",
    darkCls: "bg-sky-900/25 text-sky-300 border-sky-800/40",
  },
};

const FIELD_LABELS = {
  status: "Status",
  title: "Title",
  description: "Description",
  priority: "Priority",
  user_id: "Assigned User",
  assigned_to: "Assigned To",
  resolution: "Resolution",
  date: "Date",
  time: "Time",
  location: "Location",
  name: "Name",
  email: "Email",
  contact_number: "Contact Number",
  notes: "Notes",
  complaint_type: "Complaint Type",
  incident_type: "Incident Type",
};

const SKIP_FIELDS = new Set([
  "updated_at", "created_at", "deleted_at", "password", "remember_token",
]);

const ACTION_FILTER_MAP = {
  archived: "deleted",
  deactivated: "deleted",
  restored: "created",
  created: "created",
  updated: "updated",
  deleted: "deleted",
};

const RESIDENT_ACTION_MAP = {
  update: "updated",
  archive: "archived",
  restore: "restored",
};

const HOUSEHOLD_ACTION_MAP = {
  edit: "updated",
  deactivate: "deactivated",
  restore: "restored",
};

// Convert snake_case / camelCase / raw strings to Title Case
const toTitleCase = (val) => {
  if (val === null || val === undefined || val === "") return "";
  return String(val)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
};

// Known enum-like fields that should be title-cased
const ENUM_FIELDS = new Set([
  "status", "priority", "role", "type", "complaint_type", "incident_type",
  "action_type", "sector", "position", "marital_status",
]);

const formatValue = (key, val) => {
  const s = String(val ?? "");
  if (!s) return "—";
  if (ENUM_FIELDS.has(key)) return toTitleCase(s);
  return s;
};

const getTimeValue = (value) => {
  const time = new Date(value || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const groupResidentLogs = (logs) => {
  const sorted = [...(logs || [])].sort((a, b) => getTimeValue(a.created_at) - getTimeValue(b.created_at));
  const groups = [];
  let current = null;

  sorted.forEach((log) => {
    const ts = getTimeValue(log.created_at);
    if (
      current &&
      current.editor_name === log.editor_name &&
      current.action_type === log.action_type &&
      current.resident_name === log.resident_name &&
      Math.abs(ts - current._ts) <= 3000
    ) {
      if (log.field_changed) {
        current.changes.push({ field: log.field_changed, old_value: log.old_value, new_value: log.new_value });
      }
      current._ts = Math.max(current._ts, ts);
      if (log.created_at) current.created_at = log.created_at;
    } else {
      current = {
        key: log.id,
        _ts: ts,
        created_at: log.created_at || "",
        resident_name: log.resident_name,
        barangay_id: log.barangay_id || null,
        editor_name: log.editor_name,
        action_type: log.action_type,
        changes: log.field_changed
          ? [{ field: log.field_changed, old_value: log.old_value, new_value: log.new_value }]
          : [],
      };
      groups.push(current);
    }
  });

  return groups;
};

const mapResidentLogs = (logs) => {
  const safeLogs = Array.isArray(logs) ? logs : [];
  return groupResidentLogs(safeLogs).map((group) => {
    const old_values = {};
    const new_values = {};
    group.changes.forEach((c) => { old_values[c.field] = c.old_value; new_values[c.field] = c.new_value; });
    return {
      id: `resident-${group.key}`,
      action: RESIDENT_ACTION_MAP[group.action_type] || "updated",
      auditable_type: "resident",
      auditable_id: group.barangay_id || null,
      user: { name: group.editor_name || "System", role: "admin" },
      old_values,
      new_values,
      created_at: group.created_at || "",
      subject_name: group.resident_name || "",
      ip_address: null,
      source: "resident",
    };
  });
};

const mapHouseholdLogs = (logs) =>
  (Array.isArray(logs) ? logs : []).map((log, index) => {
    const old_values = {};
    const new_values = {};
    (log.changes || []).forEach((c) => {
      const field = c.field || "Field";
      old_values[field] = c.old_value;
      new_values[field] = c.new_value;
    });
    return {
      id: `household-${log.id ?? index}`,
      action: HOUSEHOLD_ACTION_MAP[log.action_type] || "updated",
      auditable_type: "household",
      auditable_id: log.household_display_id || log.household_id || null,
      user: { name: log.edited_by || "System", role: "admin" },
      old_values,
      new_values,
      created_at: log.created_at || log.edited_at || "",
      subject_name: log.head || "",
      ip_address: null,
      source: "household",
    };
  });

const mergeLogs = (existing, incoming) => {
  const merged = new Map();
  existing.forEach((item) => merged.set(item.id, item));
  incoming.forEach((item) => { if (!merged.has(item.id)) merged.set(item.id, item); });
  return Array.from(merged.values()).sort((a, b) => getTimeValue(b.created_at) - getTimeValue(a.created_at));
};

const humanizeField = (key) =>
  FIELD_LABELS[key] ||
  key.replace(/_id$/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const truncate = (val, max = 32) => {
  const s = String(val ?? "");
  return s.length > max ? `${s.slice(0, max)}…` : s;
};

const getChanges = (oldVals, newVals) => {
  if (!newVals || typeof newVals !== "object") return [];
  return Object.entries(newVals)
    .filter(([k]) => !SKIP_FIELDS.has(k))
    .filter(([k, v]) => String(oldVals?.[k] ?? "") !== String(v ?? ""))
    .map(([k, v]) => ({ field: humanizeField(k), key: k, from: oldVals?.[k], to: v }));
};

const getCreatedHighlights = (newVals) => {
  if (!newVals || typeof newVals !== "object") return [];
  const PRIORITY = ["title", "status", "complaint_type", "incident_type", "description", "name", "priority"];
  return PRIORITY
    .filter((k) => newVals[k] !== undefined && newVals[k] !== null && newVals[k] !== "")
    .slice(0, 2)
    .map((k) => ({ field: humanizeField(k), key: k, value: newVals[k] }));
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const buildSentence = (log) => {
  const name = log.user?.name || "System";
  const raw = log.auditable_type || "record";
  const type = (TYPE_LABELS[raw] || raw.replace(/_/g, " ")).toLowerCase();
  const article = /^[aeiou]/i.test(type) ? "an" : "a";
  const id = log.auditable_id ? ` #${log.auditable_id}` : "";
  const subject = log.subject_name ? ` (${log.subject_name})` : "";
  const suffix = `${id}${subject}`;

  const bodies = {
    created: `filed ${article} new ${type}${suffix}`,
    updated: `made changes to ${article} ${type}${suffix}`,
    deleted: `removed ${article} ${type}${suffix}`,
    archived: `archived ${article} ${type}${suffix}`,
    restored: `restored ${article} ${type}${suffix}`,
    deactivated: `deactivated ${article} ${type}${suffix}`,
  };
  return { name, body: bodies[log.action] ?? `performed "${log.action}" on ${article} ${type}${suffix}` };
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const RoleBadge = ({ role, isDark }) => {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold font-kumbh tracking-wide uppercase ${
        isDark ? cfg.darkCls : cfg.cls
      }`}
    >
      {cfg.label}
    </span>
  );
};

const ActionIcon = ({ action, isDark, size = "sm" }) => {
  const cfg = ACTION_CONFIG[action] || ACTION_CONFIG.updated;
  const { Icon } = cfg;
  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const iconDim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-xl ${dim} ${isDark ? cfg.iconBgDark : cfg.iconBg}`}>
      <Icon className={iconDim} strokeWidth={2} />
    </span>
  );
};

// ─── Log Entry Card ────────────────────────────────────────────────────────────

const CHANGES_VISIBLE_DEFAULT = 2;

const LogEntry = ({ log, isDark, t, index, onNavigate }) => {
  const cfg = ACTION_CONFIG[log.action] || ACTION_CONFIG.updated;
  const { name, body } = buildSentence(log);
  const allChanges = log.action === "updated" ? getChanges(log.old_values, log.new_values) : [];
  const highlights = log.action === "created" ? getCreatedHighlights(log.new_values) : [];
  const sourceLabel = SOURCE_LABELS[log.source] || "System";
  const typeLabel = TYPE_LABELS[log.auditable_type] || (log.auditable_type ? toTitleCase(log.auditable_type) : "Record");
  const navigableRoute = TYPE_ROUTES[log.auditable_type];
  const canNavigate = !!navigableRoute && log.action !== "deleted";

  const [expandedChanges, setExpandedChanges] = useState(false);
  const visibleChanges = expandedChanges ? allChanges : allChanges.slice(0, CHANGES_VISIBLE_DEFAULT);
  const hiddenCount = allChanges.length - CHANGES_VISIBLE_DEFAULT;

  return (
    <div
      className={`log-entry rounded-2xl border transition-colors ${t.cardBorder} ${
        isDark ? "bg-slate-900/50" : "bg-white"
      }`}
      style={{ "--i": index, "--start-y": `${Math.min(index * 4 + 10, 40)}px` }}
    >
      {/* Card header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <ActionIcon action={log.action} isDark={isDark} />

        <div className="min-w-0 flex-1">
          {/* User name + role */}
          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
            <span className={`text-[13px] font-bold font-kumbh leading-none ${isDark ? "text-slate-100" : t.cardText}`}>
              {name}
            </span>
            <RoleBadge role={log.user?.role} isDark={isDark} />
          </div>

          {/* Action sentence */}
          <p className={`text-[12px] font-kumbh leading-5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            {body}
          </p>

          {/* Meta chips */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold font-kumbh ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              {sourceLabel}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold font-kumbh ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              {typeLabel}
            </span>
            {log.ip_address && (
              <span className={`text-[10px] font-kumbh ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                {log.ip_address}
              </span>
            )}
            <span className={`text-[10px] font-kumbh ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {timeAgo(log.created_at)}
            </span>
          </div>
        </div>

        {/* Action badge */}
        <span
          className={`shrink-0 self-start rounded-full border px-2.5 py-0.5 text-[10px] font-bold font-kumbh tracking-wide ${
            isDark ? cfg.darkBadge : cfg.badge
          }`}
        >
          {cfg.label}
        </span>
      </div>

      {/* Changes diff */}
      {allChanges.length > 0 && (
        <div
          className={`mx-4 mb-3 rounded-xl border px-4 py-3 ${t.cardBorder} ${
            isDark ? "bg-slate-900/60" : "bg-slate-50/80"
          }`}
        >
          <p className={`mb-2 text-[10px] font-bold font-kumbh uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Changes
          </p>
          <div className="space-y-2">
            {visibleChanges.map((c, i) => {
              const hasFrom = c.from !== undefined && c.from !== null && String(c.from) !== "";
              const hasTo = c.to !== undefined && c.to !== null && String(c.to) !== "";
              return (
                <div key={i} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                  <span
                    className={`text-[11px] font-semibold font-kumbh shrink-0 ${isDark ? "text-slate-400" : "text-slate-500"} sm:w-32`}
                  >
                    {c.field}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold font-kumbh">
                    <span
                      className={`rounded-lg border px-2 py-0.5 ${
                        isDark
                          ? "border-rose-900/40 bg-rose-900/20 text-rose-300"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      } ${hasFrom ? "line-through opacity-70" : "opacity-40"}`}
                    >
                      {hasFrom ? truncate(formatValue(c.key, c.from)) : "—"}
                    </span>
                    <span className={`text-[10px] font-bold ${isDark ? "text-slate-600" : "text-slate-400"}`}>→</span>
                    <span
                      className={`rounded-lg border px-2 py-0.5 ${
                        isDark
                          ? "border-emerald-900/40 bg-emerald-900/20 text-emerald-300"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {hasTo ? truncate(formatValue(c.key, c.to)) : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpandedChanges((v) => !v)}
              className={`mt-2.5 flex items-center gap-1 text-[11px] font-semibold font-kumbh transition-opacity hover:opacity-70 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {expandedChanges ? (
                <><ChevronUp className="h-3 w-3" /> Show less</>
              ) : (
                <><ChevronDown className="h-3 w-3" /> {hiddenCount} more {hiddenCount === 1 ? "change" : "changes"}</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Created highlights */}
      {highlights.length > 0 && (
        <div className="mx-4 mb-3 flex flex-wrap gap-1.5">
          {highlights.map((h, i) => (
            <span
              key={i}
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold font-kumbh ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              <span className="font-bold">{h.field}:</span>{" "}
              {truncate(formatValue(h.key, h.value))}
            </span>
          ))}
        </div>
      )}

      {/* Deleted notice */}
      {log.action === "deleted" && (
        <p className={`mx-4 mb-3 text-[11px] font-kumbh italic ${isDark ? "text-red-400/60" : "text-red-400"}`}>
          This record has been permanently removed.
        </p>
      )}

      {/* Card footer — view record button */}
      {canNavigate && (
        <div className={`flex items-center justify-end border-t px-4 py-2.5 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
          <button
            type="button"
            onClick={() => onNavigate(log, navigableRoute)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold font-kumbh transition-all hover:gap-2 ${
              isDark
                ? "text-slate-300 hover:text-white"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            View {typeLabel}
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const LogSkeleton = ({ isDark }) => {
  const pulse = isDark ? "bg-slate-700/70 animate-pulse" : "bg-slate-200/80 animate-pulse";
  const faint = isDark ? "bg-slate-700/40 animate-pulse" : "bg-slate-100 animate-pulse";
  return (
    <div className={`rounded-2xl border ${isDark ? "border-slate-700/50 bg-slate-900/40" : "border-slate-200/80 bg-white"}`}>
      <div className="flex items-start gap-3 px-4 pt-4 pb-4">
        <div className={`h-8 w-8 shrink-0 rounded-xl ${pulse}`} />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-24 rounded-full ${pulse}`} />
            <div className={`h-4 w-10 rounded-full ${faint}`} />
          </div>
          <div className={`h-2.5 w-4/5 rounded-full ${faint}`} />
          <div className="flex gap-1.5">
            <div className={`h-2 w-14 rounded-full ${faint}`} />
            <div className={`h-2 w-18 rounded-full ${faint}`} />
            <div className={`h-2 w-10 rounded-full ${faint}`} />
          </div>
        </div>
        <div className={`h-5 w-14 rounded-full ${faint}`} />
      </div>
    </div>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar = ({ logs, isDark }) => {
  const counts = useMemo(() => {
    const result = {};
    logs.forEach((log) => {
      const key = log.action || "updated";
      result[key] = (result[key] || 0) + 1;
    });
    return result;
  }, [logs]);

  const entries = Object.entries(counts).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([action, count]) => {
        const cfg = ACTION_CONFIG[action] || ACTION_CONFIG.updated;
        return (
          <span
            key={action}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold font-kumbh ${
              isDark ? cfg.statsDark : cfg.statsBg
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}: {count}
          </span>
        );
      })}
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold font-kumbh ${
          isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
        }`}
      >
        Total: {logs.length}
      </span>
    </div>
  );
};

// ─── Active Filter Chips ──────────────────────────────────────────────────────

const FilterChips = ({ filters, search, userType, onClearFilter, isDark }) => {
  const chips = [];
  if (search.trim()) chips.push({ key: "search", label: `"${search.trim()}"` });
  if (filters.action) chips.push({ key: "action", label: `Action: ${toTitleCase(filters.action)}` });
  if (userType) chips.push({ key: "userType", label: `${userType === "admin" ? "Admin" : "Resident"} logs` });
  if (filters.start_date) chips.push({ key: "start_date", label: `From: ${filters.start_date}` });
  if (filters.end_date) chips.push({ key: "end_date", label: `To: ${filters.end_date}` });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-2">
      <span className={`text-[11px] font-kumbh ${isDark ? "text-slate-500" : "text-slate-400"}`}>Active:</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onClearFilter(chip.key)}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold font-kumbh transition-opacity hover:opacity-70 ${
            isDark
              ? "border-slate-600 bg-slate-800 text-slate-300"
              : "border-slate-300 bg-white text-slate-600"
          }`}
        >
          {chip.label}
          <X className="h-2.5 w-2.5" />
        </button>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const POLL_INTERVAL = 20000;

const ActivityLogsView = ({ t, isDark, onBack }) => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userType, setUserType] = useState("");
  const [filters, setFilters] = useState({ action: "", start_date: "", end_date: "" });
  const [newCount, setNewCount] = useState(0);
  const [openCalendar, setOpenCalendar] = useState(null);

  const filtersRef = useRef(filters);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);
  const listRef = useRef(null);
  const knownIdsRef = useRef(new Set());

  // ── Debounce search ──
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const applyFilters = useCallback((next) => {
    filtersRef.current = next;
    setFilters(next);
    setLogs([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setNewCount(0);
    setInitialLoading(true);
    knownIdsRef.current = new Set();
    setResetKey((k) => k + 1);
  }, []);

  const clearAll = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setUserType("");
    applyFilters({ action: "", start_date: "", end_date: "" });
  }, [applyFilters]);

  const handleClearFilter = useCallback((key) => {
    if (key === "search") { setSearch(""); setDebouncedSearch(""); }
    else if (key === "userType") setUserType("");
    else if (key === "action") applyFilters({ ...filtersRef.current, action: "" });
    else if (key === "start_date") applyFilters({ ...filtersRef.current, start_date: "" });
    else if (key === "end_date") applyFilters({ ...filtersRef.current, end_date: "" });
  }, [applyFilters]);

  const handleNavigate = useCallback((log, route) => {
    onBack();
    const state = MODAL_TYPES.has(log.auditable_type) && log.auditable_id
      ? { openId: String(log.auditable_id), openType: log.auditable_type, defaultTab: "updates" }
      : undefined;
    navigate(route, state ? { state } : undefined);
  }, [navigate, onBack]);

  // ── Fetch ──
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const f = filtersRef.current;
        const params = { page, per_page: 20 };
        if (f.action) params.action = f.action;
        if (f.start_date) params.start_date = f.start_date;
        if (f.end_date) params.end_date = f.end_date;

        const auditPromise = fetchAuditLogs(params);
        const extraPromise = page === 1
          ? Promise.allSettled([residentService.getAllLogs(), householdService.getAllLogs()])
          : Promise.resolve([]);

        const [auditData, extraResults] = await Promise.all([auditPromise, extraPromise]);
        if (cancelled) return;

        const auditItems = auditData.data || [];
        let extraItems = [];

        if (page === 1 && Array.isArray(extraResults)) {
          const [residentResult, householdResult] = extraResults;
          extraItems = [
            ...mapResidentLogs(residentResult?.status === "fulfilled" ? residentResult.value : []),
            ...mapHouseholdLogs(householdResult?.status === "fulfilled" ? householdResult.value : []),
          ];
        }

        setLogs((prev) => {
          const combined = mergeLogs(page === 1 ? [] : prev, [...auditItems, ...extraItems]);
          combined.forEach((item) => knownIdsRef.current.add(item.id));
          return combined;
        });
        setHasMore(page < (auditData.meta?.last_page ?? 1));
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInitialLoading(false);
          loadingRef.current = false;
        }
      }
    };

    load();
    return () => { cancelled = true; loadingRef.current = false; };
  }, [page, resetKey]);

  // ── Infinite scroll sentinel ──
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loadingRef.current) setPage((p) => p + 1); },
      { rootMargin: "300px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, resetKey]);

  // ── Polling (pauses when tab hidden) ──
  useEffect(() => {
    const poll = async () => {
      if (loadingRef.current || document.hidden) return;
      try {
        const f = filtersRef.current;
        const params = { page: 1, per_page: 20 };
        if (f.action) params.action = f.action;
        if (f.start_date) params.start_date = f.start_date;
        if (f.end_date) params.end_date = f.end_date;

        const data = await fetchAuditLogs(params);
        const items = data.data || [];
        const fresh = items.filter((item) => !knownIdsRef.current.has(item.id));
        if (!fresh.length) return;

        fresh.forEach((item) => knownIdsRef.current.add(item.id));
        setLogs((prev) => {
          const existingIds = new Set(prev.map((l) => l.id));
          const newItems = fresh.filter((l) => !existingIds.has(l.id));
          return newItems.length ? [...newItems, ...prev] : prev;
        });
        setNewCount((c) => c + fresh.length);
      } catch { /* silently ignore */ }
    };

    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Client-side filter (memoized) ──
  const displayed = useMemo(() => {
    return logs.filter((log) => {
      if (userType === "admin" && log.user?.role !== "admin") return false;
      if (userType === "user" && log.user?.role === "admin") return false;
      if (filters.action) {
        const mapped = ACTION_FILTER_MAP[log.action] || log.action;
        if (mapped !== filters.action) return false;
      }
      if (filters.start_date || filters.end_date) {
        const logTime = new Date(log.created_at || 0).getTime();
        if (!Number.isNaN(logTime)) {
          if (filters.start_date && logTime < new Date(filters.start_date).getTime()) return false;
          if (filters.end_date) {
            const end = new Date(filters.end_date);
            end.setHours(23, 59, 59, 999);
            if (logTime > end.getTime()) return false;
          }
        }
      }
      if (debouncedSearch.trim()) {
        const needle = debouncedSearch.toLowerCase();
        const { name } = buildSentence(log);
        if (
          !name.toLowerCase().includes(needle) &&
          !(log.subject_name || "").toLowerCase().includes(needle) &&
          !(log.auditable_type || "").toLowerCase().includes(needle) &&
          !(log.action || "").toLowerCase().includes(needle)
        ) return false;
      }
      return true;
    });
  }, [logs, userType, filters, debouncedSearch]);

  // ── Parallax reveal ──
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const entries = container.querySelectorAll(".log-entry:not(.log-visible)");
    if (!entries.length) return;
    const obs = new IntersectionObserver(
      (intersections) => {
        intersections.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add("log-visible"); obs.unobserve(entry.target); }
        });
      },
      { rootMargin: "0px 0px -20px 0px", threshold: 0.05 },
    );
    entries.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [displayed.length, resetKey]);

  const hasActiveFilters = filters.action || filters.start_date || filters.end_date || debouncedSearch.trim() || userType;

  return (
    <div className="space-y-3">
      <style dangerouslySetInnerHTML={{ __html: PARALLAX_CSS }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="text-left">
          <h2 className={`text-[16px] font-bold font-spartan leading-tight ${isDark ? "text-slate-100" : t.cardText}`}>
            Activity Logs
          </h2>
          <p className={`mt-0.5 text-[12px] font-kumbh ${isDark ? "text-slate-400" : t.subtleText}`}>
            System activity trail — most recent first
          </p>
        </div>
        <button
          onClick={onBack}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[12px] font-semibold font-kumbh transition ${
            isDark
              ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Profile
        </button>
      </div>

      {/* Filters bar */}
      <div className={`rounded-[20px] border px-4 py-3.5 ${t.cardBorder} ${isDark ? "bg-slate-900/50" : t.cardBg}`}>
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative min-w-[160px] flex-1">
            <Search className={`absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, type..."
              className={`w-full rounded-[16px] border py-2.5 pl-9 pr-8 text-[12px] font-kumbh outline-none transition ${t.inputBorder} ${t.inputBg} ${t.inputText} ${t.inputPlaceholder} ${t.primaryBorder}`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Action filter */}
          <div className="relative">
            <select
              value={filters.action}
              onChange={(e) => applyFilters({ ...filters, action: e.target.value })}
              className={`appearance-none cursor-pointer rounded-[14px] border py-2.5 pl-3 pr-7 text-[12px] font-kumbh outline-none transition ${t.inputBorder} ${t.inputBg} ${t.inputText} ${t.primaryBorder}`}
            >
              <option value="">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
            </select>
            <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
          </div>

          {/* User type filter */}
          <div className="relative">
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className={`appearance-none cursor-pointer rounded-[14px] border py-2.5 pl-3 pr-7 text-[12px] font-kumbh outline-none transition ${t.inputBorder} ${t.inputBg} ${t.inputText} ${t.primaryBorder}`}
            >
              <option value="">All Users</option>
              <option value="admin">Admin</option>
              <option value="user">Resident</option>
            </select>
            <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
          </div>

          {/* Date from */}
          <DatePickerField
            value={filters.start_date}
            onChange={(val) => applyFilters({ ...filters, start_date: val })}
            placeholder="From date"
            ariaLabel="From date"
            isDark={isDark}
            t={t}
            open={openCalendar === "start"}
            onOpenChange={(isOpen) => setOpenCalendar(isOpen ? "start" : null)}
          />

          {/* Date to */}
          <DatePickerField
            value={filters.end_date}
            onChange={(val) => applyFilters({ ...filters, end_date: val })}
            placeholder="To date"
            ariaLabel="To date"
            isDark={isDark}
            t={t}
            open={openCalendar === "end"}
            onOpenChange={(isOpen) => setOpenCalendar(isOpen ? "end" : null)}
          />

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className={`flex items-center gap-1 rounded-[14px] border px-3 py-2.5 text-[12px] font-semibold font-kumbh transition ${
                isDark
                  ? "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>

        <FilterChips
          filters={filters}
          search={debouncedSearch}
          userType={userType}
          onClearFilter={handleClearFilter}
          isDark={isDark}
        />
      </div>

      {/* Error */}
      {error && (
        <div className={`rounded-2xl border px-4 py-3 text-[13px] font-kumbh ${isDark ? "border-red-800/40 bg-red-900/20 text-red-300" : "border-red-200 bg-red-50 text-red-700"}`}>
          {error}
        </div>
      )}

      {/* New logs banner */}
      {newCount > 0 && (
        <button
          onClick={() => { setNewCount(0); listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
          className={`w-full rounded-2xl border px-4 py-2.5 text-[12px] font-semibold font-kumbh transition-all ${
            isDark
              ? "border-emerald-800/40 bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/30"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          ↑ {newCount} new {newCount === 1 ? "log" : "logs"} arrived — click to scroll to top
        </button>
      )}

      {/* Initial loading */}
      {initialLoading && (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }, (_, i) => <LogSkeleton key={i} isDark={isDark} />)}
        </div>
      )}

      {/* Empty state */}
      {!initialLoading && displayed.length === 0 && !loading && !error && (
        <div className={`rounded-2xl border px-6 py-14 text-center ${t.cardBorder} ${isDark ? "bg-slate-900/40" : t.cardBg}`}>
          <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <p className={`text-[13px] font-semibold font-kumbh ${isDark ? "text-slate-300" : t.cardText}`}>
            {hasActiveFilters ? "No logs match your filters" : "No activity logs found"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className={`mt-2 text-[12px] font-kumbh underline transition-opacity hover:opacity-70 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Stats + Log list */}
      {!initialLoading && displayed.length > 0 && (
        <>
          <StatsBar logs={displayed} isDark={isDark} />

          <div key={resetKey} ref={listRef} className="space-y-2.5">
            {displayed.map((log, i) => (
              <LogEntry key={log.id} log={log} isDark={isDark} t={t} index={i} onNavigate={handleNavigate} />
            ))}
          </div>

          {/* Paginating skeletons */}
          {loading && (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }, (_, i) => <LogSkeleton key={i} isDark={isDark} />)}
            </div>
          )}

          {/* Load more fallback */}
          {hasMore && !loading && (
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              className={`w-full rounded-2xl border px-4 py-2.5 text-[12px] font-semibold font-kumbh transition ${
                isDark
                  ? "border-slate-700 bg-slate-900/40 text-slate-300 hover:bg-slate-800"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              Load more
            </button>
          )}
        </>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />

      {/* End of list */}
      {!hasMore && displayed.length > 0 && !loading && !initialLoading && (
        <p className={`pb-4 text-center text-[11px] font-kumbh ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          All {displayed.length} logs loaded
        </p>
      )}
    </div>
  );
};

export default ActivityLogsView;
