"""
sync-videos.py  --  Vanguard DB → content/videos/ MDX

Reads E:\\Videos\\Video Database\\Video Database\\data\\vanguard.db
Writes one MDX per asset that has a MarineNet URL.
Existing files are updated in place. Files not in the DB are left alone.

Usage:
    python scripts/sync-videos.py
    python scripts/sync-videos.py --dry-run
    python scripts/sync-videos.py --db "C:\\path\\to\\vanguard.db"
"""

import argparse
import os
import re
import sqlite3
import sys
from datetime import date
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

# Resolve DB path from env var first, then fall back to the developer default.
# Set VANGUARD_DB=/path/to/vanguard.db in CI/CD or shell profile.
_env_db = os.environ.get("VANGUARD_DB")
DEFAULT_DB = Path(_env_db) if _env_db else Path(r"E:\Videos\Video Database\Video Database\data\vanguard.db")
VIDEOS_DIR = Path(__file__).parent.parent / "content" / "videos"

AUDIENCE_TO_ROLES: dict[str | None, list[str]] = {
    "Admin": ["admin"],
    "All Marines": ["marine", "leader", "commander", "admin"],
    "Leaders": ["leader", "commander"],
    None: ["admin"],
    "": ["admin"],
    "None": ["admin"],
}

TODAY = date.today().isoformat()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def roles_to_yaml(roles: list[str]) -> str:
    return "[" + ", ".join(f'"{r}"' for r in roles) + "]"


def escape_yaml_string(text: str) -> str:
    """Double-quote a YAML string, escaping internal double-quotes."""
    text = text.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{text}"'


def build_mdx(row: dict) -> str:
    title = (row["Title"] or "").strip()
    video_title = (row.get("Video Title") or "").strip()
    audience = (row.get("Audience") or "").strip() or None
    series = (row.get("Series") or "").strip() or "Semper Admin Portal"
    marinenet_url = (row.get("MarineNet URL") or "").strip()
    upload_date = (row.get("Upload Date") or "").strip()

    slug = slugify(title)
    summary = video_title if video_title else title
    if len(summary) < 10:
        summary = f"Training video: {title}"

    roles = AUDIENCE_TO_ROLES.get(audience, AUDIENCE_TO_ROLES[None])
    last_verified = upload_date[:10] if upload_date and len(upload_date) >= 10 else TODAY

    lines = [
        "---",
        f"title: {escape_yaml_string(title)}",
        f"slug: {escape_yaml_string(slug)}",
        f"summary: {escape_yaml_string(summary[:160])}",
        f"roles: {roles_to_yaml(roles)}",
        f"lastVerified: {escape_yaml_string(last_verified)}",
        f"videoUrl: {escape_yaml_string(marinenet_url)}",
        "source:",
        f"  title: {escape_yaml_string(series)}",
        '  publisher: "Vanguard / MarineNet"',
        "---",
        "",
        f"## {title}",
        "",
        f"{summary}",
        "",
    ]
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Sync Vanguard DB → content/videos/")
    parser.add_argument("--db", default=str(DEFAULT_DB), help="Path to vanguard.db")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without writing")
    args = parser.parse_args()

    db_path = Path(args.db)
    if not db_path.exists():
        print(f"ERROR: DB not found at {db_path}", file=sys.stderr)
        sys.exit(1)

    VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    cur = con.cursor()

    cur.execute(
        """
        SELECT
            _id,
            Title,
            "Video Title",
            Audience,
            Series,
            "MarineNet URL",
            "Upload Date",
            Status,
            Comments
        FROM assets
        WHERE "MarineNet URL" IS NOT NULL
          AND trim("MarineNet URL") != ''
        ORDER BY Title
        """
    )
    rows = cur.fetchall()
    con.close()

    print(f"Found {len(rows)} assets with MarineNet URLs.")

    created = updated = skipped = 0

    for row in rows:
        row_dict = dict(row)
        title = (row_dict.get("Title") or "").strip()
        if not title:
            print(f"  SKIP _id={row_dict['_id']}: no title")
            skipped += 1
            continue

        slug = slugify(title)
        if not slug:
            print(f"  SKIP _id={row_dict['_id']}: empty slug after slugify")
            skipped += 1
            continue

        out_path = VIDEOS_DIR / f"{slug}.mdx"
        content = build_mdx(row_dict)

        if out_path.exists():
            existing = out_path.read_text(encoding="utf-8")
            if existing == content:
                skipped += 1
                continue
            action = "UPDATE"
            updated += 1
        else:
            action = "CREATE"
            created += 1

        print(f"  {action}: {out_path.name}")
        if not args.dry_run:
            out_path.write_text(content, encoding="utf-8")

    print(f"\nDone. created={created} updated={updated} skipped={skipped}")
    if args.dry_run:
        print("Dry-run: no files written.")


if __name__ == "__main__":
    main()
