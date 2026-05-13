"use client";

/**
 * Client-side audit logging for DoD NIST 800-53 AU-2 compliance.
 *
 * Architecture note: this is a static site without a backend. Audit events are
 * persisted to sessionStorage and exported on demand. When a backend is added,
 * replace the flushToBackend stub with a real fetch to your logging endpoint.
 *
 * Retention: sessionStorage clears on tab close. Backend persistence is required
 * for DoD compliance (minimum 1-year retention per NIST 800-53 AU-11).
 */

export type AuditAction =
  | "PAGE_VIEW"
  | "ROLE_CHANGE"
  | "EXPORT_PDF"
  | "EXPORT_DOCX"
  | "SEARCH"
  | "ROLE_TAMPER_DETECTED"
  | "AUTH_REQUIRED"
  | "SESSION_START";

export interface AuditEvent {
  /** ISO 8601 timestamp. */
  timestamp: string;
  action: AuditAction;
  /** Path or resource accessed. */
  resource: string;
  /** Additional structured detail. */
  detail?: Record<string, string | number | boolean>;
  /** Placeholder for CAC-derived identity when auth is implemented. */
  userId?: string;
  /** Session identifier (random, non-persistent across tabs). */
  sessionId: string;
}

const SESSION_ID_KEY = "sap.audit.sessionId";
const EVENTS_KEY = "sap.audit.events";
const MAX_EVENTS = 500;

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

function readEvents(): AuditEvent[] {
  try {
    const raw = sessionStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuditEvent[];
  } catch {
    return [];
  }
}

function writeEvents(events: AuditEvent[]): void {
  try {
    sessionStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch {
    // sessionStorage quota exceeded - trim and retry.
    try {
      const trimmed = events.slice(-Math.floor(MAX_EVENTS / 2));
      sessionStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
    } catch {
      // Storage unavailable. Event dropped.
    }
  }
}

export function logAuditEvent(
  action: AuditAction,
  resource: string,
  detail?: AuditEvent["detail"],
  userId?: string
): void {
  const event: AuditEvent = {
    timestamp: new Date().toISOString(),
    action,
    resource,
    detail,
    userId,
    sessionId: getOrCreateSessionId(),
  };

  const events = readEvents();
  events.push(event);
  // Rolling window - drop oldest when over limit.
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
  writeEvents(events);

  // Stub: replace with real fetch when backend is available.
  flushToBackend(event);
}

/**
 * Backend flush stub. Replace the body with a real fetch call once a logging
 * endpoint exists. Required for DoD AU-11 (1-year minimum log retention).
 *
 * Example implementation:
 *   await fetch("/api/audit", { method: "POST", body: JSON.stringify(event) });
 */
function flushToBackend(event: AuditEvent): void {
  // No backend yet. Events stay in sessionStorage only.
  if (process.env.NODE_ENV === "development") {
    console.debug("[AUDIT]", event.timestamp, event.action, event.resource, event.detail ?? "");
  }
}

/** Returns a copy of all audit events in the current session. */
export function getSessionAuditLog(): AuditEvent[] {
  return readEvents();
}

/** Clears the in-session log. Does not affect backend-persisted records. */
export function clearSessionAuditLog(): void {
  sessionStorage.removeItem(EVENTS_KEY);
}
