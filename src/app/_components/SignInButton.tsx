"use client";

import { signIn } from "next-auth/react";
import { Button } from "~/app/_components/widgets";

export function SignInButton() {
  return (
    <Button
      intent="primary"
      size="large"
      onClick={() => signIn("discord", { callbackUrl: "/organization/create" })}
      sx={{ px: 4, py: 1.25, fontSize: "1rem" }}
    >
      Get Started
    </Button>
  );
}
