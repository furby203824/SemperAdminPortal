"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { Play, Clock, Search, X } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Pill } from "@/components/ui/pill";
import { RoleChip } from "@/components/domain/role-chip";
import { LastVerified } from "@/components/domain/last-verified";
import type { Role } from "@/lib/roles";

interface VideoData {
  slug: string;
  title: string;
  summary: string;
  roles: Role[];
  durationSeconds: number;
  lastVerified: string;
  videoUrl?: string;
  youtubeUrl?: string;
  mceleUrl?: string;
  posterUrl?: string;
  source: { title: string; publisher?: string; url?: string };
}

function resolveMceleUrl(v: VideoData): string | undefined {
  if (v.mceleUrl) return v.mceleUrl;
  if (v.videoUrl && v.videoUrl.includes("mcele")) return v.videoUrl;
  return undefined;
}

function fmt(s: number): string {
  if (!s || isNaN(s)) return "--:--";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function YouTubeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function MarineNetIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function PlatformButtons({ youtubeUrl, mceleUrl }: { youtubeUrl?: string | null; mceleUrl?: string | null }) {
  if (!youtubeUrl && !mceleUrl) return null;
  return (
    <div className="flex gap-1.5 flex-wrap">
      {youtubeUrl && (
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 min-w-[108px] items-center justify-center gap-1.5 rounded-[var(--radius-button)] border border-[color-mix(in_srgb,#dc2626_35%,transparent)] bg-[color-mix(in_srgb,#dc2626_10%,transparent)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#f87171] transition-colors duration-[120ms] ease-out hover:bg-[#dc2626] hover:text-white hover:border-[#dc2626]"
        >
          <YouTubeIcon /> YouTube
        </a>
      )}
      {mceleUrl && (
        <a
          href={mceleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 min-w-[108px] items-center justify-center gap-1.5 rounded-[var(--radius-button)] border border-[color-mix(in_srgb,var(--color-brass)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-brass)_10%,transparent)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-brass-700)] dark:text-[var(--color-brass-300)] transition-colors duration-[120ms] ease-out hover:bg-[var(--color-brass-700)] hover:text-white hover:border-[var(--color-brass-700)]"
        >
          <MarineNetIcon /> MarineNet
        </a>
      )}
    </div>
  );
}

function VideoCard({ v }: { v: VideoData }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-1)] transition-[transform,box-shadow,border-color] duration-[120ms] ease-out motion-safe:hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--color-usmc-scarlet)]/40 hover:[border-left-color:var(--color-usmc-scarlet)] [border-left:3px_solid_transparent]">

      {/* Ambient bloom on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] opacity-0 transition-opacity duration-[180ms] group-hover:opacity-100 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--color-usmc-scarlet)_8%,transparent)_0%,transparent_70%)]" />

      {/* Thumbnail zone */}
      <div className="relative flex h-24 shrink-0 items-center justify-center bg-[var(--color-surface-sunken)] overflow-hidden">
        {v.posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.posterUrl}
            alt=""
            width={400}
            height={96}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
        )}

        {!v.posterUrl && (
          <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(var(--color-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--color-foreground)_1px,transparent_1px)] [background-size:24px_24px]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-sunken)]/80 via-transparent to-transparent" />

        {/* Play button */}
        <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-usmc-scarlet)] shadow-[0_2px_12px_color-mix(in_srgb,var(--color-usmc-scarlet)_45%,transparent)] transition-[transform,background] duration-[120ms] ease-out motion-safe:group-hover:scale-110 group-hover:bg-[color-mix(in_srgb,var(--color-usmc-scarlet)_85%,#000)]">
          <Play className="size-4 fill-white text-white ml-0.5" />
        </div>

        {/* Duration — bottom left */}
        <Pill
          variant="neutral"
          size="xs"
          className="absolute bottom-2 left-2.5 font-mono tabular-nums"
        >
          <Clock className="size-3" aria-hidden="true" />
          {fmt(v.durationSeconds)}
        </Pill>

        {/* Verified — top right */}
        <LastVerified
          date={v.lastVerified}
          className="absolute top-2 right-2.5 text-[11px]"
        />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 px-4 pt-3 pb-0">
        {/* Series label */}
        {v.source?.title && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brass-700)] dark:text-[var(--color-brass-300)] truncate">
            {v.source.title}
          </p>
        )}

        {/* Title — plain text, not a link */}
        <p className="text-[14px] font-bold leading-snug text-[var(--color-foreground)]">
          {v.title}
        </p>

        {/* Role chips */}
        <div className="flex flex-wrap gap-1">
          {v.roles.map((r) => <RoleChip key={r} role={r} size="sm" />)}
        </div>
      </div>

      {/* Footer — platform buttons only */}
      <div className="mt-auto flex flex-col gap-2 border-t border-[var(--color-border)] mx-4 mb-3.5 pt-2.5 mt-3">
        <PlatformButtons youtubeUrl={v.youtubeUrl} mceleUrl={resolveMceleUrl(v)} />
      </div>
    </div>
  );
}

