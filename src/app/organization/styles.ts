"use client";

import type { SxProps, Theme } from "@mui/material/styles";
import { useThemeColors } from "~/theme/useThemeColors";

export function useStyles() {
  const c = useThemeColors();

  const styles = {
    page: {
      minHeight: "calc(100vh - 56px)",
      backgroundColor: c.base,
      display: "flex",
      flexDirection: "column",
    } satisfies SxProps<Theme>,

    pageHeader: {
      px: { xs: 3, md: 6 },
      pt: 5,
      pb: 4,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 3,
      borderBottom: `1px solid ${c.surface0}`,
      flexWrap: "wrap" as const,
    } satisfies SxProps<Theme>,

    pageHeaderLeft: {
      display: "flex",
      flexDirection: "column",
      gap: 0.5,
    } satisfies SxProps<Theme>,

    pageEyebrow: {
      fontSize: "0.7rem",
      fontWeight: 600,
      letterSpacing: "0.14em",
      textTransform: "uppercase" as const,
      color: c.overlay0,
    } satisfies SxProps<Theme>,

    pageTitle: {
      fontSize: "1.6rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      color: c.text,
      lineHeight: 1.15,
    } satisfies SxProps<Theme>,

    toolbar: {
      px: { xs: 3, md: 6 },
      py: 2.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      borderBottom: `1px solid ${c.surface0}`,
      flexWrap: "wrap" as const,
    } satisfies SxProps<Theme>,

    searchBox: {
      width: { xs: "100%", sm: 260 },
    } satisfies SxProps<Theme>,

    content: {
      px: { xs: 3, md: 6 },
      py: 4,
      flex: 1,
    } satisfies SxProps<Theme>,

    list: {
      border: `1px solid ${c.surface0}`,
      backgroundColor: c.mantle,
      overflow: "hidden",
    } satisfies SxProps<Theme>,

    card: {
      px: 3,
      py: 1.5,
      display: "flex",
      alignItems: "center",
      gap: 2.5,
      cursor: "pointer",
      borderBottom: `1px solid ${c.surface0}`,
      transition: "background-color 0.12s ease",
      "&:last-child": { borderBottom: "none" },
      "&:hover": {
        backgroundColor: c.surface0,
      },
    } satisfies SxProps<Theme>,

    cardInitial: {
      width: 30,
      height: 30,
      flexShrink: 0,
      backgroundColor: c.surface0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.82rem",
      fontWeight: 700,
      color: c.blue,
      letterSpacing: "-0.01em",
      borderRadius: "4px",
    } satisfies SxProps<Theme>,

    cardMain: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      alignItems: "center",
      gap: 2,
    } satisfies SxProps<Theme>,

    cardName: {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: c.text,
      whiteSpace: "nowrap" as const,
      overflow: "hidden",
      textOverflow: "ellipsis",
      minWidth: 0,
      flex: 1,
    } satisfies SxProps<Theme>,

    cardRight: {
      display: "flex",
      alignItems: "center",
      gap: 3,
      flexShrink: 0,
    } satisfies SxProps<Theme>,

    metaStat: {
      display: "flex",
      alignItems: "center",
      gap: 0.6,
      fontSize: "0.75rem",
      color: c.overlay1,
      whiteSpace: "nowrap" as const,
    } satisfies SxProps<Theme>,

    metaDate: {
      fontSize: "0.72rem",
      color: c.overlay0,
      minWidth: 64,
      textAlign: "right" as const,
    } satisfies SxProps<Theme>,

    sentinel: {
      height: 48,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mt: 2,
    } satisfies SxProps<Theme>,

    emptyState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 14,
      gap: 1.5,
      textAlign: "center",
    } satisfies SxProps<Theme>,

    emptyIcon: {
      color: c.surface2,
      fontSize: "2.5rem",
      mb: 0.5,
    } satisfies SxProps<Theme>,

    emptyTitle: {
      fontSize: "0.95rem",
      fontWeight: 600,
      color: c.subtext1,
    } satisfies SxProps<Theme>,

    emptyDesc: {
      fontSize: "0.82rem",
      color: c.overlay0,
    } satisfies SxProps<Theme>,

    skeletonList: {
      border: `1px solid ${c.surface0}`,
      overflow: "hidden",
    } satisfies SxProps<Theme>,

    skeletonRow: {
      height: 54,
      backgroundColor: c.surface0,
      borderBottom: `1px solid ${c.surface0}`,
      "&:last-child": { borderBottom: "none" },
    } satisfies SxProps<Theme>,
  };

  const roleBadge: Record<string, { bg: string; color: string; border: string }> = {
    OWNER: { bg: `${c.mauve}14`, color: c.mauve, border: `${c.mauve}40` },
    MEMBER: { bg: `${c.blue}14`, color: c.blue, border: `${c.blue}40` },
  };

  return { styles, roleBadge, c };
}
