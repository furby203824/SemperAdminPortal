import Link from "next/link";
import { ExternalLink, Mail, ShieldCheck } from "lucide-react";

const BUILD_DATE = new Date().toISOString().slice(0, 10);
const BUILD_VERSION = "v1.2.0";

/**
 * Footer - v1.2.
 * Three-column layout: brand and disclaimer, build/verification stats, links and contact.
 * Build date and version rendered in mono. Scarlet rule above content for accent.
 */
export function Footer() {
  return (
    <footer
      role="contentinfo"
      className="mt-12 border-t border-[var(--color-border)] bg-[var(--color-bg-elev)]"
    >
      {/* Scarlet accent rule */}
      <div className="h-0.5 w-20 bg-[var(--color-usmc-scarlet)]" aria-hidden="true" />

      <div className="mx-auto grid max-w-screen-2xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* Column 1: brand + disclaimer */}
        <div className="space-y-3">
          <p className="font-display text-lg tracking-wide">SEMPER ADMIN</p>
          <p className="max-w-prose text-sm text-[var(--color-muted-foreground)]">
            Educational reference for the USMC administrative community. Not an
            official Department of the Navy or Marine Corps publication. Always
            verify with the source order before action.
          </p>
        </div>

        {/* Column 2: build + verification posture */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-subtle-foreground)]">
              Build
            </p>
            <p className="mt-1 font-mono text-sm">{BUILD_DATE}</p>
            <p className="font-mono text-xs text-[var(--color-muted-foreground)]">
              {BUILD_VERSION}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-subtle-foreground)]">
              Source posture
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-status-fresh)]">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Verify before action
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Every page links its source order.
            </p>
          </div>
        </div>

        {/* Column 3: links + contact */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-subtle-foreground)]">
              Project
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>
                <Link href="/about" className="hover:underline underline-offset-2">
                  About
                </Link>
              </li>
              <li>
                <Link href="/citations" className="hover:underline underline-offset-2">
                  Citations index
                </Link>
              </li>
              <li>
                <Link href="/styleguide" className="hover:underline underline-offset-2">
                  Style guide
                </Link>
              </li>
              <li>
                <Link href="/legal/disclaimer" className="hover:underline underline-offset-2">
                  Legal
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-subtle-foreground)]">
              Contact
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>
                <Link
                  href="https://github.com/SemperAdmin/SemperAdminPortal"
                  className="inline-flex items-center gap-1.5 hover:underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  GitHub repo
                </Link>
              </li>
              <li>
                <Link
                  href="/about#contact"
                  className="inline-flex items-center gap-1.5 hover:underline underline-offset-2"
                >
                  <Mail className="size-3.5" aria-hidden="true" />
                  Contact maintainers
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-start gap-2 px-4 py-3 text-xs text-[var(--color-subtle-foreground)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Semper Admin. Open-source educational reference.</p>
          <p className="font-mono">Built with care for the administrative community.</p>
        </div>
      </div>
    </footer>
  );
}
