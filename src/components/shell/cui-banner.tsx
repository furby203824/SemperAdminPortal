"use client";

import { ShieldAlert } from "lucide-react";

/**
 * CUI classification banner per NARA CUI Program guidelines.
 * Appears at top and bottom of every page.
 * Color: amber (status-aging token) per DoD CUI marking conventions.
 */
export function CuiBanner() {
  return (
    <div
      role="banner"
      aria-label="Data classification notice"
      className="flex items-center justify-center gap-2 bg-[var(--color-status-aging)] px-4 py-1 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-neutral-950)]"
    >
      <ShieldAlert className="size-3 shrink-0" aria-hidden="true" />
      <span>
        CONTROLLED UNCLASSIFIED INFORMATION (CUI) - For authorized DoD personnel only
      </span>
      <ShieldAlert className="size-3 shrink-0" aria-hidden="true" />
    </div>
  );
}
