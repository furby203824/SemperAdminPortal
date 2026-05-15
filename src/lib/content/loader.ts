import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import {
  policySchema,
  situationSchema,
  snippetSchema,
  videoSchema,
  referenceSchema,
  toolSchema,
  adminSchema,
  legalSchema,
  roleContentSchema,
  inspectionSchema,
  citationSchema,
  INSPECTION_TRACKS,
  type Policy,
  type Situation,
  type Snippet,
  type Video,
  type Reference,
  type Tool,
  type Legal,
  type AdminContent,
  type UnitType,
  type RoleContent,
  type Inspection,
  type InspectionTrack,
  type Citation,
} from "./schemas";

const CONTENT_ROOT = path.join(process.cwd(), "content");

export interface ContentEntry<T> {
  frontmatter: T;
  body: string;
}

function loadDir<T>(
  collection: string,
  schema: z.ZodSchema<T>
): ContentEntry<T>[] {
  const dir = path.join(CONTENT_ROOT, collection);
  if (!fs.existsSync(dir)) return [];
  // Filter to .mdx files only and exclude hidden/dot files (e.g., .trash-* leftovers
  // from soft-deletes, OS metadata files like .DS_Store, etc.).
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith("."));
  const entries: ContentEntry<T>[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const parsed = matter(raw);
    const fmResult = schema.safeParse({
      ...parsed.data,
      slug: parsed.data.slug ?? file.replace(/\.mdx$/, ""),
    });
    if (!fmResult.success) {
      throw new Error(
        "Frontmatter validation failed in " + collection + "/" + file + ":\n" + fmResult.error.toString()
      );
    }
    entries.push({ frontmatter: fmResult.data, body: parsed.content });
  }
  return entries;
}

export const getPolicies = (): ContentEntry<Policy>[] =>
  loadDir("policies", policySchema);
export const getSituations = (): ContentEntry<Situation>[] =>
  loadDir("situations", situationSchema);
export const getSnippets = (): ContentEntry<Snippet>[] =>
  loadDir("snippets", snippetSchema);
export const getVideos = (): ContentEntry<Video>[] =>
  loadDir("videos", videoSchema);
export const getReferences = (): ContentEntry<Reference>[] =>
  loadDir("references", referenceSchema);
export const getTools = (): ContentEntry<Tool>[] =>
  loadDir("tools", toolSchema);
export const getLegal = (): ContentEntry<Legal>[] =>
  loadDir("legal", legalSchema);
export const getAdminContent = (): ContentEntry<AdminContent>[] =>
  loadDir("admin", adminSchema);

export function findBySlug<T extends { slug: string }>(
  list: ContentEntry<T>[],
  slug: string
): ContentEntry<T> | undefined {
  return list.find((e) => e.frontmatter.slug === slug);
}

export function getAdminByUnitAndTopic(
  unitType: UnitType,
  topic: string
): ContentEntry<AdminContent>[] {
  return getAdminContent().filter(
    (e) => e.frontmatter.unitType === unitType && e.frontmatter.topic === topic
  );
}

export function getAdminByUnit(
  unitType: UnitType
): ContentEntry<AdminContent>[] {
  return getAdminContent().filter((e) => e.frontmatter.unitType === unitType);
}

export function findAdminBySlug(
  slug: string
): ContentEntry<AdminContent> | undefined {
  return getAdminContent().find((e) => e.frontmatter.slug === slug);
}

/**
 * Inspection programs live as JSON files under content/inspections/<track>/.
 * Each file is one program. Validated against inspectionSchema at load time.
 */
export function getInspections(): Inspection[] {
  const root = path.join(CONTENT_ROOT, "inspections");
  if (!fs.existsSync(root)) return [];
  const out: Inspection[] = [];
  for (const track of INSPECTION_TRACKS) {
    const dir = path.join(root, track);
    if (!fs.existsSync(dir)) continue;
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json") && !f.startsWith("."));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const parsed = JSON.parse(raw);
      const result = inspectionSchema.safeParse({
        ...parsed,
        track,
        slug: parsed.slug ?? file.replace(/\.json$/, ""),
      });
      if (!result.success) {
        throw new Error(
          "Inspection validation failed in inspections/" +
            track +
            "/" +
            file +
            ":\n" +
            result.error.toString()
        );
      }
      out.push(result.data);
    }
  }
  return out;
}

