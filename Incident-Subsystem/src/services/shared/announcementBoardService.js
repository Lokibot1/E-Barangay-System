import { PHP_API_BASE_URL } from "../../config/runtimeApi";
import { requestJson } from "./http";

export const ANNOUNCEMENTS_UPDATED_EVENT = "barangay:announcements-updated";

const ANNOUNCEMENTS_API_URL = `${PHP_API_BASE_URL}/resident-information/announcements.php`;
const LEGACY_SCHEDULED_ANNOUNCEMENTS_KEY = "barangay_scheduled_announcements";
const LEGACY_MIGRATION_FLAG_KEY = "barangay_announcements_api_migrated_v1";
const ANNOUNCEMENT_MEDIA_DB_NAME = "barangay_announcement_media";
const ANNOUNCEMENT_MEDIA_STORE_NAME = "announcement_media";

let autoPublishTimeoutId = null;
let autoPublishPollId = null;
let autoPublishWatcherCount = 0;
let handleAutoPublishVisibility = null;
let announcementMediaDbPromise = null;
let migrationPromise = null;
let announcementRecordsCache = [];

const parseStoredJson = (value, fallback) => {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const canUseLocalStorage = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined";

const buildAnnouncementsUrl = (params = {}) => {
  const url = new URL(ANNOUNCEMENTS_API_URL);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

const dispatchAnnouncementsUpdated = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ANNOUNCEMENTS_UPDATED_EVENT));
};

const clearAnnouncementAutoPublishTimeout = () => {
  if (typeof window === "undefined" || autoPublishTimeoutId === null) return;
  window.clearTimeout(autoPublishTimeoutId);
  autoPublishTimeoutId = null;
};

const clearAnnouncementAutoPublishPoll = () => {
  if (typeof window === "undefined" || autoPublishPollId === null) return;
  window.clearInterval(autoPublishPollId);
  autoPublishPollId = null;
};

const getPublishValue = (item) =>
  item?.publish_at || item?.publishAt || item?.scheduled_for || "";

const formatAnnouncementDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Schedule pending";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const toDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTimeKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const sortAnnouncements = (items = []) =>
  [...items].sort(
    (a, b) =>
      new Date(b.publish_at || b.created_at || b.date || 0).getTime() -
      new Date(a.publish_at || a.created_at || a.date || 0).getTime(),
  );

const normalizeAnnouncementMedia = (item) => {
  const mediaUrl = item?.media?.url || item?.media_url || item?.image || null;
  const mediaType = item?.media?.type || item?.media_type || "";
  const mediaKind =
    item?.media?.kind ||
    item?.media_kind ||
    (String(mediaType).startsWith("video/") ? "video" : mediaUrl ? "image" : null);

  if (!mediaUrl && !item?.media) {
    return {
      ...item,
      media: null,
      image: null,
    };
  }

  return {
    ...item,
    media: mediaKind
      ? {
          kind: mediaKind,
          url: mediaUrl,
          type: mediaType,
          name:
            item?.media?.name ||
            item?.media_name ||
            item?.title ||
            "announcement-media",
          size: Number(
            item?.media?.size ?? item?.media_size ?? item?.size ?? 0,
          ),
        }
      : null,
    image: mediaKind === "image" ? mediaUrl || item?.image || null : item?.image || null,
  };
};

const normalizeAnnouncementEventFields = (item, publishAt) => {
  const isEvent = String(item?.tag || "").toLowerCase() === "event";

  return {
    event_date:
      item?.event_date || item?.eventDate || (isEvent ? toDateKey(publishAt) : ""),
    event_start_time:
      item?.event_start_time ||
      item?.eventStartTime ||
      (isEvent ? toTimeKey(publishAt) : ""),
    event_end_time: item?.event_end_time || item?.eventEndTime || "",
    event_location: item?.event_location || item?.eventLocation || "",
  };
};

const withComputedStatus = (item) => {
  const publishAt = getPublishValue(item);
  const publishTime = new Date(publishAt).getTime();
  const isPublished = Number.isFinite(publishTime)
    ? publishTime <= Date.now()
    : false;

  return normalizeAnnouncementMedia({
    ...item,
    ...normalizeAnnouncementEventFields(item, publishAt),
    publish_at: publishAt,
    status: isPublished ? "published" : "scheduled",
    date: item?.date || formatAnnouncementDate(publishAt),
  });
};

const setAnnouncementRecordsCache = (items = []) => {
  announcementRecordsCache = sortAnnouncements(
    (Array.isArray(items) ? items : []).map(withComputedStatus),
  );
  syncAnnouncementAutoPublishTimer(announcementRecordsCache);
  return announcementRecordsCache;
};

const getNextScheduledPublishTimestamp = (items = []) => {
  const now = Date.now();
  let nextTimestamp = null;

  items.forEach((item) => {
    const publishTimestamp = new Date(getPublishValue(item)).getTime();

    if (!Number.isFinite(publishTimestamp) || publishTimestamp <= now) {
      return;
    }

    if (nextTimestamp === null || publishTimestamp < nextTimestamp) {
      nextTimestamp = publishTimestamp;
    }
  });

  return nextTimestamp;
};

