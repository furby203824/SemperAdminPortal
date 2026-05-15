import { z } from "zod";
import { ROLES } from "@/lib/roles";

const RoleEnum = z.enum(ROLES);

const baseFrontmatter = z.object({
  title: z.string().min(2),
  slug: z.string().min(1),
  summary: z.string().min(10),
  roles: z.array(RoleEnum).min(1),
  lastVerified: z.string(),
  source: z.object({
    title: z.string(),
    publisher: z.string().optional(),
    url: z.string().url().optional(),
  }),
});

export const policySchema = baseFrontmatter.extend({
  kind: z.enum(["MARADMIN", "MCO", "ALMAR", "NAVMC", "DODI"]),
  number: z.string(),
  effectiveDate: z.string(),
  supersedes: z.string().optional(),
});

export const situationSchema = baseFrontmatter.extend({
  scenario: z.string(),
  prerequisites: z.array(z.string()).default([]),
  relatedPolicies: z.array(z.string()).default([]),
  relatedVideos: z.array(z.string()).default([]),
});

export const snippetSchema = baseFrontmatter.extend({
  topic: z.string(),
  bullets: z.array(z.string()).min(2).max(4),
});

export const videoSchema = baseFrontmatter.extend({
  durationSeconds: z.number().int().nonnegative().default(0),
  videoUrl: z.string(),
  youtubeUrl: z.string().url().optional(),
  mceleUrl: z.string().url().optional(),
  posterUrl: z.string().optional(),
  transcript: z.string().optional(),
  chapters: z
    .array(z.object({ label: z.string(), startSeconds: z.number().int().min(0) }))
    .default([]),
  relatedPolicies: z.array(z.string()).default([]),
});

export const referenceSchema = baseFrontmatter.extend({
  type: z.enum(["form", "calculator", "checklist"]),
  link: z.string().optional(),
});

export const toolSchema = baseFrontmatter.extend({
  outputType: z.enum(["pdf", "docx", "calculator", "checklist"]),
  routeSlug: z.string(),
});

export const linkSchema = baseFrontmatter.extend({
  url: z.string().url(),
  category: z.string(),
});

export const reportSchema = baseFrontmatter.extend({
  reportType: z.string(),
  url: z.string().url().optional(),
});

export const legalSchema = baseFrontmatter.extend({
  type: z.enum(["disclaimer", "terms"]),
});

export const UNIT_TYPES = ["s1-g1", "i-and-i", "pac"] as const;
export const ADMIN_FUNCTIONS = ["GENA", "OPER", "MPMN", "PERA"] as const;
export const SKILL_LEVELS = [1000, 2000, 2100] as const;
export const ADMIN_MOS = ["0102", "0111", "0170"] as const;

/**
 * IPAC applicability marker. Tags admin content with the workflow venue
 * split between unit S-1 and the Installation Personnel Administration
 * Center. Orthogonal to unitType. unitType picks the surface venue
 * (s1-g1, i-and-i, pac). ipacApplicability picks the routing pattern.
 *
 * primary: IPAC owns the workflow end to end.
 * shared: unit S-1 initiates, IPAC processes.
 * unit-only: unit S-1 owns the workflow, IPAC has no role.
 * command-only: command-level surface, no IPAC and no unit S-1 desk.
 *
 * Default of unit-only keeps existing pages neutral on rollover.
 */
export const IPAC_APPLICABILITY = [
  "primary",
  "shared",
  "unit-only",
  "command-only",
] as const;

export const adminSchema = baseFrontmatter.extend({
  unitType: z.enum(UNIT_TYPES),
  topic: z.string().min(2),
  function: z.enum(ADMIN_FUNCTIONS),
  skillLevel: z.union([z.literal(1000), z.literal(2000), z.literal(2100)]),
  trEventCode: z
    .string()
    .regex(/^\d{4}-[A-Z]{4}-\d{4}$/, "Expected format like 0111-PERA-1001")
    .optional(),
  sourcePolicy: z.string().optional(),
  sourceChapter: z.string().optional(),
  sourceSection: z.string().optional(),
  mosPerforming: z.array(z.enum(ADMIN_MOS)).min(1),
  ipacApplicability: z.enum(IPAC_APPLICABILITY).default("unit-only"),
  billets: z.array(z.string()).default([]),
  gradesPerforming: z.array(z.string()).default([]),
  sustainmentInterval: z.string().default("12 months"),
  evaluationCoded: z.boolean().default(false),
  readinessCoded: z.boolean().default(false),
  references: z.array(z.string()).default([]),
  performanceSteps: z.array(z.string()).default([]),
  relatedRoles: z
    .object({
      marine: z.string().optional(),
      leader: z.string().optional(),
      commander: z.string().optional(),
    })
    .optional(),
});

