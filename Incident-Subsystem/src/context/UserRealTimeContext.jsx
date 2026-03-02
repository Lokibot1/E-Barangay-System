import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import useUserRealTimeEvents from "../hooks/shared/useUserRealTimeEvents";
import { fetchNotifications } from "../services/sub-system-3/notificationService";

const UserRealTimeContext = createContext(null);

const LS_USER_NOTIFICATIONS_KEY = "userNotifications";

// ── Safe defaults returned when outside the provider (admin routes) ──────
const SAFE_DEFAULTS = {
  notifications: [],
  unreadCount: 0,
  isPolling: false,
  lastUpdated: null,
  latestBatch: [],
  eventVersion: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
};

const capitalize = (str) =>
  str ? str.replace(/\b\w/g, (c) => c.toUpperCase()) : str;

/**
 * Convert a backend notification (from /api/notifications) into the
 * local user notification shape used by this context.
 */
const mapUserBackendNotification = (n) => {
  if (n.type === "appointment_scheduled") {
    return {
      id: `api-${n.id}`,
      backendId: n.id,
      source: "appointment",
      type: n.type,
      description: n.message || "An appointment has been scheduled for your complaint.",
      timestamp: n.created_at,
      read: n.is_read,
      data: n.data,
    };
  }
  return {
    id: `api-${n.id}`,
    backendId: n.id,
    source: n.type?.includes("complaint") ? "complaint" : "incident",
    type: n.type || "Notification",
    description: n.message || "No description",
    oldStatus: n.data?.old_status || n.data?.previous_status || "",
    newStatus: n.data?.new_status || n.data?.status || "",
    timestamp: n.created_at,
    read: n.is_read,
    data: n.data,
  };
};

// ── Provider ────────────────────────────────────────────────────────────
export const UserRealTimeProvider = ({ children }) => {
  const { newEvents, clearEvents, isPolling, lastUpdated } =
    useUserRealTimeEvents({
      pollingInterval: 15000,
      batchDelay: 2000,
    });

  // Capture localStorage IDs at mount to detect truly new backend notifications
  const initialNotifIdsRef = useRef(null);

  // Initialize from localStorage so notifications survive refreshes and logouts
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_USER_NOTIFICATIONS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      initialNotifIdsRef.current = new Set(parsed.map((n) => n.id));
      return parsed;
    } catch {
      initialNotifIdsRef.current = new Set();
      return [];
    }
  });
  const [latestBatch, setLatestBatch] = useState([]);
  const [eventVersion, setEventVersion] = useState(0);
  const prevEventsLengthRef = useRef(0);

  // Persist notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      LS_USER_NOTIFICATIONS_KEY,
      JSON.stringify(notifications),
    );
  }, [notifications]);

  // On mount: fetch backend notifications to hydrate any that arrived while offline.
  // These are merged with the localStorage cache — deduplicated by id.
  // Unread notifications not in the localStorage cache also trigger toasts.
  useEffect(() => {
    fetchNotifications({ perPage: 50 }).then((response) => {
      if (!response?.data) return;

      const backendItems = response.data.map(mapUserBackendNotification);

      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newOnes = backendItems.filter((n) => !existingIds.has(n.id));
        if (newOnes.length === 0) return prev;
        return [...newOnes, ...prev];
      });

      // Show toasts for unread notifications that weren't cached locally at mount
      if (initialNotifIdsRef.current) {
        const unseen = backendItems.filter(
          (n) => !initialNotifIdsRef.current.has(n.id) && !n.read,
        );
        if (unseen.length > 0) {
          setLatestBatch(unseen.slice(0, 3));
          setEventVersion((v) => v + 1);
        }
      }
    });
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert flushed real-time events into notification objects — fires ONCE per batch
  useEffect(() => {
    if (
      newEvents.length === 0 ||
      newEvents.length === prevEventsLengthRef.current
    )
      return;

    const newItems = newEvents.slice(
      0,
      newEvents.length - prevEventsLengthRef.current,
    );
    prevEventsLengthRef.current = newEvents.length;

    if (newItems.length === 0) return;

    const fresh = newItems.map((event) => {
      if (event.type === "appointment_scheduled") {
        return {
          id: event.id,
          source: "appointment",
          type: event.type,
          description: event.description || "An appointment has been scheduled for your complaint.",
          timestamp: event.timestamp,
          read: false,
          data: event.data,
        };
      }
      return {
        id: event.id,
        source: event.source,
        type: event.type,
        description: `Your ${event.source} report status changed from ${capitalize(event.oldStatus)} to ${capitalize(event.newStatus)}`,
        oldStatus: event.oldStatus,
        newStatus: event.newStatus,
        timestamp: event.timestamp,
        read: false,
        data: event.data,
      };
    });

    // Update persistent notification list (for bell dropdown)
    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const unique = fresh.filter((n) => !existingIds.has(n.id));
      return [...unique, ...prev];
    });

    // Set the latest batch — consumers read this ONCE then ignore
    setLatestBatch(fresh);
    setEventVersion((v) => v + 1);
  }, [newEvents]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setLatestBatch([]);
    clearEvents();
    prevEventsLengthRef.current = 0;
    localStorage.removeItem(LS_USER_NOTIFICATIONS_KEY);
  }, [clearEvents]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isPolling,
      lastUpdated,
      latestBatch,
      eventVersion,
      markAsRead,
      markAllAsRead,
      clearNotifications,
    }),
    [
      notifications,
      unreadCount,
      isPolling,
      lastUpdated,
      latestBatch,
      eventVersion,
      markAsRead,
      markAllAsRead,
      clearNotifications,
    ],
  );

  return (
    <UserRealTimeContext.Provider value={value}>
      {children}
    </UserRealTimeContext.Provider>
  );
};

// ── Consumer hook — returns safe defaults outside the provider ──────────
export const useUserRealTime = () => {
  const ctx = useContext(UserRealTimeContext);
  if (!ctx) return SAFE_DEFAULTS;
  return ctx;
};

export default UserRealTimeContext;