// 3-column virtual grid — renders only visible rows
const COLS = 3; // matches xl:grid-cols-3

function VirtualVideoGrid({ items }: { items: VideoData[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  // chunk items into rows of COLS
  const rows = useMemo(() => {
    const result: VideoData[][] = [];
    for (let i = 0; i < items.length; i += COLS) {
      result.push(items.slice(i, i + COLS));
    }
    return result;
  }, [items]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320, // approx card height + gap
    overscan: 3,
  });

  return (
    <div
      ref={parentRef}
      style={{ height: "calc(100vh - 180px)", overflowY: "auto" }}
      className="pr-1"
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {virtualizer.getVirtualItems().map((vRow) => (
          <div
            key={vRow.key}
            style={{
              position: "absolute",
              top: vRow.start,
              left: 0,
              right: 0,
              height: vRow.size,
            }}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 pb-4">
              {(rows[vRow.index] ?? []).map((v) => (
                <VideoCard key={v.slug} v={v} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VideosIndex() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rawItems = require("@/generated/videos.json") as VideoData[];
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const thumbMap = require("@/generated/thumbnails.json") as Record<string, string>;

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const allItems = rawItems.map((v) => ({
    ...v,
    posterUrl: v.posterUrl || (thumbMap[v.slug] ? `${basePath}${thumbMap[v.slug]}` : undefined),
  }));
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter((v) => v.title.toLowerCase().includes(q));
  }, [allItems, query]);

  const clearQuery = useCallback(() => setQuery(""), []);

  return (
    <div className="flex flex-col gap-0" style={{ height: "calc(100vh - 64px)" }}>
      <header className="mb-4 shrink-0">
        <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Videos
        </h1>
        <p className="text-[var(--color-muted-foreground)]">
          Walkthroughs with chapters and transcripts. Click any title for the full player.
        </p>
      </header>

      {/* Search bar */}
      <div className="relative mb-4 shrink-0">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-muted-foreground)]"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos…"
          aria-label="Search videos by title"
          className="w-full rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-surface-1)] py-2.5 pl-9 pr-9 text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-usmc-scarlet)] focus:outline-none focus:ring-1 focus:ring-[var(--color-usmc-scarlet)]"
        />
        {query && (
          <button
            onClick={clearQuery}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="mb-3 shrink-0 text-[12px] text-[var(--color-muted-foreground)] tabular-nums">
        {filtered.length === allItems.length
          ? `${allItems.length} videos`
          : `${filtered.length} of ${allItems.length} videos`}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-[var(--color-muted-foreground)]">
          <p className="text-[15px] font-semibold">No videos match &ldquo;{query}&rdquo;</p>
          <button onClick={clearQuery} className="text-[13px] text-[var(--color-primary)] underline underline-offset-2">
            Clear search
          </button>
        </div>
      ) : (
        <VirtualVideoGrid items={filtered} />
      )}
    </div>
  );
}
