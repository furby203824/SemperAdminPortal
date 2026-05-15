"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useRoleStore } from "@/lib/store/role-store";
import { type Role } from "@/lib/roles";

const PATH_ROLE_MAP: Record<string, Role> = {
  marines: "marine",
  leader: "leader",
  commander: "commander",
  admin: "admin",
};

/**
 * RoleRouteSync - watches pathname and updates the role store when the user
 * navigates to a role-prefixed route (/marines, /leader, /commander, /admin).
 * Keeps "Viewing as" in sync without requiring an explicit role picker action.
 */
export function RoleRouteSync() {
  const pathname = usePathname();
  const setRole = useRoleStore((s) => s.setRole);

  React.useEffect(() => {
    if (!pathname) return;
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    const mapped = firstSegment ? PATH_ROLE_MAP[firstSegment] : undefined;
    if (mapped) setRole(mapped);
  }, [pathname, setRole]);

  return null;
}
