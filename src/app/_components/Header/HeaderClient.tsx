"use client";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";
import { useThemeColors } from "~/theme/useThemeColors";

interface HeaderClientProps {
  userName: string | null;
  userImage: string | null;
  isLoggedIn: boolean;
}

export function HeaderClient({ userName, userImage, isLoggedIn }: HeaderClientProps) {
  const c = useThemeColors();

  return (
    <Box
      component="header"
      sx={{
        height: 56,
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: c.mantle,
        borderBottom: `1px solid ${c.surface0}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <Box
          component="span"
          sx={{ fontSize: "0.9rem", fontWeight: 700, color: c.blue, letterSpacing: "-0.01em" }}
        >
          ARW
        </Box>
        {isLoggedIn && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
            {[
              { href: "/organization", label: "Organizations" },
              { href: "/projects", label: "Projects" },
            ].map(({ href, label }) => (
              <Box
                key={href}
                component={Link}
                href={href}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  fontSize: "0.82rem",
                  color: c.overlay1,
                  textDecoration: "none",
                  "&:hover": { color: c.text },
                  transition: "color 0.1s ease",
                }}
              >
                {label}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {isLoggedIn && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mr: 5.5 }}>
          <Avatar
            alt={userName ?? "User"}
            src={userImage ?? undefined}
            sx={{ width: 26, height: 26, fontSize: "0.72rem", backgroundColor: c.surface1, color: c.text }}
          >
            {userName?.charAt(0).toUpperCase()}
          </Avatar>
          <Box
            component="span"
            sx={{ fontSize: "0.82rem", color: c.subtext1, display: { xs: "none", sm: "block" } }}
          >
            {userName}
          </Box>
          <SignOutButton />
        </Box>
      )}
    </Box>
  );
}
