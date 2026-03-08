import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronDown, Search, X } from "lucide-react";
import { fetchAuditLogs } from "../../homepage/services/auditLogService";

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
};

const TYPE_LABELS = {
  incident: "incident report",
  complaint: "complaint",
  appointment: "appointment",
  user: "user account",
  customfield: "custom field",
  auditlog: "audit log",
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
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

const buildSentence = (log) => {
  const name = log.user?.name || "System";
  const raw = log.auditable_type || "record";
  const type = TYPE_LABELS[raw] || raw.replace(/_/g, " ");
  const article = /^[aeiou]/i.test(type) ? "an" : "a";
  const id = log.auditable_id ? ` #${log.auditable_id}` : "";

  const bodies = {
    created: `filed ${article} new ${type}${id}`,
    updated: `made changes to ${article} ${type}${id}`,
    deleted: `removed ${article} ${type}${id}`,
  };
  return { name, body: bodies[log.action] ?? `${log.action} ${article} ${type}${id}` };
};

// ─── Log Entry Card ───────────────────────────────────────────────────────────

const LogEntry = ({ log, isDark, t, index }) => {
  const cfg = ACTION_CONFIG[log.action] || ACTION_CONFIG.updated;
  const { name, body } = buildSentence(log);
  const changes = log.action === "updated" ? getChanges(log.old_values, log.new_values) : [];
  const highlights = log.action === "created" ? getCreatedHighlights(log.new_values) : [];

  return (
    <div
      className={`log-entry rounded-xl border px-4 py-3.5 transition-colors ${
        isDark ? "border-slate-700/60 bg-slate-800/40" : "border-slate-200/80 bg-white"
      }`}
      style={{ "--i": index, "--start-y": `${Math.min(index * 4 + 10, 40)}px` }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: dot + content */}
        <div className="flex min-w-0 items-start gap-2.5">
          <span className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
          <div className="min-w-0 flex-1">
            {/* Main sentence */}
            <p className={`text-[13px] font-kumbh leading-5 ${isDark ? "text-slate-100" : t.cardText}`}>
              <span className="font-bold">{name}</span>{" "}
              <span className={isDark ? "text-slate-300" : "text-slate-600"}>{body}</span>
            </p>

            {/* Updated: show changed fields */}
            {changes.length > 0 && (
              <div className="mt-1.5 space-y-0.5">
                {changes.map((c, i) => (
                  <p key={i} className={`text-[11px] font-kumbh ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    <span className="font-semibold">{c.field}:</span>{" "}
                    {c.from !== undefined && c.from !== null && String(c.from) !== "" && (
                      <>
                        <span className={`line-through ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          "{truncate(c.from)}"
                        </span>
                        {" → "}
                      </>
                    )}
                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>"{truncate(c.to)}"</span>
                  </p>
                ))}
              </div>
            )}

            {/* Created: highlight key fields */}
            {highlights.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                {highlights.map((h, i) => (
                  <span key={i} className={`text-[11px] font-kumbh ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    <span className="font-semibold">{h.field}:</span> {truncate(h.value)}
                  </span>
                ))}
              </div>
            )}

            {/* Deleted: note */}
            {log.action === "deleted" && (
              <p className={`mt-1 text-[11px] font-kumbh italic ${isDark ? "text-red-400/70" : "text-red-400"}`}>
                This record has been permanently removed.
              </p>
            )}

            {/* Meta row: IP · time */}
            <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] font-kumbh ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {log.ip_address && <span>{log.ip_address}</span>}
              {log.ip_address && <span>·</span>}
              <span>{timeAgo(log.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Right: action badge */}
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold font-kumbh uppercase tracking-wide ${
            isDark ? cfg.darkBadge : cfg.badge
          }`}
        >
          {cfg.label}
        </span>
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const LogSkeleton = ({ isDark }) => (
  <div className={`rounded-xl border px-4 py-3.5 ${isDark ? "border-slate-700/60" : "border-slate-200/80"}`}>
    <div className="flex items-start gap-2.5">
      <span className={`mt-[7px] h-2 w-2 shrink-0 rounded-full animate-pulse ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
      <div className="flex-1 space-y-2">
        <div className={`h-3 w-2/3 rounded animate-pulse ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
        <div className={`h-2.5 w-1/3 rounded animate-pulse ${isDark ? "bg-slate-700/60" : "bg-slate-100"}`} />
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

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

  const filtersRef = useRef(filters);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);
  const listRef = useRef(null);

  const applyFilters = (next) => {
    filtersRef.current = next;
    setFilters(next);
    setLogs([]);
    setPage(1);
    setHasMore(true);
    setError(null);
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

        const data = await fetchAuditLogs(params);
        if (cancelled) return;

        const items = data.data || [];
        setLogs((prev) => (page === 1 ? items : [...prev, ...items]));
        setHasMore(page < (data.meta?.last_page ?? 1));
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

  // ── Client-side filter ──
  const displayed = logs.filter((log) => {
    if (userType === "admin" && log.user?.role !== "admin") return false;
    if (userType === "user" && log.user?.role === "admin") return false;
    if (search.trim()) {
      const needle = search.toLowerCase();
      const { name } = buildSentence(log);
      if (
        !name.toLowerCase().includes(needle) &&
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
        <div>
          <h2 className={`text-[16px] font-bold font-spartan leading-tight ${isDark ? "text-slate-100" : t.cardText}`}>
            Activity Logs
          </h2>
          <p className={`mt-0.5 text-[12px] font-kumbh ${isDark ? "text-slate-400" : t.subtleText}`}>
            System activity trail — most recent first
          </p>
        </div>
        <button
          onClick={onBack}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold font-kumbh transition ${
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
        className={`rounded-[18px] border p-3 ${
          isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative min-w-[160px] flex-1">
            <Search
              className={`absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, type…"
              className={`w-full rounded-lg border py-2 pl-8 pr-3 text-[12px] font-kumbh outline-none transition ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-200 placeholder-slate-500 focus:border-slate-500"
                  : "border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 focus:border-slate-300"
              }`}
            />
          </div>

          {/* Action dropdown */}
          <div className="relative">
            <select
              value={filters.action}
              onChange={(e) => applyFilters({ ...filters, action: e.target.value })}
              className={`appearance-none cursor-pointer rounded-lg border py-2 pl-3 pr-7 text-[12px] font-kumbh outline-none transition ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-200 focus:border-slate-500"
                  : "border-slate-200 bg-slate-50 text-slate-700 focus:border-slate-300"
              }`}
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
              className={`appearance-none cursor-pointer rounded-lg border py-2 pl-3 pr-7 text-[12px] font-kumbh outline-none transition ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-200 focus:border-slate-500"
                  : "border-slate-200 bg-slate-50 text-slate-700 focus:border-slate-300"
              }`}
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
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => applyFilters({ ...filters, start_date: e.target.value })}
            title="From date"
            className={`rounded-lg border px-3 py-2 text-[12px] font-kumbh outline-none transition ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-200 focus:border-slate-500"
                : "border-slate-200 bg-slate-50 text-slate-700 focus:border-slate-300"
            }`}
          />

          {/* Date to */}
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => applyFilters({ ...filters, end_date: e.target.value })}
            title="To date"
            className={`rounded-lg border px-3 py-2 text-[12px] font-kumbh outline-none transition ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-200 focus:border-slate-500"
                : "border-slate-200 bg-slate-50 text-slate-700 focus:border-slate-300"
            }`}
          />

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-[12px] font-semibold font-kumbh transition ${
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
          className={`rounded-xl border px-4 py-3 text-[13px] font-kumbh ${
            isDark ? "border-red-800/40 bg-red-900/20 text-red-300" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {displayed.length === 0 && !loading && !error && (
        <div
          className={`rounded-xl border px-4 py-12 text-center ${
            isDark ? "border-slate-700" : "border-slate-200"
          }`}
        >
          <p className={`text-[13px] font-kumbh ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {hasActiveFilters ? "No logs match your current filters." : "No activity logs found."}
          </p>
        </div>
      )}

      {/* Log list */}
      {displayed.length > 0 && (
        <div key={resetKey} ref={listRef} className="space-y-2">
          {displayed.map((log, i) => (
            <LogEntry key={log.id} log={log} isDark={isDark} t={t} index={i} />
          ))}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-2">
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
