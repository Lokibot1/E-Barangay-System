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
import {
  fetchNotifications,
  createNotifications,
  markNotificationsRead,
} from "../services/sub-system-3/notificationService";

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
  pushNotification: () => {},
  clearNotifications: () => {},
};

const dedupeNotifications = (items = []) => {
  const seen = new Set();
  return (Array.isArray(items) ? items : []).filter((item) => {
    const key = item?.id ?? item?.backendId ?? item?.externalId;
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Convert a backend notification (from /api/notifications) into the
 * local notification shape used by this context.
 */
const mapBackendNotification = (n) => ({
  id: `api-${n.id}`,
  backendId: n.id,
  externalId: n.external_id || null,
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

  // Capture localStorage IDs at mount to detect truly new backend notifications
  const initialNotifIdsRef = useRef(null);

  // Initialize from localStorage so notifications survive refreshes and logouts
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_ADMIN_NOTIFICATIONS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      const unique = dedupeNotifications(parsed);
      initialNotifIdsRef.current = new Set(unique.map((n) => n.id));
      return unique;
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
      LS_ADMIN_NOTIFICATIONS_KEY,
      JSON.stringify(notifications),
    );
  }, [notifications]);

  // On mount: fetch backend notifications to hydrate any that arrived while offline.
  // These are merged with the localStorage cache — deduplicated by id.
  // Unread notifications not in the localStorage cache also trigger toasts.
  useEffect(() => {
    fetchNotifications({ perPage: 50, scope: "admin" }).then((response) => {
      if (!response?.data) return;

      const backendItems = dedupeNotifications(
        response.data.map(mapBackendNotification),
      );

      setNotifications((prev) => {
        const backendExternal = new Set(
          backendItems.map((n) => n.externalId).filter(Boolean),
        );
        // Capture read state of local items that are about to be replaced so that
        // a "mark all as read" action isn't undone by the backend hydration merge.
        const localReadByExternalId = new Map();
        prev.forEach((n) => {
          if (backendExternal.has(n.id)) localReadByExternalId.set(n.id, n.read);
        });
        const prunedPrev = prev.filter((n) => !backendExternal.has(n.id));
        const existingIds = new Set(prunedPrev.map((n) => n.id));
        const newOnes = backendItems
          .filter((n) => !existingIds.has(n.id))
          .map((n) => {
            const wasReadLocally = localReadByExternalId.get(n.externalId);
            return wasReadLocally === true ? { ...n, read: true } : n;
          });
        return dedupeNotifications([...newOnes, ...prunedPrev]);
      });

      // Show toasts for unread notifications that weren't cached locally at mount
      if (initialNotifIdsRef.current) {
        const unseen = dedupeNotifications(
          backendItems.filter(
            (n) => !initialNotifIdsRef.current.has(n.id) && !n.read,
          ),
        );
        if (unseen.length > 0) {
          setLatestBatch(unseen.slice(0, 3));
          setEventVersion((v) => v + 1);
        }
      }
    });
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

    const fresh = dedupeNotifications(newItems.map((event) => {
      const isResident = event.source === "resident";
      const description =
        event?.data?.description ||
        event?.data?.additional_notes ||
        (isResident ? "Resident updated profile information." : "");
      const reportedBy = isResident
        ? event?.data?.editor_name || event?.data?.resident_name || "Resident"
        : event?.data?.user
          ? `${event.data.user.last_name || ""}, ${event.data.user.first_name || ""}`
          : event?.data?.complainant_name || "Unknown";

      return {
        id: event.id,
        source: event.source,
        type: event.type,
        description,
        reportedBy,
        timestamp: event.timestamp,
        read: false,
        data: event.data,
      };
    }));

    // Update persistent notification list (for bell dropdown)
    setNotifications((prev) => dedupeNotifications([...fresh, ...prev]));

    createNotifications(fresh, { scope: "admin" });

    // Set the latest batch — consumers read this ONCE then ignore
    setLatestBatch(fresh);
    setEventVersion((v) => v + 1);
  }, [newEvents]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === notificationId);
      if (notification && !notification.read) {
        if (notification.backendId) {
          markNotificationsRead({
            ids: [notification.backendId],
            read: true,
            scope: "admin",
          });
        } else {
          markNotificationsRead({
            externalIds: [notification.externalId || notification.id],
            read: true,
            scope: "admin",
          });
        }
      }
      return prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      );
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    markNotificationsRead({ markAll: true, read: true, scope: "admin" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const pushNotification = useCallback((notification) => {
    if (!notification?.id) return;

    setNotifications((prev) => dedupeNotifications([notification, ...prev]));
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
      pushNotification,
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
      pushNotification,
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
// eslint-disable-next-line react-refresh/only-export-components
export const useRealTime = () => {
  const ctx = useContext(RealTimeContext);
  if (!ctx) return SAFE_DEFAULTS;
  return ctx;
};

export default RealTimeContext;
