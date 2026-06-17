"use client";

import type { SxProps, Theme } from "@mui/material/styles";
import { useThemeColors } from "~/theme/useThemeColors";

export function useStyles() {
  const c = useThemeColors();

  const styles = {
    root: {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: c.base,
    } satisfies SxProps<Theme>,

    nav: {
      px: { xs: 3, md: 6 },
      py: 2.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${c.surface0}`,
    } satisfies SxProps<Theme>,

    navLogo: {
      fontSize: "0.85rem",
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase" as const,
      color: c.text,
    } satisfies SxProps<Theme>,

    navMeta: {
      fontSize: "0.75rem",
      color: c.overlay0,
      letterSpacing: "0.04em",
    } satisfies SxProps<Theme>,

    main: {
      flex: 1,
      display: "grid",
      gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
      maxWidth: 1200,
      mx: "auto",
      width: "100%",
      px: { xs: 3, md: 6 },
      py: { xs: 8, md: 0 },
      alignItems: "center",
      gap: { xs: 8, lg: 12 },
    } satisfies SxProps<Theme>,

    left: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      py: { lg: 10 },
    } satisfies SxProps<Theme>,

    label: {
      fontSize: "0.7rem",
      fontWeight: 600,
      letterSpacing: "0.14em",
      textTransform: "uppercase" as const,
      color: c.overlay1,
    } satisfies SxProps<Theme>,

    heading: {
      fontSize: { xs: "2.8rem", md: "3.8rem" },
      fontWeight: 700,
      letterSpacing: "-0.03em",
      lineHeight: 1.08,
      color: c.text,
      m: 0,
    } satisfies SxProps<Theme>,

    headingAccent: {
      color: c.blue,
      display: "block",
    } satisfies SxProps<Theme>,

    description: {
      fontSize: "1rem",
      color: c.subtext1,
      lineHeight: 1.75,
      maxWidth: 440,
      m: 0,
    } satisfies SxProps<Theme>,

    cta: {
      display: "flex",
      alignItems: "center",
      gap: 2,
      flexWrap: "wrap" as const,
    } satisfies SxProps<Theme>,

    ctaHint: {
      fontSize: "0.78rem",
      color: c.overlay0,
    } satisfies SxProps<Theme>,

    right: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      py: { lg: 10 },
    } satisfies SxProps<Theme>,

    rightLabel: {
      fontSize: "0.7rem",
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase" as const,
      color: c.overlay0,
      mb: 1,
    } satisfies SxProps<Theme>,

    featureRow: {
      display: "flex",
      alignItems: "flex-start",
      gap: 2,
      p: 2.5,
      borderRadius: "6px",
      border: `1px solid ${c.surface0}`,
      backgroundColor: c.mantle,
      transition: "border-color 0.15s ease",
      "&:hover": {
        borderColor: c.surface1,
      },
    } satisfies SxProps<Theme>,

    featureIconWrap: {
      width: 36,
      height: 36,
      borderRadius: "6px",
      backgroundColor: c.surface0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      color: c.blue,
    } satisfies SxProps<Theme>,

    featureTitle: {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: c.text,
      mb: 0.4,
    } satisfies SxProps<Theme>,

    featureDesc: {
      fontSize: "0.8rem",
      color: c.overlay1,
      lineHeight: 1.6,
    } satisfies SxProps<Theme>,

    workflowRow: {
      display: "flex",
      alignItems: "center",
      gap: 1,
      flexWrap: "wrap" as const,
      mt: 1,
    } satisfies SxProps<Theme>,

    workflowArrow: {
      color: c.overlay0,
      fontSize: "0.75rem",
    } satisfies SxProps<Theme>,

    footer: {
      px: { xs: 3, md: 6 },
      py: 3,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderTop: `1px solid ${c.surface0}`,
    } satisfies SxProps<Theme>,

    footerText: {
      fontSize: "0.75rem",
      color: c.overlay0,
    } satisfies SxProps<Theme>,
  };

  const statusColors: Record<string, { bg: string; color: string; border: string }> = {
    Pending:    { bg: `${c.peach}14`,  color: c.peach,  border: `${c.peach}44`  },
    "In Review": { bg: `${c.blue}14`, color: c.blue,   border: `${c.blue}44`   },
    Reviewed:   { bg: `${c.green}14`,  color: c.green,  border: `${c.green}44`  },
    Excluded:   { bg: `${c.red}14`,    color: c.red,    border: `${c.red}44`    },
  };

  return { styles, statusColors, c };
}
