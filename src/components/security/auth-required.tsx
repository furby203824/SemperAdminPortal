"use client";

import { ShieldX } from "lucide-react";

/**
 * Auth gate placeholder. Render this when a route requires CAC authentication.
 * Replace the body with real auth logic once the backend and CAC middleware exist.
 *
 * DoD requirement: DODI 8520.01 mandates CAC for all personnel accessing DoD systems.
 */
export function AuthRequired({ resource }: { resource: string }) {
  return (
    <div
      role="alert"
      aria-label="Authentication required"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <ShieldX
        className="size-12 text-[var(--color-status-stale)]"
        aria-hidden="true"
      />
      <div className="space-y-1">
        <p className="text-lg font-bold text-[var(--color-usmc-scarlet)]">
          Authentication Required
        </p>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Access to <span className="font-mono">{resource}</span> requires a valid DoD CAC.
        </p>
        <p className="text-xs text-[var(--color-subtle-foreground)]">
          CAC authentication is not yet configured. Contact your system administrator.
        </p>
      </div>
      <div className="mt-2 rounded-[var(--radius-md)] border border-[var(--color-status-aging)] bg-[var(--color-bg-elev)] px-4 py-3 text-left text-xs text-[var(--color-muted-foreground)]">
        <p className="mb-1 font-bold uppercase tracking-wide">Required per DODI 8520.01</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>Common Access Card (CAC) with valid DoD PKI cert</li>
          <li>Card reader and ActivClient or equivalent middleware</li>
          <li>Network access to DISA ICAM endpoints</li>
        </ul>
      </div>
    </div>
  );
}
