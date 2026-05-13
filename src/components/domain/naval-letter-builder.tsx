"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileDown, Loader2, Info } from "lucide-react";
import { logAuditEvent } from "@/lib/security/audit-log";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ranks } from "@/lib/directives/ranks";

// Field length limits per DoD document standards.
const NAVAL_LIMITS = {
  ssic: 4,
  originatorCode: 20,
  fromLine: 100,
  toLine: 100,
  subject: 150,
  reference: 200,
  enclosure: 200,
  bodyContent: 2000,
  bodyTitle: 100,
  signatureName: 60,
  signatureBilletTitle: 80,
  maxReferences: 26,
  maxEnclosures: 20,
  maxBodyParagraphs: 20,
} as const;

// SSIC: 1 to 4 digits.
const SSIC_RE = /^\d{1,4}$/;
// Originator code: alphanumeric, hyphens, forward slashes.
const ORIGINATOR_RE = /^[A-Za-z0-9\-/]{1,20}$/;
// Safe text: printable ASCII + CR + LF + tab.
const SAFE_TEXT = /^[\x20-\x7E\r\n\t]*$/;

function validateNavalForm(form: FormState): string | null {
  if (!SSIC_RE.test(form.ssic)) return "SSIC must be 1 to 4 digits.";
  if (!ORIGINATOR_RE.test(form.originatorCode))
    return "Originator code: alphanumeric, hyphens, and forward slashes only (max 20).";
  if (!form.fromLine.trim()) return "From line is required.";
  if (form.fromLine.length > NAVAL_LIMITS.fromLine)
    return `From line exceeds ${NAVAL_LIMITS.fromLine} characters.`;
  if (!form.toLine.trim()) return "To line is required.";
  if (form.toLine.length > NAVAL_LIMITS.toLine)
    return `To line exceeds ${NAVAL_LIMITS.toLine} characters.`;
  if (!form.subject.trim()) return "Subject is required.";
  if (form.subject.length > NAVAL_LIMITS.subject)
    return `Subject exceeds ${NAVAL_LIMITS.subject} characters.`;
  if (form.references.length > NAVAL_LIMITS.maxReferences)
    return `Maximum ${NAVAL_LIMITS.maxReferences} references allowed.`;
  for (const r of form.references) {
    if (r.length > NAVAL_LIMITS.reference) return `A reference exceeds ${NAVAL_LIMITS.reference} characters.`;
    if (r && !SAFE_TEXT.test(r)) return "A reference contains invalid characters.";
  }
  if (form.enclosures.length > NAVAL_LIMITS.maxEnclosures)
    return `Maximum ${NAVAL_LIMITS.maxEnclosures} enclosures allowed.`;
  for (const e of form.enclosures) {
    if (e.length > NAVAL_LIMITS.enclosure) return `An enclosure exceeds ${NAVAL_LIMITS.enclosure} characters.`;
    if (e && !SAFE_TEXT.test(e)) return "An enclosure contains invalid characters.";
  }
  if (form.body.length > NAVAL_LIMITS.maxBodyParagraphs)
    return `Maximum ${NAVAL_LIMITS.maxBodyParagraphs} paragraphs allowed.`;
  for (const b of form.body) {
    if (b.content.length > NAVAL_LIMITS.bodyContent)
      return `A paragraph exceeds ${NAVAL_LIMITS.bodyContent} characters.`;
    if (!SAFE_TEXT.test(b.content)) return "A paragraph contains invalid characters.";
    if (b.title && b.title.length > NAVAL_LIMITS.bodyTitle)
      return `A paragraph title exceeds ${NAVAL_LIMITS.bodyTitle} characters.`;
  }
  if (!form.signatureName.trim()) return "Signature name is required.";
  if (form.signatureName.length > NAVAL_LIMITS.signatureName)
    return `Signature name exceeds ${NAVAL_LIMITS.signatureName} characters.`;
  if (!form.signatureBilletTitle.trim()) return "Billet title is required.";
  if (form.signatureBilletTitle.length > NAVAL_LIMITS.signatureBilletTitle)
    return `Billet title exceeds ${NAVAL_LIMITS.signatureBilletTitle} characters.`;
  if (!form.date) return "Date is required.";
  return null;
}

interface BodyParagraph {
  id: number;
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  title?: string;
  content: string;
}

