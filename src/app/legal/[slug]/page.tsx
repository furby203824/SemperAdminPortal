import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/domain/page-header";
import { MetaRow } from "@/components/domain/meta-row";
import { MdxContent } from "@/components/domain/mdx-content";
import { StatusPill } from "@/components/ui/status-pill";
import { getLegal, findBySlug } from "@/lib/content/loader";

export async function generateStaticParams() {
  return getLegal().map((entry) => ({ slug: entry.frontmatter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = findBySlug(getLegal(), slug);
  if (!entry) return { title: "Legal" };
  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.summary,
  };
}

export default async function LegalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = findBySlug(getLegal(), slug);
  if (!entry) notFound();

  const doc = entry.frontmatter;
  const verifiedDate = new Date(doc.lastVerified);
  const now = new Date();
  const monthsOld =
    (now.getTime() - verifiedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  let status: "fresh" | "aging" | "stale" = "fresh";
  if (monthsOld > 24) status = "stale";
  else if (monthsOld > 12) status = "aging";

  const statusLabel =
    status === "fresh"
      ? "Verified"
      : status === "aging"
        ? "Aging"
        : "Stale";

  return (
    <article className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Legal"
        title={doc.title}
        summary={doc.summary}
        tags={<StatusPill status={status} label={statusLabel} />}
      >
        <MetaRow
          items={[
            { label: "Source", value: doc.source.title, mono: false },
            { label: "Last verified", value: doc.lastVerified, mono: true },
          ]}
        />
      </PageHeader>

      <div className="prose prose-invert mt-8">
        <MdxContent source={entry.body} />
      </div>
    </article>
  );
}