export function getInspectionsByTrack(track: InspectionTrack): Inspection[] {
  return getInspections().filter((i) => i.track === track);
}

export function findInspection(
  track: InspectionTrack,
  programNumber: string,
  slug: string
): Inspection | undefined {
  return getInspections().find(
    (i) =>
      i.track === track &&
      i.programNumber === programNumber &&
      i.slug === slug
  );
}

export const getMarinesContent = (): ContentEntry<RoleContent>[] =>
  loadDir("marines", roleContentSchema);
export const getCommanderContent = (): ContentEntry<RoleContent>[] =>
  loadDir("commander", roleContentSchema);
export const getLeaderContent = (): ContentEntry<RoleContent>[] =>
  loadDir("leader", roleContentSchema);

/**
 * Returns role content filtered to a topic, sorted in canonical order:
 *   1. Explicit `order` field when every entry in the topic has one
 *   2. Otherwise: Overview-style pages first, then alphabetical by title
 *
 * This is the single source of truth for topic ordering. The marines/[topic],
 * commander/[topic], and leader/[topic] index pages render in this order, and
 * the prev/next-in-topic navigation on each slug page uses this same order to
 * stay consistent.
 *
 * Use the `order` field for sequential topics (e.g., turnover phases) where
 * alphabetical sorting misrepresents the operational flow. Mixed states
 * (some entries with order, others without) fall back to alphabetical to
 * avoid producing a broken half-ordered list.
 */
export function getRoleContentByTopic(
  list: ContentEntry<RoleContent>[],
  topic: string
): ContentEntry<RoleContent>[] {
  const filtered = list.filter((e) => e.frontmatter.topic === topic);
  const allHaveOrder =
    filtered.length > 0 &&
    filtered.every((e) => typeof e.frontmatter.order === "number");
  if (allHaveOrder) {
    return filtered.sort(
      (a, b) =>
        (a.frontmatter.order as number) - (b.frontmatter.order as number)
    );
  }
  return filtered.sort((a, b) => {
    const aFm = a.frontmatter;
    const bFm = b.frontmatter;
    const aOverview =
      aFm.slug.toLowerCase().includes("overview") ||
      aFm.title.toLowerCase().includes("overview");
    const bOverview =
      bFm.slug.toLowerCase().includes("overview") ||
      bFm.title.toLowerCase().includes("overview");
    if (aOverview && !bOverview) return -1;
    if (!aOverview && bOverview) return 1;
    return aFm.title.localeCompare(bFm.title);
  });
}

export function findRoleContentBySlug(
  list: ContentEntry<RoleContent>[],
  slug: string
): ContentEntry<RoleContent> | undefined {
  return list.find((e) => e.frontmatter.slug === slug);
}

/**
 * Lookup that scopes by both topic and slug. Use this on detail pages
 * where the same slug (e.g., "overview") appears under multiple topics.
 */
export function findRoleContentByTopicAndSlug(
  list: ContentEntry<RoleContent>[],
  topic: string,
  slug: string
): ContentEntry<RoleContent> | undefined {
  return list.find(
    (e) => e.frontmatter.topic === topic && e.frontmatter.slug === slug
  );
}

/**
 * Citation registry entries. Each MDX file under content/citations/ is one
 * parent policy or authority document. Validated against citationSchema at
 * load time. Use findCitationById for slug-based lookup. The runtime
 * resolver at src/lib/references/resolve reads the build-time JSON index.
 */
export function getCitations(): ContentEntry<Citation>[] {
  const dir = path.join(CONTENT_ROOT, "citations");
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") && !f.startsWith(".") && !f.startsWith("_"));
  const entries: ContentEntry<Citation>[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const parsed = matter(raw);
    const result = citationSchema.safeParse(parsed.data);
    if (!result.success) {
      throw new Error(
        "Citation validation failed in citations/" +
          file +
          ":\n" +
          result.error.toString()
      );
    }
    entries.push({ frontmatter: result.data, body: parsed.content });
  }
  return entries.sort((a, b) => a.frontmatter.id.localeCompare(b.frontmatter.id));
}

export function findCitationById(
  id: string
): ContentEntry<Citation> | undefined {
  return getCitations().find((e) => e.frontmatter.id === id);
}
