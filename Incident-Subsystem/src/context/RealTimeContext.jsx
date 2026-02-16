import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import useRealTimeEvents from "../hooks/shared/useRealTimeEvents";

const RealTimeContext = createContext(null);

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

// ── Provider ────────────────────────────────────────────────────────────
export const RealTimeProvider = ({ children }) => {
  const { newEvents, clearEvents, isPolling, lastUpdated } =
    useRealTimeEvents({
      pollingInterval: 15000,
      batchDelay: 2000,
    });

  const [notifications, setNotifications] = useState([]);
  const [latestBatch, setLatestBatch] = useState([]);
  const [eventVersion, setEventVersion] = useState(0);
  const prevEventsLengthRef = useRef(0);

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
