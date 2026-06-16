import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Link from "next/link";
import { auth } from "~/server/auth";
import { SignOutButton } from "./SignOutButton";
import { frappe } from "~/theme/colors";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <Box
      component="header"
      sx={{
        height: 56,
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: frappe.crust,
        borderBottom: `1px solid ${frappe.surface0}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
        <Box
          component="span"
          sx={{ fontSize: "0.9rem", fontWeight: 700, color: frappe.blue, letterSpacing: "-0.01em" }}
        >
          ARW
        </Box>
        {user && (
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
                  color: frappe.overlay1,
                  textDecoration: "none",
                  "&:hover": { color: frappe.text },
                }}
              >
                {label}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {user && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            alt={user.name ?? "User"}
            sx={{ width: 28, height: 28, fontSize: "0.75rem", backgroundColor: frappe.surface1, color: frappe.text }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box
            component="span"
            sx={{ fontSize: "0.85rem", color: frappe.subtext1, display: { xs: "none", sm: "block" } }}
          >
            {user.name}
          </Box>
          <SignOutButton />
        </Box>
      )}
    </Box>
  );
}
