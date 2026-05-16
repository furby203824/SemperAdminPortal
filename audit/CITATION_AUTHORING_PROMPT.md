# Citation Body Authoring Prompt - Semper Admin Portal

Paste this prompt into a fresh session. The session continues the work of replacing the auto-import scaffold body on Semper Admin Portal citation pages with hand-authored bodies mirroring the gold-standard pattern.

## 1. Mission

Replace the one-line `Imported by scripts/citations-import.py` stub body on citation MDX files under `content/citations/` with full hand-authored bodies. The frontmatter is already correct. The external URL already resolves. The body is the only remaining piece of work.

Why this matters: citation pages render at `/citations/<id>` and surface to users when they click a citation chip without an external URL, or when they browse the citation index. The current stub reads "Imported by scripts/citations-import.py. Cited by N pages in the portal. Review the metadata, expand aliases, and set the roles before merging this entry into content/citations/." This shows up on heavily-referenced pages and undercuts trust.

## 2. Where to find things

- Repo root (Windows): `D:\Coding\SemperAdminPortal`
- Repo root (Linux bash mount): `/sessions/<session-id>/mnt/SemperAdminPortal/`
- Citations directory: `content/citations/*.mdx` (308 files). Excludes the `_stubs/` subdirectory.
- Policy PDF archive (Stephen's local): `E:\Policies`. Browse here for the source PDF before authoring.
- Working sync script: `scripts/sync-content.mjs`. WARNING - HEAD ships a truncated WIP. Every run crashes. Restore the working version from commit `94479ed` before running. See Section 7.
- Gold-standard reference body: `content/citations/mco-3504-2a.mdx`. Read this first. It is the pattern to mirror.
- Audit artifacts: `audit/citation-import-marker-audit.md` (the full marker list and recommendations), `audit/citation-import-marker-audit.json` (machine-readable per-entry list), `audit/FIX_REPORT.md` (history of what is done).
- Generated registry: `src/generated/citations.json`. After every sync, this reflects the current state. Use it to confirm an authored entry is live.
- Schema: `src/lib/content/schemas.ts`. The `citationSchema` and the `assertUniqueCitationAliases` function are authoritative.

## 3. What right looks like

Read `content/citations/mco-3504-2a.mdx` for the gold standard. Read `content/citations/mco-5210-11f.mdx` and `content/citations/mco-1500-60a.mdx` for two more examples in the same pattern.

Section structure for an MCO, NAVMC, SECNAV, DODI, or OPNAVINST citation body:

1. `## Scope`. One paragraph. What the document governs. The Marine Corps angle.
2. `## Audience`. Bulleted list of roles and billets reaching for the document, with their responsibilities.
3. `## Enclosure and chapter map` or `## Chapter map` or `## Enclosure map`. Bulleted list mapping each enclosure or chapter to its topic.
4. `## Connection to higher policy`. Bulleted list of DOD, SECNAV, OPNAV, OMB, USC, and CFR parents.
5. `## Connection to Marine Corps doctrine and lower policy`. Bulleted list of MCOs, NAVMCs, MCWPs, IGMC functional areas the document interacts with.
6. Optional intermediate sections when the document warrants it: Forms and systems, Timing rules, Required reports, Lifecycle and disposition, Implementation venues, Reporting and recording, What stays out, Prohibited uses, Warm handoff process, etc. Use the source content to decide which add value.
7. `## Status`. One paragraph. Signed date in ISO format (YYYY-MM-DD), cancellation chain, sponsor, applicability, and any pending revision flags.

Section structure for a MARADMIN (shorter shape):

1. `## Scope`. One paragraph stating the action and effective date.
2. `## Audience`. Bulleted list of who acts on it.
3. Action language sections. The substantive content lifted from the message. For example, OSTC regional routing tables, V/C/R device citation language, fitness report schedule changes.
4. `## Connection to higher policy`. Authority chain (NDAA, EO, DOD).
5. `## Connection to Marine Corps doctrine`. Sibling MARADMINs, parent MCOs.
6. `## Status`. DTG, releasing authority, supersession.

Frontmatter rules (already in place on every file, do not break them):

- `id` must match the filename (without `.mdx`).
- `aliases` must include the document number in every form a Marine would type: `MCO 1500.60A`, `MCO P1500.60A`, the short title.
- Add aliases for back-compat when renumbering. The old number stays as an alias on the new file.
- `roles` array, minimum one. Use the four-role schema: marine, leader, commander, admin.
- `lastVerified` set to today in ISO format.
- `effectiveDate` set from the source PDF in ISO format.
- `externalUrl` already populated, leave it.
- `supersedes` is an array of cancelled order numbers.

## 4. Writing rules (hard, non-negotiable)

These rules apply to every word you write. The user, Stephen, treats violations as build-breaking. Audit-tool scans flag every hit.

### 4.1 Banned characters in prose

- em-dash (`—`, U+2014). Never.
- en-dash (`–`, U+2013). Never.
- semicolon (`;`). Never inside prose. Allowed inside code fences and JSON values, never in body prose.
- asterisk in prose. Allowed only as a markdown list marker at line start (`- ` is preferred, `* ` is acceptable) or as paired bold delimiters (`**text**`). Never as a standalone character in prose.

### 4.2 Banned words

Case-insensitive whole-word match, plus inflections (-s, -d, -ed, -ing, -er, -es). The full list:

`can`, `may`, `just`, `that`, `actually`, `probably`, `basically`, `could`, `esteemed`, `shed light`, `crack`, `enable`, `unlock`, `discover`, `rocket`, `revolutionize`, `disruptive`, `illuminate`, `unveil`, `paradigm`, `realm`, `however`, `remarkable`, `stark`, `testament`, `skyrocketing`.

Common substitution patterns:

- `may` -> `might` (modality) or rephrase to a directive
- `may` as the month name -> use ISO date (`2024-05-13` instead of `13 May 2024`)
- `can` / `cannot` -> rephrase imperatively. `Members cannot do X` -> `Members are barred from X`
- `that` (relativizer) -> drop it. `the rule that applies` -> `the rule applies`
- `that` (demonstrative) -> use the specific noun. `that document` -> `the document`
- `could` -> `would` or rephrase
- `just`, `actually`, `basically` -> drop entirely
- `probably` -> `likely`
- `however` -> `but` or `though`
- `enable` -> `allow` or `let`. Watch for trapped uses inside proper nouns (example: the legacy WESS web safety system). Rewrite the phrase to drop the banned token.
- `discover` -> `find` or `identify`
- `unlock` -> `open` or `release`

### 4.3 Voice rules

- Active voice only.
- First sentence delivers the core point. Skip greetings, affirmations, intros.
- No filler. No "in conclusion". No "overall". No "it is important to note".
- Marine SME tone. Direct. Procedural. No fluff.
- Use "you" and "your" when addressing the reader.

### 4.4 Verify before moving on

Run this Python check against every authored body. CLEAN means zero hits. NOT CLEAN means rewrite before sync.

```python
import re
text = open(path).read()
end = text.find('\n---\n', 4)
body = text[end+5:]
prose = re.sub(r'```[\s\S]*?```', '', body)
prose = re.sub(r'`[^`]*`', '', prose)
banned = ['can','may','just','that','actually','probably','basically','could',
          'esteemed','crack','enable','unlock','discover','rocket','revolutionize',
          'disruptive','illuminate','unveil','paradigm','realm','however','remarkable',
          'stark','testament','skyrocketing']
hits = {}
for w in banned:
    pat = re.compile(r'\b' + w + r'(?:s|d|ed|ing|er|es)?\b', re.I)
    m = pat.findall(prose)
    if m: hits[w] = len(m)
em = prose.count('—'); en = prose.count('–'); semi = prose.count(';')
prose_nb = re.sub(r'\*\*([^*]+)\*\*', r'\1', prose)
prose_nb = re.sub(r'\*([^*]+)\*', r'\1', prose_nb)
ast = prose_nb.count('*')
print(f'hits={hits} em={em} en={en} semi={semi} ast={ast}')
print('CLEAN' if not hits and em+en+semi+ast==0 else 'NOT CLEAN')
```

## 5. Common pitfalls (issues a prior session hit and overcame)

These are the failure modes from real authoring sessions. Avoid them.

### 5.1 The Write tool silently truncates

The Write tool dropped 90 percent of a 6 KB body during one save, leaving the file at byte 565 with the YAML stream cut off mid-array (`roles: ["m`). The file passed the NUL check (no NULs were inserted, the content was simply absent) and the truncation was caught only by the next sync run.

Mitigation: **Use bash heredoc for any citation body authoring**. The pattern:

```bash
cat > content/citations/<id>.mdx <<'MDXEOF'
---
id: "<id>"
aliases:
  - "..."
...frontmatter...
---

## Scope
... body ...
MDXEOF
```

The `'MDXEOF'` single-quoted delimiter prevents shell interpolation. Heredoc has shipped every multi-section body in this session without truncation.

### 5.2 Edit tool occasionally leaves trailing NUL bytes

Some Edit tool runs leave hundreds to thousands of NUL bytes at end of file. The TypeScript compiler errors with "Invalid character" at the column number matching the NUL count.

Mitigation: **After every Edit tool call on an MDX file, strip NULs**:

```python
data = open(path, 'rb').read()
if b'\x00' in data:
    open(path, 'wb').write(data.replace(b'\x00', b'').rstrip() + b'\n')
```

### 5.3 The month name `May` still trips the banned-word scan

`13 May 2024` looks like a date but the scanner does not know context. The hit counts.

Mitigation: **Use ISO format for every date in prose**: `2024-05-13`. The slash form `2024/05/13` also passes. Keep month names out of prose entirely.

### 5.4 Proper nouns trap banned words

Proper nouns like the legacy `Web-Enabled Safety System (WESS)` contain banned tokens. The scanner does not distinguish proper nouns from prose.

Mitigation: **Rewrite to avoid the banned token even in proper-noun references**. The WESS proper-noun example becomes `the legacy WESS web safety system`.

### 5.5 Semicolons sneak in via reference paragraph citations

`Enclosure 1, Chapter 3, paragraph 5.c.(3); Enclosure 1, Chapter 4, paragraph 4.a.(4)` is natural but the semicolon is banned.

Mitigation: **Use commas with full structural words**: `Enclosure 1 Chapter 3 paragraph 5.c.(3), Enclosure 1 Chapter 4 paragraph 4.a.(4)`.

### 5.6 Renumber requires alias preservation and stub handling

When the canonical document number differs from the registry filename (example: registry has `mco-5210-11.mdx` but the current revision is `MCO 5210.11F`), the right move is:

1. Rename the file: `mv content/citations/mco-5210-11.mdx content/citations/mco-5210-11f.mdx`
2. Update the `id` field inside the file to match the new filename.
3. Add the new canonical alias plus the old back-compat alias: `"MCO 5210.11F"`, `"MCO 5210.11"`, `"MCO P5210.11"`, `"MCO P5210.11F"`.
4. Run sync. The alias map merges every form to the new id.

If a redundant bare stub exists under the old id (the `mco-5210-11.mdx` was both there as a stub AND the new revision needed authoring), the sync throws `Duplicate citation alias` once both files claim the same alias. Resolution: delete the bare stub. File deletion in the Cowork sandbox needs `mcp__cowork__allow_cowork_file_delete` first.

Optional: re-create the deleted bare-stub URL as a hidden redirect page so cached bookmarks do not 404. See `content/citations/mco-5210-11.mdx` for the pattern (hidden true, unique alias `"MCO 5210.11 (legacy redirect)"`, body redirects to the F revision).

### 5.7 Schema validates alias uniqueness across the entire collection

Two citation files claiming the same alias (after normalization: uppercase, expand VOL./CH./SEC./etc, collapse whitespace) crashes the sync with `Error: Duplicate citation alias`. The validator is in `scripts/citations-validate.mjs`.

Mitigation: before adding an alias, grep the existing files. `grep -rn '"MCO 5210.11"' content/citations/`. Resolve duplicates before sync.

### 5.8 The sync script in HEAD is broken WIP

`scripts/sync-content.mjs` at HEAD is a 265-line truncated WIP. Every run throws `SyntaxError: Unexpected end of input`. The working 276-line version lives at git commit `94479ed`. The WIP backup persists at `scripts/.sync-content.wip.bak`.

Mitigation: see Section 7.

### 5.9 Dev server caches stale catalogs

Next.js dev mode reads `src/generated/citations.json` at startup. A sync run updates the file on disk but the running server holds the old data. Citation pages will not show new bodies until restart.

Mitigation: Tell Stephen to Ctrl+C and `npm run dev` after each round of authoring.

## 6. Verification rhythm per body

After every body is written, run this loop before moving to the next:

1. **YAML parse**. Confirm the frontmatter loads without error.
2. **Banned-word and banned-character scan** (Section 4.4).
3. **NUL byte strip** (Section 5.2).
4. **Sync run**. `node scripts/sync-content.mjs`. Confirm `citations: 308 entries` (or whatever the current count) and no errors thrown.
5. **Alias resolution check**. `python3 -c "import json; r=json.load(open('src/generated/citations.json')); print(r['byAlias'].get('YOUR ALIAS'))"`. Should return the file's id.

All five must pass. Do not start the next body until the current one is clean.

## 7. Sync script repair

The HEAD `scripts/sync-content.mjs` is truncated. Before any sync:

```bash
cd /path/to/SemperAdminPortal
git show 94479ed:scripts/sync-content.mjs > scripts/sync-content.mjs
wc -l scripts/sync-content.mjs   # Expect 276
node scripts/sync-content.mjs
```

After sync, if Stephen wants to preserve his WIP, restore from the backup:

```bash
cp scripts/.sync-content.wip.bak scripts/sync-content.mjs
```

Or do not restore. The WIP backup persists. The working version is what production builds need.

## 8. Remaining work

As of the last session:

- 308 total citations in the registry.
- 142 hand-authored bodies.
- 166 marker entries remaining.
- Coverage at 80.0 percent (5552 of 6942 references resolve).

### Priority order

Author bodies in descending reference count. The reference count per entry is in `audit/citation-import-marker-audit.json`. Pull the top of the list with:

```python
import json
data = json.load(open('audit/citation-import-marker-audit.json'))
for e in data['entries'][:30]:
    print(f"{e['ref_count']:4d} | {e['cid']:<30} | {e['title']}")
```

### MARADMIN strategy

The remaining queue has 78 MARADMIN entries. MARADMINs are typically 1-3 page point-in-time directives. Use the shorter MARADMIN shape from Section 3 rather than the full MCO shape. Many do not need an Enclosure map at all.

### Renumber decisions

When a PDF carries a revision letter the registry filename does not reflect, default to renumber (Section 5.6). Stephen explicitly authorized renumber for `mco-1740-13` to `mco-1740-13d`. Apply the same pattern to other revision-letter mismatches unless told otherwise.

## 9. Active queue (uploaded but not yet authored)

Stephen has staged the following PDFs in `E:\Policies` (or uploaded directly to the session uploads directory). Author in this order:

1. `MCBul 5210 DTD 29 AUG 2025` -> `content/citations/mcbul-5210.mdx`. 9 refs.
2. `MCO 1740.13D` -> renumber `content/citations/mco-1740-13.mdx` to `content/citations/mco-1740-13d.mdx`. 6 refs. Family Care Plans.
3. `MCO 4400.201 w/CH-3` -> `content/citations/mco-4400-201.mdx`. 6 refs. Property Management.
4. `MCO 5300.17A w/Admin CH-2` -> `content/citations/mco-5300-17.mdx`. 6 refs. Substance Abuse Program. **Ask Stephen whether to renumber to `mco-5300-17a.mdx`** before authoring.
5. `MCO 6110.3A w/Admin CH-4` -> `content/citations/mco-6110-3a.mdx`. 6 refs. Body Composition and Military Appearance.

After this queue, the next high-leverage targets (uploaded PDFs not yet ready):

- `mco-1700-31` Transition Readiness Program. 6 refs.
- `maradmin-308-23` Revision of MCO 1610.7 PES. 6 refs. (Use MARADMIN shape.)
- `maradmin-359-25` Unsubmitted Defense Travel Guidance. 6 refs.
- `maradmin-527-25` FY26 Enlisted Retention Campaign. 6 refs.
- `maradmin-661-19` Manpower Audit Advisory 1-19. 6 refs.
- `maradmin-066-26`, `maradmin-412-20`, `maradmin-468-23`, `maradmin-573-24`, `maradmin-575-24`, `maradmin-595-24`. 5 refs each.

## 10. Definition of done per body

A citation body is done when all of these hold:

- Body sections follow the pattern in Section 3.
- Writing constraints pass clean (Section 4.4 returns CLEAN).
- Zero NUL bytes in the file.
- Sync runs without error.
- Alias resolution returns the correct id for every alias declared on the file.
- The page renders in the Stephen's dev server (he restarts after each round, see Section 5.9).

## 11. How to start the session

The first three actions a fresh session should take:

1. Read `content/citations/mco-3504-2a.mdx` (gold standard).
2. Read `audit/citation-import-marker-audit.md` (full list and recommendations).
3. Confirm the sync script works (Section 7). Then ask Stephen which PDF in the queue to author first.

## 12. Stephen preferences

Stephen runs an active-voice, no-validation, marine SME tone. Lead with the answer or the most critical issue. Skip greetings and affirmations. He pushes back on missing logic and rewards earned agreement. He uses Cowork mode and edits live in his dev server. He prefers to upload PDFs directly to the chat when ready for a body. He keeps the policy archive at `E:\Policies` for browsing.

Do not propose architectural changes. Do not replatform. Do not introduce React Router, Vite, or alternate hosting. The redesign shipped 2026-05-04 and the tech foundation is locked. The CLAUDE.md at the repo root carries the full project rules.