const syncAnnouncementAutoPublishTimer = (items = announcementRecordsCache) => {
  if (typeof window === "undefined") return;

  clearAnnouncementAutoPublishTimeout();

  const nextTimestamp = getNextScheduledPublishTimestamp(items);
  if (!nextTimestamp) return;

  const delay = Math.max(nextTimestamp - Date.now(), 0);

  autoPublishTimeoutId = window.setTimeout(() => {
    autoPublishTimeoutId = null;
    dispatchAnnouncementsUpdated();
    syncAnnouncementAutoPublishTimer();
  }, delay + 25);
};

const openAnnouncementMediaDb = () => {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(
      new Error(
        "This browser cannot access the local announcement media cache yet.",
      ),
    );
  }

  if (!announcementMediaDbPromise) {
    announcementMediaDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(ANNOUNCEMENT_MEDIA_DB_NAME, 1);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(ANNOUNCEMENT_MEDIA_STORE_NAME)) {
          database.createObjectStore(ANNOUNCEMENT_MEDIA_STORE_NAME, {
            keyPath: "id",
          });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(
          request.error ||
            new Error("Unable to open the local announcement media database."),
        );
    });
  }

  return announcementMediaDbPromise;
};

const runAnnouncementMediaRequest = async (mode, executor) => {
  const database = await openAnnouncementMediaDb();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(
      ANNOUNCEMENT_MEDIA_STORE_NAME,
      mode,
    );
    const store = transaction.objectStore(ANNOUNCEMENT_MEDIA_STORE_NAME);
    const request = executor(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        request.error ||
          new Error("Unable to access the local announcement media store."),
      );
  });
};

const getAnnouncementMediaRecord = async (storageKey) => {
  if (!storageKey) return null;

  try {
    return await runAnnouncementMediaRequest("readonly", (store) =>
      store.get(storageKey),
    );
  } catch {
    return null;
  }
};

const deleteAnnouncementMediaBlob = async (storageKey) => {
  if (!storageKey || typeof indexedDB === "undefined") return;

  try {
    await runAnnouncementMediaRequest("readwrite", (store) =>
      store.delete(storageKey),
    );
  } catch {
    // Ignore cleanup errors for orphaned legacy media records.
  }
};

const getLegacyScheduledAnnouncements = () => {
  if (!canUseLocalStorage()) return [];

  return sortAnnouncements(
    parseStoredJson(
      localStorage.getItem(LEGACY_SCHEDULED_ANNOUNCEMENTS_KEY),
      [],
    ).map(withComputedStatus),
  );
};

const clearLegacyScheduledAnnouncements = async (items = []) => {
  if (!canUseLocalStorage()) return;

  localStorage.removeItem(LEGACY_SCHEDULED_ANNOUNCEMENTS_KEY);

  await Promise.all(
    (Array.isArray(items) ? items : []).map((item) =>
      deleteAnnouncementMediaBlob(item?.media?.storageKey),
    ),
  );
};

const buildAnnouncementFormData = async (payload = {}) => {
  const formData = new FormData();

  if (payload?.id) {
    formData.append("id", String(payload.id));
  }

  formData.append("tag", payload?.tag || "Advisory");
  formData.append("title", payload?.title || "Untitled announcement");
  formData.append("desc", payload?.desc || "");
  formData.append("fullContent", payload?.fullContent || payload?.desc || "");
  formData.append("urgent", payload?.urgent ? "1" : "0");
  formData.append(
    "publish_at",
    payload?.publish_at || payload?.publishAt || new Date().toISOString(),
  );
  formData.append("created_at", payload?.created_at || new Date().toISOString());
  formData.append("source", payload?.source || "announcements");
  formData.append("clear_media", payload?.clear_media ? "1" : "0");
  formData.append("event_date", payload?.event_date || payload?.eventDate || "");
  formData.append(
    "event_start_time",
    payload?.event_start_time || payload?.eventStartTime || "",
  );
  formData.append(
    "event_end_time",
    payload?.event_end_time || payload?.eventEndTime || "",
  );
  formData.append(
    "event_location",
    payload?.event_location || payload?.eventLocation || "",
  );

  const media = payload?.media;
  if (!media) {
    return formData;
  }

  let fileBlob = media.file instanceof Blob ? media.file : null;
  let fileName =
    media.name ||
    (media.file && "name" in media.file ? media.file.name : "") ||
    "announcement-media";

  if (!fileBlob && media.storageKey) {
    const record = await getAnnouncementMediaRecord(media.storageKey);
    if (record?.blob instanceof Blob) {
      fileBlob = record.blob;
      fileName = media.name || record.name || fileName;
    }
  }

  if (fileBlob instanceof Blob) {
    formData.append("media_file", fileBlob, fileName);
  }

  return formData;
};

