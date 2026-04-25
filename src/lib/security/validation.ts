export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// ─── String sanitisers ──────────────────────────────────────────────────────

/**
 * Strip ASCII control chars (except \t and \n) and zero-width/bidi-override
 * Unicode that attackers use to hide content or break parsers.
 *
 * ASCII control chars removed (hex ranges, preserving \t=0x09, \n=0x0A):
 *   \x00-\x08  NUL through BS
 *   \x0B       VT
 *   \x0C       FF
 *   \x0E-\x1F  SO through US
 *   \x7F       DEL
 *
 * Unicode ranges removed:
 *   U+200B-U+200F  Zero-width space/non-joiners/joiners/LRM/RLM
 *   U+2028-U+202F  Line/paragraph separators and related
 *   U+2060-U+206F  Word joiner, invisible operators, etc.
 *   U+FEFF         Zero-width no-break space (BOM)
 */
export function stripControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF]/g, '');
}

/**
 * Trim, collapse runs of whitespace, and strip control characters.
 * Use for short single-line fields (names, headlines, handles).
 */
export function sanitizeShortText(input: string): string {
  return stripControlChars(input).replace(/\s+/g, " ").trim();
}

/**
 * Trim and strip control characters but preserve internal newlines.
 * Use for multi-line fields (captions, descriptions, comment bodies).
 */
export function sanitizeLongText(input: string): string {
  return stripControlChars(input).trim();
}

// ─── Field validators ───────────────────────────────────────────────────────

interface LenOpts {
  min?: number;
  max: number;
  field: string;
}

export function validateString(value: unknown, opts: LenOpts): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${opts.field} must be text.`);
  }
  const cleaned = sanitizeLongText(value);
  if (opts.min !== undefined && cleaned.length < opts.min) {
    throw new ValidationError(
      `${opts.field} must be at least ${opts.min} character${opts.min === 1 ? "" : "s"}.`
    );
  }
  if (cleaned.length > opts.max) {
    throw new ValidationError(`${opts.field} must be ${opts.max} characters or less.`);
  }
  return cleaned;
}

export function validateOptionalString(
  value: unknown,
  opts: LenOpts
): string | null {
  if (value == null || value === "") return null;
  return validateString(value, opts);
}

export function validateInt(
  value: unknown,
  opts: { min: number; max: number; field: string }
): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new ValidationError(`${opts.field} must be a whole number.`);
  }
  if (n < opts.min || n > opts.max) {
    throw new ValidationError(
      `${opts.field} must be between ${opts.min} and ${opts.max}.`
    );
  }
  return n;
}

export function validateNumber(
  value: unknown,
  opts: { min: number; max: number; field: string }
): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    throw new ValidationError(`${opts.field} must be a number.`);
  }
  if (n < opts.min || n > opts.max) {
    throw new ValidationError(
      `${opts.field} must be between ${opts.min} and ${opts.max}.`
    );
  }
  return n;
}

// ─── Domain-specific validators ─────────────────────────────────────────────

const HANDLE_RE = /^[a-z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateHandle(raw: unknown): string {
  if (typeof raw !== "string") throw new ValidationError("Username must be text.");
  const cleaned = raw.toLowerCase().trim();
  if (!HANDLE_RE.test(cleaned)) {
    throw new ValidationError(
      "Username must be 3–20 lowercase letters, digits, or underscores."
    );
  }
  return cleaned;
}

export function validateEmail(raw: unknown): string {
  if (typeof raw !== "string") throw new ValidationError("Email is required.");
  const cleaned = raw.trim().toLowerCase();
  if (cleaned.length > 254 || !EMAIL_RE.test(cleaned)) {
    throw new ValidationError("Please enter a valid email address.");
  }
  return cleaned;
}

export function validatePassword(raw: unknown): string {
  if (typeof raw !== "string") throw new ValidationError("Password is required.");
  if (raw.length < 8 || raw.length > 256) {
    throw new ValidationError("Password must be 8–256 characters.");
  }
  if (!/[A-Z]/.test(raw)) {
    throw new ValidationError("Password must contain an uppercase letter.");
  }
  if (!/[0-9]/.test(raw)) {
    throw new ValidationError("Password must contain a digit.");
  }
  if (!/[^A-Za-z0-9]/.test(raw)) {
    throw new ValidationError("Password must contain a special character.");
  }
  return raw;
}

/**
 * Accept only http(s) URLs. Rejects javascript:, data:, vbscript:, file:, etc.
 */
export function validateHttpUrl(raw: unknown, opts?: { field?: string }): string {
  const field = opts?.field ?? "URL";
  if (typeof raw !== "string") throw new ValidationError(`${field} must be text.`);
  const cleaned = raw.trim();
  if (cleaned.length === 0 || cleaned.length > 2048) {
    throw new ValidationError(`${field} is too long.`);
  }
  let url: URL;
  try {
    url = new URL(cleaned);
  } catch {
    throw new ValidationError(`${field} is not a valid URL.`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ValidationError(`${field} must use http or https.`);
  }
  return url.toString();
}

export function validateOptionalHttpUrl(
  raw: unknown,
  opts?: { field?: string }
): string | null {
  if (raw == null || raw === "") return null;
  return validateHttpUrl(raw, opts);
}

// ─── File validators ────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

export interface ImageFileOpts {
  maxBytes: number;
  field?: string;
}

export function validateImageFile(file: unknown, opts: ImageFileOpts): File {
  const field = opts.field ?? "Image";
  if (!(file instanceof File) && !(typeof Blob !== "undefined" && file instanceof Blob)) {
    throw new ValidationError(`${field} is invalid.`);
  }
  const f = file as File;
  if (f.size === 0) throw new ValidationError(`${field} is empty.`);
  if (f.size > opts.maxBytes) {
    const mb = Math.round(opts.maxBytes / (1024 * 1024));
    throw new ValidationError(`${field} must be smaller than ${mb} MB.`);
  }
  if (!ALLOWED_IMAGE_TYPES.has(f.type)) {
    throw new ValidationError(`${field} must be JPEG, PNG, WebP, GIF, or HEIC.`);
  }
  return f;
}

export function validateImageFiles(
  files: readonly unknown[],
  opts: ImageFileOpts & { maxCount: number }
): File[] {
  if (!Array.isArray(files)) throw new ValidationError("Invalid file list.");
  if (files.length > opts.maxCount) {
    throw new ValidationError(`Up to ${opts.maxCount} images allowed.`);
  }
  return files.map((f) => validateImageFile(f, opts));
}
