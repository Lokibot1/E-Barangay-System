import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronDown, Search, X } from "lucide-react";
import DatePickerField from "./DatePickerField";
import { fetchAuditLogs } from "../../homepage/services/auditLogService";
import { residentService } from "../../services/sub-system-1/residents";
import { householdService } from "../../services/sub-system-1/household";

// ─── Parallax CSS ─────────────────────────────────────────────────────────────

const PARALLAX_CSS = `
  .log-entry {
    opacity: 0;
    transform: translateY(var(--start-y, 10px));
    transition: opacity 0.38s ease, transform 0.38s ease;
    transition-delay: calc(min(var(--i, 0), 8) * 32ms);
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
    dot: "bg-emerald-500",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    darkBadge: "border-emerald-800/40 bg-emerald-900/20 text-emerald-300",
  },
  updated: {
    label: "Updated",
    dot: "bg-blue-500",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    darkBadge: "border-blue-800/40 bg-blue-900/20 text-blue-300",
  },
  deleted: {
    label: "Deleted",
    dot: "bg-red-500",
    badge: "border-red-200 bg-red-50 text-red-700",
    darkBadge: "border-red-800/40 bg-red-900/20 text-red-300",
  },
  archived: {
    label: "Archived",
    dot: "bg-amber-500",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    darkBadge: "border-amber-800/40 bg-amber-900/20 text-amber-300",
  },
  restored: {
    label: "Restored",
    dot: "bg-emerald-500",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    darkBadge: "border-emerald-800/40 bg-emerald-900/20 text-emerald-300",
  },
  deactivated: {
    label: "Deactivated",
    dot: "bg-rose-500",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    darkBadge: "border-rose-800/40 bg-rose-900/20 text-rose-300",
  },
};

const TYPE_LABELS = {
  incident: "incident report",
  complaint: "complaint",
  appointment: "appointment",
  user: "user account",
  customfield: "custom field",
  auditlog: "audit log",
  resident: "resident profile",
  household: "household record",
};

const SOURCE_LABELS = {
  resident: "Resident Update",
  household: "Household Update",
  system: "System Log",
};

const FIELD_LABELS = {
  status: "Status",
  title: "Title",
  description: "Description",
  priority: "Priority",
  user_id: "Assigned user",
  assigned_to: "Assigned to",
  resolution: "Resolution",
  date: "Date",
  time: "Time",
  location: "Location",
  name: "Name",
  email: "Email",
  contact_number: "Contact number",
  notes: "Notes",
  complaint_type: "Complaint type",
  incident_type: "Incident type",
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

const getTimeValue = (value) => {
  const time = new Date(value || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const groupResidentLogs = (logs) => {
  const sorted = [...(logs || [])].sort((a, b) => {
    const ta = getTimeValue(a.created_at);
    const tb = getTimeValue(b.created_at);
    return ta - tb;
  });

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
        current.changes.push({
          field: log.field_changed,
          old_value: log.old_value,
          new_value: log.new_value,
        });
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
          ? [{
              field: log.field_changed,
              old_value: log.old_value,
              new_value: log.new_value,
            }]
          : [],
      };
      groups.push(current);
    }
  });

  return groups;
};

const mapResidentLogs = (logs) => {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const groups = groupResidentLogs(safeLogs);
  return groups.map((group) => {
    const old_values = {};
    const new_values = {};
    group.changes.forEach((change) => {
      old_values[change.field] = change.old_value;
      new_values[change.field] = change.new_value;
    });

    return {
      id: `resident-${group.key}`,
      action: RESIDENT_ACTION_MAP[group.action_type] || "updated",
      auditable_type: "resident",
      auditable_id: group.barangay_id || null,
      user: {
        name: group.editor_name || "System",
        role: "admin",
      },
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
    (log.changes || []).forEach((change) => {
      const field = change.field || "Field";
      old_values[field] = change.old_value;
      new_values[field] = change.new_value;
    });

    return {
      id: `household-${log.id ?? index}`,
      action: HOUSEHOLD_ACTION_MAP[log.action_type] || "updated",
      auditable_type: "household",
      auditable_id: log.household_display_id || log.household_id || null,
      user: {
        name: log.edited_by || "System",
        role: "admin",
      },
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
  incoming.forEach((item) => {
    if (!merged.has(item.id)) merged.set(item.id, item);
  });

  return Array.from(merged.values()).sort((a, b) => {
    const ta = getTimeValue(a.created_at);
    const tb = getTimeValue(b.created_at);
    return tb - ta;
  });
};

const humanizeField = (key) =>
  FIELD_LABELS[key] ||
  key.replace(/_id$/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const truncate = (val, max = 30) => {
  const s = String(val ?? "");
  return s.length > max ? `${s.slice(0, max)}…` : s;
};

const getChanges = (oldVals, newVals) => {
  if (!newVals || typeof newVals !== "object") return [];
  return Object.entries(newVals)
    .filter(([k]) => !SKIP_FIELDS.has(k))
    .filter(([k, v]) => String(oldVals?.[k] ?? "") !== String(v ?? ""))
    .slice(0, 3)
    .map(([k, v]) => ({ field: humanizeField(k), from: oldVals?.[k], to: v }));
};

const getCreatedHighlights = (newVals) => {
  if (!newVals || typeof newVals !== "object") return [];
  const PRIORITY = ["title", "status", "complaint_type", "incident_type", "description", "name", "priority"];
  return PRIORITY.filter((k) => newVals[k] !== undefined && newVals[k] !== null && newVals[k] !== "")
    .slice(0, 2)
    .map((k) => ({ field: humanizeField(k), value: newVals[k] }));
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

const buildSentence = (log) => {
  const name = log.user?.name || "System";
  const raw = log.auditable_type || "record";
  const type = TYPE_LABELS[raw] || raw.replace(/_/g, " ");
  const article = /^[aeiou]/i.test(type) ? "an" : "a";
  const id = log.auditable_id ? ` #${log.auditable_id}` : "";
  const subject = log.subject_name ? ` (${log.subject_name})` : "";
  const suffix = `${id}${subject}`;

  const bodies = {
    created: `filed ${article} new ${type}${suffix}`,
    updated: `made changes to ${article} ${type}${suffix}`,
    deleted: `removed ${article} ${type}${suffix}`,
  };
  return { name, body: bodies[log.action] ?? `${log.action} ${article} ${type}${suffix}` };
};

