import type { Role } from "@/lib/roles";

/**
 * Role-aware navigation trees - v1.2.
 *
 * Single source of truth for the desktop sidebar TreeNav and the mobile drawer.
 * Each role surfaces its own topic tree. Reference items (search, citations,
 * tools, videos) appear under every role.
 *
 * Phase 4 will swap the hand-curated trees for a generator that consumes
 * src/generated/*.json catalogs at build time.
 */

export interface TreeLeaf {
  label: string;
  href: string;
}

export interface TreeBranch {
  label: string;
  href?: string;
  defaultOpen?: boolean;
  children: TreeLeaf[];
}

export interface TreeSection {
  /** Section eyebrow text. */
  label: string;
  items: (TreeBranch | TreeLeaf)[];
}

export function isBranch(item: TreeBranch | TreeLeaf): item is TreeBranch {
  return "children" in item && Array.isArray((item as TreeBranch).children);
}

const REFERENCE_SECTION: TreeSection = {
  label: "Reference",
  items: [
    { label: "Search", href: "/search" },
    { label: "Citations Index", href: "/citations" },
    { label: "Tools", href: "/tools" },
    { label: "Videos", href: "/videos" },
    { label: "Links", href: "/links" },
    { label: "Reports", href: "/reports" },
    {
      label: "Inspections",
      href: "/inspections",
      children: [
        { label: "IGMC", href: "/inspections/igmc" },
        { label: "MCAAT", href: "/inspections/mcaat" },
      ],
    },
    { label: "About", href: "/about" },
  ],
};

const STYLEGUIDE_SECTION: TreeSection = {
  label: "System",
  items: [{ label: "Style guide", href: "/styleguide" }],
};

// =================================================================
// MARINE
// =================================================================
const MARINE_TREE: TreeSection[] = [
  {
    label: "",
    items: [
      { label: "Home", href: "/" },
    ],
  },
  REFERENCE_SECTION,
  STYLEGUIDE_SECTION,
];

// =================================================================
// LEADER
// =================================================================
const LEADER_TREE: TreeSection[] = [
  {
    label: "",
    items: [
      { label: "Home", href: "/" },
    ],
  },
  REFERENCE_SECTION,
  STYLEGUIDE_SECTION,
];

// =================================================================
// COMMANDER
// =================================================================
const COMMANDER_TREE: TreeSection[] = [
  {
    label: "",
    items: [
      { label: "Home", href: "/" },
    ],
  },
  REFERENCE_SECTION,
  STYLEGUIDE_SECTION,
];

// =================================================================
// ADMIN
// =================================================================
const ADMIN_TREE: TreeSection[] = [
  {
    label: "",
    items: [
      { label: "Home", href: "/" },
    ],
  },
  REFERENCE_SECTION,
  STYLEGUIDE_SECTION,
];

const DEFAULT_TREE: TreeSection[] = [
  {
    label: "Browse",
    items: [
      { label: "Marines", href: "/marines" },
      { label: "Leader", href: "/leader" },
      { label: "Commander", href: "/commander" },
      { label: "Admin", href: "/admin" },
    ],
  },
  REFERENCE_SECTION,
  STYLEGUIDE_SECTION,
];

const TREE_BY_ROLE: Record<Role, TreeSection[]> = {
  marine: MARINE_TREE,
  leader: LEADER_TREE,
  commander: COMMANDER_TREE,
  admin: ADMIN_TREE,
};

export function getTreeForRole(role: Role | null): TreeSection[] {
  if (!role) return DEFAULT_TREE;
  return TREE_BY_ROLE[role];
}