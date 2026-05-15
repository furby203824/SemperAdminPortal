"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { TopNav } from "./top-nav";
import { SideNav } from "./side-nav";
import { Footer } from "./footer";
import { CommandPalette } from "./command-palette";
import { RolePickerDialog } from "./role-picker-dialog";
import { BottomTabs } from "./bottom-tabs";
import { Breadcrumbs } from "./breadcrumbs";
import { RecentsTracker } from "./recents-tracker";
import { RoleRouteSync } from "./role-route-sync";
import { TermsModal } from "./terms-modal";

/**
 * AppShell - v1.2.
 *
 * Layout structure (desktop, lg+):
 *   TopNav (floating pill) > [SideNav | Main] > Footer
 *
 * Layout structure (mobile, < lg):
 *   TopNav (floating pill) > Main > BottomTabs > Footer
 *
 * Breadcrumbs render at the top of Main on every route except home.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [sideNavOpen, setSideNavOpen] = React.useState(false);
  const pathname = usePathname() ?? "/";
  const showBreadcrumbs = pathname !== "/" && pathname !== "";

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isPaletteShortcut =
        (e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey);
      if (isPaletteShortcut) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNav
        onOpenPalette={() => setPaletteOpen(true)}
        onOpenSideNav={() => setSideNavOpen(true)}
      />

      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 gap-6 px-3 sm:px-4 lg:px-6">
        <SideNav open={sideNavOpen} onOpenChange={setSideNavOpen} />

        <main
          id="main"
          tabIndex={-1}
          className="min-w-0 flex-1 px-1 pb-20 pt-6 sm:px-2 lg:pb-10 lg:pt-8"
        >
          {showBreadcrumbs && (
            <Breadcrumbs className="mb-4" />
          )}
          {children}
        </main>
      </div>

      <Footer />
      <BottomTabs onBrowse={() => setSideNavOpen(true)} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <RolePickerDialog />
      <RecentsTracker />
      <RoleRouteSync />
      <TermsModal />
    </div>
  );
}
