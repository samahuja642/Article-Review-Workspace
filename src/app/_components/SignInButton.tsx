"use client";

import { signIn } from "next-auth/react";
import Box from "@mui/material/Box";
import { Button } from "~/app/_components/widgets";

export function SignInButton() {
  return (
    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
      <Button
        intent="primary"
        size="large"
        onClick={() => signIn("google", { callbackUrl: "/organization" })}
        sx={{ px: 3.5, py: 1.25, fontSize: "0.95rem" }}
      >
        Continue with Google
      </Button>
      <Button
        intent="ghost"
        size="large"
        onClick={() => signIn("discord", { callbackUrl: "/organization" })}
        sx={{ px: 3.5, py: 1.25, fontSize: "0.95rem" }}
      >
        Continue with Discord
      </Button>
    </Box>
  );
}
