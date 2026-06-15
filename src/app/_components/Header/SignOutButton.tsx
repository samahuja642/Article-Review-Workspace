"use client";

import { signOut } from "next-auth/react";
import { Button } from "~/app/_components/widgets";

export function SignOutButton() {
  return (
    <Button
      intent="ghost"
      size="small"
      onClick={() => signOut({ callbackUrl: "/" })}
      sx={{ fontSize: "0.8rem" }}
    >
      Sign out
    </Button>
  );
}
