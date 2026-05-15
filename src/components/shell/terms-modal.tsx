"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TERMS_AGREED_KEY = "semper-admin-terms-agreed";

export function TermsModal() {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const hasAgreed = localStorage.getItem(TERMS_AGREED_KEY);
    if (!hasAgreed) {
      setOpen(true);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem(TERMS_AGREED_KEY, "true");
    setOpen(false);
  };

  const handleDecline = () => {
    localStorage.setItem(TERMS_AGREED_KEY, "true");
    setOpen(false);
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Disclaimer and Terms of Use</DialogTitle>
          <DialogDescription>
            Please review our disclaimer and terms before using Semper Admin Portal.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="disclaimer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="disclaimer">Disclaimer</TabsTrigger>
            <TabsTrigger value="terms">Terms of Use</TabsTrigger>
          </TabsList>

          <TabsContent value="disclaimer" className="max-h-[50vh] overflow-y-auto space-y-4 py-4">
            <div className="space-y-3 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Proof of Concept Status</h3>
                <p className="text-muted-foreground">
                  This Semper Admin Portal is a proof of concept and experimental system. It is not an official product of the United States Marine Corps, the Department of Defense, or any other U.S. government agency. This system is provided as-is for reference, training, and educational purposes only.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">No Official Endorsement</h3>
                <p className="text-muted-foreground">
                  Nothing on this site represents official USMC or DoD policy, guidance, or direction. This portal is an unofficial, private reference tool created by a subject-matter specialist. It is not endorsed by, affiliated with, or authorized by the Marine Corps, the Department of Defense, or any official command.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Verification Is Your Responsibility</h3>
                <p className="text-muted-foreground">
                  All policy summaries, procedures, and guidance on this site are drawn from official sources and are cited in full. However, you are solely responsible for verifying the accuracy, completeness, and current applicability of any information before relying on it for decisions, submissions, or actions.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">No Liability</h3>
                <p className="text-muted-foreground">
                  You access and use this site at your own risk. The author, the USMC, the DoD, and the U.S. government assume no liability for any loss or damage arising from reliance on information from this site.
                </p>
              </div>

              <p className="text-xs text-muted-foreground italic">
                For the complete disclaimer, visit the <a href="/legal/disclaimer" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">full disclaimer page</a>.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="terms" className="max-h-[50vh] overflow-y-auto space-y-4 py-4">
            <div className="space-y-3 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Acceptable Use</h3>
                <p className="text-muted-foreground">
                  You may access and use this site for lawful purposes only. Acceptable uses include reference, training, educational use, coaching, and sharing with fellow service members. Unacceptable uses include republishing without attribution, commercial use, or misrepresenting this as official guidance.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Your Responsibility to Verify</h3>
                <p className="text-muted-foreground">
                  Before taking action based on information from this site, you must confirm it against the cited official source document, check that the source is current, and consult your chain of command or S-1 if unsure.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Content License</h3>
                <p className="text-muted-foreground">
                  Content is provided under a non-exclusive, non-transferable, revocable license for your personal, non-commercial, educational use. You may read, reference, and share content with attribution. You may not republish verbatim, sell access, or modify and present as your own.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">No Warranty</h3>
                <p className="text-muted-foreground">
                  This site is provided as-is without warranty of any kind. The author does not warrant accuracy, completeness, availability, or that defects will be corrected.
                </p>
              </div>

              <p className="text-xs text-muted-foreground italic">
                For the complete terms, visit the <a href="/legal/terms" className="underline hover:text-foreground" target="_blank" rel="noopener noreferrer">full terms page</a>.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleDecline}>
            I Decline
          </Button>
          <Button onClick={handleAgree} className="bg-[var(--color-usmc-scarlet)] hover:bg-[var(--color-usmc-scarlet)]/90">
            I Agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