interface FormState {
  documentType: "basic" | "endorsement";
  letterheadType: "marine-corps" | "navy";
  ssic: string;
  originatorCode: string;
  date: string;
  fromLine: string;
  toLine: string;
  subject: string;
  references: string[];
  enclosures: string[];
  body: BodyParagraph[];
  signatureRank: string;
  signatureName: string;
  signatureBilletTitle: string;
}

const DEFAULTS: FormState = {
  documentType: "basic",
  letterheadType: "marine-corps",
  ssic: "1500",
  originatorCode: "S-1",
  date: new Date().toISOString().slice(0, 10),
  fromLine: "Commanding Officer, Admin Co, HQ Bn",
  toLine: "Distribution List",
  subject: "TRAINING SCHEDULE FOR FOLLOWING MONTH",
  references: ["MCO 1500.55 Marine Corps Training and Education Order"],
  enclosures: ["Training schedule matrix"],
  body: [
    {
      id: 1,
      level: 1,
      content:
        "This letter promulgates the training schedule for the following month per the reference.",
    },
    {
      id: 2,
      level: 1,
      content:
        "Subordinate commands shall execute training on dates listed in the enclosure.",
    },
    {
      id: 3,
      level: 1,
      content: "Direct questions to the originator at the office symbol above.",
    },
  ],
  signatureRank: "Capt",
  signatureName: "J. Q. PUBLIC",
  signatureBilletTitle: "Adjutant",
};

let nextId = 100;