export const INSPECTION_TRACKS = ["igmc", "mcaat"] as const;
export type InspectionTrack = (typeof INSPECTION_TRACKS)[number];

export const INSPECTION_CATEGORIES = ["CoRE", "CoRE+", "Non-CoRE"] as const;
export type InspectionCategory = (typeof INSPECTION_CATEGORIES)[number];

export const INSPECTION_AUDIENCES = [
  "IPAC",
  "REPORTING",
  "SUPPORTING",
  "DO",
  "FO",
  "OUTSIDE_AGENCY",
] as const;
export type InspectionAudience = (typeof INSPECTION_AUDIENCES)[number];

const inspectionItemSchema = z.object({
  code: z.string().min(1),
  question: z.string().min(2),
  references: z.array(z.string()).default([]),
  evidenceHint: z.string().nullable().optional(),
  /**
   * Accepts a single audience or an array. Admin items historically tagged
   * one audience per row. Finance items tag multiple, so the field accepts
   * either shape. Detail pages normalize to an array on read.
   */
  audience: z
    .union([
      z.enum(INSPECTION_AUDIENCES),
      z.array(z.enum(INSPECTION_AUDIENCES)),
    ])
    .optional(),
});

const inspectionSubsectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2),
  description: z.string().optional(),
  items: z.array(inspectionItemSchema).min(1),
});

/**
 * Inspection program schema. JSON-sourced under content/inspections/<track>/.
 *
 * Diverges from baseFrontmatter on purpose. Inspection programs carry a
 * programNumber and a sponsor, not the publisher-style source object the
 * MDX collections share. Programs use a tighter staleness cadence
 * (6 months aging, 12 months stale) since IGMC programs roll annually.
 */
export const inspectionSchema = z.object({
  track: z.enum(INSPECTION_TRACKS),
  programNumber: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(2),
  summary: z.string().min(10).max(280),
  roles: z.array(RoleEnum).min(1),
  sponsor: z.string().min(2).optional(),
  category: z.enum(INSPECTION_CATEGORIES).optional(),
  faName: z.string().optional(),
  applicabilityLevel: z.string().optional(),
  effectiveDate: z.string().optional(),
  lastVerified: z.string(),
  section: z.string().optional(),
  categoryLabel: z.string().optional(),
  supersedes: z.string().optional(),
  source: z.object({
    title: z.string(),
    publisher: z.string().optional(),
    url: z.string().url().optional(),
  }),
  subsections: z.array(inspectionSubsectionSchema).min(1),
});

export type InspectionItem = z.infer<typeof inspectionItemSchema>;
export type InspectionSubsection = z.infer<typeof inspectionSubsectionSchema>;
export type Inspection = z.infer<typeof inspectionSchema>;

/**
 * Inspection-specific staleness cadence. IGMC programs publish annually,
 * so the 12 / 24 month rule used elsewhere misses the cycle. Use this
 * helper anywhere the LastVerified component renders an inspection.
 */
export function classifyInspectionStatus(
  lastVerified: string
): "fresh" | "aging" | "stale" {
  const months =
    (Date.now() - new Date(lastVerified).getTime()) /
    (1000 * 60 * 60 * 24 * 30);
  if (months >= 12) return "stale";
  if (months >= 6) return "aging";
  return "fresh";
}

export const roleContentSchema = baseFrontmatter.extend({
  topic: z.string().min(2),
  /**
   * Optional explicit ordering within a topic. Lower numbers render first.
   * When present, overrides the default alphabetical-by-title sort.
   * Use for sequential content (e.g., turnover phases) where alphabetical
   * order misrepresents the operational flow.
   */
  order: z.number().int().optional(),
  trEventCode: z
    .string()
    .regex(/^\d{4}-[A-Z]{4}-\d{4}$/, "Expected format like 0111-PERA-1001")
    .optional(),
  sourcePolicy: z.string().optional(),
  sourceChapter: z.string().optional(),
  sourceSection: z.string().optional(),
  performanceSteps: z.array(z.string()).default([]),
  references: z.array(z.string()).default([]),
  relatedRoles: z
    .object({
      marine: z.string().optional(),
      leader: z.string().optional(),
      commander: z.string().optional(),
      admin: z.string().optional(),
    })
    .optional(),
});

