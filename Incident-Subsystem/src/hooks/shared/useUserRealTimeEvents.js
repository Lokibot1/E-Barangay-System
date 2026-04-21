import { useRef, useState, useEffect, useCallback } from "react";
import { incidentService } from "../../services/sub-system-3/incidentService";
import { getMyComplaints } from "../../services/sub-system-3/complaintService";
import { residentService } from "../../services/sub-system-1/residents";
import {
  isAdmin,
  isAuthenticated,
  getUser,
} from "../../homepage/services/loginService";

const LS_SNAPSHOT_KEY = "userStatusSnapshot";
const LS_PROFILE_LOG_KEY = "userProfileLogSnapshot";

const getProfileLogKey = () => {
  try {
    const user = getUser();
    return user?.id ? `${LS_PROFILE_LOG_KEY}_${user.id}` : LS_PROFILE_LOG_KEY;
  } catch {
    return LS_PROFILE_LOG_KEY;
  }
};

const PROFILE_FIELD_LABELS = {
  first_name: "First Name",
  middle_name: "Middle Name",
  last_name: "Last Name",
  suffix: "Suffix",
  gender: "Gender",
  birthdate: "Birthdate",
  contact_number: "Contact Number",
  email: "Email",
  household_position: "Position in Family",
  marital_status_id: "Civil Status",
  nationality_id: "Nationality",
  sector_id: "Sector",
  is_voter: "Voter Status",
  residency_start_date: "Date of Residency",
  temp_house_number: "House Number",
  temp_purok_id: "Purok",
  temp_street_id: "Street",
  educational_status: "Educational Status",
  highest_attainment: "Highest Attainment",
  highest_grade_completed: "Highest Attainment",
  school_level: "School Level",
  school_type: "Institution Type",
  employment_status: "Employment Status",
  occupation: "Occupation",
  income_source: "Income Source",
  monthly_income: "Monthly Income",
};

const normalizeRoleValue = (role) =>
  String(role || "")
    .trim()
    .toLowerCase();

const canPollResidentProfileHistory = (user) => {
  const residentId =
    user?.resident_id || user?.residentId || user?.id || null;

  if (!residentId) return false;

  // Resident-facing sessions currently do not have access to the
  // admin /residents/:id/history endpoint, so skip that poll here.
  const role = normalizeRoleValue(user?.role);
  return role && !["resident", "user", "member"].includes(role);
};

