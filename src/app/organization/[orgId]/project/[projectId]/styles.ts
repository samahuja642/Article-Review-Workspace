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

    breadcrumbs: {
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      fontSize: "0.75rem",
      color: c.overlay1,
      mb: 1,
    } satisfies SxProps<Theme>,

    breadcrumbLink: {
      cursor: "pointer",
      textDecoration: "none",
      color: c.overlay1,
      "&:hover": { color: c.subtext1 },
    } satisfies SxProps<Theme>,

    breadcrumbSep: {
      color: c.surface2,
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

    metaRow: {
      display: "flex",
      alignItems: "center",
      gap: 2,
      mt: 0.75,
      flexWrap: "wrap" as const,
    } satisfies SxProps<Theme>,

    metaItem: {
      display: "flex",
      alignItems: "center",
      gap: 0.5,
      fontSize: "0.775rem",
      color: c.overlay1,
    } satisfies SxProps<Theme>,

    toolbar: {
      px: { xs: 3, md: 6 },
      py: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      borderBottom: `1px solid ${c.surface0}`,
      flexWrap: "wrap" as const,
    } satisfies SxProps<Theme>,

    toolbarLeft: {
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      flexWrap: "wrap" as const,
    } satisfies SxProps<Theme>,

    searchBox: {
      width: { xs: "100%", sm: 240 },
    } satisfies SxProps<Theme>,

    filterTabs: {
      display: "flex",
      alignItems: "center",
      gap: 0.5,
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

    row: {
      px: 3,
      py: 1.25,
      display: "flex",
      alignItems: "center",
      gap: 2.5,
      borderBottom: `1px solid ${c.surface0}`,
      "&:last-child": { borderBottom: "none" },
      transition: "background-color 0.1s ease",
      "&:hover": { backgroundColor: c.surface0 },
    } satisfies SxProps<Theme>,

    rowMain: {
      flex: 1,
      minWidth: 0,
    } satisfies SxProps<Theme>,

    rowTitle: {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: c.text,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap" as const,
    } satisfies SxProps<Theme>,

    rowMeta: {
      fontSize: "0.73rem",
      color: c.overlay0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap" as const,
      mt: 0.2,
    } satisfies SxProps<Theme>,

    rowRight: {
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      flexShrink: 0,
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

    emptyIcon: { color: c.surface2, fontSize: "2.5rem", mb: 0.5 } satisfies SxProps<Theme>,
    emptyTitle: { fontSize: "0.95rem", fontWeight: 600, color: c.subtext1 } satisfies SxProps<Theme>,
    emptyDesc: { fontSize: "0.82rem", color: c.overlay0 } satisfies SxProps<Theme>,

    skeletonList: {
      border: `1px solid ${c.surface0}`,
      overflow: "hidden",
    } satisfies SxProps<Theme>,

    skeletonRow: {
      height: 58,
      backgroundColor: c.surface0,
      borderBottom: `1px solid ${c.surface0}`,
      "&:last-child": { borderBottom: "none" },
    } satisfies SxProps<Theme>,
  };

  const roleBadge: Record<string, { bg: string; color: string; border: string }> = {
    OWNER: { bg: `${c.mauve}14`, color: c.mauve, border: `${c.mauve}40` },
    MEMBER: { bg: `${c.blue}14`, color: c.blue, border: `${c.blue}40` },
  };

  const statusBadge: Record<string, { bg: string; color: string; border: string; label: string }> = {
    PENDING: { bg: `${c.yellow}14`, color: c.yellow, border: `${c.yellow}40`, label: "Pending" },
    IN_REVIEW: { bg: `${c.blue}14`, color: c.blue, border: `${c.blue}40`, label: "In Review" },
    REVIEWED: { bg: `${c.green}14`, color: c.green, border: `${c.green}40`, label: "Reviewed" },
    EXCLUDED: { bg: `${c.red}14`, color: c.red, border: `${c.red}40`, label: "Excluded" },
  };

  return { styles, roleBadge, statusBadge, c };
}
