import type { SxProps, Theme } from "@mui/material/styles";
import { frappe } from "~/theme/colors";

export const styles = {
  page: {
    minHeight: "calc(100vh - 56px)",
    backgroundColor: frappe.base,
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
    borderBottom: `1px solid ${frappe.surface0}`,
    flexWrap: "wrap" as const,
  } satisfies SxProps<Theme>,

  breadcrumbs: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
    fontSize: "0.75rem",
    color: frappe.overlay1,
    mb: 1,
  } satisfies SxProps<Theme>,

  breadcrumbLink: {
    cursor: "pointer",
    textDecoration: "none",
    color: frappe.overlay1,
    "&:hover": { color: frappe.subtext1 },
  } satisfies SxProps<Theme>,

  breadcrumbSep: {
    color: frappe.surface2,
  } satisfies SxProps<Theme>,

  pageEyebrow: {
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: frappe.overlay0,
  } satisfies SxProps<Theme>,

  pageTitle: {
    fontSize: "1.6rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: frappe.text,
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
    color: frappe.overlay1,
  } satisfies SxProps<Theme>,

  toolbar: {
    px: { xs: 3, md: 6 },
    py: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    borderBottom: `1px solid ${frappe.surface0}`,
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
    border: `1px solid ${frappe.surface0}`,
    backgroundColor: frappe.mantle,
    overflow: "hidden",
  } satisfies SxProps<Theme>,

  row: {
    px: 3,
    py: 2,
    display: "flex",
    alignItems: "center",
    gap: 2.5,
    borderBottom: `1px solid ${frappe.surface0}`,
    "&:last-child": { borderBottom: "none" },
  } satisfies SxProps<Theme>,

  rowMain: {
    flex: 1,
    minWidth: 0,
  } satisfies SxProps<Theme>,

  rowTitle: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: frappe.text,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  } satisfies SxProps<Theme>,

  rowMeta: {
    fontSize: "0.73rem",
    color: frappe.overlay0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    mt: 0.25,
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

  emptyIcon: { color: frappe.surface1, fontSize: "2.5rem", mb: 0.5 } satisfies SxProps<Theme>,
  emptyTitle: { fontSize: "0.95rem", fontWeight: 600, color: frappe.subtext1 } satisfies SxProps<Theme>,
  emptyDesc: { fontSize: "0.82rem", color: frappe.overlay0 } satisfies SxProps<Theme>,

  skeletonList: {
    border: `1px solid ${frappe.surface0}`,
    overflow: "hidden",
  } satisfies SxProps<Theme>,

  skeletonRow: {
    height: 62,
    backgroundColor: frappe.mantle,
    borderBottom: `1px solid ${frappe.surface0}`,
    "&:last-child": { borderBottom: "none" },
  } satisfies SxProps<Theme>,
};

export const roleBadge: Record<string, { bg: string; color: string; border: string }> = {
  OWNER: { bg: `${frappe.mauve}18`, color: frappe.mauve, border: `${frappe.mauve}33` },
  MEMBER: { bg: `${frappe.blue}18`, color: frappe.blue, border: `${frappe.blue}33` },
};

export const statusBadge: Record<string, { bg: string; color: string; border: string; label: string }> = {
  PENDING: { bg: `${frappe.yellow}18`, color: frappe.yellow, border: `${frappe.yellow}33`, label: "Pending" },
  IN_REVIEW: { bg: `${frappe.blue}18`, color: frappe.blue, border: `${frappe.blue}33`, label: "In Review" },
  REVIEWED: { bg: `${frappe.green}18`, color: frappe.green, border: `${frappe.green}33`, label: "Reviewed" },
  EXCLUDED: { bg: `${frappe.red}18`, color: frappe.red, border: `${frappe.red}33`, label: "Excluded" },
};
