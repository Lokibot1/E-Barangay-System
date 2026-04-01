export const LOCAL_ACTIVITY_UPDATED_EVENT = "admin:local-activity-updated";

const LOCAL_ACTIVITY_KEY = "admin_local_activity_stream";
const MAX_LOCAL_ACTIVITY = 40;

const parseStoredJson = (value, fallback) => {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const persistLocalActivity = (items) => {
  localStorage.setItem(LOCAL_ACTIVITY_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(LOCAL_ACTIVITY_UPDATED_EVENT));
};

export const getLocalActivityEntries = () =>
  parseStoredJson(localStorage.getItem(LOCAL_ACTIVITY_KEY), [])
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime(),
    );

export const recordLocalActivity = (entry) => {
  const nextEntry = {
    id: entry?.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: entry?.title || "Activity recorded",
    description: entry?.description || "",
    tone: entry?.tone || "info",
    meta: entry?.meta || "",
    source: entry?.source || "local",
    created_at: entry?.created_at || new Date().toISOString(),
  };

  const nextItems = [nextEntry, ...getLocalActivityEntries()].slice(
    0,
    MAX_LOCAL_ACTIVITY,
  );
  persistLocalActivity(nextItems);
  return nextEntry;
};

