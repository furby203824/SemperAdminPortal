"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ROLES, type Role } from "@/lib/roles";
import { logAuditEvent } from "@/lib/security/audit-log";

/** Returns true only for known role values. Guards against localStorage tampering. */
function isValidRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export interface RecentEntry {
  href: string;
  title: string;
  /** Epoch ms when last viewed. */
  viewedAt: number;
}

interface RoleState {
  /** Currently active role, null until first selection. */
  role: Role | null;
  /** True after the user actively picked a role. */
  hydrated: boolean;
  /** Last 5 viewed pages, most recent first. Persisted. */
  recents: RecentEntry[];
  setRole: (role: Role) => void;
  clearRole: () => void;
  setHydrated: (v: boolean) => void;
  addRecent: (entry: Omit<RecentEntry, "viewedAt">) => void;
  clearRecents: () => void;
}

const RECENTS_LIMIT = 5;
/** Routes that should not appear in recents. */
const RECENTS_EXCLUDE = new Set(["/", "/search", "/styleguide"]);

/**
 * Persisted role store. Adds a recents slice for the sidebar Last viewed surface.
 * Uses zustand/persist with JSON localStorage adapter and a schema version
 * so future shape changes safely rehydrate.
 */
export const useRoleStore = create<RoleState>()(
  persist(
    (set, get) => ({
      role: null,
      hydrated: false,
      recents: [],
      setRole: (role) => {
        if (!isValidRole(role)) {
          logAuditEvent("ROLE_TAMPER_DETECTED", "/role-store", { attempted: String(role) });
          return;
        }
        const prev = get().role;
        logAuditEvent("ROLE_CHANGE", "/role-store", { from: prev ?? "none", to: role });
        set({ role, hydrated: true });
      },
      clearRole: () => {
        logAuditEvent("ROLE_CHANGE", "/role-store", { from: get().role ?? "none", to: "none" });
        set({ role: null, hydrated: true });
      },
      setHydrated: (v) => set({ hydrated: v }),
      addRecent: ({ href, title }) => {
        if (!href || RECENTS_EXCLUDE.has(href)) return;
        if (!title || title.trim().length === 0) return;
        const now = Date.now();
        const next = [
          { href, title, viewedAt: now },
          ...get().recents.filter((r) => r.href !== href),
        ].slice(0, RECENTS_LIMIT);
        set({ recents: next });
      },
      clearRecents: () => set({ recents: [] }),
    }),
    {
      name: "semper-admin.role.v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        role: state.role,
        recents: state.recents,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reject tampered role values that don't match the canonical ROLES list.
          if (state.role !== null && !isValidRole(state.role)) {
            logAuditEvent("ROLE_TAMPER_DETECTED", "/role-store/rehydrate", {
              attempted: String(state.role),
            });
            state.role = null;
          }
          state.setHydrated(true);
        }
      },
    }
  )
);

/** Selector hook giving role plus a stable hydrated flag for SSR-safe render. */
export function useCurrentRole() {
  return useRoleStore((s) => s.role);
}

/** Selector hook returning the recents list. */
export function useRecents() {
  return useRoleStore((s) => s.recents);
}
