import { useRef, useState, useEffect, useCallback } from "react";
import { incidentService } from "../../services/sub-system-3/incidentService";
import { getAllComplaints } from "../../services/sub-system-3/complaintService";
import { residentService } from "../../services/sub-system-1/residents";
import {
  isAdmin,
  isAuthenticated,
} from "../../homepage/services/loginService";

/**
 * Core polling hook that detects new incidents and complaints.
 *
 * Compares each poll's IDs against a stored set of known IDs.
 * New items are buffered in a ref and flushed via a debounced
 * setTimeout into a single batched state update.
 *
 * @param {object} options
 * @param {number} options.pollingInterval - ms between polls (default 15 000)
 * @param {number} options.batchDelay      - ms debounce before flushing (default 2 000)
 * @param {boolean} options.enabled        - toggle polling on/off (default true)
 */
const useRealTimeEvents = ({
  pollingInterval = 15000,
  batchDelay = 2000,
  enabled = true,
} = {}) => {
  // ── Refs (stable across renders, never trigger re-renders) ────────────
  const knownIncidentIds = useRef(new Set());
  const knownComplaintIds = useRef(new Set());
  const knownResidentLogIds = useRef(new Set());
  const knownResidentSessionKeys = useRef(new Set());
  const isFirstPoll = useRef(true);
  const bufferRef = useRef([]);
  const flushTimerRef = useRef(null);
  const intervalRef = useRef(null);

  // ── Exposed state ─────────────────────────────────────────────────────
  const [newEvents, setNewEvents] = useState([]);
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Debounced flush — accumulates new items then pushes them in one batch
  const scheduleFlush = useCallback(() => {
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(() => {
      if (bufferRef.current.length > 0) {
        const batch = [...bufferRef.current];
        bufferRef.current = [];
        setNewEvents((prev) => [...batch, ...prev]);
      }
    }, batchDelay);
  }, [batchDelay]);

  // Single poll cycle
  const poll = useCallback(async () => {
    if (!isAuthenticated() || !isAdmin()) return;

    setIsPolling(true);
    try {
      const [incData, compData, residentLogs] = await Promise.all([
        incidentService.getAllIncidents(),
        getAllComplaints(),
        residentService.getAllLogs().catch(() => []),
      ]);

      const incArray = Array.isArray(incData) ? incData : incData.data || [];
      const compArray = Array.isArray(compData)
        ? compData
        : compData.data || [];
      const logArray = Array.isArray(residentLogs)
        ? residentLogs
        : residentLogs?.data || [];

      const getLogTimestamp = (log) => {
        const raw =
          log?.created_at || log?.formatted_created_at || log?.updated_at;
        if (!raw) return 0;
        const ts = new Date(raw).getTime();
        return Number.isNaN(ts) ? 0 : ts;
      };

      const normalize = (value) =>
        String(value || "")
          .trim()
          .toLowerCase();

      const isResidentEditor = (log) => {
        const editor = normalize(log?.editor_name);
        const resident = normalize(log?.resident_name);
        if (!editor) return false;
        if (editor.includes("resident")) return true;
        if (resident && editor.includes(resident)) return true;
        return false;
      };

      const isUpdateAction = (log) => {
        const action = normalize(log?.action_type);
        return !action || action.startsWith("update");
      };

      const getSessionKey = (log) => {
        const bucket = Math.floor(getLogTimestamp(log) / 3000);
        return `${normalize(log?.editor_name)}|${normalize(
          log?.resident_name,
        )}|${normalize(log?.action_type) || "update"}|${bucket}`;
      };

      if (isFirstPoll.current) {
        // Seed known IDs on first poll — do NOT generate notifications
        incArray.forEach((item) => knownIncidentIds.current.add(item.id));
        compArray.forEach((item) => knownComplaintIds.current.add(item.id));
        logArray.forEach((log) => {
          if (log?.id !== undefined && log?.id !== null) {
            knownResidentLogIds.current.add(log.id);
          }
          knownResidentSessionKeys.current.add(getSessionKey(log));
        });
        isFirstPoll.current = false;
      } else {
        // Detect new incidents
        incArray.forEach((item) => {
          if (!knownIncidentIds.current.has(item.id)) {
            knownIncidentIds.current.add(item.id);
            bufferRef.current.push({
              id: `inc-${item.id}`,
              source: "incident",
              type:
                item.types?.map((t) => t.name).join(", ") || "Incident",
              data: item,
              timestamp: new Date(),
            });
          }
        });

        // Detect new complaints
        compArray.forEach((item) => {
          if (!knownComplaintIds.current.has(item.id)) {
            knownComplaintIds.current.add(item.id);
            bufferRef.current.push({
              id: `comp-${item.id}`,
              source: "complaint",
              type: item.type || "Complaint",
              data: item,
              timestamp: new Date(),
            });
          }
        });

        // Detect resident profile updates (from resident logs)
        const newResidentLogs = [];
        logArray.forEach((log) => {
          if (log?.id === undefined || log?.id === null) return;
          if (!knownResidentLogIds.current.has(log.id)) {
            knownResidentLogIds.current.add(log.id);
            newResidentLogs.push(log);
          }
        });

        if (newResidentLogs.length > 0) {
          const sessions = new Map();
          newResidentLogs
            .filter((log) => isResidentEditor(log) && isUpdateAction(log))
            .sort((a, b) => getLogTimestamp(a) - getLogTimestamp(b))
            .forEach((log) => {
              const sessionKey = getSessionKey(log);
              if (knownResidentSessionKeys.current.has(sessionKey)) return;
              const entry = sessions.get(sessionKey) || {
                sessionKey,
                logs: [],
              };
              entry.logs.push(log);
              sessions.set(sessionKey, entry);
            });

          sessions.forEach((entry) => {
            const logs = entry.logs;
            if (logs.length === 0) return;
            const latestLog = logs[logs.length - 1];
            const changeCount = logs.filter((l) => l?.field_changed).length;
            const residentName = latestLog?.resident_name || "Resident";
            const description = `${residentName} updated profile information${
              changeCount
                ? ` (${changeCount} field${changeCount !== 1 ? "s" : ""})`
                : ""
            }.`;

            knownResidentSessionKeys.current.add(entry.sessionKey);
            bufferRef.current.push({
              id: `reslog-${entry.sessionKey}`,
              source: "resident",
              type: "Resident Profile Updated",
              data: {
                description,
                resident_name: latestLog?.resident_name || "",
                barangay_id: latestLog?.barangay_id || "",
                editor_name: latestLog?.editor_name || "",
                action_type: latestLog?.action_type || "update",
                change_count: changeCount,
              },
              timestamp: latestLog?.created_at || new Date(),
            });
          });
        }

        if (bufferRef.current.length > 0) {
          scheduleFlush();
        }
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Real-time polling error:", err);
    } finally {
      setIsPolling(false);
    }
  }, [scheduleFlush]);

  // Clear consumed events
  const clearEvents = useCallback(() => {
    setNewEvents([]);
    bufferRef.current = [];
  }, []);

  // ── Start / stop polling ──────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !isAuthenticated() || !isAdmin()) return;

    // Immediate first poll
    poll();
    intervalRef.current = setInterval(poll, pollingInterval);

    return () => {
      clearInterval(intervalRef.current);
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, [enabled, pollingInterval, poll]);

  return { newEvents, clearEvents, isPolling, lastUpdated };
};

export default useRealTimeEvents;
