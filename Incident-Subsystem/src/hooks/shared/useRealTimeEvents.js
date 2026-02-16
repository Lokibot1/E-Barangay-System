import { useRef, useState, useEffect, useCallback } from "react";
import { incidentService } from "../../services/sub-system-3/incidentService";
import { getAllComplaints } from "../../services/sub-system-3/complaintService";
import {
  isAdmin,
  isAuthenticated,
} from "../../services/sub-system-3/loginService";

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
      const [incData, compData] = await Promise.all([
        incidentService.getAllIncidents(),
        getAllComplaints(),
      ]);

      const incArray = Array.isArray(incData) ? incData : incData.data || [];
      const compArray = Array.isArray(compData)
        ? compData
        : compData.data || [];

      if (isFirstPoll.current) {
        // Seed known IDs on first poll — do NOT generate notifications
        incArray.forEach((item) => knownIncidentIds.current.add(item.id));
        compArray.forEach((item) => knownComplaintIds.current.add(item.id));
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
