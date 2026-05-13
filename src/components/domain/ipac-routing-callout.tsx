import * as React from "react";
import {
  Banknote,
  LogIn,
  LogOut,
  Wallet,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * IPACRoutingCallout - v1.0.
 *
 * Marks the routing handoff between unit S-1 and the Installation Personnel
 * Administration Center for a workflow step. Renders inside MDX prose on
 * shared and primary admin pages.
 *
 * Visual pattern mirrors Callout. Left-border accent uses the admin role
 * token (muted green) since IPAC sits in the admin venue. Billet sets the
 * icon and the default eyebrow label so authors do not retype roles.
 *
 * Props:
 *   billet - Selects the IPAC desk owning the step. Drives icon and label.
 *   title  - Optional override of the eyebrow label.
 *   route  - Optional one-line routing summary rendered above the body.
 *
 * Children carry the procedural detail. Use Citation chips inline.
 */
export type IPACBillet =
  | "ipac-pay-clerk"
  | "ipac-outbound-counselor"
  | "ipac-inbound-counselor"
  | "ipac-disbursing-tech";

export interface IPACRoutingCalloutProps {
  billet: IPACBillet;
  title?: string;
  route?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface BilletConfig {
  icon: LucideIcon;
  label: string;
  mos: string;
}

const BILLET_CONFIG: Record<IPACBillet, BilletConfig> = {
  "ipac-pay-clerk": {
    icon: Banknote,
    label: "IPAC pay clerk",
    mos: "0111",
  },
  "ipac-outbound-counselor": {
    icon: LogOut,
    label: "IPAC outbound counselor",
    mos: "0111",
  },
  "ipac-inbound-counselor": {
    icon: LogIn,
    label: "IPAC inbound counselor",
    mos: "0111",
  },
  "ipac-disbursing-tech": {
    icon: Wallet,
    label: "IPAC disbursing technician",
    mos: "0111",
  },
};

export function IPACRoutingCallout({
  billet,
  title,
  route,
  children,
  className,
}: IPACRoutingCalloutProps) {
  const cfg = BILLET_CONFIG[billet];
  const Icon = cfg.icon;
  const accent = "var(--color-role-admin)";

  return (
    <aside
      role="note"
      aria-label={`IPAC routing - ${cfg.label}`}
      className={cn(
        "my-5 rounded-r-[var(--radius-sm)] border-l-4 px-4 py-3 text-sm",
        className
      )}
      style={{
        borderLeftColor: accent,
        backgroundColor: `color-mix(in srgb, ${accent} 6%, var(--color-surface))`,
      }}
    >
      <div
        className="mb-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em]"
        style={{ color: accent }}
      >
        <Building2 className="size-3.5" aria-hidden="true" />
        IPAC routing
      </div>
      <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-foreground)]">
        <Icon
          className="size-4"
          aria-hidden="true"
          style={{ color: accent }}
        />
        <span>{title ?? cfg.label}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-subtle-foreground)]">
          MOS {cfg.mos}
        </span>
      </div>
      {route && (
        <p className="mb-2 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
          {route}
        </p>
      )}
      <div className="leading-relaxed text-[var(--color-foreground)]">
        {children}
      </div>
    </aside>
  );
}
