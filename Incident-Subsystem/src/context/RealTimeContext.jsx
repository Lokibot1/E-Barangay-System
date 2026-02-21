import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import useRealTimeEvents from "../hooks/shared/useRealTimeEvents";
import { fetchNotifications } from "../services/sub-system-3/notificationService";

const RealTimeContext = createContext(null);

const LS_ADMIN_NOTIFICATIONS_KEY = "adminNotifications";

// ── Safe defaults returned when outside the provider (user routes) ──────
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

/**
 * Convert a backend notification (from /api/notifications) into the
 * local notification shape used by this context.
 */
const mapBackendNotification = (n) => ({
  id: `api-${n.id}`,
  backendId: n.id,
  source: n.type?.includes("complaint") ? "complaint" : "incident",
  type:
    n.type === "incident_created"
      ? "New Incident Report"
      : n.type === "complaint_created"
        ? "New Complaint"
        : n.type || "Notification",
  description: n.message || "No description",
  reportedBy:
    n.data?.complainant_name ||
    (n.data?.user
      ? `${n.data.user.last_name || ""}, ${n.data.user.first_name || ""}`
      : ""),
  timestamp: n.created_at,
  read: n.is_read,
  data: n.data,
});

// ── Provider ────────────────────────────────────────────────────────────
export const RealTimeProvider = ({ children }) => {
  const { newEvents, clearEvents, isPolling, lastUpdated } =
    useRealTimeEvents({
      pollingInterval: 15000,
      batchDelay: 2000,
    });

  // Initialize from localStorage so notifications survive refreshes and logouts
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_ADMIN_NOTIFICATIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [latestBatch, setLatestBatch] = useState([]);
  const [eventVersion, setEventVersion] = useState(0);
  const prevEventsLengthRef = useRef(0);

  // Persist notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      LS_ADMIN_NOTIFICATIONS_KEY,
      JSON.stringify(notifications),
    );
  }, [notifications]);

  // On mount: fetch backend notifications to hydrate any that arrived while offline.
  // These are merged with the localStorage cache — deduplicated by id.
  useEffect(() => {
    fetchNotifications({ perPage: 50 }).then((response) => {
      if (!response?.data) return;

      const backendItems = response.data.map(mapBackendNotification);

      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newOnes = backendItems.filter((n) => !existingIds.has(n.id));
        if (newOnes.length === 0) return prev;
        // Prepend new backend notifications (they are already sorted latest-first by the API)
        return [...newOnes, ...prev];
      });
    });
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert flushed events into notification objects — fires ONCE per batch
  useEffect(() => {
    if (
      newEvents.length === 0 ||
      newEvents.length === prevEventsLengthRef.current
    )
      return;

    // Only process truly new items (delta between prev length and current)
    const newItems = newEvents.slice(
      0,
      newEvents.length - prevEventsLengthRef.current,
    );
    prevEventsLengthRef.current = newEvents.length;

    if (newItems.length === 0) return;

    const fresh = newItems.map((event) => ({
      id: event.id,
      source: event.source,
      type: event.type,
      description:
        event.data.description || event.data.additional_notes || "",
      reportedBy: event.data.user
        ? `${event.data.user.last_name || ""}, ${event.data.user.first_name || ""}`
        : event.data.complainant_name || "Unknown",
      timestamp: event.timestamp,
      read: false,
      data: event.data,
    }));

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
    localStorage.removeItem(LS_ADMIN_NOTIFICATIONS_KEY);
  }, [clearEvents]);

  // Memoize to prevent unnecessary re-renders in consumers
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
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

// ── Consumer hook — returns safe defaults outside the provider ──────────
export const useRealTime = () => {
  const ctx = useContext(RealTimeContext);
  if (!ctx) return SAFE_DEFAULTS;
  return ctx;
};

export default RealTimeContext;