// ─── Log Entry Card ───────────────────────────────────────────────────────────

const LogEntry = ({ log, isDark, t, index }) => {
  const cfg = ACTION_CONFIG[log.action] || ACTION_CONFIG.updated;
  const { name, body } = buildSentence(log);
  const changes = log.action === "updated" ? getChanges(log.old_values, log.new_values) : [];
  const highlights = log.action === "created" ? getCreatedHighlights(log.new_values) : [];
  const sourceLabel = SOURCE_LABELS[log.source] || "System Log";
  const typeLabel =
    TYPE_LABELS[log.auditable_type] ||
    (log.auditable_type ? log.auditable_type.replace(/_/g, " ") : "record");

  return (
    <div
      className={`log-entry rounded-2xl border px-5 py-4 transition-colors shadow-[0_10px_24px_-20px_rgba(15,23,42,0.25)] ${t.cardBorder} ${
        isDark ? "bg-slate-900/40" : t.cardBg
      }`}
      style={{ "--i": index, "--start-y": `${Math.min(index * 4 + 10, 40)}px` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`mt-[7px] h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot} shadow-[0_0_0_4px_rgba(15,23,42,0.06)]`}
          />
          <div className="min-w-0 flex-1">
            <p className={`text-[13px] font-kumbh leading-5 ${isDark ? "text-slate-100" : t.cardText}`}>
              <span className="font-bold">{name}</span>{" "}
              <span className={isDark ? "text-slate-300" : "text-slate-600"}>{body}</span>
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold font-kumbh ${
                  isDark
                    ? "border-slate-700 bg-slate-900/60 text-slate-300"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {sourceLabel}
              </span>
              {typeLabel && (
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold font-kumbh ${
                    isDark
                      ? "border-slate-700 bg-slate-900/60 text-slate-300"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {typeLabel}
                </span>
              )}
              {log.ip_address && (
                <span className={`text-[10px] font-kumbh ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {log.ip_address}
                </span>
              )}
              <span className={`text-[10px] font-kumbh ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                {timeAgo(log.created_at)}
              </span>
            </div>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold font-kumbh tracking-normal ${
            isDark ? cfg.darkBadge : cfg.badge
          }`}
        >
          {cfg.label}
        </span>
      </div>

      {changes.length > 0 && (
        <div
          className={`mt-3 rounded-2xl border px-4 py-3 ${t.cardBorder} ${
            isDark ? "bg-slate-900/60" : t.inlineBg
          }`}
        >
          <div className="space-y-2 text-left">
            {changes.map((c, i) => {
              const hasFrom = c.from !== undefined && c.from !== null && String(c.from) !== "";
              const hasTo = c.to !== undefined && c.to !== null && String(c.to) !== "";
              return (
                <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                  <span
                    className={`text-[11px] font-semibold font-kumbh ${isDark ? "text-slate-300" : "text-slate-600"} sm:w-40 sm:text-left`}
                  >
                    {c.field}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold font-kumbh text-left">
                    <span
                      className={`rounded-lg border px-2.5 py-1 ${
                        isDark
                          ? "border-rose-900/40 bg-rose-900/20 text-rose-300"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      } ${hasFrom ? "line-through" : ""}`}
                    >
                      {hasFrom ? truncate(c.from) : "--"}
                    </span>
                    <span className={`text-[11px] ${isDark ? "text-slate-500" : "text-slate-400"}`}>to</span>
                    <span
                      className={`rounded-lg border px-2.5 py-1 ${
                        isDark
                          ? "border-emerald-900/40 bg-emerald-900/20 text-emerald-300"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {hasTo ? truncate(c.to) : "--"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {highlights.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {highlights.map((h, i) => (
            <span
              key={i}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold font-kumbh ${
                isDark
                  ? "border-slate-700 bg-slate-900/60 text-slate-300"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <span className="font-bold">{h.field}:</span> {truncate(h.value)}
            </span>
          ))}
        </div>
      )}

      {log.action === "deleted" && (
        <p className={`mt-2 text-[11px] font-kumbh italic ${isDark ? "text-red-400/70" : "text-red-400"}`}>
          This record has been permanently removed.
        </p>
      )}
    </div>
  );
};
const LogSkeleton = ({ isDark }) => (
  <div
    className={`rounded-2xl border px-5 py-4 ${
      isDark ? "border-slate-700/60 bg-slate-900/40" : "border-slate-200/80 bg-white"
    }`}
  >
    <div className="flex items-start gap-3">
      <span className={`mt-[7px] h-2.5 w-2.5 shrink-0 rounded-full animate-pulse ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
      <div className="flex-1 space-y-2">
        <div className={`h-3 w-2/3 rounded animate-pulse ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
        <div className={`h-2.5 w-1/3 rounded animate-pulse ${isDark ? "bg-slate-700/60" : "bg-slate-100"}`} />
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const POLL_INTERVAL = 15000; // 15 seconds

const ActivityLogsView = ({ t, isDark, onBack }) => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [search, setSearch] = useState("");
  const [userType, setUserType] = useState(""); // "" | "admin" | "user"
  const [filters, setFilters] = useState({ action: "", start_date: "", end_date: "" });
  const [newCount, setNewCount] = useState(0); // pending new logs from polling
  const [openCalendar, setOpenCalendar] = useState(null); // "start" | "end" | null

  const filtersRef = useRef(filters);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);
  const listRef = useRef(null);
  const knownIdsRef = useRef(new Set()); // track ids we already have

  const applyFilters = (next) => {
    filtersRef.current = next;
    setFilters(next);
    setLogs([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setNewCount(0);
    knownIdsRef.current = new Set();
    setResetKey((k) => k + 1);
  };

  const clearAll = () => {
    setSearch("");
    setUserType("");
    applyFilters({ action: "", start_date: "", end_date: "" });
  };

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
          ? Promise.allSettled([
              residentService.getAllLogs(),
              householdService.getAllLogs(),
            ])
          : Promise.resolve([]);

        const [auditData, extraResults] = await Promise.all([auditPromise, extraPromise]);
        if (cancelled) return;

        const auditItems = auditData.data || [];
        let extraItems = [];

        if (page === 1 && Array.isArray(extraResults)) {
          const [residentResult, householdResult] = extraResults;
          const residentLogs =
            residentResult?.status === "fulfilled" ? residentResult.value : [];
          const householdLogs =
            householdResult?.status === "fulfilled" ? householdResult.value : [];

          extraItems = [
            ...mapResidentLogs(residentLogs),
            ...mapHouseholdLogs(householdLogs),
          ];
        }

        setLogs((prev) => {
          const combined = mergeLogs(
            page === 1 ? [] : prev,
            [...auditItems, ...extraItems],
          );
          combined.forEach((item) => knownIdsRef.current.add(item.id));
          return combined;
        });
        setHasMore(page < (auditData.meta?.last_page ?? 1));
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    };

    load();
    return () => {
      cancelled = true;
      loadingRef.current = false;
    };
  }, [page, resetKey]);

  // ── Infinite scroll ──
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, resetKey]);

  // ── Real-time polling ──
  useEffect(() => {
    const poll = async () => {
      if (loadingRef.current) return;
      try {
        const f = filtersRef.current;
        const params = { page: 1, per_page: 20 };
        if (f.action) params.action = f.action;
        if (f.start_date) params.start_date = f.start_date;
        if (f.end_date) params.end_date = f.end_date;

        const data = await fetchAuditLogs(params);
        const items = data.data || [];

        const genuinelyNew = items.filter((item) => !knownIdsRef.current.has(item.id));
        if (genuinelyNew.length === 0) return;

        genuinelyNew.forEach((item) => knownIdsRef.current.add(item.id));
        setLogs((prev) => {
          const existingIds = new Set(prev.map((l) => l.id));
          const fresh = genuinelyNew.filter((l) => !existingIds.has(l.id));
          if (fresh.length === 0) return prev;
          return [...fresh, ...prev];
        });
        setNewCount((c) => c + genuinelyNew.length);
      } catch {
        // silently ignore polling errors — main error state handles initial load
      }
    };

    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Client-side filter ──
  const displayed = logs.filter((log) => {
    if (userType === "admin" && log.user?.role !== "admin") return false;
    if (userType === "user" && log.user?.role === "admin") return false;
    if (filters.action) {
      const mappedAction = ACTION_FILTER_MAP[log.action] || log.action;
      if (mappedAction !== filters.action) return false;
    }
    if (filters.start_date || filters.end_date) {
      const logTime = new Date(log.created_at || 0).getTime();
      if (!Number.isNaN(logTime)) {
        if (filters.start_date) {
          const start = new Date(filters.start_date).getTime();
          if (logTime < start) return false;
        }
        if (filters.end_date) {
          const end = new Date(filters.end_date);
          end.setHours(23, 59, 59, 999);
          if (logTime > end.getTime()) return false;
        }
      }
    }
    if (search.trim()) {
      const needle = search.toLowerCase();
      const { name } = buildSentence(log);
      if (
        !name.toLowerCase().includes(needle) &&
        !(log.subject_name || "").toLowerCase().includes(needle) &&
        !(log.auditable_type || "").toLowerCase().includes(needle) &&
        !(log.action || "").toLowerCase().includes(needle)
      )
        return false;
    }
    return true;
  });

  // ── Parallax reveal ──
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const entries = container.querySelectorAll(".log-entry:not(.log-visible)");
    if (!entries.length) return;
    const obs = new IntersectionObserver(
      (intersections) => {
        intersections.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("log-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -20px 0px", threshold: 0.05 },
    );
    entries.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [displayed.length, resetKey]);

  const hasActiveFilters = filters.action || filters.start_date || filters.end_date || search.trim() || userType;

  return (
    <div className="space-y-4">
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
      <div
        className={`rounded-[20px] border px-4 py-4 ${t.cardBorder} ${
          isDark ? "bg-slate-900/50" : t.cardBg
        }`}
      >
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative min-w-[160px] flex-1">
            <Search
              className={`absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, type..."
              className={`w-full rounded-[16px] border py-2.5 pl-9 pr-3 text-[12px] font-kumbh outline-none transition ${t.inputBorder} ${t.inputBg} ${t.inputText} ${t.inputPlaceholder} ${t.primaryBorder}`}
            />
          </div>

          {/* Action dropdown */}
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
            <ChevronDown
              className={`pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            />
          </div>

          {/* User type dropdown */}
          <div className="relative">
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className={`appearance-none cursor-pointer rounded-[14px] border py-2.5 pl-3 pr-7 text-[12px] font-kumbh outline-none transition ${t.inputBorder} ${t.inputBg} ${t.inputText} ${t.primaryBorder}`}
            >
              <option value="">All Users</option>
              <option value="admin">Admin Logs</option>
              <option value="user">User Logs</option>
            </select>
            <ChevronDown
              className={`pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            />
          </div>

          {/* Date from */}
          <DatePickerField
            value={filters.start_date}
            onChange={(val) => applyFilters({ ...filters, start_date: val })}
            placeholder="mm/dd/yyyy"
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
            placeholder="mm/dd/yyyy"
            ariaLabel="To date"
            isDark={isDark}
            t={t}
            open={openCalendar === "end"}
            onOpenChange={(isOpen) => setOpenCalendar(isOpen ? "end" : null)}
          />

          {/* Clear */}
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
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className={`rounded-2xl border px-4 py-3 text-[13px] font-kumbh ${
            isDark ? "border-red-800/40 bg-red-900/20 text-red-300" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {displayed.length === 0 && !loading && !error && (
        <div
          className={`rounded-2xl border px-6 py-16 text-center ${t.cardBorder} ${
            isDark ? "bg-slate-900/40" : t.cardBg
          }`}
        >
          <div
            className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${
              isDark ? "bg-slate-800" : "bg-slate-100"
            }`}
          >
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <p className={`text-[13px] font-kumbh ${isDark ? "text-slate-400" : t.subtleText}`}>
            {hasActiveFilters ? "No logs match your current filters." : "No activity logs found."}
          </p>
        </div>
      )}

      {/* New logs banner */}
      {newCount > 0 && (
        <button
          onClick={() => {
            setNewCount(0);
            listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className={`w-full rounded-2xl border px-4 py-2.5 text-[12px] font-semibold font-kumbh transition-all animate-pulse ${
            isDark
              ? "border-emerald-800/40 bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/30"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          ↑ {newCount} new {newCount === 1 ? "log" : "logs"} — click to dismiss
        </button>
      )}

      {/* Log list */}
      {displayed.length > 0 && (
        <div key={resetKey} ref={listRef} className="space-y-3">
          {displayed.map((log, i) => (
            <LogEntry key={log.id} log={log} isDark={isDark} t={t} index={i} />
          ))}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <LogSkeleton key={i} isDark={isDark} />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-2" />

      {/* End of list */}
      {!hasMore && displayed.length > 0 && !loading && (
        <p className={`pb-4 text-center text-[12px] font-kumbh ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          All logs loaded
        </p>
      )}
    </div>
  );
};

export default ActivityLogsView;
