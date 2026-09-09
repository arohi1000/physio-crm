"use client";

import { useState } from "react";

import { Button } from "@/components/Button";
import { useSession } from "@/lib/auth/useSession";

export function SignOutButton({ className }: { className?: string }) {
  const { signOut } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <Button
      variant="quiet"
      disabled={isSigningOut}
      className={className}
      onClick={() => {
        setIsSigningOut(true);
        void signOut();
      }}
    >
      {isSigningOut ? "Signing out…" : "Sign out"}
    </Button>
  );
}
