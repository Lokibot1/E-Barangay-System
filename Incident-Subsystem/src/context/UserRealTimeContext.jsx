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

const UserRealTimeContext = createContext(null);

const LS_NOTIFICATIONS_KEY = "userNotifications";

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

// ── Provider ────────────────────────────────────────────────────────────
export const UserRealTimeProvider = ({ children }) => {
  const { newEvents, clearEvents, isPolling, lastUpdated } =
    useUserRealTimeEvents({
      pollingInterval: 15000,
      batchDelay: 2000,
    });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_NOTIFICATIONS_KEY);
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
    localStorage.setItem(LS_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Convert flushed events into notification objects
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

    const fresh = newItems.map((event) => ({
      id: event.id,
      source: event.source,
      type: event.type,
      description: `Your ${event.source} report status changed from ${capitalize(event.oldStatus)} to ${capitalize(event.newStatus)}`,
      oldStatus: event.oldStatus,
      newStatus: event.newStatus,
      timestamp: event.timestamp,
      read: false,
      data: event.data,
    }));

    setNotifications((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const unique = fresh.filter((n) => !existingIds.has(n.id));
      return [...unique, ...prev];
    });

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
    localStorage.removeItem(LS_NOTIFICATIONS_KEY);
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