export type UnitType = (typeof UNIT_TYPES)[number];
export type AdminFunction = (typeof ADMIN_FUNCTIONS)[number];
export type SkillLevel = (typeof SKILL_LEVELS)[number];
export type AdminMos = (typeof ADMIN_MOS)[number];
export type IpacApplicability = (typeof IPAC_APPLICABILITY)[number];

export type Policy = z.infer<typeof policySchema>;
export type Situation = z.infer<typeof situationSchema>;
export type Snippet = z.infer<typeof snippetSchema>;
export type Video = z.infer<typeof videoSchema>;
export type Reference = z.infer<typeof referenceSchema>;
export type Tool = z.infer<typeof toolSchema>;
export type Link = z.infer<typeof linkSchema>;
export type Report = z.infer<typeof reportSchema>;
export type Legal = z.infer<typeof legalSchema>;
export type AdminContent = z.infer<typeof adminSchema>;
export type RoleContent = z.infer<typeof roleContentSchema>;

/**
 * Citation type enum. Drives the parent-policy classification on every
 * citation record. Add a new value with care. Downstream filters and UI
 * surfaces switch on it.
 */
export const CITATION_TYPES = [
  "MCO",
  "MARADMIN",
  "ALMAR",
  "ALNAV",
  "NAVMC",
  "DODFMR",
  "DODI",
  "DODD",
  "DODM",
  "SECNAV",
  "SECNAVINST",
  "JAGINST",
  "FPM",
  "MCTFSPRIUM",
  "DD-FORM",
  "NAVMC-FORM",
  "FAC",
  "USC",
  "CFR",
  "MCBUL",
  "OTHER",
] as const;
export type CitationType = (typeof CITATION_TYPES)[number];

/**
 * Citation record. Each entry is one parent policy or authority document.
 * Authored under content/citations/<id>.mdx. The id field is the URL-safe
 * slug used as the filename. The aliases array carries every input string
 * the resolver should accept as a match for this entry. Add new aliases
 * over time as audit output surfaces uncovered forms.
 */
export const citationSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9-]+$/,
      "Citation id must be lowercase letters, digits, and hyphens"
    ),
  aliases: z.array(z.string().min(1)).min(1),
  title: z.string().min(2),
  type: z.enum(CITATION_TYPES),
  number: z.string().min(1),
  publisher: z.string().min(2),
  effectiveDate: z.string().optional(),
  lastVerified: z.string(),
  externalUrl: z.string().url().optional(),
  supersedes: z.array(z.string()).default([]),
  roles: z.array(RoleEnum).min(1),
  hidden: z.boolean().default(false),
});

export type Citation = z.infer<typeof citationSchema>;

/**
 * Resolver-side alias normalization. Uppercases, collapses runs of
 * whitespace, trims. Phase 1 keeps this conservative. The Phase 2 resolver
 * composes this with section-suffix stripping for raw author input.
 *
 * Mirror in scripts/citations-validate.mjs. Keep the two in lockstep.
 */
export function normalizeCitationAlias(input: string): string {
  return input
    .toUpperCase()
    .replace(
      /\b(VOL|VOLS|CH|CHAP|CHAPTER|SEC|SECT|SECTION|PAR|PARA|PARAGRAPH|ENCL|ENCLOSURE|APP|APPENDIX|ART|ARTICLE)\./g,
      "$1 "
    )
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Cross-collection check. Two citation records claiming the same alias make
 * the resolver ambiguous and silently break URL fixes. The sync pipeline
 * runs this after parsing every citation file. A duplicate throws and fails
 * the build.
 */
export function assertUniqueCitationAliases(
  items: ReadonlyArray<{ id: string; aliases: ReadonlyArray<string> }>
): void {
  const owners = new Map<string, { id: string; raw: string }>();
  for (const item of items) {
    for (const raw of item.aliases) {
      const key = normalizeCitationAlias(raw);
      const prior = owners.get(key);
      if (prior && prior.id !== item.id) {
        throw new Error(
          "Duplicate citation alias " +
            JSON.stringify(raw) +
            " claimed by both " +
            prior.id +
            " and " +
            item.id +
            ". Resolve in content/citations/."
        );
      }
      owners.set(key, { id: item.id, raw });
    }
  }
}
