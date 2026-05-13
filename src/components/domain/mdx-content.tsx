import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { cn } from "@/lib/utils";
import { Callout } from "./callout";
import { Citation } from "./citation";
import { IPACRoutingCallout } from "./ipac-routing-callout";
import { IPACvsUnitDecisionMatrix } from "./ipac-vs-unit-decision-matrix";

/**
 * MdxContent - v1.3.
 * Server Component MDX renderer.
 * Components map exposes Callout, Citation, IPACRoutingCallout, and
 * IPACvsUnitDecisionMatrix to MDX authors.
 *
 * Usage in MDX:
 *   <Callout variant="warning">Verify against MCO before action.</Callout>
 *   Inline citation<Citation source="MCO 1900.16" />
 *   <IPACRoutingCallout billet="ipac-inbound-counselor">
 *     IPAC processes the join transaction.
 *   </IPACRoutingCallout>
 *   <IPACvsUnitDecisionMatrix rows={[
 *     { unit: "Stage join package", ipac: "Run MCTFS join transaction" },
 *   ]} />
 */
const components = {
  Callout,
  Citation,
  IPACRoutingCallout,
  IPACvsUnitDecisionMatrix,
};

export async function MdxContent({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "max-w-none",
        // Headings
        "[&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight",
        "[&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:tracking-wide [&_h2]:scroll-mt-24",
        "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:tracking-tight [&_h3]:scroll-mt-24",
        // Body
        "[&_p]:my-3 [&_p]:text-md [&_p]:leading-relaxed",
        // Lists
        "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:marker:text-[var(--color-usmc-scarlet)]",
        "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:my-1 [&_li]:text-md",
        // Inline
        "[&_a]:text-[var(--color-usmc-scarlet)] [&_a]:underline-offset-2 hover:[&_a]:underline",
        "[&_strong]:font-bold",
        "[&_code]:rounded [&_code]:bg-[var(--color-surface-2)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-[var(--radius-sm)] [&_pre]:border [&_pre]:border-[var(--color-border)] [&_pre]:bg-[var(--color-surface-2)] [&_pre]:p-4 [&_pre]:my-4",
        // Tables
        "[&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
        "[&_th]:border [&_th]:border-[var(--color-border)] [&_th]:bg-[var(--color-surface-2)] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-[var(--color-subtle-foreground)]",
        "[&_td]:border [&_td]:border-[var(--color-border)] [&_td]:px-3 [&_td]:py-2",
        // Blockquote
        "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--color-usmc-scarlet)] [&_blockquote]:bg-[var(--color-surface-2)] [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:italic [&_blockquote]:text-[var(--color-muted-foreground)]",
        className
      )}
    >
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        }}
      />
    </article>
  );
}
