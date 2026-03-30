const SUPPORT_DRAFT_PREFIX = "support_issue_draft";
const SUPPORT_QUEUE_PREFIX = "support_issue_queue";

const parseStoredJson = (value, fallback) => {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const buildScopedKey = (prefix, scope) => `${prefix}_${String(scope || "guest")}`;

const toQueueId = () =>
  `queued-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const loadSupportDraft = (scope) =>
  parseStoredJson(
    localStorage.getItem(buildScopedKey(SUPPORT_DRAFT_PREFIX, scope)),
    null,
  );

export const saveSupportDraft = (scope, draft) => {
  if (!draft || typeof draft !== "object") return;

  localStorage.setItem(
    buildScopedKey(SUPPORT_DRAFT_PREFIX, scope),
    JSON.stringify({
      ...draft,
      saved_at: draft.saved_at || new Date().toISOString(),
    }),
  );
};

export const clearSupportDraft = (scope) => {
  localStorage.removeItem(buildScopedKey(SUPPORT_DRAFT_PREFIX, scope));
};

export const loadQueuedSupportIssues = (scope) =>
  parseStoredJson(
    localStorage.getItem(buildScopedKey(SUPPORT_QUEUE_PREFIX, scope)),
    [],
  );

const persistQueuedSupportIssues = (scope, items) => {
  localStorage.setItem(
    buildScopedKey(SUPPORT_QUEUE_PREFIX, scope),
    JSON.stringify(Array.isArray(items) ? items : []),
  );
};

export const queueSupportIssue = (scope, payload) => {
  const nextItem = {
    id: toQueueId(),
    queued_at: new Date().toISOString(),
    payload,
  };

  const current = loadQueuedSupportIssues(scope);
  const nextQueue = [nextItem, ...current];
  persistQueuedSupportIssues(scope, nextQueue);
  return nextItem;
};

export const removeQueuedSupportIssue = (scope, queueId) => {
  const nextQueue = loadQueuedSupportIssues(scope).filter(
    (item) => item?.id !== queueId,
  );
  persistQueuedSupportIssues(scope, nextQueue);
  return nextQueue;
};

export const syncQueuedSupportIssues = async (scope, submitIssue) => {
  const queue = loadQueuedSupportIssues(scope);
  const synced = [];
  const remaining = [];

  for (const item of queue) {
    try {
      const created = await submitIssue(item.payload);
      synced.push(created);
    } catch (error) {
      remaining.push(item);

      const message = String(error?.message || "").toLowerCase();
      if (
        message.includes("offline") ||
        message.includes("unavailable") ||
        message.includes("network")
      ) {
        remaining.push(
          ...queue.slice(
            queue.findIndex((entry) => entry?.id === item?.id) + 1,
          ),
        );
        break;
      }
    }
  }

  persistQueuedSupportIssues(scope, remaining);
  return { synced, remaining };
};