const formatFieldLabel = (field) => {
  if (!field) return "";
  return (
    PROFILE_FIELD_LABELS[field] ||
    String(field)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

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
  // complaint_id -> Set<appointment_id> — used to detect newly added appointments
  const complaintAppointmentMap = useRef(new Map());
  const knownProfileLogIds = useRef(new Set());
  const knownProfileSessionKeys = useRef(new Set());
  const isFirstPoll = useRef(true);
  const bufferRef = useRef([]);
  const flushTimerRef = useRef(null);
  const intervalRef = useRef(null);
  const profileLogKeyRef = useRef(getProfileLogKey());

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

  const loadProfileSnapshot = useCallback(() => {
    try {
      const raw = localStorage.getItem(profileLogKeyRef.current);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const saveProfileSnapshot = useCallback((lastSeenAt) => {
    if (!lastSeenAt) return;
    localStorage.setItem(
      profileLogKeyRef.current,
      JSON.stringify({ lastSeenAt }),
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
      const user = getUser();
      const residentId =
        user?.resident_id || user?.residentId || user?.id || null;
      const shouldPollProfileHistory = canPollResidentProfileHistory(user);

      const historyPromise = shouldPollProfileHistory
        ? residentService.getResidentHistory(residentId).catch((error) => {
            if (error?.response?.status === 403) {
              return [];
            }
            throw error;
          })
        : Promise.resolve([]);

      const [incData, compData, profileLogs] = await Promise.all([
        incidentService.getMyIncidents(),
        getMyComplaints(),
        historyPromise,
      ]);

      const incArray = Array.isArray(incData) ? incData : incData.data || [];
      const compArray = Array.isArray(compData)
        ? compData
        : compData.data || [];
      const logArray = Array.isArray(profileLogs)
        ? profileLogs
        : profileLogs?.data || [];

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

      const residentName = normalize(user?.name);

      const isStaffEditor = (log) => {
        const editor = normalize(log?.editor_name);
        if (!editor) return false;
        if (editor.includes("resident")) return false;
        if (residentName && editor.includes(residentName)) return false;
        return true;
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

      const formatChangeValue = (value) => {
        if (value === null || value === undefined || value === "") return "N/A";
        if (Array.isArray(value)) {
          const filtered = value.filter(
            (item) => item !== null && item !== undefined && item !== "",
          );
          return filtered.length > 0 ? filtered.join(", ") : "N/A";
        }
        if (typeof value === "object") {
          try {
            return JSON.stringify(value);
          } catch {
            return String(value);
          }
        }
        return String(value);
      };

      const extractOldValue = (log) =>
        log?.old_value ??
        log?.previous_value ??
        log?.old ??
        log?.before ??
        log?.from;

      const extractNewValue = (log) =>
        log?.new_value ??
        log?.current_value ??
        log?.new ??
        log?.after ??
        log?.to;

      const pushProfileNotifications = (logs) => {
        if (!logs || logs.length === 0) return;
        const sessions = new Map();
        logs
          .filter((log) => isStaffEditor(log) && isUpdateAction(log))
          .sort((a, b) => getLogTimestamp(a) - getLogTimestamp(b))
          .forEach((log) => {
            const sessionKey = getSessionKey(log);
            if (knownProfileSessionKeys.current.has(sessionKey)) return;
            const entry = sessions.get(sessionKey) || {
              sessionKey,
              logs: [],
            };
            entry.logs.push(log);
            sessions.set(sessionKey, entry);
          });

        sessions.forEach((entry) => {
          const sessionLogs = entry.logs;
          if (sessionLogs.length === 0) return;
          const latestLog = sessionLogs[sessionLogs.length - 1];
          const detailsByField = new Map();
          sessionLogs.forEach((log) => {
            const fieldKey = log?.field_changed;
            if (!fieldKey) return;
            const label = formatFieldLabel(fieldKey);
            if (!label) return;
            const oldRaw = extractOldValue(log);
            const newRaw = extractNewValue(log);
            if (oldRaw === undefined && newRaw === undefined) return;
            detailsByField.set(label, {
              field: label,
              old_value: formatChangeValue(oldRaw),
              new_value: formatChangeValue(newRaw),
            });
          });
          const rawFields = sessionLogs
            .map((l) => l?.field_changed)
            .filter(Boolean);
          const uniqueFields = [...new Set(rawFields)];
          const fieldLabels = uniqueFields.map(formatFieldLabel).filter(Boolean);
          const preview = fieldLabels.slice(0, 3).join(", ");
          const moreCount =
            fieldLabels.length > 3 ? fieldLabels.length - 3 : 0;
          const fieldSummary = preview
            ? `${preview}${moreCount ? ` +${moreCount} more` : ""}`
            : "";
          const changeCount = fieldLabels.length;
          const description = fieldSummary
            ? `Updated fields: ${fieldSummary}.`
            : "Your profile was updated.";

          knownProfileSessionKeys.current.add(entry.sessionKey);
          bufferRef.current.push({
            id: `profile-${entry.sessionKey}`,
            source: "resident",
            type: "profile_updated",
            description,
            timestamp: latestLog?.created_at || new Date(),
            data: {
              description,
              editor_name: latestLog?.editor_name || "",
              resident_name: latestLog?.resident_name || "",
              change_count: changeCount,
              changed_fields: fieldLabels,
              fields_preview: fieldSummary,
              changed_details: Array.from(detailsByField.values()),
              action_type: latestLog?.action_type || "update",
            },
          });
        });
      };

      if (isFirstPoll.current) {
        // Load previously saved snapshot for offline change detection
        const saved = loadSnapshot();
        const savedProfile = loadProfileSnapshot();
        const savedLastSeen = savedProfile?.lastSeenAt
          ? Number(savedProfile.lastSeenAt)
          : 0;

        if (savedLastSeen) {
          const offlineLogs = logArray.filter(
            (log) => getLogTimestamp(log) > savedLastSeen,
          );
          pushProfileNotifications(offlineLogs);
        }

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

          // Seed known appointment IDs (no events on first poll)
          const apptIds = new Set((item.appointments || []).map((a) => a.id));
          complaintAppointmentMap.current.set(item.id, apptIds);

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

        logArray.forEach((log) => {
          if (log?.id !== undefined && log?.id !== null) {
            knownProfileLogIds.current.add(log.id);
          }
          knownProfileSessionKeys.current.add(getSessionKey(log));
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

          // Detect newly scheduled appointments on this complaint
          const knownApptIds = complaintAppointmentMap.current.get(item.id) || new Set();
          (item.appointments || []).forEach((appt) => {
            if (!knownApptIds.has(appt.id)) {
              bufferRef.current.push({
                id: `comp-appt-${item.id}-${appt.id}-${Date.now()}`,
                source: "appointment",
                type: "appointment_scheduled",
                description: "An appointment has been scheduled for your complaint.",
                timestamp: new Date(),
                data: { appointment: appt, complaint_id: item.id },
              });
              knownApptIds.add(appt.id);
            }
          });
          complaintAppointmentMap.current.set(item.id, knownApptIds);
        });

        const newProfileLogs = [];
        logArray.forEach((log) => {
          if (log?.id === undefined || log?.id === null) return;
          if (!knownProfileLogIds.current.has(log.id)) {
            knownProfileLogIds.current.add(log.id);
            newProfileLogs.push(log);
          }
        });

        if (newProfileLogs.length > 0) {
          pushProfileNotifications(newProfileLogs);
        }

        if (bufferRef.current.length > 0) {
          scheduleFlush();
        }
      }

      // Persist snapshot after every poll
      saveSnapshot();
      const latestProfileTs = logArray.reduce(
        (max, log) => Math.max(max, getLogTimestamp(log)),
        0,
      );
      saveProfileSnapshot(latestProfileTs);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("User real-time polling error:", err);
    } finally {
      setIsPolling(false);
    }
  }, [scheduleFlush, loadSnapshot, saveSnapshot, loadProfileSnapshot, saveProfileSnapshot]);

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
