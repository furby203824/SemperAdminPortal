import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * IPACvsUnitDecisionMatrix - v1.0.
 *
 * Two-column responsibility table. Left column lists what the unit S-1
 * owns. Right column lists what the Installation Personnel Administration
 * Center owns. Each row pairs a unit-side action with the IPAC-side action
 * downstream of it.
 *
 * Renders inside MDX prose at the top of shared admin pages. Side-by-side
 * on desktop, stacked on mobile.
 *
 * Props:
 *   rows  - Array of paired actions. Both sides accept ReactNode for inline
 *           Citation chips.
 *   title - Optional override of the default heading.
 */
export interface IPACDecisionRow {
  unit: React.ReactNode;
  ipac: React.ReactNode;
}

export interface IPACvsUnitDecisionMatrixProps {
  rows: IPACDecisionRow[];
  title?: string;
  className?: string;
}

export function IPACvsUnitDecisionMatrix({
  rows,
  title,
  className,
}: IPACvsUnitDecisionMatrixProps) {
  if (!rows || rows.length === 0) return null;

  return (
    <section
      aria-label="Unit S-1 versus IPAC responsibilities"
      className={cn(
        "my-6 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]",
        className
      )}
    >
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-subtle-foreground)]">
          Responsibility split
        </p>
        <h3 className="mt-0.5 text-sm font-semibold tracking-tight text-[var(--color-foreground)]">
          {title ?? "Unit S-1 vs IPAC"}
        </h3>
      </header>
      <div className="grid grid-cols-1 divide-y divide-[var(--color-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div
          className="p-4"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-role-marine) 4%, transparent)",
          }}
        >
          <p
            className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{ color: "var(--color-role-marine)" }}
          >
            Unit S-1
          </p>
          <ul className="space-y-2 text-sm text-[var(--color-foreground)]">
            {rows.map((row, i) => (
              <li key={i} className="leading-relaxed">
                {row.unit}
              </li>
            ))}
          </ul>
        </div>
        <div
          className="p-4"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--color-role-admin) 4%, transparent)",
          }}
        >
          <p
            className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em]"
            style={{ color: "var(--color-role-admin)" }}
          >
            IPAC
          </p>
          <ul className="space-y-2 text-sm text-[var(--color-foreground)]">
            {rows.map((row, i) => (
              <li key={i} className="leading-relaxed">
                {row.ipac}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
