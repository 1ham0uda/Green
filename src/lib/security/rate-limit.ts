/**
 * Client-side rate limiting.
 *
 * Firestore does not natively support per-user rate limits (it would require
 * a server-side function on every write path). This module provides a
 * lightweight in-memory + persistent (sessionStorage) rate limiter to:
 *  - Prevent users from accidentally double-submitting (button mashing).
 *  - Slow down obvious automation/abuse against high-cost actions
 *    (post create, comment create, like, follow, report, ad impression).
 *  - Keep Firebase read/write costs bounded under accidental loops.
 *
 * This is NOT a security boundary — Firestore rules are. But it is
 * load-bearing for cost control and UX, and a real attacker who bypasses
 * the client still hits the rules-layer validation, document-shape checks,
 * and Firebase's per-project quotas.
 */

export class RateLimitError extends Error {
  retryAfterMs: number;
  constructor(action: string, retryAfterMs: number) {
    const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    super(`Slow down — try again in ${seconds}s.`);
    this.name = "RateLimitError";
    this.retryAfterMs = retryAfterMs;
    void action;
  }
}

interface Limit {
  windowMs: number;
  maxInWindow: number;
}

// Tuned conservatively. The intent is "no real user hits these; bots do."
// If a legitimate user does hit one, the message is a 1–2s wait, not a ban.
const LIMITS: Record<string, Limit> = {
  // Auth
  "auth.signin":           { windowMs: 60_000,  maxInWindow: 8  },
  "auth.signup":           { windowMs: 60_000,  maxInWindow: 3  },
  "auth.resend":           { windowMs: 60_000,  maxInWindow: 3  },

  // Posts
  "post.create":           { windowMs: 60_000,  maxInWindow: 5  },
  "post.like":             { windowMs: 10_000,  maxInWindow: 20 },
  "post.comment":          { windowMs: 60_000,  maxInWindow: 15 },
  "post.delete":           { windowMs: 60_000,  maxInWindow: 30 },
  "post.save":             { windowMs: 10_000,  maxInWindow: 30 },

  // Social
  "follow.toggle":         { windowMs: 60_000,  maxInWindow: 30 },
  "mute.toggle":           { windowMs: 60_000,  maxInWindow: 20 },

  // Marketplace
  "product.create":        { windowMs: 60_000,  maxInWindow: 10 },
  "product.update":        { windowMs: 60_000,  maxInWindow: 30 },
  "order.place":           { windowMs: 60_000,  maxInWindow: 5  },
  "order.cancel":          { windowMs: 60_000,  maxInWindow: 10 },
  "order.status":          { windowMs: 60_000,  maxInWindow: 60 },
  "return.create":         { windowMs: 60_000,  maxInWindow: 3  },
  "return.review":         { windowMs: 60_000,  maxInWindow: 30 },

  // Plants
  "plant.create":          { windowMs: 60_000,  maxInWindow: 10 },
  "plant.update":          { windowMs: 60_000,  maxInWindow: 30 },

  // Notifications / reports / verification
  "report.create":         { windowMs: 60_000,  maxInWindow: 5  },
  "verification.request":  { windowMs: 600_000, maxInWindow: 1  },

  // Groups / stories / ads
  "group.create":          { windowMs: 600_000, maxInWindow: 3  },
  "group.join":            { windowMs: 60_000,  maxInWindow: 20 },
  "group.post.create":     { windowMs: 60_000,  maxInWindow: 5  },
  "story.create":          { windowMs: 60_000,  maxInWindow: 5  },
  "ad.create":             { windowMs: 600_000, maxInWindow: 3  },
  "ad.impression":         { windowMs: 60_000,  maxInWindow: 30 },

  // Competitions
  "competition.entry":     { windowMs: 60_000,  maxInWindow: 5  },
  "competition.vote":      { windowMs: 60_000,  maxInWindow: 30 },

  // Default for anything unspecified
  "_default":              { windowMs: 60_000,  maxInWindow: 30 },
};

const STORAGE_KEY = "rate_limit_v1";

interface Bucket {
  // Sorted ascending; entries older than the window are pruned.
  timestamps: number[];
}

let buckets: Map<string, Bucket> | null = null;

function getStore(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function load(): Map<string, Bucket> {
  if (buckets) return buckets;
  buckets = new Map();
  const store = getStore();
  if (!store) return buckets;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return buckets;
    const parsed = JSON.parse(raw) as Record<string, number[]>;
    for (const [key, ts] of Object.entries(parsed)) {
      if (Array.isArray(ts)) buckets.set(key, { timestamps: ts });
    }
  } catch {
    // ignore corrupted storage
  }
  return buckets;
}

function persist(state: Map<string, Bucket>): void {
  const store = getStore();
  if (!store) return;
  try {
    const obj: Record<string, number[]> = {};
    for (const [k, v] of state.entries()) obj[k] = v.timestamps;
    store.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Quota errors etc. — best-effort persistence.
  }
}

function getLimit(action: string): Limit {
  return LIMITS[action] ?? LIMITS._default;
}

/**
 * Throws RateLimitError if the action exceeds its limit. Otherwise records
 * the attempt and returns. Call this BEFORE the actual write.
 */
export function checkRateLimit(action: string): void {
  const limit = getLimit(action);
  const state = load();
  const bucket = state.get(action) ?? { timestamps: [] };

  const now = Date.now();
  const cutoff = now - limit.windowMs;
  const fresh = bucket.timestamps.filter((t) => t > cutoff);

  if (fresh.length >= limit.maxInWindow) {
    const oldest = fresh[0];
    const retryAfterMs = oldest + limit.windowMs - now;
    state.set(action, { timestamps: fresh });
    persist(state);
    throw new RateLimitError(action, Math.max(retryAfterMs, 250));
  }

  fresh.push(now);
  state.set(action, { timestamps: fresh });
  persist(state);
}

/**
 * Wraps an async operation with a rate-limit check. If the action is over
 * limit, the operation is NOT invoked and a RateLimitError is thrown.
 */
export async function withRateLimit<T>(
  action: string,
  fn: () => Promise<T>
): Promise<T> {
  checkRateLimit(action);
  return fn();
}

/** Test/diagnostic helper. */
export function _resetRateLimits(): void {
  buckets = new Map();
  const store = getStore();
  if (store) {
    try { store.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }
}
