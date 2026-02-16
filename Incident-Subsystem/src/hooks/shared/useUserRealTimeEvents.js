import { useRef, useState, useEffect, useCallback } from "react";
import { incidentService } from "../../services/sub-system-3/incidentService";
import { getMyComplaints } from "../../services/sub-system-3/complaintService";
import {
  isAdmin,
  isAuthenticated,
} from "../../services/sub-system-3/loginService";

const LS_SNAPSHOT_KEY = "userStatusSnapshot";

/**
 * Polling hook that detects status changes on the user's own
 * incidents and complaints.
 *
 * Stores a status snapshot (id → status) in a ref and compares
 * each poll against it. On first poll, it also checks localStorage
 * for previously stored statuses to detect changes that happened
 * while the user was offline.
 */
const useUserRealTimeEvents = ({
  pollingInterval = 15000,
  batchDelay = 2000,
  enabled = true,
} = {}) => {
  const incidentStatusMap = useRef(new Map());
  const complaintStatusMap = useRef(new Map());
  const isFirstPoll = useRef(true);
  const bufferRef = useRef([]);
  const flushTimerRef = useRef(null);
  const intervalRef = useRef(null);

  const [newEvents, setNewEvents] = useState([]);
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load saved snapshot from localStorage
  const loadSnapshot = useCallback(() => {
    try {
      const raw = localStorage.getItem(LS_SNAPSHOT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  // Persist current snapshot to localStorage
  const saveSnapshot = useCallback(() => {
    const incidents = {};
    incidentStatusMap.current.forEach((status, id) => {
      incidents[id] = status;
    });
    const complaints = {};
    complaintStatusMap.current.forEach((status, id) => {
      complaints[id] = status;
    });
    localStorage.setItem(
      LS_SNAPSHOT_KEY,
      JSON.stringify({ incidents, complaints }),
    );
  }, []);

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

  const poll = useCallback(async () => {
    if (!isAuthenticated() || isAdmin()) return;

    setIsPolling(true);
    try {
      const [incData, compData] = await Promise.all([
        incidentService.getMyIncidents(),
        getMyComplaints(),
      ]);

      const incArray = Array.isArray(incData) ? incData : incData.data || [];
      const compArray = Array.isArray(compData)
        ? compData
        : compData.data || [];

      if (isFirstPoll.current) {
        // Load previously saved snapshot for offline change detection
        const saved = loadSnapshot();

        // Seed current maps and detect offline changes
        incArray.forEach((item) => {
          const currentStatus = item.status || "pending";
          incidentStatusMap.current.set(item.id, currentStatus);

          // Check against saved snapshot for offline changes
          if (saved?.incidents && saved.incidents[item.id] !== undefined) {
            const oldStatus = saved.incidents[item.id];
            if (oldStatus !== currentStatus) {
              bufferRef.current.push({
                id: `inc-status-${item.id}-${Date.now()}`,
                source: "incident",
                type:
                  item.types?.map((t) => t.name).join(", ") || "Incident",
                oldStatus,
                newStatus: currentStatus,
                data: item,
                timestamp: new Date(),
              });
            }
          }
        });

        compArray.forEach((item) => {
          const currentStatus = item.status || "pending";
          complaintStatusMap.current.set(item.id, currentStatus);

          if (saved?.complaints && saved.complaints[item.id] !== undefined) {
            const oldStatus = saved.complaints[item.id];
            if (oldStatus !== currentStatus) {
              bufferRef.current.push({
                id: `comp-status-${item.id}-${Date.now()}`,
                source: "complaint",
                type: item.type || "Complaint",
                oldStatus,
                newStatus: currentStatus,
                data: item,
                timestamp: new Date(),
              });
            }
          }
        });

        isFirstPoll.current = false;

        if (bufferRef.current.length > 0) {
          scheduleFlush();
        }
      } else {
        // Subsequent polls — detect status changes
        incArray.forEach((item) => {
          const currentStatus = item.status || "pending";
          const prevStatus = incidentStatusMap.current.get(item.id);
          incidentStatusMap.current.set(item.id, currentStatus);

          if (prevStatus !== undefined && prevStatus !== currentStatus) {
            bufferRef.current.push({
              id: `inc-status-${item.id}-${Date.now()}`,
              source: "incident",
              type:
                item.types?.map((t) => t.name).join(", ") || "Incident",
              oldStatus: prevStatus,
              newStatus: currentStatus,
              data: item,
              timestamp: new Date(),
            });
          }
        });

        compArray.forEach((item) => {
          const currentStatus = item.status || "pending";
          const prevStatus = complaintStatusMap.current.get(item.id);
          complaintStatusMap.current.set(item.id, currentStatus);

          if (prevStatus !== undefined && prevStatus !== currentStatus) {
            bufferRef.current.push({
              id: `comp-status-${item.id}-${Date.now()}`,
              source: "complaint",
              type: item.type || "Complaint",
              oldStatus: prevStatus,
              newStatus: currentStatus,
              data: item,
              timestamp: new Date(),
            });
          }
        });

        if (bufferRef.current.length > 0) {
          scheduleFlush();
        }
      }

      // Persist snapshot after every poll
      saveSnapshot();
      setLastUpdated(new Date());
    } catch (err) {
      console.error("User real-time polling error:", err);
    } finally {
      setIsPolling(false);
    }
  }, [scheduleFlush, loadSnapshot, saveSnapshot]);

  const clearEvents = useCallback(() => {
    setNewEvents([]);
    bufferRef.current = [];
  }, []);

  useEffect(() => {
    if (!enabled || !isAuthenticated() || isAdmin()) return;

    poll();
    intervalRef.current = setInterval(poll, pollingInterval);

    return () => {
      clearInterval(intervalRef.current);
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, [enabled, pollingInterval, poll]);

  return { newEvents, clearEvents, isPolling, lastUpdated };
};

export default useUserRealTimeEvents;
