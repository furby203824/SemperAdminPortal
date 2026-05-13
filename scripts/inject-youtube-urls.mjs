/**
 * inject-youtube-urls.mjs
 *
 * Reads E:\Videos\Video Database\Video Database\data\youtube_urls.csv,
 * matches each row to a video MDX file by title, injects youtubeUrl into
 * the frontmatter, and reports unmatched rows.
 *
 * Run: node scripts/inject-youtube-urls.mjs
 * Dry run: node scripts/inject-youtube-urls.mjs --dry-run
 */

import fs from "fs";
import path from "path";

const CSV_PATH = "E:\\Videos\\Video Database\\Video Database\\data\\youtube_urls.csv";
const VIDEOS_DIR = path.resolve("content/videos");
const VIDEOS_JSON = path.resolve("src/generated/videos.json");
const DRY_RUN = process.argv.includes("--dry-run");

if (DRY_RUN) console.log("[youtube] DRY RUN — no files will be modified\n");

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Strip "Series: " prefix from CSV title to get the bare video title
function stripSeriesPrefix(csvTitle) {
  const colonIdx = csvTitle.indexOf(": ");
  return colonIdx !== -1 ? csvTitle.slice(colonIdx + 2).trim() : csvTitle.trim();
}

// Parse CSV (title,url,series) — handle quoted fields
function parseCSV(text) {
  const rows = [];
  const lines = text.split(/\r?\n/).slice(1); // skip header
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = line.split(",");
    // url is col 1 (no commas in youtube URLs), series is col 2+
    // title may contain commas — rejoin everything before the https:
    const urlIdx = cols.findIndex((c) => c.trim().startsWith("http"));
    if (urlIdx === -1) continue;
    const title = cols.slice(0, urlIdx).join(",").trim();
    const url = cols[urlIdx].trim();
    const series = cols.slice(urlIdx + 1).join(",").trim();
    rows.push({ title, url, series });
  }
  return rows;
}

// Build slug→{mdxPath, currentFrontmatter} map from videos dir
function buildVideoIndex() {
  const index = new Map(); // normalizedTitle → { slug, mdxPath, title }
  const videos = JSON.parse(fs.readFileSync(VIDEOS_JSON, "utf8"));
  for (const v of videos) {
    index.set(normalize(v.title), {
      slug: v.slug,
      title: v.title,
      mdxPath: path.join(VIDEOS_DIR, `${v.slug}.mdx`),
    });
  }
  return index;
}

function injectYoutubeUrl(mdxPath, youtubeUrl) {
  const content = fs.readFileSync(mdxPath, "utf8");

  // Already has youtubeUrl — skip
  if (/youtubeUrl\s*:/.test(content)) {
    return "already-set";
  }

  // Insert after videoUrl line, or after last frontmatter field before closing ---
  const updated = content.replace(
    /(videoUrl\s*:.+)/,
    `$1\nyoutubeUrl: "${youtubeUrl}"`
  );

  if (updated === content) {
    // No videoUrl line — insert before closing ---
    const fixed = content.replace(
      /^(---\n[\s\S]*?)(---)/m,
      (_, front, close) => `${front}youtubeUrl: "${youtubeUrl}"\n${close}`
    );
    if (fixed === content) return "inject-failed";
    if (!DRY_RUN) fs.writeFileSync(mdxPath, fixed, "utf8");
    return "injected";
  }

  if (!DRY_RUN) fs.writeFileSync(mdxPath, updated, "utf8");
  return "injected";
}

// ── Main ──────────────────────────────────────────────────────────────────

const csvText = fs.readFileSync(CSV_PATH, "utf8");
const rows = parseCSV(csvText);
const videoIndex = buildVideoIndex();

let injected = 0;
let alreadySet = 0;
let unmatched = 0;
const unmatchedList = [];

for (const row of rows) {
  const bareTitle = stripSeriesPrefix(row.title);
  const normBare = normalize(bareTitle);

  let entry = videoIndex.get(normBare);

  // Fallback: try full CSV title normalized
  if (!entry) {
    entry = videoIndex.get(normalize(row.title));
  }

  // Fallback: partial match (CSV title contains video title or vice versa)
  if (!entry) {
    for (const [normKey, val] of videoIndex) {
      if (normKey.includes(normBare) || normBare.includes(normKey)) {
        entry = val;
        break;
      }
    }
  }

  if (!entry) {
    unmatched++;
    unmatchedList.push({ csvTitle: row.title, bareTitle });
    continue;
  }

  if (!fs.existsSync(entry.mdxPath)) {
    unmatched++;
    unmatchedList.push({ csvTitle: row.title, reason: `MDX not found: ${entry.mdxPath}` });
    continue;
  }

  const result = injectYoutubeUrl(entry.mdxPath, row.url);
  if (result === "injected") injected++;
  else if (result === "already-set") alreadySet++;
  else {
    unmatched++;
    unmatchedList.push({ csvTitle: row.title, reason: "inject-failed" });
  }
}

console.log(`[youtube] injected: ${injected}  already-set: ${alreadySet}  unmatched: ${unmatched}  total: ${rows.length}`);
if (unmatchedList.length > 0) {
  console.log("\n[youtube] unmatched:");
  for (const u of unmatchedList) {
    console.log(`  "${u.csvTitle}"${u.reason ? ` — ${u.reason}` : ""}`);
  }
}