const saveAnnouncementRecord = async (payload = {}) => {
  const formData = await buildAnnouncementFormData(payload);
  const response = await requestJson(ANNOUNCEMENTS_API_URL, {
    method: "POST",
    body: formData,
    requireAuth: false,
    errorMessage: "Unable to save this announcement right now.",
  });

  return withComputedStatus(response?.data || response || {});
};

const loadAnnouncementRecords = async ({ skipMigration = false } = {}) => {
  try {
    if (!skipMigration) {
      await migrateLegacyAnnouncementsToApi();
    }

    const response = await requestJson(buildAnnouncementsUrl(), {
      requireAuth: false,
      errorMessage: "Unable to load announcements right now.",
    });

    return setAnnouncementRecordsCache(response?.data || []);
  } catch (error) {
    const fallback = getLegacyScheduledAnnouncements();
    if (fallback.length > 0) {
      return setAnnouncementRecordsCache(fallback);
    }

    throw error;
  }
};

const mergeAnnouncementsById = (...groups) => {
  const merged = new Map();

  groups.flat().forEach((item) => {
    if (!item) return;

    if (!item.id) {
      merged.set(`fallback-${merged.size}`, item);
      return;
    }

    if (!merged.has(item.id)) {
      merged.set(item.id, item);
    }
  });

  return sortAnnouncements([...merged.values()]);
};

const migrateLegacyAnnouncementsToApi = async () => {
  if (!canUseLocalStorage()) return;
  if (localStorage.getItem(LEGACY_MIGRATION_FLAG_KEY) === "done") return;

  if (!migrationPromise) {
    migrationPromise = (async () => {
      const legacyItems = getLegacyScheduledAnnouncements();

      if (legacyItems.length === 0) {
        localStorage.setItem(LEGACY_MIGRATION_FLAG_KEY, "done");
        return;
      }

      for (const item of legacyItems) {
        await saveAnnouncementRecord({
          ...item,
          media: item.media || null,
        });
      }

      await clearLegacyScheduledAnnouncements(legacyItems);
      localStorage.setItem(LEGACY_MIGRATION_FLAG_KEY, "done");
    })().finally(() => {
      migrationPromise = null;
    });
  }

  return migrationPromise;
};

export const getScheduledAnnouncements = async () => loadAnnouncementRecords();

export const loadPublishedAnnouncements = async (baseAnnouncements = []) => {
  const records = await loadAnnouncementRecords();
  const published = records.filter((item) => item.status === "published");
  const baseItems = Array.isArray(baseAnnouncements)
    ? baseAnnouncements.map(normalizeAnnouncementMedia)
    : [];

  return mergeAnnouncementsById(published, baseItems);
};

export const revokeAnnouncementMediaUrls = (items = []) => {
  if (typeof URL === "undefined") return;

  (Array.isArray(items) ? items : []).forEach((item) => {
    const url = item?.media?.url;
    if (typeof url === "string" && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  });
};

export const subscribeToAnnouncementAutoPublish = () => {
  if (typeof window === "undefined") {
    return () => {};
  }

  autoPublishWatcherCount += 1;

  if (autoPublishWatcherCount === 1) {
    handleAutoPublishVisibility = () => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState !== "visible"
      ) {
        return;
      }

      dispatchAnnouncementsUpdated();
      syncAnnouncementAutoPublishTimer();
    };

    if (typeof document !== "undefined") {
      document.addEventListener(
        "visibilitychange",
        handleAutoPublishVisibility,
      );
    }
    window.addEventListener("focus", handleAutoPublishVisibility);
    autoPublishPollId = window.setInterval(() => {
      dispatchAnnouncementsUpdated();
    }, 60000);
  }

  syncAnnouncementAutoPublishTimer();

  return () => {
    autoPublishWatcherCount = Math.max(0, autoPublishWatcherCount - 1);

    if (autoPublishWatcherCount > 0) {
      return;
    }

    clearAnnouncementAutoPublishTimeout();
    clearAnnouncementAutoPublishPoll();

    if (handleAutoPublishVisibility && typeof document !== "undefined") {
      document.removeEventListener(
        "visibilitychange",
        handleAutoPublishVisibility,
      );
    }

    if (handleAutoPublishVisibility) {
      window.removeEventListener("focus", handleAutoPublishVisibility);
      handleAutoPublishVisibility = null;
    }
  };
};

export const createScheduledAnnouncement = async (payload) => {
  const savedAnnouncement = await saveAnnouncementRecord(payload);
  setAnnouncementRecordsCache(
    mergeAnnouncementsById([savedAnnouncement], announcementRecordsCache),
  );
  dispatchAnnouncementsUpdated();
  return savedAnnouncement;
};

export const deleteScheduledAnnouncement = async (id) => {
  await requestJson(buildAnnouncementsUrl({ id }), {
    method: "DELETE",
    requireAuth: false,
    errorMessage: "Unable to remove this scheduled announcement right now.",
  });

  const nextItems = announcementRecordsCache.filter((item) => item.id !== id);
  setAnnouncementRecordsCache(nextItems);
  dispatchAnnouncementsUpdated();
  return nextItems;
};
