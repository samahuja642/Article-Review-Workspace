import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PlaylistAddCheckOutlinedIcon from "@mui/icons-material/PlaylistAddCheckOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { auth } from "~/server/auth";
import { SignInButton } from "./_components/SignInButton";
import { styles, statusColors } from "./styles";

const features = [
  {
    icon: <LayersOutlinedIcon fontSize="small" />,
    title: "Project-based organization",
    desc: "Scope article sets into discrete projects. Each team works in its own context.",
  },
  {
    icon: <PlaylistAddCheckOutlinedIcon fontSize="small" />,
    title: "Structured review pipeline",
    desc: "Every article moves through a defined status — nothing slips through untracked.",
  },
  {
    icon: <GroupOutlinedIcon fontSize="small" />,
    title: "Role-aware collaboration",
    desc: "Owners and members with clear access boundaries across organizations and projects.",
  },
];

const statuses = ["Pending", "In Review", "Reviewed", "Excluded"];

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/organization/create");
  }

  return (
    <Box sx={styles.root}>
      <Box component="nav" sx={styles.nav}>
        <Box sx={styles.navLogo}>Article Review Workspace</Box>
        <Box sx={styles.navMeta}>For research teams</Box>
      </Box>

      <Box sx={styles.main}>
        <Box sx={styles.left}>
          <Box sx={styles.label}>Systematic literature review</Box>

          <Box component="h1" sx={styles.heading}>
            Structure your
            <Box component="span" sx={styles.headingAccent}>literature review.</Box>
          </Box>

          <Box component="p" sx={styles.description}>
            A workspace for research teams to organize, assign, and track the
            review of scientific articles — from first pass to final decision.
          </Box>

          <Box sx={styles.cta}>
            <SignInButton />
            <Box sx={styles.ctaHint}>Continue with Discord</Box>
          </Box>
        </Box>

        <Box sx={styles.right}>
          <Box sx={styles.rightLabel}>Features</Box>

          {features.map((f) => (
            <Box key={f.title} sx={styles.featureRow}>
              <Box sx={styles.featureIconWrap}>{f.icon}</Box>
              <Box>
                <Box sx={styles.featureTitle}>{f.title}</Box>
                <Box sx={styles.featureDesc}>{f.desc}</Box>
              </Box>
            </Box>
          ))}

          <Box sx={{ mt: 1 }}>
            <Box sx={styles.rightLabel}>Review pipeline</Box>
            <Box sx={styles.workflowRow}>
              {statuses.map((s, i) => (
                <Box key={s} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      px: 1.25,
                      py: 0.35,
                      borderRadius: "4px",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.03em",
                      backgroundColor: statusColors[s]!.bg,
                      color: statusColors[s]!.color,
                      border: `1px solid ${statusColors[s]!.border}`,
                    }}
                  >
                    {s}
                  </Box>
                  {i < statuses.length - 1 && (
                    <ArrowForwardIcon sx={{ fontSize: "0.75rem", color: "#737994" }} />
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box component="footer" sx={styles.footer}>
        <Box sx={styles.footerText}>Article Review Workspace</Box>
        <Box sx={styles.footerText}>Research-grade. Team-ready.</Box>
      </Box>
    </Box>
  );
}
