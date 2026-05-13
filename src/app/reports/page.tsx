"use client";

import * as React from "react";
import { FileText, Download } from "lucide-react";
import { PageHeader } from "@/components/domain/page-header";
import { MetaRow } from "@/components/domain/meta-row";
import { StatusPill } from "@/components/ui/status-pill";
import { RoleChip } from "@/components/domain/role-chip";
import { useRoleStore } from "@/lib/store/role-store";
import { useMounted } from "@/hooks/use-mounted";
import type { Role } from "@/lib/roles";
import { cn } from "@/lib/utils";

interface ReportData {
  slug: string;
  title: string;
  summary: string;
  roles: Role[];
  reportType: string;
  url?: string;
  lastVerified: string;
}

function classify(date: string): "fresh" | "aging" | "stale" {
  const months =
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months >= 24) return "stale";
  if (months >= 12) return "aging";
  return "fresh";
}

export default function ReportsIndex() {
  const role = useRoleStore((s) => s.role);
  const mounted = useMounted();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const data = require("@/generated/reports.json") as ReportData[];

  const visible = React.useMemo(() => {
    let list = data;
    if (mounted && role) {
      list = list.filter((r) => r.roles.includes(role));
    }
    return list;
  }, [data, mounted, role]);

  const reportTypes = React.useMemo(() => {
    return Array.from(new Set(data.map((r) => r.reportType))).sort();
  }, [data]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Reference"
        tags={<StatusPill status="fresh" label={`${data.length} reports available`} />}
        title="REPORTS"
        summary="Administrative reports, forms, and documentation resources."
      >
        <MetaRow
          items={[
            { label: "Reports", value: data.length },
            {
              label: "Types",
              value: reportTypes.length,
            },
          ]}
        />
      </PageHeader>

      {visible.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-2)] p-8 text-center">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No reports match your current role.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((r) => {
            const status = classify(r.lastVerified);
            const isExternal = r.url && r.url.startsWith("http");
            return (
              <a
                key={r.slug}
                href={r.url || "#"}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className={cn(
                  "group relative flex flex-col gap-3 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] p-5 transition-all",
                  !r.url && "cursor-default",
                  r.url && "hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)]"
                )}
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-full w-1 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: "var(--color-usmc-scarlet)" }}
                />
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="grid size-9 place-items-center rounded-[var(--radius-sm)]"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--color-usmc-scarlet) 12%, transparent)",
                      color: "var(--color-usmc-scarlet)",
                    }}
                  >
                    <FileText className="size-4" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-[var(--radius-xs)] border border-[var(--color-border-strong)] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-[var(--color-muted-foreground)]">
                      {r.reportType}
                    </span>
                    <StatusPill
                      status={status}
                      label={status === "fresh" ? "Verified" : status === "aging" ? "Aging" : "Stale"}
                      size="xs"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">{r.title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-muted-foreground)] leading-snug">
                    {r.summary}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                  <div className="flex flex-wrap gap-1">
                    {r.roles.map((role) => (
                      <RoleChip key={role} role={role} size="xs" icon={false} />
                    ))}
                  </div>
                  {r.url && (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold"
                      style={{ color: "var(--color-usmc-scarlet)" }}
                    >
                      {isExternal ? "Visit" : "View"}
                      <Download className="size-3" aria-hidden="true" />
                    </span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
