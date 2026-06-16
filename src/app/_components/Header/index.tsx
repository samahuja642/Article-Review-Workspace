import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
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
      <Box
        component="span"
        sx={{ fontSize: "0.9rem", fontWeight: 700, color: frappe.blue, letterSpacing: "-0.01em" }}
      >
        ARW
      </Box>

      {user && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={user.image ?? undefined}
            alt={user.name ?? "User"}
            sx={{ width: 28, height: 28, fontSize: "0.75rem" }}
          />
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
