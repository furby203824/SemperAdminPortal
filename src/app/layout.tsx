import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppShell } from "@/components/shell/app-shell";
import { CuiBanner } from "@/components/shell/cui-banner";
import "./globals.css";

// Content Security Policy for static export (GitHub Pages cannot set HTTP headers).
// frame-ancestors is not enforceable via meta tag; the JS frame-buster below handles it.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export const metadata: Metadata = {
  title: {
    default: "Semper Admin Portal",
    template: "%s | Semper Admin Portal",
  },
  description:
    "Sourced, role-tagged USMC administrative reference and tools for Marines, leaders, commanders, and admin specialists.",
  metadataBase: new URL("https://semperadmin.github.io/SemperAdminPortal"),
  openGraph: {
    title: "Semper Admin Portal",
    description:
      "Sourced, role-tagged USMC administrative reference and tools.",
    url: "https://semperadmin.github.io/SemperAdminPortal/",
    siteName: "Semper Admin Portal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Semper Admin Portal",
    description:
      "Sourced, role-tagged USMC administrative reference and tools.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1c" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={CSP} />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* Frame-buster loaded from static file: frame-ancestors cannot be set via meta tag on GitHub Pages. */}
        <Script src="/SemperAdminPortal/security/frame-buster.js" strategy="beforeInteractive" />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CuiBanner />
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-[var(--color-accent-yellow)] focus:px-3 focus:py-2 focus:text-[var(--color-neutral-950)]"
          >
            Skip to content
          </a>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