export function NavalLetterBuilder() {
  const [form, setForm] = React.useState<FormState>(DEFAULTS);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setError(null);
    setForm((s) => ({ ...s, [k]: v }));
  };

  const updateRef = (i: number, v: string) =>
    setForm((s) => {
      const refs = [...s.references];
      refs[i] = v;
      return { ...s, references: refs };
    });
  const addRef = () =>
    setForm((s) => ({ ...s, references: [...s.references, ""] }));
  const removeRef = (i: number) =>
    setForm((s) => ({
      ...s,
      references: s.references.filter((_, idx) => idx !== i),
    }));

  const updateEnc = (i: number, v: string) =>
    setForm((s) => {
      const list = [...s.enclosures];
      list[i] = v;
      return { ...s, enclosures: list };
    });
  const addEnc = () =>
    setForm((s) => ({ ...s, enclosures: [...s.enclosures, ""] }));
  const removeEnc = (i: number) =>
    setForm((s) => ({
      ...s,
      enclosures: s.enclosures.filter((_, idx) => idx !== i),
    }));

  const updateBody = (id: number, patch: Partial<BodyParagraph>) =>
    setForm((s) => ({
      ...s,
      body: s.body.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  const addBody = (level: BodyParagraph["level"]) =>
    setForm((s) => ({
      ...s,
      body: [...s.body, { id: ++nextId, level, content: "" }],
    }));
  const removeBody = (id: number) =>
    setForm((s) => ({ ...s, body: s.body.filter((b) => b.id !== id) }));

  const generate = async () => {
    const validErr = validateNavalForm(form);
    if (validErr) {
      setError(validErr);
      return;
    }
    setBusy(true);
    setError(null);
    logAuditEvent("EXPORT_DOCX", "/tools/naval-letter", { documentType: form.documentType, letterheadType: form.letterheadType });
    try {
      const [
        { Document, Packer, Paragraph, TextRun, TabStopType },
        { createFormattedParagraph },
        { DOC_SETTINGS, INDENTS },
      ] = await Promise.all([
        import("docx"),
        import("@/lib/directives/paragraph-formatter"),
        import("@/lib/directives/doc-settings"),
      ]);

      const headerLines: import("docx").Paragraph[] = [];

      // SSIC line, right tab stop date
      headerLines.push(
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: INDENTS.date }],
          children: [
            new TextRun({ text: form.ssic, font: DOC_SETTINGS.font, size: 24 }),
            new TextRun({ text: "\t", font: DOC_SETTINGS.font, size: 24 }),
            new TextRun({
              text: new Date(form.date)
                .toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
                .toUpperCase(),
              font: DOC_SETTINGS.font,
              size: 24,
            }),
          ],
        })
      );
      headerLines.push(
        new Paragraph({
          children: [
            new TextRun({ text: form.originatorCode, font: DOC_SETTINGS.font, size: 24 }),
          ],
        })
      );
      headerLines.push(new Paragraph({ text: "" }));

      // From, To
      headerLines.push(
        new Paragraph({
          children: [
            new TextRun({ text: "From:  ", font: DOC_SETTINGS.font, size: 24 }),
            new TextRun({ text: form.fromLine, font: DOC_SETTINGS.font, size: 24 }),
          ],
        })
      );
      headerLines.push(
        new Paragraph({
          children: [
            new TextRun({ text: "To:    ", font: DOC_SETTINGS.font, size: 24 }),
            new TextRun({ text: form.toLine, font: DOC_SETTINGS.font, size: 24 }),
          ],
        })
      );
      headerLines.push(new Paragraph({ text: "" }));

      // Subject
      headerLines.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Subj:  ", font: DOC_SETTINGS.font, size: 24 }),
            new TextRun({
              text: form.subject.toUpperCase(),
              font: DOC_SETTINGS.font,
              size: 24,
            }),
          ],
        })
      );
      headerLines.push(new Paragraph({ text: "" }));

      // References
      const refs = form.references.filter((r) => r.trim());
      refs.forEach((r, i) => {
        const label = i === 0 ? "Ref:   " : "       ";
        const tag = `(${String.fromCharCode(97 + i)}) `;
        headerLines.push(
          new Paragraph({
            children: [
              new TextRun({ text: label, font: DOC_SETTINGS.font, size: 24 }),
              new TextRun({ text: tag + r, font: DOC_SETTINGS.font, size: 24 }),
            ],
          })
        );
      });
      if (refs.length > 0) headerLines.push(new Paragraph({ text: "" }));

      // Enclosures
      const encs = form.enclosures.filter((r) => r.trim());
      encs.forEach((e, i) => {
        const label = i === 0 ? "Encl:  " : "       ";
        const tag = `(${i + 1}) `;
        headerLines.push(
          new Paragraph({
            children: [
              new TextRun({ text: label, font: DOC_SETTINGS.font, size: 24 }),
              new TextRun({ text: tag + e, font: DOC_SETTINGS.font, size: 24 }),
            ],
          })
        );
      });
      if (encs.length > 0) headerLines.push(new Paragraph({ text: "" }));

      // Body using paragraph-formatter
      const bodyParas = form.body.map((b, i, all) =>
        createFormattedParagraph(
          { id: b.id, level: b.level, content: b.content, title: b.title },
          i,
          all,
          DOC_SETTINGS.font
        )
      );

      // Signature block at 3.25"
      const sigBlock = [
        new Paragraph({ text: "" }),
        new Paragraph({
          indent: { left: INDENTS.signature },
          children: [
            new TextRun({
              text: form.signatureName.toUpperCase(),
              font: DOC_SETTINGS.font,
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          indent: { left: INDENTS.signature },
          children: [
            new TextRun({
              text: form.signatureBilletTitle,
              font: DOC_SETTINGS.font,
              size: 24,
            }),
          ],
        }),
      ];

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: { width: DOC_SETTINGS.pageSize.width, height: DOC_SETTINGS.pageSize.height },
                margin: {
                  top: DOC_SETTINGS.pageMargins.top,
                  bottom: DOC_SETTINGS.pageMargins.bottom,
                  left: DOC_SETTINGS.pageMargins.left,
                  right: DOC_SETTINGS.pageMargins.right,
                },
              },
            },
            children: [...headerLines, ...bodyParas, ...sigBlock],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const { saveAs } = await import("file-saver");
      const filename = `naval-letter-${form.subject
        .replace(/\W+/g, "_")
        .slice(0, 40)}.docx`;
      saveAs(blob, filename);
    } catch (e) {
      setError((e as Error).message);
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert variant="info">
        <Info />
        <AlertTitle>SECNAV M-5216.5 formatting</AlertTitle>
        <AlertDescription>
          The output uses Times New Roman 12pt with naval tab stops, hanging
          indents, and the level-aware citation pattern (1., a., (1), (a), etc.).
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Document setup</CardTitle>
          <CardDescription>Type, letterhead, SSIC, originator code, date.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Document type</Label>
            <Select
              value={form.documentType}
              onValueChange={(v) => update("documentType", v as FormState["documentType"])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic letter</SelectItem>
                <SelectItem value="endorsement">Endorsement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Letterhead</Label>
            <Select
              value={form.letterheadType}
              onValueChange={(v) => update("letterheadType", v as FormState["letterheadType"])}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="marine-corps">Marine Corps</SelectItem>
                <SelectItem value="navy">Navy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>SSIC</Label>
            <Input
              value={form.ssic}
              maxLength={NAVAL_LIMITS.ssic}
              onChange={(e) => update("ssic", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Originator code</Label>
            <Input
              value={form.originatorCode}
              maxLength={NAVAL_LIMITS.originatorCode}
              onChange={(e) => update("originatorCode", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Header</CardTitle>
          <CardDescription>From, To, Subject lines.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>From</Label>
            <Input
              value={form.fromLine}
              maxLength={NAVAL_LIMITS.fromLine}
              onChange={(e) => update("fromLine", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>To</Label>
            <Input
              value={form.toLine}
              maxLength={NAVAL_LIMITS.toLine}
              onChange={(e) => update("toLine", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Subject</Label>
            <Input
              value={form.subject}
              maxLength={NAVAL_LIMITS.subject}
              onChange={(e) => update("subject", e.target.value)}
            />
            <p className="text-xs text-[var(--color-muted-foreground)]">Output uppercases the subject automatically.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>References</CardTitle>
            <Button size="sm" variant="outline" onClick={addRef}><Plus className="size-4" /> Add</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {form.references.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <Badge variant="muted">({String.fromCharCode(97 + i)})</Badge>
              <Input value={r} onChange={(e) => updateRef(i, e.target.value)} />
              <Button size="icon" variant="ghost" onClick={() => removeRef(i)} aria-label={`Remove reference ${i + 1}`}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Enclosures</CardTitle>
            <Button size="sm" variant="outline" onClick={addEnc}><Plus className="size-4" /> Add</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {form.enclosures.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <Badge variant="muted">({i + 1})</Badge>
              <Input value={r} onChange={(e) => updateEnc(i, e.target.value)} />
              <Button size="icon" variant="ghost" onClick={() => removeEnc(i)} aria-label={`Remove enclosure ${i + 1}`}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Body</CardTitle>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((l) => (
                <Button
                  key={l}
                  size="sm"
                  variant="outline"
                  onClick={() => addBody(l as BodyParagraph["level"])}
                >
                  + L{l}
                </Button>
              ))}
            </div>
          </div>
          <CardDescription>
            Levels 1 through 8 follow the SECNAV citation pattern. Level 1 = 1., Level 2 = a., Level 3 = (1), Level 4 = (a). Levels 5 to 8 add underline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.body.map((b) => (
            <div
              key={b.id}
              className="rounded-[var(--radius-button)] border border-[var(--color-border)] p-3"
              style={{ paddingLeft: `${b.level * 12 + 12}px` }}
            >
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary">Level {b.level}</Badge>
                <Input
                  placeholder="Optional title (underlined)"
                  value={b.title ?? ""}
                  onChange={(e) => updateBody(b.id, { title: e.target.value })}
                  className="flex-1"
                />
                <Button size="icon" variant="ghost" onClick={() => removeBody(b.id)} aria-label="Remove paragraph">
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Textarea
                rows={3}
                value={b.content}
                onChange={(e) => updateBody(b.id, { content: e.target.value })}
                placeholder="Paragraph content. Wrap text in <u>...</u> to underline."
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Signature</CardTitle>
          <CardDescription>Block sits at 3.25 inch indent per SECNAV.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label>Rank</Label>
            <Select
              value={form.signatureRank}
              onValueChange={(v) => update("signatureRank", v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ranks.map((r) => (
                  <SelectItem key={r.abbreviation} value={r.abbreviation}>
                    {r.abbreviation} - {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Name (last, initials)</Label>
            <Input
              value={form.signatureName}
              maxLength={NAVAL_LIMITS.signatureName}
              onChange={(e) => update("signatureName", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Billet title</Label>
            <Input
              value={form.signatureBilletTitle}
              maxLength={NAVAL_LIMITS.signatureBilletTitle}
              onChange={(e) => update("signatureBilletTitle", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Generation error</AlertTitle>
          <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button onClick={generate} disabled={busy} size="lg">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
          {busy ? "Building docx..." : "Generate naval letter"}
        </Button>
      </div>
    </div>
  );
}
